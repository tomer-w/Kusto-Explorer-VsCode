using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

/// <summary>
/// Caches results during the session.
/// </summary>
public interface IResultsManager
{
    /// <summary>
    /// Ads the results to the results cache
    /// for the query identifid by the document document position
    /// and returns the id used to retrieve the results.
    /// </summary>
    string? CacheResult(IDocument document, int position, ExecuteResult result);

    /// <summary>
    /// Gets the id of the last results associated with the query identified by the document position.
    /// </summary>
    bool TryGetLastResultId(IDocument document, int position, [NotNullWhen(true)] out string? id);

    /// <summary>
    /// Gets the cached results for the id.
    /// </summary>
    bool TryGetCachedResultById(string id, [NotNullWhen(true)] out ExecuteResult? result);

    /// <summary>
    /// An event fired when the results for query within a document changed.
    /// </summary>
    event EventHandler<IDocument>? ResultsChanged;
}
