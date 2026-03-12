// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
*   This module manages the custom editor for .kqr files, which contain saved query results
*   and displays both a chart and tabular result data.
*/

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';
import { copyToClipboard, ClipboardItem, formatCfHtml } from './clipboard';
import { resultDataToMarkdown } from './markdown';
import { resultDataToHtml, DataAsHtml, HtmlTable } from './html';

/** The view type used for the custom result editor. */
const resultEditorViewType = 'kusto.resultEditor';

/** The language client, set during activation. */
let languageClient: LanguageClient;

/** Set of all chart webview panels (singleton + chart editor tabs). */
const chartWebviews = new Set<vscode.WebviewPanel>();

/** The most recently focused chart webview panel. */
let activeChartWebview: vscode.WebviewPanel | undefined;

/** Known chart kinds for the edit panel dropdown (must match server-side ChartKind constants). */
const chartKinds = [
    'AreaChart', 'BarChart', 'Card', 'ColumnChart', 'Graph',
    'LineChart', 'PieChart', 'PivotChart', 'Plotly', 'Sankey',
    'ScatterChart', 'StackedAreaChart', '3DChart',
    'TimeLadderChart', 'TimeLineChart', 'TimeLineWithAnomalyChart',
    'TimePivot', 'TreeMap'
];

/** Known chart modes (must match server-side ChartMode constants). */
const chartModes = ['Default', 'Unstacked', 'Stacked', 'Stacked100'];

/** Known legend options (must match server-side ChartLegendMode constants). */
const legendOptions = ['Visible', 'Hidden'];

/** Known axis type options (must match server-side ChartAxis constants). */
const axisTypes = ['Linear', 'Log'];

