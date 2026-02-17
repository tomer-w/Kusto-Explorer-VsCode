using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

/// <summary>
/// Caches results during the session.
/// </summary>
public interface IResultsManager
{
    /// <summary>
    /// Sets the results in the cache for the document at the position
    /// and returns the id used to retrieve the results.
    /// </summary>
    string? SetResults(IDocument document, int position, ExecuteResult? result);

    /// <summary>
    /// Gets the id of the last results associated with the query at the document & position.
    /// </summary>
    bool TryGetLastResultId(IDocument document, int position, [NotNullWhen(true)] string? id);

    /// <summary>
    /// Gets the cached results for the id, if it is still available.
    /// </summary>
    bool TryGetResults(string id, [NotNullWhen(true)] out ExecuteResult? result);
}
