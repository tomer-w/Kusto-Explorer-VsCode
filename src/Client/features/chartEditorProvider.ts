// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Chart editor — builds and manages the chart-options edit panel.
 *
 * The editor generates a form whose controls mirror the `ChartOptions` type.
 * When the user changes any control, the in-page JS collects the values and
 * posts a `chartOptionsChanged` message, which the controller forwards via its
 * `onOptionsChanged` callback.
 */

import type { ChartOptions } from './server';
import type { IWebView } from './webview';

// ─── Constants ──────────────────────────────────────────────────────────────

/** Known chart types for the edit panel dropdown. Maps internal ID → UI display name. */
const chartTypes: ReadonlyMap<string, string> = new Map([
    ['areachart', 'Area'],
    ['barchart', 'Bar'],
    ['card', 'Card'],
    ['columnchart', 'Column'],
    ['graph', 'Graph'],
    ['ladderchart', 'Time - Ladder'],
    ['linechart', 'Line'],
    ['piechart', 'Pie'],
    ['pivotchart', 'Pivot'],
    ['plotly', 'Plotly'],
    ['sankey', 'Sankey'],
    ['scatterchart', 'Scatter'],
    ['stackedareachart', 'Area - Stacked'],
    ['3Dchart', '3D'],
    ['timechart', 'Time - Line'],
    ['anomalychart', 'Time - Line w/ Anomalies'],
    ['timepivot', 'Time - Pivot'],
    ['treemap', 'Tree Map'],
]);

const chartKinds = ['Default', 'Unstacked', 'Stacked', 'Stacked100'];
const legendPositions = ['Right', 'Bottom', 'Hidden'];
const axisTypes = ['Linear', 'Log'];
const sortOrders = ['Default', 'Ascending', 'Descending'];
const chartModes = ['Light', 'Dark'];
const aspectRatios = ['16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16'];
const textSizes = ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'];
const markerShapeOptions = ['circle', 'diamond', 'square', 'triangle-up', 'cross', 'star', 'x'];
const tickAngles = [0, 15, 30, 45, 60, 75, 90, -15, -30, -45, -60, -75, -90];

// ─── Interfaces ─────────────────────────────────────────────────────────────

/**
 * View for the chart-options edit panel in a webview.
 * Created by `IChartEditorProvider.createView()`.
 */
export interface IChartEditorView {
    /** Populate (or re-populate) the edit panel with the given options and column names. */
    setOptions(options: ChartOptions, columnNames: string[]): void;
    /** Fires when the user changes any chart option in the edit panel. */
    onOptionsChanged: ((options: ChartOptions, clientOnly: boolean) => void) | undefined;
    /** Release handlers and resources. */
    dispose(): void;
}

/** Provider for creating chart editor views bound to webview regions. */
export interface IChartEditorProvider {
    createView(webview: IWebView): IChartEditorView;
}

