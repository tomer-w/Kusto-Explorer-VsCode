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
import type { IChartProvider, IChartView } from './chartProvider';
import type { IChartEditorProvider, IChartEditorView } from './chartEditorProvider';
import type { IWebView } from './webview';

/** The view type used for the custom results viewer. */
const resultViewerViewType = 'kusto.resultViewer';

/**
 * Controls which content sections are shown in a result view.
 * - 'chart': Only the chart, no tabs.
 * - 'data': Only data tables. Tabs shown only if multiple tables.
 * - 'all': Chart, data tables, and query tabs — all visible.
 */
export type ResultViewMode = 'chart' | 'data' | 'detail' | 'all';

/**
 * Adapts a VS Code `Webview` to the `IWebView` interface for a named region.
 * Stores page-level setup content (headHtml, scriptsHtml) for the page builder to read.
 * `setContent()` posts the given `contentCommand` message to the page handler.
 */
class WebViewAdapter implements IWebView {
    private readonly webview: vscode.Webview;
    private readonly contentCommand: string;
    headHtml = '';
    scriptsHtml = '';

    constructor(webview: vscode.Webview, contentCommand = 'setChartHtml') {
        this.webview = webview;
        this.contentCommand = contentCommand;
    }

    setup(headHtml: string, scriptsHtml: string): void {
        this.headHtml = headHtml;
        this.scriptsHtml = scriptsHtml;
    }

    setContent(html: string): void {
        this.webview.postMessage({ command: this.contentCommand, html });
    }

    invoke(command: string, args?: Record<string, unknown>): void {
        this.webview.postMessage({ command, ...args });
    }

    handle(handler: (message: Record<string, unknown>) => void): vscode.Disposable {
        return this.webview.onDidReceiveMessage(handler);
    }
}

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

/**
 * Reads chart default settings from VS Code configuration and returns
 * a partial ChartOptions with only the configured defaults.
 */
function getChartDefaults(): Partial<server.ChartOptions> {
    const config = vscode.workspace.getConfiguration('kusto.chart');
    const defaults: Partial<server.ChartOptions> = {};
    const showLegend = config.get<string>('showLegend');
    if (showLegend === 'yes') { defaults.showLegend = true; }
    else if (showLegend === 'no') { defaults.showLegend = false; }
    const legendPosition = config.get<string>('legendPosition');
    if (legendPosition) { defaults.legendPosition = legendPosition; }
    const xShowTicks = config.get<string>('xShowTicks');
    if (xShowTicks === 'yes') { defaults.xShowTicks = true; }
    else if (xShowTicks === 'no') { defaults.xShowTicks = false; }
    const yShowTicks = config.get<string>('yShowTicks');
    if (yShowTicks === 'yes') { defaults.yShowTicks = true; }
    else if (yShowTicks === 'no') { defaults.yShowTicks = false; }
    const xShowGrid = config.get<string>('xShowGrid');
    if (xShowGrid === 'yes') { defaults.xShowGrid = true; }
    else if (xShowGrid === 'no') { defaults.xShowGrid = false; }
    const yShowGrid = config.get<string>('yShowGrid');
    if (yShowGrid === 'yes') { defaults.yShowGrid = true; }
    else if (yShowGrid === 'no') { defaults.yShowGrid = false; }
    const showValues = config.get<string>('showValues');
    if (showValues === 'yes') { defaults.showValues = true; }
    else if (showValues === 'no') { defaults.showValues = false; }
    const textSize = config.get<string>('textSize');
    if (textSize) { defaults.textSize = textSize; }
    const aspectRatio = config.get<string>('aspectRatio');
    if (aspectRatio) { defaults.aspectRatio = aspectRatio; }
    return defaults;
}

/**
 * Returns a new ChartOptions with unset properties filled in from configuration defaults.
 */
