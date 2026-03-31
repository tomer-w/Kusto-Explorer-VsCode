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

/**
 * Bridges the language server and VS Code's persistent storage.
 * The server sends kusto/getData and kusto/setData requests, and this class reads from or writes to
 * the extension's globalState in response, allowing the server to persist data across sessions.
 *
 * This class is self-contained: the constructor registers server request handlers that
 * remain active for the lifetime of the extension. No external code calls into it directly.
 */
export class ClientStorage {
    constructor(
        private readonly context: vscode.ExtensionContext,
        server: Server
    ) {
        server.onGetData(params => this.handleGetData(params));
        server.onSetData(params => this.handleSetData(params));
    }

    private async handleGetData(params: GetDataParams): Promise<object | null> {
        const data = this.context.globalState.get<object>(params.key);
        return data ?? null;
    }

    private async handleSetData(params: SetDataParams): Promise<void> {
        await this.context.globalState.update(params.key, params.data);
    }
}

