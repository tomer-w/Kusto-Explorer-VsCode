import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { getActiveDocumentConnection } from './connections';

const MIME_TYPE = 'application/vnd.kusto.entity';
const PASTE_KIND = vscode.DocumentDropOrPasteEditKind.Text.append('kusto');

/** Stored entity context from the last Copy Entity command. */
let lastCopiedEntity: EntityClipboardData | undefined;

interface EntityClipboardData {
    text: string;
    cluster: string;
    database: string;
}

/**
 * Called by the Copy Entity command to store source context alongside the clipboard text.
 * @param text The entity definition text placed on the clipboard
 * @param cluster The source cluster name
 * @param database The source database name
 */
export function setEntityClipboardContext(text: string, cluster: string, database: string): void {
    lastCopiedEntity = { text, cluster, database };
}

/**
 * Escapes a string for use inside a Kusto single-quoted string literal.
 * Handles backslashes and single quotes.
 */
function escapeKustoString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Activates clipboard features for Kusto documents.
 * Registers a DocumentPasteEditProvider that intercepts paste operations
 * to add #connect directives when pasting entities from a different context.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {

    context.subscriptions.push(
        vscode.languages.registerDocumentPasteEditProvider(
            { language: 'kusto' },
            {
                async provideDocumentPasteEdits(
                    document: vscode.TextDocument,
                    ranges: readonly vscode.Range[],
                    dataTransfer: vscode.DataTransfer,
                    context: vscode.DocumentPasteEditContext,
                    token: vscode.CancellationToken
                ): Promise<vscode.DocumentPasteEdit[] | undefined> {
                    if (!lastCopiedEntity) {
                        return undefined;
                    }

                    // Check that the clipboard text matches the stored entity definition
                    const textItem = dataTransfer.get('text/plain');
                    if (!textItem) {
                        return undefined;
                    }
                    const clipboardText = await textItem.asString();
                    if (clipboardText !== lastCopiedEntity.text) {
                        // Clipboard has changed since Copy Entity, let default paste handle it
                        lastCopiedEntity = undefined;
                        return undefined;
                    }

                    // Get the target document's connection
                    const targetConnection = getActiveDocumentConnection();
                    const sameCluster = targetConnection?.cluster === lastCopiedEntity.cluster;
                    const sameDatabase = sameCluster && targetConnection?.database === lastCopiedEntity.database;

                    if (sameDatabase) {
                        // Same context, no #connect needed — let default paste handle it
                        return undefined;
                    }

                    // Different context — prepend a #connect directive
                    const connectDirective = `#connect cluster('${escapeKustoString(lastCopiedEntity.cluster)}').database('${escapeKustoString(lastCopiedEntity.database)}')`;
                    const insertText = connectDirective + '\n' + lastCopiedEntity.text;

                    const edit = new vscode.DocumentPasteEdit(
                        insertText,
                        'Paste with connection context',
                        PASTE_KIND
                    );

                    return [edit];
                }
            },
            {
                providedPasteEditKinds: [PASTE_KIND],
                pasteMimeTypes: ['text/plain']
            }
        )
    );
}
