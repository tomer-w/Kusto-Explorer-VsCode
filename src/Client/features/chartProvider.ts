// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Chart provider interfaces and constants.
 */

import type { ChartOptions, ResultColumn, ResultTable } from './server';
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
    None: 'None',
    Area: 'Area',
    AreaStacked: 'AreaStacked',
    AreaStacked100: 'AreaStacked100',
    Bar: 'Bar',
    BarStacked: 'BarStacked',
    BarStacked100: 'BarStacked100',
    Card: 'Card',
    Column: 'Column',
    ColumnStacked: 'ColumnStacked',
    ColumnStacked100: 'ColumnStacked100',
    Graph: 'Graph',
    Ladder: 'Ladder',
    Line: 'Line',
    Pie: 'Pie',
    Plotly: 'Plotly',
    Sankey: 'Sankey',
    Scatter: 'Scatter',
    ThreeD: 'ThreeD',
    TimeLine: 'TimeLine',
    TimeLineAnomaly: 'TimeLineAnomaly',
    TimePivot: 'TimePivot',
    TreeMap: 'TreeMap',
} as const;

export const ChartAxis = {
    Linear: 'Linear',
    Log: 'Log',
} as const;

export const ChartSortOrder = {
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

export const ChartYLayout = {
    SharedAxis: 'SharedAxis',
    DualAxis: 'DualAxis',
    SeparatePanels: 'SeparatePanels',
    SeparateCharts: 'SeparateCharts',
} as const;

// ─── Shared Utilities ───────────────────────────────────────────────────────

/** Default colorway shared across chart providers. */
export const ChartColorways = {
    Default: [
        '#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FDC826',
        '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52',
    ],
} as const;

/** Convert a hex color to an rgba() string. */
export function hexToRgba(hex: string, opacity: number): string {
    let h = hex.replace(/^#/, '');
    if (h.length === 3) {
        h = (h[0] ?? '') + (h[0] ?? '') + (h[1] ?? '') + (h[1] ?? '') + (h[2] ?? '') + (h[2] ?? '');
    }
    if (h.length !== 6) {
        return `rgba(128, 128, 128, ${opacity})`;
    }
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function isNumericType(type: string): boolean {
    switch (type) {
        case 'int':
        case 'long':
        case 'real':
        case 'decimal':
            return true;
        default:
            return false;
    }
}

export function isDateTimeType(type: string): boolean {
    return type === 'datetime' || type === 'timespan';
}

// ─── Data Access Helpers ────────────────────────────────────────────────────

/** A ResultColumn together with its position in the table. */
export interface ColumnRef {
    column: ResultColumn;
    index: number;
}

export function getColumnRef(table: ResultTable, name: string): ColumnRef | undefined {
    const idx = table.columns.findIndex(c => c.name === name);
    if (idx < 0) return undefined;
    const col = table.columns[idx];
    if (!col) return undefined;
    return { column: col, index: idx };
}

export function getColumnRefByIndex(table: ResultTable, index: number): ColumnRef | undefined {
    if (index < 0 || index >= table.columns.length) return undefined;
    const col = table.columns[index];
    if (!col) return undefined;
    return { column: col, index };
}
