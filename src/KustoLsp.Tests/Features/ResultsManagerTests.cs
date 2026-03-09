// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Data;
using System.Diagnostics.CodeAnalysis;
using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Lsp;

namespace KustoLspTests;

[TestClass]
public class ResultsManagerTests
{
    private static readonly Uri TestDocId = new Uri("inmemory://testdoc");

    #region CacheResult Tests

    [TestMethod]
    public void CacheResult_ValidPosition_ReturnsId()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, result);

        Assert.IsNotNull(id);
    }

    [TestMethod]
    public void CacheResult_InvalidPosition_ReturnsNull()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        // Empty document has no sections
        var document = CreateDocument("");
        docManager.SetDocument(document);

        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 100, result);

        Assert.IsNull(id);
    }

    [TestMethod]
    public void CacheResult_FiresResultsChangedEvent()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        IDocument? changedDocument = null;
        var eventFired = new ManualResetEventSlim(false);
        resultsManager.ResultsChanged += (sender, doc) =>
        {
            changedDocument = doc;
            eventFired.Set();
        };

        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        resultsManager.CacheResult(document, 0, result);

        Assert.IsTrue(eventFired.Wait(TimeSpan.FromSeconds(1)), "ResultsChanged event should fire");
        Assert.IsNotNull(changedDocument);
        Assert.AreEqual(document.Id, changedDocument.Id);
    }

    #endregion

    #region TryGetLastResultId Tests

    [TestMethod]
    public void TryGetLastResultId_AfterCache_ReturnsTrue()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var cachedId = resultsManager.CacheResult(document, 0, result);

        var found = resultsManager.TryGetLastResultId(document, 0, out var retrievedId);

        Assert.IsTrue(found);
        Assert.AreEqual(cachedId, retrievedId);
    }

    [TestMethod]
    public void TryGetLastResultId_NoCachedResult_ReturnsFalse()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        var found = resultsManager.TryGetLastResultId(document, 0, out var id);

        Assert.IsFalse(found);
        Assert.IsNull(id);
    }

    [TestMethod]
    public void TryGetLastResultId_DifferentPosition_ReturnsFalse()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        // Two separate queries (sections)
        var document = CreateDocument("print 1\n\nprint 2");
        docManager.SetDocument(document);

        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        resultsManager.CacheResult(document, 0, result); // Cache for first query

        // Try to get result for second query
        var found = resultsManager.TryGetLastResultId(document, 10, out var id);

        Assert.IsFalse(found);
    }

    #endregion

    #region TryGetCachedResultById Tests

    [TestMethod]
    public void TryGetCachedResultById_ValidId_ReturnsTrue()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        var expectedResult = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, expectedResult);

        var found = resultsManager.TryGetCachedResultById(id!, out var result);

        Assert.IsTrue(found);
        Assert.AreSame(expectedResult, result);
    }

    [TestMethod]
    public void TryGetCachedResultById_InvalidId_ReturnsFalse()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        var found = resultsManager.TryGetCachedResultById("nonexistent-id", out var result);

        Assert.IsFalse(found);
        Assert.IsNull(result);
    }

    #endregion

    #region Result Persistence Tests - Query Unchanged

    [TestMethod]
    public void CachedResult_SurvivesEditToOtherQuery()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Initial document with two queries
        var document = CreateDocument("print 1\n\nprint 2");
        docManager.SetDocument(document);

        // Cache result for first query
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, result);

        // Edit second query (change "print 2" to "print 3")
        var editedDocument = CreateDocument("print 1\n\nprint 3");
        docManager.SetDocument(editedDocument);

        // First query's cached result should still be accessible
        var found = resultsManager.TryGetLastResultId(editedDocument, 0, out var retrievedId);

        Assert.IsTrue(found);
        Assert.AreEqual(id, retrievedId);
    }

    [TestMethod]
    public void CachedResult_SurvivesWhitespaceOnlyEdit()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Initial document
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache result
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, result);

        // Edit with only whitespace changes (add spaces)
        var editedDocument = CreateDocument("print  1");
        docManager.SetDocument(editedDocument);

        // Cached result should still be accessible because minimal text is the same
        var found = resultsManager.TryGetLastResultId(editedDocument, 0, out var retrievedId);

        Assert.IsTrue(found);
        Assert.AreEqual(id, retrievedId);
    }

    [TestMethod]
    public void CachedResult_SurvivesLeadingWhitespaceChange()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Initial document
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache result
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, result);

        // Add leading whitespace
        var editedDocument = CreateDocument("  print 1");
        docManager.SetDocument(editedDocument);

        // Cached result should still be accessible
        var found = resultsManager.TryGetLastResultId(editedDocument, 0, out var retrievedId);

        Assert.IsTrue(found);
        Assert.AreEqual(id, retrievedId);
    }

    [TestMethod]
    public void CachedResult_SurvivesTrailingWhitespaceChange()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Initial document
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache result
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, result);

        // Add trailing whitespace
        var editedDocument = CreateDocument("print 1   ");
        docManager.SetDocument(editedDocument);

        // Cached result should still be accessible
        var found = resultsManager.TryGetLastResultId(editedDocument, 0, out var retrievedId);

        Assert.IsTrue(found);
        Assert.AreEqual(id, retrievedId);
    }

    #endregion

    #region Result Invalidation Tests - Query Changed

    [TestMethod]
    public void CachedResult_InvalidatedWhenQueryTextChanges()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Initial document
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache result
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        resultsManager.CacheResult(document, 0, result);

        // Change the query text meaningfully
        var editedDocument = CreateDocument("print 2");
        docManager.SetDocument(editedDocument);

        // Cached result should NOT be accessible
        var found = resultsManager.TryGetLastResultId(editedDocument, 0, out var id);

        Assert.IsFalse(found);
    }

    [TestMethod]
    public void CachedResult_InvalidatedWhenOperatorChanges()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Initial document
        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache result
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        resultsManager.CacheResult(document, 0, result);

        // Change the operator
        var editedDocument = CreateDocument("range x from 1 to 1 step 1");
        docManager.SetDocument(editedDocument);

        // Cached result should NOT be accessible
        var found = resultsManager.TryGetLastResultId(editedDocument, 0, out var id);

        Assert.IsFalse(found);
    }

    #endregion

    #region Document Removal Tests

    [TestMethod]
    public void CachedResult_RemovedWhenDocumentRemoved()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache result
        var result = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id = resultsManager.CacheResult(document, 0, result);

        // Remove document
        docManager.RemoveDocument();

        // Cached result should no longer be accessible by id
        var found = resultsManager.TryGetCachedResultById(id!, out var retrievedResult);

        Assert.IsFalse(found);
    }

    #endregion

    #region Multiple Queries Tests

    [TestMethod]
    public void CacheResult_MultipleCachesForDifferentQueries()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        // Document with two queries
        var document = CreateDocument("print 1\n\nprint 2");
        docManager.SetDocument(document);

        // Cache results for both queries
        var result1 = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var result2 = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id1 = resultsManager.CacheResult(document, 0, result1);
        var id2 = resultsManager.CacheResult(document, 10, result2);

        Assert.IsNotNull(id1);
        Assert.IsNotNull(id2);
        Assert.AreNotEqual(id1, id2);

        // Both should be retrievable
        Assert.IsTrue(resultsManager.TryGetCachedResultById(id1, out var r1));
        Assert.IsTrue(resultsManager.TryGetCachedResultById(id2, out var r2));
        Assert.AreSame(result1, r1);
        Assert.AreSame(result2, r2);
    }

    [TestMethod]
    public void CacheResult_ReplacesExistingResultForSameQuery()
    {
        var docManager = new TestDocumentManager();
        var resultsManager = new ResultsManager(docManager);

        var document = CreateDocument("print 1");
        docManager.SetDocument(document);

        // Cache first result
        var result1 = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id1 = resultsManager.CacheResult(document, 0, result1);

        // Cache second result for same query
        var result2 = new ExecuteResult { Tables = ImmutableList<DataTable>.Empty };
        var id2 = resultsManager.CacheResult(document, 0, result2);

        // New ID should be different
        Assert.AreNotEqual(id1, id2);

        // TryGetLastResultId should return the new ID
        resultsManager.TryGetLastResultId(document, 0, out var currentId);
        Assert.AreEqual(id2, currentId);

        // New result should be retrievable
        Assert.IsTrue(resultsManager.TryGetCachedResultById(id2!, out var retrievedResult));
        Assert.AreSame(result2, retrievedResult);
    }

    #endregion

    #region Helper Methods

    private static SectionedDocument CreateDocument(string text)
    {
        return new SectionedDocument(TestDocId, text, GlobalState.Default);
    }

    #endregion

    #region Test Document Manager

    private class TestDocumentManager : IDocumentManager
    {
        private IDocument? _document;

        public void SetDocument(IDocument document)
        {
            _document = document;
        }

        public void RemoveDocument()
        {
            if (_document != null)
            {
                var id = _document.Id;
                _document = null;
                DocumentRemoved?.Invoke(this, id);
            }
        }

        public ImmutableList<Uri> GetDocumentIds()
        {
            return _document != null
                ? ImmutableList.Create(_document.Id)
                : ImmutableList<Uri>.Empty;
        }

        public DocumentConnection GetConnection(Uri documentId)
        {
            return new DocumentConnection();
        }

        public void AddDocument(Uri documentId, string text)
        {
            _document = new SectionedDocument(documentId, text, GlobalState.Default);
            DocumentAdded?.Invoke(this, documentId);
        }

        void IDocumentManager.RemoveDocument(Uri documentId)
        {
            if (_document?.Id == documentId)
            {
                RemoveDocument();
            }
        }

        public Task UpdateConnectionAsync(Uri documentId, string? clusterOrConnection, string? database, string? serverKind)
        {
            return Task.CompletedTask;
        }

        public Task UpdateTextAsync(Uri id, string newText)
        {
            if (_document?.Id == id)
            {
                _document = _document.WithText(newText);
                DocumentChanged?.Invoke(this, id);
            }
            return Task.CompletedTask;
        }

        public bool TryGetDocument(Uri id, [NotNullWhen(true)] out IDocument? document)
        {
            if (_document?.Id == id)
            {
                document = _document;
                return true;
            }
            document = null;
            return false;
        }

        public Task RefreshReferencedSymbolsAsync(Uri documentId, CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }

        public event EventHandler<Uri>? DocumentAdded;
        public event EventHandler<Uri>? DocumentRemoved;
        public event EventHandler<Uri>? DocumentChanged;
    }

    #endregion
}
