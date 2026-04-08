// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

import type { ResultsViewer } from '../../features/resultsViewer';
import type { ResultData } from '../../features/server';

/** Get the extension's exported ResultsViewer instance. */
async function getResultsViewer(): Promise<ResultsViewer> {
    const ext = vscode.extensions.getExtension('ms-kusto.kusto-explorer-vscode')!;
    const exports = ext.isActive ? ext.exports : await ext.activate();
    return (exports as any).resultsViewer as ResultsViewer;
}

/** Fabricate minimal ResultData for testing. */
function makeResultData(): ResultData {
    return {
        query: 'StormEvents | take 2',
        tables: [{
            name: 'PrimaryResult',
            columns: [
                { name: 'State', type: 'string' },
                { name: 'EventCount', type: 'long' }
            ],
            rows: [
                ['Texas', 42],
                ['Florida', 99]
            ]
        }]
    };
}

/** Wait for a tab with matching label or URI to appear. */
async function waitForTab(
    predicate: (tab: vscode.Tab) => boolean,
    timeoutMs = 5000
): Promise<vscode.Tab> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        for (const group of vscode.window.tabGroups.all) {
            for (const tab of group.tabs) {
                if (predicate(tab)) {
                    return tab;
                }
            }
        }
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Timed out waiting for tab');
}

suite('Results Viewer Integration Tests', () => {
    let resultsViewer: ResultsViewer;
    const createdFiles: vscode.Uri[] = [];

    suiteSetup(async () => {
        resultsViewer = await getResultsViewer();
    });

    teardown(async () => {
        // Close all editors
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');

        // Clean up any .kqr files we created
        for (const uri of createdFiles) {
            try {
                await vscode.workspace.fs.delete(uri);
            } catch {
                // ignore if already gone
            }
        }
        createdFiles.length = 0;
    });

    test('Display results in bottom panel', async () => {
        const data = makeResultData();
        // This should not throw — it puts data into the bottom panel
        await resultsViewer.displayResultsInBottomPanel(data, 'data');
        // If the panel resolved, the data is displayed.
        // We can't inspect webview content, but we verify no error.
    });

    test('Display results in singleton view opens a tab', async () => {
        const data = makeResultData();

        assert.strictEqual(resultsViewer.hasSingletonView(), false, 'Should start with no singleton');

        await resultsViewer.displayResultsInSingletonView(data, 'data', true);

        assert.strictEqual(resultsViewer.hasSingletonView(), true, 'Singleton view should exist');
    });

    test('Save panel results creates and opens a .kqr file', async () => {
        const data = makeResultData();
        await resultsViewer.displayResultsInBottomPanel(data, 'data');

        // Determine save path
        const testWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
        const saveUri = vscode.Uri.file(path.join(testWorkspace, 'test-results.kqr'));
        createdFiles.push(saveUri);

        // Stub showSaveDialog to return our test path
        const originalSaveDialog = vscode.window.showSaveDialog;
        (vscode.window as any).showSaveDialog = async () => saveUri;
        try {
            await vscode.commands.executeCommand('kusto.savePanelResults');
        } finally {
            (vscode.window as any).showSaveDialog = originalSaveDialog;
        }

        // Verify .kqr file was created on disk
        const stat = await vscode.workspace.fs.stat(saveUri);
        assert.ok(stat.size > 0, 'File should have content');

        // Verify file content is valid ResultData JSON
        const content = Buffer.from(await vscode.workspace.fs.readFile(saveUri)).toString('utf-8');
        const parsed = JSON.parse(content);
        assert.strictEqual(parsed.tables.length, 1, 'Should have one table');
        assert.strictEqual(parsed.tables[0].name, 'PrimaryResult');
        assert.strictEqual(parsed.tables[0].rows.length, 2, 'Should have 2 rows');

        // Verify the file was opened as a document tab
        const tab = await waitForTab(t => {
            const input = t.input;
            if (input && typeof input === 'object' && 'uri' in input) {
                return (input as { uri: vscode.Uri }).uri.fsPath.toLowerCase() === saveUri.fsPath.toLowerCase();
            }
            return false;
        });
        assert.ok(tab, '.kqr file should be open as a tab');
    });

    test('Chart from bottom panel opens singleton beside', async () => {
        const data = makeResultData();
        await resultsViewer.displayResultsInBottomPanel(data, 'data');

        assert.strictEqual(resultsViewer.hasSingletonView(), false, 'Should start with no singleton');

        await vscode.commands.executeCommand('kusto.chartPanelResults');

        assert.strictEqual(resultsViewer.hasSingletonView(), true, 'Chart should open as singleton view');

        // Verify the singleton tab exists
        const tab = await waitForTab(t => t.label === 'Chart');
        assert.ok(tab, 'Chart tab should be visible');
    });

    test('Move singleton view toggles between main and beside', async () => {
        // First open a kusto document so there's something in the main editor column
        const doc = await vscode.workspace.openTextDocument({ language: 'kusto', content: 'StormEvents' });
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);

        const data = makeResultData();
        // Open singleton in beside column
        await resultsViewer.displayResultsInSingletonView(data, 'data', true);
        assert.strictEqual(resultsViewer.hasSingletonView(), true);

        // Find the singleton tab — should be in a beside group (group index > 0 or viewColumn > 1)
        let singletonTab = await waitForTab(t => t.label === 'Data');
        assert.ok(singletonTab, 'Data tab should exist');
        const initialGroupIndex = vscode.window.tabGroups.all.findIndex(
            g => g.tabs.some(t => t === singletonTab)
        );

        // Move to main
        await vscode.commands.executeCommand('kusto.moveViewToMain');

        // Small delay for view state to settle
        await new Promise(r => setTimeout(r, 200));

        // Find it again — should be in a different group now
        singletonTab = await waitForTab(t => t.label === 'Data');
        const newGroupIndex = vscode.window.tabGroups.all.findIndex(
            g => g.tabs.some(t => t === singletonTab)
        );

        assert.notStrictEqual(
            newGroupIndex, initialGroupIndex,
            'Singleton should have moved to a different editor group'
        );
    });

    test('Save singleton results creates and opens a .kqr file', async () => {
        const data = makeResultData();
        await resultsViewer.displayResultsInSingletonView(data, 'data', true);
        assert.strictEqual(resultsViewer.hasSingletonView(), true);

        const testWorkspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
        const saveUri = vscode.Uri.file(path.join(testWorkspace, 'singleton-results.kqr'));
        createdFiles.push(saveUri);

        const originalSaveDialog = vscode.window.showSaveDialog;
        (vscode.window as any).showSaveDialog = async () => saveUri;
        try {
            await vscode.commands.executeCommand('kusto.saveSingletonResults');
        } finally {
            (vscode.window as any).showSaveDialog = originalSaveDialog;
        }

        // Verify file was created with correct content
        const content = Buffer.from(await vscode.workspace.fs.readFile(saveUri)).toString('utf-8');
        const parsed = JSON.parse(content);
        assert.strictEqual(parsed.query, 'StormEvents | take 2', 'Should preserve query text');
        assert.strictEqual(parsed.tables[0].name, 'PrimaryResult');
        assert.strictEqual(parsed.tables[0].rows.length, 2);

        // Verify the file was opened as a document tab
        const tab = await waitForTab(t => {
            const input = t.input;
            if (input && typeof input === 'object' && 'uri' in input) {
                return (input as { uri: vscode.Uri }).uri.fsPath.toLowerCase() === saveUri.fsPath.toLowerCase();
            }
            return false;
        });
        assert.ok(tab, '.kqr file should be open as a tab');
    });
});
