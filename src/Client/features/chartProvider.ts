// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Chart provider interfaces and constants.
 */

import type { ChartOptions, ResultTable } from './server';
import type { IWebView } from './webview';

// Re-export so consumers can import from chartProvider
export type { IWebView } from './webview';

// ─── Interfaces ────────────────────────────────────────────────────────

/**
 * View for interacting with a chart rendered inside a webview.
 * Created by IChartProvider.createView().
 *
 * The host sets `onCopyResult` / `onCopyError` to receive copy outcomes.
 */
export interface IChartView {
    /** Render the chart with the given data/options and push to the webview. */
    renderChart(data: ResultTable, options: ChartOptions, darkMode: boolean): void;
    /** Trigger the chart copy flow (extension → webview → extension). */
    copyChart(): void;
    /** Called when the webview produces a chart image for copying. */
    onCopyResult: ((pngDataUrl: string, svgDataUrl?: string) => void) | undefined;
    /** Called when the webview chart copy fails. */
    onCopyError: ((error: string) => void) | undefined;
    /** Release handlers and resources. */
    dispose(): void;
}

/**
 * Provider for creating chart views in webviews. The main implementation is PlotlyChartProvider, which renders charts using Plotly.js.
 */
export interface IChartProvider {
    /** Creates a chart view bound to a webview region.
     *  Calls `webview.setup()` to provide page-level dependencies. */
    createView(webview: IWebView): IChartView;
}


// ─── Chart Constants ────────────────────────────────────────────────────────

export const ChartType = {
    None: 'none',
    AreaChart: 'areachart',
    BarChart: 'barchart',
    Card: 'card',
    ColumnChart: 'columnchart',
    Graph: 'graph',
    LineChart: 'linechart',
    PieChart: 'piechart',
    PivotChart: 'pivotchart',
    Plotly: 'plotly',
    Sankey: 'sankey',
    ScatterChart: 'scatterchart',
    StackedAreaChart: 'stackedareachart',
    ThreeDChart: '3Dchart',
    TimeLadderChart: 'ladderchart',
    TimeLineChart: 'timechart',
    TimeLineWithAnomalyChart: 'anomalychart',
    TimePivot: 'timepivot',
    TreeMap: 'treemap',
} as const;

export const ChartKind = {
    Default: 'Default',
    Stacked: 'Stacked',
    Stacked100: 'Stacked100',
    Unstacked: 'Unstacked',
} as const;

export const ChartAxis = {
    Linear: 'Linear',
    Log: 'Log',
} as const;

export const ChartSortOrder = {
    Default: 'Default',
    Ascending: 'Ascending',
    Descending: 'Descending',
} as const;

export const ChartLegendPosition = {
    Right: 'Right',
    Bottom: 'Bottom',
    Hidden: 'Hidden',
} as const;

export const ChartMode = {
    Light: 'Light',
    Dark: 'Dark',
} as const;

