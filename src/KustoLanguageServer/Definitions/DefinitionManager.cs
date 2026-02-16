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
                    var tableDef = await GetTableDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(tableDef);
                case EntityType.ExternalTable:
                    var externalTablDef = await GetExternalTableDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken).ConfigureAwait(false);
                    return WithEOL(externalTablDef);
                case EntityType.Function:
                    var functionDef = await GetFunctionDefinitionAsync(connection, id.Database, id.EntityName, cancellationToken);
                    return WithEOL(functionDef);
            }
        }

        return null;
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
            var table = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName);
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

    private async Task<string?> GetExternalTableDefinitionAsync(IConnection connection, string databaseName, string tableName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "ExternalTable", tableName, cancellationToken).ConfigureAwait(false);
        if (entityInfo != null)
        {
            var table = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName);
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

    private async Task<string?> GetFunctionDefinitionAsync(IConnection connection, string databaseName, string functionName, CancellationToken cancellationToken)
    {
        var entityInfo = await GetEntityInfoAsync(connection, databaseName, "Function", functionName, cancellationToken).ConfigureAwait(false);
        if (entityInfo != null)
        {
            var function = KustoFacts.BracketNameIfNecessary(entityInfo.EntityName);
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