// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

// =============================================================================
// Module-level State
// =============================================================================

let extensionContext: vscode.ExtensionContext | undefined;

// =============================================================================
// Activation
// =============================================================================

/**
 * Activates the client storage module with the extension context and language client.
 * Registers handlers for server-to-client storage requests.
 * Must be called after the client has started.
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    extensionContext = context;

    // Register handler for server's request to get data
    client.onRequest('kusto/getData', handleGetData);

    // Register handler for server's request to set data
    client.onRequest('kusto/setData', handleSetData);
}

// =============================================================================
// Request Parameter Types
// =============================================================================

interface GetDataParams {
    key: string;
}

interface SetDataParams {
    key: string;
    data: object | undefined;
}

// =============================================================================
// Request Handlers
// =============================================================================

/**
 * Handles the server's request to get stored data.
 * Returns the data as an object, or null if not found.
 */
async function handleGetData(params: GetDataParams): Promise<object | null> {
    if (!extensionContext) {
        return null;
    }

    const data = extensionContext.globalState.get<object>(params.key);
    return data ?? null;
}

/**
 * Handles the server's request to store data.
 * Pass undefined to remove the key.
 */
async function handleSetData(params: SetDataParams): Promise<void> {
    if (!extensionContext) {
        return;
    }

    await extensionContext.globalState.update(params.key, params.data);
}

