using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Kusto.Language.Editor;
using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

public class QueryManager : IQueryManager
{
    private readonly IConnectionManager _connectionManager;
    private readonly IDocumentManager _documentManager;
    private readonly IOptionsManager _optionsManager;
    private readonly ILogger? _logger;

    public QueryManager(
        IConnectionManager connectionManager,
        IDocumentManager documentManager,
        IOptionsManager optionsManager,
        ILogger? logger = null)
    {
        _connectionManager = connectionManager;
        _documentManager = documentManager;
        _optionsManager = optionsManager; 
        _logger = logger;
    }

    public Task<RunResult?> RunQueryAsync(
        IDocument document, 
        TextRange range, 
        ImmutableDictionary<string, string> queryOptions,
        ImmutableDictionary<string, string> queryParameters,
        CancellationToken cancellationToken)
    {
        // some servers will fails if query starts with a comment.
        if (document.GetSectionRange(range.Start) is not { } sectionRange)
            return Task.FromResult<RunResult?>(null);

        // start with query as an edited down section of the whole document
        var query = new EditString(document.Text).Substring(sectionRange.Start, sectionRange.Length);

        var context = new ExecutionContext
        {
            Query = query,
            Options = queryOptions,
            Parameters = queryParameters
        };

        // handle any directives
        if (IsDirective(context.Query))
        {
            if (IsDirectiveOnly(context.Query))
            {
                // a single directive by itself has a special result
                return Task.FromResult(ExecuteDirective(context));
            }

            // otherwise apply one or more directives to the context
            // and use that context for query execution
            do
            {
                context = ApplyDirective(context);
            }
            while (IsDirective(context.Query));
        }

        if (TryGetConnection(document, out var connection))
        {
            // did a directive have an alternate cluster or database?
            if (context.Cluster != null)
                connection = connection.WithCluster(context.Cluster);
            if (context.Database != null)
                connection = connection.WithDatabase(context.Database);

            return ExecuteQueryAsync(connection, context, cancellationToken);
        }
        else
        {
            return Task.FromResult<RunResult?>(
                new RunResult
                {
                    Query = query,
                    Error = CreateDiagnostic(query, "Invalid Connection")
                });
        }
    }

    private static bool IsDirective(string text)
    {
        var firstToken = Kusto.Language.Parsing.TokenParser.ParseToken(text);
        return firstToken.Kind == Kusto.Language.Syntax.SyntaxKind.DirectiveToken;
    }

    private static bool IsDirectiveOnly(string text)
    {
        return ClientDirective.TryParse(text, out ClientDirective directive)
            && string.IsNullOrWhiteSpace(directive.AfterDirectiveText);
    }

    private Diagnostic CreateDiagnostic(EditString query, string message)
    {
        var start = query.GetOriginalPosition(0);
        var end = query.GetOriginalPosition(query.Length);
        return new Diagnostic("KLS100", message).WithLocation(start, end - start);
    }

    private record ExecutionContext
    {
        /// <summary>
        /// The query to execute
        /// </summary>
        public required EditString Query { get; init; }

        /// <summary>
        /// The default cluster to use for this query
        /// </summary>
        public string? Cluster { get; init; }

        /// <summary>
        /// The default database to use for this query
        /// </summary>
        public string? Database { get; init; }

        /// <summary>
        /// The options for this query.
        /// </summary>
        public required ImmutableDictionary<string, string> Options { get; init; }

        /// <summary>
        /// The parameters for this query.
        /// </summary>
        public required ImmutableDictionary<string, string> Parameters { get; init; }

        /// <summary>
        ///  the name of the stored query result to store the result of this execution into.
        /// </summary>
        public string? StoredQueryResultName { get; init; }
    }

    private async Task<RunResult?> ExecuteQueryAsync(IConnection connection, ExecutionContext context, CancellationToken cancellationToken)
    {
        // some servers will if there is any comment or whitespace preceeding the first token
        var query = RemoveLeadingTrivia(context.Query);

        if (string.IsNullOrWhiteSpace(query))
        {
            return new RunResult
            {
                Query = query,
                Error = CreateDiagnostic(query, "No query")
            };
        }

        // handle stored query results
        if (context.StoredQueryResultName != null)
        {
            // execute command to execute query and store results on server
            var command = query.ReplaceAt(0, query.Length, CslCommandGenerator.GenerateStoredQueryResultSetOrReplaceCommand(context.StoredQueryResultName, query, previewCount: 0));
            var commandResult = await ExecuteQueryAsync(connection, context with { Query = command, StoredQueryResultName = null }, cancellationToken).ConfigureAwait(false);
            if (commandResult == null || commandResult.Error != null)
                return commandResult;

            // change query to retrieve the stored result
            query = query.ReplaceAt(0, query.Length, $"stored_query_result({KustoFacts.GetStringLiteral(context.StoredQueryResultName)})");
        }

        var executeResult = await connection.ExecuteAsync(query, context.Options, context.Parameters, cancellationToken).ConfigureAwait(false);
        return new RunResult
        {
            Query = query,
            ExecuteResult = executeResult,
            Error = executeResult.Diagnostics?.FirstOrDefault()
        };
    }

