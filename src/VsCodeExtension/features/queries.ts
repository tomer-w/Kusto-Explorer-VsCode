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
            webviewView.webview.options = { 
                enableScripts: true,
                // Prevent the view from being disposed when hidden (e.g., when chart panel has focus)
                enableForms: false
            };
            // Prevent disposal when hidden
            webviewView.onDidDispose(() => {
                resultsView = undefined;
            });
            webviewView.webview.html = '<html>no results</html>';
        }
    }, {
        webviewOptions: {
            retainContextWhenHidden: true  // Keep the view alive even when hidden
        }
    });

    // Open the results view on start up
    vscode.commands.executeCommand('kusto.resultsView.focus');

    /**
     * Displays query results in the results view.
     * @param dataHtml The HTML content to display
     * @param rowCount Optional row count for badge
     * @param hasChart Whether a chart is being displayed (affects show() behavior)
     */
    async function displayResults(dataHtml: string, rowCount?: number, hasChart?: boolean): Promise<void> {
        // Ensure the view is visible (this triggers resolveWebviewView if not already called)
        if (!resultsView) {
            await vscode.commands.executeCommand('kusto.resultsView.focus');
        }

        if (!resultsView) {
            return; // Still not available
        }

        try {
            resultsView.webview.html = dataHtml;
            
            // Update badge
            if (rowCount) {
                resultsView.badge = {
                    tooltip: `${rowCount} rows`,
                    value: rowCount
                };
            } else {
                resultsView.badge = undefined;
            }
            
            // Only call show() if there's no chart - let the chart panel and results view coexist
            // The retainContextWhenHidden option will keep the view alive
            if (!hasChart) {
                resultsView.show(true);  // show but preserve focus on editor
            }
        } catch (error) {
            // Results view was disposed, try to recreate it
            await vscode.commands.executeCommand('kusto.resultsView.focus');
            
            if (resultsView) {
                try {
                    resultsView.webview.html = dataHtml;
                    
                    if (rowCount) {
                        resultsView.badge = {
                            tooltip: `${rowCount} rows`,
                            value: rowCount
                        };
                    }
                    
                    if (!hasChart) {
                        resultsView.show(true);
                    }
                } catch (retryError) {
                    vscode.window.showErrorMessage(`Failed to display results: ${retryError}`);
                }
            }
        }
    }

    /**
     * Displays or hides the chart panel.
     * @param chartHtml The chart HTML to display, or undefined to hide the panel
     */
    function displayChart(chartHtml: string | undefined): void {
        if (chartHtml) {
            // Create panel only if it doesn't exist
            if (!chartPanel) {
                chartPanel = vscode.window.createWebviewPanel(
                    'kusto',
                    'Chart',
                    { 
                        viewColumn: vscode.ViewColumn.Beside,
                        preserveFocus: true
                    },
                    { 
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );
                
                // Notify that chart panel exists
                vscode.commands.executeCommand('kusto.chartPanelStateChanged', true);
                
                // Clear reference when user closes it
                chartPanel.onDidDispose(() => {
                    chartPanel = undefined;
                    // Notify that chart panel no longer exists
                    vscode.commands.executeCommand('kusto.chartPanelStateChanged', false);
                });
            }
            
            // Update content and reveal
            chartPanel.webview.html = chartHtml;
            chartPanel.reveal(vscode.ViewColumn.Beside, true);
        } else if (chartPanel) {
            // No chart to show, dispose the panel
            try {
                chartPanel.dispose();
            } catch {
                // Ignore disposal errors
            }
            chartPanel = undefined;
            // Notify that chart panel no longer exists
            vscode.commands.executeCommand('kusto.chartPanelStateChanged', false);
        }
    }

    // Register the runQuery command
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.runQuery', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'kusto') {
                return;
            }

            try {
                // run query and get results from the server
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
                await displayResults(results.dataHtml, results.rowCount, !!results.chartHtml);

                // Display chart if available
                displayChart(results.chartHtml);

            } catch (error) {
                vscode.window.showErrorMessage(`Failed to execute query: ${error}`);
            }
        })
    );
}
