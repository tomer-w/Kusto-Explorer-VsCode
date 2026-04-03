// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
*   This module implements ResultsViewer class that handles UI for displaying query results (data and charts) 
*   inside webviews.
*/

import * as vscode from 'vscode';
import type { IServer } from './server';
import * as server from './server';
import { Clipboard } from './clipboard';
import type { ClipboardItem } from './clipboard';
import { formatCfHtml } from './clipboard';
import { resultDataToMarkdown } from './markdown';
import { resultDataToHtml, DataAsHtml, HtmlTable } from './html';

/** The view type used for the custom results viewer. */
const resultViewerViewType = 'kusto.resultViewer';

/** Known chart types for the edit panel dropdown (must match server-side ChartType constants). */
const chartTypes = [
    'AreaChart', 'BarChart', 'Card', 'ColumnChart', 'Graph',
    'LineChart', 'PieChart', 'PivotChart', 'Plotly', 'Sankey',
    'ScatterChart', 'StackedAreaChart', '3DChart',
    'TimeLadderChart', 'TimeLineChart', 'TimeLineWithAnomalyChart',
    'TimePivot', 'TreeMap'
];

/** Known chart kinds (must match server-side ChartKind constants). */
const chartKinds = ['Default', 'Unstacked', 'Stacked', 'Stacked100'];

/** Known legend position options (must match server-side ChartLegendPosition constants). */
const legendPositions = ['Right', 'Bottom', 'Hidden'];

/** Known axis type options (must match server-side ChartAxis constants). */
const axisTypes = ['Linear', 'Log'];

/** Known sort order options (must match server-side ChartSortOrder constants). */
const sortOrders = ['Default', 'Ascending', 'Descending'];

/** Known color mode options (must match server-side ChartMode constants). */
const chartModes = ['Light', 'Dark'];

/** Known aspect ratio presets (must match server-side ChartAspectRatio constants). */
const aspectRatios = ['16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16'];

/** Known text size presets (must match server-side ChartTextSize constants). */
const textSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

/** Known visibility options (must match server-side ChartVisibility constants). */
const visibilityOptions = ['Visible', 'Hidden'];

/**
 * Controls which content sections are shown in a result view.
 * - 'chart': Only the chart, no tabs.
 * - 'data': Only data tables. Tabs shown only if multiple tables.
 * - 'all': Chart, data tables, and query tabs — all visible.
 */
export type ResultViewMode = 'chart' | 'data' | 'detail' | 'all';

/** Per-viewer state for results viewer webviews. */
interface ResultViewerState {
    resultData: server.ResultData;
    tableNames: string[];
    activeView: string; // 'chart', 'table-0', 'table-1', etc.
    chartOptionsOverride?: server.ChartOptions;
}

/**
 * Determines if VS Code is currently using a dark color theme.
 */
export function isDarkMode(): boolean {
    const colorTheme = vscode.window.activeColorTheme;
    return colorTheme.kind === vscode.ColorThemeKind.Dark ||
           colorTheme.kind === vscode.ColorThemeKind.HighContrast;
}

