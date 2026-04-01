// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module manages the status bar item that shows the active document's Kusto connection.
 * It displays the current cluster and database, and updates automatically when the active editor
 * or its connection changes.
 */

import * as vscode from 'vscode';
import type { ConnectionManager } from './connectionManager';

/**
 * Status bar item that shows the active document's Kusto connection (cluster and database).
 * Updates automatically when the active editor or its connection changes.
 */
export class ConnectionStatusBar {
    private readonly statusBarItem: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext, private readonly connections: ConnectionManager) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            0  // priority (higher = more to the left)
        );
        this.statusBarItem.text = "$(database) not connected";
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);

        // Update status bar when the active document's connection changes
        context.subscriptions.push(this.connections.registerOnDocumentConnectionChanged(async (uri: string) => {
            if (vscode.window.activeTextEditor?.document.uri.toString() === uri) {
                this.refresh();
            }
        }));

        // Update status bar when active editor changes
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
            this.refresh();
        }));

        // Initialize status bar for currently active editor
        this.refresh();
    }

    /**
     * Updates the status bar to reflect the connection for the active document.
     */
    private async refresh(): Promise<void> {
        const editor = vscode.window.activeTextEditor;

        if (!editor || editor.document.languageId !== 'kusto') {
            this.statusBarItem.hide();
            return;
        }

        this.statusBarItem.show();
        const connection = await this.connections.getDocumentConnection(editor.document.uri.toString());

        if (!connection?.cluster) {
            this.statusBarItem.text = `$(database) not connected`;
        } else if (!connection.database) {
            this.statusBarItem.text = `$(database) cluster('${connection.cluster}')`;
        } else {
            this.statusBarItem.text = `$(database) cluster('${connection.cluster}').database('${connection.database}')`;
        }
    }
}
