// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as conn from './connections';
import * as server from './server';

const COPILOT_PARTICIPANT_ID = 'kusto';
const MAX_SCHEMA_CHARS = 30000; // Approximate limit to stay within token limits


// =============================================================================
// Activation
// =============================================================================

/**
 * Activates Copilot integration features for Kusto.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    // Register the Language Model Tool - can be referenced with #kusto_getDatabaseSchema
    const schemaTool = vscode.lm.registerTool('kusto_getDatabaseSchema', new KustoDatabaseSchemaTool());
    context.subscriptions.push(schemaTool);
    
    // Register the Chat Participant - user invokes with @kusto
    const participant = vscode.chat.createChatParticipant(COPILOT_PARTICIPANT_ID, handleChatRequest);
    participant.iconPath = new vscode.ThemeIcon('database');
    context.subscriptions.push(participant);
}


// =============================================================================
// Language Model Tool - Can be referenced with #kusto_getDatabaseSchema
// =============================================================================

/**
 * Tool that provides database schema information to Copilot.
 */
class KustoDatabaseSchemaTool implements vscode.LanguageModelTool<{ cluster?: string; database?: string }> {
    
    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<{ cluster?: string; database?: string }>,
        token: vscode.CancellationToken
    ): Promise<vscode.PreparedToolInvocation> {
        let cluster = options.input.cluster;
        let database = options.input.database;
        
        if (!cluster || !database) {
            const activeConnection = await conn.getActiveDocumentConnection();
            if (activeConnection) {
                cluster = cluster ?? activeConnection.cluster;
                database = database ?? activeConnection.database;
            }
        }
        
        const connectionInfo = cluster 
            ? `${cluster}/${database ?? 'default'}` 
            : 'active connection';
            
        return {
            invocationMessage: `Getting Kusto database schema from ${connectionInfo}...`
        };
    }
    
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<{ cluster?: string; database?: string }>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        let cluster = options.input.cluster;
        let database = options.input.database;
        
        if (!cluster || !database) {
            const activeConnection = await conn.getActiveDocumentConnection();
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

// =============================================================================
// Chat Participant - User invokes with @kusto
// =============================================================================

/**
 * Handles the Copilot chat request for the @kusto participant.
 */
async function handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    // Get the active document's connection
    const activeConnection = await conn.getActiveDocumentConnection();
    
    if (!activeConnection) {
        stream.markdown('⚠️ No active Kusto connection.\n\nPlease:\n1. Open a `.kql` file\n2. Click on a database in the **Connections** panel to connect');
        return { metadata: { command: '' } };
    }
    
    if (!activeConnection.database) {
        stream.markdown(`⚠️ Connected to cluster **${activeConnection.cluster}** but no database selected.\n\nPlease click on a database in the **Connections** panel.`);
        return { metadata: { command: '' } };
    }
    
    // Fetch the database schema
    stream.progress(`Fetching schema for ${activeConnection.cluster}/${activeConnection.database}...`);
    
    let dbSchema: server.DatabaseInfo | undefined;
    try {
        dbSchema = await conn.getDatabaseSchema(activeConnection.cluster, activeConnection.database);
    } catch (error) {
        stream.markdown(`❌ Error fetching schema: ${error}`);
        return { metadata: { command: '' } };
    }
    
    if (!dbSchema) {
        stream.markdown(`❌ Unable to fetch schema for **${activeConnection.cluster}/${activeConnection.database}**.\n\nThe database may not exist or you may not have access.`);
        return { metadata: { command: '' } };
    }
    
    // Check if schema has any content
    const tableCount = (dbSchema.tables?.length ?? 0) + 
                       (dbSchema.externalTables?.length ?? 0) + 
                       (dbSchema.materializedViews?.length ?? 0);
    const functionCount = dbSchema.functions?.length ?? 0;
    
    if (tableCount === 0 && functionCount === 0) {
        stream.markdown(`⚠️ Schema for **${activeConnection.database}** appears to be empty.\n\nFound: ${JSON.stringify(dbSchema, null, 2)}`);
        return { metadata: { command: '' } };
    }
    
    // Show what we found
    stream.markdown(`Using schema from **${activeConnection.cluster}/${activeConnection.database}** (${tableCount} tables, ${functionCount} functions)\n\n---\n\n`);
    
    // Compress schema to fit within token limits
    const compressedSchema = compressSchema(dbSchema);
    
    // Combine schema context and user question into a single prompt
    const combinedPrompt = `You are a Kusto Query Language (KQL) expert assistant. 

IMPORTANT: Below is the database schema. Use ONLY these table and column names:

${compressedSchema}

Rules:
- Use ONLY the table and column names from the schema above
- Do NOT make up table or column names
- Follow KQL best practices

User question: ${request.prompt}`;

    // Use the language model to generate a response
    try {
        // Get available chat models - VS Code returns them in preference order
        const models = await vscode.lm.selectChatModels({});
        const model = models?.[0];
        
        if (model) {
            stream.markdown(`*Using model: ${model.name}*\n\n`);
            
            const messages = [
                vscode.LanguageModelChatMessage.User(combinedPrompt)
            ];
            
            const chatResponse = await model.sendRequest(messages, {}, token);
            
            for await (const fragment of chatResponse.text) {
                stream.markdown(fragment);
            }
        } else {
            stream.markdown('❌ No language model available. Please ensure GitHub Copilot is installed and active.');
        }
    } catch (error) {
        if (error instanceof vscode.LanguageModelError) {
            stream.markdown(`❌ Language model error: ${error.message}`);
        } else {
            stream.markdown(`❌ Unexpected error: ${error}`);
        }
    }
    
    return { metadata: { command: '' } };
}


