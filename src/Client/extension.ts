// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext, window } from 'vscode';
import * as conn from './features/connectionsPanel'
import * as connections from './features/connections'
import * as queryDocuments from './features/queryDocuments'
import * as resultsViewer from './features/resultsViewer'
import * as copilot from './features/copilot'
import { ConnectionStatusBar } from './features/connectionStatusBar'
import * as dotnet from './features/dotnet'
import { ResultsCache } from './features/resultsCache'
import { Clipboard } from './features/clipboard'
import * as scratchPad from './features/scratchPad'
import * as history from './features/history'
import * as importFeature from './features/import'
import { SCRATCH_PAD_SCHEME } from './features/scratchPad'
import { EntityDefinitionProvider, ENTITY_DEFINITION_SCHEME } from './features/entityDefinitionProvider'
import { Server } from './features/server'
import
    {
        LanguageClient,
        LanguageClientOptions,
        ServerOptions,
        Executable
    } from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext)
{
    // Create output channel early so dotnet activation can log to it
    const outputChannel = window.createOutputChannel('Kusto');

    // Find or acquire .NET runtime before starting the language server
    const dotnetPath = await dotnet.activate(outputChannel);
    if (!dotnetPath) {
        return;
    }

    const serverDll = path.join(context.extensionPath, 'server', 'Server.dll');
    const serverExecutable: Executable = {
        command: dotnetPath,
        args: [serverDll, "vscode"]
    };

    const serverOptions: ServerOptions = {
        run: serverExecutable,
        debug: serverExecutable
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'kusto' },
            { scheme: ENTITY_DEFINITION_SCHEME, language: 'kusto' },
            { scheme: SCRATCH_PAD_SCHEME, language: 'kusto' }
        ],
        synchronize: { 
            fileEvents: workspace.createFileSystemWatcher('**/*.{kql,csl,kusto}')
        },
        outputChannel: outputChannel,
        middleware: {
            provideCompletionItem: async (document, position, context, token, next) => {
                const result = await next(document, position, context, token);
                const globalCommitChars = client?.initializeResult?.capabilities
                    ?.completionProvider?.allCommitCharacters ?? [];
                return fixCompletionCommit(result, globalCommitChars);
            }
        }
    };

    client = new LanguageClient(
        'kustoLanguageServer',
        'Kusto Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client BEFORE activating features that send notifications
    await client.start();

    // Create the server wrapper for all direct server interactions
    const server = new Server(client, context);

    // Initialize results cache with the language client
    const resultsCache = new ResultsCache(server);
    const clipboard = new Clipboard();

    // Register "Go to Definition" provider for kusto-entity:// URIs (database entities)
    const entityDefinitionProvider = new EntityDefinitionProvider(server);
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(ENTITY_DEFINITION_SCHEME, entityDefinitionProvider),
        entityDefinitionProvider
    );

    // Register command to fix doubled commit characters after completion acceptance
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.fixCommitCharDoubling', fixCommitCharDoubling)
    );

    // Track Kusto session state - keep views visible while in a Kusto session
    const updateKustoContext = () => {
        // Check if any Kusto documents are open OR if singleton results view exists
        const hasKustoDocument = vscode.workspace.textDocuments.some(doc => doc.languageId === 'kusto');
        const hasSingletonView = resultsViewer.hasSingletonResultsView();
        const isKustoActive = hasKustoDocument || hasSingletonView;
        vscode.commands.executeCommand('setContext', 'kusto.hasActiveDocument', isKustoActive);
        vscode.commands.executeCommand('setContext', 'kusto.hasSingletonView', hasSingletonView);

        // Track whether the active editor is showing a read-only entity definition
        const activeEditor = vscode.window.activeTextEditor;
        const isEntityDef = activeEditor?.document.uri.scheme === ENTITY_DEFINITION_SCHEME;
        vscode.commands.executeCommand('setContext', 'kusto.isEntityDefinition', isEntityDef);

        // Track whether the active editor is a scratch pad document
        const isScratchPad = activeEditor?.document.uri.scheme === SCRATCH_PAD_SCHEME;
        vscode.commands.executeCommand('setContext', 'kusto.isScratchPad', isScratchPad);
    };

    // Command to notify when singleton view state changes (triggers context update)
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.singletonViewStateChanged', () => {
            updateKustoContext();
        })
    );

    // Update context on activation
    updateKustoContext();

    // Update context when documents are opened/closed or when active editor changes
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(() => updateKustoContext()),
        vscode.workspace.onDidCloseTextDocument(() => updateKustoContext()),
        vscode.window.onDidChangeActiveTextEditor(() => updateKustoContext())
    );

    // activate connections data layer
    connections.activate(context, server);

    // activate connections panel and related features
    await conn.activate(context, server, clipboard);

    // activate import from Kusto Explorer
    importFeature.activate(context);

    // Create status bar item showing the active document's cluster and database connection.
    // The ConnectionStatusBar instance is not referenced — it updates itself via editor change events.
    new ConnectionStatusBar(context);

    // activate query execution features
    queryDocuments.activate(context, server, resultsCache, clipboard);

    // activate scratch pad documents
    await scratchPad.activate(context);

    // activate query history
    await history.activate(context);

    // activate chart file editor (.kchart)
    resultsViewer.activate(context, server, clipboard);

    // activate copilot hooks
    copilot.activate(context, server);
}

