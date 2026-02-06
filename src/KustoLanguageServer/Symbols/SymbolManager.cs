using Kusto.Data;
using Kusto.Language;
using Kusto.Toolkit;
using System.Collections.Immutable;
using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

public class SymbolManager : ISymbolManager
{
    private readonly IConnectionManager _connectionManager;
    private readonly Action<string>? _logger;

    /// <summary>
    /// Task Queue to serialize symbol loading and resolution requests,
    /// and protect updates to the global state.
    /// </summary>
    private readonly TaskQueue _taskQueue = new TaskQueue();

    public SymbolManager(IConnectionManager connectionManager, Action<string>? logger = null)
    {
        _connectionManager = connectionManager;
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
        public required SymbolLoader SymbolLoader { get; set; }

        public required SymbolResolver SymbolResolver { get; set; }
    }

    private ConditionalWeakTable<KustoConnectionStringBuilder, SymbolInfo> _connectionToSymbolInfo =
        new ConditionalWeakTable<KustoConnectionStringBuilder, SymbolInfo>();

    private SymbolInfo GetSymbolInfo(KustoConnectionStringBuilder connection)
    {
        if (!_connectionToSymbolInfo.TryGetValue(connection, out var info))
        {
            var symbolLoader = new ServerSymbolLoader(connection);
            var symbolResolver = new SymbolResolver(symbolLoader);

            info = new SymbolInfo
            {
                SymbolLoader = symbolLoader,
                SymbolResolver = symbolResolver
            };

            _connectionToSymbolInfo.Add(connection, info);
        }

        return info;
    }

    /// <summary>
    /// Gets the available database names for the specified cluster or connection
    /// </summary>
    public async Task<ImmutableList<string>> GetOrLoadDatabaseNamesAsync(string clusterOrConnection, CancellationToken cancellationToken)
    {
        var connection = _connectionManager.GetConnection(clusterOrConnection);
        var cluster = connection.Hostname;
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
            var info = GetSymbolInfo(connection);

            var cluster = connection.Hostname;
            var globals = this.Globals;

            _logger?.Invoke($"Loading symbols for cluster '{cluster}', database '{database}'");

            try
            {
                var clusterSymbol = globals.GetCluster(cluster);
                if (clusterSymbol == null)
                {
                    globals = await info.SymbolLoader.AddClusterAsync(globals, cluster, useThisCancellationToken).ConfigureAwait(false);
                    clusterSymbol = globals.GetCluster(cluster);
                }

                if (clusterSymbol != null && database != null)
                {
                    var databaseSymbol = clusterSymbol?.GetDatabase(database);
                    if (databaseSymbol == null || databaseSymbol.IsOpen)
                    {
                        databaseSymbol = await info.SymbolLoader.LoadDatabaseAsync(database, cancellationToken: useThisCancellationToken).ConfigureAwait(false);
                        if (clusterSymbol != null && databaseSymbol != null)
                        {
                            clusterSymbol = clusterSymbol.AddOrUpdateDatabase(databaseSymbol);
                            globals = globals.AddOrReplaceCluster(clusterSymbol);
                        }
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
                    var info = GetSymbolInfo(connection);
                    var cluster = connection.Hostname;

                    var clusterSymbol = globals.GetCluster(cluster);
                    if (clusterSymbol == null)
                    {
                        _logger?.Invoke($"Adding cluster symbol for '{cluster}'");
                        globals = await info.SymbolLoader.AddClusterAsync(globals, cluster, useThisCancellationToken).ConfigureAwait(false);
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
    public Task ResolveSymbolsAsync(Document document, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            var connection = _connectionManager.GetConnection(document.Globals.Cluster.Name);
            var info = GetSymbolInfo(connection);

            try
            {
                var newGlobals = document.Globals;

                if (document is MultiQueryDocument md)
                {
                    var newScript = await info.SymbolResolver.AddReferencedDatabasesAsync(md.Script, cancellationToken).ConfigureAwait(false);
                    newGlobals = this.Globals.WithClusterList(newScript.Globals.Clusters);
                }
                else if (document is SingleQueryDocument sd)
                {
                    var newCode = await info.SymbolResolver.AddReferencedDatabasesAsync(sd.GetCode(), cancellationToken).ConfigureAwait(false);
                    newGlobals = this.Globals.WithClusterList(newCode.Globals.Clusters);
                }

                SetGlobals(newGlobals);
            }
            catch (Exception e)
            {
                _logger?.Invoke($"Error resolving symbols for script '{document.Text}': {e.Message}");
            }
        });
    }
}