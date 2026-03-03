// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

public class ResultsManager : IResultsManager
{
    private readonly IDocumentManager _documentManager;

    /// <summary>
    /// an entry for every document.
    /// </summary>
    private ImmutableDictionary<Uri, DocResults> _docToResultsMap =
        ImmutableDictionary<Uri, DocResults>.Empty;

    private class DocResults
    {
        // maps between sections and id's
        // this is okay to use since the seconds maintain identity across edits of other sections
        public ImmutableDictionary<string, CachedResult> QueryToIdMap =
            ImmutableDictionary<string, CachedResult>.Empty;
    }

    private class CachedResult
    {
        public required string Id { get; init; }
        public required ExecuteResult Result { get; init; }
    }

    public ResultsManager(IDocumentManager documentManager)
    {
        _documentManager = documentManager;
        _documentManager.DocumentRemoved += _documentManager_DocumentRemoved;
    }

    private void _documentManager_DocumentRemoved(object? sender, Uri docId)
    {
        // remove cached results for this document
        if (_docToResultsMap.TryGetValue(docId, out var docResults))
        {
            ImmutableInterlocked.Update(ref _docToResultsMap, map => map.Remove(docId));
        }
    }

    public string? CacheResult(IDocument document, int position, ExecuteResult result)
    {
        var section = document.GetSection(position);
        if (section != null)
        {
            if (!_docToResultsMap.TryGetValue(document.Id, out var docResults))
            {
                docResults = ImmutableInterlocked.GetOrAdd(ref _docToResultsMap, document.Id, _id => new DocResults());
            }

            var id = $"{document.Id.ToString()}|{Guid.NewGuid()}";

            // add result to top of most-recently-accessed list
            var cachedResult = new CachedResult { Id = id, Result = result };
           
            ImmutableInterlocked.Update(ref docResults.QueryToIdMap, 
                map =>
                {
                    map = AddResult(map, document, position, cachedResult);
                    map = RemoveOldItems(map, document);
                    return map;
                });

            SendResultsChanged(document);

            return id;
        }

        return null;
    }

    private string? GetKey(IDocument document, int position)
    {
        // get minified version of query so unimportant edits do not invalidate cached result
        return document.GetMinimalText(position, Language.Editor.MinimalTextKind.SingleLine);
    }

    private ImmutableDictionary<string, CachedResult> AddResult(ImmutableDictionary<string, CachedResult> docResults, IDocument document, int position, CachedResult result)
    {
        var key = GetKey(document, position);
        if (key != null)
        {
            return docResults.SetItem(key, result);
        }
        return docResults;
    }

    /// <summary>
    /// Removes all the items from the doc map that does not have a current matching text in the document.
    /// </summary>
    private ImmutableDictionary<string, CachedResult> RemoveOldItems(ImmutableDictionary<string, CachedResult> docResults, IDocument document)
    {
        var docKeys = document.GetSectionRanges().Select(r => GetKey(document, r.Start)).ToHashSet();
        var newDocResults = docResults.Where(kvp => docKeys.Contains(kvp.Key)).ToImmutableDictionary(kvp => kvp.Key, kvp => kvp.Value);
        return newDocResults;
    }

    public bool TryGetLastResultId(IDocument document, int position, [NotNullWhen(true)] out string? id)
    {
        var section = document.GetSection(position);
        if (section != null 
            && _docToResultsMap.TryGetValue(document.Id, out var docResults)
            && GetKey(document, position) is { } key
            && docResults.QueryToIdMap.TryGetValue(key, out var cachedResult))
        {
            id = cachedResult.Id;
            return true;
        }

        id = null;
        return false;
    }

    public bool TryGetCachedResultById(string id, [NotNullWhen(true)] out ExecuteResult? result)
    {
        // TODO: optimize this reverse lookup
        foreach (var docResults in _docToResultsMap.Values)
        {
            foreach (var cachedResult in docResults.QueryToIdMap.Values)
            {
                if (cachedResult.Id == id)
                {
                    result = cachedResult.Result;
                    return true;
                }
            }
        }

        result = null;
        return false;
    }

    public event EventHandler<IDocument>? ResultsChanged;

    private void SendResultsChanged(IDocument document)
    {
        if (this.ResultsChanged != null)
        {
            Task.Run(() => ResultsChanged?.Invoke(this, document));
        }
    }
}