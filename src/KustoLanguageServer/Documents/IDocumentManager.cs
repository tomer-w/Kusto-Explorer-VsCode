using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using Kusto.Language.Editor;


namespace Kusto.Lsp;

public interface IDocumentManager
{
    /// <summary>
    /// Gets the Ids for the known documents
    /// </summary>
    ImmutableList<Uri> GetDocumentIds();

    /// <summary>
    /// Adds a document to the manager
    /// </summary>
    void AddDocument(Uri documentId, string text);

    /// <summary>
    /// Removes a document from the manager.
    /// </summary>
    void RemoveScript(Uri documentId);

    /// <summary>
    /// Updates the document's associated connection information.
    /// </summary>
    void UpdateConnection(Uri documentId, string? clusterOrConnection, string? database);

    /// <summary>
    /// Gets the documents connection information
    /// </summary>
    (string? Cluster, string? Database) GetConnection(Uri documentId);

    /// <summary>
    /// Updates the document's text
    /// </summary>
    void UpdateText(Uri id, string newText);

    /// <summary>
    /// Updates the documents globals
    /// </summary>
    void UpdateGlobals(Uri id);

    /// <summary>
    /// Gets the current document for the specified id
    /// </summary>
    bool TryGetDocument(Uri id, [NotNullWhen(true)] out Document? document);

    /// <summary>
    /// An event fired when the document is added.
    /// </summary>
    event EventHandler<Uri>? DocumentAdded;

    /// <summary>
    /// An event fired when the document is removed.
    /// </summary>
    event EventHandler<Uri>? DocumentRemoved;

    /// <summary>
    /// An event fired when the document changes
    /// </summary>
    event EventHandler<Uri>? DocumentChanged;
}
