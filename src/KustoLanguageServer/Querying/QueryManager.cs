using System.Collections.Immutable;
using Kusto.Cloud.Platform.Utils;
using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Common.Impl;
using Kusto.Data.Data;
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

    public Task<QueryResult?> RunQueryAsync(
        Uri documentId, 
        TextRange range, 
        ImmutableDictionary<string, string> queryOptions,
        ImmutableDictionary<string, string> queryParameters,
        CancellationToken cancellationToken)
    {
        var connection = GetConnection(documentId);
        if (connection != null)
        {
            if (_documentManager.TryGetDocument(documentId, out var document))
            {
                // some servers will fails if query starts with a comment.
                var query = document.GetQuery(range.Start, cancellationToken);
                if (string.IsNullOrWhiteSpace(query))
                    return Task.FromResult<QueryResult?>(new QueryResult { Query = query, Error = CreateDiagnostic(query, "Query is empty") });

                var context = new QueryContext
                {
                    Connection = connection,
                    QueryOptions = queryOptions,
                    QueryParameters = queryParameters
                };

                return this.ExecuteQueryAsync(query, context, cancellationToken);
            }
            else
            {
                return Task.FromResult<QueryResult?>(new QueryResult { Error = new Diagnostic("KLS002", "Invalid Document") });
            }
        }
        else
        {
            return Task.FromResult<QueryResult?>(new QueryResult { Error = new Diagnostic("KLS003", "Invalid Connection") });
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

        /// <summary>
        /// The query options for this query.
        /// </summary>
        public required ImmutableDictionary<string, string> QueryOptions { get; init; }

        /// <summary>
        /// The query parameters for this query.
        /// </summary>
        public required ImmutableDictionary<string, string> QueryParameters { get; init; }

        /// <summary>
        ///  the name of the stored query result to store the result of this execution into.
        /// </summary>
        public string? StoredQueryResultName { get; init; }
    }

    private Task<QueryResult?> ExecuteQueryAsync(EditString query, QueryContext context, CancellationToken cancellationToken)
    {
        switch (KustoCode.GetKind(query))
        {
            case CodeKinds.Query:
            default:
                return HandleQuery(query, context, cancellationToken);
            case CodeKinds.Command:
                return HandleCommand(query, context, cancellationToken);
            case CodeKinds.Directive:
                return HandleDirective(query, context, cancellationToken);
        }
    }

    private async Task<QueryResult?> HandleQuery(EditString query, QueryContext context, CancellationToken cancellationToken)
    {
        query = RemoveLeadingTrivia(query);
        var properties = CreateClientRequestProperties(context);

        try
        {
            if (context.StoredQueryResultName != null)
            {
                // execute command that runs the query and stores the result using the name
                var command = query.ReplaceAt(0, query.Length, CslCommandGenerator.GenerateStoredQueryResultSetOrReplaceCommand(context.StoredQueryResultName, query, previewCount: 0));
                var contextWithoutName = context with { StoredQueryResultName = null };
                var result = await HandleCommand(command, contextWithoutName, cancellationToken).ConfigureAwait(false);
                if (result == null || result.Error != null)
                    return result;

                // change query to retrieve the stored result
                query = query.ReplaceAt(0, query.Length, $"stored_query_result({KustoFacts.GetStringLiteral(context.StoredQueryResultName)})");
            }

            var resultReader = await context.Connection.QueryProvider.ExecuteQueryAsync(context.Connection.InitialCatalog, query, properties, cancellationToken).ConfigureAwait(false);
            var dataSet = KustoDataReaderParser.ParseV1(resultReader, null);
            var dataTable = dataSet?.GetMainResultsOrNull();
            return new QueryResult
            {
                Query = query,
                Data = dataTable?.TableData,
                ChartOptions = dataTable?.VisualizationOptions
            };
        }
        catch (Exception e)
        {
            return new QueryResult { Query = query, Error = CreateDiagnostic(query, e) };
        }
    }

    private async Task<QueryResult?> HandleCommand(EditString query, QueryContext context, CancellationToken cancellationToken)
    {
        query = RemoveLeadingTrivia(query);
        var properties = CreateClientRequestProperties(context);
        try
        {
            var resultReader = await context.Connection.AdminProvider.ExecuteControlCommandAsync(context.Connection.InitialCatalog, query, properties).ConfigureAwait(false);
            var dataSet = KustoDataReaderParser.ParseV1(resultReader, null);
            var dataTable = dataSet?.GetMainResultsOrNull();
            return new QueryResult
            {
                Query = query,
                Data = dataTable?.TableData,
                ChartOptions = dataTable?.VisualizationOptions
            };
        }
        catch (Exception e)
        {
            return new QueryResult { Query = query, Error = CreateDiagnostic(query, e) };
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

    private Task<QueryResult?> HandleDirective(EditString query, QueryContext context, CancellationToken cancellationToken)
    {
        if (ClientDirective.TryParse(query, out var directive))
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
                    return Task.FromResult<QueryResult?>(
                        new QueryResult { Query = query, Error = CreateDiagnostic(query, $"Unhandled directive: {directive.Name}") }
                        );
            }
        }
        else
        {
            return Task.FromResult<QueryResult?>(
                new QueryResult { Query = query, Error = CreateDiagnostic(query, "Invalid Directive") }
                );
        }
    }

    private Task<QueryResult?> HandleConnectOrDatabaseDirective( ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        if (TryGetDirectiveClusterAndDatabase(directive, out var clusterName, out var databaseName)
            && clusterName != null)
        {
            if (!string.IsNullOrEmpty(directive.AfterDirectiveText))
            {
                // change default cluster and database and continue
                var conn = _connectionManager.GetConnection(clusterName, databaseName);
                var newContext = context with { Connection = conn };
                return this.ExecuteQueryAsync(directive.AfterDirectiveText, newContext, cancellationToken);
            }
            else
            {
                // result is request to change document's default cluster & database
                return Task.FromResult<QueryResult?>(new QueryResult { Query = directive.Text, Cluster = clusterName, Database = databaseName });
            }
        }
        return Task.FromResult<QueryResult?>(null);
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

    private Task<QueryResult?> HandleClientRequestPropertyDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        var properties = context.QueryOptions;

        var newProperties = SetKeyValuePairs(directive, properties);
        context = context with { QueryOptions = newProperties };

        if (!string.IsNullOrWhiteSpace(directive.AfterDirectiveText))
        {
            // execute remaining part of query with these changes
            return ExecuteQueryAsync(directive.AfterDirectiveText, context, cancellationToken);
        }
        else
        {
            // This change is the result
            return Task.FromResult<QueryResult?>(new QueryResult { QueryOptions = newProperties });
        }
    }

    private Task<QueryResult?> HandleQueryParameterDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        var parameters = context.QueryParameters;

        var newParameters = SetKeyValuePairs(directive, parameters);
        context = context with { QueryParameters = newParameters };

        if (!string.IsNullOrWhiteSpace(directive.AfterDirectiveText))
        {
            // execute remaining part of query with these changes
            return ExecuteQueryAsync(directive.AfterDirectiveText, context, cancellationToken);
        }
        else
        {
            // this change is the result
            return Task.FromResult<QueryResult?>(new QueryResult { QueryParameters = newParameters });
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
 
    private IConnection? GetConnection(Uri scriptId)
    {
        var connectionInfo = _documentManager.GetConnection(scriptId);
        if (connectionInfo.Cluster != null)
        {
            return _connectionManager.GetConnection(connectionInfo.Cluster, connectionInfo.Database);
        }
        return null;
    }

    private ClientRequestProperties CreateClientRequestProperties(QueryContext context)
    {
        var crp = new ClientRequestProperties();

        foreach (var kvp in context.QueryOptions)
        {
            SetQueryOption(crp, kvp.Key, kvp.Value);
        }

        crp.SetParameters(context.QueryParameters);

        return crp;
    }

    private void SetQueryOption(ClientRequestProperties crp, string name, string value)
    {
        if (value != null && value == "##null")
        {
            crp.ClearOption(name);
            return;
        }

        switch (name)
        {
            // Booleans
            case ClientRequestProperties_Debugging.OptionNoExecute:
            case ClientRequestProperties_Debugging.OptionPerfTrace:
            case ClientRequestProperties.OptionValidatePermissions:
            case ClientRequestProperties.OptionQueryResultsApplyGetSchema:
            case ClientRequestProperties.OptionNoTruncation:
            case ClientRequestProperties.OptionDeferPartialQueryFailures:
            case ClientRequestProperties.OptionNoRequestTimeout:
            case ClientRequestProperties.OptionAllowProjectionAndExtensionUnderSearch:
            case ClientRequestProperties.OptionRequestCalloutDisabled:
            case ClientRequestProperties_FaultInjection.OptionDebugQueryExecutionEnableExpiry:
            case ClientRequestProperties_FaultInjection.OptionDebugQueryExecutionEnableOom:
            case ClientRequestProperties.OptionDoNotImpersonate:
                crp.SetOption(name, Boolean.Parse(value!));
                break;

            // Long
            case ClientRequestProperties.OptionTruncationMaxSize:
            case ClientRequestProperties.OptionTruncationMaxRecords:
            case ClientRequestProperties.OptionTakeMaxRecords:
            case ClientRequestProperties.OptionMaxMemoryConsumptionPerIterator:
            case ClientRequestProperties.OptionMaxMemoryConsumptionPerQueryPerNode:
            case ClientRequestProperties_FaultInjection.OptionDebugQueryPlanBurnCpuMsec:
            case ClientRequestProperties.OptionMaxOutputColumns:
            case ClientRequestProperties.OptionMaxEntitiesToUnion:
            case ClientRequestProperties.OptionSqlMaxStringSize:
                crp.SetOption(name, CslLongLiteral.Parse(value!));
                break;

            // TimeSpan
            case ClientRequestProperties.OptionServerTimeout:
                if (CslTimeSpanLiteral.TryParse(value, out var timeSpan))
                {
                    crp.SetOption(name, timeSpan);
                }
                else
                {
                    value = value.TrimBalancedSingleAndDoubleQuotes();
                    crp.SetOption(name, ExtendedTimeSpan.Parse(value));
                }
                return;

            // DateTime
            case ClientRequestProperties.OptionQueryDateTimeScopeFrom:
            case ClientRequestProperties.OptionQueryDateTimeScopeTo:
            case ClientRequestProperties.OptionQueryNow:
                if (CslDateTimeLiteral.TryParse(value, out var dateTime))
                {
                    crp.SetOption(name, dateTime);
                }
                else
                {
                    value = value.TrimBalancedSingleAndDoubleQuotes();
                    crp.SetOption(name, ExtendedDateTime.ParseInexactUtc(value));
                }
                break;

            // All others are strings
            default:
                crp.SetOption(name, value);
                break;
        }
    }

    private Task<QueryResult?> HandleStoreQueryResultDirective(ClientDirective directive, QueryContext context, CancellationToken cancellationToken)
    {
        if (directive.Arguments.Count > 0)
        {
            var name = directive.Arguments[0].Text;
            var contextWithName = context with { StoredQueryResultName = name };
            return ExecuteQueryAsync(directive.AfterDirectiveText, contextWithName, cancellationToken);
        }
        else
        {
            return Task.FromResult<QueryResult?>(
                new QueryResult { Query = directive.Text, Error = CreateDiagnostic(directive.Text, "Invalid directive") });
        }
    }
}