function escapeHtmlStatic(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Base script injected into all result webviews for core message handling. */
const webviewMessageHandlerScript = `
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

        window.addEventListener('message', async event => {
            const message = event.data;

            if (message.command === 'copyCell') {
                const cell = lastContextTarget ? lastContextTarget.closest('td, th') : null;
                if (cell) {
                    vscodeApi.postMessage({ command: 'copyText', text: cell.innerText });
                }
                return;
            }
        });
    })();
</script>`;

/** Chart-specific script for Plotly copy commands. Only injected when a chart is present. */
const chartCopyScript = `
<script>
    (function() {
        const vscodeApi = window._vscodeApi;
        if (!vscodeApi) return;

        window.addEventListener('message', async event => {
            const message = event.data;

            if (message.command === 'copyChart') {
                try {
                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        // Use aspect ratio for consistent copy dimensions if set
                        const chartDiv = document.getElementById('chart');
                        const arValue = chartDiv ? getComputedStyle(chartDiv).getPropertyValue('--chart-aspect-ratio').trim() : '';
                        let width = plotDiv.offsetWidth;
                        let height = plotDiv.offsetHeight;
                        if (arValue) {
                            const parts = arValue.split('/').map(Number);
                            if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
                                width = 800;
                                height = Math.round(800 * parts[1] / parts[0]);
                            }
                        }
                        const layout = plotDiv.layout || {};

                        // PNG: copy as-is (scale 2x for readability)
                        const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });

                        // SVG: use transparent background so it layers well in documents
                        var savedPaperBg = layout.paper_bgcolor || '#fff';
                        var savedPlotBg = layout.plot_bgcolor || '#fff';
                        await Plotly.relayout(plotDiv, { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)' });
                        const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });
                        await Plotly.relayout(plotDiv, { paper_bgcolor: savedPaperBg, plot_bgcolor: savedPlotBg });

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
 * Injects webview message handler scripts into result HTML content.
 * Always injects the base handler; only includes chart copy script when hasChart is true.
 * Also adds data-vscode-context to suppress default context menu items.
 */
function injectMessageHandlerScripts(html: string, hasChart: boolean): string {
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

    const scripts = hasChart
        ? webviewMessageHandlerScript + chartCopyScript
        : webviewMessageHandlerScript;

    if (result.includes('</html>')) {
        return result.replace('</html>', scripts + '</html>');
    }
    if (result.includes('</body>')) {
        return result.replace('</body>', scripts + '</body>');
    }
    return result + scripts;
}

/**
 * Saves result data to a .kqr file.
 * Returns the saved URI, or undefined if cancelled or failed.
 */
async function saveResults(source: { data: server.ResultData }): Promise<{ uri: vscode.Uri; alreadyOpen: boolean } | undefined> {
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

// =============================================================================
// ResultsViewer — main class
// =============================================================================

/**
*   The ResultsViewer class handles UI for multiple query results that can each show a combination of data tables, charts, and query text in a variety of locations:
* 
*   - Bottom view - results shown in the bottom panel
*   - Singleton view - a tab view not associated with a file backed document, typically used to show just charts
*   - Document view - a tab view for results saved to a .kqr file that may include data, charts and query
*
*   More than one view can exist at the same time, but only one is the active view
*/
export class ResultsViewer {

    private readonly server: IServer;
    private readonly clipboard: Clipboard;
    private readonly htmlBuilder: DocumentViewProvider;

    /** Map from webview to its viewer state. */
    private readonly viewerStates = new Map<vscode.WebviewPanel, ResultViewerState>();

    /** Set of all result webviews (singleton + results viewer tabs). */
    private readonly resultWebviews = new Set<vscode.WebviewPanel>();

    /** The most recently focused result webview. */
    private activeResultWebview: vscode.WebviewPanel | undefined;

    // ─── Bottom view state ──────────────────────────────────────────────
    private resultsPanel: vscode.WebviewView | undefined;
    private lastPanelResultData: server.ResultData | undefined;
    private lastPanelTableNames: string[] = [];
    private panelActiveTabIndex = 0;
    private waitForPanelReady: (() => Promise<void>) | undefined;

    // ─── Singleton view state ───────────────────────────────────────────
    private singletonView: vscode.WebviewPanel | undefined;
    private singletonResultData: server.ResultData | undefined;
    private singletonChartOptionsOverride: server.ChartOptions | undefined;
    private singletonChartOptionsTimer: ReturnType<typeof setTimeout> | undefined;
    private singletonBackingUri: vscode.Uri | undefined;
    private singletonWriteBackTimer: ReturnType<typeof setTimeout> | undefined;
    private singletonMode: ResultViewMode | undefined;

    constructor(context: vscode.ExtensionContext, server: IServer, clipboard: Clipboard) {
        this.server = server;
        this.clipboard = clipboard;
        this.htmlBuilder = new DocumentViewProvider(this, server);

        context.subscriptions.push(
            vscode.window.registerCustomEditorProvider(
                resultViewerViewType,
                this.htmlBuilder,
                { supportsMultipleEditorsPerDocument: false }
            )
        );

        // Register the bottom-panel WebviewView provider
        let resolvePanelReady: (() => void) | undefined;
        let panelReadyPromise: Promise<void> | undefined;

        const createPanelReadyPromise = (): Promise<void> => {
            if (!panelReadyPromise) {
                panelReadyPromise = new Promise<void>(resolve => {
                    resolvePanelReady = resolve;
                });
            }
            return panelReadyPromise;
        };

        // Expose a function for showPanelHtml to wait on
        this.waitForPanelReady = async () => {
            await vscode.commands.executeCommand('kusto.resultsView.focus');
            await createPanelReadyPromise();
        };

        vscode.window.registerWebviewViewProvider('kusto.resultsView', {
            resolveWebviewView: (webviewView) => {
                this.resultsPanel = webviewView;
                if (resolvePanelReady) {
                    resolvePanelReady();
                    resolvePanelReady = undefined;
                    panelReadyPromise = undefined;
                }
                webviewView.webview.options = {
                    enableScripts: true,
                    enableForms: false
                };
                webviewView.onDidDispose(() => {
                    this.resultsPanel = undefined;
                });
                webviewView.webview.onDidReceiveMessage((message) => {
                    if (message.command === 'viewChanged' && typeof message.viewId === 'string') {
                        const match = message.viewId.match(/^table-(\d+)$/);
                        if (match) {
                            this.panelActiveTabIndex = parseInt(match[1]!, 10);
                        }
                        vscode.commands.executeCommand('setContext', 'kusto.panelShowingData', message.viewId !== 'query');
                        this.sendExpressionToResultsPanel();
                    }
                    if (message.command === 'requestExpression') {
                        this.sendExpressionToResultsPanel();
                    }
                    if (message.command === 'copyText' && typeof message.text === 'string') {
                        vscode.env.clipboard.writeText(message.text);
                    }
                    this.handleChartWebviewMessage(message);
                });
                webviewView.webview.html = '<html>no results</html>';
            }
        }, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        });

        // Open the results view on start up when in panel mode
        if (getResultsViewDisplayLocation() === 'panel') {
            vscode.commands.executeCommand('kusto.resultsView.focus');
        }
    }

    // ─── Public API ─────────────────────────────────────────────────────

    /**
     * Returns whether the singleton view currently exists.
     */
    hasSingletonView(): boolean {
        return this.singletonView !== undefined;
    }

    /**
     * Sets the backing file URI for the singleton view.
     * Flushes any pending write-back to the previous URI before switching.
     */
    setSingletonViewBackingUri(uri: vscode.Uri | undefined): void {
        // Flush pending writes to the OLD backing file before switching
        this.flushSingletonWriteBack();
        this.singletonBackingUri = uri;
    }

    /**
     * Registers a result webview for copy command targeting.
     * Tracks focus and removes on dispose.
     */
    private registerResultWebview(webview: vscode.WebviewPanel): void {
        this.resultWebviews.add(webview);
        this.activeResultWebview = webview;

        webview.onDidChangeViewState(() => {
            if (webview.active) {
                this.activeResultWebview = webview;
            }
        });

        webview.onDidDispose(() => {
            this.resultWebviews.delete(webview);
            if (this.activeResultWebview === webview) {
                this.activeResultWebview = undefined;
            }
        });
    }

    /**
     * Handles chart webview messages for copy commands.
     * Call this from any webview's onDidReceiveMessage to support chart copy.
     * Returns true if the message was handled.
     */
    private handleChartWebviewMessage(message: { command?: string; pngDataUrl?: string; svgDataUrl?: string; error?: string }): boolean {
        if (message.command === 'copyChartError') {
            vscode.window.showErrorMessage(`Chart copy failed in webview: ${message.error}`);
            return true;
        }
        if (message.command === 'copyChartResult' && message.pngDataUrl) {
            this.onCopyChartMessage(message.pngDataUrl, message.svgDataUrl);
            return true;
        }
        return false;
    }

    /**
     * Displays result data in the bottom view.
     */
    async displayResultsInBottomPanel(
        resultData: server.ResultData | undefined,
        mode: ResultViewMode
    ): Promise<void> {
        if (!resultData?.tables?.length) {
            this.clearResultsPanel();
            return;
        }

        this.lastPanelResultData = resultData;
        this.panelActiveTabIndex = 0;
        // Default to showing data (first tab is always a data tab, not query)
        vscode.commands.executeCommand('setContext', 'kusto.panelShowingData', true);

        const darkMode = isDarkMode();

        const [dataResult, chartResult] = await Promise.all([
            Promise.resolve(resultDataToHtml(resultData)),
            (mode === 'chart' || mode === 'all') && resultData.chartOptions
                ? this.server.getChartAsHtml(resultData, darkMode)
                : Promise.resolve(null)
        ]);

        const hasChart = !!chartResult?.html;
        const hasTable = !!dataResult?.tables?.length;
        this.lastPanelTableNames = (dataResult?.tables ?? []).map((t: HtmlTable) => t.name);

        if (!hasTable && !hasChart) {
            await this.showPanelHtml('<html><body>no results</body></html>');
            return;
        }

        const chartOptions = resultData.chartOptions;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const html = this.htmlBuilder.BuildMultiTabbedHtml(dataResult, chartResult?.html, hasChart, mode, chartOptions, columnNames,
            resultData.query, resultData.cluster, resultData.database, resultData.tables);

        const totalRows = (dataResult?.tables ?? []).reduce((sum: number, t: HtmlTable) => sum + t.rowCount, 0);
        await this.showPanelHtml(injectMessageHandlerScripts(html, hasChart), totalRows);
        this.sendExpressionToResultsPanel();
    }

    /**
     * Displays a query error in the bottom view and closes any singleton view.
     */
    async displayErrorInBottomView(error: server.QueryDiagnostic): Promise<void> {
        this.disposeSingletonView();

        const htmlMessage = `<html><body><table><tr><td>\u274C</td><td><pre>${escapeHtmlStatic(error.message)}</pre></td></tr><tr><td></td><td><pre>${escapeHtmlStatic(error.details || '')}</pre></td></tr></table></body></html>`;

        await this.showPanelHtml(htmlMessage, undefined, true);
    }

    /**
     * Displays the result data in the singleton view.
     * @param beside If true, opens in a beside area; if false, opens in the main editor area.
     */
    async displayResultsInSingletonView(
        resultData: server.ResultData | undefined,
        mode: ResultViewMode,
        beside: boolean
    ): Promise<void> {
        // Always update result data before any early-return dispose paths,
        // so that a write-back in disposeSingletonView won't write stale
        // data from a previous result to the current backing file.
        this.singletonResultData = resultData;
        this.singletonChartOptionsOverride = undefined;

        if (!resultData?.tables?.length) {
            this.disposeSingletonView();
            return;
        }

        if (mode === 'chart' && !resultData.chartOptions) {
            this.disposeSingletonView();
            return;
        }

        const darkMode = isDarkMode();
        const chartOptions = resultData.chartOptions;

        // Fetch table HTML and chart HTML in parallel
        const [dataResult, chartResult] = await Promise.all([
            Promise.resolve(resultDataToHtml(resultData)),
            chartOptions
                ? this.server.getChartAsHtml(resultData, darkMode)
                : Promise.resolve(null)
        ]);

        const hasChart = !!chartResult?.html;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const html = this.htmlBuilder.BuildMultiTabbedHtml(dataResult, chartResult?.html, hasChart, mode, chartOptions, columnNames,
            resultData.query, resultData.cluster, resultData.database, resultData.tables);

        this.showSingletonView(injectMessageHandlerScripts(html, hasChart), resultData, (dataResult?.tables ?? []).map((t: HtmlTable) => t.name), beside, mode);
    }


    // ─── Private methods ────────────────────────────────────────────────

    private onCopyChartMessage(pngDataUrl: string, svgDataUrl?: string): void {
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

            this.clipboard.copy(items).catch(error => {
                vscode.window.showErrorMessage(`Failed to copy chart to clipboard: ${error}`);
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to copy chart: ${error}`);
        }
    }

    /**
     * Copies the active chart in the active results viewer to the clipboard.
     * Targets whichever tab view (singleton or document) is currently focused.
     */
    copyChart(): void {
        this.activeResultWebview?.webview.postMessage({ command: 'copyChart' });
    }

    /**
     * Toggles the chart edit panel in the active tab view.
     */
    toggleChartEditor(): void {
        this.activeResultWebview?.webview.postMessage({ command: 'toggleEditPanel' });
    }

    /**
     * Toggles the search box visibility in the active results view.
     */
    toggleSearch(): void {
        if (this.activeResultWebview?.active) {
            this.activeResultWebview.webview.postMessage({ command: 'toggleSearch' });
        } else if (this.resultsPanel) {
            this.resultsPanel.webview.postMessage({ command: 'toggleSearch' });
        }
    }

    private async showPanelHtml(html: string, rowCount?: number, hasError?: boolean): Promise<void> {
        const isBesideMode = getResultsViewDisplayLocation() === 'beside';

        if (!this.resultsPanel) {
            // In beside mode, don't force the panel open — just update if it exists
            if (isBesideMode) {
                return;
            }
            if (this.waitForPanelReady) {
                await this.waitForPanelReady();
            } else {
                await vscode.commands.executeCommand('kusto.resultsView.focus');
            }
        }

        if (!this.resultsPanel) {
            return;
        }

        try {
            this.resultsPanel.webview.html = html;

            if (rowCount) {
                this.resultsPanel.badge = { tooltip: `${rowCount} rows`, value: rowCount };
            } else if (hasError) {
                this.resultsPanel.badge = { tooltip: 'Error', value: 1 };
            } else {
                this.resultsPanel.badge = undefined;
            }

            // Only auto-show the panel in panel mode
            if (!isBesideMode) {
                this.resultsPanel.show(true);
            }
        } catch {
            if (isBesideMode) {
                return;
            }
            await vscode.commands.executeCommand('kusto.resultsView.focus');
            if (this.resultsPanel) {
                try {
                    this.resultsPanel.webview.html = html;
                    if (rowCount) {
                        this.resultsPanel.badge = { tooltip: `${rowCount} rows`, value: rowCount };
                    }
                    this.resultsPanel.show(true);
                } catch (retryError) {
                    vscode.window.showErrorMessage(`Failed to display results: ${retryError}`);
                }
            }
        }
    }

    private clearResultsPanel(): void {
        if (this.resultsPanel) {
            this.resultsPanel.webview.html = '<html>no results</html>';
            this.resultsPanel.badge = undefined;
        }
        this.lastPanelResultData = undefined;
        this.lastPanelTableNames = [];
    }

    private async sendExpressionToResultsPanel(): Promise<void> {
        if (!this.resultsPanel || !this.server || !this.lastPanelResultData) {
            return;
        }
        try {
            const tableName = this.lastPanelTableNames[this.panelActiveTabIndex];
            const result = await this.server.getDataAsExpression(this.lastPanelResultData, tableName);
            if (result?.expression && this.resultsPanel) {
                this.resultsPanel.webview.postMessage({ command: 'setExpression', expression: result.expression });
            }
        } catch {
            // Ignore
        }
    }

    private showSingletonView(html: string, resultData: server.ResultData, tableNames: string[], beside: boolean, mode: ResultViewMode): void {
        const viewColumn = beside ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
        const title = singletonTitleForMode(mode);
        this.singletonMode = mode;

        if (!this.singletonView) {
            this.singletonView = vscode.window.createWebviewPanel(
                'kusto',
                title,
                { viewColumn, preserveFocus: true },
                { enableScripts: true, retainContextWhenHidden: true }
            );

            vscode.commands.executeCommand('kusto.singletonViewStateChanged');
            this.registerResultWebview(this.singletonView);

            this.singletonView.onDidChangeViewState(() => {
                if (this.singletonView?.active) {
                    const state = this.viewerStates.get(this.singletonView);
                    const hasChart = !!state?.resultData?.chartOptions;
                    vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', hasChart);
                    vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', state?.activeView === 'chart');
                }
            });

            this.singletonView.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'viewChanged' && typeof message.viewId === 'string') {
                    const state = this.viewerStates.get(this.singletonView!);
                    if (state) { state.activeView = message.viewId; }
                    vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', message.viewId === 'chart');
                    if (message.viewId.startsWith('table-')) {
                        this.sendExpressionToResultsView(this.singletonView!);
                    }
                    return;
                }
                if (message.command === 'requestExpression') {
                    this.sendExpressionToResultsView(this.singletonView!);
                    return;
                }
                if (message.command === 'copyText' && typeof message.text === 'string') {
                    vscode.env.clipboard.writeText(message.text);
                    return;
                }
                if (message.command === 'chartOptionsChanged' && message.chartOptions) {
                    this.singletonChartOptionsOverride = message.chartOptions as server.ChartOptions;
                    // Keep singletonResultData in sync so it is always authoritative
                    if (this.singletonResultData) {
                        this.singletonResultData = { ...this.singletonResultData, chartOptions: this.singletonChartOptionsOverride };
                    }
                    const state = this.viewerStates.get(this.singletonView!);
                    if (state) {
                        state.chartOptionsOverride = this.singletonChartOptionsOverride;
                        state.resultData = this.singletonResultData ?? state.resultData;
                    }
                    if (this.singletonChartOptionsTimer) { clearTimeout(this.singletonChartOptionsTimer); }
                    if (!message.clientOnly) {
                        this.singletonChartOptionsTimer = setTimeout(() => this.updateChartInSingletonView(), 600);
                    }
                    // Write back to the backing file
                    this.scheduleSingletonWriteBack();
                    return;
                }
                if (message.command === 'editPanelToggled' && typeof message.visible === 'boolean') {
                    if (message.visible) {
                        this.singletonView?.reveal(vscode.ViewColumn.One, false);
                    } else {
                        this.singletonView?.reveal(getSingletonViewColumn(), false);
                    }
                    return;
                }
                this.handleChartWebviewMessage(message);
            });

            this.singletonView.onDidDispose(() => {
                if (this.singletonChartOptionsTimer) { clearTimeout(this.singletonChartOptionsTimer); }
                this.flushSingletonWriteBack();
                this.viewerStates.delete(this.singletonView!);
                this.singletonView = undefined;
                this.singletonResultData = undefined;
                this.singletonChartOptionsOverride = undefined;
                this.singletonBackingUri = undefined;
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', false);
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', false);
                vscode.commands.executeCommand('kusto.singletonViewStateChanged');
            });
        }

        // Track state for copy commands
        const hasChart = !!resultData.chartOptions;
        this.viewerStates.set(this.singletonView, {
            resultData,
            tableNames,
            activeView: hasChart ? 'chart' : 'table-0'
        });

        vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', hasChart);

        this.singletonView.title = title;
        this.singletonView.webview.html = html;
        this.singletonView.reveal(viewColumn, true);
        this.sendExpressionToResultsView(this.singletonView);
    }

    private async updateChartInSingletonView(): Promise<void> {
        if (!this.singletonView || !this.singletonResultData) { return; }
        const chartOptions = this.singletonChartOptionsOverride ?? this.singletonResultData.chartOptions;
        if (!chartOptions) { return; }

        const state = this.viewerStates.get(this.singletonView);
        if (state && this.singletonChartOptionsOverride) { state.chartOptionsOverride = this.singletonChartOptionsOverride; }

        // Persist the override into the backing data so that if the webview is
        // reconstructed (e.g. on column change), it uses the latest options.
        this.singletonResultData = { ...this.singletonResultData, chartOptions };
        if (state) { state.resultData = this.singletonResultData; }

        const modifiedData = this.singletonResultData;
        const darkMode = isDarkMode();
        const chartResult = await this.server.getChartAsHtml(modifiedData, darkMode);
        if (chartResult?.html) {
            this.singletonView.webview.postMessage({
                command: 'updateChart',
                chartBodyHtml: this.htmlBuilder.extractBody(chartResult.html)
            });
        }
    }

    private scheduleSingletonWriteBack(): void {
        if (!this.singletonBackingUri || !this.singletonResultData) { return; }
        if (this.singletonWriteBackTimer) { clearTimeout(this.singletonWriteBackTimer); }
        this.singletonWriteBackTimer = setTimeout(() => {
            this.singletonWriteBackTimer = undefined;
            if (this.singletonBackingUri && this.singletonResultData) {
                const content = JSON.stringify(this.singletonResultData, null, 2);
                vscode.workspace.fs.writeFile(this.singletonBackingUri, Buffer.from(content, 'utf-8'));
            }
        }, 1000);
    }

    private flushSingletonWriteBack(): void {
        if (this.singletonWriteBackTimer) {
            clearTimeout(this.singletonWriteBackTimer);
            this.singletonWriteBackTimer = undefined;
        }
        if (this.singletonBackingUri && this.singletonResultData) {
            const content = JSON.stringify(this.singletonResultData, null, 2);
            vscode.workspace.fs.writeFile(this.singletonBackingUri, Buffer.from(content, 'utf-8'));
        }
    }

    /**
     * Removes the active chart from the active tab view.
     */
    async removeChart(): Promise<void> {
        if (!this.activeResultWebview?.active) { return; }

        if (this.activeResultWebview === this.singletonView) {
            // Singleton view: remove chart from the in-memory data
            if (!this.singletonResultData) { return; }
            const updated = { ...this.singletonResultData };
            delete updated.chartOptions;
            this.singletonResultData = updated;
            this.singletonChartOptionsOverride = undefined;

            // Write the update to the backing file
            this.scheduleSingletonWriteBack();

            if (this.singletonMode === 'chart') {
                // Was showing chart-only — close the singleton
                this.disposeSingletonView();
            } else {
                // Re-render without the chart
                const dataResult = resultDataToHtml(updated);
                const tableNames = (dataResult?.tables ?? []).map(t => t.name);
                const columnNames = updated.tables[0]?.columns?.map(c => c.name) ?? [];
                const html = this.htmlBuilder.BuildMultiTabbedHtml(dataResult, undefined, false, this.singletonMode ?? 'all', undefined, columnNames,
                    updated.query, updated.cluster, updated.database, updated.tables);
                this.singletonView!.webview.html = injectMessageHandlerScripts(html, false);

                this.viewerStates.set(this.singletonView!, {
                    resultData: updated,
                    tableNames,
                    activeView: 'table-0'
                });
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', false);
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', false);
            }
        } else {
            // Document view: remove chart from the data and update the document
            const state = this.viewerStates.get(this.activeResultWebview);
            if (!state) { return; }
            const updated = { ...state.resultData };
            delete updated.chartOptions;
            state.resultData = updated;
            delete state.chartOptionsOverride;

            // Find the backing document and update it
            for (const doc of vscode.workspace.textDocuments) {
                try {
                    const parsed = JSON.parse(doc.getText()) as server.ResultData;
                    if (parsed && this.viewerStates.get(this.activeResultWebview)?.resultData === updated) {
                        const content = JSON.stringify(updated, null, 2);
                        const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
                        const edit = new vscode.WorkspaceEdit();
                        edit.replace(doc.uri, fullRange, content);
                        await vscode.workspace.applyEdit(edit);
                        await doc.save();
                        break;
                    }
                } catch { /* not a result document */ }
            }
        }
    }

    private disposeSingletonView(): void {
        if (this.singletonView) {
            // Flush any pending write-back before disposing
            this.flushSingletonWriteBack();
            try { this.singletonView.dispose(); } catch { /* ignore */ }
            this.singletonView = undefined;
            this.singletonResultData = undefined;
            this.singletonChartOptionsOverride = undefined;
            this.singletonBackingUri = undefined;
            this.singletonMode = undefined;
            vscode.commands.executeCommand('kusto.singletonViewStateChanged');
        }
    }

    private getActiveViewerState(): ResultViewerState | undefined {
        if (!this.activeResultWebview?.active) {
            return undefined;
        }
        return this.viewerStates.get(this.activeResultWebview);
    }

    private getActiveTableName(state: ResultViewerState): string | undefined {
        const match = state.activeView.match(/^table-(\d+)$/);
        if (match) {
            const idx = parseInt(match[1]!, 10);
            return state.tableNames[idx];
        }
        return state.tableNames[0];
    }

    private async sendExpressionToResultsView(webview: vscode.WebviewPanel): Promise<void> {
        const state = this.viewerStates.get(webview);
        if (!state) { return; }
        try {
            const tableName = this.getActiveTableName(state);
            const result = await this.server.getDataAsExpression(state.resultData, tableName);
            if (result?.expression) {
                webview.webview.postMessage({ command: 'setExpression', expression: result.expression });
            }
        } catch {
            // Ignore — drag will just not work until expression is available
        }
    }

    /**
     * Copies the table cell under the cursor in the active results view.
     */
    copyCell(): void {
        const state = this.getActiveViewerState();
        if (state && this.activeResultWebview) {
            this.activeResultWebview.webview.postMessage({ command: 'copyCell' });
            return;
        }
        // Fall back to bottom view
        if (this.resultsPanel) {
            this.resultsPanel.webview.postMessage({ command: 'copyCell' });
        }
    }

    /**
     * Copies the active table data as HTML + markdown from the active results view.
     */
    async copyData(): Promise<void> {
        const state = this.getActiveViewerState();
        if (state) {
            const tableName = this.getActiveTableName(state);
            const htmlResult = resultDataToHtml(state.resultData, tableName);
            const html = htmlResult?.tables[0]?.html;
            const markdown = resultDataToMarkdown(state.resultData, tableName);

            if (html) {
                this.clipboard.copy([
                    { format: 'HTML Format', data: formatCfHtml(html), encoding: 'utf8' },
                    { format: 'Text', data: markdown || html, encoding: 'text' },
                ]);
            } else if (markdown) {
                vscode.env.clipboard.writeText(markdown);
            }
            return;
        }

        // Fall back to bottom view data
        if (!this.server || !this.lastPanelResultData) {
            return;
        }

        const tableName = this.lastPanelTableNames[this.panelActiveTabIndex];
        const htmlResult = resultDataToHtml(this.lastPanelResultData, tableName);
        const html = htmlResult?.tables[0]?.html;
        const markdown = resultDataToMarkdown(this.lastPanelResultData, tableName);

        if (html) {
            this.clipboard.copy([
                { format: 'HTML Format', data: formatCfHtml(html), encoding: 'utf8' },
                { format: 'Text', data: markdown || html, encoding: 'text' },
            ]);
        } else if (markdown) {
            vscode.env.clipboard.writeText(markdown);
        }
    }

    /**
     * Copies the active table as a KQL datatable expression from the active results view.
     */
    async copyTableAsExpression(): Promise<void> {
        const state = this.getActiveViewerState();
        if (state) {
            try {
                const tableName = this.getActiveTableName(state);
                const result = await this.server.getDataAsExpression(state.resultData, tableName);
                if (result?.expression) {
                    await vscode.env.clipboard.writeText(result.expression);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to copy as expression: ${error}`);
            }
            return;
        }

        if (!this.lastPanelResultData) {
            return;
        }

        try {
            const tableName = this.lastPanelTableNames[this.panelActiveTabIndex];
            const result = await this.server.getDataAsExpression(this.lastPanelResultData, tableName);
            if (result?.expression) {
                await vscode.env.clipboard.writeText(result.expression);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to copy as expression: ${error}`);
        }
    }

    /**
     * Saves the current result data to a .kqr file and opens it in a document view.
     */
    async saveCurrentResults(): Promise<void> {
        const isSingleton = this.activeResultWebview === this.singletonView && this.singletonView?.active;

        const rawData = isSingleton ? this.singletonResultData : this.lastPanelResultData;
        if (!rawData) {
            vscode.window.showWarningMessage('No result data available to save.');
            return;
        }

        const data = this.singletonChartOptionsOverride && isSingleton
            ? { ...rawData, chartOptions: this.singletonChartOptionsOverride }
            : rawData;

        const viewColumn = isSingleton
            ? this.singletonView?.viewColumn ?? vscode.ViewColumn.One
            : vscode.ViewColumn.One;

        const result = await saveResults({ data });
        if (result) {
            // Open saved file as a document view, but keep the singleton alive
            // (history entry remains; singleton will be reused on next query or history click)
            await vscode.commands.executeCommand('vscode.openWith', result.uri, 'kusto.resultViewer', viewColumn);
        }
    }

    /**
     * Opens a chart from the bottom view results in the singleton view.
     */
    async openChartFromBottomView(): Promise<void> {
        if (!this.lastPanelResultData) {
            vscode.window.showWarningMessage('No result data available to chart.');
            return;
        }
        const chartData: server.ResultData = {
            ...this.lastPanelResultData,
            chartOptions: this.lastPanelResultData.chartOptions ?? { type: 'ColumnChart' }
        };
        await this.displayResultsInSingletonView(chartData, 'chart', true);
    }

    /**
     * Moves the results tab to main editor area
     */
    moveResultsTabToMain(): void {
        const webview = this.activeResultWebview;
        if (!webview) { return; }
        const isMain = webview.viewColumn === vscode.ViewColumn.One;
        if (webview === this.singletonView) {
            webview.reveal(isMain ? vscode.ViewColumn.Beside : vscode.ViewColumn.One, false);
        } else {
            // Custom editors must be moved via workbench commands; reveal() creates duplicates.
            vscode.commands.executeCommand(
                isMain ? 'workbench.action.moveEditorToNextGroup' : 'workbench.action.moveEditorToFirstGroup'
            );
        }
    }
}

