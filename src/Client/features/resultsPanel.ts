// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
    This module manages the results webview, which displays query results in the "Results" tab of "The Panel"
*/

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';
import { copyToClipboard, formatCfHtml } from './clipboard';
import { saveResults, copyCellFromEditor, copyDataFromEditor, copyTableAsExpressionFromEditor } from './resultsViewer';
import * as chartPanel from './chartPanel';
import { resultDataToMarkdown } from './markdown';
import { resultDataToHtml, HtmlTable } from './html';

let resultsView: vscode.WebviewView | undefined;
let lastResultData: server.ResultData | undefined;
let lastTableNames: string[] = [];
let activeTabIndex = 0;
let languageClient: LanguageClient | undefined;

/**
 * Activates the results panel webview and registers associated commands.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {

    languageClient = client;

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
            // Listen for messages from the results webview
            webviewView.webview.onDidReceiveMessage((message) => {
                if (message.command === 'tabChanged' && typeof message.index === 'number') {
                    activeTabIndex = message.index;
                    // Refresh the cached expression for the newly active tab
                    sendExpressionToWebview();
                }
                if (message.command === 'requestExpression') {
                    sendExpressionToWebview();
                }
                if (message.command === 'copyText' && typeof message.text === 'string') {
                    vscode.env.clipboard.writeText(message.text);
                }
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

    // Register results-related commands
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.copyData', () => copyData()),
        vscode.commands.registerCommand('kusto.copyCell', () => copyCell()),
        vscode.commands.registerCommand('kusto.copyTableAsExpression', () => copyTableAsExpression(client)),
        vscode.commands.registerCommand('kusto.saveResults', () => saveResultsFromPanel(client))
    );
}

/**
 * Fetches data HTML from the server and displays it in the results view.
 * @param client The language client for LSP communication
 * @param resultData The ResultData object, or undefined to clear
 */
export async function displayResults(
    client: LanguageClient,
    resultData?: server.ResultData
): Promise<void>
{
    const data = resultData
        ? resultDataToHtml(resultData)
        : null;
    if (data && data.tables.length > 0) {
        lastResultData = resultData;
        lastTableNames = data.tables.map(t => t.name);
        activeTabIndex = 0;
        const html = buildTabbedHtml(data.tables);
        const totalRows = data.tables.reduce((sum, t) => sum + t.rowCount, 0);
        await showResultsHtml(html, totalRows, data.hasChart);
        // Eagerly fetch and send the datatable expression to the webview for drag-and-drop
        sendExpressionToWebview();
    } else {
        await showResultsHtml('<html>no results</html>', undefined, false);
    }
}

/**
 * Saves the current results panel data to a .kqr file,
 * closes any open chart panel, and opens the saved file.
 */
async function saveResultsFromPanel(client: LanguageClient): Promise<void> {
    if (!lastResultData) {
        vscode.window.showWarningMessage('No result data available to save.');
        return;
    }

    const result = await saveResults({ data: lastResultData });
    if (result) {
        // Close the chart panel if open
        await chartPanel.displayChart(client, undefined);
        // Open/reveal the saved file in the main editor group
        await vscode.commands.executeCommand('vscode.openWith', result.uri, 'kusto.resultEditor', vscode.ViewColumn.One);
    }
}

export async function displayError(error: server.QueryDiagnostic): Promise<void> {
    //var htmlMessage = `<html><body><p style="color: var(--vscode-errorForeground, red); display: flex; align-items: center; gap: 6px; font-family: var(--vscode-font-family, sans-serif);">\u274C<span>${escapeHtml(message)}</span></p></body></html>`;
    var htmlMessage = `<html><body><table><tr><td>\u274C</td><td><pre>${escapeHtml(error.message)}</pre></td></tr></tr><td></td><td><pre>${escapeHtml(error.details || '')}</pre></td></tr></table></body></html>`;
    await showResultsHtml(htmlMessage, undefined, false, true);
}

/** CSS styles for the tabbed results view. */
const tabStyles = `
<style>
    .tab-bar {
        display: flex;
        border-bottom: 1px solid var(--vscode-panel-border, #444);
        background: var(--vscode-editor-background, #1e1e1e);
        padding: 0;
        margin: 0;
        position: sticky;
        top: 0;
        z-index: 10;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
    }
    .tab-button {
        padding: 6px 16px;
        border: none;
        background: transparent;
        color: var(--vscode-foreground, #ccc);
        cursor: pointer;
        font-size: 12px;
        font-family: var(--vscode-font-family, sans-serif);
        border-bottom: 2px solid transparent;
        opacity: 0.7;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .tab-button:hover {
        opacity: 1;
        background: var(--vscode-list-hoverBackground, #2a2d2e);
    }
    .tab-button.active {
        opacity: 1;
        border-bottom-color: var(--vscode-focusBorder, #007acc);
        color: var(--vscode-foreground, #fff);
    }
    .tab-badge {
        margin-left: 6px;
        font-size: 10px;
        opacity: 0.6;
    }
    .tab-content {
        display: none;
    }
    .tab-content.active {
        display: block;
    }
</style>`;

/**
 * Wraps multiple HTML table strings in a tabbed layout.
 * If there is only one table, returns it without tabs.
 */
