// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using Kusto.Vscode;

namespace Tests.Features;

[TestClass]
public class SchemaManagerTests
{
    private const string TestCluster = "testcluster.kusto.windows.net";
    private const string TestDatabase = "testdb";
    private static readonly TimeSpan TestRefreshDelay = TimeSpan.FromMilliseconds(50); // Short delay for tests

    #region GetClusterInfoAsync Tests

    [TestMethod]
    public async Task GetClusterInfoAsync_NotInStorage_LoadsFromSource()
    {
        var expectedInfo = CreateClusterInfo("db1", "db2");
        var source = new TestSchemaSource { ClusterInfo = expectedInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        var result = await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.HasCount(2, result.Databases);
        Assert.IsTrue(source.GetClusterInfoCalled);
    }

    [TestMethod]
    public async Task GetClusterInfoAsync_NotInStorage_StoresInStorage()
    {
        var expectedInfo = CreateClusterInfo("db1", "db2");
        var source = new TestSchemaSource { ClusterInfo = expectedInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        // Verify it was stored
        var storedKey = $"cluster_info: {TestCluster}";
        Assert.IsTrue(storage.StoredValues.ContainsKey(storedKey));
    }

    [TestMethod]
    public async Task GetClusterInfoAsync_InStorage_ReturnsFromStorage()
    {
        var storedInfo = CreateClusterInfo("db1", "db2");
        var sourceInfo = CreateClusterInfo("db3", "db4"); // Different data
        var source = new TestSchemaSource { ClusterInfo = sourceInfo };
        var storage = new TestStorage();
        storage.StoredValues[$"cluster_info: {TestCluster}"] = storedInfo;

        var schemaManager = new SchemaManager(source, storage, logger: null);

        var result = await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        // Should return storage data immediately
        Assert.IsNotNull(result);
        Assert.HasCount(2, result.Databases);
        Assert.AreEqual("db1", result.Databases[0].Name);
    }

    [TestMethod]
    public async Task GetClusterInfoAsync_InStorage_QueuesBackgroundRefresh()
    {
        var storedInfo = CreateClusterInfo("db1");
        var sourceInfo = CreateClusterInfo("db1", "db2");
        var source = new TestSchemaSource { ClusterInfo = sourceInfo };
        var storage = new TestStorage();
        storage.StoredValues[$"cluster_info: {TestCluster}"] = storedInfo;

        var schemaManager = new SchemaManager(source, storage, logger: null, refreshDelay: TestRefreshDelay);

        var refreshedCluster = string.Empty;
        var refreshFired = new ManualResetEventSlim(false);
        schemaManager.ClusterRefreshed += (cluster) =>
        {
            refreshedCluster = cluster;
            refreshFired.Set();
        };

        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        // Wait for background refresh (with timeout)
        Assert.IsTrue(refreshFired.Wait(TimeSpan.FromSeconds(5)), "ClusterRefreshed event should fire");
        Assert.AreEqual(TestCluster, refreshedCluster);
    }

    [TestMethod]
    public async Task GetClusterInfoAsync_CalledTwice_ReturnsCachedValue()
    {
        var expectedInfo = CreateClusterInfo("db1");
        var source = new TestSchemaSource { ClusterInfo = expectedInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);
        source.GetClusterInfoCallCount = 0; // Reset counter

        var result = await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.AreEqual(0, source.GetClusterInfoCallCount); // Should not call source again
    }

    [TestMethod]
    public async Task GetClusterInfoAsync_SourceReturnsNull_ReturnsNull()
    {
        var source = new TestSchemaSource { ClusterInfo = null };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        var result = await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        Assert.IsNull(result);
    }

    #endregion

    #region GetDatabaseInfoAsync Tests

    [TestMethod]
    public async Task GetDatabaseInfoAsync_NotInStorage_LoadsFromSource()
    {
        var expectedInfo = CreateDatabaseInfo(TestDatabase, "Table1", "Table2");
        var source = new TestSchemaSource { DatabaseInfo = expectedInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        var result = await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.AreEqual(TestDatabase, result.Name);
        Assert.HasCount(2, result.Tables);
        Assert.IsTrue(source.GetDatabaseInfoCalled);
    }

    [TestMethod]
    public async Task GetDatabaseInfoAsync_NotInStorage_StoresInStorage()
    {
        var expectedInfo = CreateDatabaseInfo(TestDatabase, "Table1");
        var source = new TestSchemaSource { DatabaseInfo = expectedInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        var storedKey = $"database_info: {TestCluster};{TestDatabase}";
        Assert.IsTrue(storage.StoredValues.ContainsKey(storedKey));
    }

    [TestMethod]
    public async Task GetDatabaseInfoAsync_InStorage_ReturnsFromStorage()
    {
        var storedInfo = CreateDatabaseInfo(TestDatabase, "StoredTable");
        var sourceInfo = CreateDatabaseInfo(TestDatabase, "SourceTable");
        var source = new TestSchemaSource { DatabaseInfo = sourceInfo };
        var storage = new TestStorage();
        storage.StoredValues[$"database_info: {TestCluster};{TestDatabase}"] = storedInfo;

        var schemaManager = new SchemaManager(source, storage, logger: null);

        var result = await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.AreEqual("StoredTable", result.Tables[0].Name);
    }

    [TestMethod]
    public async Task GetDatabaseInfoAsync_InStorage_QueuesBackgroundRefresh()
    {
        var storedInfo = CreateDatabaseInfo(TestDatabase, "Table1");
        var sourceInfo = CreateDatabaseInfo(TestDatabase, "Table1", "Table2");
        var source = new TestSchemaSource { DatabaseInfo = sourceInfo };
        var storage = new TestStorage();
        storage.StoredValues[$"database_info: {TestCluster};{TestDatabase}"] = storedInfo;

        var schemaManager = new SchemaManager(source, storage, logger: null, refreshDelay: TestRefreshDelay);

        var refreshedCluster = string.Empty;
        var refreshedDatabase = string.Empty;
        var refreshFired = new ManualResetEventSlim(false);
        schemaManager.DatabaseRefreshed += (cluster, database) =>
        {
            refreshedCluster = cluster;
            refreshedDatabase = database;
            refreshFired.Set();
        };

        await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        Assert.IsTrue(refreshFired.Wait(TimeSpan.FromSeconds(5)), "DatabaseRefreshed event should fire");
        Assert.AreEqual(TestCluster, refreshedCluster);
        Assert.AreEqual(TestDatabase, refreshedDatabase);
    }

    [TestMethod]
    public async Task GetDatabaseInfoAsync_CalledTwice_ReturnsCachedValue()
    {
        var expectedInfo = CreateDatabaseInfo(TestDatabase, "Table1");
        var source = new TestSchemaSource { DatabaseInfo = expectedInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);
        source.GetDatabaseInfoCallCount = 0;

        var result = await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        Assert.IsNotNull(result);
        Assert.AreEqual(0, source.GetDatabaseInfoCallCount);
    }

    [TestMethod]
    public async Task GetDatabaseInfoAsync_SourceReturnsNull_ReturnsNull()
    {
        var source = new TestSchemaSource { DatabaseInfo = null };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        var result = await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        Assert.IsNull(result);
    }

    #endregion

    #region ClearCachedClusterAsync Tests

    [TestMethod]
    public async Task ClearCachedClusterAsync_RemovesFromStorage()
    {
        var clusterInfo = CreateClusterInfo("db1");
        var source = new TestSchemaSource { ClusterInfo = clusterInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        // First load to cache
        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);

        // Clear cache
        await schemaManager.ClearCachedClusterAsync(TestCluster, CancellationToken.None);

        // Storage should have null value
        var storedKey = $"cluster_info: {TestCluster}";
        Assert.Contains(storedKey, storage.ClearedKeys);
    }

    [TestMethod]
    public async Task ClearCachedClusterAsync_NextRequestLoadsFromSource()
    {
        var clusterInfo = CreateClusterInfo("db1");
        var source = new TestSchemaSource { ClusterInfo = clusterInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        // First load
        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);
        source.GetClusterInfoCallCount = 0;

        // Clear cache
        await schemaManager.ClearCachedClusterAsync(TestCluster, CancellationToken.None);

        // Next request should load from source
        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);
        Assert.AreEqual(1, source.GetClusterInfoCallCount);
    }

    [TestMethod]
    public async Task ClearCachedClusterAsync_AlsoClearsDatabases()
    {
        var clusterInfo = CreateClusterInfo("db1");
        var databaseInfo = CreateDatabaseInfo("db1", "Table1");
        var source = new TestSchemaSource { ClusterInfo = clusterInfo, DatabaseInfo = databaseInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        // Load cluster and database
        await schemaManager.GetClusterInfoAsync(TestCluster, null, CancellationToken.None);
        await schemaManager.GetDatabaseInfoAsync(TestCluster, "db1", null, CancellationToken.None);

        // Clear cluster cache (should also clear database)
        await schemaManager.ClearCachedClusterAsync(TestCluster, CancellationToken.None);

        // Database key should be cleared
        var databaseKey = $"database_info: {TestCluster};db1";
        Assert.Contains(databaseKey, storage.ClearedKeys);
    }

    #endregion

    #region ClearCachedDatabaseAsync Tests

    [TestMethod]
    public async Task ClearCachedDatabaseAsync_RemovesFromStorage()
    {
        var databaseInfo = CreateDatabaseInfo(TestDatabase, "Table1");
        var source = new TestSchemaSource { DatabaseInfo = databaseInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        // First load
        await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);

        // Clear cache
        await schemaManager.ClearCachedDatabaseAsync(TestCluster, TestDatabase, CancellationToken.None);

        var storedKey = $"database_info: {TestCluster};{TestDatabase}";
        Assert.Contains(storedKey, storage.ClearedKeys);
    }

    [TestMethod]
    public async Task ClearCachedDatabaseAsync_NextRequestLoadsFromSource()
    {
        var databaseInfo = CreateDatabaseInfo(TestDatabase, "Table1");
        var source = new TestSchemaSource { DatabaseInfo = databaseInfo };
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        // First load
        await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);
        source.GetDatabaseInfoCallCount = 0;

        // Clear cache
        await schemaManager.ClearCachedDatabaseAsync(TestCluster, TestDatabase, CancellationToken.None);

        // Next request should load from source
        await schemaManager.GetDatabaseInfoAsync(TestCluster, TestDatabase, null, CancellationToken.None);
        Assert.AreEqual(1, source.GetDatabaseInfoCallCount);
    }

    [TestMethod]
    public async Task ClearCachedDatabaseAsync_DoesNotAffectOtherDatabases()
    {
        var databaseInfo1 = CreateDatabaseInfo("db1", "Table1");
        var databaseInfo2 = CreateDatabaseInfo("db2", "Table2");
        var source = new TestSchemaSource();
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        // Load both databases
        source.DatabaseInfo = databaseInfo1;
        await schemaManager.GetDatabaseInfoAsync(TestCluster, "db1", null, CancellationToken.None);
        source.DatabaseInfo = databaseInfo2;
        await schemaManager.GetDatabaseInfoAsync(TestCluster, "db2", null, CancellationToken.None);

        // Clear only db1
        await schemaManager.ClearCachedDatabaseAsync(TestCluster, "db1", CancellationToken.None);

        // db2 should still be cached
        source.GetDatabaseInfoCallCount = 0;
        var result = await schemaManager.GetDatabaseInfoAsync(TestCluster, "db2", null, CancellationToken.None);
        Assert.IsNotNull(result);
        Assert.AreEqual(0, source.GetDatabaseInfoCallCount); // Should use cache
    }

    #endregion

    #region Multiple Clusters Tests

    [TestMethod]
    public async Task GetClusterInfoAsync_MultipleClusters_CachedSeparately()
    {
        var clusterInfo1 = CreateClusterInfo("db1");
        var clusterInfo2 = CreateClusterInfo("db2", "db3");
        var source = new TestSchemaSource();
        var storage = new TestStorage();
        var schemaManager = new SchemaManager(source, storage, logger: null);

        source.ClusterInfo = clusterInfo1;
        var result1 = await schemaManager.GetClusterInfoAsync("cluster1", null, CancellationToken.None);

        source.ClusterInfo = clusterInfo2;
        var result2 = await schemaManager.GetClusterInfoAsync("cluster2", null, CancellationToken.None);

        Assert.HasCount(1, result1!.Databases);
        Assert.HasCount(2, result2!.Databases);
    }

    #endregion

    #region Helper Methods

    private static ClusterInfo CreateClusterInfo(params string[] databaseNames)
    {
        return new ClusterInfo
        {
            Databases = databaseNames.Select(n => new DatabaseName { Name = n, AlternateName = n }).ToImmutableList()
        };
    }

    private static DatabaseInfo CreateDatabaseInfo(string name, params string[] tableNames)
    {
        return new DatabaseInfo
        {
            Name = name,
            Tables = tableNames.Select(t => new TableInfo { Name = t }).ToImmutableList()
        };
    }

    #endregion

    #region Test Implementations

    private class TestSchemaSource : ISchemaSource
    {
        public ClusterInfo? ClusterInfo { get; set; }
        public DatabaseInfo? DatabaseInfo { get; set; }

        public bool GetClusterInfoCalled => GetClusterInfoCallCount > 0;
        public int GetClusterInfoCallCount { get; set; }

        public bool GetDatabaseInfoCalled => GetDatabaseInfoCallCount > 0;
        public int GetDatabaseInfoCallCount { get; set; }

        public Task<ClusterInfo?> GetClusterInfoAsync(string clusterName, string? contextCluster, CancellationToken cancellationToken)
        {
            GetClusterInfoCallCount++;
            return Task.FromResult(ClusterInfo);
        }

        public Task<DatabaseInfo?> GetDatabaseInfoAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
        {
            GetDatabaseInfoCallCount++;
            return Task.FromResult(DatabaseInfo);
        }

        public Task<ImmutableList<TableInfo>> GetTableInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.Tables ?? ImmutableList<TableInfo>.Empty);
        }

        public Task<ImmutableList<ExternalTableInfo>> GetExternalTableInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.ExternalTables ?? ImmutableList<ExternalTableInfo>.Empty);
        }

