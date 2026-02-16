using Kusto.Data;
using Kusto.Language;
using Kusto.Toolkit;
using System.Collections.Immutable;
using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

public class SymbolManager : ISymbolManager
{
    private readonly IConnectionManager _connectionManager;
    private readonly ISymbolLoaderFactory _symbolLoaderFactory;
    private readonly Action<string>? _logger;

    /// <summary>
    /// Task Queue to serialize symbol loading and resolution requests,
    /// and protect updates to the global state.
    /// </summary>
    private readonly TaskQueue _taskQueue = new TaskQueue();

    public SymbolManager(
        IConnectionManager connectionManager, 
        ISymbolLoaderFactory? symbolLoaderFactory = null,
        Action<string>? logger = null)
    {
        _connectionManager = connectionManager;
        _symbolLoaderFactory = symbolLoaderFactory ?? SymbolLoader.Factory;
        _logger = logger;
    }

    public GlobalState Globals { get; private set; } = GlobalState.Default;

    /// <summary>
    /// Event when globals have changed
    /// </summary>
    public event EventHandler<GlobalState>? GlobalsChanged;

    private void SetGlobals(GlobalState newGlobals)
    {
        if (newGlobals != this.Globals)
        {
            _logger?.Invoke("symbols updated");

            this.Globals = newGlobals;

            if (this.GlobalsChanged != null)
            {
                // Notify listeners asynchronously
                Task.Run(() =>
                {
                    this.GlobalsChanged?.Invoke(this, newGlobals);
                });
            }
        }
    }

    private class SymbolInfo
    {
        public required ISymbolLoader SymbolLoader { get; set; }
    }

    private ConditionalWeakTable<IConnection, ISymbolLoader> _connectionToLoaderMap =
        new ConditionalWeakTable<IConnection, ISymbolLoader>();

    private ISymbolLoader GetSymbolLoader(IConnection connection)
    {
        if (!_connectionToLoaderMap.TryGetValue(connection, out var loader))
        {
            loader = _connectionToLoaderMap.GetOrAdd(connection, _conn => _symbolLoaderFactory.CreateLoader(_conn));
        }
        return loader;
    }

    /// <summary>
    /// Gets the available database names for the specified cluster or connection
    /// </summary>
    public async Task<ImmutableList<string>> GetOrLoadDatabaseNamesAsync(string clusterOrConnection, CancellationToken cancellationToken)
    {
        var connection = _connectionManager.GetConnection(clusterOrConnection);
        var cluster = connection.Cluster;
        var globals = this.Globals;

        var clusterSymbol = globals.GetCluster(cluster);
        if (clusterSymbol == null)
        {
            await this.LoadSymbolsAsync(clusterOrConnection, database: null, cancellationToken).ConfigureAwait(false);
            clusterSymbol = globals.GetCluster(cluster);
        }

        if (clusterSymbol != null)
            return clusterSymbol.Databases.Select(d => !string.IsNullOrEmpty(d.AlternateName) ? d.AlternateName : d.Name).ToImmutableList();
        return ImmutableList<string>.Empty;
    }

    /// <summary>
    /// Loads symbols associated with the given cluster and database into the managed global state.
    /// </summary>
    public Task LoadSymbolsAsync(string clusterOrConnection, string? database, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            var connection = _connectionManager.GetConnection(clusterOrConnection);
            var loader = GetSymbolLoader(connection);


            var cluster = connection.Cluster;
            var globals = this.Globals;

            _logger?.Invoke($"Loading symbols for cluster '{cluster}', database '{database}'");

            try
            {
                var clusterSymbol = globals.GetCluster(cluster);
                if (clusterSymbol == null)
                {
                    globals = await loader.AddClusterAsync(globals, cluster, useThisCancellationToken).ConfigureAwait(false);
                    clusterSymbol = globals.GetCluster(cluster);
                }

                if (clusterSymbol != null && database != null)
                {
                    var databaseSymbol = clusterSymbol?.GetDatabase(database);
                    if (databaseSymbol == null || databaseSymbol.IsOpen)
                    {
                        globals = await loader.AddDatabaseAsync(globals, clusterSymbol!.Name, database, cancellationToken: useThisCancellationToken).ConfigureAwait(false);
                    }
                }

                SetGlobals(globals);
            }
            catch (Exception ex)
            {
                _logger?.Invoke($"Error loading symbols for cluster '{cluster}', database '{database}': {ex.Message}");
            }

        });
    }

    /// <summary>
    /// Ensures cluster symbols exist for all the specified connections.
    /// This is used to keep the global state synchronized with the client's connection panel.
    /// </summary>
    public Task EnsureClustersAsync(string[] clusterOrConnections, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            var globals = this.Globals;
            bool changed = false;

            foreach (var clusterOrConnection in clusterOrConnections)
            {
                try
                {
                    var connection = _connectionManager.GetConnection(clusterOrConnection);
                    var loader = GetSymbolLoader(connection);
                    var cluster = connection.Cluster;

                    var clusterSymbol = globals.GetCluster(cluster);
                    if (clusterSymbol == null)
                    {
                        _logger?.Invoke($"Adding cluster symbol for '{cluster}'");
                        globals = await loader.AddClusterAsync(globals, cluster, useThisCancellationToken).ConfigureAwait(false);
                        changed = true;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.Invoke($"Error ensuring cluster for '{clusterOrConnection}': {ex.Message}");
                }
            }

            if (changed)
            {
                SetGlobals(globals);
            }
        });
    }

    /// <summary>
    /// Resolve references to unloaded clusters and databases.
    /// </summary>
    public Task ResolveSymbolsAsync(IDocument document, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            var connection = _connectionManager.GetConnection(document.Globals.Cluster.Name);
            var loader = GetSymbolLoader(connection);

            try
            {
                var newGlobals = await loader.AddReferencedSymbols(document.Globals, document, cancellationToken).ConfigureAwait(false);
                SetGlobals(newGlobals);
            }
            catch (Exception e)
            {
                _logger?.Invoke($"Error resolving symbols for script '{document.Text}': {e.Message}");
            }
        });
    }
}