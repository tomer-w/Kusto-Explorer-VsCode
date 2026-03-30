// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module implements query history, recording each executed query with its connection context.
 * History entries are stored as individual .kql files in globalStorage, with a lightweight JSON index
 * for the tree view. The "History" tree view in the sidebar lets users browse, open, and delete past queries.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as server from './server';

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of history entries to keep. */
const MAX_HISTORY_ENTRIES = 200;

/** Filename for the lightweight index that powers the tree view. */
const INDEX_FILE = 'history-index.json';

// =============================================================================
// Module-level State
// =============================================================================

let historyDir: string;
let indexPath: string;
let treeProvider: HistoryTreeProvider;
let treeView: vscode.TreeView<HistoryItem>;

// =============================================================================
// Index Types
// =============================================================================

/** Lightweight metadata for a history entry (stored in the index file). */
export interface HistoryEntryMeta {
    /** Filename of the .kqr file in the history directory. */
    fileName: string;
    /** ISO 8601 timestamp of when the query was executed. */
    timestamp: string;
    /** First ~80 characters of the query text for display. */
    queryPreview: string;
    /** Cluster the query was run against. */
    cluster?: string;
    /** Database the query was run against. */
    database?: string;
    /** Number of result rows. */
    rowCount?: number;
}

// =============================================================================
// Activation
// =============================================================================

/**
 * Activates the history feature: creates the storage directory, registers
 * the tree view and commands.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    historyDir = path.join(context.globalStorageUri.fsPath, 'history');
    await fs.promises.mkdir(historyDir, { recursive: true });
    indexPath = path.join(historyDir, INDEX_FILE);

    treeProvider = new HistoryTreeProvider();
    treeView = vscode.window.createTreeView('kusto.history', {
        treeDataProvider: treeProvider,
    });
    context.subscriptions.push(treeView);

    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.openHistoryItem', (item: HistoryItem) => openHistoryItem(item)),
        vscode.commands.registerCommand('kusto.deleteHistoryItem', (item: HistoryItem) => deleteHistoryItem(item)),
        vscode.commands.registerCommand('kusto.clearHistory', () => clearHistory()),
    );
}

// =============================================================================
// Index I/O
// =============================================================================

function readIndex(): HistoryEntryMeta[] {
    try {
        if (fs.existsSync(indexPath)) {
            return JSON.parse(fs.readFileSync(indexPath, 'utf-8')) as HistoryEntryMeta[];
        }
    } catch { /* corrupt index — start fresh */ }
    return [];
}

function writeIndex(entries: HistoryEntryMeta[]): void {
    fs.writeFileSync(indexPath, JSON.stringify(entries, null, 2), 'utf-8');
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Adds a query result to the history. Writes a .kqr file and prepends
 * the entry to the index. Returns the URI of the new history file.
 */
export async function addHistoryEntry(resultData: server.ResultData): Promise<vscode.Uri> {
    const now = new Date();
    const timestamp = now.toISOString();
    const datePart = timestamp.replace(/[-:]/g, '').replace('T', '_').replace(/\.\d+Z$/, '');

    // Build a short label from the query text
    const querySnippet = (resultData.query ?? 'query')
        .replace(/\s+/g, ' ').trim().slice(0, 60);
    // Sanitize for use as a filename
    const safeName = querySnippet.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 40);
    const fileName = `${datePart}_${safeName}.kqr`;

    const filePath = path.join(historyDir, fileName);
    const content = JSON.stringify(resultData, null, 2);
    await fs.promises.writeFile(filePath, content, 'utf-8');

    const rowCount = resultData.tables.reduce((sum, t) => sum + (t.rows?.length ?? 0), 0);

    const meta: HistoryEntryMeta = {
        fileName,
        timestamp,
        queryPreview: querySnippet,
        ...(resultData.cluster !== undefined && { cluster: resultData.cluster }),
        ...(resultData.database !== undefined && { database: resultData.database }),
        rowCount,
    };

    // Prepend to index and enforce max size
    const index = readIndex();
    index.unshift(meta);
    if (index.length > MAX_HISTORY_ENTRIES) {
        // Remove oldest entries and delete their files
        const removed = index.splice(MAX_HISTORY_ENTRIES);
        for (const entry of removed) {
            const p = path.join(historyDir, entry.fileName);
            try { await fs.promises.unlink(p); } catch { /* ignore */ }
        }
    }
    writeIndex(index);
    treeProvider.refresh();

    // Select the newly added item in the tree view
    const newItem = new HistoryItem(meta);
    treeView.reveal(newItem, { select: true, focus: false });

    return vscode.Uri.file(filePath);
}

