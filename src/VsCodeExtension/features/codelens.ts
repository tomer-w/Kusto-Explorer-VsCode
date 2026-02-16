import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';

/**
 * Activates CodeLens features for Kusto queries.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'kusto' },
            new KustoCodeLensProvider(client)
        )
    );
}

class KustoCodeLensProvider implements vscode.CodeLensProvider {
    private client: LanguageClient;

    constructor(client: LanguageClient) {
        this.client = client;
    }

    async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const result = await server.getQueryRanges(this.client, document.uri.toString());
        if (!result || !result.ranges.length) {
            return [];
        }

        const lenses: vscode.CodeLens[] = [];

        for (const range of result.ranges) {
            const vsRange = new vscode.Range(
                range.start.line, range.start.character,
                range.end.line, range.end.character
            );

            // Skip empty or whitespace-only query ranges
            if (document.getText(vsRange).trim().length === 0) {
                continue;
            }

            lenses.push(new vscode.CodeLens(vsRange, {
                title: '▶ Run',
                command: 'kusto.runQuery',
                tooltip: 'Run this query'
            }));

            lenses.push(new vscode.CodeLens(vsRange, {
                title: '📋 Copy',
                command: 'kusto.copyQuery',
                tooltip: 'Copy this query with syntax highlighting'
            }));

            lenses.push(new vscode.CodeLens(vsRange, {
                title: '✎ Format',
                command: 'kusto.formatQuery',
                tooltip: 'Format this query'
            }));
        }

        return lenses;
    }
}
