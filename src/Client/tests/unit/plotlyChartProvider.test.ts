// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlotlyChartProvider } from '../../features/plotlyChartProvider';
import type { IChartView } from '../../features/chartProvider';
import type { IWebView } from '../../features/webview';
import type { ResultTable, ChartOptions } from '../../features/server';

// ─── Mock IWebView ──────────────────────────────────────────────────────────

function createMockWebView(): IWebView & {
    setup: ReturnType<typeof vi.fn>;
    setContent: ReturnType<typeof vi.fn>;
    invoke: ReturnType<typeof vi.fn>;
    /** Simulate a message from the webview. */
    simulateMessage: (message: Record<string, unknown>) => void;
} {
    const handlers: ((message: Record<string, unknown>) => void)[] = [];
    return {
        setup: vi.fn(),
        setContent: vi.fn(),
        invoke: vi.fn(),
        handle: vi.fn((handler: (message: Record<string, unknown>) => void) => {
            handlers.push(handler);
            return { dispose: () => { const i = handlers.indexOf(handler); if (i >= 0) handlers.splice(i, 1); } };
        }),
        simulateMessage(message: Record<string, unknown>) {
            for (const h of handlers) { h(message); }
        },
    };
}

// ─── Test Data Helpers ──────────────────────────────────────────────────────

function makeTable(columns: { name: string; type: string }[], rows: unknown[][]): ResultTable {
    return { name: 'TestTable', columns, rows };
}

function make2dTable(): ResultTable {
    return makeTable(
        [{ name: 'Category', type: 'string' }, { name: 'Value', type: 'real' }],
        [['A', 10], ['B', 20], ['C', 30]],
    );
}

function makeMultiSeriesTable(): ResultTable {
    return makeTable(
        [
            { name: 'Month', type: 'string' },
            { name: 'Sales', type: 'real' },
            { name: 'Profit', type: 'real' },
        ],
        [['Jan', 100, 40], ['Feb', 150, 60], ['Mar', 120, 50]],
    );
}

function makePieTable(): ResultTable {
    return makeTable(
        [{ name: 'Fruit', type: 'string' }, { name: 'Count', type: 'int' }],
        [['Apple', 5], ['Banana', 3], ['Cherry', 8]],
    );
}

// ─── createView ─────────────────────────────────────────────────────────