// ─── Implementation ─────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class ChartEditorView implements IChartEditorView {
    private readonly webview: IWebView;
    private readonly subscription: { dispose(): void };
    onOptionsChanged: ((options: ChartOptions, clientOnly: boolean) => void) | undefined;

    constructor(webview: IWebView) {
        this.webview = webview;
        webview.setup(this.buildCss(), this.buildScripts());
        this.subscription = webview.handle((msg) => {
            if (msg.command === 'chartOptionsChanged' && msg.chartOptions) {
                this.onOptionsChanged?.(msg.chartOptions as ChartOptions, !!msg.clientOnly);
            }
        });
    }

    setOptions(options: ChartOptions, columnNames: string[]): void {
        this.webview.setContent(this.buildFormHtml(options, columnNames));
    }

    dispose(): void {
        this.subscription.dispose();
    }

    // ─── HTML Builders ──────────────────────────────────────────────────

    private buildCss(): string {
        return `<style>
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
        </style>`;
    }

    private buildScripts(): string {
        return `<script>
        function _editorAddColumnItem(pickerId, listId) {
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
            upBtn.onclick = function() { _editorMoveColumnItem(upBtn, -1); };
            li.appendChild(upBtn);
            var downBtn = document.createElement('button');
            downBtn.innerHTML = '&darr;';
            downBtn.title = 'Move down';
            downBtn.onclick = function() { _editorMoveColumnItem(downBtn, 1); };
            li.appendChild(downBtn);
            var removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove';
            removeBtn.onclick = function() { _editorRemoveColumnItem(removeBtn); };
            li.appendChild(removeBtn);
            list.appendChild(li);
            picker.selectedIndex = 0;
            _editorOnChartOptionChanged();
        }

        function _editorRemoveColumnItem(btn) {
            var li = btn.closest('li');
            if (li) { li.remove(); _editorOnChartOptionChanged(); }
        }

        function _editorMoveColumnItem(btn, dir) {
            var li = btn.closest('li');
            if (!li) return;
            var list = li.parentNode;
            if (dir === -1 && li.previousElementSibling) {
                list.insertBefore(li, li.previousElementSibling);
            } else if (dir === 1 && li.nextElementSibling) {
                list.insertBefore(li.nextElementSibling, li);
            }
            _editorOnChartOptionChanged();
        }

        function _editorToggleSection(headerEl) {
            headerEl.classList.toggle('collapsed');
            var body = headerEl.nextElementSibling;
            if (body) body.classList.toggle('collapsed');
        }

        function _editorCollectChartOptions() {
            var opts = {};
            var chartType = document.getElementById('opt-type');
            if (chartType) opts.type = chartType.value;
            var kind = document.getElementById('opt-kind');
            if (kind && kind.value) opts.kind = kind.value;
            var legendPos = document.getElementById('opt-legendPosition');
            if (legendPos && legendPos.value) {
                if (legendPos.value === 'Hidden') { opts.showLegend = false; }
                else { opts.showLegend = true; opts.legendPosition = legendPos.value; }
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
            if (showValues) opts.showValues = showValues.checked;
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
            var seriesList = document.getElementById('opt-seriesColumns-list');
            if (seriesList) { var si = Array.from(seriesList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (si.length) opts.seriesColumns = si; }
            var anomalyList = document.getElementById('opt-anomalyColumns-list');
            if (anomalyList) { var ai = Array.from(anomalyList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (ai.length) opts.anomalyColumns = ai; }
            var markerShape = document.getElementById('opt-markerShape');
            if (markerShape && markerShape.value) opts.markerShape = markerShape.value;
            var cycleMarkerShapes = document.getElementById('opt-cycleMarkerShapes');
            if (cycleMarkerShapes) opts.cycleMarkerShapes = cycleMarkerShapes.checked;
            var markerSize = document.getElementById('opt-markerSize');
            if (markerSize && markerSize.value) opts.markerSize = markerSize.value;
            var accumulate = document.getElementById('opt-accumulate');
            if (accumulate) opts.accumulate = accumulate.checked;
            var xAxis = document.getElementById('opt-xAxis');
            if (xAxis && xAxis.value) opts.xAxis = xAxis.value;
            var yAxis = document.getElementById('opt-yAxis');
            if (yAxis && yAxis.value) opts.yAxis = yAxis.value;
            var xmin = document.getElementById('opt-xMin');
            if (xmin && xmin.value) opts.xMin = xmin.value;
            var xmax = document.getElementById('opt-xMax');
            if (xmax && xmax.value) opts.xMax = xmax.value;
            var ymin = document.getElementById('opt-yMin');
            if (ymin && ymin.value) opts.yMin = ymin.value;
            var ymax = document.getElementById('opt-yMax');
            if (ymax && ymax.value) opts.yMax = ymax.value;
            var xShowTicks = document.getElementById('opt-xShowTicks');
            if (xShowTicks) opts.xShowTicks = xShowTicks.checked;
            var yShowTicks = document.getElementById('opt-yShowTicks');
            if (yShowTicks) opts.yShowTicks = yShowTicks.checked;
            var xShowGrid = document.getElementById('opt-xShowGrid');
            if (xShowGrid) opts.xShowGrid = xShowGrid.checked;
            var yShowGrid = document.getElementById('opt-yShowGrid');
            if (yShowGrid) opts.yShowGrid = yShowGrid.checked;
            var xTickAngle = document.getElementById('opt-xTickAngle');
            if (xTickAngle && xTickAngle.value !== '') opts.xTickAngle = Number(xTickAngle.value);
            var yTickAngle = document.getElementById('opt-yTickAngle');
            if (yTickAngle && yTickAngle.value !== '') opts.yTickAngle = Number(yTickAngle.value);
            return opts;
        }

        function _editorOnChartOptionChanged() {
            _editorApplyClientSideOptions();
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'chartOptionsChanged', chartOptions: _editorCollectChartOptions() });
            }
        }

        function _editorOnClientOnlyOptionChanged() {
            _editorApplyClientSideOptions();
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'chartOptionsChanged', chartOptions: _editorCollectChartOptions(), clientOnly: true });
            }
        }

        function _editorApplyClientSideOptions() {
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
                chartDiv.setAttribute('data-text-size', tsSelect ? tsSelect.value : '');
                setTimeout(function() {
                    if (window._chartResize) window._chartResize();
                }, 50);
            }
        }

        // Listen for editor content updates from the extension
        window.addEventListener('message', function(event) {
            var msg = event.data;
            if (msg && msg.command === 'setEditPanelContent' && typeof msg.html === 'string') {
                var panel = document.getElementById('edit-panel');
                if (panel) { panel.innerHTML = msg.html; }
            }
        });
        <\/script>`;
    }

    private buildFormHtml(chartOptions: ChartOptions, columnNames: string[]): string {
        const opts = chartOptions;

        const allTypeKeys = chartTypes.has(opts.type) ? [...chartTypes.keys()] : [opts.type, ...chartTypes.keys()];
        allTypeKeys.sort((a, b) => {
            const la = chartTypes.get(a) ?? a;
            const lb = chartTypes.get(b) ?? b;
            return la.localeCompare(lb);
        });
        const typeOptions = allTypeKeys.map(t => {
            const label = chartTypes.get(t);
            const display = label ?? t;
            return `<option value="${t}"${t === opts.type ? ' selected' : ''} title="${escapeHtml(t)}">${escapeHtml(display)}</option>`;
        }).join('');

        const currentKind = opts.kind || 'Default';
        const allKinds = chartKinds.includes(currentKind) ? chartKinds : [currentKind, ...chartKinds];
        const kindOptions = allKinds.map(k =>
            `<option value="${k}"${k === currentKind ? ' selected' : ''}>${k === 'Default' ? '(default)' : escapeHtml(k)}</option>`
        ).join('');

        const currentLegend = (opts.showLegend === false) ? 'Hidden' : (opts.legendPosition ?? '');
        const legendPosOptions = ['', ...legendPositions].map(p =>
            `<option value="${p}"${p === currentLegend ? ' selected' : ''}>${p || '(default)'}</option>`
        ).join('');

        const currentSort = opts.sort ?? '';
        const sortOptions = ['', ...sortOrders].map(s =>
            `<option value="${s}"${s === currentSort ? ' selected' : ''}>${s || '(default)'}</option>`
        ).join('');

        const currentMode = opts.mode ?? '';
        const modeOptions = ['', ...chartModes].map(m =>
            `<option value="${m}"${m === currentMode ? ' selected' : ''}>${m || '(auto)'}</option>`
        ).join('');

        const currentAspectRatio = opts.aspectRatio ?? '';
        const aspectRatioOptions = ['', ...aspectRatios].map(r =>
            `<option value="${r}"${r === currentAspectRatio ? ' selected' : ''}>${r || '(fill)'}</option>`
        ).join('');

        const currentTextSize = opts.textSize ?? '';
        const textSizeOptions = ['', ...textSizes].map(s =>
            `<option value="${s}"${s === currentTextSize ? ' selected' : ''}>${s || '(medium)'}</option>`
        ).join('');

        const showValuesChecked = opts.showValues === true ? ' checked' : '';

        const xColOptions = ['', ...columnNames].map(c =>
            `<option value="${escapeHtml(c)}"${c === (opts.xColumn ?? '') ? ' selected' : ''}>${c || '(auto)'}</option>`
        ).join('');

        const allColOptions = `<option value="" disabled selected>Pick a column</option>` + columnNames.map(c =>
            `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
        ).join('');

        const yColumnsItems = (opts.yColumns ?? []).map(c =>
            `<li><span>${escapeHtml(c)}</span><button onclick="_editorMoveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="_editorMoveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="_editorRemoveColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        const seriesItems = (opts.seriesColumns ?? []).map(c =>
            `<li><span>${escapeHtml(c)}</span><button onclick="_editorMoveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="_editorMoveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="_editorRemoveColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        const anomalyColumnsItems = (opts.anomalyColumns ?? []).map(c =>
            `<li><span>${escapeHtml(c)}</span><button onclick="_editorMoveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="_editorMoveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="_editorRemoveColumnItem(this)" title="Remove">&times;</button></li>`
        ).join('');

        const currentMarkerShape = opts.markerShape ?? '';
        const markerShapeOpts = ['', ...markerShapeOptions].map(s =>
            `<option value="${s}"${s === currentMarkerShape ? ' selected' : ''}>${s || '(default)'}</option>`
        ).join('');
        const cycleMarkerShapesChecked = opts.cycleMarkerShapes === true ? ' checked' : '';

        const currentMarkerSize = opts.markerSize ?? '';
        const markerSizeOpts = ['', ...textSizes].map(s =>
            `<option value="${s}"${s === currentMarkerSize ? ' selected' : ''}>${s || '(default)'}</option>`
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

        const xShowTicksChecked = opts.xShowTicks === true ? ' checked' : '';
        const yShowTicksChecked = opts.yShowTicks === true ? ' checked' : '';
        const xShowGridChecked = opts.xShowGrid === false ? '' : ' checked';
        const yShowGridChecked = opts.yShowGrid === false ? '' : ' checked';
        const xTickAngleValue = opts.xTickAngle != null ? String(opts.xTickAngle) : '';
        const xTickAngleOptions = ['', ...tickAngles.map(String)].map(a =>
            `<option value="${a}"${a === xTickAngleValue ? ' selected' : ''}>${a ? a + '°' : '(auto)'}</option>`
        ).join('');
        const yTickAngleValue = opts.yTickAngle != null ? String(opts.yTickAngle) : '';
        const yTickAngleOptions = ['', ...tickAngles.map(String)].map(a =>
            `<option value="${a}"${a === yTickAngleValue ? ' selected' : ''}>${a ? a + '°' : '(auto)'}</option>`
        ).join('');

        return `<h3>Chart Options</h3>

            <div class="section-header" onclick="_editorToggleSection(this)">
                <span class="chevron">&#9662;</span>General
            </div>
            <div class="section-body">
                <div class="field">
                    <label for="opt-type">Type</label>
                    <select id="opt-type" onchange="_editorOnChartOptionChanged()">${typeOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-kind">Kind</label>
                    <select id="opt-kind" onchange="_editorOnChartOptionChanged()">${kindOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-legendPosition">Legend</label>
                    <select id="opt-legendPosition" onchange="_editorOnChartOptionChanged()">${legendPosOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-sort">Sort</label>
                    <select id="opt-sort" onchange="_editorOnChartOptionChanged()">${sortOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-mode">Mode</label>
                    <select id="opt-mode" onchange="_editorOnChartOptionChanged()">${modeOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-aspectRatio">Aspect Ratio</label>
                    <select id="opt-aspectRatio" onchange="_editorOnClientOnlyOptionChanged()">${aspectRatioOptions}</select>
                </div>
                <div class="field">
                    <label for="opt-textSize">Text Size</label>
                    <select id="opt-textSize" onchange="_editorOnClientOnlyOptionChanged()">${textSizeOptions}</select>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-showValues"${showValuesChecked} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-showValues">Show Values</label>
                </div>
            </div>

            <div class="section-header collapsed" onclick="_editorToggleSection(this)">
                <span class="chevron">&#9662;</span>Data
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-xColumn">X Column</label>
                    <select id="opt-xColumn" onchange="_editorOnChartOptionChanged()">${xColOptions}</select>
                </div>
                <div class="field">
                    <label>Y Columns</label>
                    <div class="column-picker">
                        <select id="opt-yColumns-picker">${allColOptions}</select>
                        <button onclick="_editorAddColumnItem('opt-yColumns-picker','opt-yColumns-list')">Add</button>
                    </div>
                    <ul id="opt-yColumns-list" class="column-list">${yColumnsItems}</ul>
                </div>
                <div class="field">
                    <label>Series Columns</label>
                    <div class="column-picker">
                        <select id="opt-seriesColumns-picker">${allColOptions}</select>
                        <button onclick="_editorAddColumnItem('opt-seriesColumns-picker','opt-seriesColumns-list')">Add</button>
                    </div>
                    <ul id="opt-seriesColumns-list" class="column-list">${seriesItems}</ul>
                </div>
                <div class="field">
                    <label>Anomaly Columns</label>
                    <div class="column-picker">
                        <select id="opt-anomalyColumns-picker">${allColOptions}</select>
                        <button onclick="_editorAddColumnItem('opt-anomalyColumns-picker','opt-anomalyColumns-list')">Add</button>
                    </div>
                    <ul id="opt-anomalyColumns-list" class="column-list">${anomalyColumnsItems}</ul>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-accumulate"${opts.accumulate ? ' checked' : ''} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-accumulate">Accumulate</label>
                </div>
            </div>

            <div class="section-header collapsed" onclick="_editorToggleSection(this)">
                <span class="chevron">&#9662;</span>Markers
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-markerShape">Shape</label>
                    <select id="opt-markerShape" onchange="_editorOnChartOptionChanged()">${markerShapeOpts}</select>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-cycleMarkerShapes"${cycleMarkerShapesChecked} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-cycleMarkerShapes">Cycle Shapes</label>
                </div>
                <div class="field">
                    <label for="opt-markerSize">Size</label>
                    <select id="opt-markerSize" onchange="_editorOnChartOptionChanged()">${markerSizeOpts}</select>
                </div>
            </div>

            <div class="section-header collapsed" onclick="_editorToggleSection(this)">
                <span class="chevron">&#9662;</span>Titles
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-title">Title</label>
                    <input type="text" id="opt-title" value="${escapeHtml(opts.title ?? '')}" oninput="_editorOnChartOptionChanged()">
                </div>
                <div class="field">
                    <label for="opt-xTitle">X-Axis Title</label>
                    <input type="text" id="opt-xTitle" value="${escapeHtml(opts.xTitle ?? '')}" oninput="_editorOnChartOptionChanged()">
                </div>
                <div class="field">
                    <label for="opt-yTitle">Y-Axis Title</label>
                    <input type="text" id="opt-yTitle" value="${escapeHtml(opts.yTitle ?? '')}" oninput="_editorOnChartOptionChanged()">
                </div>
                <div class="field">
                    <label for="opt-zTitle">Z-Axis Title</label>
                    <input type="text" id="opt-zTitle" value="${escapeHtml(opts.zTitle ?? '')}" oninput="_editorOnChartOptionChanged()">
                </div>
            </div>

            <div class="section-header collapsed" onclick="_editorToggleSection(this)">
                <span class="chevron">&#9662;</span>X Axis
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-xAxis">Type</label>
                    <select id="opt-xAxis" onchange="_editorOnChartOptionChanged()">${xAxisOptions}</select>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label for="opt-xMin">Min</label>
                        <input type="text" id="opt-xMin" value="${escapeHtml(String(opts.xMin ?? ''))}" oninput="_editorOnChartOptionChanged()">
                    </div>
                    <div class="field">
                        <label for="opt-xMax">Max</label>
                        <input type="text" id="opt-xMax" value="${escapeHtml(String(opts.xMax ?? ''))}" oninput="_editorOnChartOptionChanged()">
                    </div>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-xShowTicks"${xShowTicksChecked} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-xShowTicks">Show Tick Marks</label>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-xShowGrid"${xShowGridChecked} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-xShowGrid">Show Grid Lines</label>
                </div>
                <div class="field">
                    <label for="opt-xTickAngle">Tick Label Angle</label>
                    <select id="opt-xTickAngle" onchange="_editorOnChartOptionChanged()">${xTickAngleOptions}</select>
                </div>
            </div>

            <div class="section-header collapsed" onclick="_editorToggleSection(this)">
                <span class="chevron">&#9662;</span>Y Axis
            </div>
            <div class="section-body collapsed">
                <div class="field">
                    <label for="opt-yAxis">Type</label>
                    <select id="opt-yAxis" onchange="_editorOnChartOptionChanged()">${yAxisOptions}</select>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label for="opt-yMin">Min</label>
                        <input type="text" id="opt-yMin" value="${escapeHtml(String(opts.yMin ?? ''))}" oninput="_editorOnChartOptionChanged()">
                    </div>
                    <div class="field">
                        <label for="opt-yMax">Max</label>
                        <input type="text" id="opt-yMax" value="${escapeHtml(String(opts.yMax ?? ''))}" oninput="_editorOnChartOptionChanged()">
                    </div>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-yShowTicks"${yShowTicksChecked} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-yShowTicks">Show Tick Marks</label>
                </div>
                <div class="field checkbox-field">
                    <input type="checkbox" id="opt-yShowGrid"${yShowGridChecked} onchange="_editorOnChartOptionChanged()">
                    <label for="opt-yShowGrid">Show Grid Lines</label>
                </div>
                <div class="field">
                    <label for="opt-yTickAngle">Tick Label Angle</label>
                    <select id="opt-yTickAngle" onchange="_editorOnChartOptionChanged()">${yTickAngleOptions}</select>
                </div>
            </div>`;
    }
}

export class ChartEditorProvider implements IChartEditorProvider {
    createView(webview: IWebView): IChartEditorView {
        return new ChartEditorView(webview);
    }
}