    private static EditString RemoveLeadingTrivia(EditString query)
    {
        var firstToken = Kusto.Language.Parsing.TokenParser.ParseToken(query);
        if (firstToken != null)
        {
            return query.Substring(firstToken.Trivia.Length);
        }
        else
        {
            return query;
        }
    }

    private RunResult? ExecuteDirective(ExecutionContext context)
    {
        if (ClientDirective.TryParse(context.Query, out var directive))
        {
            switch (directive.Name)
            {
                case "connect":
                case "database":
                    return ExecuteConnectOrDatabaseDirective(directive, context);
                case "crp":
                    return ExecuteClientRequestPropertyDirective(directive, context);
                case "qp":
                    return ExecuteQueryParameterDirective(directive, context);
                case "sqr":
                    // no-op
                    return null;
                case "welcome":
                case "upload":
                case "download":
                case "truesight":
                case "run":
                case "browse":
                case "automate":
                case "query":
                case "save":
                    return new RunResult
                    {
                        Query = context.Query,
                        Error = CreateDiagnostic(context.Query, $"Unhandled directive: {directive.Name}")
                    };
                default:
                    return new RunResult
                    {
                        Query = context.Query,
                        Error = CreateDiagnostic(context.Query, $"Unknown directive: {directive.Name}")
                    };
            }
        }
        else
        {
            return new RunResult
            {
                Query = context.Query,
                Error = CreateDiagnostic(context.Query, "Invalid Directive")
            };
        }

        RunResult? ExecuteConnectOrDatabaseDirective(ClientDirective directive, ExecutionContext context)
        {
            if (directive.TryGetConnectionInfo(out var connection, out var clusterName, out var databaseName))
            {
                return new RunResult
                {
                    Query = context.Query,
                    Connection = connection,
                    Cluster = KustoFacts.GetFullHostName(clusterName, _optionsManager.DefaultDomain),
                    Database = databaseName
                };
            }

            return null;
        }

        RunResult? ExecuteClientRequestPropertyDirective(ClientDirective directive, ExecutionContext context)
        {
            var newContext = ApplyClientRequestPropertyDirective(directive, context);
            if (newContext.Options != context.Options)
            {
                return new RunResult
                {
                    Query = context.Query,
                    QueryOptions = newContext.Options
                };
            }
            return null;
        }

        RunResult? ExecuteQueryParameterDirective(ClientDirective directive, ExecutionContext context)
        {
            var newContext = ApplyQueryParameterDirective(directive, context);
            if (newContext.Parameters != context.Parameters)
            {
                return new RunResult
                {
                    Query = context.Query,
                    QueryParameters = context.Parameters
                };
            }
            return null;
        }
    }

    private ExecutionContext ApplyDirective(ExecutionContext context)
    {
        if (ClientDirective.TryParse(context.Query, out var directive))
        {
            switch (directive.Name)
            {
                case "connect":
                case "database":
                    return ApplyConnectOrDatabaseDirective(directive, context);
                case "crp":
                    return ApplyClientRequestPropertyDirective(directive, context);
                case "qp":
                    return ApplyQueryParameterDirective(directive, context);
                case "sqr":
                    return ApplyStoreQueryResultDirective(directive, context);
                case "welcome":
                case "upload":
                case "download":
                case "truesight":
                case "run":
                case "browse":
                case "automate":
                case "query":
                case "save":
                default:
                    return context;
            }

        }

        return context;
    }

    private ExecutionContext ApplyConnectOrDatabaseDirective(ClientDirective directive, ExecutionContext context)
    {
        if (directive.TryGetConnectionInfo(out _, out var clusterName, out var databaseName)
            && clusterName != null
            && _connectionManager.TryGetConnection(clusterName, databaseName, out var conn))
        {
            // change default cluster and database and continue
            return context with { Query = directive.AfterDirectiveText, Cluster = clusterName, Database = databaseName };
        }
        return context;
    }

    private ExecutionContext ApplyClientRequestPropertyDirective(ClientDirective directive, ExecutionContext context)
    {
        var properties = context.Options;
        var newProperties = directive.GetArgumentPairs(properties);
        return context with { Options = newProperties };
    }

    private ExecutionContext ApplyQueryParameterDirective(ClientDirective directive, ExecutionContext context)
    {
        var newParameters = directive.GetArgumentPairs(context.Parameters);
        return context = context with { Query = directive.AfterDirectiveText, Parameters = newParameters };
    }

    private ExecutionContext ApplyStoreQueryResultDirective(ClientDirective directive, ExecutionContext context)
    {
        if (directive.Arguments.Count > 0)
        {
            var name = directive.Arguments[0].Text;
            return context with { Query = directive.AfterDirectiveText, StoredQueryResultName = name };
        }
        return context;
    }
 
    private bool TryGetConnection(IDocument document, [NotNullWhen(true)] out IConnection? connection)
    {
        var connectionInfo = _documentManager.GetConnection(document.Id);
        if (connectionInfo.Cluster != null
            && _connectionManager.TryGetConnection(connectionInfo.Cluster, connectionInfo.Database, out connection))
        {
            return true;
        }

        connection = null;
        return false;
    }
}