function buildTabbedHtml(tables: HtmlTable[]): string {
    if (tables.length === 0) {
        return '<html><body>no results</body></html>';
    }

    if (tables.length === 1) {
        return tables[0]!.html;
    }

    const tabButtons = tables.map((t, i) =>
        `<button class="tab-button${i === 0 ? ' active' : ''}" onclick="switchTab(${i})">${escapeHtml(t.name)}<span class="tab-badge">(${t.rowCount})</span></button>`
    ).join('\n');

    const tabContents = tables.map((t, i) =>
        `<div class="tab-content${i === 0 ? ' active' : ''}">${t.html}</div>`
    ).join('\n');

    return `<html>
<head>${tabStyles}</head>
<body>
<div class="tab-bar">
    ${tabButtons}
</div>
${tabContents}
</body>
</html>`;
}

/**
 * Escapes HTML special characters in a string.
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Displays query results in the results view.
 * @param dataHtml The HTML content to display
 * @param rowCount Optional row count for badge
 * @param hasChart Whether a chart is being displayed (affects show() behavior)
 * @param hasError Whether an error occurred (affects badge display)
 */
async function showResultsHtml(dataHtml: string, rowCount?: number, hasChart?: boolean, hasError?: boolean): Promise<void>
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
        } 
        else if (hasError)
        {
            resultsView.badge = {
                tooltip: 'Error',
                value: 1
            };
        }
        else
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
 * Copies the table cell under the cursor in the results view to the clipboard.
 */
async function copyCell(): Promise<void> {
    if (copyCellFromEditor()) {
        return;
    }
    if (!resultsView) {
        return;
    }

    resultsView.webview.postMessage({ command: 'copyCell' });
}

/**
 * Copies the active result table as a KQL datatable expression to the clipboard.
 * @param client The language client for LSP communication
 */
async function copyTableAsExpression(client: LanguageClient): Promise<void> {
    if (await copyTableAsExpressionFromEditor()) {
        return;
    }

    if (!lastResultData) {
        return;
    }

    try {
        const tableName = lastTableNames[activeTabIndex];
        const result = await server.getDataAsExpression(client, lastResultData, tableName);
        if (result?.expression) {
            await vscode.env.clipboard.writeText(result.expression);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy as expression: ${error}`);
    }
}

/**
 * Copies the results view content (as rich HTML + markdown) to the clipboard.
 * Uses the cached ResultData.
 */
async function copyData(): Promise<void> {
    if (await copyDataFromEditor()) {
        return;
    }

    if (!languageClient || !lastResultData) {
        return;
    }

    const tableName = lastTableNames[activeTabIndex];

    const htmlResult = resultDataToHtml(lastResultData, tableName);

    const html = htmlResult?.tables[0]?.html;
    const markdown = resultDataToMarkdown(lastResultData, tableName);

    if (html) {
        copyToClipboard([
            { format: 'HTML Format', data: formatCfHtml(html), encoding: 'utf8' },
            { format: 'Text', data: markdown || html, encoding: 'text' },
        ]);
    } else if (markdown) {
        vscode.env.clipboard.writeText(markdown);
    }
}

/** Script injected into webview HTML to handle messages from the extension. */
const webviewMessageHandlerScript = `
<script>
    const vscode = acquireVsCodeApi();

    // Tab switching
    let cachedExpression = '';

    function makeTablesDraggable() {
        // Find tables in the active tab, or all tables if no tabs
        const activeTab = document.querySelector('.tab-content.active');
        const container = activeTab || document.body;
        container.querySelectorAll('table').forEach(function(tbl) {
            tbl.setAttribute('draggable', 'true');
        });
    }
    makeTablesDraggable();

    function switchTab(index) {
        document.querySelectorAll('.tab-button').forEach(function(btn, i) {
            btn.classList.toggle('active', i === index);
        });
        document.querySelectorAll('.tab-content').forEach(function(content, i) {
            content.classList.toggle('active', i === index);
        });
        cachedExpression = '';  // Clear stale expression until the new tab's expression arrives
        makeTablesDraggable();  // Re-apply draggable on newly visible tables
        vscode.postMessage({ command: 'tabChanged', index: index });
    }

    // Track the element under the cursor when context menu opens
    let lastContextTarget = null;
    document.addEventListener('contextmenu', event => {
        lastContextTarget = event.target;
    });

    // Drag and drop from result tables: use event delegation so it works
    // regardless of when tables become visible (tab switching).
    // The actual expression text is sent from the extension host and cached here.
    document.addEventListener('dragstart', function(e) {
        const tbl = e.target.closest ? e.target.closest('table') : null;
        if (!tbl) { return; }
        if (cachedExpression) {
            e.dataTransfer.setData('text/plain', cachedExpression);
            e.dataTransfer.effectAllowed = 'copy';
        } else {
            // No expression cached yet — request it for next time
            vscode.postMessage({ command: 'requestExpression' });
            e.preventDefault();
        }
    });

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'setExpression' && typeof message.expression === 'string') {
            cachedExpression = message.expression;
        }

        if (message.command === 'copyCell') {
            // Find the closest td or th from the right-clicked element
            const cell = lastContextTarget ? lastContextTarget.closest('td, th') : null;
            if (cell) {
                vscode.postMessage({ command: 'copyText', text: cell.innerText });
            }
        }
    });
</script>`;

/**
 * Fetches the datatable expression for the current result/tab and sends it
 * to the webview so it is available immediately on dragstart.
 */
async function sendExpressionToWebview(): Promise<void> {
    if (!resultsView || !languageClient || !lastResultData) {
        return;
    }
    try {
        const tableName = lastTableNames[activeTabIndex];
        const result = await server.getDataAsExpression(languageClient, lastResultData, tableName);
        if (result?.expression && resultsView) {
            resultsView.webview.postMessage({ command: 'setExpression', expression: result.expression });
        }
    } catch {
        // Ignore — drag will just not work until expression is available
    }
}

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
