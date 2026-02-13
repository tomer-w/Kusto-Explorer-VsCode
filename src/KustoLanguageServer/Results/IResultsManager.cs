namespace Kusto.Lsp;

/// <summary>
/// Caches results during the session.
/// </summary>
public interface IResultsManager
{
    /// <summary>
    /// Sets the results in the cache for the document at the position
    /// </summary>
    void SetResults(Document document, int position, ExecuteResult result);

    /// <summary>
    /// Gets the cached results for the query at the position in the document.
    /// </summary>
    ExecuteResult? GetResults(Document document, int position);
}
