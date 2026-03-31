// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module bridges the language server and VS Code's persistent storage.
 * The server sends kusto/getData and kusto/setData requests, and this module reads from or writes to
 * the extension's globalState in response, allowing the server to persist data across sessions.
 */

import * as vscode from 'vscode';
import { Server } from './server';
import type { GetDataParams, SetDataParams } from './server';

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
export function activate(context: vscode.ExtensionContext, server: Server): void {
    extensionContext = context;

    // Register handler for server's request to get data
    server.onGetData(handleGetData);

    // Register handler for server's request to set data
    server.onSetData(handleSetData);
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