export function deactivate(): Thenable<void> | undefined
{
    if (!client)
    {
        return undefined;
    }
    return client.stop();
}

/**
 * Identifies completion items where a commit character also appears in the insertText,
 * which would cause the character to be doubled when used to commit the completion.
 * Attaches a post-completion command that detects and removes the duplicate.
 * @param globalCommitChars Commit characters defined in server capabilities (apply to all items)
 */
function fixCompletionCommit(
    result: vscode.CompletionItem[] | vscode.CompletionList | null | undefined,
    globalCommitChars: string[]
): vscode.CompletionItem[] | vscode.CompletionList | null | undefined {
    if (!result) {
        return result;
    }

    const items = Array.isArray(result) ? result : result.items;

    for (const item of items) {
        // Use per-item commit characters if set, otherwise fall back to global
        const commitChars = (item.commitCharacters && item.commitCharacters.length > 0)
            ? item.commitCharacters
            : globalCommitChars;

        if (commitChars.length === 0) {
            continue;
        }

        const insertText = typeof item.insertText === 'string'
            ? item.insertText
            : item.insertText instanceof vscode.SnippetString
                ? item.insertText.value
                : undefined;

        if (!insertText) {
            continue;
        }

        // Find commit characters that appear in the insert text and could be doubled
        const conflicting = commitChars.filter(ch => insertText.includes(ch));
        if (conflicting.length > 0) {
            // Attach a command that runs after the completion is accepted.
            // It checks if the typed commit character was doubled and removes the duplicate.
            item.command = {
                title: '',
                command: 'kusto.fixCommitCharDoubling',
                arguments: [conflicting, item.command]
            };
        }
    }

    return result;
}

/**
 * Handles the post-completion fix for doubled commit characters.
 * The command fires before the commit character is inserted into the document,
 * so we listen for the next document change and use the change event to find
 * where the commit character was inserted, then check if it caused a doubling.
 */
async function fixCommitCharDoubling(commitChars: string[], originalCommand?: vscode.Command): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'kusto') {
        const disposable = vscode.workspace.onDidChangeTextDocument(async (e) => {
            if (e.document !== editor.document) {
                return;
            }
            disposable.dispose();

            // Find a single-character insertion that matches a conflicting commit char
            for (const change of e.contentChanges) {
                if (change.text.length === 1 && commitChars.includes(change.text)) {
                    // The commit char was inserted at change.range.start
                    // Check if the character just before it is the same
                    const insertPos = change.range.start;
                    if (insertPos.character >= 1) {
                        const charBefore = e.document.getText(
                            new vscode.Range(insertPos.translate(0, -1), insertPos)
                        );
                        if (charBefore === change.text) {
                            // Delete the duplicate (the newly inserted one, now at insertPos)
                            await editor.edit(eb => {
                                eb.delete(new vscode.Range(insertPos, insertPos.translate(0, 1)));
                            }, { undoStopBefore: false, undoStopAfter: false });
                        }
                    }
                    break;
                }
            }
        });

        // Safety: dispose the listener if no change comes within 1 second
        setTimeout(() => disposable.dispose(), 1000);
    }

    // Preserve any original command from the server
    if (originalCommand) {
        await vscode.commands.executeCommand(originalCommand.command, ...(originalCommand.arguments ?? []));
    }
}
