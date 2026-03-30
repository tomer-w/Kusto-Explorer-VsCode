// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module manages the status bar item that shows the active document's Kusto connection.
 * It displays the current cluster and database, and updates automatically when the active editor
 * or its connection changes.
 */

import * as vscode from 'vscode';
import * as connections from './connections';

let connectionStatusBarItem: vscode.StatusBarItem | undefined;

/**
 * Creates and shows the connection status bar item.
 * @param context The extension context for registering disposables
 */
export function activate(context: vscode.ExtensionContext): void {
    connectionStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0  // priority (higher = more to the left)
    );
    connectionStatusBarItem.text = "$(database) not connected";
    connectionStatusBarItem.show();
    context.subscriptions.push(connectionStatusBarItem);

    // Update status bar when the active document's connection changes
    context.subscriptions.push(connections.registerOnDocumentConnectionChanged(async (uri: string) => {
        if (vscode.window.activeTextEditor?.document.uri.toString() === uri) {
            updateStatusBar();
        }
    }));

    // Update status bar when active editor changes
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        updateStatusBar();
    }));

    // Initialize status bar for currently active editor
    updateStatusBar();
}

/**
 * Updates the status bar item to reflect the connection for the active document.
 * @param cluster The cluster name, or undefined if not connected
 * @param database The database name, or undefined if not selected
 */
function update(cluster: string | undefined, database: string | undefined): void {
    if (!connectionStatusBarItem) return;

    if (!cluster) {
        connectionStatusBarItem.text = `$(database) not connected`;
    } else if (!database) {
        connectionStatusBarItem.text = `$(database) cluster('${cluster}')`;
    } else {
        connectionStatusBarItem.text = `$(database) cluster('${cluster}').database('${database}')`;
    }
}

/**
 * Shows the status bar item.
 */
function show(): void {
    connectionStatusBarItem?.show();
}

/**
 * Hides the status bar item.
 */
function hide(): void {
    connectionStatusBarItem?.hide();
}

/**
 * Updates the status bar item to reflect the connection for the active document.
 */
async function updateStatusBar(): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor || editor.document.languageId !== 'kusto') {
        hide();
        return;
    }

    show();
    const connection = await connections.getDocumentConnection(editor.document.uri.toString());
    update(connection?.cluster, connection?.database);
}
