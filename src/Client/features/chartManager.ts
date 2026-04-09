// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Chart manager interfaces and constants.
 */

import type { ChartOptions, ResultTable } from './server';
import type { IWebView } from './webview';

// Re-export so consumers can import from chartManager
export type { IWebView } from './webview';

// ─── Interfaces ────────────────────────────────────────────────────────

/**
 * Controller for interacting with a chart rendered inside a webview.
 * Created by IChartManager.createController().
 *
 * The host sets `onCopyResult` / `onCopyError` to receive copy outcomes.
 */
export interface IChartController {
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
 * Manager for creating and controlling charts in webviews. The main implementation is PlotlyChartManager, which renders charts using Plotly.js.
 */
export interface IChartManager {
    /** Creates a controller for interacting with a chart in a webview.
     *  Calls `webview.setup()` to provide page-level dependencies. */
    createController(webview: IWebView): IChartController;
}


// ─── Chart Constants ────────────────────────────────────────────────────────

export const ChartType = {
    None: 'None',
    AreaChart: 'AreaChart',
    BarChart: 'BarChart',
    Card: 'Card',
    ColumnChart: 'ColumnChart',
    Graph: 'Graph',
    LineChart: 'LineChart',
    PieChart: 'PieChart',
    PivotChart: 'PivotChart',
    Plotly: 'Plotly',
    Sankey: 'Sankey',
    ScatterChart: 'ScatterChart',
    StackedAreaChart: 'StackedAreaChart',
    ThreeDChart: '3DChart',
    TimeLadderChart: 'TimeLadderChart',
    TimeLineChart: 'TimeLineChart',
    TimeLineWithAnomalyChart: 'TimeLineWithAnomalyChart',
    TimePivot: 'TimePivot',
    TreeMap: 'TreeMap',
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

