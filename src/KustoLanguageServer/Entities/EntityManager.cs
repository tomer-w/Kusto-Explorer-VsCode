using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Kusto.Language.Symbols;
using Kusto.Toolkit;
using Newtonsoft.Json.Linq;
using System.Diagnostics.CodeAnalysis;
using static Kusto.Cloud.Platform.Instrumentation.DatabasesNamesMapping;

namespace Kusto.Lsp;


public class EntityManager : IEntityManager
{
    private readonly IConnectionManager _connectionManager;

    public EntityManager(IConnectionManager connectionManager)
    {
        _connectionManager = connectionManager;
    }

    public async Task<string?> GetCreateCommand(EntityId id, CancellationToken cancellationToken)
    {
        var connection = _connectionManager.GetConnection(id.Cluster, id.Database);
        if (connection != null)
        {
            switch (id.EntityType)
            {
                case EntityType.Table:
                    var tableDef = await GetTableDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(tableDef);
                case EntityType.Function:
                    var functionDef = await GetFunctionDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(functionDef);
                case EntityType.MaterializedView:
                    var mvDef = await GetMaterializedViewDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(mvDef);
                case EntityType.EntityGroup:
                    var egDef = await GetEntityGroupDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(egDef);
                case EntityType.Graph:
                    var gmDef = await GetGraphModelDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(gmDef);
                case EntityType.ExternalTable:
                    break; // noway to have a single command that reconstructs external table
                default:
                    break;
            }
        }

        return null;
    }

    public Task<string?> GetQueryReference(EntityId id, CancellationToken cancellationToken)
    {
        var result = id.EntityType switch
        {
            EntityType.Cluster => GetQueryClusterReference(),
            EntityType.Database => GetQueryDatabaseReference(),
            EntityType.Table => $"{GetQueryDatabaseReference()}.{KustoFacts.BracketNameIfNecessary(id.EntityName)}",
            EntityType.ExternalTable => $"{GetQueryDatabaseReference()}.external_table({KustoFacts.BracketNameIfNecessary(id.EntityName)})",
            EntityType.MaterializedView => $"{GetQueryDatabaseReference()}.materialized_view({KustoFacts.BracketNameIfNecessary(id.EntityName)})",
            EntityType.EntityGroup => $"{GetQueryDatabaseReference()}.entity_group({KustoFacts.BracketNameIfNecessary(id.EntityName)})",
            EntityType.Graph => $"{GetQueryDatabaseReference()}.graph({KustoFacts.BracketNameIfNecessary(id.EntityName)})",
            EntityType.StoredQueryResult => $"{GetQueryDatabaseReference()}.stored_query_result({KustoFacts.BracketNameIfNecessary(id.EntityName)})",
            _ => null
        };

        return Task.FromResult<string?>(result);

        string GetQueryClusterReference()
        {
            return $"cluster({KustoFacts.GetSingleQuotedStringLiteral(id.Cluster)})";
        }

        string GetQueryDatabaseReference()
        {
            return $"{GetQueryClusterReference()}.database({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})";
        }
    }

    private string? WithEOL(string? text)
    {
        if (text != null
            && Kusto.Language.Parsing.TextFacts.GetLastLineBreakEnd(text) < text.Length)
        {
            return text + "\n";
        }
        return text;
    }

    private async Task<string?> GetTableDefinitionAsync(IConnection connection, string databaseName, string tableName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "Table", tableName, cancellationToken).ConfigureAwait(false);
        if (entityInfo != null)
        {
            var table = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName, KustoDialect.EngineCommand);
            var columnSchema = entityInfo.CslOutputSchema;
            var props = GetProperties(entityInfo.Folder, entityInfo.DocString, entityInfo.Properties);
            var propsClause = GetWithPropertiesClause(props);

