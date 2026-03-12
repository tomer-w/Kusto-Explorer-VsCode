// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Vscode;

namespace Tests.Features;

[TestClass]
public class ConnectionManagerTests
{
    #region GetOrAddConnection Tests

    [TestMethod]
    public void GetOrAddConnection_SimpleClusterUrl_ReturnsConnection()
    {
        var manager = new ConnectionManager();

        var connection = manager.GetOrAddConnection("https://mycluster.kusto.windows.net");

        Assert.IsNotNull(connection);
        Assert.AreEqual("mycluster.kusto.windows.net", connection.Cluster);
    }

    [TestMethod]
    public void GetOrAddConnection_ClusterUrlWithDatabase_ReturnsConnectionWithDatabase()
    {
        var manager = new ConnectionManager();

        var connection = manager.GetOrAddConnection("https://mycluster.kusto.windows.net/mydb");

        Assert.IsNotNull(connection);
        Assert.AreEqual("mycluster.kusto.windows.net", connection.Cluster);
        Assert.AreEqual("mydb", connection.Database);
    }

    [TestMethod]
    public void GetOrAddConnection_ConnectionString_ReturnsConnection()
    {
        var manager = new ConnectionManager();

        var connection = manager.GetOrAddConnection("Data Source=https://mycluster.kusto.windows.net;Initial Catalog=mydb");

        Assert.IsNotNull(connection);
        Assert.AreEqual("mycluster.kusto.windows.net", connection.Cluster);
        Assert.AreEqual("mydb", connection.Database);
    }

    [TestMethod]
    public void GetOrAddConnection_SameConnectionString_ReturnsSameConnection()
    {
        var manager = new ConnectionManager();
        var connectionString = "https://mycluster.kusto.windows.net";

        var connection1 = manager.GetOrAddConnection(connectionString);
        var connection2 = manager.GetOrAddConnection(connectionString);

        Assert.AreSame(connection1, connection2);
    }

    #endregion

    #region TryGetConnection Tests

    [TestMethod]
    public void TryGetConnection_AfterAdd_ReturnsTrue()
    {
        var manager = new ConnectionManager();
        manager.GetOrAddConnection("https://mycluster.kusto.windows.net");

        var found = manager.TryGetConnection("mycluster.kusto.windows.net", out var connection);

        Assert.IsTrue(found);
        Assert.IsNotNull(connection);
        Assert.AreEqual("mycluster.kusto.windows.net", connection.Cluster);
    }

    [TestMethod]
    public void TryGetConnection_ShortName_ReturnsTrue()
    {
        var manager = new ConnectionManager();
        manager.GetOrAddConnection("https://mycluster.kusto.windows.net");

        // Should find by short name too
        var found = manager.TryGetConnection("mycluster", out var connection);

        Assert.IsTrue(found);
        Assert.IsNotNull(connection);
    }

    [TestMethod]
    public void TryGetConnection_NotAdded_ReturnsFalse()
    {
        var manager = new ConnectionManager();

        var found = manager.TryGetConnection("nonexistent.kusto.windows.net", out var connection);

        Assert.IsFalse(found);
        Assert.IsNull(connection);
    }

    #endregion

    #region IConnection.WithCluster Tests

    [TestMethod]
    public void WithCluster_ReturnsNewConnectionWithDifferentCluster()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net/mydb");

        var newConnection = connection.WithCluster("cluster2");

