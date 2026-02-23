using Kusto.Language;
using System.Collections.Immutable;

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
    /// Ensures that symbols for the specified cluster existing in <see cref="Globals"/>
    /// </summary>
    Task EnsureClustersAsync(ImmutableList<string> clusterNames, CancellationToken cancellationToken);

    /// <summary>
    /// Ensures that the symbols for the cluster and database exist in <see cref="Globals"/>
    /// </summary>
    Task EnsureSymbolsAsync(string clusterName, string? database, string? contextCluster, CancellationToken cancellationToken);

    /// <summary>
    /// Adds missing cluster and database symbols referenced in the document.
    /// </summary>
    Task AddReferencedSymbolsAsync(IDocument document, CancellationToken cancellationToken);
}