            if (propsClause != null)
            {
                return
                    $$"""
                    .create-merge table {{table}}
                        ({{columnSchema}})
                        {{propsClause}}
                    """;
            }
            else
            {
                return
                    $$"""
                    .create-merge table {{table}}
                        ({{columnSchema}})
                    """;
            }
        }
        return null;
    }

    private async Task<string?> GetFunctionDefinitionAsync(IConnection connection, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "Function", entityName, cancellationToken).ConfigureAwait(false);
        if (entityInfo != null)
        {
            var function = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName, KustoDialect.EngineCommand);
            var props = GetProperties(entityInfo.Folder, entityInfo.DocString, entityInfo.Properties);
            var propClause = GetWithPropertiesClause(props);

            if (propClause != null)
            {
                return
                    $$"""
                    .create-or-alter function
                        {{propClause}}
                    {{function}} {{entityInfo.CslInputSchema}}
                    {{entityInfo.Content}}
                    """;
            }
            else
            {
                return
                    $$"""
                    .create-or-alter function {{function}} {{entityInfo.CslInputSchema}}
                    {{entityInfo.Content}}
                    """;
            }

        }
        return null;
    }

    private async Task<string?> GetMaterializedViewDefinitionAsync(IConnection connection, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "MaterializedView", entityName, cancellationToken).ConfigureAwait(false);

        var mvCommand = CslCommandGenerator.GenerateMaterializedViewShowCommand(entityName);
        var mvInfo = (await connection.ExecuteAsync<MaterializedViewShowCommandResult>(mvCommand, cancellationToken: cancellationToken).ConfigureAwait(false)).FirstOrDefault();

        if (entityInfo != null && mvInfo != null)
        {
            var view = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName, KustoDialect.EngineCommand);
            var table = KustoFacts.BracketNameIfNecessary(mvInfo.SourceTable, KustoDialect.EngineCommand);
            return
                $$"""
                .create-or-alter materialized-view {{view}} on table {{table}} { 
                {{mvInfo.Query}} 
                }
                """;
        }
        return null;
    }

    private async Task<string?> GetEntityGroupDefinitionAsync(IConnection connection, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "EntityGroup", entityName, cancellationToken).ConfigureAwait(false);

        if (entityInfo != null)
        {
            var name = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName, KustoDialect.EngineCommand);
           
            return
                $$"""
                .create-or-alter entity_group {{name}} ({{entityInfo.Content}})
                """;
        }
        return null;
    }

    private async Task<string?> GetGraphModelDefinitionAsync(IConnection connection, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "Graph", entityName, cancellationToken).ConfigureAwait(false);

        var gmCommand = CslCommandGenerator.GenerateGraphModelShowCommand(entityName, details: true);
        var gmInfo = (await connection.ExecuteAsync<GraphModelsShowDetailsCommandResult>(gmCommand, cancellationToken: cancellationToken).ConfigureAwait(false)).FirstOrDefault();

        if (entityInfo != null && gmInfo != null)
        {
            var name = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName, KustoDialect.EngineCommand);
            return
                $$"""
                .create-or-alter graph_model {{name}} 
                ```
                {{gmInfo.Model}}
                ```
                """;
        }
        return null;
    }


    private List<(string name, string literal)> GetProperties(string? folder, string? docstring, JObject? jsonProperties)
    {
        var props = new List<(string name, string literal)>();
        if (!string.IsNullOrWhiteSpace(folder))
            props.Add(("folder", KustoFacts.GetSingleQuotedStringLiteral(folder)));
        if (!string.IsNullOrWhiteSpace(docstring))
            props.Add(("docstring", KustoFacts.GetSingleQuotedStringLiteral(docstring)));
        if (jsonProperties != null)
            AddJsonProperties(props, jsonProperties);
        return props;
    }

    private void AddJsonProperties(List<(string name, string literal)> list, JObject properties)
    {
        foreach (var kvp in ((IDictionary<string, JToken>)properties))
        {
            var literal = ToKustoLiteral(kvp.Value);
            list.Add((kvp.Key, literal));
        }
    }

    private string? GetWithPropertiesClause(List<(string name, string literal)> list)
    {
        if (list.Count > 0)
        {
            var propStrings = string.Join($", ", list.Select(x => $"{x.name}={x.literal}"));
            return $"with ({propStrings})";
        }
        return null;
    }

    private string ToKustoLiteral(JToken token)
    {
        switch (token.Type)
        {
            case JTokenType.String:
                return KustoFacts.GetSingleQuotedStringLiteral(token.ToString());
            case JTokenType.Integer:
            case JTokenType.Float:
                return token.ToString();
            case JTokenType.Boolean:
                return token.ToString().ToLower();
            case JTokenType.Array:
            case JTokenType.Object:
                return $"dynamic({token.ToString()})";
            case JTokenType.Null:
                return "null";
            default:
                throw new NotSupportedException($"Unsupported property value type: {token.Type}");
        }
    }

    private async Task<DatabasesEntitiesShowCommandResult?> GetEntityInfoAsync(IConnection connection, string databaseName, string entityType, string entityName, CancellationToken cancellationToken)
    {
        var command = $"{CslCommandGenerator.GenerateDatabaseEntityShowCommand(databaseName, entityName)} | where EntityType == {KustoFacts.GetSingleQuotedStringLiteral(entityType)}";
        //var command = CslCommandGenerator.GenerateDatabaseEntityShowCommand(databaseName, entityName);
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