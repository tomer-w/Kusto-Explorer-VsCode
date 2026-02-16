using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

public class ResultsManager : IResultsManager
{
    private readonly ConditionalWeakTable<ISection, ExecuteResult?> _cachedResults
        = new ConditionalWeakTable<ISection, ExecuteResult?>();

    /// <summary>
    /// Caches the results for the query at the position in the document.
    /// </summary>
    public void SetResults(IDocument document, int position, ExecuteResult? result)
    {
        var section = document.GetSection(position);
        if (section != null)
        {
            _cachedResults.AddOrUpdate(section, result);
        }
    }

    /// <summary>
    /// Gets the cached results for the query at the position in the document.
    /// </summary>
    public ExecuteResult? GetResults(IDocument document, int position)
    {
        var section = document.GetSection(position);
        if (section != null && _cachedResults.TryGetValue(section, out var result))
            return result;
        return null;
    }
}