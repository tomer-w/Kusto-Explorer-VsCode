import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { setDocumentConnection } from './connections';

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

    // Register commands (from package.json)
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.runQuery', () => runQuery(client)),
        vscode.commands.registerCommand('kusto.copyData', () => copyData()),
        vscode.commands.registerCommand('kusto.copyQuery', () => copyQuery(client))
    );
}

/**
 * Returns whether a chart panel currently exists.
 */
export function hasChartPanel(): boolean {
    return chartPanel !== undefined;
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
        // run query and get results from the server
        const results = await client.sendRequest<{
            title: string,
            dataHtml: string,
            rowCount?: number,
            chartHtml?: string,
            cluster?: string,
            database?: string
        } | null>(
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

        // If query changed cluster/database, update document connection
        if (results.cluster) {
            await setDocumentConnection(
                editor.document.uri.toString(),
                results.cluster,
                results.database
            );
        }

        // Display results in the results view
        await displayResults(results.dataHtml, results.rowCount, !!results.chartHtml);

        // Display chart if available
        displayChart(results.chartHtml);

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to execute query: ${error}`);
    }
}

/**
 * Displays query results in the results view.
 * @param dataHtml The HTML content to display
 * @param rowCount Optional row count for badge
 * @param hasChart Whether a chart is being displayed (affects show() behavior)
 */
async function displayResults(dataHtml: string, rowCount?: number, hasChart?: boolean): Promise<void>
{
    // Ensure the view is visible (this triggers resolveWebviewView if not already called)
    if (!resultsView)
    {
        await vscode.commands.executeCommand('kusto.resultsView.focus');
    }

    if (!resultsView)
    {
        return; // Still not available
    }

    try
    {
        resultsView.webview.html = injectMessageHandler(dataHtml);

        // Update badge
        if (rowCount)
        {
            resultsView.badge = {
                tooltip: `${rowCount} rows`,
                value: rowCount
            };
        } else
        {
            resultsView.badge = undefined;
        }

        // Only call show() if there's no chart - let the chart panel and results view coexist
        // The retainContextWhenHidden option will keep the view alive
        if (!hasChart)
        {
            resultsView.show(true);  // show but preserve focus on editor
        }
    } catch (error)
    {
        // Results view was disposed, try to recreate it
        await vscode.commands.executeCommand('kusto.resultsView.focus');

        if (resultsView)
        {
            try
            {
                resultsView.webview.html = injectMessageHandler(dataHtml);

                if (rowCount)
                {
                    resultsView.badge = {
                        tooltip: `${rowCount} rows`,
                        value: rowCount
                    };
                }

                if (!hasChart)
                {
                    resultsView.show(true);
                }
            } catch (retryError)
            {
                vscode.window.showErrorMessage(`Failed to display results: ${retryError}`);
            }
        }
    }
}

/**
 * Displays or hides the chart panel.
 * @param chartHtml The chart HTML to display, or undefined to hide the panel
 */
function displayChart(chartHtml: string | undefined): void
{
    if (chartHtml)
    {
        // Create panel only if it doesn't exist
        if (!chartPanel)
        {
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

            // Notify that chart panel state changed
            vscode.commands.executeCommand('kusto.chartPanelStateChanged');

            // Clear reference when user closes it
            chartPanel.onDidDispose(() =>
            {
                chartPanel = undefined;
                // Notify that chart panel state changed
                vscode.commands.executeCommand('kusto.chartPanelStateChanged');
            });
        }

        // Update content and reveal
        chartPanel.webview.html = chartHtml;
        chartPanel.reveal(vscode.ViewColumn.Beside, true);
    } else if (chartPanel)
    {
        // No chart to show, dispose the panel
        try
        {
            chartPanel.dispose();
        } catch
        {
            // Ignore disposal errors
        }
        chartPanel = undefined;
        // Notify that chart panel state changed
        vscode.commands.executeCommand('kusto.chartPanelStateChanged');
    }
}

/**
 * Copies the results view content (as rich HTML) to the clipboard.
 */
async function copyData(): Promise<void> {
    if (!resultsView) {
        return;
    }

    // Tell the webview to select all and copy (preserves HTML formatting)
    resultsView.webview.postMessage({ command: 'copyData' });
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
        // Get query boundaries from the server
        const result = await client.sendRequest<{
            uri: string;
            ranges: { start: { line: number; character: number }; end: { line: number; character: number } }[]
        } | null>(
            'kusto/getQueryRanges',
            { uri: editor.document.uri.toString() }
        );

        if (!result || !result.ranges.length) {
            return;
        }

        // Find the query range that contains the cursor
        const cursorPos = editor.selection.active;
        const queryRange = result.ranges.find(r => {
            const range = new vscode.Range(
                r.start.line, r.start.character,
                r.end.line, r.end.character
            );
            return range.contains(cursorPos);
        });

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

/** Script injected into webview HTML to handle messages from the extension. */
const webviewMessageHandlerScript = `
<script>
    const vscode = acquireVsCodeApi();
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'copyData') {
            const sel = window.getSelection();
            const prevRange = sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
            // Select all and copy as rich HTML
            document.execCommand('selectAll');
            document.execCommand('copy');
            // Restore previous selection
            sel.removeAllRanges();
            if (prevRange) { sel.addRange(prevRange); }
        }
    });
</script>`;

/**
 * Injects the message handler script into webview HTML content.
 * Also adds data-vscode-context to enable webview context menus.
 */
function injectMessageHandler(html: string): string {
    // Add data-vscode-context to the body tag to enable webview context menus
    let result = html;
    const contextAttr = ` data-vscode-context='{\"webviewSection\": \"results\"}'`;
    if (result.includes('<body')) {
        result = result.replace('<body', '<body' + contextAttr);
    } else if (result.includes('<html')) {
        // If no body tag, wrap content with a body tag
        result = result.replace('<html>', '<html><body' + contextAttr + '>');
        if (result.includes('</html>')) {
            result = result.replace('</html>', '</body></html>');
        }
    }

    // Insert script before </html> or append at the end
    if (result.includes('</html>')) {
        return result.replace('</html>', webviewMessageHandlerScript + '</html>');
    }
    if (result.includes('</body>')) {
        return result.replace('</body>', webviewMessageHandlerScript + '</body>');
    }
    return result + webviewMessageHandlerScript;
}


