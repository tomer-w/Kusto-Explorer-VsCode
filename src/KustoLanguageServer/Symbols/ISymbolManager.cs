// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

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
    /// Refreshes the cached symbols for the given cluster and database. 
    /// If database is null, refreshes the all the databases in the cluster.
    /// </summary>
    Task RefreshAsync(string clusterName, string? databaseName, CancellationToken cancellationToken);

    /// <summary>
    /// Ensures that symbols for the specified clusters exist in <see cref="Globals"/>
    /// </summary>
    Task EnsureClustersAsync(ImmutableList<string> clusterNames, string? contextCluster, CancellationToken cancellationToken);

    /// <summary>
    /// Ensures that the symbols for the cluster and database exist in <see cref="Globals"/>
    /// </summary>
    Task EnsureDatabaseAsync(string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken);
}
