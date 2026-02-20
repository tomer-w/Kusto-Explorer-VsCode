import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext, window } from 'vscode';
import * as conn from './features/connectionsPanel'
import * as connections from './features/connections'
import * as documentPanels from './features/documentPanels'
import * as chartPanel from './features/chartPanel'
import * as copilot from './features/copilot'
import * as connectionStatusBar from './features/connectionStatusBar'
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
    const serverExecutable: Executable = {
        command: path.join(context.extensionPath, 'server', 'KustoLspServer.exe'),
        args: ["vscode"]
    };

    const serverOptions: ServerOptions = {
        run: serverExecutable,
        debug: serverExecutable
    };

    const outputChannel = window.createOutputChannel('Kusto');

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'kusto' }],
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

    // Register command to fix doubled commit characters after completion acceptance
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.fixCommitCharDoubling', fixCommitCharDoubling)
    );

    // Track Kusto session state - keep views visible while in a Kusto session
    const updateKustoContext = () => {
        // Check if any Kusto documents are open OR if chart panel exists
        const hasKustoDocument = vscode.workspace.textDocuments.some(doc => doc.languageId === 'kusto');
        const isKustoActive = hasKustoDocument || chartPanel.hasChartPanel();
        vscode.commands.executeCommand('setContext', 'kusto.hasActiveDocument', isKustoActive);
    };

    // Command to notify when chart panel state changes (triggers context update)
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.chartPanelStateChanged', () => {
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
    connections.activate(context, client);

    // activate connections panel and related features
    await conn.activate(context, client);

    // Create status bar item for connection status
    connectionStatusBar.activate(context);

    // activate query execution features
    documentPanels.activate(context, client);

    // activate copilot hooks
    copilot.activate(context, client);
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
