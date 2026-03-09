// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;

namespace Kusto.Lsp;

public interface IDocumentManager
{
    /// <summary>
    /// Gets the Ids for the known documents
    /// </summary>
    ImmutableList<Uri> GetDocumentIds();

    /// <summary>
    /// Gets the documents connection information
    /// </summary>
    DocumentConnection GetConnection(Uri documentId);

    /// <summary>
    /// Adds a document to the manager
    /// </summary>
    void AddDocument(Uri documentId, string text);

    /// <summary>
    /// Removes a document from the manager.
    /// </summary>
    void RemoveDocument(Uri documentId);

    /// <summary>
    /// Gets the current document for the specified id
    /// </summary>
    bool TryGetDocument(Uri id, [NotNullWhen(true)] out IDocument? document);

    /// <summary>
    /// Updates the document's associated connection information.
    /// </summary>
    Task UpdateConnectionAsync(Uri documentId, string? clusterName, string? databaseName, string? serverKind);

    /// <summary>
    /// Updates the document's text
    /// </summary>
    Task UpdateTextAsync(Uri id, string newText);

    /// <summary>
    /// Refreshes schema for external symbols referenced by the document.
    /// </summary>
    Task RefreshReferencedSymbolsAsync(Uri documentId, CancellationToken cancellationToken);

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

public record struct DocumentConnection(string? Cluster, string? Database);