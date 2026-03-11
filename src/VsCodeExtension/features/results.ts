// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';
import { copyToClipboard, ClipboardItem, formatCfHtml } from './clipboard';

/** The view type used for the custom result editor. */
const resultEditorViewType = 'kusto.resultEditor';

/** The language client, set during activation. */
let languageClient: LanguageClient;

/** Set of all chart webview panels (singleton + chart editor tabs). */
const chartWebviews = new Set<vscode.WebviewPanel>();

/** The most recently focused chart webview panel. */
let activeChartWebview: vscode.WebviewPanel | undefined;

/** Per-editor state for result editor webview panels. */
interface ResultEditorState {
    resultData: server.ResultData;
    tableNames: string[];
    activeView: string; // 'chart', 'table-0', 'table-1', etc.
}

/** Map from webview panel to its editor state. */
const editorStates = new Map<vscode.WebviewPanel, ResultEditorState>();

/**
 * Registers a chart webview panel for copy command targeting.
 * Tracks focus and removes on dispose.
 */
export function registerChartWebview(panel: vscode.WebviewPanel): void {
    chartWebviews.add(panel);
    activeChartWebview = panel;

    panel.onDidChangeViewState(() => {
        if (panel.active) {
            activeChartWebview = panel;
        }
    });

    panel.onDidDispose(() => {
        chartWebviews.delete(panel);
        if (activeChartWebview === panel) {
            activeChartWebview = undefined;
        }
    });
}

/**
 * Activates the chart file feature, registering the custom editor provider
 * and chart copy commands.
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    languageClient = client;

    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            resultEditorViewType,
            new ResultEditorProvider(),
            { supportsMultipleEditorsPerDocument: false }
        )
    );

    // Register copy commands that target whichever chart webview is active
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.copyChart', () => {
            activeChartWebview?.webview.postMessage({ command: 'copyChart' });
        }),
        vscode.commands.registerCommand('kusto.copyChartTransparent', () => {
            activeChartWebview?.webview.postMessage({ command: 'copyChartTransparent' });
        })
    );
}

/**
 * Determines if VS Code is currently using a dark color theme.
 */
export function isDarkMode(): boolean {
    const colorTheme = vscode.window.activeColorTheme;
    return colorTheme.kind === vscode.ColorThemeKind.Dark ||
           colorTheme.kind === vscode.ColorThemeKind.HighContrast;
}

/**
 * Handles chart webview messages for copy commands.
 * Call this from any webview's onDidReceiveMessage to support chart copy.
 * Returns true if the message was handled.
 */
export function handleChartWebviewMessage(message: { command?: string; pngDataUrl?: string; svgDataUrl?: string; error?: string }): boolean {
    if (message.command === 'copyChartError') {
        vscode.window.showErrorMessage(`Chart copy failed in webview: ${message.error}`);
        return true;
    }
    if (message.command === 'copyChartResult' && message.pngDataUrl) {
        onCopyChartMessage(message.pngDataUrl, message.svgDataUrl);
        return true;
    }
    return false;
}

/**
 * Handles the chart image data received from the webview and copies it to the clipboard.
 * Places both PNG and SVG (if available) formats on the clipboard.
 */
