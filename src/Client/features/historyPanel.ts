// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module provides the "History" tree view in the sidebar, letting users
 * browse, open, and delete past queries. Delegates all data operations to
 * the {@link HistoryManager}.
 */

import * as vscode from 'vscode';
import { HistoryManager, HistoryEntry } from './historyManager';

// =============================================================================
// HistoryPanel — UI layer: tree view, commands
// =============================================================================

/**
 * Provides the sidebar tree view and command handlers for query history.
 * Delegates all data operations to the {@link HistoryManager}.
 */
export class HistoryPanel {
    private readonly treeProvider: HistoryTreeProvider;
    private readonly treeView: vscode.TreeView<HistoryItem>;

    constructor(context: vscode.ExtensionContext, private readonly manager: HistoryManager) {
        this.treeProvider = new HistoryTreeProvider(manager);
        this.treeView = vscode.window.createTreeView('kusto.history', {
            treeDataProvider: this.treeProvider,
        });
        context.subscriptions.push(this.treeView);

        // Refresh the tree whenever the manager reports a data change
        manager.onDidChange(() => this.treeProvider.refresh());

        // Auto-reveal newly added entries in the tree view
        manager.onDidAddEntry((meta) => {
            this.treeProvider.refresh();
            const item = new HistoryItem(meta);
            this.treeView.reveal(item, { select: true, focus: false });
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('kusto.openHistoryItem', (item: HistoryItem) => this.openHistoryItem(item)),
            vscode.commands.registerCommand('kusto.deleteHistoryItem', (item: HistoryItem) => this.deleteHistoryItem(item)),
            vscode.commands.registerCommand('kusto.clearHistory', () => this.clearHistory()),
        );
    }

    // ─── Command Handlers ───────────────────────────────────────────────

    /** Opens a history item in the singleton results view. */
    private async openHistoryItem(item: HistoryItem): Promise<void> {
        const uri = this.manager.getHistoryFileUri(item.meta.fileName);
        const resultData = this.manager.readHistoryFile(uri);
        if (!resultData) {
            vscode.window.showErrorMessage('Failed to read history entry.');
            return;
        }

        // Import dynamically to avoid circular dependency at module level
        const { displayResultsInPanel, displayResultsInSingletonView, setSingletonBackingUri, getServer } = await import('./resultsViewer');
        const srv = getServer();
        if (!srv) { return; }

        setSingletonBackingUri(uri);
        await displayResultsInPanel(resultData, 'detail');
        await displayResultsInSingletonView(resultData, 'chart', true);
    }

    /** Deletes a history item after confirmation. */
    private async deleteHistoryItem(item: HistoryItem): Promise<void> {
        await this.manager.deleteEntry(item.meta.fileName);
    }

    /** Clears all history after confirmation. */
    private async clearHistory(): Promise<void> {
        const confirm = await vscode.window.showWarningMessage(
            'Delete all query history?',
            { modal: true },
            'Delete All'
        );
        if (confirm !== 'Delete All') { return; }

        await this.manager.clearAllEntries();
    }
}

// =============================================================================
// Tree Data Provider
// =============================================================================

class HistoryTreeProvider implements vscode.TreeDataProvider<HistoryItem> {
    private _onDidChange = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChange.event;

    constructor(private readonly manager: HistoryManager) {}

    refresh(): void {
        this._onDidChange.fire();
    }

    getTreeItem(element: HistoryItem): vscode.TreeItem {
        return element;
    }

    getChildren(): HistoryItem[] {
        return this.manager.getEntries().map(meta => new HistoryItem(meta));
    }

    getParent(): undefined {
        return undefined;
    }
}

// =============================================================================
// Tree Items
// =============================================================================

class HistoryItem extends vscode.TreeItem {
    constructor(public readonly meta: HistoryEntry) {
        super(meta.queryPreview, vscode.TreeItemCollapsibleState.None);
        this.id = meta.fileName;

        // Format timestamp for description
        const date = new Date(meta.timestamp);
        const timeStr = date.toLocaleString(undefined, {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
        const parts: string[] = [timeStr];
        if (meta.rowCount !== undefined) {
            parts.push(`${meta.rowCount} rows`);
        }
        this.description = parts.join(' · ');

        this.tooltip = [
            meta.queryPreview,
            `${meta.cluster ?? ''}${meta.database ? '/' + meta.database : ''}`,
            timeStr,
        ].filter(Boolean).join('\n');

        this.command = {
            command: 'kusto.openHistoryItem',
            title: 'Open',
            arguments: [this],
        };
        this.contextValue = 'historyItem';
        this.iconPath = new vscode.ThemeIcon('history');
    }
}
