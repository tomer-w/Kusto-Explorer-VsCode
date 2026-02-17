import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';

const PASTE_KIND = vscode.DocumentDropOrPasteEditKind.Text.append('kusto');

/** Stored clipboard context from the last copy operation with context. */
let lastCopiedContext: ClipboardContext | undefined;

/** Generic clipboard context that can carry arbitrary metadata. */
export interface ClipboardContext {
    /** The text placed on the system clipboard. Used to verify the clipboard hasn't changed. */
    text: string;
    /** The kind of content that was copied (e.g. 'entity', 'query'). */
    kind: string;
    /** The source cluster name. */
    entityCluster?: string;
    /** The source database name. */
    entityDatabase?: string;
    /** The type of entity being copied (e.g. 'Table', 'Function'). */
    entityType?: string;
    /** The name of the entity being copied. */
    entityName?: string;
}

/**
 * Stores clipboard context alongside the system clipboard text.
 * Call this when copying content that should carry source connection metadata.
 */
export function setClipboardContext(context: ClipboardContext): void {
    lastCopiedContext = context;
}

let languageClient: LanguageClient | undefined;

/**
 * Activates clipboard features for Kusto documents.
 * Registers a DocumentPasteEditProvider that intercepts paste operations
 * and delegates to the server to transform the pasted text based on source/target context.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    languageClient = client;

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
                    if (!lastCopiedContext || !languageClient) {
                        return undefined;
                    }

                    // Check that the clipboard text matches the stored context
                    const textItem = dataTransfer.get('text/plain');
                    if (!textItem) {
                        return undefined;
                    }
                    const clipboardText = await textItem.asString();
                    if (clipboardText !== lastCopiedContext.text) {
                        // Clipboard has changed since the contextual copy, let default paste handle it
                        lastCopiedContext = undefined;
                        return undefined;
                    }

                    // Get the insertion position (first range's start)
                    const insertPosition = ranges[0]?.start;
                    if (!insertPosition) {
                        return undefined;
                    }

                    // Ask the server to transform the paste
                    const result = await server.transformPaste(
                        languageClient,
                        lastCopiedContext.text,
                        lastCopiedContext.kind,
                        document.uri.toString(),
                        { line: insertPosition.line, character: insertPosition.character },
                        lastCopiedContext.entityCluster,
                        lastCopiedContext.entityDatabase,
                        lastCopiedContext.entityType,
                        lastCopiedContext.entityName,
                    );

                    if (!result || result === lastCopiedContext.text) {
                        // Server returned no change, let default paste handle it
                        return undefined;
                    }

                    const edit = new vscode.DocumentPasteEdit(
                        result,
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
