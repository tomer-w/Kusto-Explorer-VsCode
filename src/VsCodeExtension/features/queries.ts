import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { setDocumentConnection } from './connections';
import * as server from './server';
import * as resultsPanel from './resultsPanel';
import * as chartPanel from './chartPanel';

/**
 * Activates query execution features.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {

    // Activate results panel and chart panel
    resultsPanel.activate(context, client);
    chartPanel.activate(context, client);

    // Register query-related commands
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.runQuery', () => runQuery(client)),
        vscode.commands.registerCommand('kusto.copyQuery', () => copyQuery(client)),
        vscode.commands.registerCommand('kusto.formatQuery', () => formatQuery(client))
    );
}

/**
 * Runs the query at the current cursor position or selection.
 * @param client The language client for LSP communication
 */
async function runQuery(client: LanguageClient): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'kusto') {
        return;
    }

    try {
        const uri = editor.document.uri.toString();
        const selection = {
            start: { line: editor.selection.start.line, character: editor.selection.start.character },
            end: { line: editor.selection.end.line, character: editor.selection.end.character }
        };

        // run query and get results from the server
        const runResult = await server.runQuery(client, uri, selection);

        // If query changed cluster/database, update document connection
        if (runResult && runResult.cluster) {
            await setDocumentConnection(uri, runResult.cluster, runResult.database);
        }

        // display associated result tables and chart
        await resultsPanel.displayResultsById(client, runResult?.dataId);
        await chartPanel.displayChartById(client, runResult?.dataId);

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to execute query: ${error}`);
    }
}

/**
 * Copies the query at the current cursor position with syntax highlighting.
 * @param client The language client for LSP communication
 */
async function copyQuery(client: LanguageClient): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'kusto') {
        return;
    }

    try {
        // Get the query range containing the cursor position from the server
        const cursorPos = editor.selection.active;
        const queryRange = await server.getQueryRange(
            client,
            editor.document.uri.toString(),
            { line: cursorPos.line, character: cursorPos.character }
        );

        if (!queryRange) {
            return;
        }

        // Save the current selection
        const previousSelection = editor.selection;

        // Select the query range
        const range = new vscode.Range(
            queryRange.start.line, queryRange.start.character,
            queryRange.end.line, queryRange.end.character
        );
        editor.selection = new vscode.Selection(range.start, range.end);

        // Copy with syntax highlighting
        await vscode.commands.executeCommand('editor.action.clipboardCopyWithSyntaxHighlightingAction');

        // Restore the previous selection
        editor.selection = previousSelection;

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy query: ${error}`);
    }
}

/**
 * Formats the query at the current cursor position using the LSP range formatting.
 * @param client The language client for LSP communication
 */
async function formatQuery(client: LanguageClient): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'kusto') {
        return;
    }

    try {
        // Get the query range containing the cursor position
        const cursorPos = editor.selection.active;
        const queryRange = await server.getQueryRange(
            client,
            editor.document.uri.toString(),
            { line: cursorPos.line, character: cursorPos.character }
        );

        if (!queryRange) {
            return;
        }

        const range = new vscode.Range(
            queryRange.start.line, queryRange.start.character,
            queryRange.end.line, queryRange.end.character
        );

        // Invoke the LSP document range formatting
        const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
            'vscode.executeFormatRangeProvider',
            editor.document.uri,
            range,
            editor.options
        );

        if (edits && edits.length > 0) {
            await editor.edit(editBuilder => {
                for (const edit of edits) {
                    editBuilder.replace(edit.range, edit.newText);
                }
            });
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to format query: ${error}`);
    }
}
