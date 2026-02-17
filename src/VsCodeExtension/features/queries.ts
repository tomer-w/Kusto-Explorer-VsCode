import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { setDocumentConnection } from './connections';
import * as server from './server';

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
        vscode.commands.registerCommand('kusto.copyQuery', () => copyQuery(client)),
        vscode.commands.registerCommand('kusto.formatQuery', () => formatQuery(client)),
        vscode.commands.registerCommand('kusto.copyChart', () => copyChart())
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
        const uri = editor.document.uri.toString();
        const selection = {
            start: { line: editor.selection.start.line, character: editor.selection.start.character },
            end: { line: editor.selection.end.line, character: editor.selection.end.character }
        };

        // run query and get results from the server
        const results = await server.runQuery(client, uri, selection);

        if (!results) {
            return; // No results or error
        }

        // If query changed cluster/database, update document connection
        if (results.cluster) {
            await setDocumentConnection(uri, results.cluster, results.database);
        }

        // Fetch and display results and chart
        const position = selection.start;
        await displayLastRunQueryResults(client, uri, position);
        await displayLastRunQueryChart(client, uri, position);

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to execute query: ${error}`);
    }
}

/**
 * Fetches data HTML from the server and displays it in the results view.
 * @param client The language client for LSP communication
 * @param uri The document URI
 * @param position The position within the document
 */
async function displayLastRunQueryResults(
    client: LanguageClient,
    uri: string,
    position: server.Position
): Promise<void> {
    const dataResult = await server.getLastRunDataAsHtml(client, uri, position);

    if (dataResult) {
        await displayResults(dataResult.html, dataResult.rowCount, dataResult.hasChart);
    } else {
        await displayResults('<html>no results</html>', undefined, false);
    }
}

/**
 * Fetches chart HTML from the server and displays it in the chart panel.
 * @param client The language client for LSP communication
 * @param uri The document URI
 * @param position The position within the document
 */
async function displayLastRunQueryChart(
    client: LanguageClient,
    uri: string,
    position: server.Position
): Promise<void> {
    const darkMode = isDarkMode();
    const chartHtml = await server.getLastRunChartAsHtml(client, uri, position, darkMode);
    displayChart(chartHtml ?? undefined);
}

/**
 * Determines if VS Code is currently using a dark color theme.
 */
function isDarkMode(): boolean {
    const colorTheme = vscode.window.activeColorTheme;
    // ColorThemeKind: Light = 1, Dark = 2, HighContrast = 3, HighContrastLight = 4
    return colorTheme.kind === vscode.ColorThemeKind.Dark || 
           colorTheme.kind === vscode.ColorThemeKind.HighContrast;
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
    } 
    catch (error)
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

            // Listen for messages from the chart webview
            chartPanel.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'copyChartError') {
                    vscode.window.showErrorMessage(`Chart copy failed in webview: ${message.error}`);
                }
                if (message.command === 'copyChartResult' && message.pngDataUrl) {
                    onCopyChartMessage(message.pngDataUrl, message.svgDataUrl);
                }
            });

            // Clear reference when user closes it
            chartPanel.onDidDispose(() =>
            {
                chartPanel = undefined;
                // Notify that chart panel state changed
                vscode.commands.executeCommand('kusto.chartPanelStateChanged');
            });
        }

        // Update content and reveal
        chartPanel.webview.html = injectChartMessageHandler(chartHtml);
        chartPanel.reveal(vscode.ViewColumn.Beside, true);
    }
    else if (chartPanel)
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
 * Handles the chart image data received from the webview and copies it to the clipboard.
 * Places both PNG and SVG (if available) formats on the clipboard.
 * @param pngDataUrl The PNG image as a data URL
 * @param svgDataUrl Optional SVG image as a data URL
 */
function onCopyChartMessage(pngDataUrl: string, svgDataUrl?: string): void {
    try {
        const pngBase64 = pngDataUrl.split(',')[1];

        // Extract SVG text if available
        let svgText = '';
        if (svgDataUrl) {
            // SVG data URL is: data:image/svg+xml,<svg>...</svg>
            const svgPart = svgDataUrl.split(',').slice(1).join(',');
            svgText = decodeURIComponent(svgPart);
        }

        const { spawn } = require('child_process') as typeof import('child_process');

        // Pass PNG and SVG via stdin as a JSON payload to avoid command-line length limits
        const psScript = `
            Add-Type -AssemblyName System.Windows.Forms
            $json = $input | Out-String
            $obj = $json | ConvertFrom-Json
            $pngBytes = [Convert]::FromBase64String($obj.png)
            $pngStream = New-Object System.IO.MemoryStream(,$pngBytes)
            $data = New-Object System.Windows.Forms.DataObject
            $data.SetData('PNG', $false, $pngStream)
            if ($obj.svg) {
                $svgBytes = [System.Text.Encoding]::UTF8.GetBytes($obj.svg)
                $svgStream = New-Object System.IO.MemoryStream(,$svgBytes)
                $data.SetData('image/svg+xml', $false, $svgStream)
            }
            [System.Windows.Forms.Clipboard]::SetDataObject($data, $true)
            $pngStream.Dispose()
        `;
        const ps = spawn('powershell', ['-sta', '-NoProfile', '-Command', psScript]);
        // Pipe data as JSON via stdin
        const payload = JSON.stringify({ png: pngBase64, svg: svgText || null });
        ps.stdin.write(payload);
        ps.stdin.end();
        ps.on('close', (code: number) => {
            if (code !== 0) {
                vscode.window.showErrorMessage(`Failed to copy chart to clipboard (exit code ${code})`);
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy chart: ${error}`);
    }
}

/**
 * Copies the chart as a PNG image to the clipboard.
 */
async function copyChart(): Promise<void> {
    if (!chartPanel) {
        return;
    }

    chartPanel.webview.postMessage({ command: 'copyChart' });
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

/** Script injected into chart webview HTML to handle copy as PNG. */
const chartMessageHandlerScript = `
<script>
    (function() {
        const vscodeApi = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;
        if (!vscodeApi) return;
        window.addEventListener('message', async event => {
            const message = event.data;
            if (message.command === 'copyChart') {
                try {
                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: plotDiv.offsetWidth, height: plotDiv.offsetHeight });
                        const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: plotDiv.offsetWidth, height: plotDiv.offsetHeight });
                        vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
                    } else {
                        // Fallback: use canvas if available
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            const dataUrl = canvas.toDataURL('image/png');
                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: dataUrl });
                        }
                    }
                } catch (err) {
                    vscodeApi.postMessage({ command: 'copyChartError', error: String(err) });
                }
            }
        });
    })();
</script>`;

/**
 * Injects the chart message handler script into chart HTML content.
 * Also adds data-vscode-context to suppress default context menu items.
 */
function injectChartMessageHandler(html: string): string {
    // Add data-vscode-context to suppress default Cut/Copy/Paste context menu items
    let result = html;
    const contextAttr = ` data-vscode-context='{"preventDefaultContextMenuItems": true}'`;
    if (result.includes('<body')) {
        result = result.replace('<body', '<body' + contextAttr);
    } else if (result.includes('<html')) {
        result = result.replace('<html>', '<html><body' + contextAttr + '>');
        if (result.includes('</html>')) {
            result = result.replace('</html>', '</body></html>');
        }
    }

    if (result.includes('</html>')) {
        return result.replace('</html>', chartMessageHandlerScript + '</html>');
    }
    if (result.includes('</body>')) {
        return result.replace('</body>', chartMessageHandlerScript + '</body>');
    }
    return result + chartMessageHandlerScript;
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


