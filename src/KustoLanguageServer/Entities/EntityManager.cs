using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Newtonsoft.Json.Linq;
using System.Collections.Immutable;

namespace Kusto.Lsp;

public class EntityManager : IEntityManager
{
    private readonly ISchemaSource _schemaSource;

    public EntityManager(ISchemaSource schemaSource)
    {
        _schemaSource = schemaSource;
    }

    public async Task<string?> GetCreateCommand(EntityId id, CancellationToken cancellationToken)
    {
        if (id.Cluster != null
            && id.Database != null)
        {
            switch (id.EntityType)
            {
                case EntityType.Table:
                    var tableDef = await GetTableDefinitionAsync(id.Cluster, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(tableDef);
                case EntityType.Function:
                    var functionDef = await GetFunctionDefinitionAsync(id.Cluster, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(functionDef);
                case EntityType.MaterializedView:
                    var mvDef = await GetMaterializedViewDefinitionAsync(id.Cluster, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(mvDef);
                case EntityType.EntityGroup:
                    var egDef = await GetEntityGroupDefinitionAsync(id.Cluster, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(egDef);
                case EntityType.Graph:
                    var gmDef = await GetGraphModelDefinitionAsync(id.Cluster, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(gmDef);
                case EntityType.ExternalTable:
                    break; // noway to have a single command that reconstructs external table
                default:
                    break;
            }
        }

        return null;
    }

    public Task<string?> GetQueryExpression(EntityId id, IDocument? document, CancellationToken cancellationToken)
    {
        var result = id.EntityType switch
        {
            EntityType.Cluster => GetClusterExpression(id.EntityName),
            EntityType.Database => GetDatabaseExpression(id.EntityName),
            EntityType.Table => $"{GetDatabasePrefix()}{KustoFacts.BracketNameIfNecessary(id.EntityName)}",
            EntityType.ExternalTable => $"{GetDatabasePrefix()}external_table({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.MaterializedView => $"{GetDatabasePrefix()}materialized_view({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.Function => $"{GetDatabasePrefix()}{KustoFacts.BracketNameIfNecessary(id.EntityName)}()",
            EntityType.EntityGroup => $"{GetDatabasePrefix()}entity_group({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.Graph => $"{GetDatabasePrefix()}graph({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            EntityType.StoredQueryResult => $"{GetDatabasePrefix()}stored_query_result({KustoFacts.GetSingleQuotedStringLiteral(id.EntityName)})",
            _ => null
        };

        return Task.FromResult(result);

        string GetClusterExpression(string name)
        {
            return $"cluster({KustoFacts.GetSingleQuotedStringLiteral(name)})";
        }

        string GetClusterPrefix()
        {
            if (id.Cluster != null
                && document != null 
                && document.Globals.Cluster.Name != id.Cluster)
            {
                return $"{GetClusterExpression(id.Cluster)}.";
            }
            return "";
        }

        string GetDatabaseExpression(string name)
        {
            return $"{GetClusterPrefix()}database({KustoFacts.GetSingleQuotedStringLiteral(name)})";
        }

        string GetDatabasePrefix()
        {
            if (id.Cluster != null
                && id.Database != null 
                && document != null 
                && (document.Globals.Cluster.Name != id.Cluster || document.Globals.Database.Name != id.Database))
            {
                return $"{GetDatabaseExpression(id.Database)}.";
            }
            return "";
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

    private async Task<string?> GetTableDefinitionAsync(string cluster, string databaseName, string tableName, CancellationToken cancellationToken)
    {
        var entityInfo = (await _schemaSource.GetTableInfosAsync(cluster, databaseName, tableName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
        if (entityInfo != null)
        {
            var table = KustoFacts.BracketNameIfNecessary(entityInfo.Name, KustoDialect.EngineCommand);
            var columnSchema = GetColumnSchema(entityInfo.Columns);
            var props = GetProperties(entityInfo.Folder, entityInfo.Description, null);
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

    private static string GetColumnSchema(ImmutableList<ColumnInfo> columns)
    {
        return string.Join(", ", columns.Select(c => $"{KustoFacts.BracketNameIfNecessary(c.Name, KustoDialect.EngineCommand)}: {c.Type}"));
    }

    private async Task<string?> GetFunctionDefinitionAsync(string cluster, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = (await _schemaSource.GetFunctionInfosAsync(cluster, databaseName, entityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
        if (entityInfo != null)
        {
            var function = KustoFacts.BracketNameIfNecessary(entityInfo.Name, KustoDialect.EngineCommand);
            var props = GetProperties(entityInfo.Folder, entityInfo.Description, null);
            var propClause = GetWithPropertiesClause(props);

            if (propClause != null)
            {
                return
                    $$"""
                    .create-or-alter function
                        {{propClause}}
                    {{function}} {{entityInfo.Parameters}}
                    {{entityInfo.Body}}
                    """;
            }
            else
            {
                return
                    $$"""
                    .create-or-alter function {{function}} {{entityInfo.Parameters}}
                    {{entityInfo.Body}}
                    """;
            }

        }
        return null;
    }

    private async Task<string?> GetMaterializedViewDefinitionAsync(string cluster, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = (await _schemaSource.GetMaterializedViewInfosAsync(cluster, databaseName, entityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
        if (entityInfo != null)
        { 
            var view = KustoFacts.BracketNameIfNecessary(entityInfo.Name, KustoDialect.EngineCommand);
            var table = KustoFacts.BracketNameIfNecessary(entityInfo.Source, KustoDialect.EngineCommand);
            return
                $$"""
                .create-or-alter materialized-view {{view}} on table {{table}} { 
                {{entityInfo.Query}} 
                }
                """;
        }
        return null;
    }

    private async Task<string?> GetEntityGroupDefinitionAsync(string cluster, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = (await _schemaSource.GetEntityGroupInfosAsync(cluster, databaseName, entityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
        if (entityInfo != null)
        {
            var name = KustoFacts.BracketNameIfNecessary(entityInfo.Name, KustoDialect.EngineCommand);
            var entityList = string.Join(", ", entityInfo.Entities);
            return
                $$"""
                .create-or-alter entity_group {{name}} ({{entityList}})
                """;
        }
        return null;
    }

    private async Task<string?> GetGraphModelDefinitionAsync(string cluster, string databaseName, string entityName, CancellationToken cancellationToken)
    {
        var entityInfo = (await _schemaSource.GetGraphModelInfosAsync(cluster, databaseName, entityName, cancellationToken).ConfigureAwait(false)).FirstOrDefault();
        if (entityInfo != null)
        {
            var name = KustoFacts.BracketNameIfNecessary(entityInfo.Name, KustoDialect.EngineCommand);
            return
                $$"""
                .create-or-alter graph_model {{name}} 
                ```
                {{entityInfo.Model}}
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
}