// =============================================================================
// Schema Compression - Reduce schema size to fit within token limits
// =============================================================================

/**
 * Compresses the database schema to fit within token limits.
 * Prioritizes table/column names over descriptions.
 */
function compressSchema(dbSchema: server.DatabaseInfo): string {
    const lines: string[] = [];
    lines.push(`Database: ${dbSchema.name}`);
    
    // Helper to format columns compactly
    const formatColumns = (columns?: server.DatabaseColumnInfo[]): string => {
        if (!columns || columns.length === 0) return '';
        return columns.map(c => `${c.name}:${c.type}`).join(', ');
    };
    
    // Tables (most important)
    if (dbSchema.tables && dbSchema.tables.length > 0) {
        lines.push('\nTables:');
        for (const table of dbSchema.tables) {
            const cols = formatColumns(table.columns);
            lines.push(`  ${table.name}(${cols})`);
        }
    }
    
    // Materialized Views
    if (dbSchema.materializedViews && dbSchema.materializedViews.length > 0) {
        lines.push('\nMaterialized Views:');
        for (const view of dbSchema.materializedViews) {
            const cols = formatColumns(view.columns);
            lines.push(`  ${view.name}(${cols})`);
        }
    }
    
    // External Tables
    if (dbSchema.externalTables && dbSchema.externalTables.length > 0) {
        lines.push('\nExternal Tables:');
        for (const table of dbSchema.externalTables) {
            const cols = formatColumns(table.columns);
            lines.push(`  ${table.name}(${cols})`);
        }
    }
    
    // Functions (compact format)
    if (dbSchema.functions && dbSchema.functions.length > 0) {
        lines.push('\nFunctions:');
        for (const func of dbSchema.functions) {
            lines.push(`  ${func.name}${func.parameters ?? '()'}`);
        }
    }
    
    let result = lines.join('\n');
    
    // If still too large, truncate and add note
    if (result.length > MAX_SCHEMA_CHARS) {
        result = result.substring(0, MAX_SCHEMA_CHARS);
        result += '\n\n[Schema truncated due to size...]';
    }
    
    return result;
}
