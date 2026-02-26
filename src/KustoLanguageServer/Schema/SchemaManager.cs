using System.Collections.Immutable;

namespace Kusto.Lsp;

/// <summary>
/// A cached schema source.
/// </summary>
public class SchemaManager : ISchemaManager
{
    private readonly ISchemaSource _source;
    private readonly ILogger? _logger;
    private TaskQueue _schemaQueue = new();

    private class ClusterData
    {
        public required ClusterInfo Info;

        public ImmutableDictionary<string, DatabaseInfo?> DatabaseInfoCache =
            ImmutableDictionary<string, DatabaseInfo?>.Empty;
    }

    private ImmutableDictionary<string, ClusterData> _clusterDataCache =
        ImmutableDictionary<string, ClusterData>.Empty;


    public SchemaManager(ISchemaSource source, ILogger? logger)
    {
        _source = source;
        _logger = logger;
    }

    public Task RefreshAsync(string clusterName, string? databaseName, CancellationToken cancellationToken)
    {
        // just remove from cache and next request will refresh from source.
        if (databaseName == null)
        {
            ImmutableInterlocked.TryRemove(ref _clusterDataCache, clusterName, out _);
        }
        else if (_clusterDataCache.TryGetValue(clusterName, out var clusterData))
        {
            ImmutableInterlocked.TryRemove(ref clusterData.DatabaseInfoCache, databaseName, out _);
        }

        return Task.CompletedTask;
    }

    private async Task<ClusterData?> GetClusterDataAsync(string clusterName, string? contextCluster, CancellationToken cancellationToken)
    {
        if (!_clusterDataCache.TryGetValue(clusterName, out var clusterData))
        {
            // serialize actual schema reading
            await _schemaQueue.Run(cancellationToken, async (useThisCancellationToken) =>
            {
                if (!_clusterDataCache.TryGetValue(clusterName, out clusterData))
                {
                    var info = await _source.GetClusterInfoAsync(clusterName, contextCluster, useThisCancellationToken).ConfigureAwait(false);
                    if (info != null)
                    {
                        _logger?.Log($"SchemaManager: adding cluster {clusterName} info to cache");

                        clusterData = ImmutableInterlocked.AddOrUpdate(
                            ref _clusterDataCache,
                            clusterName,
                            new ClusterData { Info = info },
                            (key, prev) =>
                            {
                                prev.Info = info;
                                return prev;
                            });
                    }
                }
            });
        }

        return clusterData;
    }

    public async Task<ClusterInfo?> GetClusterInfoAsync(string clusterName, string? contextCluster, CancellationToken cancellationToken)
    {
        var clusterData = await GetClusterDataAsync(clusterName, contextCluster, cancellationToken).ConfigureAwait(false);
        return clusterData?.Info;
    }

    public async Task<DatabaseInfo?> GetDatabaseInfoAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
    {
        var clusterData = await GetClusterDataAsync(clusterName, contextCluster, cancellationToken).ConfigureAwait(false);
        if (clusterData != null)
        {
            if (!clusterData.DatabaseInfoCache.TryGetValue(databaseName, out var databaseInfo))
            {
                // serialize actual schema reading
                await _schemaQueue.Run(cancellationToken, async (useThisCancellationToken) =>
                {
                    if (!clusterData.DatabaseInfoCache.TryGetValue(databaseName, out databaseInfo))
                    {
                        databaseInfo = await _source.GetDatabaseInfoAsync(clusterName, databaseName, contextCluster, useThisCancellationToken).ConfigureAwait(false);

                        if (databaseInfo != null)
                        {
                            _logger?.Log($"SchemaManager: adding database: {databaseName} info to cache");
                        }
                        else
                        {
                            _logger?.Log($"SchemaManager: database: {databaseName} not found in schema source");
                        }

                        // even if databaseInfo is null, we want to cache that fact to avoid repeated calls to source for non-existent databases.
                        databaseInfo = ImmutableInterlocked.GetOrAdd(
                            ref clusterData.DatabaseInfoCache, 
                            databaseName, 
                            databaseInfo
                            );
                    }
                });
            }

            return databaseInfo;
        }

        return null;
    }

    public async Task<ImmutableList<EntityGroupInfo>> GetEntityGroupInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.EntityGroups
                : dbInfo.EntityGroups.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<EntityGroupInfo>.Empty;
    }

    public async Task<ImmutableList<ExternalTableInfo>> GetExternalTableInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.ExternalTables
                : dbInfo.ExternalTables.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<ExternalTableInfo>.Empty;
    }

    public async Task<ImmutableList<FunctionInfo>> GetFunctionInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.Functions
                : dbInfo.Functions.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<FunctionInfo>.Empty;
    }

    public async Task<ImmutableList<GraphModelInfo>> GetGraphModelInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.GraphModels
                : dbInfo.GraphModels.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<GraphModelInfo>.Empty;
    }

    public async Task<ImmutableList<MaterializedViewInfo>> GetMaterializedViewInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.MaterializedViews
                : dbInfo.MaterializedViews.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<MaterializedViewInfo>.Empty;
    }

    public async Task<ImmutableList<StoredQueryResultInfo>> GetStoredQueryResultInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.StoredQueryResults
                : dbInfo.StoredQueryResults.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<StoredQueryResultInfo>.Empty;
    }

    public async Task<ImmutableList<TableInfo>> GetTableInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
    {
        var dbInfo = await GetDatabaseInfoAsync(clusterName, databaseName, clusterName, cancellationToken).ConfigureAwait(false);
        if (dbInfo != null)
        {
            return entityName == null
                ? dbInfo.Tables
                : dbInfo.Tables.Where(eg => eg.Name == entityName).ToImmutableList();
        }
        return ImmutableList<TableInfo>.Empty;
    }

    public Task<ExternalTableInfoEx?> GetExternalTableInfoExAsync(string clusterName, string databaseName, string name, CancellationToken cancellationToken)
    {
        return _source.GetExternalTableInfoExAsync(clusterName, databaseName, name, cancellationToken);
    }
}
