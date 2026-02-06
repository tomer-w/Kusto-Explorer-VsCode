import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

let resultsView: vscode.WebviewView | undefined;
let chartPanel: vscode.WebviewPanel | undefined;

/**
 * Activates query execution features including results view and chart panel.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    // Register the results view webview provider
    vscode.window.registerWebviewViewProvider('kusto.resultsView', {
        resolveWebviewView(webviewView) {
            resultsView = webviewView;
            webviewView.webview.options = { enableScripts: true };
            webviewView.webview.html = '<html>no results</html>';
        }
    });

    // Open the results view on start up
    vscode.commands.executeCommand('kusto.resultsView.focus');

    // Register the runQuery command
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.runQuery', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'kusto') {
                return;
            }

            try {
                const results = await client.sendRequest<{ title: string, dataHtml: string, rowCount?: number, chartHtml?: string } | null>(
                    'kusto/runQuery',
                    {
                        textDocument: { uri: editor.document.uri.toString() },
                        selection: {
                            start: { line: editor.selection.start.line, character: editor.selection.start.character },
                            end: { line: editor.selection.end.line, character: editor.selection.end.character }
                        }
                    }
                );

                if (!results) {
                    return; // No results or error
                }

                // Display results in the results view
                if (!resultsView) {
                    // Ensure the view is visible (this triggers resolveWebviewView if not already called)
                    await vscode.commands.executeCommand('kusto.resultsView.focus');
                }

                if (resultsView) {
                    resultsView.webview.html = results.dataHtml;
                    resultsView.show(true);  // show but preserve focus on editor

                    if (results.rowCount) {
                        resultsView.badge = {
                            tooltip: `${results.rowCount} rows`,
                            value: results.rowCount
                        };
                    }
                    else {
                        resultsView.badge = undefined;
                    }
                }

                // Display chart if available
                if (results.chartHtml) {
                    if (!chartPanel) {
                        chartPanel = vscode.window.createWebviewPanel(
                            'kusto',
                            'Chart Results',
                            vscode.ViewColumn.Beside,  // Opens to the side of the active editor
                            { enableScripts: true }
                        );
                        // Clear reference when user closes it
                        chartPanel.onDidDispose(() => {
                            chartPanel = undefined;
                        });
                    }

                    chartPanel.webview.html = results.chartHtml;
                    chartPanel.reveal(vscode.ViewColumn.Beside, true);
                }
                else if (chartPanel) {
                    chartPanel.dispose();
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to execute query: ${error}`);
            }
        })
    );
}
