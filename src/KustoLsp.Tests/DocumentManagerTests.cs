using Kusto.Language;
using Kusto.Language.Symbols;
using Kusto.Lsp;
using System.Collections.Immutable;

namespace KustoLspTests;

[TestClass]
public sealed class DocumentManagerTests
{
    [TestMethod]
    public async Task TestUpdateConnection()
    {
        var globals = GlobalState.Default
            .WithClusterList(new ClusterSymbol("mycluster",
                new DatabaseSymbol("mydb")));

        var symbolManager = new TestSymbolManager(globals);
        var documentManager = new DocumentManager(symbolManager);

        var id = new Uri("inmemory://doc1");

        documentManager.AddDocument(id, "");

        {
            // added document has no connection 
            documentManager.TryGetDocument(id, out var doc);
            Assert.IsNotNull(doc);
            Assert.AreSame(ClusterSymbol.Unknown, doc.Globals.Cluster);
            Assert.AreSame(DatabaseSymbol.Unknown, doc.Globals.Database);
        }

        // update connection and wait for it to complete (may load symbols, etc)
        await documentManager.UpdateConnectionAsync(id, "mycluster", "mydb", null);

        {
            // document now has globals that reference the cluster and database
            documentManager.TryGetDocument(id, out var doc);
            Assert.IsNotNull(doc);
            Assert.AreNotSame(ClusterSymbol.Unknown, doc.Globals.Cluster);
            Assert.AreEqual("mycluster", doc.Globals.Cluster.Name);
            Assert.AreNotSame(DatabaseSymbol.Unknown, doc.Globals.Database);
            Assert.AreEqual("mydb", doc.Globals.Database.Name);
        }
    }

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

        public Task EnsureClustersAsync(ImmutableList<string> clusterNames, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task EnsureSymbolsAsync(string clusterName, string? databaseName, string? contextCluster, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public Task AddReferencedSymbolsAsync(IDocument document, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}