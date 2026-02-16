import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';

/**
 * Activates editor decoration features like query separators.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {

    // Decoration for separator line between queries
    const querySeparatorDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: '0 0 3px 0',
        borderStyle: 'solid',
        borderColor: 'rgba(128, 128, 128, 0.25)',
    });

    // Map to track debounce timers per document URI
    const debounceTimers = new Map<string, NodeJS.Timeout>();

    /**
     * Requests query boundaries from the server and updates decorations.
     * @param uri The document URI
     */
    async function updateQuerySeparators(uri: string): Promise<void> {
        try {
            const result = await server.getQueryRanges(client, uri);

            if (!result) {
                return;
            }

            // Apply to all visible editors for this document (handles split views)
            const editors = vscode.window.visibleTextEditors.filter(
                e => e.document.uri.toString() === result.uri
            );

            const config = vscode.workspace.getConfiguration('kusto');
            const enableSeparators = config.get<boolean>('editor.showQuerySeparators', true);

            const firstEditor = editors[0];
            if (!firstEditor) {
                return;
            }

            const doc = firstEditor.document;

            // Create separator lines between queries (skip the first range)
            // Find the last non-empty line for each query
            const ranges = result.ranges
                // skip the first query range since there should be no separator before it
                .slice(1, result.ranges.length)
                // filter out query blocks that are just one empty lines
                .filter(r => doc.getText(new vscode.Range(r.start.line, 0, r.end.line, 0)).trim().length > 0)
                // filter out any block with a start line that is out of range
                .filter(r => r.start.line > 0 && r.start.line < doc.lineCount)
                // put decoration on line before start of the range
                .map(r => new vscode.Range(r.start.line - 1, 0, r.start.line - 1, 0));

            // Clear and set decorations on all editors showing this document
            for (const editor of editors) {
                editor.setDecorations(querySeparatorDecoration, []);  // clear first
                if (enableSeparators) {
                    editor.setDecorations(querySeparatorDecoration, ranges);
                }
            }
        } catch (error) {
            console.error(`Failed to get query ranges for ${uri}:`, error);
        }
    }

    // Update decorations when document opens
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (document.languageId === 'kusto') {
                await updateQuerySeparators(document.uri.toString());
            }
        })
    );

    // Update decorations when document changes (debounced to avoid race conditions and improve performance)
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.languageId === 'kusto') {
                const uri = event.document.uri.toString();
                
                // Clear existing timer for this document
                const existingTimer = debounceTimers.get(uri);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                }
                
                // Set new timer - waits for typing to stop before requesting boundaries
                // This ensures didChange notifications are sent to the server first
                const timer = setTimeout(() => {
                    updateQuerySeparators(uri);
                    debounceTimers.delete(uri);
                }, 300); // 300ms after last change
                
                debounceTimers.set(uri, timer);
            }
        })
    );

    // Update decorations for already open documents
    for (const document of vscode.workspace.textDocuments) {
        if (document.languageId === 'kusto') {
            updateQuerySeparators(document.uri.toString());
        }
    }
}
