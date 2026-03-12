// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language;
using Kusto.Language.Symbols;
using Kusto.Vscode;
using System.Collections.Immutable;

namespace Tests.Features;

[TestClass]
public sealed class DocumentManagerTests
{
    private static readonly Uri TestDocId = new Uri("inmemory://testdoc");
    private static readonly Uri TestDocId2 = new Uri("inmemory://testdoc2");

    #region AddDocument Tests

    [TestMethod]
    public void AddDocument_CreatesDocumentWithCorrectId()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        var found = documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsTrue(found);
        Assert.IsNotNull(document);
        Assert.AreEqual(TestDocId, document.Id);
    }

    [TestMethod]
    public void AddDocument_CreatesDocumentWithCorrectText()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual("print 1", document.Text);
    }

    [TestMethod]
    public void AddDocument_CreatesDocumentWithDefaultGlobals()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreSame(ClusterSymbol.Unknown, document.Globals.Cluster);
        Assert.AreSame(DatabaseSymbol.Unknown, document.Globals.Database);
    }

    [TestMethod]
    public void AddDocument_FiresDocumentAddedEvent()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        Uri? addedId = null;
        var eventFired = new ManualResetEventSlim(false);
        documentManager.DocumentAdded += (sender, id) =>
        {
            addedId = id;
            eventFired.Set();
        };

        documentManager.AddDocument(TestDocId, "print 1");

        Assert.IsTrue(eventFired.Wait(TimeSpan.FromSeconds(1)));
        Assert.AreEqual(TestDocId, addedId);
    }

    #endregion

    #region RemoveDocument Tests

    [TestMethod]
    public void RemoveDocument_DocumentNoLongerAccessible()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        documentManager.RemoveDocument(TestDocId);

        var found = documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsFalse(found);
        Assert.IsNull(document);
    }

    [TestMethod]
    public void RemoveDocument_FiresDocumentRemovedEvent()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        Uri? removedId = null;
        var eventFired = new ManualResetEventSlim(false);
        documentManager.DocumentRemoved += (sender, id) =>
        {
            removedId = id;
            eventFired.Set();
        };

        documentManager.AddDocument(TestDocId, "print 1");
        documentManager.RemoveDocument(TestDocId);

        Assert.IsTrue(eventFired.Wait(TimeSpan.FromSeconds(1)));
        Assert.AreEqual(TestDocId, removedId);
    }

    #endregion

    #region GetDocumentIds Tests

    [TestMethod]
    public void GetDocumentIds_ReturnsEmptyWhenNoDocuments()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        var ids = documentManager.GetDocumentIds();

        Assert.IsEmpty(ids);
    }

    [TestMethod]
    public void GetDocumentIds_ReturnsAllAddedDocuments()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        documentManager.AddDocument(TestDocId2, "print 2");

        var ids = documentManager.GetDocumentIds();

        Assert.HasCount(2, ids);
        Assert.Contains(TestDocId, ids);
        Assert.Contains(TestDocId2, ids);
    }

    [TestMethod]
    public void GetDocumentIds_ExcludesRemovedDocuments()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        documentManager.AddDocument(TestDocId2, "print 2");
        documentManager.RemoveDocument(TestDocId);

        var ids = documentManager.GetDocumentIds();

        Assert.HasCount(1, ids);
        Assert.DoesNotContain(TestDocId, ids);
        Assert.Contains(TestDocId2, ids);
    }

    #endregion

    #region TryGetDocument Tests

    [TestMethod]
    public void TryGetDocument_ReturnsFalseForUnknownId()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        var found = documentManager.TryGetDocument(TestDocId, out var document);

        Assert.IsFalse(found);
        Assert.IsNull(document);
    }

    [TestMethod]
    public void TryGetDocument_ReturnsTrueForKnownId()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        var found = documentManager.TryGetDocument(TestDocId, out var document);

        Assert.IsTrue(found);
        Assert.IsNotNull(document);
    }

    #endregion

    #region UpdateTextAsync Tests

    [TestMethod]
    public async Task UpdateTextAsync_UpdatesDocumentText()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateTextAsync(TestDocId, "print 2");

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual("print 2", document.Text);
    }

    [TestMethod]
    public async Task UpdateTextAsync_PreservesDocumentId()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateTextAsync(TestDocId, "print 2");

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual(TestDocId, document.Id);
    }

    [TestMethod]
    public async Task UpdateTextAsync_FiresDocumentChangedEvent()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        Uri? changedId = null;
        var eventFired = new ManualResetEventSlim(false);
        documentManager.DocumentChanged += (sender, id) =>
        {
            changedId = id;
            eventFired.Set();
        };

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateTextAsync(TestDocId, "print 2");

        Assert.IsTrue(eventFired.Wait(TimeSpan.FromSeconds(1)));
        Assert.AreEqual(TestDocId, changedId);
    }

    [TestMethod]
    public async Task UpdateTextAsync_NoEventWhenTextUnchanged()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        var eventFired = false;
        documentManager.DocumentChanged += (sender, id) => eventFired = true;

        await documentManager.UpdateTextAsync(TestDocId, "print 1"); // Same text

        // Give a small delay to ensure event would have fired
        await Task.Delay(100);
        Assert.IsFalse(eventFired);
    }

    #endregion

    #region UpdateConnectionAsync Tests

    [TestMethod]
    public async Task UpdateConnectionAsync_SetsClusterName()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", null);

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual("mycluster", document.Globals.Cluster.Name);
    }

    [TestMethod]
    public async Task UpdateConnectionAsync_SetsDatabaseName()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", null);

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual("mydb", document.Globals.Database.Name);
    }

    [TestMethod]
    public async Task UpdateConnectionAsync_SetsServerKind()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", "ClusterManager");

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual("ClusterManager", document.Globals.ServerKind);
    }

    [TestMethod]
    public async Task UpdateConnectionAsync_DefaultsServerKindToEngine()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", null);

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual(ServerKinds.Engine, document.Globals.ServerKind);
    }

    [TestMethod]
    public async Task UpdateConnectionAsync_NullCluster_ResetsToUnknown()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        // First set a connection
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", null);

        // Then clear it
        await documentManager.UpdateConnectionAsync(TestDocId, null, null, null);

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreSame(ClusterSymbol.Unknown, document.Globals.Cluster);
        Assert.AreSame(DatabaseSymbol.Unknown, document.Globals.Database);
    }

    [TestMethod]
    public async Task UpdateConnectionAsync_ChangingConnection_UpdatesGlobals()
    {
        var globals = GlobalState.Default
            .WithClusterList(
                new ClusterSymbol("cluster1", new DatabaseSymbol("db1")),
                new ClusterSymbol("cluster2", new DatabaseSymbol("db2")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        // Set initial connection
        await documentManager.UpdateConnectionAsync(TestDocId, "cluster1", "db1", null);

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.AreEqual("cluster1", document!.Globals.Cluster.Name);
        Assert.AreEqual("db1", document.Globals.Database.Name);

        // Change to different connection
        await documentManager.UpdateConnectionAsync(TestDocId, "cluster2", "db2", null);

        documentManager.TryGetDocument(TestDocId, out document);
        Assert.AreEqual("cluster2", document!.Globals.Cluster.Name);
        Assert.AreEqual("db2", document.Globals.Database.Name);
    }

    [TestMethod]
    public async Task UpdateConnectionAsync_PreservesDocumentText()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", null);

        documentManager.TryGetDocument(TestDocId, out var document);
        Assert.IsNotNull(document);
        Assert.AreEqual("print 1", document.Text);
    }

    #endregion

    #region GetConnection Tests

    [TestMethod]
    public void GetConnection_ReturnsNullsForUnknownDocument()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        var connection = documentManager.GetConnection(TestDocId);

        Assert.IsNull(connection.Cluster);
        Assert.IsNull(connection.Database);
    }

    [TestMethod]
    public void GetConnection_ReturnsNullsBeforeConnectionSet()
    {
        var symbolManager = new TestSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");

        var connection = documentManager.GetConnection(TestDocId);

        Assert.IsNull(connection.Cluster);
        Assert.IsNull(connection.Database);
    }

    [TestMethod]
    public async Task GetConnection_ReturnsSetConnection()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster", "mydb", null);

        var connection = documentManager.GetConnection(TestDocId);

        Assert.AreEqual("mycluster", connection.Cluster);
        Assert.AreEqual("mydb", connection.Database);
    }

    #endregion

    #region RefreshReferencedSymbolsAsync Tests

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_RefreshesDefaultClusterAndDatabase()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster.kusto.windows.net",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TrackingSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        documentManager.AddDocument(TestDocId, "print 1");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster.kusto.windows.net", "mydb", null);

        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        Assert.HasCount(1, symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "mydb"), symbolManager.RefreshCalls);
    }

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_RefreshesDatabaseReferences()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster.kusto.windows.net",
                new DatabaseSymbol("mydb"),
                new DatabaseSymbol("otherdb")));

        var symbolManager = new TrackingSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        // Document with database('otherdb') reference
        documentManager.AddDocument(TestDocId, "database('otherdb').MyTable");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster.kusto.windows.net", "mydb", null);

        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        // Should refresh both the default database and the referenced database
        Assert.HasCount(2, symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "mydb"), symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "otherdb"), symbolManager.RefreshCalls);
    }

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_RefreshesClusterAndDatabaseReferences()
    {
        var globals = GlobalState.Default
            .WithClusterList(
                new ClusterSymbol("mycluster.kusto.windows.net", new DatabaseSymbol("mydb")),
                new ClusterSymbol("othercluster.kusto.windows.net", new DatabaseSymbol("otherdb")));

        var symbolManager = new TrackingSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        // Document with cluster('othercluster').database('otherdb') reference
        documentManager.AddDocument(TestDocId, "cluster('othercluster.kusto.windows.net').database('otherdb').MyTable");
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster.kusto.windows.net", "mydb", null);

        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        // Should refresh the default and the referenced cluster/database
        Assert.HasCount(2, symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "mydb"), symbolManager.RefreshCalls);
        Assert.Contains(("othercluster.kusto.windows.net", "otherdb"), symbolManager.RefreshCalls);
    }

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_NoConnectionSet_OnlyRefreshesReferencedDatabases()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("somecluster.kusto.windows.net",
                new DatabaseSymbol("somedb")));

        var symbolManager = new TrackingSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        // Document without connection but with explicit database reference
        documentManager.AddDocument(TestDocId, "cluster('somecluster.kusto.windows.net').database('somedb').MyTable");

        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        // Should refresh only the explicitly referenced database
        Assert.HasCount(1, symbolManager.RefreshCalls);
        Assert.Contains(("somecluster.kusto.windows.net", "somedb"), symbolManager.RefreshCalls);
    }

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_NoDuplicateRefreshCalls()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster.kusto.windows.net",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TrackingSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        // Document with duplicate database references
        documentManager.AddDocument(TestDocId, """
            database('mydb').Table1
            | union database('mydb').Table2
            """);
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster.kusto.windows.net", "mydb", null);

        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        // Should only refresh once despite multiple references
        Assert.HasCount(1, symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "mydb"), symbolManager.RefreshCalls);
    }

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_UnknownDocument_DoesNothing()
    {
        var symbolManager = new TrackingSymbolManager(GlobalState.Default);
        var documentManager = new DocumentManager(symbolManager);

        // RefreshReferencedSymbolsAsync on a document that was never added
        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        Assert.IsEmpty(symbolManager.RefreshCalls);
    }

    [TestMethod]
    public async Task RefreshReferencedSymbolsAsync_MultipleDatabaseReferences_RefreshesAll()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster.kusto.windows.net",
                new DatabaseSymbol("db1"),
                new DatabaseSymbol("db2"),
                new DatabaseSymbol("db3")));

        var symbolManager = new TrackingSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        // Document referencing multiple databases
        documentManager.AddDocument(TestDocId, """
            database('db2').TableA
            | union database('db3').TableB
            """);
        await documentManager.UpdateConnectionAsync(TestDocId, "mycluster.kusto.windows.net", "db1", null);

        await documentManager.RefreshReferencedSymbolsAsync(TestDocId, CancellationToken.None);

        // Should refresh all three databases
        Assert.HasCount(3, symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "db1"), symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "db2"), symbolManager.RefreshCalls);
        Assert.Contains(("mycluster.kusto.windows.net", "db3"), symbolManager.RefreshCalls);
    }

    #endregion

    #region Test Helper Classes

    class TestSymbolManager : ISymbolManager
    {
        public TestSymbolManager(GlobalState globals)
        {
            this.Globals = globals;
        }

        public GlobalState Globals { get; }

#pragma warning disable CS0067
        public event EventHandler<GlobalState>? GlobalsChanged;
#pragma warning restore CS0067

        public Task EnsureClustersAsync(ImmutableList<string> clusterNames, string? contextCluster, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task EnsureDatabaseAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task RefreshAsync(string clusterName, string? databaseName, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    /// <summary>
    /// A test symbol manager that tracks calls to RefreshAsync.
    /// </summary>
    class TrackingSymbolManager : ISymbolManager
    {
        public TrackingSymbolManager(GlobalState globals)
        {
            this.Globals = globals;
        }

        public GlobalState Globals { get; }

        public List<(string Cluster, string? Database)> RefreshCalls { get; } = [];

#pragma warning disable CS0067
        public event EventHandler<GlobalState>? GlobalsChanged;
#pragma warning restore CS0067

        public Task EnsureClustersAsync(ImmutableList<string> clusterNames, string? contextCluster, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task EnsureDatabaseAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task RefreshAsync(string clusterName, string? databaseName, CancellationToken cancellationToken)
        {
            RefreshCalls.Add((clusterName, databaseName));
            return Task.CompletedTask;
        }
    }

    #endregion
}