import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { EntityDefinitionContentResult } from './server';

/**
 * URI scheme for virtual entity definition documents.
 * Must match the scheme used in the language server (KustoLspServer.cs).
 */
export const ENTITY_DEFINITION_SCHEME = 'kusto-entity';

/**
 * Provides content for virtual entity definition documents.
 * 
 * When the user performs "Go to Definition" on a database entity (table, function, etc.),
 * the language server returns a URI with the 'kusto-entity' scheme. VS Code then calls
 * this provider to get the document content, which displays the entity's create command.
 * 
 * This mimics Visual Studio's "metadata as source" feature for decompiled types.
 */
export class EntityDefinitionProvider implements vscode.TextDocumentContentProvider {
    private readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChange = this._onDidChange.event;

    constructor(private readonly client: LanguageClient) {}

    async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        try {
            const result = await this.client.sendRequest<EntityDefinitionContentResult | null>(
                'kusto/getEntityDefinitionContent',
                { uri: uri.toString() },
                token
            );

            if (result?.content) {
                return result.content;
            }
        } catch (error) {
            console.error('Failed to get entity definition content:', error);
        }

        return '// Unable to retrieve entity definition';
    }

    /**
     * Invalidates the cached content for a URI, causing VS Code to request fresh content.
     * Call this if you know the entity definition has changed on the server.
     */
    refresh(uri: vscode.Uri): void {
        this._onDidChange.fire(uri);
    }

    dispose(): void {
        this._onDidChange.dispose();
    }
}

/**
 * Registers the entity definition content provider with VS Code.
 * Call this during extension activation after the language client is ready.
 * 
 * @param context The extension context for managing subscriptions
 * @param client The language client for LSP communication
 * @returns The registered provider instance
 */
export function registerEntityDefinitionProvider(
    context: vscode.ExtensionContext,
    client: LanguageClient
): EntityDefinitionProvider {
    const provider = new EntityDefinitionProvider(client);
    
    // Register the provider for the kusto-entity URI scheme
    const registration = vscode.workspace.registerTextDocumentContentProvider(
        ENTITY_DEFINITION_SCHEME,
        provider
    );
    
    context.subscriptions.push(registration);
    context.subscriptions.push(provider);
    
    return provider;
}
