using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Data.Data;
using Kusto.Data.Net.Client;
using Kusto.Language;
using Kusto.Language.Editor;
using System.Data;
using System.Runtime.CompilerServices;

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

    public Task<QueryResult?> RunQueryAsync(Uri scriptId, TextRange range, CancellationToken cancellationToken)
    {
        var connection = GetConnection(scriptId);
        if (connection != null)
        {
            if (_documentManager.TryGetDocument(scriptId, out var document))
            {
                // some servers will fails if query starts with a comment.
                var query = document.GetQueryMinimalText(range.Start, Language.Editor.MinimalTextKind.RemoveLeadingWhitespaceAndComments, cancellationToken);
                var properties = new ClientRequestProperties();
                try
                {
                    return this.ExecuteQueryAsync(connection, query, properties, cancellationToken);
                }
                catch (Exception ex)
                {
                    return Task.FromResult<QueryResult?>(new QueryResult(null, null, ex.Message));
                }
            }
            else
            {
                return Task.FromResult<QueryResult?>(new QueryResult(null, null, "Invalid Document"));
            }
        }
        else
        {
            return Task.FromResult<QueryResult?>(new QueryResult(null, null, "Invalid Connection"));
        }
    }

    private async Task<QueryResult?> ExecuteQueryAsync(IConnection connection, string query, ClientRequestProperties properties, CancellationToken cancellationToken)
    {
        switch (KustoCode.GetKind(query))
        {
            case CodeKinds.Query:
                {
                    var resultReader = await connection.QueryProvider.ExecuteQueryAsync(connection.InitialCatalog, query, properties, cancellationToken).ConfigureAwait(false);
                    var dataSet = KustoDataReaderParser.ParseV1(resultReader, null);
                    var dataTable = dataSet?.GetMainResultsOrNull();
                    return new QueryResult(dataTable?.TableData, dataTable?.VisualizationOptions, null);
                }
            case CodeKinds.Command:
                {
                    var resultReader = await connection.AdminProvider.ExecuteControlCommandAsync(connection.InitialCatalog, query, properties).ConfigureAwait(false);
                    var dataSet = KustoDataReaderParser.ParseV1(resultReader, null);
                    var dataTable = dataSet?.GetMainResultsOrNull();
                    return new QueryResult(dataTable?.TableData, dataTable?.VisualizationOptions, null);
                }
            case CodeKinds.Directive:
            default:
                return null;
        }
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
}
