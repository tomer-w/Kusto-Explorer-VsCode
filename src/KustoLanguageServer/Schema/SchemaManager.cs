// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;

namespace Kusto.Lsp;

/// <summary>
/// A cached schema source.
/// </summary>
public class SchemaManager : ISchemaManager
{
    private readonly ISchemaSource _source;
    private readonly IDataManager _dataManager;
    private readonly ILogger? _logger;
    private TaskQueue _schemaQueue = new();

    private ImmutableDictionary<string, CachedCluster> _cachedClusters =
        ImmutableDictionary<string, CachedCluster>.Empty;

    private enum CacheState
    {
        /// <summary>
        /// The item is not in the manager's cache
        /// </summary>
        NotCached = 0,

        /// <summary>
        /// Cached item is from schema source
        /// </summary>
        SchemaSource,

        /// <summary>
        /// Cached item is from persistent data manager
        /// </summary>
        DataManager
    }

    private class CachedCluster
    {
        public required string Name { get; init; }
        public string? ContextCluster { get; init; }

        public CacheState State = CacheState.NotCached;
        public ClusterInfo? Info;

        public readonly LatestRequestQueue RefreshQueue = new LatestRequestQueue();
        public ImmutableDictionary<string, CachedDatabase> CachedDatabases =
            ImmutableDictionary<string, CachedDatabase>.Empty;
    }

    private class CachedDatabase
    {
        public required string Name { get; init; }

        public CacheState State;
        public DatabaseInfo? Info;

        public readonly LatestRequestQueue RefreshQueue = new LatestRequestQueue();
    }

    public SchemaManager(
        ISchemaSource source, 
        IDataManager dataManager, 
        ILogger? logger)
    {
        _source = source;
        _dataManager = dataManager;
        _logger = logger;
    }

    /// <summary>
    /// An event that fires when the cluster schema has been refreshed
    /// </summary>
    public event ClusterSchemaRefreshedHandler? ClusterRefreshed;

    /// <summary>
    /// An event that fire when the database schema has been refreshed
    /// </summary>
    public event DatabaseSchemaRefreshedHandler? DatabaseRefreshed;

    /// <summary>
    /// Determines the data manager key to user for cluster info
    /// </summary>
    private static string GetClusterDataKey(string clusterName) =>
        $"cluster_info: {clusterName}";

    /// <summary>
    /// Determines the data manager key to user for database info.
    /// </summary>
    private static string GetDatabaseDataKey(string clusterName, string databaseName) =>
        $"database_info: {clusterName};{databaseName}";

    /// <summary>
    /// Clears the cluster info (and related database info) from the schema cache.
    /// </summary>
    public async Task ClearCachedClusterAsync(string clusterName, CancellationToken cancellationToken)
    {
        if (_cachedClusters.TryGetValue(clusterName, out var cachedCluster))
        {
            // clear all related database infos
            foreach (var databaseName in cachedCluster.CachedDatabases.Keys)
            {
                await ClearCachedDatabaseAsync(clusterName, databaseName, cancellationToken).ConfigureAwait(false);
            }

            // remove from data manager first
            var key = GetClusterDataKey(cachedCluster.Name);
            await _dataManager.SetDataAsync<ClusterInfo>(key, null, cancellationToken).ConfigureAwait(false);

            // clear cached info
            cachedCluster.Info = null;
            cachedCluster.State = CacheState.NotCached;
        }
    }

    /// <summary>
    /// Clears the database info from the schema cache.
    /// </summary>
    public async Task ClearCachedDatabaseAsync(string clusterName, string databaseName, CancellationToken cancellationToken)
    {
        if (_cachedClusters.TryGetValue(clusterName, out var cachedCluster)
            && cachedCluster.CachedDatabases.TryGetValue(databaseName, out var cachedDatabase))
        {
            // remove from data manager first
            var key = GetDatabaseDataKey(cachedCluster.Name, cachedDatabase.Name);
            await _dataManager.SetDataAsync<DatabaseInfo>(key, null, cancellationToken).ConfigureAwait(false);

            // clear cached info
            cachedDatabase.Info = null;
            cachedDatabase.State = CacheState.NotCached;
        }
    }

    private CachedCluster GetCachedCluster(string clusterName)
    {
        if (!_cachedClusters.TryGetValue(clusterName, out var cachedCluster))
        {
            cachedCluster = ImmutableInterlocked.GetOrAdd(ref _cachedClusters, clusterName, _name => new CachedCluster { Name = _name });
        }
        return cachedCluster;
    }

    public async Task<ClusterInfo?> GetClusterInfoAsync(string clusterName, string? contextCluster, CancellationToken cancellationToken)
    {
        var cachedCluster = GetCachedCluster(clusterName);

        if (cachedCluster.Info == null 
            && cachedCluster.State == CacheState.NotCached)
        {
            var key = GetClusterDataKey(clusterName);
            var info = await _dataManager.GetDataAsync<ClusterInfo>(key, cancellationToken).ConfigureAwait(false);
            if (info != null)
            {
                cachedCluster.Info = info;
                cachedCluster.State = CacheState.DataManager;

                _logger?.Log($"SchemaManager: Loaded cluster {clusterName} data from persistent cache");

                _ = DelayRefreshClusterFromSourceAsync(cachedCluster, contextCluster, key, cancellationToken);
            }
            else
            {
                await LoadClusterFromSourceAsync(cachedCluster, contextCluster, key, cancellationToken).ConfigureAwait(false);
            }
        }

        return cachedCluster.Info;
    }

