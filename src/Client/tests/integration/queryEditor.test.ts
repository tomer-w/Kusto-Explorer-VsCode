// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as vscode from 'vscode';

import type { IServer, RunQueryResult, Range as ServerRange } from '../../features/server';
import type { ResultsViewer } from '../../features/resultsViewer';
import type { HistoryManager } from '../../features/historyManager';

/** Get the extension's exported components. */
async function getExports(): Promise<{
    server: IServer;
    resultsViewer: ResultsViewer;
    historyManager: HistoryManager;
}> {
    const ext = vscode.extensions.getExtension('ms-kusto.kusto-explorer-vscode')!;
    const exports = ext.isActive ? ext.exports : await ext.activate();
    return exports as any;
}

suite('Query Editor Integration Tests', () => {
    let server: IServer;
    let resultsViewer: ResultsViewer;
    let historyManager: HistoryManager;

    suiteSetup(async () => {
        const exports = await getExports();
        server = exports.server;
        resultsViewer = exports.resultsViewer;
        historyManager = exports.historyManager;
    });

    teardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('selectQuery selects the specified range in the editor', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: 'StormEvents\n| where State == "Texas"\n| count'
        });
        const editor = await vscode.window.showTextDocument(doc);

        // Select the second line (line 1, chars 0-23)
        await vscode.commands.executeCommand('kusto.selectQuery', 1, 0, 1, 23);

        assert.strictEqual(editor.selection.start.line, 1);
        assert.strictEqual(editor.selection.start.character, 0);
        assert.strictEqual(editor.selection.end.line, 1);
        assert.strictEqual(editor.selection.end.character, 23);
    });

    test('selectQuery adjusts end position at column 0', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: 'StormEvents\n| where State == "Texas"\n| count'
        });
        const editor = await vscode.window.showTextDocument(doc);

        // Select with end at line 2, column 0 — should adjust to end of line 1
        await vscode.commands.executeCommand('kusto.selectQuery', 0, 0, 2, 0);

        assert.strictEqual(editor.selection.start.line, 0);
        assert.strictEqual(editor.selection.start.character, 0);
        assert.strictEqual(editor.selection.end.line, 1);
        // End character should be the length of line 1
        const line1Length = doc.lineAt(1).text.length;
        assert.strictEqual(editor.selection.end.character, line1Length);
    });

    test('runQuery with mocked server displays results in bottom panel and history', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: 'StormEvents | take 5'
        });
        await vscode.window.showTextDocument(doc);

        // Stub server.getQueryRange to return the full document range
        const originalGetQueryRange = server.getQueryRange.bind(server);
        const originalRunQuery = server.runQuery.bind(server);

        const fakeRange: ServerRange = {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 19 }
        };

        const fakeResult: RunQueryResult = {
            data: {
                query: 'StormEvents | take 5',
                tables: [{
                    name: 'PrimaryResult',
                    columns: [
                        { name: 'State', type: 'string' },
                        { name: 'EventCount', type: 'long' }
                    ],
                    rows: [
                        ['Texas', 10],
                        ['Florida', 20],
                        ['Kansas', 30]
                    ]
                }],
                chartOptions: { type: 'columnchart' }
            }
        };

        (server as any).getQueryRange = async () => fakeRange;
        (server as any).runQuery = async () => fakeResult;

        const historyCountBefore = historyManager.getEntries().length;

        try {
            await vscode.commands.executeCommand('kusto.runQuery');
        } finally {
            (server as any).getQueryRange = originalGetQueryRange;
            (server as any).runQuery = originalRunQuery;
        }

        // Verify history entry was added
        const historyCountAfter = historyManager.getEntries().length;
        assert.strictEqual(
            historyCountAfter, historyCountBefore + 1,
            'A history entry should be added after running a query'
        );

        // Verify results were displayed in singleton view (chart mode requires chartOptions)
        assert.strictEqual(
            resultsViewer.hasSingletonView(), true,
            'Singleton view should open after running query'
        );
    });

    test('runQuery does nothing for non-kusto documents', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'plaintext',
            content: 'This is not KQL'
        });
        await vscode.window.showTextDocument(doc);

        const historyCountBefore = historyManager.getEntries().length;

        await vscode.commands.executeCommand('kusto.runQuery');

        const historyCountAfter = historyManager.getEntries().length;
        assert.strictEqual(
            historyCountAfter, historyCountBefore,
            'No history entry should be added for non-kusto documents'
        );
    });

    test('runQuery with explicit range does not need getQueryRange', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: 'StormEvents | take 1\nStormEvents | take 2'
        });
        await vscode.window.showTextDocument(doc);

        const originalRunQuery = server.runQuery.bind(server);

        const fakeResult: RunQueryResult = {
            data: {
                query: 'StormEvents | take 2',
                tables: [{
                    name: 'PrimaryResult',
                    columns: [{ name: 'Value', type: 'long' }],
                    rows: [[42]]
                }]
            }
        };

        (server as any).runQuery = async () => fakeResult;

        const historyCountBefore = historyManager.getEntries().length;

        try {
            // Pass explicit range for line 2 — skips getQueryRange call
            await vscode.commands.executeCommand('kusto.runQuery', 1, 0, 1, 20);
        } finally {
            (server as any).runQuery = originalRunQuery;
        }

        const historyCountAfter = historyManager.getEntries().length;
        assert.strictEqual(
            historyCountAfter, historyCountBefore + 1,
            'History entry should be added even with explicit range'
        );
    });

    test('formatQuery applies formatting edits from a range formatting provider', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: 'stormevents | take 5'
        });
        await vscode.window.showTextDocument(doc);

        // Register a fake formatting provider that uppercases the text
        const provider = vscode.languages.registerDocumentRangeFormattingEditProvider(
            { language: 'kusto' },
            {
                provideDocumentRangeFormattingEdits(document, range) {
                    return [vscode.TextEdit.replace(range, document.getText(range).toUpperCase())];
                }
            }
        );

        // Stub getQueryRange to return the full document range
        const originalGetQueryRange = server.getQueryRange.bind(server);
        (server as any).getQueryRange = async () => ({
            start: { line: 0, character: 0 },
            end: { line: 0, character: 20 }
        });

        try {
            await vscode.commands.executeCommand('kusto.formatQuery');
        } finally {
            (server as any).getQueryRange = originalGetQueryRange;
            provider.dispose();
        }

        assert.strictEqual(
            doc.getText(),
            'STORMEVENTS | TAKE 5',
            'Editor text should be formatted by the provider'
        );
    });
});
