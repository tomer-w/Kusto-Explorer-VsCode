import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext, window } from 'vscode';
import * as conn from './features/connectionsPanel'
import * as connections from './features/connections'
import * as queries from './features/queries'
import * as chartPanel from './features/chartPanel'
import * as decorations from './features/decorations'
import * as semantics from './features/semantics'
import * as copilot from './features/copilot'
import * as codelens from './features/codelens'
import * as clipboard from './features/clipboard'
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
        outputChannel: outputChannel
    };

    client = new LanguageClient(
        'kustoLanguageServer',
        'Kusto Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client BEFORE activating features that send notifications
    await client.start();

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

    // activates semantic coloring
    semantics.activate(context, client);

    // activate editor decorations
    decorations.activate(context, client);

    // activate query execution features
    queries.activate(context, client);

    // activate copilot hooks
    copilot.activate(context, client);

    // activate codelens for queries
    codelens.activate(context, client);

    // activate clipboard interception
    clipboard.activate(context, client);
}

export function deactivate(): Thenable<void> | undefined
{
    if (!client)
    {
        return undefined;
    }
    return client.stop();
}