/** Per-editor state for result editor webview panels. */
interface ResultEditorState {
    resultData: server.ResultData;
    tableNames: string[];
    activeView: string; // 'chart', 'table-0', 'table-1', etc.
    chartOptionsOverride?: server.ChartOptions;
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
        vscode.commands.registerCommand('kusto.copyChartLight', () => {
            activeChartWebview?.webview.postMessage({ command: 'copyChartLight' });
        }),
        vscode.commands.registerCommand('kusto.copyChartDark', () => {
            activeChartWebview?.webview.postMessage({ command: 'copyChartDark' });
        }),
        vscode.commands.registerCommand('kusto.toggleChartEditor', () => {
            activeChartWebview?.webview.postMessage({ command: 'toggleEditPanel' });
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
 * Returns the saved URI, or undefined if cancelled or failed.
 */
export async function saveResults(source: { data: server.ResultData }): Promise<{ uri: vscode.Uri; alreadyOpen: boolean } | undefined> {
    const resultData = source.data;

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

    // If the file is already open in an editor, update its content via WorkspaceEdit
    // so the custom editor re-renders automatically.
    const openDoc = vscode.workspace.textDocuments.find(
        doc => doc.uri.fsPath.toLowerCase() === finalUri.fsPath.toLowerCase()
    );

    if (openDoc) {
        const fullRange = new vscode.Range(
            openDoc.positionAt(0),
            openDoc.positionAt(openDoc.getText().length)
        );
        const edit = new vscode.WorkspaceEdit();
        edit.replace(openDoc.uri, fullRange, content);
        await vscode.workspace.applyEdit(edit);
        await openDoc.save();
        return { uri: finalUri, alreadyOpen: true };
    }

    await vscode.workspace.fs.writeFile(finalUri, Buffer.from(content, 'utf-8'));
    return { uri: finalUri, alreadyOpen: false };
}

/** Script injected into chart webview HTML to handle copy commands. */
const chartMessageHandlerScript = `
<script>
    (function() {
        const vscodeApi = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;
        if (!vscodeApi) return;
        // Expose for edit panel script
        window._vscodeApi = vscodeApi;

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

        // Colors for Copy (Light): dark text/axes on white bg
        const lightCopyColors = {
            'font.color': '#333333',
            'xaxis.color': '#333333',
            'xaxis.linecolor': '#333333',
            'xaxis.tickfont.color': '#333333',
            'xaxis.title.font.color': '#333333',
            'xaxis.gridcolor': 'rgba(0,0,0,0.15)',
            'yaxis.color': '#333333',
            'yaxis.linecolor': '#333333',
            'yaxis.tickfont.color': '#333333',
            'yaxis.title.font.color': '#333333',
            'yaxis.gridcolor': 'rgba(0,0,0,0.15)',
            'legend.font.color': '#333333'
        };

        // Colors for Copy (Dark): white text/axes on black bg
        const darkCopyColors = {
            'font.color': '#ffffff',
            'xaxis.color': '#ffffff',
            'xaxis.linecolor': '#ffffff',
            'xaxis.tickfont.color': '#ffffff',
            'xaxis.title.font.color': '#ffffff',
            'xaxis.gridcolor': 'rgba(255,255,255,0.15)',
            'yaxis.color': '#ffffff',
            'yaxis.linecolor': '#ffffff',
            'yaxis.tickfont.color': '#ffffff',
            'yaxis.title.font.color': '#ffffff',
            'yaxis.gridcolor': 'rgba(255,255,255,0.15)',
            'legend.font.color': '#ffffff'
        };

        // Transparent background for SVG
        const transparentBg = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        // Solid backgrounds for bitmap
        const whiteBg = {
            paper_bgcolor: '#ffffff',
            plot_bgcolor: '#ffffff'
        };

        const blackBg = {
            paper_bgcolor: '#000000',
            plot_bgcolor: '#000000'
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

            if (message.command === 'copyChartLight' || message.command === 'copyChartDark') {
                try {
                    const dark = message.command === 'copyChartDark';
                    const colors = dark ? darkCopyColors : lightCopyColors;
                    const solidBg = dark ? blackBg : whiteBg;

                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        const width = plotDiv.offsetWidth;
                        const height = plotDiv.offsetHeight;
                        const layout = plotDiv.layout || {};

                        // Save original layout properties before any changes
                        const savedLayout = {
                            paper_bgcolor: layout.paper_bgcolor,
                            plot_bgcolor: layout.plot_bgcolor,
                            'font.color': layout.font?.color ?? null,
                            'xaxis.color': layout.xaxis?.color ?? null,
                            'xaxis.linecolor': layout.xaxis?.linecolor ?? null,
                            'xaxis.tickfont.color': layout.xaxis?.tickfont?.color ?? null,
                            'xaxis.title.font.color': layout.xaxis?.title?.font?.color ?? null,
                            'xaxis.gridcolor': layout.xaxis?.gridcolor ?? null,
                            'yaxis.color': layout.yaxis?.color ?? null,
                            'yaxis.linecolor': layout.yaxis?.linecolor ?? null,
                            'yaxis.tickfont.color': layout.yaxis?.tickfont?.color ?? null,
                            'yaxis.title.font.color': layout.yaxis?.title?.font?.color ?? null,
                            'yaxis.gridcolor': layout.yaxis?.gridcolor ?? null,
                            'legend.font.color': layout.legend?.font?.color ?? null
                        };

                        // SVG: transparent background with appropriate text colors
                        await Plotly.relayout(plotDiv, { ...transparentBg, ...colors });
                        const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });

                        // PNG: solid background with matching text colors (scale 2x for readability)
                        await Plotly.relayout(plotDiv, solidBg);
                        const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });

                        // Restore original layout
                        await Plotly.relayout(plotDiv, savedLayout);

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

        // Update context key when this panel gains/loses focus
        const updateChartContext = () => {
            if (webviewPanel.active) {
                const state = editorStates.get(webviewPanel);
                const hasChart = !!state?.resultData?.chartOptions;
                vscode.commands.executeCommand('setContext', 'kusto.resultEditorHasChart', hasChart);
            }
        };
        webviewPanel.onDidChangeViewState(() => updateChartContext());

        // Debounce timer for chart options updates
        let chartOptionsTimer: ReturnType<typeof setTimeout> | undefined;
        let ignoringSelfEdit = false;

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
            if (message.command === 'chartOptionsChanged' && message.chartOptions) {
                const state = editorStates.get(webviewPanel);
                if (!state) { return; }
                state.chartOptionsOverride = message.chartOptions as server.ChartOptions;
                if (chartOptionsTimer) { clearTimeout(chartOptionsTimer); }
                chartOptionsTimer = setTimeout(async () => {
                    await this.updateChartOnly(state, webviewPanel);
                    // Persist updated chart options to the backing file
                    const updatedData: server.ResultData = { ...state.resultData, chartOptions: state.chartOptionsOverride! };
                    const content = JSON.stringify(updatedData, null, 2);
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    const edit = new vscode.WorkspaceEdit();
                    edit.replace(document.uri, fullRange, content);
                    ignoringSelfEdit = true;
                    await vscode.workspace.applyEdit(edit);
                    ignoringSelfEdit = false;
                }, 600);
                return;
            }
            handleChartWebviewMessage(message);
        });

        // Render from the document content
        await this.updateWebview(document, webviewPanel);

        // Re-render when the document content changes (e.g. external edit)
        const changeSubscription = vscode.workspace.onDidChangeTextDocument(async e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                if (ignoringSelfEdit) {
                    return;
                }
                await this.updateWebview(document, webviewPanel);
            }
        });

        // Re-render when the color theme changes
        const themeSubscription = vscode.window.onDidChangeActiveColorTheme(async () => {
            await this.updateWebview(document, webviewPanel);
        });

        webviewPanel.onDidDispose(() => {
            if (chartOptionsTimer) { clearTimeout(chartOptionsTimer); }
            editorStates.delete(webviewPanel);
            vscode.commands.executeCommand('setContext', 'kusto.resultEditorHasChart', false);
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
            Promise.resolve(resultDataToHtml(resultData)),
            resultData.chartOptions
                ? server.getChartAsHtml(languageClient, resultData, darkMode)
                : Promise.resolve(null)
        ]);

        const hasChart = !!chartResult?.html;
        const hasTable = !!dataResult?.tables?.length;

        // Update context key for editor title actions
        if (webviewPanel.active) {
            vscode.commands.executeCommand('setContext', 'kusto.resultEditorHasChart', hasChart);
        }

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

        const chartOptions = existingState?.chartOptionsOverride ?? resultData.chartOptions;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const html = this.buildDualViewHtml(dataResult, chartResult?.html, hasChart, chartOptions, columnNames);
        webviewPanel.webview.html = injectChartMessageHandler(html);
    }

    private async updateChartOnly(state: ResultEditorState, webviewPanel: vscode.WebviewPanel): Promise<void> {
        const chartOptions = state.chartOptionsOverride ?? state.resultData.chartOptions;
        if (!chartOptions) { return; }
        const modifiedData: server.ResultData = {
            ...state.resultData,
            chartOptions
        };
        const darkMode = isDarkMode();
        const chartResult = await server.getChartAsHtml(languageClient, modifiedData, darkMode);
        if (chartResult?.html) {
            webviewPanel.webview.postMessage({
                command: 'updateChart',
                chartBodyHtml: this.extractBody(chartResult.html)
            });
        }
    }

    private buildDualViewHtml(
        dataResult: DataAsHtml | null,
        chartHtml: string | undefined,
        hasChart: boolean,
        chartOptions?: server.ChartOptions,
        columnNames?: string[]
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

        // Build chart options edit panel
        const editPanelHtml = hasChart ? this.buildEditPanelHtml(chartOptions, columnNames ?? []) : '';

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
            align-items: center;
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
        .view-toggle .spacer { flex: 1; }
        .main-area {
            display: flex;
            height: calc(100vh - 33px);
        }
        .content-area {
            flex: 1;
            overflow: hidden;
            min-width: 0;
        }
        .view-content { display: none; height: 100%; overflow: auto; }
        .view-content.active { display: block; }
        #chart-view { padding: 0; }
        /* Edit panel */
        .edit-panel {
            display: none;
            width: 280px;
            min-width: 280px;
            border-left: 1px solid var(--vscode-panel-border, #444);
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            overflow-y: auto;
            padding: 12px;
            box-sizing: border-box;
        }
        .edit-panel.visible { display: block; }
        .edit-panel h3 {
            margin: 0 0 12px 0;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-foreground);
            opacity: 0.8;
        }
        .edit-panel .field { margin-bottom: 10px; }
        .edit-panel label {
            display: block;
            margin-bottom: 3px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground, var(--vscode-foreground));
        }
        .edit-panel select,
        .edit-panel input[type="text"] {
            width: 100%;
            padding: 4px 6px;
            background: var(--vscode-input-background, #3c3c3c);
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            border: 1px solid var(--vscode-input-border, #555);
            border-radius: 2px;
            font-family: inherit;
            font-size: inherit;
            box-sizing: border-box;
        }
        .edit-panel select:focus,
        .edit-panel input[type="text"]:focus {
            outline: 1px solid var(--vscode-focusBorder, #007acc);
            outline-offset: -1px;
        }
        .edit-panel .checkbox-field {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .edit-panel .checkbox-field label {
            display: inline;
            margin-bottom: 0;
        }
        .edit-panel .column-picker {
            display: flex;
            gap: 4px;
        }
        .edit-panel .column-picker select {
            flex: 1;
            min-width: 0;
        }
        .edit-panel .column-picker button {
            padding: 2px 8px;
            cursor: pointer;
            background: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #fff);
            border: none;
            border-radius: 2px;
            font-size: inherit;
        }
        .edit-panel .column-picker button:hover {
            background: var(--vscode-button-hoverBackground, #1177bb);
        }
        .edit-panel .column-list {
            list-style: none;
            padding: 0;
            margin: 4px 0 0 0;
            max-height: 120px;
            overflow-y: auto;
            border: 1px solid var(--vscode-input-border, #555);
            border-radius: 2px;
            background: var(--vscode-input-background, #3c3c3c);
        }
        .edit-panel .column-list:empty {
            display: none;
        }
        .edit-panel .column-list li {
            display: flex;
            align-items: center;
            padding: 2px 4px;
            gap: 2px;
        }
        .edit-panel .column-list li:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        .edit-panel .column-list li span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .edit-panel .column-list li button {
            background: none;
            border: none;
            color: var(--vscode-foreground, #ccc);
            cursor: pointer;
            padding: 0 2px;
            font-size: 14px;
            line-height: 1;
            opacity: 0.7;
        }
        .edit-panel .column-list li button:hover {
            opacity: 1;
        }
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
    <div class="main-area">
        <div class="content-area">
            ${hasChart ? `<div id="chart" class="view-content${firstActiveView === 'chart' ? ' active' : ''}" data-vscode-context='{"chartVisible": true, "preventDefaultContextMenuItems": true}'>${chartContent}</div>` : ''}
            ${tableContents}
        </div>
        ${editPanelHtml}
    </div>
    <script>
        // Set initial active table view
        (function() {
            var first = document.getElementById('${firstActiveView}');
            if (first) first.classList.add('active');
        })();

        // Track whether the user wants the edit panel open
        var editPanelUserVisible = false;

        function switchView(viewId) {
            document.querySelectorAll('.view-content').forEach(function(el) { el.classList.remove('active'); });
            document.querySelectorAll('.view-toggle button[data-view]').forEach(function(el) { el.classList.remove('active'); });
            var target = document.getElementById(viewId);
            if (target) target.classList.add('active');
            var btn = document.querySelector('.view-toggle button[data-view="' + viewId + '"]');
            if (btn) btn.classList.add('active');
            // Hide/restore edit panel based on view and user preference
            var editPanel = document.getElementById('edit-panel');
            if (editPanel) {
                if (viewId.startsWith('table-')) {
                    editPanel.classList.remove('visible');
                } else if (editPanelUserVisible) {
                    editPanel.classList.add('visible');
                }
            }
            // Trigger Plotly resize when switching to chart
            if (viewId === 'chart') {
                setTimeout(function() {
                    var plotDiv = document.querySelector('#chart .js-plotly-plot') || document.querySelector('#chart .plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        Plotly.Plots.resize(plotDiv);
                    }
                }, 50);
            }
        }

        function addColumnItem(pickerId, listId) {
            var picker = document.getElementById(pickerId);
            var list = document.getElementById(listId);
            if (!picker || !list || !picker.value) return;
            var val = picker.value;
            var li = document.createElement('li');
            var span = document.createElement('span');
            span.textContent = val;
            li.appendChild(span);
            var upBtn = document.createElement('button');
            upBtn.innerHTML = '&uarr;';
            upBtn.title = 'Move up';
            upBtn.onclick = function() { moveColumnItem(upBtn, -1); };
            li.appendChild(upBtn);
            var downBtn = document.createElement('button');
            downBtn.innerHTML = '&darr;';
            downBtn.title = 'Move down';
            downBtn.onclick = function() { moveColumnItem(downBtn, 1); };
            li.appendChild(downBtn);
            var removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove';
            removeBtn.onclick = function() { removeColumnItem(removeBtn); };
            li.appendChild(removeBtn);
            list.appendChild(li);
            onChartOptionChanged();
        }

        function removeColumnItem(btn) {
            var li = btn.closest('li');
            if (li) { li.remove(); onChartOptionChanged(); }
        }

        function moveColumnItem(btn, dir) {
            var li = btn.closest('li');
            if (!li) return;
            var list = li.parentNode;
            if (dir === -1 && li.previousElementSibling) {
                list.insertBefore(li, li.previousElementSibling);
            } else if (dir === 1 && li.nextElementSibling) {
                list.insertBefore(li.nextElementSibling, li);
            }
            onChartOptionChanged();
        }

        function toggleEditPanel() {
            var panel = document.getElementById('edit-panel');
            if (!panel) return;
            editPanelUserVisible = !editPanelUserVisible;
            panel.classList.toggle('visible', editPanelUserVisible);
            // Resize chart when panel toggles
            setTimeout(function() {
                var plotDiv = document.querySelector('#chart .js-plotly-plot') || document.querySelector('#chart .plotly-graph-div');
                if (plotDiv && typeof Plotly !== 'undefined') {
                    Plotly.Plots.resize(plotDiv);
                }
            }, 50);
        }

        // Collect current chart options from the edit panel form
        function collectChartOptions() {
            var opts = {};
            var kind = document.getElementById('opt-kind');
            if (kind) opts.kind = kind.value;
            var mode = document.getElementById('opt-mode');
            if (mode && mode.value) opts.mode = mode.value;
            var legend = document.getElementById('opt-legend');
            if (legend) opts.legend = legend.checked ? 'Visible' : 'Hidden';
            var title = document.getElementById('opt-title');
            if (title && title.value) opts.title = title.value;
            var xTitle = document.getElementById('opt-xTitle');
            if (xTitle && xTitle.value) opts.xTitle = xTitle.value;
            var yTitle = document.getElementById('opt-yTitle');
            if (yTitle && yTitle.value) opts.yTitle = yTitle.value;
            var xColumn = document.getElementById('opt-xColumn');
            if (xColumn && xColumn.value) opts.xColumn = xColumn.value;
            var yColList = document.getElementById('opt-yColumns-list');
            if (yColList) { var items = Array.from(yColList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (items.length) opts.yColumns = items; }
            var seriesList = document.getElementById('opt-series-list');
            if (seriesList) { var si = Array.from(seriesList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (si.length) opts.series = si; }
            var xAxis = document.getElementById('opt-xAxis');
            if (xAxis && xAxis.value) opts.xAxis = xAxis.value;
            var yAxis = document.getElementById('opt-yAxis');
            if (yAxis && yAxis.value) opts.yAxis = yAxis.value;
            var xmin = document.getElementById('opt-xmin');
            if (xmin && xmin.value) opts.xmin = xmin.value;
            var xmax = document.getElementById('opt-xmax');
            if (xmax && xmax.value) opts.xmax = xmax.value;
            var ymin = document.getElementById('opt-ymin');
            if (ymin && ymin.value) opts.ymin = ymin.value;
            var ymax = document.getElementById('opt-ymax');
            if (ymax && ymax.value) opts.ymax = ymax.value;
            var accumulate = document.getElementById('opt-accumulate');
            if (accumulate) opts.accumulate = accumulate.checked;
            return opts;
        }

        // Notify extension when any chart option changes
        function onChartOptionChanged() {
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'chartOptionsChanged', chartOptions: collectChartOptions() });
            }
        }

        // Listen for updateChart and toggleEditPanel messages from the extension
        window.addEventListener('message', function(event) {
            var msg = event.data;
            if (msg && msg.command === 'toggleEditPanel') {
                toggleEditPanel();
                return;
            }
            if (msg && msg.command === 'updateChart' && msg.chartBodyHtml) {
                var chartDiv = document.getElementById('chart');
                if (chartDiv) {
                    chartDiv.innerHTML = msg.chartBodyHtml;
                    // Re-execute any script tags in the new content
                    chartDiv.querySelectorAll('script').forEach(function(oldScript) {
                        var newScript = document.createElement('script');
                        if (oldScript.src) {
                            newScript.src = oldScript.src;
                        } else {
                            newScript.textContent = oldScript.textContent;
                        }
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            }
        });
    </script>
</body>
</html>`;
    }

    private buildEditPanelHtml(chartOptions: server.ChartOptions | undefined, columnNames: string[]): string {
        const opts = chartOptions ?? { kind: 'ColumnChart' };

        // Ensure the current kind is always present in the dropdown
        const allKinds = chartKinds.includes(opts.kind) ? chartKinds : [opts.kind, ...chartKinds];
        const kindOptions = allKinds.map(k =>
            `<option value="${k}"${k === opts.kind ? ' selected' : ''}>${this.escapeHtml(k)}</option>`
        ).join('');

        // Ensure the current mode is always present in the dropdown
        const currentMode = opts.mode ?? '';
        const allModes = !currentMode || chartModes.includes(currentMode) ? chartModes : [currentMode, ...chartModes];
        const modeOptions = ['', ...allModes].map(m =>
            `<option value="${m}"${m === currentMode ? ' selected' : ''}>${m || '(default)'}</option>`
        ).join('');

        const legendChecked = (opts.legend ?? 'Visible') !== 'Hidden' ? ' checked' : '';

        const xColOptions = ['', ...columnNames].map(c =>
            `<option value="${this.escapeHtml(c)}"${c === (opts.xColumn ?? '') ? ' selected' : ''}>${c || '(auto)'}</option>`
        ).join('');

        const currentXAxis = opts.xAxis ?? '';
        const allAxisTypes = currentXAxis && !axisTypes.includes(currentXAxis) ? [currentXAxis, ...axisTypes] : axisTypes;
        const xAxisOptions = ['', ...allAxisTypes].map(a =>
            `<option value="${a}"${a === currentXAxis ? ' selected' : ''}>${a || '(default)'}</option>`
        ).join('');

        const currentYAxis = opts.yAxis ?? '';
        const allYAxisTypes = currentYAxis && !axisTypes.includes(currentYAxis) ? [currentYAxis, ...axisTypes] : axisTypes;
        const yAxisOptions = ['', ...allYAxisTypes].map(a =>
            `<option value="${a}"${a === currentYAxis ? ' selected' : ''}>${a || '(default)'}</option>`
        ).join('');

        const allColOptions = columnNames.map(c =>
            `<option value="${this.escapeHtml(c)}">${this.escapeHtml(c)}</option>`
        ).join('');

        const yColumnsItems = (opts.yColumns ?? []).map(c =>
            `<li><span>${this.escapeHtml(c)}</span><button onclick="moveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="moveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="removeColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        const seriesItems = (opts.series ?? []).map(c =>
            `<li><span>${this.escapeHtml(c)}</span><button onclick="moveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="moveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="removeColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        return `<div id="edit-panel" class="edit-panel">
            <h3>Chart Options</h3>
            <div class="field">
                <label for="opt-kind">Chart Type</label>
                <select id="opt-kind" onchange="onChartOptionChanged()">${kindOptions}</select>
            </div>
            <div class="field">
                <label for="opt-mode">Mode</label>
                <select id="opt-mode" onchange="onChartOptionChanged()">${modeOptions}</select>
            </div>
            <div class="field checkbox-field">
                <input type="checkbox" id="opt-legend"${legendChecked} onchange="onChartOptionChanged()">
                <label for="opt-legend">Show Legend</label>
            </div>
            <div class="field">
                <label for="opt-title">Title</label>
                <input type="text" id="opt-title" value="${this.escapeHtml(opts.title ?? '')}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-xColumn">X Column</label>
                <select id="opt-xColumn" onchange="onChartOptionChanged()">${xColOptions}</select>
            </div>
            <div class="field">
                <label>Y Columns</label>
                <div class="column-picker">
                    <select id="opt-yColumns-picker">${allColOptions}</select>
                    <button onclick="addColumnItem('opt-yColumns-picker','opt-yColumns-list')">Add</button>
                </div>
                <ul id="opt-yColumns-list" class="column-list">${yColumnsItems}</ul>
            </div>
            <div class="field">
                <label>Series</label>
                <div class="column-picker">
                    <select id="opt-series-picker">${allColOptions}</select>
                    <button onclick="addColumnItem('opt-series-picker','opt-series-list')">Add</button>
                </div>
                <ul id="opt-series-list" class="column-list">${seriesItems}</ul>
            </div>
            <div class="field">
                <label for="opt-xTitle">X-Axis Title</label>
                <input type="text" id="opt-xTitle" value="${this.escapeHtml(opts.xTitle ?? '')}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-yTitle">Y-Axis Title</label>
                <input type="text" id="opt-yTitle" value="${this.escapeHtml(opts.yTitle ?? '')}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-xAxis">X-Axis Type</label>
                <select id="opt-xAxis" onchange="onChartOptionChanged()">${xAxisOptions}</select>
            </div>
            <div class="field">
                <label for="opt-yAxis">Y-Axis Type</label>
                <select id="opt-yAxis" onchange="onChartOptionChanged()">${yAxisOptions}</select>
            </div>
            <div class="field">
                <label for="opt-xmin">X Min</label>
                <input type="text" id="opt-xmin" value="${this.escapeHtml(String(opts.xmin ?? ''))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-xmax">X Max</label>
                <input type="text" id="opt-xmax" value="${this.escapeHtml(String(opts.xmax ?? ''))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-ymin">Y Min</label>
                <input type="text" id="opt-ymin" value="${this.escapeHtml(String(opts.ymin ?? ''))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-ymax">Y Max</label>
                <input type="text" id="opt-ymax" value="${this.escapeHtml(String(opts.ymax ?? ''))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field checkbox-field">
                <input type="checkbox" id="opt-accumulate"${opts.accumulate ? ' checked' : ''} onchange="onChartOptionChanged()">
                <label for="opt-accumulate">Accumulate</label>
            </div>
        </div>`;
    }

    private buildTabbedTableHtml(tables: HtmlTable[]): string {
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

    const htmlResult = resultDataToHtml(state.resultData, tableName);

    const html = htmlResult?.tables[0]?.html;
    const markdown = resultDataToMarkdown(state.resultData, tableName);

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
        const result = await server.getDataAsExpression(languageClient, state.resultData, tableName);
        if (result?.expression) {
            await vscode.env.clipboard.writeText(result.expression);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy as expression: ${error}`);
    }
    return true;
}