describe('PlotlyChartProvider', () => {
    let provider: PlotlyChartProvider;

    beforeEach(() => {
        provider = new PlotlyChartProvider();
    });

    describe('createView', () => {
        it('calls webview.setup() with Plotly CDN and scripts', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.setup).toHaveBeenCalledOnce();
            const [headHtml, scriptsHtml] = webview.setup.mock.calls[0]!;
            expect(headHtml).toContain('<script src=');
            expect(headHtml).toContain('plotly');
            expect(scriptsHtml).toContain('<script>');
        });

        it('returns an IChartView', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            expect(view).toBeDefined();
            expect(typeof view.renderChart).toBe('function');
            expect(typeof view.copyChart).toBe('function');
            expect(typeof view.dispose).toBe('function');
        });

        it('subscribes to webview messages', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.handle).toHaveBeenCalledOnce();
        });
    });

    // ─── IChartView behavior ────────────────────────────────────────────

    describe('IChartView', () => {
        let webview: ReturnType<typeof createMockWebView>;
        let view: IChartView;

        beforeEach(() => {
            webview = createMockWebView();
            view = provider.createView(webview);
        });

        describe('copyChart', () => {
            it('invokes copyChart command on the webview', () => {
                view.copyChart();
                expect(webview.invoke).toHaveBeenCalledWith('copyChart');
            });
        });

        describe('onCopyResult', () => {
            it('fires when webview sends copyChartResult message', () => {
                const callback = vi.fn();
                view.onCopyResult = callback;

                webview.simulateMessage({
                    command: 'copyChartResult',
                    pngDataUrl: 'data:image/png;base64,abc',
                    svgDataUrl: 'data:image/svg+xml,<svg/>',
                });

                expect(callback).toHaveBeenCalledWith(
                    'data:image/png;base64,abc',
                    'data:image/svg+xml,<svg/>',
                );
            });

            it('does not fire when pngDataUrl is missing', () => {
                const callback = vi.fn();
                view.onCopyResult = callback;

                webview.simulateMessage({ command: 'copyChartResult' });
                expect(callback).not.toHaveBeenCalled();
            });
        });

        describe('onCopyError', () => {
            it('fires when webview sends copyChartError message', () => {
                const callback = vi.fn();
                view.onCopyError = callback;

                webview.simulateMessage({ command: 'copyChartError', error: 'Export failed' });
                expect(callback).toHaveBeenCalledWith('Export failed');
            });

            it('uses fallback string when error is undefined', () => {
                const callback = vi.fn();
                view.onCopyError = callback;

                webview.simulateMessage({ command: 'copyChartError' });
                expect(callback).toHaveBeenCalledWith('Unknown error');
            });
        });

        describe('dispose', () => {
            it('unsubscribes from webview messages', () => {
                const callback = vi.fn();
                view.onCopyResult = callback;

                view.dispose();

                webview.simulateMessage({
                    command: 'copyChartResult',
                    pngDataUrl: 'data:image/png;base64,abc',
                });
                expect(callback).not.toHaveBeenCalled();
            });
        });

        describe('renderChart', () => {
            it('calls webview.setContent() with chart HTML', () => {
                view.renderChart(make2dTable(), { type: 'columnchart' }, false);
                expect(webview.setContent).toHaveBeenCalledOnce();
                const html = webview.setContent.mock.calls[0]![0] as string;
                expect(html).toContain('plotly-chart');
                expect(html).toContain('Plotly.newPlot');
            });

            it('renders empty traces for table with no rows', () => {
                const emptyTable = makeTable(
                    [{ name: 'X', type: 'string' }, { name: 'Y', type: 'real' }],
                    [],
                );
                view.renderChart(emptyTable, { type: 'columnchart' }, false);
                expect(webview.setContent).toHaveBeenCalledOnce();
                const html = webview.setContent.mock.calls[0]![0] as string;
                const traces = html.match(/var data = (\[[\s\S]*?\]);\s*var layout/);
                expect(traces).toBeTruthy();
                const parsed = JSON.parse(traces![1]!) as { x: unknown[]; y: unknown[] }[];
                expect(parsed[0]!.x).toEqual([]);
                expect(parsed[0]!.y).toEqual([]);
            });

            it('does not call setContent for unsupported chart type', () => {
                view.renderChart(make2dTable(), { type: 'UnknownChart' }, false);
                expect(webview.setContent).not.toHaveBeenCalled();
            });
        });
    });

    // ─── Chart rendering output ─────────────────────────────────────────

    describe('chart rendering', () => {
        let webview: ReturnType<typeof createMockWebView>;
        let view: IChartView;

        beforeEach(() => {
            webview = createMockWebView();
            view = provider.createView(webview);
        });

        /** Helper to render and return the HTML sent to setContent. */
        function renderAndGetHtml(table: ResultTable, options: ChartOptions, darkMode = false): string | undefined {
            view.renderChart(table, options, darkMode);
            if (webview.setContent.mock.calls.length === 0) return undefined;
            return webview.setContent.mock.calls[0]![0] as string;
        }

        /** Helper to parse the Plotly data array from the rendered HTML. */
        function parseTraces(html: string): unknown[] {
            const dataMatch = html.match(/var data = (\[[\s\S]*?\]);\s*var layout/);
            expect(dataMatch).toBeTruthy();
            return JSON.parse(dataMatch![1]!) as unknown[];
        }

        /** Helper to parse the Plotly layout from the rendered HTML. */
        function parseLayout(html: string): Record<string, unknown> {
            const layoutMatch = html.match(/var layout = (\{[\s\S]*?\});\s*var config/);
            expect(layoutMatch).toBeTruthy();
            return JSON.parse(layoutMatch![1]!) as Record<string, unknown>;
        }

        describe('columnchart', () => {
            it('renders bar traces with vertical orientation', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart' });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(1);
                const trace = traces[0] as Record<string, unknown>;
                expect(trace.type).toBe('bar');
                expect(trace.orientation).toBe('v');
                expect(trace.x).toEqual(['A', 'B', 'C']);
                expect(trace.y).toEqual([10, 20, 30]);
            });

            it('renders multiple series as separate traces', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'columnchart' });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(2);
                expect((traces[0] as Record<string, unknown>).name).toBe('Sales');
                expect((traces[1] as Record<string, unknown>).name).toBe('Profit');
            });

            it('respects xColumn and yColumns options', () => {
                const table = makeMultiSeriesTable();
                const html = renderAndGetHtml(table, {
                    type: 'columnchart',
                    xColumn: 'Month',
                    yColumns: ['Profit'],
                });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(1);
                expect((traces[0] as Record<string, unknown>).name).toBe('Profit');
            });
        });

        describe('barchart', () => {
            it('renders bar traces with horizontal orientation', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'barchart' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('bar');
                expect(trace.orientation).toBe('h');
            });
        });

        describe('linechart', () => {
            it('renders scatter traces with lines mode', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'linechart' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('scatter');
                expect(trace.mode).toBe('lines');
            });
        });

        describe('scatterchart', () => {
            it('renders scatter traces with markers mode', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'scatterchart' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('scatter');
                expect(trace.mode).toBe('markers');
            });

            it('applies markerShape to all traces when cycleMarkerShapes is off', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'scatterchart', markerShape: 'diamond' });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(2);
                expect((traces[0] as Record<string, unknown>).marker).toEqual({ symbol: 'diamond' });
                expect((traces[1] as Record<string, unknown>).marker).toEqual({ symbol: 'diamond' });
            });

            it('cycles marker shapes when cycleMarkerShapes is true', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'scatterchart', markerShape: 'diamond', cycleMarkerShapes: true });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(2);
                expect((traces[0] as Record<string, unknown>).marker).toEqual({ symbol: 'diamond' });
                expect((traces[1] as Record<string, unknown>).marker).toEqual({ symbol: 'square' });
            });

            it('does not set marker when markerShape is not specified', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'scatterchart' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.marker).toBeUndefined();
            });

            it('cycles shapes from circle when cycleMarkerShapes is true but no markerShape set', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'scatterchart', cycleMarkerShapes: true });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(2);
                expect((traces[0] as Record<string, unknown>).marker).toEqual({ symbol: 'circle' });
                expect((traces[1] as Record<string, unknown>).marker).toEqual({ symbol: 'diamond' });
            });

            it('applies markerSize preset to scatter traces', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'scatterchart', markerSize: 'Large' });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(2);
                expect((traces[0] as Record<string, unknown>).marker).toEqual({ size: 10 });
                expect((traces[1] as Record<string, unknown>).marker).toEqual({ size: 10 });
            });

            it('applies both markerShape and markerSize', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'scatterchart', markerShape: 'star', markerSize: 'Medium' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.marker).toEqual({ symbol: 'star', size: 8 });
            });
        });

        describe('areachart', () => {
            it('renders scatter traces with fill', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'areachart' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('scatter');
                expect(trace.fill).toBe('tozeroy');
            });

            it('renders stacked area when kind is Stacked', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'areachart', kind: 'Stacked' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.stackgroup).toBe('1');
                expect(trace.fill).toBe('tonexty');
            });
        });

        describe('stackedareachart', () => {
            it('renders stacked area traces', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'stackedareachart' });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                for (const t of traces) {
                    expect((t as Record<string, unknown>).stackgroup).toBe('1');
                }
            });
        });

        describe('piechart', () => {
            it('renders a pie trace with labels and values', () => {
                const html = renderAndGetHtml(makePieTable(), { type: 'piechart' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('pie');
                expect(trace.labels).toEqual(['Apple', 'Banana', 'Cherry']);
                expect(trace.values).toEqual([5, 3, 8]);
            });
        });

        describe('card', () => {
            it('renders an indicator trace with a numeric value', () => {
                const table = makeTable(
                    [{ name: 'Metric', type: 'real' }],
                    [[42]],
                );
                const html = renderAndGetHtml(table, { type: 'card' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('indicator');
                expect(trace.value).toBe(42);
                expect(trace.mode).toBe('number');
            });

            it('returns undefined for table with no numeric column', () => {
                const table = makeTable(
                    [{ name: 'Name', type: 'string' }],
                    [['hello']],
                );
                const html = renderAndGetHtml(table, { type: 'card' });
                expect(html).toBeUndefined();
            });
        });

        describe('treemap', () => {
            it('renders a treemap trace', () => {
                const table = makeTable(
                    [
                        { name: 'Region', type: 'string' },
                        { name: 'Product', type: 'string' },
                        { name: 'Revenue', type: 'real' },
                    ],
                    [
                        ['North', 'Widget', 100],
                        ['North', 'Gadget', 200],
                        ['South', 'Widget', 150],
                    ],
                );
                const html = renderAndGetHtml(table, { type: 'treemap' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('treemap');
                expect(trace.labels).toBeDefined();
                expect((trace.labels as unknown[]).length).toBeGreaterThan(0);
            });
        });

        describe('sankey', () => {
            it('renders a sankey trace with nodes and links', () => {
                const table = makeTable(
                    [
                        { name: 'Source', type: 'string' },
                        { name: 'Target', type: 'string' },
                        { name: 'Flow', type: 'real' },
                    ],
                    [
                        ['A', 'B', 10],
                        ['A', 'C', 20],
                        ['B', 'C', 5],
                    ],
                );
                const html = renderAndGetHtml(table, { type: 'sankey' });
                expect(html).toBeDefined();
                const trace = parseTraces(html!)[0] as Record<string, unknown>;
                expect(trace.type).toBe('sankey');
                const node = trace.node as Record<string, unknown>;
                expect((node.label as string[]).sort()).toEqual(['A', 'B', 'C']);
            });
        });

        describe('anomalychart', () => {
            it('renders line traces with anomaly scatter points', () => {
                const table = makeTable(
                    [
                        { name: 'timestamp', type: 'datetime' },
                        { name: 'value', type: 'real' },
                        { name: 'anomalies', type: 'real' },
                    ],
                    [
                        ['2024-01-01', 10, 0],
                        ['2024-01-02', 20, 1],
                        ['2024-01-03', 15, 0],
                        ['2024-01-04', 50, -1],
                    ],
                );
                const html = renderAndGetHtml(table, {
                    type: 'anomalychart',
                    yColumns: ['value', 'anomalies'],
                    anomalyColumns: ['anomalies'],
                });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                // First trace: line for 'value'
                expect(traces.length).toBe(2);
                const line = traces[0] as Record<string, unknown>;
                expect(line.type).toBe('scatter');
                expect(line.mode).toBe('lines');
                // Second trace: scatter for anomaly points
                const anomaly = traces[1] as Record<string, unknown>;
                expect(anomaly.type).toBe('scatter');
                expect(anomaly.mode).toBe('markers');
                expect(anomaly.x).toEqual(['2024-01-02', '2024-01-04']);
                expect(anomaly.y).toEqual([20, 50]);
            });

            it('falls back to line chart when no anomalyColumns specified', () => {
                const table = makeTable(
                    [
                        { name: 'timestamp', type: 'datetime' },
                        { name: 'value', type: 'real' },
                    ],
                    [
                        ['2024-01-01', 10],
                        ['2024-01-02', 20],
                    ],
                );
                const html = renderAndGetHtml(table, { type: 'anomalychart' });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                expect(traces.length).toBe(1);
                const trace = traces[0] as Record<string, unknown>;
                expect(trace.type).toBe('scatter');
                expect(trace.mode).toBe('lines');
            });

            it('applies markerShape to anomaly scatter points', () => {
                const table = makeTable(
                    [
                        { name: 'timestamp', type: 'datetime' },
                        { name: 'value', type: 'real' },
                        { name: 'anomalies', type: 'real' },
                    ],
                    [
                        ['2024-01-01', 10, 0],
                        ['2024-01-02', 20, 1],
                    ],
                );
                const html = renderAndGetHtml(table, {
                    type: 'anomalychart',
                    yColumns: ['value', 'anomalies'],
                    anomalyColumns: ['anomalies'],
                    markerShape: 'star',
                });
                expect(html).toBeDefined();
                const traces = parseTraces(html!);
                const anomaly = traces[1] as Record<string, unknown>;
                expect(anomaly.marker).toEqual({ symbol: 'star' });
            });
        });

        describe('plotly (raw)', () => {
            it('renders raw Plotly JSON from first cell', () => {
                const plotlyJson = JSON.stringify({
                    data: [{ type: 'bar', x: [1, 2], y: [3, 4] }],
                    layout: { title: 'Raw' },
                });
                const table = makeTable(
                    [{ name: 'plotly_json', type: 'string' }],
                    [[plotlyJson]],
                );
                const html = renderAndGetHtml(table, { type: 'plotly' });
                expect(html).toBeDefined();
                expect(html).toContain('Plotly.newPlot');
                const traces = parseTraces(html!);
                expect((traces[0] as Record<string, unknown>).type).toBe('bar');
            });

            it('returns undefined for invalid JSON', () => {
                const table = makeTable(
                    [{ name: 'plotly_json', type: 'string' }],
                    [['not valid json']],
                );
                const html = renderAndGetHtml(table, { type: 'plotly' });
                expect(html).toBeUndefined();
            });

            it('returns undefined for JSON without data field', () => {
                const table = makeTable(
                    [{ name: 'plotly_json', type: 'string' }],
                    [[JSON.stringify({ layout: {} })]],
                );
                const html = renderAndGetHtml(table, { type: 'plotly' });
                expect(html).toBeUndefined();
            });
        });

        // ─── Chart options ──────────────────────────────────────────────

        describe('chart options', () => {
            it('includes title in layout', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart', title: 'My Chart' });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.title as Record<string, unknown>)?.text).toBe('My Chart');
            });

            it('includes axis titles in layout', () => {
                const html = renderAndGetHtml(make2dTable(), {
                    type: 'columnchart',
                    xTitle: 'Categories',
                    yTitle: 'Values',
                });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.xaxis as Record<string, unknown>)?.title).toEqual(expect.objectContaining({ text: 'Categories' }));
                expect((layout.yaxis as Record<string, unknown>)?.title).toEqual(expect.objectContaining({ text: 'Values' }));
            });

            it('hides legend when showLegend is false', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart', showLegend: false });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect(layout.showlegend).toBe(false);
            });

            it('sets stacked bar mode for Stacked kind', () => {
                const html = renderAndGetHtml(makeMultiSeriesTable(), { type: 'columnchart', kind: 'Stacked' });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect(layout.barmode).toBe('stack');
            });

            it('sets log scale on x axis', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart', xAxis: 'Log' });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.xaxis as Record<string, unknown>)?.type).toBe('log');
            });

            it('sets axis range from xmin/xmax', () => {
                const html = renderAndGetHtml(make2dTable(), {
                    type: 'columnchart',
                    xmin: 0,
                    xmax: 100,
                });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.xaxis as Record<string, unknown>)?.range).toEqual([0, 100]);
            });

            it('sets tick visibility', () => {
                const html = renderAndGetHtml(make2dTable(), {
                    type: 'columnchart',
                    xShowTicks: true,
                    yShowTicks: false,
                });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.xaxis as Record<string, unknown>)?.ticks).toBe('outside');
                expect((layout.yaxis as Record<string, unknown>)?.ticks).toBe('');
            });

            it('sets grid visibility', () => {
                const html = renderAndGetHtml(make2dTable(), {
                    type: 'columnchart',
                    xShowGrid: false,
                    yShowGrid: true,
                });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.xaxis as Record<string, unknown>)?.showgrid).toBe(false);
                expect((layout.yaxis as Record<string, unknown>)?.showgrid).toBe(true);
            });

            it('sets category sort order', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart', sort: 'Ascending' });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect((layout.xaxis as Record<string, unknown>)?.categoryorder).toBe('total ascending');
            });

            it('sets legend position to bottom', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart', legendPosition: 'Bottom' });
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                const legend = layout.legend as Record<string, unknown>;
                expect(legend?.orientation).toBe('h');
            });
        });

        // ─── Dark mode ─────────────────────────────────────────────────

        describe('dark mode', () => {
            it('applies dark mode colors to layout', () => {
                const html = renderAndGetHtml(make2dTable(), { type: 'columnchart' }, true);
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect(layout.paper_bgcolor).toBe('#1e1e1e');
                expect(layout.plot_bgcolor).toBe('#1e1e1e');
                expect((layout.font as Record<string, unknown>)?.color).toBe('#f2f5fa');
            });

            it('applies dark mode to raw Plotly chart layout', () => {
                const plotlyJson = JSON.stringify({
                    data: [{ type: 'bar', x: [1], y: [2] }],
                    layout: { title: 'Test' },
                });
                const table = makeTable(
                    [{ name: 'json', type: 'string' }],
                    [[plotlyJson]],
                );
                const html = renderAndGetHtml(table, { type: 'plotly' }, true);
                expect(html).toBeDefined();
                const layout = parseLayout(html!);
                expect(layout.paper_bgcolor).toBe('#1e1e1e');
            });
        });
    });
});