function onCopyChartMessage(pngDataUrl: string, svgDataUrl?: string): void {
    try {
        const pngBase64 = pngDataUrl.split(',')[1] ?? '';

        const items: ClipboardItem[] = [
            { format: 'PNG', data: pngBase64, encoding: 'base64' }
        ];

        if (svgDataUrl) {
            // SVG data URL is: data:image/svg+xml,<svg>...</svg>
            const svgPart = svgDataUrl.split(',').slice(1).join(',');
            const svgText = decodeURIComponent(svgPart);
            items.push({ format: 'image/svg+xml', data: svgText });
        }

        copyToClipboard(items).catch(error => {
            vscode.window.showErrorMessage(`Failed to copy chart to clipboard: ${error}`);
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy chart: ${error}`);
    }
}

/**
 * Saves result data to a .kqr file.
 * Accepts either a dataId (fetches ResultData from the server) or ResultData directly.
 * Returns the saved URI, or undefined if cancelled or failed.
 */
export async function saveResults(source: { dataId: string } | { data: server.ResultData }): Promise<vscode.Uri | undefined> {
    let resultData: server.ResultData | null;

    if ('data' in source) {
        resultData = source.data;
    } else {
        resultData = await server.getResultData(languageClient, source.dataId);
        if (!resultData) {
            vscode.window.showWarningMessage('Failed to retrieve result data.');
            return undefined;
        }
    }

    const saveUri = await vscode.window.showSaveDialog({
        filters: { 'Kusto Query Results': ['kqr'] },
        defaultUri: vscode.Uri.file('results.kqr')
    });

    if (!saveUri) {
        return undefined;
    }

    // Ensure the file has the .kqr extension
    const finalUri = saveUri.path.endsWith('.kqr')
        ? saveUri
        : saveUri.with({ path: saveUri.path + '.kqr' });

    const content = JSON.stringify(resultData, null, 2);
    await vscode.workspace.fs.writeFile(finalUri, Buffer.from(content, 'utf-8'));

    return finalUri;
}

/** Script injected into chart webview HTML to handle copy commands. */
const chartMessageHandlerScript = `
<script>
    (function() {
        const vscodeApi = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;
        if (!vscodeApi) return;

        // Track the element under the cursor when context menu opens (for copyCell)
        let lastContextTarget = null;
        document.addEventListener('contextmenu', function(event) {
            lastContextTarget = event.target;
        });

        // Notify the extension when the active view tab changes
        document.addEventListener('click', function(e) {
            const btn = e.target.closest ? e.target.closest('.view-toggle button[data-view]') : null;
            if (btn) {
                vscodeApi.postMessage({ command: 'viewChanged', viewId: btn.getAttribute('data-view') });
            }
        });

        // Light-mode color overrides (dot-notation keys for precise save/restore)
        const lightModeColors = {
            'font.color': '#333333',
            'xaxis.color': '#333333',
            'xaxis.gridcolor': '#e0e0e0',
            'yaxis.color': '#333333',
            'yaxis.gridcolor': '#e0e0e0',
            'legend.font.color': '#333333'
        };

        // Transparent background for SVG (pastes well into Word/Outlook)
        const transparentBg = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        // White background for bitmap (pastes well into Teams/Discord)
        const whiteBg = {
            paper_bgcolor: '#ffffff',
            plot_bgcolor: '#ffffff'
        };

        window.addEventListener('message', async event => {
            const message = event.data;

            if (message.command === 'copyCell') {
                const cell = lastContextTarget ? lastContextTarget.closest('td, th') : null;
                if (cell) {
                    vscodeApi.postMessage({ command: 'copyText', text: cell.innerText });
                }
                return;
            }

            if (message.command === 'copyChart' || message.command === 'copyChartTransparent') {
                try {
                    const transparent = message.command === 'copyChartTransparent';
                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        const width = plotDiv.offsetWidth;
                        const height = plotDiv.offsetHeight;

                        // Save original layout properties before any changes
                        let savedLayout = null;
                        if (transparent) {
                            const layout = plotDiv.layout || {};
                            // Use dot-notation keys so Plotly restores nested properties correctly.
                            savedLayout = {
                                paper_bgcolor: layout.paper_bgcolor,
                                plot_bgcolor: layout.plot_bgcolor,
                                'font.color': layout.font?.color ?? null,
                                'xaxis.color': layout.xaxis?.color ?? null,
                                'xaxis.gridcolor': layout.xaxis?.gridcolor ?? null,
                                'yaxis.color': layout.yaxis?.color ?? null,
                                'yaxis.gridcolor': layout.yaxis?.gridcolor ?? null,
                                'legend.font.color': layout.legend?.font?.color ?? null
                            };

                            // Generate transparent SVG with light-mode colors
                            await Plotly.relayout(plotDiv, { ...transparentBg, ...lightModeColors });
                            const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });

                            // Generate white-background PNG with light-mode colors (for bitmap: Teams, Discord)
                            // Scale 2x so the bitmap is large enough to read when pasted
                            await Plotly.relayout(plotDiv, whiteBg);
                            const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });

                            // Restore original layout
                            await Plotly.relayout(plotDiv, savedLayout);

                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
                        } else {
                            // Scale 2x so the bitmap is large enough to read when pasted
                            const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });
                            const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });
                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
                        }
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
export function injectChartMessageHandler(html: string): string {
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

/**
 * Custom editor provider for .kqr files.
 * The file contains ResultData JSON (tables + chart options).
 * Shows both data tables and chart with a toggle tab bar.
 */
class ResultEditorProvider implements vscode.CustomTextEditorProvider {

    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true
        };

        // Track this editor webview for copy commands
        registerChartWebview(webviewPanel);

        // Listen for messages from the webview
        webviewPanel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'viewChanged' && typeof message.viewId === 'string') {
                const state = editorStates.get(webviewPanel);
                if (state) {
                    state.activeView = message.viewId;
                }
                return;
            }
            if (message.command === 'copyText' && typeof message.text === 'string') {
                vscode.env.clipboard.writeText(message.text);
                return;
            }
            handleChartWebviewMessage(message);
        });

        // Render from the document content
        await this.updateWebview(document, webviewPanel);

        // Re-render when the document content changes (e.g. external edit)
        const changeSubscription = vscode.workspace.onDidChangeTextDocument(async e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                await this.updateWebview(document, webviewPanel);
            }
        });

        // Re-render when the color theme changes
        const themeSubscription = vscode.window.onDidChangeActiveColorTheme(async () => {
            await this.updateWebview(document, webviewPanel);
        });

        webviewPanel.onDidDispose(() => {
            editorStates.delete(webviewPanel);
            changeSubscription.dispose();
            themeSubscription.dispose();
        });
    }

    private async updateWebview(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
        const text = document.getText();

        let resultData: server.ResultData | undefined;
        try {
            resultData = JSON.parse(text) as server.ResultData;
        } catch {
            webviewPanel.webview.html = '<html><body><p>Invalid result file.</p></body></html>';
            return;
        }

        if (!resultData?.tables?.length) {
            webviewPanel.webview.html = '<html><body><p>No result data found.</p></body></html>';
            return;
        }

        const darkMode = isDarkMode();

        // Fetch both table HTML and chart HTML in parallel
        const [dataResult, chartResult] = await Promise.all([
            server.getDataAsHtml(languageClient, undefined, resultData, undefined),
            resultData.chartOptions
                ? server.getChartAsHtml(languageClient, undefined, resultData, darkMode)
                : Promise.resolve(null)
        ]);

        const hasChart = !!chartResult?.html;
        const hasTable = !!dataResult?.tables?.length;

        if (!hasTable && !hasChart) {
            webviewPanel.webview.html = '<html><body><p>Failed to render results.</p></body></html>';
            return;
        }

        // Track editor state for copy commands
        const tableNames = (dataResult?.tables ?? []).map(t => t.name);
        const firstActiveView = hasChart ? 'chart' : 'table-0';
        const existingState = editorStates.get(webviewPanel);
        editorStates.set(webviewPanel, {
            resultData,
            tableNames,
            activeView: existingState?.activeView ?? firstActiveView
        });

        const html = this.buildDualViewHtml(dataResult, chartResult?.html, hasChart);
        webviewPanel.webview.html = injectChartMessageHandler(html);
    }

    private buildDualViewHtml(
        dataResult: server.DataAsHtml | null,
        chartHtml: string | undefined,
        hasChart: boolean
    ): string {
        const tables = dataResult?.tables ?? [];

        // Build individual table divs
        const tableContents = tables.map((t, i) =>
            `<div id="table-${i}" class="view-content" data-vscode-context='{"chartVisible": false, "preventDefaultContextMenuItems": true}'>${t.html}</div>`
        ).join('');

        // Extract the chart body content from the full HTML
        const chartContent = chartHtml
            ? this.extractBody(chartHtml)
            : '';

        // Extract chart head content (scripts like Plotly)
        const chartHead = chartHtml
            ? this.extractHead(chartHtml)
            : '';

        // Build the toggle buttons
        const chartButton = hasChart
            ? `<button class="active" data-view="chart" onclick="switchView('chart')">Chart</button>`
            : '';

        let tableButtons: string;
        if (tables.length === 1) {
            tableButtons = `<button${hasChart ? '' : ' class="active"'} data-view="table-0" onclick="switchView('table-0')">Data</button>`;
        } else {
            tableButtons = tables.map((t, i) =>
                `<button${!hasChart && i === 0 ? ' class="active"' : ''} data-view="table-${i}" onclick="switchView('table-${i}')">${this.escapeHtml(t.name)} (${t.rowCount})</button>`
            ).join('');
        }

        const firstActiveView = hasChart ? 'chart' : 'table-0';

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${chartHead}
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family, sans-serif);
            font-size: var(--vscode-font-size, 13px);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .view-toggle {
            display: flex;
            border-bottom: 1px solid var(--vscode-panel-border, #444);
            background: var(--vscode-editor-background);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .view-toggle button {
            padding: 6px 16px;
            border: none;
            background: transparent;
            color: var(--vscode-foreground);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-family: inherit;
            font-size: inherit;
        }
        .view-toggle button:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        .view-toggle button.active {
            border-bottom-color: var(--vscode-focusBorder, #007acc);
            color: var(--vscode-foreground);
        }
        .view-content { display: none; height: calc(100vh - 33px); overflow: auto; }
        .view-content.active { display: block; }
        #chart-view { padding: 0; }
        /* Table styles */
        table { border-collapse: collapse; width: 100%; }
        th, td {
            padding: 4px 8px;
            text-align: left;
            border: 1px solid var(--vscode-editorGroup-border, var(--vscode-panel-border, #666));
            white-space: nowrap;
        }
        th {
            position: sticky;
            top: 0;
            background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
            z-index: 1;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="view-toggle">
        ${chartButton}
        ${tableButtons}
    </div>
    ${hasChart ? `<div id="chart" class="view-content${firstActiveView === 'chart' ? ' active' : ''}" data-vscode-context='{"chartVisible": true, "preventDefaultContextMenuItems": true}'>${chartContent}</div>` : ''}
    ${tableContents}
    <script>
        // Set initial active table view
        (function() {
            var first = document.getElementById('${firstActiveView}');
            if (first) first.classList.add('active');
        })();

        function switchView(viewId) {
            document.querySelectorAll('.view-content').forEach(function(el) { el.classList.remove('active'); });
            document.querySelectorAll('.view-toggle button').forEach(function(el) { el.classList.remove('active'); });
            var target = document.getElementById(viewId);
            if (target) target.classList.add('active');
            var btn = document.querySelector('.view-toggle button[data-view="' + viewId + '"]');
            if (btn) btn.classList.add('active');
            // Trigger Plotly resize when switching to chart
            if (viewId === 'chart') {
                var plotDiv = document.querySelector('#chart .js-plotly-plot') || document.querySelector('#chart .plotly-graph-div');
                if (plotDiv && typeof Plotly !== 'undefined') {
                    Plotly.Plots.resize(plotDiv);
                }
            }
        }
    </script>
</body>
</html>`;
    }

    private buildTabbedTableHtml(tables: server.HtmlTable[]): string {
        if (tables.length === 1) {
            return tables[0]!.html;
        }
        const tabs = tables.map((t, i) =>
            `<button class="table-tab${i === 0 ? ' active' : ''}" onclick="switchTable(${i})">${this.escapeHtml(t.name)} (${t.rowCount})</button>`
        ).join('');
        const contents = tables.map((t, i) =>
            `<div class="table-content${i === 0 ? ' active' : ''}">${t.html}</div>`
        ).join('');
        return `<div class="table-tabs">${tabs}</div>${contents}`;
    }

    private extractBody(html: string): string {
        const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return match?.[1] ?? html;
    }

    private extractHead(html: string): string {
        const match = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        return match?.[1] ?? '';
    }

    private escapeHtml(text: string): string {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

/**
 * Gets the active result editor state, if the active chart webview is a result editor.
 */
function getActiveEditorState(): ResultEditorState | undefined {
    if (!activeChartWebview?.active) {
        return undefined;
    }
    return editorStates.get(activeChartWebview);
}

/**
 * Gets the active table name from a result editor state, or undefined if the chart view is active.
 */
function getActiveTableName(state: ResultEditorState): string | undefined {
    const match = state.activeView.match(/^table-(\d+)$/);
    if (match) {
        const idx = parseInt(match[1]!, 10);
        return state.tableNames[idx];
    }
    return state.tableNames[0];
}

/**
 * Copies the table cell under the cursor in the active result editor.
 * Returns true if handled.
 */
export function copyCellFromEditor(): boolean {
    const state = getActiveEditorState();
    if (!state || !activeChartWebview) {
        return false;
    }
    activeChartWebview.webview.postMessage({ command: 'copyCell' });
    return true;
}

/**
 * Copies the active table data from the result editor as HTML + markdown.
 * Returns true if handled.
 */
export async function copyDataFromEditor(): Promise<boolean> {
    const state = getActiveEditorState();
    if (!state) {
        return false;
    }

    const tableName = getActiveTableName(state);

    const [htmlResult, markdownResult] = await Promise.all([
        server.getDataAsHtml(languageClient, undefined, state.resultData, tableName),
        server.getDataAsMarkdown(languageClient, undefined, tableName, state.resultData),
    ]);

    const html = htmlResult?.tables[0]?.html;
    const markdown = markdownResult?.markdown;

    if (html) {
        copyToClipboard([
            { format: 'HTML Format', data: formatCfHtml(html), encoding: 'utf8' },
            { format: 'Text', data: markdown || html, encoding: 'text' },
        ]);
    } else if (markdown) {
        vscode.env.clipboard.writeText(markdown);
    }
    return true;
}

/**
 * Copies the active table as a KQL datatable expression from the result editor.
 * Returns true if handled.
 */
export async function copyTableAsExpressionFromEditor(): Promise<boolean> {
    const state = getActiveEditorState();
    if (!state) {
        return false;
    }

    try {
        const tableName = getActiveTableName(state);
        const result = await server.getDataAsExpression(languageClient, undefined, tableName, state.resultData);
        if (result?.expression) {
            await vscode.env.clipboard.writeText(result.expression);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy as expression: ${error}`);
    }
    return true;
}