/**
 * Reads the ResultData from a history .kqr file.
 */
export function readHistoryFile(uri: vscode.Uri): server.ResultData | undefined {
    try {
        const content = fs.readFileSync(uri.fsPath, 'utf-8');
        return JSON.parse(content) as server.ResultData;
    } catch {
        return undefined;
    }
}

/**
 * Writes updated ResultData back to a history .kqr file.
 */
export function writeHistoryFile(uri: vscode.Uri, data: server.ResultData): void {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(uri.fsPath, content, 'utf-8');
}

/**
 * Returns the URI for a history entry's backing file.
 */
export function getHistoryFileUri(fileName: string): vscode.Uri {
    return vscode.Uri.file(path.join(historyDir, fileName));
}

// =============================================================================
// Command Handlers
// =============================================================================

/** Opens a history item in the singleton results view. */
async function openHistoryItem(item: HistoryItem): Promise<void> {
    const uri = getHistoryFileUri(item.meta.fileName);
    const resultData = readHistoryFile(uri);
    if (!resultData) {
        vscode.window.showErrorMessage('Failed to read history entry.');
        return;
    }

    // Import dynamically to avoid circular dependency at module level
    const { displayResultsInPanel, displayResultsInSingletonView, setSingletonBackingUri, getLanguageClient } = await import('./resultsViewer');
    const client = getLanguageClient();
    if (!client) { return; }

    setSingletonBackingUri(uri);
    await displayResultsInPanel(client, resultData, 'detail');
    await displayResultsInSingletonView(client, resultData, 'chart', true);
}

/** Deletes a history item after confirmation. */
async function deleteHistoryItem(item: HistoryItem): Promise<void> {
    const filePath = path.join(historyDir, item.meta.fileName);
    try { await fs.promises.unlink(filePath); } catch { /* ignore */ }

    const index = readIndex();
    const filtered = index.filter(e => e.fileName !== item.meta.fileName);
    writeIndex(filtered);
    treeProvider.refresh();
}

/** Clears all history after confirmation. */
async function clearHistory(): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
        'Delete all query history?',
        { modal: true },
        'Delete All'
    );
    if (confirm !== 'Delete All') { return; }

    const index = readIndex();
    for (const entry of index) {
        const filePath = path.join(historyDir, entry.fileName);
        try { await fs.promises.unlink(filePath); } catch { /* ignore */ }
    }
    writeIndex([]);
    treeProvider.refresh();
}

// =============================================================================
// Tree Data Provider
// =============================================================================

class HistoryTreeProvider implements vscode.TreeDataProvider<HistoryItem> {
    private _onDidChange = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChange.event;

    refresh(): void {
        this._onDidChange.fire();
    }

    getTreeItem(element: HistoryItem): vscode.TreeItem {
        return element;
    }

    getChildren(): HistoryItem[] {
        return readIndex().map(meta => new HistoryItem(meta));
    }

    getParent(): undefined {
        return undefined;
    }
}

// =============================================================================
// Tree Items
// =============================================================================

class HistoryItem extends vscode.TreeItem {
    constructor(public readonly meta: HistoryEntryMeta) {
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
