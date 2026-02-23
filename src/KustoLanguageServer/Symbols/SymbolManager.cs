using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using System.Collections.Immutable;

namespace Kusto.Lsp;

public class SymbolManager : ISymbolManager
{
    private readonly ISchemaSource _schemaSource;
    private readonly IOptionsManager _optionsManager;
    private readonly ILogger? _logger;

    /// <summary>
    /// Task Queue to serialize symbol loading and resolution requests,
    /// and protect updates to the global state.
    /// </summary>
    private readonly TaskQueue _taskQueue = new TaskQueue();

    public SymbolManager(
        ISchemaSource schemaSource, 
        IOptionsManager optionsManager,
        ILogger? logger = null)
    {
        _schemaSource = schemaSource;
        _optionsManager = optionsManager;
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
            _logger?.Log("SymbolManager: globals updated");

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

    /// <summary>
    /// Loads symbols associated with the given cluster and database into the managed global state.
    /// </summary>
    public Task EnsureSymbolsAsync(string clusterName, string? databaseName, string? contextCluster, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            var globals = this.Globals;

            _logger?.Log($"SymbolManager: Loading symbols for cluster '{clusterName}', database '{databaseName}'");

            try
            {
                var clusterSymbol = globals.GetCluster(clusterName);
                if (clusterSymbol == null)
                {
                    globals = await this.AddClusterAsync(globals, clusterName, contextCluster, useThisCancellationToken).ConfigureAwait(false);
                    clusterSymbol = globals.GetCluster(clusterName);
                }

                if (clusterSymbol != null && databaseName != null)
                {
                    var databaseSymbol = clusterSymbol?.GetDatabase(databaseName);
                    if (databaseSymbol == null || databaseSymbol.IsOpen)
                    {
                        globals = await this.AddDatabaseAsync(globals, clusterName, databaseName, contextCluster, cancellationToken: useThisCancellationToken).ConfigureAwait(false);
                    }
                }

                SetGlobals(globals);
            }
            catch (Exception ex)
            {
                _logger?.Log($"SymbolManager: Error loading symbols for cluster '{clusterName}', database '{databaseName}': {ex.Message}");
            }
        });
    }

    private async Task<GlobalState> AddClusterAsync(GlobalState globals, string clusterName, string? contextCluster, CancellationToken cancellationToken)
    {
        var clusterSymbol = globals.GetCluster(clusterName);
        if (clusterSymbol == null)
        {
            var clusterInfo = await _schemaSource.GetClusterInfoAsync(clusterName, contextCluster, cancellationToken).ConfigureAwait(false);
            if (clusterInfo != null)
            {
                try
                {
                    var openDatabases = clusterInfo.Databases.Select(db => new DatabaseSymbol(db.Name, db.AlternateName, null, isOpen: true)).ToList();
                    var newCluster = new ClusterSymbol(clusterName, openDatabases);
                    globals = globals.AddOrReplaceCluster(newCluster);

                    _logger?.Log($"SymbolManager: Added cluster symbol: {clusterName} databases: {openDatabases.Count}");
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        return globals;
    }

    private async Task<GlobalState> AddDatabaseAsync(GlobalState globals, string clusterName, string databaseName, string? contextCluster, CancellationToken cancellationToken)
    {
        var clusterSymbol = globals.GetCluster(clusterName);
        if (clusterSymbol != null)
        {
            var databaseSymbol = clusterSymbol.GetDatabase(databaseName);
            if (databaseSymbol == null || databaseSymbol.IsOpen)
            {
                var databaseInfo = await _schemaSource.GetDatabaseInfoAsync(clusterName, databaseName, contextCluster, cancellationToken).ConfigureAwait(false);
                if (databaseInfo != null)
                {
                    var newDatabaseSymbol = databaseInfo.ToSymbol();
                    clusterSymbol = clusterSymbol.AddOrUpdateDatabase(newDatabaseSymbol);
                    globals = globals.AddOrReplaceCluster(clusterSymbol);

                    _logger?.Log($"SymbolManager: Added database symbol: {databaseInfo.Name} tables: {newDatabaseSymbol.Tables.Count}");
                }
            }
        }

        return globals;
    }

    /// <summary>
    /// Ensures cluster symbols exist for all the clusters listed.
    /// This is used to keep the global state synchronized with the client's connection panel.
    /// </summary>
    public Task EnsureClustersAsync(ImmutableList<string> clusterNames, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            var globals = this.Globals;
            bool changed = false;

            foreach (var clusterName in clusterNames)
            {
                try
                {
                    var clusterSymbol = globals.GetCluster(clusterName);
                    if (clusterSymbol == null)
                    {
                        _logger?.Log($"SymbolManager: Adding partial cluster symbol for '{clusterName}'");
                        globals = await this.AddClusterAsync(globals, clusterName, contextCluster: null, useThisCancellationToken).ConfigureAwait(false);
                        changed = true;
                    }
                }
                catch (Exception ex)
                {
                    _logger?.Log($"SymbolManager: Error ensuring cluster for '{clusterName}': {ex.Message}");
                }
            }

            if (changed)
            {
                SetGlobals(globals);
            }
        });
    }

    /// <summary>
    /// Adds missing cluster and database symbols referenced in the document.
    /// </summary>
    public Task AddReferencedSymbolsAsync(IDocument document, CancellationToken cancellationToken)
    {
        return _taskQueue.Run(cancellationToken, async (useThisCancellationToken) =>
        {
            try
            {
                var newGlobals = await this.AddReferencedSymbols(document.Globals, document, cancellationToken).ConfigureAwait(false);
                SetGlobals(newGlobals);
            }
            catch (Exception e)
            {
                _logger?.Log($"SymbolManager: Error resolving symbols for document '{document.Text}': {e.Message}");
            }
        });
    }

    /// <summary>
    /// Maximum loops allowed when checking for additional references after just adding referenced database schema.
    /// If this is exceeded then there is probably a bug that keeps updating the globals even when no new found databases are added.
    /// </summary>
    private const int MaxLoopCount = 20;

    private readonly Dictionary<string, HashSet<string>> _clustersResolvedOrInvalid
        = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);

    private async Task<GlobalState> AddReferencedSymbols(GlobalState globals, IDocument document, CancellationToken cancellationToken)
    {
        // keep looping until no more changes are made to the globals
        for (int loopCount = 0; loopCount < MaxLoopCount; loopCount++)
        {
            var newGlobals = await ResolveReferencesAsync(globals, document, cancellationToken).ConfigureAwait(false);
            if (newGlobals == globals)
                return newGlobals;
            document = document.WithGlobals(newGlobals);
            globals = newGlobals;
        }

        return globals;

        async Task<GlobalState> ResolveReferencesAsync(GlobalState globals, IDocument document, CancellationToken cancellationToken = default)
        {
            var contextCluster = document.Globals.Cluster != ClusterSymbol.Unknown ? document.Globals.Cluster.Name : null;

            // find all explicit cluster('xxx') references
            var clusterRefs = document.GetClusterReferences(cancellationToken);
            foreach (var clusterRef in clusterRefs)
            {
                var clusterName = SymbolFacts.GetFullHostName(clusterRef.Cluster, _optionsManager.DefaultDomain);

                // don't bother with clusters were already resolved or do not exist
                if (string.IsNullOrEmpty(clusterName)
                    || _clustersResolvedOrInvalid.ContainsKey(clusterName))
                    continue;

                _clustersResolvedOrInvalid.Add(clusterName, new HashSet<string>());

                var cluster = globals.GetCluster(clusterName);
                if (cluster == null || cluster.IsOpen)
                {
                    globals = await this.AddClusterAsync(globals, clusterName, contextCluster, cancellationToken).ConfigureAwait(false);
                }
            }

            // find all explicit database('xxx') references
            var dbRefs = document.GetDatabaseReferences(cancellationToken);
            foreach (DatabaseReference dbRef in dbRefs)
            {
                var cluster = string.IsNullOrEmpty(dbRef.Cluster)
                    ? globals.Cluster
                    : globals.GetCluster(SymbolFacts.GetFullHostName(dbRef.Cluster, _optionsManager.DefaultDomain));

                // don't rely on the user to do the right thing.
                if (cluster == null
                    || cluster == ClusterSymbol.Unknown
                    || string.IsNullOrEmpty(cluster.Name)
                    || string.IsNullOrEmpty(dbRef.Database))
                    continue;

                if (!_clustersResolvedOrInvalid.TryGetValue(cluster.Name, out var dbsResolvedOrInvalid))
                {
                    dbsResolvedOrInvalid = new HashSet<string>();
                    _clustersResolvedOrInvalid.Add(cluster.Name, dbsResolvedOrInvalid);
                }

                // don't bother with databases already resolved no do not exist
                if (dbsResolvedOrInvalid.Contains(dbRef.Database))
                    continue;

                dbsResolvedOrInvalid.Add(dbRef.Database);

                var db = cluster.GetDatabase(dbRef.Database);
                if (db == null || (db != null && db.Members.Count == 0 && db.IsOpen))
                {
                    var newGlobals = await this.AddDatabaseAsync(globals, cluster.Name, dbRef.Database, contextCluster, cancellationToken).ConfigureAwait(false);
                    globals = newGlobals ?? globals;
                }
            }

            return globals;
        }
    }
}