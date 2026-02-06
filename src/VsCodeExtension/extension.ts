import * as path from 'path';
import * as vscode from 'vscode';
import { workspace, ExtensionContext, window } from 'vscode';
import * as conn from './features/connections'
import * as queries from './features/queries'
import * as decorations from './features/decorations'
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

    const outputChannel = window.createOutputChannel('Kusto');5

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'kusto' }],
        synchronize: { 
            fileEvents: workspace.createFileSystemWatcher('**/*.{kql,csl,kusto}')
        },
        outputChannel: outputChannel,
    };

    client = new LanguageClient(
        'kustoLanguageServer',
        'Kusto Language Server',
        serverOptions,
        clientOptions
    );

    // Start the client BEFORE activating features that send notifications
    await client.start();

    // activate connections panel and related features
    await conn.activate(context, client);    

    // activate query execution features
    queries.activate(context, client);

    // activate editor decorations
    decorations.activate(context, client);
}

export function deactivate(): Thenable<void> | undefined
{
    if (!client)
    {
        return undefined;
    }
    return client.stop();
}