using System.Collections.Immutable;
using Kusto.Language;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public interface ISymbolManager
{
    /// <summary>
    /// The shared <see cref="GlobalState"/> containing all the common loaded symbols.
    /// Individual documents will have other <see cref="GlobalState"/> instances with different default clusters and databases.
    /// </summary>
    GlobalState Globals { get; }

    /// <summary>
    /// An event fired with the shared global state has changed.
    /// </summary>
    event EventHandler<GlobalState>? GlobalsChanged;

    /// <summary>
    /// Gets the list of databases for the specified cluster or connection.
    /// </summary>
    Task<ImmutableList<string>> GetOrLoadDatabaseNamesAsync(string clusterOrConnection, CancellationToken cancellationToken);

    /// <summary>
    /// Loads symbols for the specified cluster/connection and database, and updates the global state.
    /// </summary>
    Task LoadSymbolsAsync(string clusterOrConnection, string? database, CancellationToken cancellationToken);

    /// <summary>
    /// Ensures that the specified clusters or connections are represented in the global state.
    /// </summary>
    Task EnsureClustersAsync(string[] clusterOrConnections, CancellationToken cancellationToken);

    /// <summary>
    /// Resolve references to unloaded clusters and databases in the specified document.
    /// </summary>
    Task ResolveSymbolsAsync(Document document, CancellationToken cancellationToken);
}
