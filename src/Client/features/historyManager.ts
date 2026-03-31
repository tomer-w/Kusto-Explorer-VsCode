// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module implements the HistoryManager class.
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

/** Lightweight metadata for a history entry (stored in the index file). */
export interface HistoryEntry {
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

/**
 * Manages a persitent list of query history data
 */
export class HistoryManager {
    private readonly historyDir: string;
    private readonly indexPath: string;
    private readonly _onDidChange = new vscode.EventEmitter<void>();
    private readonly _onDidAddEntry = new vscode.EventEmitter<HistoryEntry>();

    /** Fires after any mutation (add, delete, clear) so the UI can refresh. */
    readonly onDidChange = this._onDidChange.event;

    /** Fires after a new entry is added, carrying its metadata for UI reveal. */
    readonly onDidAddEntry = this._onDidAddEntry.event;

    constructor(context: vscode.ExtensionContext) {
        this.historyDir = path.join(context.globalStorageUri.fsPath, 'history');
        fs.mkdirSync(this.historyDir, { recursive: true });
        this.indexPath = path.join(this.historyDir, INDEX_FILE);
    }

    // ─── Index I/O ──────────────────────────────────────────────────────

    private readIndex(): HistoryEntry[] {
        try {
            if (fs.existsSync(this.indexPath)) {
                return JSON.parse(fs.readFileSync(this.indexPath, 'utf-8')) as HistoryEntry[];
            }
        } catch { /* corrupt index — start fresh */ }
        return [];
    }

    private writeIndex(entries: HistoryEntry[]): void {
        fs.writeFileSync(this.indexPath, JSON.stringify(entries, null, 2), 'utf-8');
    }

    // ─── Public API ─────────────────────────────────────────────────────

    /** Returns all history entry metadata, most recent first. */
    getEntries(): HistoryEntry[] {
        return this.readIndex();
    }

    /**
     * Adds a query result to the history. Writes a .kqr file and prepends
     * the entry to the index. Returns the URI of the new history file.
     */
    async addHistoryEntry(resultData: server.ResultData): Promise<vscode.Uri> {
        const now = new Date();
        const timestamp = now.toISOString();
        const datePart = timestamp.replace(/[-:]/g, '').replace('T', '_').replace(/\.\d+Z$/, '');

        // Build a short label from the query text
        const querySnippet = (resultData.query ?? 'query')
            .replace(/\s+/g, ' ').trim().slice(0, 60);
        // Sanitize for use as a filename
        const safeName = querySnippet.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 40);
        const fileName = `${datePart}_${safeName}.kqr`;

        const filePath = path.join(this.historyDir, fileName);
        const content = JSON.stringify(resultData, null, 2);
        await fs.promises.writeFile(filePath, content, 'utf-8');

        const rowCount = resultData.tables.reduce((sum, t) => sum + (t.rows?.length ?? 0), 0);

        const meta: HistoryEntry = {
            fileName,
            timestamp,
            queryPreview: querySnippet,
            ...(resultData.cluster !== undefined && { cluster: resultData.cluster }),
            ...(resultData.database !== undefined && { database: resultData.database }),
            rowCount,
        };

        // Prepend to index and enforce max size
        const index = this.readIndex();
        index.unshift(meta);
        if (index.length > MAX_HISTORY_ENTRIES) {
            // Remove oldest entries and delete their files
            const removed = index.splice(MAX_HISTORY_ENTRIES);
            for (const entry of removed) {
                const p = path.join(this.historyDir, entry.fileName);
                try { await fs.promises.unlink(p); } catch { /* ignore */ }
            }
        }
        this.writeIndex(index);
        this._onDidChange.fire();
        this._onDidAddEntry.fire(meta);

        return vscode.Uri.file(filePath);
    }

    /** Reads the ResultData from a history .kqr file. */
    readHistoryFile(uri: vscode.Uri): server.ResultData | undefined {
        try {
            const content = fs.readFileSync(uri.fsPath, 'utf-8');
            return JSON.parse(content) as server.ResultData;
        } catch {
            return undefined;
        }
    }

    /** Writes updated ResultData back to a history .kqr file. */
    writeHistoryFile(uri: vscode.Uri, data: server.ResultData): void {
        const content = JSON.stringify(data, null, 2);
        fs.writeFileSync(uri.fsPath, content, 'utf-8');
    }

    /** Returns the URI for a history entry's backing file. */
    getHistoryFileUri(fileName: string): vscode.Uri {
        return vscode.Uri.file(path.join(this.historyDir, fileName));
    }

    /** Deletes a single history entry's file and removes it from the index. */
    async deleteEntry(fileName: string): Promise<void> {
        const filePath = path.join(this.historyDir, fileName);
        try { await fs.promises.unlink(filePath); } catch { /* ignore */ }

        const index = this.readIndex();
        const filtered = index.filter(e => e.fileName !== fileName);
        this.writeIndex(filtered);
        this._onDidChange.fire();
    }

    /** Deletes all history entries and clears the index. */
    async clearAllEntries(): Promise<void> {
        const index = this.readIndex();
        for (const entry of index) {
            const filePath = path.join(this.historyDir, entry.fileName);
            try { await fs.promises.unlink(filePath); } catch { /* ignore */ }
        }
        this.writeIndex([]);
        this._onDidChange.fire();
    }
}
