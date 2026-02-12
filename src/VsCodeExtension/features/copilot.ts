import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as conn from './connections';

/**
 * Tool that provides database schema information to Copilot.
 * Copilot will automatically invoke this when it needs schema context.
 */
class KustoDatabaseSchemaTool implements vscode.LanguageModelTool<{ cluster?: string; database?: string }> {
    
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<{ cluster?: string; database?: string }>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        // Get connection from parameters or active document
        let cluster = options.input.cluster;
        let database = options.input.database;
        
        if (!cluster || !database) {
            const activeConnection = conn.getActiveDocumentConnection();
            if (activeConnection) {
                cluster = cluster ?? activeConnection.cluster;
                database = database ?? activeConnection.database;
            }
        }
        
        if (!cluster) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart('No Kusto connection available. Please connect to a cluster and database first.')
            ]);
        }
        
        const dbSchema = await conn.getDatabaseSchema(cluster, database ?? '');
        
        if (!dbSchema) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Unable to fetch schema for ${cluster}/${database ?? 'unknown'}.`)
            ]);
        }
        
        const schemaJson = JSON.stringify(dbSchema, null, 2);
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Kusto database schema for ${cluster}/${dbSchema.name}:\n${schemaJson}`)
        ]);
    }
}

/**
 * Activates Copilot integration features for Kusto.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    // Register the Language Model Tool - Copilot can use this automatically
    const schemaTool = vscode.lm.registerTool('kusto_getDatabaseSchema', new KustoDatabaseSchemaTool());
    context.subscriptions.push(schemaTool);
}
