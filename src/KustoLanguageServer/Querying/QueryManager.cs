using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Toolkit;
using System.Collections.Immutable;

namespace Kusto.Lsp;

public class QueryManager : IQueryManager
{
    private readonly IConnectionManager _connectionManager;
    private readonly IDocumentManager _documentManager;
    private readonly ILogger? _logger;

    public QueryManager(
        IConnectionManager connectionManager,
        IDocumentManager documentManager,
        ILogger? logger = null)
    {
        _connectionManager = connectionManager;
        _documentManager = documentManager;
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

        var connection = (context.Cluster != null)
            ? _connectionManager.GetConnection(context.Cluster, context.Database)
            : GetConnection(document);

        if (connection != null)
        {
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

    private Diagnostic CreateDiagnostic(EditString query, Exception exception)
    {
        var start = query.GetOriginalPosition(0);
        var end = query.GetOriginalPosition(query.Length);
        return new Diagnostic("KLS100", exception.Message).WithLocation(start, end - start);
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

        try
        {
            // handle stored query results
            if (context.StoredQueryResultName != null)
            {
                // execute command to execute query and store results on server
                var command = query.ReplaceAt(0, query.Length, CslCommandGenerator.GenerateStoredQueryResultSetOrReplaceCommand(context.StoredQueryResultName, query, previewCount: 0));
                var result = await ExecuteQueryAsync(connection, context with { Query = command, StoredQueryResultName = null }, cancellationToken).ConfigureAwait(false);
                if (result == null || result.Error != null)
                    return result;

                // change query to retrieve the stored result
                query = query.ReplaceAt(0, query.Length, $"stored_query_result({KustoFacts.GetStringLiteral(context.StoredQueryResultName)})");
            }

            var results = await connection.ExecuteAsync(query, context.Options, context.Parameters, cancellationToken).ConfigureAwait(false);
            return new RunResult
            {
                Query = query,
                Data = results.Data,
                ChartOptions = results.ChartOptions
            };
        }
        catch (Exception e)
        {
            return new RunResult { Query = query, Error = CreateDiagnostic(query, e) };
        }
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
            var newContext = ApplyConnectOrDatabaseDirective(directive, context);
            if (newContext.Cluster != null)
            {
                return new RunResult
                {
                    Query = context.Query,
                    Cluster = newContext.Cluster,
                    Database = newContext.Database
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
        if (TryGetDirectiveClusterAndDatabase(directive, out var clusterName, out var databaseName)
            && clusterName != null)
        {
            // change default cluster and database and continue
            var conn = _connectionManager.GetConnection(clusterName, databaseName);
            return context with { Query = directive.AfterDirectiveText, Cluster = clusterName, Database = databaseName };
        }
        return context;
    }

    private ExecutionContext ApplyClientRequestPropertyDirective(ClientDirective directive, ExecutionContext context)
    {
        var properties = context.Options;
        var newProperties = SetKeyValuePairs(directive, properties);
        return context with { Options = newProperties };
    }

    private ExecutionContext ApplyQueryParameterDirective(ClientDirective directive, ExecutionContext context)
    {
        var newParameters = SetKeyValuePairs(directive, context.Parameters);
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

    private static bool TryGetDirectiveClusterAndDatabase(
        ClientDirective directive, out string? clusterName, out string? databaseName)
    {
        clusterName = null;
        databaseName = null;

        if (directive.Name == "database")
        {
            if (directive.Arguments.Count > 1)
            {
                clusterName = GetDirectiveArgumentStringValue(directive.Arguments[0]);
                databaseName = GetDirectiveArgumentStringValue(directive.Arguments[1]);
                return true;
            }
            else if (directive.Arguments.Count == 1)
            {
                var arg = GetDirectiveArgumentStringValue(directive.Arguments[0]);
                KustoFacts.GetHostAndPath(arg, out var hostname, out var path);
                if (hostname != null && path != null)
                {
                    clusterName = hostname;
                    databaseName = path;
                    return true;
                }
                else if (hostname != null)
                {
                    clusterName = null;
                    databaseName = hostname;
                    return true;
                }
            }
        }
        else if (directive.Name == "connect" && directive.Arguments.Count > 0)
        {
            var arg = directive.Arguments[0];
            if (arg.Text.StartsWith("cluster"))
            {
                var cluster = GetStringValueAfterPrefix(arg.Text, "cluster(", 0, out var end);
                if (cluster != null)
                {
                    KustoFacts.GetHostAndPath(cluster, out clusterName, out var path);
                    databaseName = GetStringValueAfterPrefix(arg.Text, "database(", end, out _)
                        ?? path;
                    return clusterName != null;
                }
            }
            else if (!arg.Text.StartsWith("@"))
            {
                var connection = GetDirectiveArgumentStringValue(arg);
                var builder = new KustoConnectionStringBuilder(connection);
                clusterName = builder.Hostname;
                databaseName = builder.InitialCatalog;
                return true;
            }
        }

        return false;
    }

    private static string? GetStringValueAfterPrefix(string text, string prefix, int start, out int end)
    {
        var index = text.IndexOf(prefix, start);
        if (index >= 0)
        {
            var wsLen = Kusto.Language.Parsing.TokenParser.ScanWhitespace(text, index + prefix.Length);
            var stringStart = index + prefix.Length + wsLen;
            if (Kusto.Language.Parsing.TokenParser.ScanStringLiteral(text, stringStart) is int len
                && len > 0)
            {
                var stringLiteral = text.Substring(stringStart, len);
                end = index + len;
                return KustoFacts.GetStringLiteralValue(stringLiteral);
            }
        }
        end = start;
        return null;
    }

    private static string GetDirectiveArgumentStringValue(ClientDirectiveArgument argument)
    {
        return argument.Value as string ?? "";
    }

    private static ImmutableDictionary<string, string> SetKeyValuePairs(ClientDirective directive, ImmutableDictionary<string, string> map)
    {
        foreach (var arg in directive.Arguments)
        {
            if (arg.Name != null)
            {
                if (arg.Value != null)
                {
                    map = map.SetItem(arg.Name, arg.Value.ToString()!);
                }
                else
                {
                    map = map.Remove(arg.Name);
                }
            }
        }

        return map;
    }
 
    private IConnection? GetConnection(IDocument document)
    {
        var connectionInfo = _documentManager.GetConnection(document.Id);
        if (connectionInfo.Cluster != null)
        {
            return _connectionManager.GetConnection(connectionInfo.Cluster, connectionInfo.Database);
        }
        return null;
    }
}
