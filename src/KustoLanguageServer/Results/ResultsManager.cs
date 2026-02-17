using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

public class ResultsManager : IResultsManager
{
    private readonly ConditionalWeakTable<ISection, string> _lastResultIds = 
        new ConditionalWeakTable<ISection, string>();

    private ImmutableDictionary<string, ExecuteResult> _cachedResults =
        ImmutableDictionary<string, ExecuteResult>.Empty;

    public string? SetResults(IDocument document, int position, ExecuteResult? result)
    {
        var section = document.GetSection(position);
        if (section != null)
        {
            // remove old cached results for this same section
            // this only applies when query is re-run without any previos edits
            if (_lastResultIds.TryGetValue(section, out var lastId))
            {
                ImmutableInterlocked.Update(ref _cachedResults, map => map.Remove(lastId));
            }

            if (result != null)
            {
                var id = $"{document.Id.ToString()}|{position}|{Guid.NewGuid()}";
                ImmutableInterlocked.Update(ref _cachedResults, map => map.SetItem(id, result));
                _lastResultIds.AddOrUpdate(section, id);
                return id;
            }

            // TODO: prune cache if too many items
        }

        return null;
    }

    public bool TryGetLastResultId(IDocument document, int position, [NotNullWhen(true)] string? id)
    {
        var section = document.GetSection(position);
        if (section != null && _lastResultIds.TryGetValue(section, out id))
            return true;
        id = null;
        return false;
    }

    public bool TryGetResults(string id, [NotNullWhen(true)] out ExecuteResult? result)
    {
        return _cachedResults.TryGetValue(id, out result);
    }
}