// =============================================================================
// Module-level helpers
// =============================================================================

function getResultsViewDisplayLocation(): 'panel' | 'beside' {
    return vscode.workspace.getConfiguration('kusto.results').get<string>('display', 'panel') === 'beside'
        ? 'beside'
        : 'panel';
}

function getSingletonViewColumn(): vscode.ViewColumn {
    return vscode.ViewColumn.Beside;
}

function singletonTitleForMode(mode: ResultViewMode): string {
    switch (mode) {
        case 'chart': return 'Chart';
        case 'data': return 'Data';
        case 'detail': return 'Results';
        case 'all': return 'Results';
    }
}

// =============================================================================
// DocumentViewProvider — document view provider for .kqr files
// =============================================================================

/**
 * Document view provider for .kqr files.
 * The file contains ResultData JSON (tables + chart options + query).
 * Can show chart, data tables and query in different tabs.
 */
class DocumentViewProvider implements vscode.CustomTextEditorProvider {

    constructor(private readonly viewer: ResultsViewer, private readonly server: IServer) {
    }

    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true
        };

        // Track this results viewer webview for copy commands
        this.viewer['registerResultWebview'](webviewPanel);

        // Update context key when this panel gains/loses focus
        const updateChartContext = () => {
            if (webviewPanel.active) {
                const state = this.viewer['viewerStates'].get(webviewPanel);
                const hasChart = !!state?.resultData?.chartOptions;
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', hasChart);
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', state?.activeView === 'chart');
            }
        };
        webviewPanel.onDidChangeViewState(() => updateChartContext());

        // Debounce timer for chart options updates
        let chartOptionsTimer: ReturnType<typeof setTimeout> | undefined;
        let ignoringSelfEdit = false;

        // Track whether the editor was in beside mode before the edit panel was opened,
        // so we only move it back when closing the edit panel if it was beside originally.
        let wasInBesideBeforeEditPanel = false;

        // Listen for messages from the webview
        webviewPanel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'viewChanged' && typeof message.viewId === 'string') {
                const state = this.viewer['viewerStates'].get(webviewPanel);
                if (state) {
                    state.activeView = message.viewId;
                }
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', message.viewId === 'chart');
                if (message.viewId.startsWith('table-')) {
                    this.viewer['sendExpressionToResultsView'](webviewPanel);
                }
                return;
            }
            if (message.command === 'requestExpression') {
                this.viewer['sendExpressionToResultsView'](webviewPanel);
                return;
            }
            if (message.command === 'copyText' && typeof message.text === 'string') {
                vscode.env.clipboard.writeText(message.text);
                return;
            }
            if (message.command === 'chartOptionsChanged' && message.chartOptions) {
                const state = this.viewer['viewerStates'].get(webviewPanel);
                if (!state) { return; }
                state.chartOptionsOverride = message.chartOptions as server.ChartOptions;
                // Keep resultData in sync so it is always authoritative
                state.resultData = { ...state.resultData, chartOptions: state.chartOptionsOverride };
                // Update the document buffer immediately so it survives webview reconstruction
                const content = JSON.stringify(state.resultData, null, 2);
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                );
                const edit = new vscode.WorkspaceEdit();
                edit.replace(document.uri, fullRange, content);
                ignoringSelfEdit = true;
                await vscode.workspace.applyEdit(edit);
                ignoringSelfEdit = false;
                // Debounce chart re-render and disk save (skip re-render for client-only changes)
                if (chartOptionsTimer) { clearTimeout(chartOptionsTimer); }
                chartOptionsTimer = setTimeout(async () => {
                    if (!message.clientOnly) {
                        await this.updateChartOnly(state, webviewPanel);
                    }
                    ignoringSelfEdit = true;
                    try { await document.save(); } finally { ignoringSelfEdit = false; }
                }, 600);
                return;
            }
            if (message.command === 'editPanelToggled' && typeof message.visible === 'boolean') {
                if (message.visible) {
                    // Opening edit panel: remember if we were in beside mode, then move to main.
                    wasInBesideBeforeEditPanel = webviewPanel.viewColumn !== vscode.ViewColumn.One;
                    if (wasInBesideBeforeEditPanel) {
                        await vscode.commands.executeCommand('workbench.action.moveEditorToFirstGroup');
                    }
                    webviewPanel.webview.postMessage({ command: 'setEditPanelVisible', visible: true });
                } else {
                    // Closing edit panel: only move back to beside if it was beside before.
                    if (wasInBesideBeforeEditPanel) {
                        await vscode.commands.executeCommand('workbench.action.moveEditorToNextGroup');
                        webviewPanel.webview.postMessage({ command: 'setEditPanelVisible', visible: false });
                    }
                    wasInBesideBeforeEditPanel = false;
                }
                return;
            }
            this.viewer['handleChartWebviewMessage'](message);
        });

        // Render from the document content
        await this.updateWebview(document, webviewPanel);
        this.viewer['sendExpressionToResultsView'](webviewPanel);

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
            this.viewer['viewerStates'].delete(webviewPanel);
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', false);
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', false);
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

        // Fetch table HTML and chart HTML in parallel
        const [dataResult, chartResult] = await Promise.all([
            Promise.resolve(resultDataToHtml(resultData)),
            resultData.chartOptions
                ? this.server.getChartAsHtml(resultData, darkMode)
                : Promise.resolve(null)
        ]);

        const hasChart = !!chartResult?.html;
        const hasTable = !!dataResult?.tables?.length;

        // Update context key for editor title actions
        if (webviewPanel.active) {
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', hasChart);
            const activeView = this.viewer['viewerStates'].get(webviewPanel)?.activeView ?? (hasChart ? 'chart' : 'table-0');
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', activeView === 'chart');
        }

        if (!hasTable && !hasChart) {
            webviewPanel.webview.html = '<html><body><p>Failed to render results.</p></body></html>';
            return;
        }

        // Track viewer state for copy commands
        const tableNames = (dataResult?.tables ?? []).map((t: HtmlTable) => t.name);
        const firstActiveView = hasChart ? 'chart' : 'table-0';
        const existingState = this.viewer['viewerStates'].get(webviewPanel);
        this.viewer['viewerStates'].set(webviewPanel, {
            resultData,
            tableNames,
            activeView: existingState?.activeView ?? firstActiveView,
            ...(existingState?.chartOptionsOverride && { chartOptionsOverride: existingState.chartOptionsOverride })
        });

        const chartOptions = existingState?.chartOptionsOverride ?? resultData.chartOptions;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const html = this.BuildMultiTabbedHtml(dataResult, chartResult?.html, hasChart, 'all', chartOptions, columnNames,
            resultData.query, resultData.cluster, resultData.database, resultData.tables);
        webviewPanel.webview.html = injectMessageHandlerScripts(html, hasChart);
    }

    private async updateChartOnly(state: ResultViewerState, webviewPanel: vscode.WebviewPanel): Promise<void> {
        const chartOptions = state.chartOptionsOverride ?? state.resultData.chartOptions;
        if (!chartOptions) { return; }
        const modifiedData: server.ResultData = {
            ...state.resultData,
            chartOptions
        };
        const darkMode = isDarkMode();
        const chartResult = await this.server.getChartAsHtml(modifiedData, darkMode);
        if (chartResult?.html) {
            webviewPanel.webview.postMessage({
                command: 'updateChart',
                chartBodyHtml: this.extractBody(chartResult.html)
            });
        }
    }

    /*
    * Builds the HTML for a multi-tabbed view showing chart, data tables, and query, with toggle buttons.   
    */
    BuildMultiTabbedHtml(
        dataResult: DataAsHtml | null,
        chartHtml: string | undefined,
        hasChart: boolean,
        mode: ResultViewMode,
        chartOptions?: server.ChartOptions,
        columnNames?: string[],
        queryText?: string,
        cluster?: string,
        database?: string,
        resultTables?: server.ResultTable[]
    ): string {
        const tables = dataResult?.tables ?? [];

        const showChart = hasChart && (mode === 'chart' || mode === 'all');
        const showTables = mode === 'data' || mode === 'detail' || mode === 'all';
        const showQuery = !!queryText && (mode === 'detail' || mode === 'all');

        // Determine whether to show the tab bar
        const visibleTabCount =
            (showChart ? 1 : 0) +
            (showTables ? tables.length : 0) +
            (showQuery ? 1 : 0);
        const showTabs = visibleTabCount > 1;

        // Build individual table divs (empty containers — filled by Simple-DataTables)
        const tableContents = showTables
            ? tables.map((_t, i) =>
                `<div id="table-${i}" class="view-content" data-vscode-context='{"chartVisible": false, "queryVisible": false, "preventDefaultContextMenuItems": true}'><table id="grid-${i}"></table></div>`
            ).join('')
            : '';

        // Embed raw table data as JSON for client-side rendering
        const tableDataJson = showTables && resultTables
            ? JSON.stringify(resultTables.map(t => ({ columns: t.columns, rows: t.rows })))
                .replace(/<\//g, '<\\/')
            : '[]';

        // Extract the chart body content from the full HTML
        const chartContent = chartHtml
            ? this.extractBody(chartHtml)
            : '';

        // Extract chart head content (scripts like Plotly)
        const chartHead = chartHtml && showChart
            ? this.extractHead(chartHtml)
            : '';

        // Determine first active view
        const firstActiveView = showChart ? 'chart' : 'table-0';

        // Build the toggle buttons (only used when showTabs is true)
        let tabButtons = '';
        if (showTabs) {
            const chartButton = showChart
                ? `<button class="active" data-view="chart" onclick="switchView('chart')">Chart</button>`
                : '';

            let tableButtonsHtml = '';
            if (showTables) {
                if (tables.length === 1) {
                    tableButtonsHtml = `<button${showChart ? '' : ' class="active"'} data-view="table-0" onclick="switchView('table-0')">Data</button>`;
                } else {
                    tableButtonsHtml = tables.map((t, i) =>
                        `<button${!showChart && i === 0 ? ' class="active"' : ''} data-view="table-${i}" onclick="switchView('table-${i}')">${this.escapeHtml(t.name)} (${t.rowCount})</button>`
                    ).join('');
                }
            }

            const queryButton = showQuery
                ? `<button data-view="query" onclick="switchView('query')">Query</button>`
                : '';

            tabButtons = chartButton + tableButtonsHtml + queryButton;
        }

        // Build chart options edit panel
        const editPanelHtml = showChart ? this.buildEditPanelHtml(chartOptions, columnNames ?? []) : '';

        // Aspect ratio support
        const aspectRatio = chartOptions?.aspectRatio;
        const chartAspectClass = aspectRatio ? ' has-aspect-ratio' : '';
        const textSize = chartOptions?.textSize ?? '';
        const chartStyleParts: string[] = [];
        if (aspectRatio) { chartStyleParts.push(`--chart-aspect-ratio: ${aspectRatio.replace(':', '/')}`); }
        const chartStyle = chartStyleParts.length ? ` style="${chartStyleParts.join('; ')}"` : '';
        const chartDataAttrs = textSize ? ` data-text-size="${textSize}"` : '';

        // When only a single item is visible, mark it active and use full height
        const mainAreaHeight = showTabs ? 'calc(100vh - 33px)' : '100vh';

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${chartHead}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simple-datatables@9/dist/style.min.css">
    <script src="https://cdn.jsdelivr.net/npm/simple-datatables@9/dist/umd/simple-datatables.min.js"><\/script>
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
            height: ${mainAreaHeight};
        }
        .content-area {
            flex: 1;
            overflow: hidden;
            min-width: 0;
        }
        .view-content { display: none; height: 100%; overflow: hidden; }
        .view-content.active { display: flex; flex-direction: column; }
        #chart.has-aspect-ratio.active {
            position: relative;
        }
        #chart-view { padding: 0; }
        /* Edit panel */
        .edit-panel {
            display: none;
            width: 280px;
            min-width: 280px;
            border-left: 1px solid var(--vscode-panel-border, #444);
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            overflow-y: auto;
            padding: 0;
            box-sizing: border-box;
        }
        .edit-panel.visible { display: block; }
        .edit-panel h3 {
            margin: 0;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-foreground);
            opacity: 0.8;
            border-bottom: 1px solid var(--vscode-panel-border, #444);
        }
        .edit-panel .section-header {
            display: flex;
            align-items: center;
            padding: 6px 12px;
            cursor: pointer;
            user-select: none;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            color: var(--vscode-foreground);
            background: var(--vscode-sideBarSectionHeader-background, transparent);
            border-bottom: 1px solid var(--vscode-panel-border, #444);
        }
        .edit-panel .section-header:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        .edit-panel .section-header .chevron {
            margin-right: 6px;
            font-size: 10px;
            transition: transform 0.15s;
            display: inline-block;
            width: 10px;
        }
        .edit-panel .section-header.collapsed .chevron {
            transform: rotate(-90deg);
        }
        .edit-panel .section-body {
            padding: 8px 12px;
            border-bottom: 1px solid var(--vscode-panel-border, #444);
        }
        .edit-panel .section-body.collapsed {
            display: none;
        }
        .edit-panel .field { margin-bottom: 10px; }
        .edit-panel .field:last-child { margin-bottom: 0; }
        .edit-panel .field-row {
            display: flex;
            gap: 8px;
        }
        .edit-panel .field-row .field {
            flex: 1;
            min-width: 0;
            margin-bottom: 10px;
        }
        .edit-panel label {
            display: block;
            margin-bottom: 3px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground, var(--vscode-foreground));
        }
        .edit-panel select,
        .edit-panel input[type="text"],
        .edit-panel input[type="number"] {
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
        .edit-panel input[type="text"]:focus,
        .edit-panel input[type="number"]:focus {
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
        /* Simple-DataTables overrides for VS Code theme */
        .datatable-wrapper {
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .datatable-top {
            padding: 4px 8px;
            background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
            color: var(--vscode-foreground);
            border-bottom: 1px solid var(--vscode-panel-border, #444);
            flex-shrink: 0;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        .datatable-container {
            flex: 1;
            overflow: auto;
        }
        .datatable-bottom {
            padding: 4px 8px;
            background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
            color: var(--vscode-foreground);
            border-top: 1px solid var(--vscode-panel-border, #444);
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .datatable-bottom::after { display: none; }
        /* Hide search by default; show when toggled */
        .datatable-search { display: none !important; }
        .search-visible .datatable-search { display: block !important; }
        .datatable-info { color: var(--vscode-descriptionForeground, var(--vscode-foreground)); }
        .datatable-input {
            background: var(--vscode-input-background, #3c3c3c);
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            border: 1px solid var(--vscode-input-border, #555);
            border-radius: 2px;
            padding: 2px 6px;
            font-family: inherit;
            font-size: inherit;
        }
        .datatable-selector {
            background: var(--vscode-input-background, #3c3c3c);
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            border: 1px solid var(--vscode-input-border, #555);
            border-radius: 2px;
            padding: 2px 4px;
        }
        .datatable-pagination a, .datatable-pagination button {
            color: var(--vscode-foreground);
            background: transparent;
            border: 1px solid var(--vscode-panel-border, #444);
        }
        .datatable-pagination .datatable-active a,
        .datatable-pagination .datatable-active button {
            background: var(--vscode-focusBorder, #007acc);
            color: #fff;
        }
        table { border-collapse: collapse; width: fit-content !important; max-width: 100%; }
        th, td {
            padding: 4px 8px;
            text-align: left;
            border: 1px solid var(--vscode-editorGroup-border, var(--vscode-panel-border, #666));
            white-space: nowrap;
            max-width: 500px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        th {
            position: sticky;
            top: 0;
            background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
            z-index: 1;
            font-weight: 600;
            cursor: pointer;
        }
        /* Sort indicator styling */
        .datatable-sorter { color: var(--vscode-foreground); }
        .datatable-sorter::before, .datatable-sorter::after {
            border-left-color: transparent;
            border-right-color: transparent;
        }
        /* Row selection */
        tbody tr { cursor: pointer; }
        tbody tr.row-selected {
            background: var(--vscode-list-activeSelectionBackground, #094771) !important;
            color: var(--vscode-list-activeSelectionForeground, #fff);
        }
        .datatable-sorter::before { border-top-color: var(--vscode-foreground); }
        .datatable-sorter::after { border-bottom-color: var(--vscode-foreground); }
        /* Query tab styles */
        .query-info {
            padding: 8px 12px;
            display: flex;
            gap: 16px;
            border-bottom: 1px solid var(--vscode-panel-border, #444);
            background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
        }
        .query-meta {
            font-size: 12px;
            color: var(--vscode-descriptionForeground, var(--vscode-foreground));
        }
        .query-content {
            margin: 0;
            padding: 4px 12px;
            overflow: auto;
            font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
            font-size: var(--vscode-editor-font-size, 13px);
            white-space: pre-wrap;
            color: var(--vscode-descriptionForeground, grey);
        }
    </style>
</head>
<body>
    ${showTabs ? `<div class="view-toggle">
        ${tabButtons}
    </div>` : ''}
    <div class="main-area">
        <div class="content-area">
            ${showChart ? `<div id="chart" class="view-content${chartAspectClass}${firstActiveView === 'chart' ? ' active' : ''}"${chartStyle}${chartDataAttrs} data-vscode-context='{"chartVisible": true, "queryVisible": false, "preventDefaultContextMenuItems": true}'>${chartContent}</div>` : ''}
            ${tableContents}
            ${showQuery ? `<div id="query" class="view-content" data-vscode-context='{"chartVisible": false, "queryVisible": true, "preventDefaultContextMenuItems": true}'>
                <div class="query-info">
                    ${cluster ? `<span class="query-meta"><strong>Cluster:</strong> ${this.escapeHtml(cluster)}</span>` : ''}
                    ${database ? `<span class="query-meta"><strong>Database:</strong> ${this.escapeHtml(database)}</span>` : ''}
                </div>
                <pre class="query-content">${this.escapeHtml(queryText!)}</pre>
            </div>` : ''}
        </div>
        ${editPanelHtml}
    </div>
    <script>
        // ─── Initialize Simple-DataTables grids from embedded data ───
        var _tableData = ${tableDataJson};
        var _grids = [];

        function formatCellValue(value) {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
        }

        function initGrids(tables) {
            for (var i = 0; i < tables.length; i++) {
                var tableEl = document.getElementById('grid-' + i);
                if (!tableEl) continue;
                var td = tables[i];
                var headings = td.columns.map(function(c) { return c.name; });
                var data = td.rows.map(function(row) {
                    return row.map(function(cell) { return formatCellValue(cell); });
                });
                var grid = new simpleDatatables.DataTable(tableEl, {
                    data: { headings: headings, data: data },
                    perPage: 100,
                    perPageSelect: [50, 100, 500, 1000],
                    searchable: true,
                    sortable: true,
                    paging: td.rows.length > 100,
                    labels: {
                        placeholder: 'Search...',
                        noRows: 'No results',
                        info: 'Showing {start} to {end} of {rows} rows'
                    }
                });
                _grids.push(grid);

                // Move the per-page selector from top bar to bottom bar
                var wrapper = tableEl.closest('.datatable-wrapper');
                if (wrapper) {
                    var selector = wrapper.querySelector('.datatable-top .datatable-dropdown');
                    var bottom = wrapper.querySelector('.datatable-bottom');
                    if (selector && bottom) {
                        bottom.insertBefore(selector, bottom.firstChild);
                    }
                }
            }
            makeTablesDraggable();
        }

        // Initialize grids synchronously from embedded data
        initGrids(_tableData);

        var _searchVisible = false;
        function toggleSearch() {
            _searchVisible = !_searchVisible;
            document.querySelectorAll('.datatable-wrapper').forEach(function(wrapper) {
                wrapper.classList.toggle('search-visible', _searchVisible);
            });
            if (_searchVisible) {
                var active = document.querySelector('.view-content.active .datatable-input');
                if (active) active.focus();
            }
        }

        // Set initial active table view
        (function() {
            var first = document.getElementById('${firstActiveView}');
            if (first) first.classList.add('active');
        })();

        // Track whether the user wants the edit panel open
        var editPanelUserVisible = false;

        // Drag & drop: cache the KQL datatable expression for the active table
        var cachedExpression = '';

        // Row selection on click
        document.addEventListener('click', function(e) {
            var tr = e.target.closest ? e.target.closest('tbody tr') : null;
            if (!tr) return;
            var prev = document.querySelector('tr.row-selected');
            if (prev && prev !== tr) prev.classList.remove('row-selected');
            tr.classList.toggle('row-selected');
        });

        function makeTablesDraggable() {
            var activeContent = document.querySelector('.view-content.active');
            if (activeContent) {
                activeContent.querySelectorAll('table').forEach(function(tbl) {
                    tbl.setAttribute('draggable', 'true');
                });
            }
        }
        makeTablesDraggable();

        document.addEventListener('dragstart', function(e) {
            var tbl = e.target.closest ? e.target.closest('table') : null;
            if (!tbl) { return; }
            if (cachedExpression) {
                e.dataTransfer.setData('text/plain', cachedExpression);
                e.dataTransfer.effectAllowed = 'copy';
            } else {
                if (window._vscodeApi) {
                    window._vscodeApi.postMessage({ command: 'requestExpression' });
                }
                e.preventDefault();
            }
        });

        // Compute font sizes based on chart dimensions and text size preset
        function computeFontSizes(chartW, chartH, preset) {
            var scale = preset === 'Small' ? 0.75 : preset === 'Large' ? 1.5 : preset === 'Extra Large' ? 2.0 : 1.0;
            var base = Math.min(chartW, chartH);
            var titleSize = Math.round(Math.max(10, Math.min(36, base * 0.04)) * scale);
            var axisSize = Math.round(Math.max(8, Math.min(24, base * 0.028)) * scale);
            var tickSize = Math.round(Math.max(7, Math.min(16, base * 0.018)) * scale);
            return { titleSize: titleSize, axisSize: axisSize, tickSize: tickSize };
        }

        // Apply font size overrides to a layout object
        function applyFontOverrides(layout, w, h, preset) {
            var fonts = computeFontSizes(w, h, preset);
            var overrides = {};
            var titleObj = layout.title;
            if (titleObj && typeof titleObj === 'object') {
                overrides.title = Object.assign({}, titleObj, { font: Object.assign({}, titleObj.font || {}, { size: fonts.titleSize }) });
            } else if (typeof titleObj === 'string') {
                overrides.title = { text: titleObj, font: { size: fonts.titleSize } };
            }
            var xaxis = layout.xaxis;
            if (xaxis) {
                overrides.xaxis = Object.assign({}, xaxis, {
                    automargin: true,
                    title: Object.assign({}, xaxis.title || {}, { font: Object.assign({}, (xaxis.title && xaxis.title.font) || {}, { size: fonts.axisSize }), standoff: fonts.tickSize }),
                    tickfont: Object.assign({}, xaxis.tickfont || {}, { size: fonts.tickSize })
                });
            }
            var yaxis = layout.yaxis;
            if (yaxis) {
                overrides.yaxis = Object.assign({}, yaxis, {
                    automargin: true,
                    title: Object.assign({}, yaxis.title || {}, { font: Object.assign({}, (yaxis.title && yaxis.title.font) || {}, { size: fonts.axisSize }), standoff: fonts.tickSize }),
                    tickfont: Object.assign({}, yaxis.tickfont || {}, { size: fonts.tickSize })
                });
            }
            var legend = layout.legend || {};
            overrides.legend = Object.assign({}, legend, {
                font: Object.assign({}, legend.font || {}, { size: fonts.tickSize })
            });
            return overrides;
        }

        // Resize chart to fit aspect ratio within available space
        function resizeChartToAspectRatio() {
            var chartDiv = document.getElementById('chart');
            if (!chartDiv) return;
            var plotDiv = chartDiv.querySelector('.js-plotly-plot') || chartDiv.querySelector('.plotly-graph-div');
            if (!plotDiv || typeof Plotly === 'undefined') return;
            // Find the wrapper div (e.g. #plotly-chart) — immediate child of #chart
            var wrapperDiv = chartDiv.firstElementChild;
            if (!wrapperDiv) return;
            var arValue = getComputedStyle(chartDiv).getPropertyValue('--chart-aspect-ratio').trim();
            var availW = chartDiv.clientWidth;
            var availH = chartDiv.clientHeight;
            var preset = chartDiv.getAttribute('data-text-size') || '';

            function buildLayoutOverrides(w, h) {
                var overrides = { width: w, height: h };
                if (plotDiv.layout) {
                    Object.assign(overrides, applyFontOverrides(plotDiv.layout, w, h, preset));
                }
                return overrides;
            }

            if (!arValue) {
                // No aspect ratio — fill the available space
                wrapperDiv.style.position = '';
                wrapperDiv.style.left = '';
                wrapperDiv.style.top = '';
                wrapperDiv.style.width = availW + 'px';
                wrapperDiv.style.height = availH + 'px';
                lastAppliedW = chartDiv.clientWidth;
                lastAppliedH = chartDiv.clientHeight;
                Plotly.newPlot(plotDiv, plotDiv.data, Object.assign({}, plotDiv.layout, buildLayoutOverrides(availW, availH)), plotDiv._context);
                return;
            }
            var parts = arValue.split('/').map(Number);
            if (parts.length !== 2 || parts[0] <= 0 || parts[1] <= 0) {
                Plotly.Plots.resize(plotDiv);
                return;
            }
            var ratio = parts[0] / parts[1];
            var w, h;
            if (availW / availH > ratio) {
                h = availH;
                w = Math.round(h * ratio);
            } else {
                w = availW;
                h = Math.round(w / ratio);
            }
            // Center the wrapper using absolute positioning
            wrapperDiv.style.position = 'absolute';
            wrapperDiv.style.left = Math.round((availW - w) / 2) + 'px';
            wrapperDiv.style.top = Math.round((availH - h) / 2) + 'px';
            wrapperDiv.style.width = w + 'px';
            wrapperDiv.style.height = h + 'px';
            wrapperDiv.style.margin = '';
            lastAppliedW = chartDiv.clientWidth;
            lastAppliedH = chartDiv.clientHeight;
            Plotly.newPlot(plotDiv, plotDiv.data, Object.assign({}, plotDiv.layout, buildLayoutOverrides(w, h)), plotDiv._context);
        }

        // Track last applied dimensions to avoid redundant redraws
        var lastAppliedW = 0;
        var lastAppliedH = 0;
        var resizeTimer = null;

        // Observe chart container resizes to enforce aspect ratio
        var chartContainer = document.getElementById('chart');
        if (chartContainer) {
            new ResizeObserver(function() {
                var w = chartContainer.clientWidth;
                var h = chartContainer.clientHeight;
                if (w === lastAppliedW && h === lastAppliedH) return;
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() { resizeChartToAspectRatio(); }, 30);
            }).observe(chartContainer);
        }

        function switchView(viewId) {
            cachedExpression = '';
            document.querySelectorAll('.view-content').forEach(function(el) { el.classList.remove('active'); });
            document.querySelectorAll('.view-toggle button[data-view]').forEach(function(el) { el.classList.remove('active'); });
            var target = document.getElementById(viewId);
            if (target) target.classList.add('active');
            var btn = document.querySelector('.view-toggle button[data-view="' + viewId + '"]');
            if (btn) btn.classList.add('active');
            if (viewId.startsWith('table-')) {
                makeTablesDraggable();
            }
            // Hide/restore edit panel based on view and user preference
            var editPanel = document.getElementById('edit-panel');
            if (editPanel) {
                if (viewId.startsWith('table-') || viewId === 'query') {
                    editPanel.classList.remove('visible');
                } else if (editPanelUserVisible) {
                    editPanel.classList.add('visible');
                }
            }
            // Trigger Plotly resize when switching to chart
            if (viewId === 'chart') {
                setTimeout(function() {
                    resizeChartToAspectRatio();
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
            picker.selectedIndex = 0;
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

        function toggleSection(headerEl) {
            headerEl.classList.toggle('collapsed');
            var body = headerEl.nextElementSibling;
            if (body) body.classList.toggle('collapsed');
        }

        function toggleEditPanel() {
            var panel = document.getElementById('edit-panel');
            if (!panel) return;
            editPanelUserVisible = !editPanelUserVisible;
            panel.classList.toggle('visible', editPanelUserVisible);

            // Notify extension host so it can move the panel if needed
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'editPanelToggled', visible: editPanelUserVisible });
            }

            // Resize chart when panel toggles
            setTimeout(function() {
                resizeChartToAspectRatio();
            }, 50);
        }

        // Collect current chart options from the edit panel form
        function collectChartOptions() {
            var opts = {};
            var chartType = document.getElementById('opt-type');
            if (chartType) opts.type = chartType.value;
            var kind = document.getElementById('opt-kind');
            if (kind && kind.value) opts.kind = kind.value;
            var legendPos = document.getElementById('opt-legendPosition');
            if (legendPos && legendPos.value) {
                if (legendPos.value === 'Hidden') { opts.legend = 'Hidden'; }
                else { opts.legend = 'Visible'; opts.legendPosition = legendPos.value; }
            }
            var sort = document.getElementById('opt-sort');
            if (sort && sort.value) opts.sort = sort.value;
            var mode = document.getElementById('opt-mode');
            if (mode && mode.value) opts.mode = mode.value;
            var aspectRatio = document.getElementById('opt-aspectRatio');
            if (aspectRatio && aspectRatio.value) opts.aspectRatio = aspectRatio.value;
            var textSize = document.getElementById('opt-textSize');
            if (textSize && textSize.value) opts.textSize = textSize.value;
            var showValues = document.getElementById('opt-showValues');
            if (showValues) opts.showValues = showValues.checked ? 'Visible' : 'Hidden';
            var title = document.getElementById('opt-title');
            if (title && title.value) opts.title = title.value;
            var xTitle = document.getElementById('opt-xTitle');
            if (xTitle && xTitle.value) opts.xTitle = xTitle.value;
            var yTitle = document.getElementById('opt-yTitle');
            if (yTitle && yTitle.value) opts.yTitle = yTitle.value;
            var zTitle = document.getElementById('opt-zTitle');
            if (zTitle && zTitle.value) opts.zTitle = zTitle.value;
            var xColumn = document.getElementById('opt-xColumn');
            if (xColumn && xColumn.value) opts.xColumn = xColumn.value;
            var yColList = document.getElementById('opt-yColumns-list');
            if (yColList) { var items = Array.from(yColList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (items.length) opts.yColumns = items; }
            var seriesList = document.getElementById('opt-series-list');
            if (seriesList) { var si = Array.from(seriesList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (si.length) opts.series = si; }
            var accumulate = document.getElementById('opt-accumulate');
            if (accumulate) opts.accumulate = accumulate.checked;
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
            var xShowTicks = document.getElementById('opt-xShowTicks');
            if (xShowTicks) opts.xShowTicks = xShowTicks.checked ? 'Visible' : 'Hidden';
            var yShowTicks = document.getElementById('opt-yShowTicks');
            if (yShowTicks) opts.yShowTicks = yShowTicks.checked ? 'Visible' : 'Hidden';
            var xShowGrid = document.getElementById('opt-xShowGrid');
            if (xShowGrid) opts.xShowGrid = xShowGrid.checked ? 'Visible' : 'Hidden';
            var yShowGrid = document.getElementById('opt-yShowGrid');
            if (yShowGrid) opts.yShowGrid = yShowGrid.checked ? 'Visible' : 'Hidden';
            var xTickAngle = document.getElementById('opt-xTickAngle');
            if (xTickAngle && xTickAngle.value !== '') opts.xTickAngle = Number(xTickAngle.value);
            var yTickAngle = document.getElementById('opt-yTickAngle');
            if (yTickAngle && yTickAngle.value !== '') opts.yTickAngle = Number(yTickAngle.value);
            return opts;
        }

        // Notify extension when any chart option changes
        function onChartOptionChanged() {
            applyClientSideOptions();
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'chartOptionsChanged', chartOptions: collectChartOptions() });
            }
        }

        // Handle client-only option changes (text size, aspect ratio) without server round-trip
        function onClientOnlyOptionChanged() {
            applyClientSideOptions();
            // Still persist the option value but skip chart re-render from server
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'chartOptionsChanged', chartOptions: collectChartOptions(), clientOnly: true });
            }
        }

        function applyClientSideOptions() {
            var chartDiv = document.getElementById('chart');
            var arSelect = document.getElementById('opt-aspectRatio');
            var tsSelect = document.getElementById('opt-textSize');
            if (chartDiv) {
                var arValue = arSelect ? arSelect.value : '';
                if (arValue) {
                    chartDiv.classList.add('has-aspect-ratio');
                    chartDiv.style.setProperty('--chart-aspect-ratio', arValue.replace(':', '/'));
                } else {
                    chartDiv.classList.remove('has-aspect-ratio');
                    chartDiv.style.removeProperty('--chart-aspect-ratio');
                }
                // Store text size preset
                chartDiv.setAttribute('data-text-size', tsSelect ? tsSelect.value : '');
                // Trigger aspect-ratio-aware resize
                lastAppliedW = 0; lastAppliedH = 0; // force redraw
                setTimeout(function() {
                    resizeChartToAspectRatio();
                }, 50);
            }
        }

        // Listen for messages from the extension
        window.addEventListener('message', function(event) {
            var msg = event.data;
            if (msg && msg.command === 'toggleSearch') {
                toggleSearch();
                return;
            }
            if (msg && msg.command === 'toggleEditPanel') {
                toggleEditPanel();
                return;
            }
            if (msg && msg.command === 'setEditPanelVisible') {
                var panel = document.getElementById('edit-panel');
                if (panel) {
                    editPanelUserVisible = msg.visible;
                    panel.classList.toggle('visible', msg.visible);
                }
                return;
            }
            if (msg && msg.command === 'setExpression' && typeof msg.expression === 'string') {
                cachedExpression = msg.expression;
                return;
            }
            if (msg && msg.command === 'updateChart' && msg.chartBodyHtml) {
                var chartDiv = document.getElementById('chart');
                if (chartDiv) {
                    // Compute target dimensions for the new chart
                    var arValue = getComputedStyle(chartDiv).getPropertyValue('--chart-aspect-ratio').trim();
                    var availW = chartDiv.clientWidth;
                    var availH = chartDiv.clientHeight;
                    var preset = chartDiv.getAttribute('data-text-size') || '';
                    var targetW = availW, targetH = availH;
                    var centerLeft = null, centerTop = null;
                    if (arValue) {
                        var parts = arValue.split('/').map(Number);
                        if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
                            var ratio = parts[0] / parts[1];
                            if (availW / availH > ratio) {
                                targetH = availH;
                                targetW = Math.round(targetH * ratio);
                            } else {
                                targetW = availW;
                                targetH = Math.round(targetW / ratio);
                            }
                            centerLeft = Math.round((availW - targetW) / 2);
                            centerTop = Math.round((availH - targetH) / 2);
                        }
                    }

                    // Monkey-patch Plotly.newPlot to inject font/size overrides into the first call
                    var origNewPlot = Plotly.newPlot;
                    Plotly.newPlot = function(div, data, layout, config) {
                        Plotly.newPlot = origNewPlot; // restore immediately
                        var merged = Object.assign({}, layout, { width: targetW, height: targetH }, applyFontOverrides(layout || {}, targetW, targetH, preset));
                        return origNewPlot.call(Plotly, div, data, merged, config);
                    };

                    chartDiv.innerHTML = msg.chartBodyHtml;

                    // Position the wrapper div for aspect ratio centering
                    var wrapperDiv = chartDiv.firstElementChild;
                    if (wrapperDiv) {
                        if (centerLeft !== null) {
                            wrapperDiv.style.position = 'absolute';
                            wrapperDiv.style.left = centerLeft + 'px';
                            wrapperDiv.style.top = centerTop + 'px';
                            wrapperDiv.style.width = targetW + 'px';
                            wrapperDiv.style.height = targetH + 'px';
                            wrapperDiv.style.margin = '';
                        } else {
                            wrapperDiv.style.position = '';
                            wrapperDiv.style.left = '';
                            wrapperDiv.style.top = '';
                            wrapperDiv.style.width = availW + 'px';
                            wrapperDiv.style.height = availH + 'px';
                        }
                    }
                    lastAppliedW = availW;
                    lastAppliedH = availH;

                    // Re-execute any script tags in the new content (Plotly.newPlot is patched)
                    chartDiv.querySelectorAll('script').forEach(function(oldScript) {
                        var newScript = document.createElement('script');
                        if (oldScript.src) {
                            newScript.src = oldScript.src;
                        } else {
                            newScript.textContent = oldScript.textContent;
                        }
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });

                    // Restore in case the script didn't call Plotly.newPlot
                    Plotly.newPlot = origNewPlot;
                }
            }
        });
    </script>
</body>
</html>`;
    }

    buildEditPanelHtml(chartOptions: server.ChartOptions | undefined, columnNames: string[]): string {
        const opts = chartOptions ?? { type: 'ColumnChart' };

        // Ensure the current type is always present in the dropdown
        const allTypes = chartTypes.includes(opts.type) ? chartTypes : [opts.type, ...chartTypes];
        const typeOptions = allTypes.map(t =>
            `<option value="${t}"${t === opts.type ? ' selected' : ''}>${this.escapeHtml(t)}</option>`
        ).join('');

        // Ensure the current kind is always present in the dropdown
        const currentKind = opts.kind ?? '';
        const allKinds = !currentKind || chartKinds.includes(currentKind) ? chartKinds : [currentKind, ...chartKinds];
        const kindOptions = ['', ...allKinds].map(k =>
            `<option value="${k}"${k === currentKind ? ' selected' : ''}>${k || '(default)'}</option>`
        ).join('');

        // Combined legend: map legacy legend + legendPosition into one value
        const currentLegend = (opts.legend === 'Hidden') ? 'Hidden' : (opts.legendPosition ?? '');
        const legendPosOptions = ['', ...legendPositions].map(p =>
            `<option value="${p}"${p === currentLegend ? ' selected' : ''}>${p || '(default)'}</option>`
        ).join('');

        // Sort order
        const currentSort = opts.sort ?? '';
        const sortOptions = ['', ...sortOrders].map(s =>
            `<option value="${s}"${s === currentSort ? ' selected' : ''}>${s || '(default)'}</option>`
        ).join('');

        // Color mode
        const currentMode = opts.mode ?? '';
        const modeOptions = ['', ...chartModes].map(m =>
            `<option value="${m}"${m === currentMode ? ' selected' : ''}>${m || '(auto)'}</option>`
        ).join('');

        // Aspect ratio
        const currentAspectRatio = opts.aspectRatio ?? '';
        const aspectRatioOptions = ['', ...aspectRatios].map(r =>
            `<option value="${r}"${r === currentAspectRatio ? ' selected' : ''}>${r || '(fill)'}</option>`
        ).join('');

        // Text size
        const currentTextSize = opts.textSize ?? '';
        const textSizeOptions = ['', ...textSizes].map(s =>
            `<option value="${s}"${s === currentTextSize ? ' selected' : ''}>${s || '(medium)'}</option>`
        ).join('');

        // Show values
        const showValuesChecked = opts.showValues === 'Visible' ? ' checked' : '';

        // Column pickers
        const xColOptions = ['', ...columnNames].map(c =>
            `<option value="${this.escapeHtml(c)}"${c === (opts.xColumn ?? '') ? ' selected' : ''}>${c || '(auto)'}</option>`
        ).join('');

        const allColOptions = `<option value="" disabled selected>Pick a column</option>` + columnNames.map(c =>
            `<option value="${this.escapeHtml(c)}">${this.escapeHtml(c)}</option>`
        ).join('');

        const yColumnsItems = (opts.yColumns ?? []).map(c =>
            `<li><span>${this.escapeHtml(c)}</span><button onclick="moveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="moveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="removeColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        const seriesItems = (opts.series ?? []).map(c =>
            `<li><span>${this.escapeHtml(c)}</span><button onclick="moveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="moveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="removeColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        // Axis types
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

        // Per-axis display options
        const xShowTicksChecked = opts.xShowTicks === 'Visible' ? ' checked' : '';
        const yShowTicksChecked = opts.yShowTicks === 'Visible' ? ' checked' : '';
        const xShowGridChecked = opts.xShowGrid === 'Hidden' ? '' : ' checked';
        const yShowGridChecked = opts.yShowGrid === 'Hidden' ? '' : ' checked';
        const xTickAngleValue = opts.xTickAngle != null ? String(opts.xTickAngle) : '';
        const yTickAngleValue = opts.yTickAngle != null ? String(opts.yTickAngle) : '';

        return `<div id="edit-panel" class="edit-panel">
            <h3>Chart Options</h3>

            <div class="section-header" onclick="toggleSection(this)">
                <span class="chevron">&#9662;</span>General
            </div>
            <div class="section-body">
                <div class="field">
                    <label for="opt-type">Type</label>
                    <select id="opt-type" onchange="onChartOptionChanged()">${typeOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-kind">Kind</label>
                    <select id="opt-kind" onchange="onChartOptionChanged()">${kindOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-legendPosition">Legend</label>
                    <select id="opt-legendPosition" onchange="onChartOptionChanged()">${legendPosOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-sort">Sort</label>
                    <select id="opt-sort" onchange="onChartOptionChanged()">${sortOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-mode">Mode</label>
                    <select id="opt-mode" onchange="onChartOptionChanged()">${modeOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-aspectRatio">Aspect Ratio</label>
                    <select id="opt-aspectRatio" onchange="onClientOnlyOptionChanged()">${aspectRatioOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-textSize">Text Size</label>
                    <select id="opt-textSize" onchange="onClientOnlyOptionChanged()">${textSizeOptions}</select>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-showValues"${showValuesChecked} onchange="onChartOptionChanged()">
                    <label for="opt-showValues">Show Values</label>
                </div>
            </div>

            <div class="section-header collapsed" onclick="toggleSection(this)">
                <span class="chevron">&#9662;</span>Data
            </div>
            <div class="section-body collapsed">
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
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-accumulate"${opts.accumulate ? ' checked' : ''} onchange="onChartOptionChanged()">
                    <label for="opt-accumulate">Accumulate</label>
                </div>
            </div>

            <div class="section-header collapsed" onclick="toggleSection(this)">
                <span class="chevron">&#9662;</span>Titles
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-title">Title</label>
                    <input type="text" id="opt-title" value="${this.escapeHtml(opts.title ?? '')}" oninput="onChartOptionChanged()">
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
                    <label for="opt-zTitle">Z-Axis Title</label>
                    <input type="text" id="opt-zTitle" value="${this.escapeHtml(opts.zTitle ?? '')}" oninput="onChartOptionChanged()">
                </div>
            </div>

            <div class="section-header collapsed" onclick="toggleSection(this)">
                <span class="chevron">&#9662;</span>X Axis
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-xAxis">Type</label>
                    <select id="opt-xAxis" onchange="onChartOptionChanged()">${xAxisOptions}</select>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label for="opt-xmin">Min</label>
                        <input type="text" id="opt-xmin" value="${this.escapeHtml(String(opts.xmin ?? ''))}" oninput="onChartOptionChanged()">
                    </div>
                    <div class="field">
                        <label for="opt-xmax">Max</label>
                        <input type="text" id="opt-xmax" value="${this.escapeHtml(String(opts.xmax ?? ''))}" oninput="onChartOptionChanged()">
                    </div>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-xShowTicks"${xShowTicksChecked} onchange="onChartOptionChanged()">
                    <label for="opt-xShowTicks">Show Tick Marks</label>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-xShowGrid"${xShowGridChecked} onchange="onChartOptionChanged()">
                    <label for="opt-xShowGrid">Show Grid Lines</label>
                </div>
                <div class="field">
                    <label for="opt-xTickAngle">Tick Label Angle</label>
                    <input type="number" id="opt-xTickAngle" value="${this.escapeHtml(xTickAngleValue)}" placeholder="auto" oninput="onChartOptionChanged()">
                </div>
            </div>

            <div class="section-header collapsed" onclick="toggleSection(this)">
                <span class="chevron">&#9662;</span>Y Axis
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-yAxis">Type</label>
                    <select id="opt-yAxis" onchange="onChartOptionChanged()">${yAxisOptions}</select>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label for="opt-ymin">Min</label>
                        <input type="text" id="opt-ymin" value="${this.escapeHtml(String(opts.ymin ?? ''))}" oninput="onChartOptionChanged()">
                    </div>
                    <div class="field">
                        <label for="opt-ymax">Max</label>
                        <input type="text" id="opt-ymax" value="${this.escapeHtml(String(opts.ymax ?? ''))}" oninput="onChartOptionChanged()">
                    </div>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-yShowTicks"${yShowTicksChecked} onchange="onChartOptionChanged()">
                    <label for="opt-yShowTicks">Show Tick Marks</label>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-yShowGrid"${yShowGridChecked} onchange="onChartOptionChanged()">
                    <label for="opt-yShowGrid">Show Grid Lines</label>
                </div>
                <div class="field">
                    <label for="opt-yTickAngle">Tick Label Angle</label>
                    <input type="number" id="opt-yTickAngle" value="${this.escapeHtml(yTickAngleValue)}" placeholder="auto" oninput="onChartOptionChanged()">
                </div>
            </div>
        </div>`;
    }

    buildTabbedTableHtml(tables: HtmlTable[]): string {
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

    extractBody(html: string): string {
        const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        return match?.[1] ?? html;
    }

    extractHead(html: string): string {
        const match = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        return match?.[1] ?? '';
    }

    escapeHtml(text: string): string {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
