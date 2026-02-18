using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

public class ResultsManager : IResultsManager
{
    /// <summary>
    /// The maximum number of cached results
    /// </summary>
    private const int MAX_CACHE_SIZE = 10;

    private ImmutableDictionary<Uri, DocResults> _docResults =
        ImmutableDictionary<Uri, DocResults>.Empty;

    private class DocResults
    {
        // maps between sections and id's
        // this is okay to use since the seconds maintain identity across edits of other sections
        public readonly ConditionalWeakTable<ISection, string> QueryToIdMap =
            new ConditionalWeakTable<ISection, string>();
    }

    // keeps an ordered list of the most recently accessed cached results
    private ImmutableList<CachedResult> _cacheList =
        ImmutableList<CachedResult>.Empty;

    private class CachedResult
    {
        public required string Id { get; init; }
        public required ExecuteResult Result { get; init; }
    }

    public string? CacheResult(IDocument document, int position, ExecuteResult result)
    {
        var section = document.GetSection(position);
        if (section != null)
        {
            if (!_docResults.TryGetValue(document.Id, out var docResults))
            {
                docResults = ImmutableInterlocked.GetOrAdd(ref _docResults, document.Id, _id => new DocResults());
            }

            var id = $"{document.Id.ToString()}|{Guid.NewGuid()}";

            // add result to top of most-recently-accessed list
            var cachedResult = new CachedResult { Id = id, Result = result };
            ImmutableInterlocked.Update(ref _cacheList, map => AddAndTrim(map, cachedResult));

            // add map between text and result
            docResults.QueryToIdMap.AddOrUpdate(section, id);

            SendResultsChanged(document);

            return id;
        }

        return null;
    }

    private static ImmutableList<CachedResult> AddAndTrim(ImmutableList<CachedResult> list, CachedResult result)
    {
        list = list.Insert(0, result);
        if (list.Count > MAX_CACHE_SIZE)
        {
            list = list.RemoveRange(MAX_CACHE_SIZE, list.Count - MAX_CACHE_SIZE);
        }
        return list;
    }

    private static ImmutableList<CachedResult> MoveToFront(ImmutableList<CachedResult> list, CachedResult result)
    {
        var index = list.IndexOf(result);
        if (index == 0)
        {
            return list;
        }
        else if (index > 0)
        {
            return list.RemoveAt(index).Insert(0, result);
        }
        else
        {
            return AddAndTrim(list, result);
        }
    }

    public bool TryGetLastResultId(IDocument document, int position, [NotNullWhen(true)] out string? id)
    {
        var section = document.GetSection(position);
        if (section != null 
            && _docResults.TryGetValue(document.Id, out var docIds)
            && docIds.QueryToIdMap.TryGetValue(section, out id))
        {
            return true;
        }
        else
        {
            id = null;
            return false;
        }
    }

    public bool TryGetCachedResultById(string id, [NotNullWhen(true)] out ExecuteResult? result)
    {
        var cachedResult = _cacheList.FirstOrDefault(cr => cr.Id == id);
        if (cachedResult != null)
        {
            ImmutableInterlocked.Update(ref _cacheList, map => MoveToFront(map, cachedResult));
            result = cachedResult.Result;
            return true;
        }
        else
        {
            result = null;
            return false;
        }
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