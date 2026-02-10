import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

/**
 * Forces VS Code to invalidate semantic token cache by making a real edit on all visible Kusto editors.
 */
export async function forceRefreshSemanticTokens(): Promise<void>
{
    for (const editor of vscode.window.visibleTextEditors)
    {
        if (editor.document.languageId === 'kusto')
        {
            try
            {
                // Get position at end of document
                const lastLine = Math.max(0, editor.document.lineCount - 1);
                const charOffset = editor.document.lineAt(lastLine).text.length;
                const endPos = new vscode.Position(lastLine, charOffset);

                // Insert a space at end (this changes document version)
                await editor.edit((editBuilder) =>
                {
                    editBuilder.insert(endPos, ' ');
                }, {
                    undoStopBefore: false,
                    undoStopAfter: false
                });

                // Immediately delete it (restores original content)
                await editor.edit((editBuilder) =>
                {
                    // Delete the space we just inserted (from endPos to endPos+1 character)
                    editBuilder.delete(new vscode.Range(endPos, endPos.translate(0, 1)));
                }, {
                    undoStopBefore: false,
                    undoStopAfter: false
                });
            }
            catch (e)
            {
            }
        }
    }
}

/**
 * Activates editor semantic features like semantic token colorings
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void
{
    // Handle workspace/semanticTokens/refresh notification from server
    // Vs code does not automatically redraw with new semantic tokens when this notification is received,
    //  so we need to force it manually
    client.onNotification('workspace/semanticTokens/refresh', forceRefreshSemanticTokens);

    // Force establishing semantic token provider for documents already open
    const serverCapabilities = client.initializeResult?.capabilities;
    if (serverCapabilities?.semanticTokensProvider)
    {
        // Small delay to ensure server is fully ready
        setTimeout(() =>
        {
            vscode.workspace.textDocuments.forEach(doc =>
            {
                if (doc.languageId === 'kusto')
                {
                    // Find visible editor for this document and trigger refresh
                    const editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
                    if (editor)
                    {
                        // Trigger semantic token refresh
                        vscode.commands.executeCommand('vscode.executeDocumentSemanticTokensProvider', doc.uri);
                    }
                }
            });
        }, 100);
    }

    // Also establish semantic token provider for new documents as they are opened
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(doc =>
        {
            if (doc.languageId === 'kusto')
            {
                // Small delay to ensure document is fully loaded
                setTimeout(() =>
                {
                    vscode.commands.executeCommand('vscode.executeDocumentSemanticTokensProvider', doc.uri);
                }, 100);
            }
        })
    );
}