using Kusto.Language;

namespace Kusto.Lsp;

public interface ISymbolLoader
{
    /// <summary>
    /// Adds a cluster with empty (open) database symbols if cluster is not already part of globals.
    /// </summary>
    Task<GlobalState> AddClusterAsync(GlobalState globals, string cluserName, CancellationToken cancellationToken);

    /// <summary>
    /// Adds a database with full symbols if database is missing or empty (open)
    /// </summary>
    Task<GlobalState> AddDatabaseAsync(GlobalState globals, string cluserName, string databaseName, CancellationToken cancellationToken);

    /// <summary>
    /// Loads symbols for referenced clusters and databases in the document.
    /// </summary>
    Task<GlobalState> AddReferencedSymbols(GlobalState globals, IDocument document, CancellationToken cancellationToken);
}

public interface ISymbolLoaderFactory
{
    public ISymbolLoader CreateLoader(IConnection connection);
}