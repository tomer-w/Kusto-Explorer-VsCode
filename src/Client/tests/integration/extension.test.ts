// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Integration Tests', () => {

    test('Kusto language is registered', async () => {
        const languages = await vscode.languages.getLanguages();
        assert.ok(
            languages.includes('kusto'),
            `Expected 'kusto' in registered languages, got: ${languages.join(', ')}`
        );
    });

    test('Can open a Kusto document', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: 'StormEvents | take 10',
        });
        assert.strictEqual(doc.languageId, 'kusto');
        assert.strictEqual(doc.getText(), 'StormEvents | take 10');
    });

    test('Extension contributes kusto language configuration', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'kusto',
            content: '',
        });
        const editor = await vscode.window.showTextDocument(doc);
        assert.ok(editor, 'Should be able to show a kusto document in an editor');
    });
});
