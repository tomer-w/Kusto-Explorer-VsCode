using Kusto.Data;
using Kusto.Data.Common;
using Kusto.Language;
using Kusto.Language.Symbols;
using Newtonsoft.Json;
using System.Collections.Immutable;

namespace Kusto.Lsp;

/// <summary>
/// A <see cref="ISchemaSource"/> that pulls schema direct from the server.
/// </summary>
public class ServerSchemaSource : ISchemaSource
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger? _logger;

    private ImmutableDictionary<string, ImmutableHashSet<string>> _clusterToBadDbNameMap =
        ImmutableDictionary<string, ImmutableHashSet<string>>.Empty;

    public ServerSchemaSource(
        IConnectionManager connectionManager,
        ILogger? logger = null)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }

    public async Task<ClusterInfo?> GetClusterInfoAsync(string clusterName, string? contextCluster, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, null, contextCluster, out var conn))
            return null;

        var result = await conn.ExecuteAsync<DatabaseNamesResult>(
            ".show databases | project DatabaseName, PrettyName",
            cancellationToken: cancellationToken)
            .ConfigureAwait(false);

        var dbNames = result.Values?.Select(d =>
            new DatabaseName
            {
                Name = d.DatabaseName,
                AlternateName = d.PrettyName
            }).ToImmutableList()
            ?? ImmutableList<DatabaseName>.Empty;

        _logger?.Log($"ServerSchemaSource: Loaded schema for cluster: {clusterName}");

        return new ClusterInfo
        {
            Databases = dbNames,
        };
    }

    private bool IsBadDatabaseName(string clusterName, string databaseName)
    {
        return _clusterToBadDbNameMap.TryGetValue(clusterName, out var badDbNames)
            && badDbNames.Contains(databaseName);
    }

    private void AddBadDatabaseName(string clusterName, string databaseName)
    {
        if (!_clusterToBadDbNameMap.TryGetValue(clusterName, out var badDbNames))
        {
            badDbNames = ImmutableInterlocked.AddOrUpdate(
                ref _clusterToBadDbNameMap,
                clusterName,
                _cluster => [databaseName],
                (_cluster, hset) => hset.Add(databaseName)
                );
        }

        badDbNames.Add(databaseName);
    }

    public async Task<DatabaseInfo?> GetDatabaseInfoAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
    {
        // if we've already determined this database name is bad, then bail out
        if (IsBadDatabaseName(clusterName, databaseName))
            throw GetInvalidDatabaseException(databaseName);

        if (!_connectionManager.TryGetConnection(clusterName, databaseName, contextCluster, out var conn))
            return null;

        var dbName = await GetBothDatabaseNamesAsync(conn, databaseName, cancellationToken).ConfigureAwait(false);
        if (dbName == null)
        {
            AddBadDatabaseName(clusterName, databaseName);
            throw GetInvalidDatabaseException(databaseName);
        }

        // use the primary database name if we need do refer to the database later
        if (dbName.Name != databaseName)
        {
            databaseName = dbName.Name;
        }

        // get all entities for this database
        var entities = await GetDatabaseEntitiesAsync(conn, dbName.Name, null, null, cancellationToken).ConfigureAwait(false);

        var tables = await CreateTableInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
        var externalTables = await CreateExternalTableInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
        var materializedViews = await CreateMaterializedViewInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
        var functions = await CreateFunctionInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
        var entityGroups = await CreateEntityGroupInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
        var graphModels = await CreateGraphModelInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
        var storedResults = await CreateStoredQueryResultInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);

        _logger?.Log($"ServerSchemaSource: Loaded schema for database: {clusterName} {databaseName}");

        return new DatabaseInfo
        {
            Name = dbName.Name,
            AlternateName = dbName.AlternateName,
            Tables = tables,
            ExternalTables = externalTables,
            MaterializedViews = materializedViews,
            Functions = functions,
            EntityGroups = entityGroups,
            GraphModels = graphModels,
            StoredQueryResults = storedResults
        };
    }

    /// <summary>
    /// Returns the database name and pretty name given either the database name or the pretty name.
    /// </summary>
    protected virtual async Task<DatabaseName> GetBothDatabaseNamesAsync(IConnection connection, string databaseNameOrPrettyName, CancellationToken cancellationToken)
    {
        var result = await connection.ExecuteAsync<DatabaseNamesResult>(
            $".show database identity | project DatabaseName, PrettyName",
            cancellationToken: cancellationToken)
            .ConfigureAwait(false);

        var dbInfo = result.Values?.FirstOrDefault();

        if (dbInfo == null)
            throw GetInvalidDatabaseException(databaseNameOrPrettyName);

        return new DatabaseName
        {
            Name = dbInfo.DatabaseName,
            AlternateName = dbInfo.PrettyName
        };
    }

    private static Exception GetInvalidDatabaseException(string databaseName) =>
        new InvalidOperationException($"Invalid database name: {databaseName}");

    private async Task<ImmutableList<DatabasesEntitiesShowCommandResult>> GetDatabaseEntitiesAsync(
        IConnection connection, string databaseName, EntityType? entityType, string? entityName, CancellationToken cancellationToken)
    {
        var command = CslCommandGenerator.GenerateDatabasesEntitiesShowCommand(
            filterOnDatabases: [databaseName], 
            filterOnEntityTypes: entityType != null ? [entityType.Value] : null, 
            filterOnEntityNames: entityName != null ? [entityName] : null
            );

        var results = await connection.ExecuteAsync<DatabasesEntitiesShowCommandResult>(command, cancellationToken: cancellationToken).ConfigureAwait(false);

        return results.Values?.ToImmutableList()
            ?? ImmutableList<DatabasesEntitiesShowCommandResult>.Empty;
    }

    public async Task<ImmutableList<TableInfo>> GetTableInfosAsync(
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var connection))
            return ImmutableList<TableInfo>.Empty;

        var entities = await GetDatabaseEntitiesAsync(connection, databaseName, EntityType.Table, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateTableInfosAsync(connection, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<TableInfo>> CreateTableInfosAsync(
        IConnection connection, 
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        return entities
            .Where(e => e.EntityType == "Table")
            .Select(e => 
                new TableInfo
                {
                    Name = e.EntityName,
                    Columns = CreateColumnInfo(e.CslOutputSchema),
                    Description = e.DocString,
                    Folder = e.Folder

                }
            ).ToImmutableList();
    }

    private static ImmutableList<ColumnInfo> CreateColumnInfo(string schema)
    {
        return TableSymbol.From("(" + schema + ")").Columns
            .Select(c =>
                new ColumnInfo
                {
                    Name = c.Name,
                    Type = c.Type.Name
                }
            ).ToImmutableList();
    }

    public async Task<ImmutableList<ExternalTableInfo>> GetExternalTableInfosAsync(
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var connection))
            return ImmutableList<ExternalTableInfo>.Empty;

        var entities = await GetDatabaseEntitiesAsync(connection, databaseName, EntityType.ExternalTable, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateExternalTableInfosAsync(connection, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<ExternalTableInfo>> CreateExternalTableInfosAsync(
        IConnection connection,
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        return entities
            .Where(e => e.EntityType == "ExternalTable")
            .Select(e => new ExternalTableInfo
            {
                Name = e.EntityName,
                Columns = CreateColumnInfo(e.CslOutputSchema),
                Description = e.DocString,
                Folder = e.Folder
            }).ToImmutableList();
    }

    public async Task<ImmutableList<MaterializedViewInfo>> GetMaterializedViewInfosAsync(
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var conn))
            return ImmutableList<MaterializedViewInfo>.Empty;
        var entities = await this.GetDatabaseEntitiesAsync(conn, databaseName, EntityType.MaterializedView, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateMaterializedViewInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<MaterializedViewInfo>> CreateMaterializedViewInfosAsync(
        IConnection connection,
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        if (entities.Count == 0)
            return ImmutableList<MaterializedViewInfo>.Empty;

        var mviews = entities.Where(e => e.EntityName == "MaterializedView").ToImmutableList();

        if (mviews.Count == 0)
            return ImmutableList<MaterializedViewInfo>.Empty;

        var infos = new List<MaterializedViewInfo>();

        foreach (var mv in entities)
        {
            var mvCommand = CslCommandGenerator.GenerateMaterializedViewShowCommand(mv.EntityName);
            var mvShow = (await connection.ExecuteAsync<MaterializedViewShowCommandResult>(mvCommand, cancellationToken: cancellationToken).ConfigureAwait(false)).Values?.FirstOrDefault();

            if (mvShow != null)
            {
                infos.Add(new MaterializedViewInfo
                {
                    Name = mv.EntityName,
                    Source = mvShow.SourceTable,
                    Query = mvShow.Query,
                    Columns = CreateColumnInfo(mv.CslOutputSchema),
                    Description = mv.DocString,
                    Folder = mv.Folder
                });
            }
        }

        return infos.ToImmutableList();
    }

    public async Task<ImmutableList<FunctionInfo>> GetFunctionInfosAsync(
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var conn))
            return ImmutableList<FunctionInfo>.Empty;
        var entities = await GetDatabaseEntitiesAsync(conn, databaseName, EntityType.Function, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateFunctionInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<FunctionInfo>> CreateFunctionInfosAsync(
        IConnection connection,
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        return entities
            .Where(e => e.EntityType == "Function")
            .Select(e => new FunctionInfo
            {
                Name = e.EntityName,
                Parameters = e.CslInputSchema,
                Body = e.Content,
                Description = e.DocString,
                Folder = e.Folder
            })
            .ToImmutableList();
    }

    public async Task<ImmutableList<EntityGroupInfo>> GetEntityGroupInfosAsync(
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var conn))
            return ImmutableList<EntityGroupInfo>.Empty;
        var entities = await GetDatabaseEntitiesAsync(conn, databaseName, EntityType.EntityGroup, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateEntityGroupInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<EntityGroupInfo>> CreateEntityGroupInfosAsync(
        IConnection connection,
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        return entities
            .Where(e => e.EntityType == "EntityGroup")
            .Select(e => new EntityGroupInfo        
            {
                Name = e.EntityName,
                Entities = CreateEntities(e.Content),
                Description = e.DocString,
                Folder = e.Folder
            }).ToImmutableList();
    }

    private ImmutableList<string> CreateEntities(string definition)
    {
        var expressionText = GetEntityGroupExpression(definition);
        var group = (Kusto.Language.Syntax.EntityGroup)Kusto.Language.Parsing.QueryParser.ParseEntityGroup(expressionText);
        return group.Entities.Select(ee => ee.Element.ToString(Language.Syntax.IncludeTrivia.Minimal)).ToImmutableList();
    }

    private static string GetEntityGroupExpression(string definition)
    {
        definition = definition.Trim();
        if (definition.StartsWith("entity_group"))
        {
            return definition;
        }

        string text = definition;
        if (definition.StartsWith("[") && definition.EndsWith("]"))
        {
            text = definition.Substring(1, definition.Length - 2);
        }

        text = text.Trim();
        if (text.StartsWith("\"") || text.StartsWith("'"))
        {
            text = KustoFacts.GetStringLiteralValue(text);
        }

        return "entity_group [" + text + "]";
    }

    public async Task<ImmutableList<GraphModelInfo>> GetGraphModelInfosAsync(      
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var conn))
            return ImmutableList<GraphModelInfo>.Empty;
        var entities = await this.GetDatabaseEntitiesAsync(conn, databaseName, EntityType.Graph, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateGraphModelInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<GraphModelInfo>> CreateGraphModelInfosAsync(
        IConnection connection,
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        if (entities.Count == 0)
            return ImmutableList<GraphModelInfo>.Empty;

        var graphEntities = entities.Where(e => e.EntityType == "Graph").ToImmutableList();
        if (graphEntities.Count == 0)
            return ImmutableList<GraphModelInfo>.Empty;

        var graphModelSnapshots = (await connection.ExecuteAsync<LoadGraphModelSnapshotsResult>(
            ".show graph_snapshots * | summarize Snapshots=make_list(Name) by ModelName",
            cancellationToken: cancellationToken)
            .ConfigureAwait(false))
            .Values
            ?? ImmutableList<LoadGraphModelSnapshotsResult>.Empty;

        var snapshotMap = graphModelSnapshots?.ToImmutableDictionary(snaps => snaps.ModelName, snaps => snaps.Snapshots)
            ?? ImmutableDictionary<string, string>.Empty;

        return graphEntities
            .Select(e =>
            {
                snapshotMap.TryGetValue(e.EntityName, out var snapshots);
                var snapshotNames = snapshots != null 
                    ? JsonConvert.DeserializeObject<ImmutableList<string>>(snapshots) ?? ImmutableList<string>.Empty
                    : ImmutableList<string>.Empty;

                GraphModel.TryParse(e.Content, out var model);
                return new GraphModelInfo
                {
                    Name = e.EntityName,
                    Model = e.Content,
                    Snapshots = snapshotNames,
                    Description = e.DocString,
                    Folder = e.Folder
                };
            }).ToImmutableList();
    }

    public async Task<ImmutableList<StoredQueryResultInfo>> GetStoredQueryResultInfosAsync(
        string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        if (!_connectionManager.TryGetConnection(clusterName, databaseName, out var conn))
            return ImmutableList<StoredQueryResultInfo>.Empty;
        var entities = await GetDatabaseEntitiesAsync(conn, databaseName, EntityType.StoredQueryResult, entityName, cancellationToken).ConfigureAwait(false);
        return await CreateStoredQueryResultInfosAsync(conn, entities, cancellationToken).ConfigureAwait(false);
    }

    private async Task<ImmutableList<StoredQueryResultInfo>> CreateStoredQueryResultInfosAsync(
        IConnection connection,
        ImmutableList<DatabasesEntitiesShowCommandResult> entities,
        CancellationToken cancellationToken)
    {
        return entities
            .Where(e => e.EntityType == "StoredQueryResult")
            .Select(e =>
                new StoredQueryResultInfo
                {
                    Name = e.EntityType,
                    Columns = CreateColumnInfo(e.CslOutputSchema),
                    Description = e.DocString,
                    Folder = e.Folder
                }
            ).ToImmutableList();
    }

    #nullable disable
    public class DatabaseNamesResult
    {
        public string DatabaseName;
        public string PrettyName;
    }

    public class LoadGraphModelSnapshotsResult
    {
        public string ModelName;
        public string Snapshots;
    }
    #nullable restore
}