function applyChartDefaults(options: server.ChartOptions): server.ChartOptions {
    const defaults = getChartDefaults();
    return { ...defaults, ...options };
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



/**
 * Injects the base webview message handler script into result HTML content.
 * Also adds data-vscode-context to suppress default context menu items.
 */
function injectMessageHandlerScripts(html: string): string {
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
        return result.replace('</html>', webviewMessageHandlerScript + '</html>');
    }
    if (result.includes('</body>')) {
        return result.replace('</body>', webviewMessageHandlerScript + '</body>');
    }
    return result + webviewMessageHandlerScript;
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
    private readonly chartProvider: IChartProvider;
    private readonly chartEditorProvider: IChartEditorProvider;
    private readonly htmlBuilder: DocumentViewProvider;

    /** Map from webview to its viewer state. */
    private readonly viewerStates = new Map<vscode.WebviewPanel, ResultViewerState>();

    /** Map from document-view webview to its backing document URI. */
    private readonly webviewDocuments = new Map<vscode.WebviewPanel, vscode.Uri>();

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
    private panelChartView: IChartView | undefined;
    private panelWebView: WebViewAdapter | undefined;
    private panelEditorView: IChartEditorView | undefined;
    private panelEditorWebView: WebViewAdapter | undefined;

    // ─── Singleton view state ───────────────────────────────────────────
    private singletonView: vscode.WebviewPanel | undefined;
    private singletonResultData: server.ResultData | undefined;
    private singletonChartOptionsOverride: server.ChartOptions | undefined;
    private singletonChartOptionsTimer: ReturnType<typeof setTimeout> | undefined;
    private singletonBackingUri: vscode.Uri | undefined;
    private singletonWriteBackTimer: ReturnType<typeof setTimeout> | undefined;
    private singletonMode: ResultViewMode | undefined;
    private singletonChartView: IChartView | undefined;
    private singletonWebView: WebViewAdapter | undefined;
    private singletonEditorView: IChartEditorView | undefined;
    private singletonEditorWebView: WebViewAdapter | undefined;

    // ─── Chart views for document views ───────────────────────────────
    private readonly chartViews = new Map<vscode.WebviewPanel, IChartView>();
    private readonly chartWebViews = new Map<vscode.WebviewPanel, WebViewAdapter>();
    private readonly editorViews = new Map<vscode.WebviewPanel, IChartEditorView>();
    private readonly editorWebViews = new Map<vscode.WebviewPanel, WebViewAdapter>();

    constructor(context: vscode.ExtensionContext, server: IServer, clipboard: Clipboard, chartProvider: IChartProvider, chartEditorProvider: IChartEditorProvider) {
        this.server = server;
        this.clipboard = clipboard;
        this.chartProvider = chartProvider;
        this.chartEditorProvider = chartEditorProvider;
        this.htmlBuilder = new DocumentViewProvider(this, server, chartProvider, chartEditorProvider);

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

                // Create chart view for the bottom panel
                const panelAdapter = new WebViewAdapter(webviewView.webview);
                this.panelChartView = this.chartProvider.createView(panelAdapter);
                this.panelWebView = panelAdapter;
                this.wireChartView(this.panelChartView);

                // Create chart editor view for the bottom panel
                const panelEditorAdapter = new WebViewAdapter(webviewView.webview, 'setEditPanelContent');
                this.panelEditorView = this.chartEditorProvider.createView(panelEditorAdapter);
                this.panelEditorWebView = panelEditorAdapter;

                webviewView.onDidDispose(() => {
                    this.panelChartView?.dispose();
                    this.panelChartView = undefined;
                    this.panelWebView = undefined;
                    this.panelEditorView?.dispose();
                    this.panelEditorView = undefined;
                    this.panelEditorWebView = undefined;
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
     * Wires up the copy result/error callbacks on a chart view.
     */
    private wireChartView(view: IChartView): void {
        view.onCopyResult = (pngDataUrl, svgDataUrl) => this.onCopyChartMessage(pngDataUrl, svgDataUrl);
        view.onCopyError = (error) => vscode.window.showErrorMessage(`Chart copy failed in webview: ${error}`);
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

        const dataResult = resultDataToHtml(resultData);
        const hasChart = !!((mode === 'chart' || mode === 'all') && resultData.chartOptions);
        const hasTable = !!dataResult?.tables?.length;
        this.lastPanelTableNames = (dataResult?.tables ?? []).map((t: HtmlTable) => t.name);

        if (!hasTable && !hasChart) {
            await this.showPanelHtml('<html><body>no results</body></html>');
            return;
        }

        const chartOptions = resultData.chartOptions ? applyChartDefaults(resultData.chartOptions) : undefined;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const html = this.htmlBuilder.BuildMultiTabbedHtml(dataResult, hasChart, mode, this.panelWebView, this.panelEditorWebView, chartOptions, columnNames,
            resultData.query, resultData.cluster, resultData.database, resultData.tables);

        const totalRows = (dataResult?.tables ?? []).reduce((sum: number, t: HtmlTable) => sum + t.rowCount, 0);
        await this.showPanelHtml(injectMessageHandlerScripts(html), totalRows);

        // Populate chart and editor via controller messages after page is set
        if (hasChart && chartOptions) {
            const table = resultData.tables[0];
            if (table) {
                this.panelChartView?.renderChart(table, chartOptions, darkMode);
            }
            this.panelEditorView?.setOptions(chartOptions, columnNames);
        }

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
        const chartOptions = resultData.chartOptions ? applyChartDefaults(resultData.chartOptions) : undefined;

        // Ensure the singleton view (and its chart adapter) exist before building
        // HTML so that BuildMultiTabbedHtml can read the adapter's headHtml/scriptsHtml.
        this.ensureSingletonView(beside, mode);

        const dataResult = resultDataToHtml(resultData);
        const hasChart = !!chartOptions;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const html = this.htmlBuilder.BuildMultiTabbedHtml(dataResult, hasChart, mode, this.singletonWebView, this.singletonEditorWebView, chartOptions, columnNames,
            resultData.query, resultData.cluster, resultData.database, resultData.tables);

        this.showSingletonView(injectMessageHandlerScripts(html), resultData, (dataResult?.tables ?? []).map((t: HtmlTable) => t.name), beside, mode);

        // Populate chart and editor via controller messages after page is set
        if (hasChart && chartOptions) {
            const table = resultData.tables[0];
            if (table) {
                this.singletonChartView?.renderChart(table, chartOptions, darkMode);
            }
            this.singletonEditorView?.setOptions(chartOptions, columnNames);
        }
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
        const view = this.getActiveChartView();
        view?.copyChart();
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

    /** Ensures the singleton webview panel exists, creating it (with chart adapter) if needed. */
    private ensureSingletonView(beside: boolean, mode: ResultViewMode): void {
        if (this.singletonView) { return; }

        const viewColumn = beside ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
        const title = singletonTitleForMode(mode);
        this.singletonMode = mode;

        this.singletonView = vscode.window.createWebviewPanel(
            'kusto',
            title,
            { viewColumn, preserveFocus: true },
            { enableScripts: true, retainContextWhenHidden: true }
        );

        vscode.commands.executeCommand('kusto.singletonViewStateChanged');
        this.registerResultWebview(this.singletonView);

        // Create chart view for the singleton view
        const singletonAdapter = new WebViewAdapter(this.singletonView.webview);
        this.singletonChartView = this.chartProvider.createView(singletonAdapter);
        this.singletonWebView = singletonAdapter;
        this.wireChartView(this.singletonChartView);

        // Create chart editor view for the singleton view
        const singletonEditorAdapter = new WebViewAdapter(this.singletonView.webview, 'setEditPanelContent');
        this.singletonEditorView = this.chartEditorProvider.createView(singletonEditorAdapter);
        this.singletonEditorWebView = singletonEditorAdapter;
        this.singletonEditorView.onOptionsChanged = (options, clientOnly) => {
            this.singletonChartOptionsOverride = options;
            if (this.singletonResultData) {
                this.singletonResultData = { ...this.singletonResultData, chartOptions: this.singletonChartOptionsOverride };
            }
            const state = this.viewerStates.get(this.singletonView!);
            if (state) {
                state.chartOptionsOverride = this.singletonChartOptionsOverride;
                state.resultData = this.singletonResultData ?? state.resultData;
            }
            if (this.singletonChartOptionsTimer) { clearTimeout(this.singletonChartOptionsTimer); }
            if (!clientOnly) {
                this.singletonChartOptionsTimer = setTimeout(() => this.updateChartInSingletonView(), 600);
            }
            this.scheduleSingletonWriteBack();
        };

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
            if (message.command === 'editPanelToggled' && typeof message.visible === 'boolean') {
                if (message.visible) {
                    this.singletonView?.reveal(vscode.ViewColumn.One, false);
                } else {
                    this.singletonView?.reveal(getSingletonViewColumn(), false);
                }
                return;
            }
        });

        this.singletonView.onDidDispose(() => {
            if (this.singletonChartOptionsTimer) { clearTimeout(this.singletonChartOptionsTimer); }
            this.flushSingletonWriteBack();
            this.singletonChartView?.dispose();
            this.singletonChartView = undefined;
            this.singletonWebView = undefined;
            this.singletonEditorView?.dispose();
            this.singletonEditorView = undefined;
            this.singletonEditorWebView = undefined;
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

    private showSingletonView(html: string, resultData: server.ResultData, tableNames: string[], beside: boolean, mode: ResultViewMode): void {
        const viewColumn = beside ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
        const title = singletonTitleForMode(mode);
        this.singletonMode = mode;

        this.ensureSingletonView(beside, mode);

        // Track state for copy commands
        const hasChart = !!resultData.chartOptions;
        this.viewerStates.set(this.singletonView!, {
            resultData,
            tableNames,
            activeView: hasChart ? 'chart' : 'table-0'
        });

        vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', hasChart);

        this.singletonView!.title = title;
        this.singletonView!.webview.html = html;
        this.singletonView!.reveal(viewColumn, true);
        this.sendExpressionToResultsView(this.singletonView!);
    }

    private async updateChartInSingletonView(): Promise<void> {
        if (!this.singletonView || !this.singletonResultData) { return; }
        const rawChartOptions = this.singletonChartOptionsOverride ?? this.singletonResultData.chartOptions;
        if (!rawChartOptions) { return; }
        const chartOptions = applyChartDefaults(rawChartOptions);

        const state = this.viewerStates.get(this.singletonView);
        if (state && this.singletonChartOptionsOverride) { state.chartOptionsOverride = this.singletonChartOptionsOverride; }

        // Persist the override into the backing data so that if the webview is
        // reconstructed (e.g. on column change), it uses the latest options.
        this.singletonResultData = { ...this.singletonResultData, chartOptions };
        if (state) { state.resultData = this.singletonResultData; }

        const modifiedData = this.singletonResultData;
        const darkMode = isDarkMode();
        const table = modifiedData.tables[0];
        if (table && chartOptions) {
            this.singletonChartView?.renderChart(table, chartOptions, darkMode);
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
                const html = this.htmlBuilder.BuildMultiTabbedHtml(dataResult, false, this.singletonMode ?? 'all', this.singletonWebView, this.singletonEditorWebView, undefined, columnNames,
                    updated.query, updated.cluster, updated.database, updated.tables);
                this.singletonView!.webview.html = injectMessageHandlerScripts(html);

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

    private getActiveChartView(): IChartView | undefined {
        if (!this.activeResultWebview?.active) {
            return undefined;
        }
        if (this.activeResultWebview === this.singletonView) {
            return this.singletonChartView;
        }
        return this.chartViews.get(this.activeResultWebview);
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

    /**
     * Re-runs the query stored in the active document-view result and updates the document in-place.
     * Does not add history or display results in the bottom panel or singleton view.
     */
    async rerunQuery(): Promise<void> {
        const webview = this.activeResultWebview;
        if (!webview) { return; }

        const documentUri = this.webviewDocuments.get(webview);
        if (!documentUri) { return; }

        const state = this.viewerStates.get(webview);
        if (!state?.resultData?.query) {
            vscode.window.showWarningMessage('No query found in result data.');
            return;
        }

        const { query, cluster, database, chartOptions } = state.resultData;

        try {
            const runResult = await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: 'Rerunning query...' },
                () => this.server.runQuery(query, cluster, database, true)
            );

            if (runResult?.error) {
                vscode.window.showErrorMessage(runResult.error.message);
                return;
            }

            if (!runResult?.data) { return; }

            // Preserve existing chart options; fall back to server-returned options
            const effectiveChartOptions = chartOptions ?? runResult.data.chartOptions;
            const updatedData: server.ResultData = {
                ...runResult.data,
                ...(effectiveChartOptions && { chartOptions: effectiveChartOptions })
            };

            // Update the backing document (the change listener will re-render the webview)
            const document = vscode.workspace.textDocuments.find(
                doc => doc.uri.toString() === documentUri.toString()
            );
            if (!document) { return; }

            const content = JSON.stringify(updatedData, null, 2);
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, fullRange, content);
            await vscode.workspace.applyEdit(edit);
            await document.save();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to rerun query: ${error}`);
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

    constructor(private readonly viewer: ResultsViewer, private readonly server: IServer, private readonly chartProvider: IChartProvider, private readonly chartEditorProvider: IChartEditorProvider) {
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

        // Track document association for rerun support
        this.viewer['webviewDocuments'].set(webviewPanel, document.uri);

        // Create chart view for this document view
        const docAdapter = new WebViewAdapter(webviewPanel.webview);
        const docChartView = this.chartProvider.createView(docAdapter);
        this.viewer['wireChartView'](docChartView);
        (this.viewer['chartViews'] as Map<vscode.WebviewPanel, IChartView>).set(webviewPanel, docChartView);
        (this.viewer['chartWebViews'] as Map<vscode.WebviewPanel, WebViewAdapter>).set(webviewPanel, docAdapter);

        // Create chart editor view for this document view
        const docEditorAdapter = new WebViewAdapter(webviewPanel.webview, 'setEditPanelContent');
        const docEditorView = this.chartEditorProvider.createView(docEditorAdapter);
        (this.viewer['editorViews'] as Map<vscode.WebviewPanel, IChartEditorView>).set(webviewPanel, docEditorView);
        (this.viewer['editorWebViews'] as Map<vscode.WebviewPanel, WebViewAdapter>).set(webviewPanel, docEditorAdapter);

        // Update context key when this panel gains/loses focus
        const updateChartContext = () => {
            if (webviewPanel.active) {
                const state = this.viewer['viewerStates'].get(webviewPanel);
                const hasChart = !!state?.resultData?.chartOptions;
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', hasChart);
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', state?.activeView === 'chart');
                vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasQuery', !!state?.resultData?.query);
            }
        };
        webviewPanel.onDidChangeViewState(() => updateChartContext());

        // Debounce timer for chart options updates
        let chartOptionsTimer: ReturnType<typeof setTimeout> | undefined;
        let ignoringSelfEdit = false;

        // Wire chart editor options callback
        docEditorView.onOptionsChanged = async (options, clientOnly) => {
            const state = this.viewer['viewerStates'].get(webviewPanel);
            if (!state) { return; }
            state.chartOptionsOverride = options;
            state.resultData = { ...state.resultData, chartOptions: state.chartOptionsOverride };
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
            if (chartOptionsTimer) { clearTimeout(chartOptionsTimer); }
            chartOptionsTimer = setTimeout(async () => {
                if (!clientOnly) {
                    await this.updateChartOnly(state, webviewPanel);
                }
                ignoringSelfEdit = true;
                try { await document.save(); } finally { ignoringSelfEdit = false; }
            }, 600);
        };

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
            docChartView.dispose();
            docEditorView.dispose();
            (this.viewer['chartViews'] as Map<vscode.WebviewPanel, IChartView>).delete(webviewPanel);
            (this.viewer['chartWebViews'] as Map<vscode.WebviewPanel, WebViewAdapter>).delete(webviewPanel);
            (this.viewer['editorViews'] as Map<vscode.WebviewPanel, IChartEditorView>).delete(webviewPanel);
            (this.viewer['editorWebViews'] as Map<vscode.WebviewPanel, WebViewAdapter>).delete(webviewPanel);
            this.viewer['viewerStates'].delete(webviewPanel);
            this.viewer['webviewDocuments'].delete(webviewPanel);
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', false);
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', false);
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasQuery', false);
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

        const dataResult = resultDataToHtml(resultData);
        const hasChart = !!resultData.chartOptions;
        const hasTable = !!dataResult?.tables?.length;

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
            activeView: firstActiveView,
            ...(existingState?.chartOptionsOverride && { chartOptionsOverride: existingState.chartOptionsOverride })
        });

        // Update context keys after state is set (HTML rebuild always resets to firstActiveView)
        if (webviewPanel.active) {
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasChart', hasChart);
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerChartActive', firstActiveView === 'chart');
            vscode.commands.executeCommand('setContext', 'kusto.resultViewerHasQuery', !!resultData?.query);
        }

        const rawChartOptions = existingState?.chartOptionsOverride ?? resultData.chartOptions;
        const chartOptions = rawChartOptions ? applyChartDefaults(rawChartOptions) : undefined;
        const columnNames = resultData.tables[0]?.columns?.map(c => c.name) ?? [];
        const docWebView = (this.viewer['chartWebViews'] as Map<vscode.WebviewPanel, WebViewAdapter>).get(webviewPanel);
        const docEditorWebView = (this.viewer['editorWebViews'] as Map<vscode.WebviewPanel, WebViewAdapter>).get(webviewPanel);
        const html = this.BuildMultiTabbedHtml(dataResult, hasChart, 'all', docWebView, docEditorWebView, chartOptions, columnNames,
            resultData.query, resultData.cluster, resultData.database, resultData.tables);
        webviewPanel.webview.html = injectMessageHandlerScripts(html);

        // Populate chart and editor via controller messages after page is set
        if (hasChart && chartOptions) {
            const table = resultData.tables[0];
            if (table) {
                const controller = (this.viewer['chartViews'] as Map<vscode.WebviewPanel, IChartView>).get(webviewPanel);
                controller?.renderChart(table, chartOptions, darkMode);
            }
            const editorView = (this.viewer['editorViews'] as Map<vscode.WebviewPanel, IChartEditorView>).get(webviewPanel);
            editorView?.setOptions(chartOptions, columnNames);
        }
    }

    private async updateChartOnly(state: ResultViewerState, webviewPanel: vscode.WebviewPanel): Promise<void> {
        const rawChartOptions = state.chartOptionsOverride ?? state.resultData.chartOptions;
        if (!rawChartOptions) { return; }
        const chartOptions = applyChartDefaults(rawChartOptions);
        const modifiedData: server.ResultData = {
            ...state.resultData,
            chartOptions
        };
        const darkMode = isDarkMode();
        const table = modifiedData.tables[0];
        if (table) {
            const controller = (this.viewer['chartViews'] as Map<vscode.WebviewPanel, IChartView>).get(webviewPanel);
            controller?.renderChart(table, chartOptions, darkMode);
        }
    }

    /*
    * Builds the HTML for a multi-tabbed view showing chart, data tables, and query, with toggle buttons.   
    */
    BuildMultiTabbedHtml(
        dataResult: DataAsHtml | null,
        hasChart: boolean,
        mode: ResultViewMode,
        webview: WebViewAdapter | undefined,
        editorWebView: WebViewAdapter | undefined,
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

        // Get chart page dependencies from the webview adapter
        const chartHead = showChart ? (webview?.headHtml ?? '') : '';
        const chartScripts = showChart ? (webview?.scriptsHtml ?? '') : '';

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

        // Build chart options edit panel placeholder (populated by editor controller)
        const editPanelHtml = showChart ? '<div id=\"edit-panel\" class=\"edit-panel\"></div>' : '';

        // Get editor page dependencies from the editor adapter
        const editorHead = showChart ? (editorWebView?.headHtml ?? '') : '';
        const editorScripts = showChart ? (editorWebView?.scriptsHtml ?? '') : '';

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
    ${editorHead}
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
        #chart.has-aspect-ratio > :first-child {
            visibility: hidden;
        }
        #chart-view { padding: 0; }
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
            ${showChart ? `<div id="chart" class="view-content${chartAspectClass}${firstActiveView === 'chart' ? ' active' : ''}"${chartStyle}${chartDataAttrs} data-vscode-context='{"chartVisible": true, "queryVisible": false, "preventDefaultContextMenuItems": true}'></div>` : ''}
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
            // Trigger chart resize when switching to chart
            if (viewId === 'chart') {
                setTimeout(function() {
                    if (window._chartResize) window._chartResize();
                }, 50);
            }
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
                if (window._chartResize) window._chartResize();
            }, 50);
        }

        // Listen for messages from the extension
        window.addEventListener('message', function(event) {
            var msg = event.data;
            if (msg && msg.command === 'setChartHtml' && typeof msg.html === 'string') {
                var chartDiv = document.getElementById('chart');
                if (!chartDiv) return;
                chartDiv.innerHTML = msg.html;
                // Re-execute inline scripts (innerHTML doesn't execute them)
                chartDiv.querySelectorAll('script').forEach(function(oldScript) {
                    var newScript = document.createElement('script');
                    if (oldScript.src) { newScript.src = oldScript.src; }
                    else { newScript.textContent = oldScript.textContent; }
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
                // Notify chart engine scripts to apply post-insertion overrides
                if (window._chartUpdated) window._chartUpdated();
                return;
            }
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
        });
    </script>
    ${editorScripts}
    ${chartScripts}
</body>
</html>`;
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

    escapeHtml(text: string): string {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