        Assert.AreNotSame(connection, newConnection);
        Assert.AreEqual("cluster2.kusto.windows.net", newConnection.Cluster);
    }

    [TestMethod]
    public void WithCluster_FullHostName_ReturnsConnectionWithFullHostName()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net");

        var newConnection = connection.WithCluster("cluster2.eastus.kusto.windows.net");

        Assert.AreEqual("cluster2.eastus.kusto.windows.net", newConnection.Cluster);
    }

    [TestMethod]
    public void WithCluster_OriginalConnectionUnchanged()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net");

        connection.WithCluster("cluster2");

        Assert.AreEqual("cluster1.kusto.windows.net", connection.Cluster);
    }

    #endregion

    #region IConnection.WithDatabase Tests

    [TestMethod]
    public void WithDatabase_ReturnsNewConnectionWithDifferentDatabase()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://mycluster.kusto.windows.net/db1");

        var newConnection = connection.WithDatabase("db2");

        Assert.AreNotSame(connection, newConnection);
        Assert.AreEqual("db2", newConnection.Database);
        Assert.AreEqual("mycluster.kusto.windows.net", newConnection.Cluster);
    }

    [TestMethod]
    public void WithDatabase_OriginalConnectionUnchanged()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://mycluster.kusto.windows.net/db1");

        connection.WithDatabase("db2");

        Assert.AreEqual("db1", connection.Database);
    }

    [TestMethod]
    public void WithDatabase_NoOriginalDatabase_SetsDatabase()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://mycluster.kusto.windows.net");

        var newConnection = connection.WithDatabase("mydb");

        Assert.AreEqual("mydb", newConnection.Database);
    }

    #endregion

    #region IConnection.WithClusterAndDatabase Tests

    [TestMethod]
    public void WithClusterAndDatabase_ReturnsBothChanged()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net/db1");

        var newConnection = connection.WithClusterAndDatabase("cluster2", "db2");

        Assert.AreEqual("cluster2.kusto.windows.net", newConnection.Cluster);
        Assert.AreEqual("db2", newConnection.Database);
    }

    [TestMethod]
    public void WithClusterAndDatabase_NullDatabase_OnlyChangesCluster()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net/db1");

        var newConnection = connection.WithClusterAndDatabase("cluster2", null);

        Assert.AreEqual("cluster2.kusto.windows.net", newConnection.Cluster);
        // Database should be reset to the default for the new cluster connection
    }

    [TestMethod]
    public void WithClusterAndDatabase_OriginalConnectionUnchanged()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net/db1");

        connection.WithClusterAndDatabase("cluster2", "db2");

        Assert.AreEqual("cluster1.kusto.windows.net", connection.Cluster);
        Assert.AreEqual("db1", connection.Database);
    }

    #endregion

    #region IConnectionManager.TryGetConnection with Database Tests

    [TestMethod]
    public void TryGetConnection_WithDatabase_ReturnsConnectionWithDatabase()
    {
        var manager = new ConnectionManager();
        manager.GetOrAddConnection("https://mycluster.kusto.windows.net");

        // Use interface to access default implementation
        IConnectionManager connectionManager = manager;
        var found = connectionManager.TryGetConnection("mycluster", "mydb", out var connection);

        Assert.IsTrue(found);
        Assert.IsNotNull(connection);
        Assert.AreEqual("mydb", connection.Database);
    }

    [TestMethod]
    public void TryGetConnection_WithContextCluster_ReturnsConnectionDerivedFromContext()
    {
        var manager = new ConnectionManager();
        manager.GetOrAddConnection("https://cluster1.kusto.windows.net");

        // Use interface to access default implementation
        // Get cluster2 connection using cluster1 as context (inherits auth settings)
        IConnectionManager connectionManager = manager;
        var found = connectionManager.TryGetConnection("cluster2", "mydb", "cluster1.kusto.windows.net", out var connection);

        Assert.IsTrue(found);
        Assert.IsNotNull(connection);
        Assert.AreEqual("cluster2.kusto.windows.net", connection.Cluster);
        Assert.AreEqual("mydb", connection.Database);
    }

    #endregion

    #region Connection Chaining Tests

    [TestMethod]
    public void ConnectionChaining_MultipleWithCalls_ProducesCorrectResult()
    {
        var manager = new ConnectionManager();
        var connection = manager.GetOrAddConnection("https://cluster1.kusto.windows.net/db1");

        var newConnection = connection
            .WithCluster("cluster2")
            .WithDatabase("db2")
            .WithDatabase("db3");

        Assert.AreEqual("cluster2.kusto.windows.net", newConnection.Cluster);
        Assert.AreEqual("db3", newConnection.Database);
    }

    #endregion
}
