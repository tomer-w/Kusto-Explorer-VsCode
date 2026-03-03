using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using System.Reflection.Metadata;

namespace Kusto.Lsp;

public class DocumentManager : IDocumentManager
{
    private readonly ISymbolManager _symbolManager;
    private readonly ILogger? _logger;

    private ImmutableDictionary<Uri, DocumentInfo> _idToInfoMap =
        ImmutableDictionary<Uri, DocumentInfo>.Empty;

    public DocumentManager(
        ISymbolManager symbolManager, 
        ILogger? logger = null)
    {
        _symbolManager = symbolManager;
        _logger = logger;

        // update scripts when global symbols change
        _symbolManager.GlobalsChanged += (_, _) =>
        {
            foreach (var id in _idToInfoMap.Keys)
            {
                UpdateGlobals(id);
            }
        };
    }

    public event EventHandler<Uri>? DocumentAdded;

    private void RaiseDocumentAdded(Uri id)
    {
        if (this.DocumentAdded != null)
        {
            Task.Run(() => this.DocumentAdded?.Invoke(this, id));
        }
    }

    public event EventHandler<Uri>? DocumentRemoved;

    private void RaiseDocumentRemoved(Uri id)
    {
        if (this.DocumentRemoved != null)
        {
            Task.Run(() => this.DocumentRemoved?.Invoke(this, id));
        }
    }

    /// <summary>
    /// An event that is raised when a script has changed (text or globals).
    /// </summary>
    public event EventHandler<Uri>? DocumentChanged;

    private void RaiseDocumentChanged(Uri id)
    {
        if (this.DocumentChanged != null)
        {
            Task.Run(() => this.DocumentChanged?.Invoke(this, id));
        }
    }

    class DocumentInfo
    {
        public Uri Id { get; }

        public required IDocument Document { get; set; }

        public string? ServerKind { get; set; }

        public string? Cluster { get; set; }

        public string? Database { get; set; }

        public readonly LatestRequestQueue LoadSymbolsQueue = new();

        public readonly LatestRequestQueue ResolveSymbolsQueue = new();

        public DocumentInfo(Uri uri)
        {
            this.Id = uri;
        }
    }

    public ImmutableList<Uri> GetDocumentIds()
    {
        return _idToInfoMap.Keys.ToImmutableList();
    }

    /// <summary>
    /// Gets existing ScriptInfo or creates a new placeholder.
    /// </summary>
    private DocumentInfo GetOrCreateDocumentInfo(Uri id)
    {
        return ImmutableInterlocked.GetOrAdd(
            ref _idToInfoMap, id, 
            _ => new DocumentInfo(id) { Document = new SectionedDocument(id, "", _symbolManager.Globals) }
            );
    }

    public void AddDocument(Uri id, string text)
    {
        _logger?.Log($"DocumentManager: Adding document {id}");

        var info = GetOrCreateDocumentInfo(id);
        
        // Update script with actual text
        info.Document = info.Document.WithText(text);

        // If connection info was already set, ensure globals are loaded
        if (info.Cluster != null)
        {
            _ = LoadSymbolsAsync(info);
        }

        RaiseDocumentAdded(id);
    }

    public void RemoveDocument(Uri id)
    {
        _logger?.Log($"DocumentManager: Removing document {id}");

        ImmutableInterlocked.TryRemove(ref _idToInfoMap, id, out _);
        RaiseDocumentRemoved(id);
    }

    /// <summary>
    /// Changes the cluster and database for the script.
    /// </summary>
    public Task UpdateConnectionAsync(Uri id, string? clusterName, string? databaseName, string? serverKind)
    {
        _logger?.Log($"DocumentManager: Updating document connection: {id} cluster: {clusterName ?? "<no-cluster>"} database: {databaseName ?? "<no-database>"}");

        var info = GetOrCreateDocumentInfo(id);
        
        // Update connection info
        info.Cluster = clusterName;
        info.Database = databaseName;
        info.ServerKind = serverKind;

        // Load symbols if we have a cluster
        if (clusterName != null)
        {
            // note: already calls UpdateScriptGlobals after loading symbols
            return LoadSymbolsAsync(info);
        }
        else
        {
            UpdateGlobals(info);
            ResolveSymbolsAsync(info);

            // No cluster, so just update globals to reflect that
            return Task.CompletedTask;
        }
    }