        public Task<ImmutableList<MaterializedViewInfo>> GetMaterializedViewInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.MaterializedViews ?? ImmutableList<MaterializedViewInfo>.Empty);
        }

        public Task<ImmutableList<FunctionInfo>> GetFunctionInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.Functions ?? ImmutableList<FunctionInfo>.Empty);
        }

        public Task<ImmutableList<EntityGroupInfo>> GetEntityGroupInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.EntityGroups ?? ImmutableList<EntityGroupInfo>.Empty);
        }

        public Task<ImmutableList<GraphModelInfo>> GetGraphModelInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.GraphModels ?? ImmutableList<GraphModelInfo>.Empty);
        }

        public Task<ImmutableList<StoredQueryResultInfo>> GetStoredQueryResultInfosAsync(string clusterName, string databaseName, string? entityName, CancellationToken cancellationToken)
        {
            return Task.FromResult(DatabaseInfo?.StoredQueryResults ?? ImmutableList<StoredQueryResultInfo>.Empty);
        }

        public Task<ExternalTableInfoEx?> GetExternalTableInfoExAsync(string clusterName, string databaseName, string name, CancellationToken cancellationToken)
        {
            return Task.FromResult<ExternalTableInfoEx?>(null);
        }
    }

    private class TestStorage : IStorage
    {
        public Dictionary<string, object?> StoredValues { get; } = new();
        public HashSet<string> ClearedKeys { get; } = new();

        public Task<T?> GetValueAsync<T>(string key, CancellationToken cancellationToken = default)
        {
            if (StoredValues.TryGetValue(key, out var value))
            {
                return Task.FromResult((T?)value);
            }
            return Task.FromResult<T?>(default);
        }

        public Task SetValueAsync<T>(string key, T? value, CancellationToken cancellationToken = default)
        {
            if (value == null)
            {
                ClearedKeys.Add(key);
                StoredValues.Remove(key);
            }
            else
            {
                StoredValues[key] = value;
            }
            return Task.CompletedTask;
        }
    }

    #endregion
}
