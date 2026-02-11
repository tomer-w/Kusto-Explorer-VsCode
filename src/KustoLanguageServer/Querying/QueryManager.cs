using System.Collections.Immutable;
using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Kusto.Language.Editor;

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
        Document document, 
        TextRange range, 
        ImmutableDictionary<string, string> queryOptions,
        ImmutableDictionary<string, string> queryParameters,
        CancellationToken cancellationToken)
    {
        var connection = GetConnection(document);
        if (connection != null)
        {
            // some servers will fails if query starts with a comment.
            var query = document.GetQuery(range.Start, cancellationToken);
            if (string.IsNullOrWhiteSpace(query))
                return Task.FromResult<RunResult?>(new RunResult { Query = query, Error = CreateDiagnostic(query, "Query is empty") });

            var context = new QueryContext
            {
                Query = query,
                Connection = connection,
                Options = queryOptions,
                Parameters = queryParameters
            };

            return this.ExecuteQueryAsync(context, cancellationToken);
        }
        else
        {
            return Task.FromResult<RunResult?>(new RunResult { Error = new Diagnostic("KLS003", "Invalid Connection") });
        }
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

    private record QueryContext
    {
        /// <summary>
        /// The connection to use for this query.
        /// </summary>
        public required IConnection Connection { get; init; }


        public required EditString Query { get; init; }

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

    private Task<RunResult?> ExecuteQueryAsync(QueryContext context, CancellationToken cancellationToken)
    {
        if (IsDirective(context.Query))
        {
            return HandleDirective(context, cancellationToken);
        }
        else
        {
            return HandleQuery(context, cancellationToken);
        }
    }

    private async Task<RunResult?> HandleQuery(QueryContext context, CancellationToken cancellationToken)
    {
        // some servers will if there is any comment or whitespace preceeding the first token
        var query = RemoveLeadingTrivia(context.Query);

        try
        {
            // handle stored query results
            if (context.StoredQueryResultName != null)
            {
                // execute command that runs the query and stores the result using the name
                var command = query.ReplaceAt(0, query.Length, CslCommandGenerator.GenerateStoredQueryResultSetOrReplaceCommand(context.StoredQueryResultName, query, previewCount: 0));
                var result = await ExecuteQueryAsync(context with { Query = command, StoredQueryResultName = null }, cancellationToken).ConfigureAwait(false);
                if (result == null || result.Error != null)
                    return result;

                // change query to retrieve the stored result
                query = query.ReplaceAt(0, query.Length, $"stored_query_result({KustoFacts.GetStringLiteral(context.StoredQueryResultName)})");
            }

            var results = await context.Connection.ExecuteAsync(query, context.Options, context.Parameters, cancellationToken).ConfigureAwait(false);
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

    private static bool IsDirective(string query)
    {
        var firstToken = Kusto.Language.Parsing.TokenParser.ParseToken(query);
        return firstToken.Kind == Kusto.Language.Syntax.SyntaxKind.DirectiveToken;
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

    private Task<RunResult?> HandleDirective(QueryContext context, CancellationToken cancellationToken)
    {
        if (ClientDirective.TryParse(context.Query, out var directive))
        {
            switch (directive.Name)
            {
                case "connect":
                case "database":
                    return HandleConnectOrDatabaseDirective(directive, context, cancellationToken);
                case "crp":
                    return HandleClientRequestPropertyDirective(directive, context, cancellationToken);
                case "qp":
                    return HandleQueryParameterDirective(directive, context, cancellationToken);
                case "sqr":
                    return HandleStoreQueryResultDirective(directive, context, cancellationToken);
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
                    return Task.FromResult<RunResult?>(
                        new RunResult { Query = context.Query, Error = CreateDiagnostic(context.Query, $"Unhandled directive: {directive.Name}") }
                        );
            }
        }
        else
        {
            return Task.FromResult<RunResult?>(
                new RunResult { Query = context.Query, Error = CreateDiagnostic(context.Query, "Invalid Directive") }
                );
        }
    }

    private Task<RunResult?> HandleConnectOrDatabaseDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        if (TryGetDirectiveClusterAndDatabase(directive, out var clusterName, out var databaseName)
            && clusterName != null)
        {
            if (!string.IsNullOrEmpty(directive.AfterDirectiveText))
            {
                // change default cluster and database and continue
                var conn = _connectionManager.GetConnection(clusterName, databaseName);
                var newContext = context with { Query = directive.AfterDirectiveText, Connection = conn };
                return this.ExecuteQueryAsync(newContext, cancellationToken);
            }
            else
            {
                // result is request to change document's default cluster & database
                return Task.FromResult<RunResult?>(new RunResult { Query = directive.Text, Cluster = clusterName, Database = databaseName });
            }
        }
        return Task.FromResult<RunResult?>(null);
    }

    internal static bool TryGetDirectiveClusterAndDatabase(
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

    internal static string? GetStringValueAfterPrefix(string text, string prefix, int start, out int end)
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

    internal static string GetDirectiveArgumentStringValue(ClientDirectiveArgument argument)
    {
        return argument.Value as string ?? "";
    }

    private Task<RunResult?> HandleClientRequestPropertyDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        var properties = context.Options;

        var newProperties = SetKeyValuePairs(directive, properties);
        context = context with { Options = newProperties };

        if (!string.IsNullOrWhiteSpace(directive.AfterDirectiveText))
        {
            // execute remaining part of query with these changes
            return ExecuteQueryAsync(context with { Query = directive.AfterDirectiveText }, cancellationToken);
        }
        else
        {
            // This change is the result
            return Task.FromResult<RunResult?>(new RunResult { QueryOptions = newProperties });
        }
    }

    private Task<RunResult?> HandleQueryParameterDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        var parameters = context.Parameters;

        var newParameters = SetKeyValuePairs(directive, parameters);
        context = context with { Parameters = newParameters };

        if (!string.IsNullOrWhiteSpace(directive.AfterDirectiveText))
        {
            // execute remaining part of query with these changes
            return ExecuteQueryAsync(context with { Query = directive.AfterDirectiveText }, cancellationToken);
        }
        else
        {
            // this change is the result
            return Task.FromResult<RunResult?>(new RunResult { QueryParameters = newParameters });
        }
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
 
    private IConnection? GetConnection(Document document)
    {
        var connectionInfo = _documentManager.GetConnection(document.Id);
        if (connectionInfo.Cluster != null)
        {
            return _connectionManager.GetConnection(connectionInfo.Cluster, connectionInfo.Database);
        }
        return null;
    }

    private Task<RunResult?> HandleStoreQueryResultDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        if (directive.Arguments.Count > 0)
        {
            var name = directive.Arguments[0].Text;
            return ExecuteQueryAsync(context with { Query = directive.AfterDirectiveText, StoredQueryResultName = name }, cancellationToken);
        }
        else
        {
            return Task.FromResult<RunResult?>(
                new RunResult { Query = directive.Text, Error = CreateDiagnostic(directive.Text, "Invalid directive") });
        }
    }
}
