using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Kusto.Language.Symbols;
using Newtonsoft.Json.Linq;
using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;


public class DefinitionManager : IDefinitionManager
{
    private readonly IConnectionManager _connectionManager;

    public DefinitionManager(IConnectionManager connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public async Task<string?> GetDefinitionAsync(EntityId id, CancellationToken cancellationToken)
    {
        var connection = _connectionManager.GetConnection(id.Cluster, id.Database);
        if (connection != null)
        {
            switch (id.EntityType)
            {
                case EntityType.Table:
                    var tableSchema = await GetTableSchemaAsync(connection, id.Database, id.EntityName, cancellationToken);
                    return tableSchema?.ToCslString();
            }
        }

        return null;
    }

    private async Task<TableSchema?> GetTableSchemaAsync(IConnection connection, string databaseName, string tableName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "Table", tableName, cancellationToken).ConfigureAwait(false);
        return entityInfo != null ? GetTableSchema(entityInfo) : null;
    }

    private TableSchema GetTableSchema(DatabasesEntitiesShowCommandResult result)
    {
        return new TableSchema(result.EntityName, GetColumnSchemas(result), result.Folder, result.DocString);
    }

    private IEnumerable<ColumnSchema> GetColumnSchemas(DatabasesEntitiesShowCommandResult result)
    {
        var columns = Kusto.Language.Symbols.TableSymbol.From(result.CslOutputSchema).Columns;
        var columnDocs = result.Properties != null && result.Properties.TryGetValue("column_docs", out var columnDocsProps) ? columnDocsProps as JObject : null;
        return columns.Select(c =>
            new ColumnSchema
            {
                Name = c.Name,
                CslType = c.Type.Name,
                DocString = columnDocs?.GetValue(c.Name)?.ToString()
            });
    }

    private async Task<DatabasesEntitiesShowCommandResult?> GetEntityInfoAsync(IConnection connection, string databaseName, string kind, string entityName, CancellationToken cancellationToken)
    {
        //var command = $"{CslCommandGenerator.GenerateDatabaseEntityShowCommand(databaseName, entityName)} | where EntityType = {KustoFacts.GetSingleQuotedStringLiteral(kind)}";
        var command = CslCommandGenerator.GenerateDatabaseEntityShowCommand(databaseName, entityName);
        var results = await connection.ExecuteAsync<DatabasesEntitiesShowCommandResult>(command, cancellationToken: cancellationToken).ConfigureAwait(false);
        return results.FirstOrDefault();
    }

    /// <summary>
    /// Get the id for the symbol
    /// </summary>
    public EntityId TryGetId(GlobalState globals, Symbol symbol, [NotNullWhen(true)] out EntityId? id)
    {
        throw new NotImplementedException();
    }
}