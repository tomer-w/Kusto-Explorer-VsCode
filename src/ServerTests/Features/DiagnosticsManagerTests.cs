// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using Kusto.Language;
using Kusto.Language.Symbols;
using Kusto.Vscode;

namespace Tests.Features;

[TestClass]
public sealed class DiagnosticsManagerTests
{
    private static readonly Uri TestDocId = new Uri("inmemory://testdoc");

    private static DocumentManager CreateDocumentManager(GlobalState? globals = null)
    {
        var symbolManager = new TestSymbolManager(globals ?? GlobalState.Default);
        return new DocumentManager(symbolManager);
    }

    [TestMethod]
    public async Task AddDocument_FiresDiagnosticsUpdated()
    {
        var docManager = CreateDocumentManager();
        var diagnosticsManager = new DiagnosticsManager(docManager);

        var received = new TaskCompletionSource<DiagnosticInfo>();
        diagnosticsManager.DiagnosticsUpdated += (s, info) => received.TrySetResult(info);

        docManager.AddDocument(TestDocId, "print 1");

        var result = await received.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.AreEqual(TestDocId, result.Id);
        Assert.AreEqual("print 1", result.Text);
    }

    [TestMethod]
    public async Task DocumentChanged_FiresDiagnosticsUpdated()
    {
        var docManager = CreateDocumentManager();
        var diagnosticsManager = new DiagnosticsManager(docManager);

        var firstReceived = new TaskCompletionSource<DiagnosticInfo>();
        var secondReceived = new TaskCompletionSource<DiagnosticInfo>();
        var count = 0;

        diagnosticsManager.DiagnosticsUpdated += (s, info) =>
        {
            if (Interlocked.Increment(ref count) == 1)
                firstReceived.TrySetResult(info);
            else
                secondReceived.TrySetResult(info);
        };

        docManager.AddDocument(TestDocId, "print 1");
        await firstReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));

        // Change the document
        await docManager.UpdateTextAsync(TestDocId, "print 2");

        var result = await secondReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.AreEqual("print 2", result.Text);
    }

    [TestMethod]
    public async Task ValidQuery_ProducesNoDiagnostics()
    {
        var docManager = CreateDocumentManager();
        var diagnosticsManager = new DiagnosticsManager(docManager);

        var received = new TaskCompletionSource<DiagnosticInfo>();
        diagnosticsManager.DiagnosticsUpdated += (s, info) => received.TrySetResult(info);

        docManager.AddDocument(TestDocId, "print 1");

        var result = await received.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.AreEqual(0, result.Diagnostics.Count);
    }

    [TestMethod]
    public async Task InvalidQuery_ProducesDiagnostics()
    {
        // Create globals with a known table so the query can reference something valid,
        // but use invalid syntax to get diagnostics
        var docManager = CreateDocumentManager();
        var diagnosticsManager = new DiagnosticsManager(docManager);

        var received = new TaskCompletionSource<DiagnosticInfo>();
        diagnosticsManager.DiagnosticsUpdated += (s, info) => received.TrySetResult(info);

        // This is invalid KQL — "where" needs a boolean expression
        docManager.AddDocument(TestDocId, "print x = 1 | where");

        var result = await received.Task.WaitAsync(TimeSpan.FromSeconds(5));
        Assert.IsTrue(result.Diagnostics.Count > 0, "Expected diagnostics for invalid query");
    }

    [TestMethod]
    public async Task MultipleDocuments_EachGetOwnDiagnostics()
    {
        var docManager = CreateDocumentManager();
        var diagnosticsManager = new DiagnosticsManager(docManager);

        var doc1Id = new Uri("inmemory://doc1");
        var doc2Id = new Uri("inmemory://doc2");

        var results = new List<DiagnosticInfo>();
        var bothReceived = new TaskCompletionSource<bool>();

        diagnosticsManager.DiagnosticsUpdated += (s, info) =>
        {
            lock (results)
            {
                results.Add(info);
                if (results.Count >= 2)
                    bothReceived.TrySetResult(true);
            }
        };

        docManager.AddDocument(doc1Id, "print 1");
        docManager.AddDocument(doc2Id, "print 2");

        await bothReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.IsTrue(results.Any(r => r.Id == doc1Id));
        Assert.IsTrue(results.Any(r => r.Id == doc2Id));
    }

    // Reuse the TestSymbolManager from DocumentManagerTests
    private class TestSymbolManager : ISymbolManager
    {
        public TestSymbolManager(GlobalState globals) { Globals = globals; }
        public GlobalState Globals { get; }
#pragma warning disable CS0067
        public event EventHandler<GlobalState>? GlobalsChanged;
#pragma warning restore CS0067
        public Task EnsureClustersAsync(ImmutableList<string> clusterNames, string? contextCluster, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task EnsureDatabaseAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task RefreshAsync(string clusterName, string? databaseName, CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