    /// <summary>
    /// Gets the current cluster and database for the script.
    /// </summary>
    public DocumentConnection GetConnection(Uri documentId)
    {
        if (_idToInfoMap.TryGetValue(documentId, out var info))
        {
            return new DocumentConnection(info.Cluster, info.Database);
        }
        else
        {
            return new DocumentConnection(null, null);
        }
    }

    private Task LoadSymbolsAsync(DocumentInfo info)
    {
        _logger?.Log($"DocumentManager: Ensuring symbols for (cluster: {info.Cluster}, database: {info.Database})");

        // ensure symbols are loaded for this cluster and database
        return info.LoadSymbolsQueue.Run(async (useThisCancellationToken) =>
        {
            if (info.Cluster != null)
            {
                // instruct symbol manager to load symbols for this cluster and database
                // this will trigger a globals changed event when done, which will update all the script globals
                await _symbolManager.EnsureSymbolsAsync(info.Cluster, info.Database, contextCluster: null, useThisCancellationToken);
                UpdateGlobals(info);
            }

            _ = ResolveSymbolsAsync(info);
        });
    }

    /// <summary>
    /// Change the text for the script.
    /// </summary>
    public Task UpdateTextAsync(Uri documentId, string newText)
    {
        if (_idToInfoMap.TryGetValue(documentId, out var info))
        {
            if (newText != info.Document.Text)
            {
                info.Document = info.Document.WithText(newText);

                RaiseDocumentChanged(documentId);

                return ResolveSymbolsAsync(info);
            }
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Resolve symbols for this document.
    /// </summary>
    private Task ResolveSymbolsAsync(DocumentInfo info)
    {
        // resolve symbols for this script using latest request queue.
        return info.ResolveSymbolsQueue.Run(async (useThisCancellationToken) =>
        {
            await _symbolManager.AddReferencedSymbolsAsync(info.Document, useThisCancellationToken).ConfigureAwait(false);
        });
    }

    /// <summary>
    /// Updates the document with the latest globals from the symbol manager.
    /// </summary>
    private void UpdateGlobals(Uri documentId)
    {
        if (_idToInfoMap.TryGetValue(documentId, out var info))
        {
            UpdateGlobals(info);
        }
    }

    /// <summary>
    /// Updates the document with the latest globals from the symbol manager.
    /// </summary>
    private void UpdateGlobals(DocumentInfo info)
    {
        var originalDoc = info.Document;

        // update script with latest symbols
        var newGlobals = originalDoc.Globals.WithClusterList(_symbolManager.Globals.Clusters);

        // set server kind (default to Engine if unknown)
        newGlobals = newGlobals.WithServerKind(info.ServerKind ?? Kusto.Language.ServerKinds.Engine);

        if (info.Cluster == null
            && newGlobals.Cluster != Language.Symbols.ClusterSymbol.Unknown)
        {
            newGlobals = newGlobals.WithCluster(Language.Symbols.ClusterSymbol.Unknown);
        }
        else if (info.Cluster != null
            && newGlobals.GetCluster(info.Cluster) is { } clusterSymbol
            && newGlobals.Cluster != clusterSymbol)
        {
            newGlobals = newGlobals.WithCluster(clusterSymbol);
        }

        if (info.Database == null
            && newGlobals.Database != Language.Symbols.DatabaseSymbol.Unknown)
        {
            newGlobals = newGlobals.WithDatabase(Language.Symbols.DatabaseSymbol.Unknown);
        }
        else if (info.Database != null
            && newGlobals.Cluster.GetDatabase(info.Database) is { } databaseSymbol
            && newGlobals.Database != databaseSymbol)
        {
            newGlobals = newGlobals.WithDatabase(databaseSymbol);
        }

        if (originalDoc.Globals != newGlobals)
        {
            var newDoc = originalDoc.WithGlobals(newGlobals);
            info.Document = newDoc;
            RaiseDocumentChanged(info.Id);
        }
    }

    /// <summary>
    /// Gets the document for the given id.
    /// </summary>
    public bool TryGetDocument(Uri documentId, [NotNullWhen(true)] out IDocument? document)
    {
        if (_idToInfoMap.TryGetValue(documentId, out var info))
        {
            UpdateGlobals(info);
            document = info.Document;
            return true;
        }
        document = null;
        return false;
    }
}