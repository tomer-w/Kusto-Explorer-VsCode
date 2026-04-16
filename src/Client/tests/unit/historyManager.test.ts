// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { HistoryManager } from '../../features/historyManager';
import type { HistoryEntry } from '../../features/historyManager';
import type { ResultData, IServer } from '../../features/server';
import { NullServer } from '../../features/server';
import type * as vscode from 'vscode';

function createMockContext(storageDir: string): vscode.ExtensionContext {
    return {
        globalStorageUri: { fsPath: storageDir },
    } as unknown as vscode.ExtensionContext;
}

function makeResultData(query: string, rows: number = 1): ResultData {
    return {
        query,
        cluster: 'test.kusto.windows.net',
        database: 'TestDB',
        tables: [{
            name: 'Results',
            columns: [{ name: 'Col', type: 'string' }],
            rows: Array.from({ length: rows }, (_, i) => [`row${i}`]),
        }],
    };
}

describe('HistoryManager', () => {
    let tmpDir: string;
    let historyDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'history-test-'));
        historyDir = path.join(tmpDir, 'history');
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    function createManager(server?: IServer): HistoryManager {
        return new HistoryManager(createMockContext(tmpDir), server ?? new NullServer());
    }

    describe('constructor', () => {
        it('creates the history directory', () => {
            createManager();
            expect(fs.existsSync(historyDir)).toBe(true);
        });
    });

    describe('getEntries', () => {
        it('returns empty array when no history exists', () => {
            const mgr = createManager();
            expect(mgr.getEntries()).toEqual([]);
        });

        it('returns empty array when index file is corrupted', () => {
            const mgr = createManager();
            fs.writeFileSync(path.join(historyDir, 'history-index.json'), 'not json', 'utf-8');
            expect(mgr.getEntries()).toEqual([]);
        });
    });

    describe('addHistoryEntry', () => {
        it('creates a .kqr file on disk', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | take 10'));

            const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.kqr'));
            expect(files).toHaveLength(1);
        });

        it('writes valid JSON result data to the file', async () => {
            const mgr = createManager();
            const data = makeResultData('StormEvents | take 10');
            const uri = await mgr.addHistoryEntry(data);

            const content = JSON.parse(fs.readFileSync(uri.fsPath, 'utf-8'));
            expect(content.query).toBe('StormEvents | take 10');
            expect(content.tables).toHaveLength(1);
        });

        it('adds entry to the index', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('query1'));

            const entries = mgr.getEntries();
            expect(entries).toHaveLength(1);
            expect(entries[0]!.queryPreview).toBe('query1');
            expect(entries[0]!.cluster).toBe('test.kusto.windows.net');
            expect(entries[0]!.database).toBe('TestDB');
        });

        it('prepends new entries (most recent first)', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('first'));
            await mgr.addHistoryEntry(makeResultData('second'));

            const entries = mgr.getEntries();
            expect(entries).toHaveLength(2);
            expect(entries[0]!.queryPreview).toBe('second');
            expect(entries[1]!.queryPreview).toBe('first');
        });

        it('records row count', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('query', 5));

            const entries = mgr.getEntries();
            expect(entries[0]!.rowCount).toBe(5);
        });

        it('sanitizes query text for filename', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('select * from "table" | where x > 0'));

            const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.kqr'));
            expect(files).toHaveLength(1);
            // Should not contain characters invalid in filenames
            expect(files[0]).not.toMatch(/[<>:"/\\|?*]/);
        });

        it('truncates long query previews', async () => {
            const mgr = createManager();
            const longQuery = 'A'.repeat(200);
            await mgr.addHistoryEntry(makeResultData(longQuery));

            const entries = mgr.getEntries();
            expect(entries[0]!.queryPreview.length).toBeLessThanOrEqual(60);
        });

        it('enforces max history entries and deletes old files', async () => {
            const mgr = createManager();

            // Add 202 entries to exceed the 200 limit
            for (let i = 0; i < 202; i++) {
                await mgr.addHistoryEntry(makeResultData(`query${i}`, 1));
            }

            const entries = mgr.getEntries();
            expect(entries).toHaveLength(200);

            // Most recent should be last added
            expect(entries[0]!.queryPreview).toBe('query201');

            // Oldest entries' files should be deleted
            const kqrFiles = fs.readdirSync(historyDir).filter(f => f.endsWith('.kqr'));
            expect(kqrFiles).toHaveLength(200);
        });
    });

    describe('readHistoryFile', () => {
        it('reads result data back from a .kqr file', async () => {
            const mgr = createManager();
            const data = makeResultData('test query', 3);
            const uri = await mgr.addHistoryEntry(data);

            const result = await mgr.readHistoryFile(uri);
            expect(result).toBeDefined();
            expect(result!.query).toBe('test query');
            expect(result!.tables[0]!.rows).toHaveLength(3);
        });

        it('returns undefined for missing file', async () => {
            const mgr = createManager();
            const fakeUri = { fsPath: path.join(historyDir, 'nonexistent.kqr') } as vscode.Uri;
            expect(await mgr.readHistoryFile(fakeUri)).toBeUndefined();
        });
    });

    describe('writeHistoryFile', () => {
        it('overwrites existing file content', async () => {
            const mgr = createManager();
            const uri = await mgr.addHistoryEntry(makeResultData('original'));

            const updated = makeResultData('updated', 10);
            await mgr.writeHistoryFile(uri, updated);

            const result = await mgr.readHistoryFile(uri);
            expect(result!.query).toBe('updated');
            expect(result!.tables[0]!.rows).toHaveLength(10);
        });
    });

    describe('getHistoryFileUri', () => {
        it('returns URI pointing to the history directory', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('test'));

            const entries = mgr.getEntries();
            const uri = mgr.getHistoryFileUri(entries[0]!.fileName);
            expect(uri.fsPath).toBe(path.join(historyDir, entries[0]!.fileName));
        });
    });

    describe('deleteEntry', () => {
        it('removes file from disk and index', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('q1'));
            await mgr.addHistoryEntry(makeResultData('q2'));

            const entries = mgr.getEntries();
            const toDelete = entries[0]!.fileName; // q2 (most recent)

            await mgr.deleteEntry(toDelete);

            expect(fs.existsSync(path.join(historyDir, toDelete))).toBe(false);
            const remaining = mgr.getEntries();
            expect(remaining).toHaveLength(1);
            expect(remaining[0]!.queryPreview).toBe('q1');
        });

        it('handles deleting non-existent file gracefully', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('q1'));

            // Should not throw
            await mgr.deleteEntry('nonexistent.kqr');
        });
    });

    describe('clearAllEntries', () => {
        it('removes all files and clears the index', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('q1'));
            await mgr.addHistoryEntry(makeResultData('q2'));
            await mgr.addHistoryEntry(makeResultData('q3'));

            await mgr.clearAllEntries();

            expect(mgr.getEntries()).toEqual([]);
            const kqrFiles = fs.readdirSync(historyDir).filter(f => f.endsWith('.kqr'));
            expect(kqrFiles).toHaveLength(0);
        });
    });

    describe('hasEntryForQuery', () => {
        it('returns true for a query that has been added', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count'));
            expect(await mgr.hasEntryForQuery('StormEvents | count')).toBe(true);
        });

        it('returns false for a query that has not been added', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count'));
            expect(await mgr.hasEntryForQuery('OtherTable | count')).toBe(false);
        });

        it('returns false when history is empty', async () => {
            const mgr = createManager();
            expect(await mgr.hasEntryForQuery('StormEvents | count')).toBe(false);
        });
    });

    describe('getMatchingEntry', () => {
        it('returns the matching entry for a query', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count'));
            const entry = await mgr.getMatchingEntry('StormEvents | count');
            expect(entry).toBeDefined();
            expect(entry!.queryPreview).toBe('StormEvents | count');
        });

        it('returns the most recent entry when multiple match', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count', 1));
            await mgr.addHistoryEntry(makeResultData('StormEvents | count', 5));
            const entry = await mgr.getMatchingEntry('StormEvents | count');
            expect(entry).toBeDefined();
            expect(entry!.rowCount).toBe(5);
        });

        it('returns undefined for a non-matching query', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count'));
            expect(await mgr.getMatchingEntry('OtherTable | count')).toBeUndefined();
        });
    });

    describe('getEntryData', () => {
        it('returns ResultData for a valid entry', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count', 3));
            const entry = mgr.getEntries()[0]!;
            const data = await mgr.getEntryData(entry);
            expect(data).toBeDefined();
            expect(data!.query).toBe('StormEvents | count');
            expect(data!.tables[0]!.rows).toHaveLength(3);
        });

        it('returns undefined for a deleted entry', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('StormEvents | count'));
            const entry = mgr.getEntries()[0]!;
            await mgr.deleteEntry(entry.fileName);
            const data = await mgr.getEntryData(entry);
            expect(data).toBeUndefined();
        });
    });

    describe('events', () => {
        it('fires onDidChange when entry is added', async () => {
            const mgr = createManager();
            let fired = 0;
            mgr.onDidChange(() => fired++);

            await mgr.addHistoryEntry(makeResultData('q'));
            expect(fired).toBe(1);
        });

        it('fires onDidAddEntry with metadata when entry is added', async () => {
            const mgr = createManager();
            let received: HistoryEntry | undefined;
            mgr.onDidAddEntry((entry) => { received = entry; });

            await mgr.addHistoryEntry(makeResultData('my query'));

            expect(received).toBeDefined();
            expect(received!.queryPreview).toBe('my query');
            expect(received!.cluster).toBe('test.kusto.windows.net');
        });

        it('fires onDidChange when entry is deleted', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('q'));
            const fileName = mgr.getEntries()[0]!.fileName;

            let fired = 0;
            mgr.onDidChange(() => fired++);

            await mgr.deleteEntry(fileName);
            expect(fired).toBe(1);
        });

        it('fires onDidChange when all entries are cleared', async () => {
            const mgr = createManager();
            await mgr.addHistoryEntry(makeResultData('q'));

            let fired = 0;
            mgr.onDidChange(() => fired++);

            await mgr.clearAllEntries();
            expect(fired).toBe(1);
        });
    });
});