    private async Task DelayRefreshClusterFromSourceAsync(CachedCluster cachedCluster, string? contextCluster, string key, CancellationToken cancellationToken)
    {
        await cachedCluster.RefreshQueue.Run(async (useThisCancellationToken) =>
        {
            await Task.Delay(100);
            if (cachedCluster.State != CacheState.SchemaSource)
            {
                await LoadClusterFromSourceAsync(cachedCluster, contextCluster, key, cancellationToken).ConfigureAwait(false);
                this.ClusterRefreshed?.Invoke(cachedCluster.Name);
            }
        });
    }

    private async Task LoadClusterFromSourceAsync(CachedCluster cachedCluster, string? contextCluster, string clusterSchemaKey, CancellationToken cancellationToken)
    {
        if (cachedCluster.State == CacheState.SchemaSource)
            return;

        // serialize actual schema reading
        await _schemaQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            if (cachedCluster.State == CacheState.SchemaSource)
                return;

            var info = await _source.GetClusterInfoAsync(cachedCluster.Name, contextCluster, useThisCancellationToken).ConfigureAwait(false);
            cachedCluster.Info = info;
            cachedCluster.State = CacheState.SchemaSource;

            // save newly loaded info into data manager
            await _dataManager.SetDataAsync(clusterSchemaKey, info);

            if (info != null)
            {
                _logger?.Log($"SchemaManager: cluster info for {cachedCluster.Name} loaded from source.");
            }
            else
            {
                _logger?.Log($"SchemaManager: cluster info for {cachedCluster.Name} not found in source");
            }
        });
    }

    public async Task<DatabaseInfo?> GetDatabaseInfoAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
    {
        var cachedCluster = GetCachedCluster(clusterName);

        if (!cachedCluster.CachedDatabases.TryGetValue(databaseName, out var cachedDatabase))
        {
            cachedDatabase = ImmutableInterlocked.GetOrAdd(ref cachedCluster.CachedDatabases, databaseName, _name => new CachedDatabase { Name = _name });
        }

        if (cachedDatabase.Info == null 
            && cachedDatabase.State == CacheState.NotCached)
        {
            // try getting from client cache
            var key = GetDatabaseDataKey(clusterName, databaseName);
            var info = await _dataManager.GetDataAsync<DatabaseInfo>(key, cancellationToken).ConfigureAwait(false);
            if (info != null)
            {
                cachedDatabase.Info = info;
                cachedDatabase.State = CacheState.DataManager;

                _logger?.Log($"SchemaManager: loaded database {databaseName} from persistent cache");

                // refresh from source on delay
                _ = DelayRefreshDatabaseFromSourceAsync(cachedCluster, contextCluster, cachedDatabase, key, cancellationToken);
            }
            else
            {
                _logger?.Log($"SchemaManager: database {databaseName} not found in persistent cached, attempting to load data from source");

                // load from source now
                await LoadDatabaseFromSourceAsync(cachedCluster, contextCluster, cachedDatabase, key, cancellationToken).ConfigureAwait(false);
            }
        }

        return cachedDatabase.Info;
    }

    private async Task DelayRefreshDatabaseFromSourceAsync(
        CachedCluster cachedCluster, string? contextCluster, 
        CachedDatabase cachedDatabase, string key, 
        CancellationToken cancellationToken)
    {
        await cachedDatabase.RefreshQueue.Run(
            cancellationToken,
            async (useThisCancellationToken) =>
            {
                await Task.Delay(100);
                await LoadDatabaseFromSourceAsync(cachedCluster, contextCluster, cachedDatabase, key, useThisCancellationToken);
                this.DatabaseRefreshed?.Invoke(cachedCluster.Name, cachedDatabase.Name);
            });
    }

    private async Task LoadDatabaseFromSourceAsync(
        CachedCluster cachedCluster, string? contextCluster,
        CachedDatabase cachedDatabase, string key, 
        CancellationToken cancellationToken)
    {
        if (cachedDatabase.State == CacheState.SchemaSource)
        {
            _logger?.Log($"SchemaManager: database {cachedDatabase.Name} already loaded from source?");
            return;
        }

        // serialize actual schema reading to avoid over parallelizing.
        await _schemaQueue.Run(
            cancellationToken,
            async (useThisCancellationToken) =>
            {
                if (cachedDatabase.State == CacheState.SchemaSource)
                {
                    _logger?.Log($"SchemaManager: database {cachedDatabase.Name} already loaded from source?");
                    return;
                }

                DatabaseInfo? info = null;
                try
                {
                    info = await _source.GetDatabaseInfoAsync(cachedCluster.Name, cachedDatabase.Name, contextCluster, useThisCancellationToken).ConfigureAwait(false);
                }
                catch
                {
                    _logger?.Log($"SchemaManager: loading database {cachedDatabase.Name} from source failed");
                }

                cachedDatabase.Info = info;
                cachedDatabase.State = CacheState.SchemaSource;

                // save newly loaded info into persistent cache
                await _dataManager.SetDataAsync(key, info).ConfigureAwait(false);

                if (info != null)
                {
                    _logger?.Log($"SchemaManager: database info for {cachedDatabase.Name} loaded from source.");
                }
                else
                {
                    _logger?.Log($"SchemaManager: database info for {cachedDatabase.Name} not found in source.");
                }
            });
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
