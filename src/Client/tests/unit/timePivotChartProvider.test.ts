// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimePivotChartProvider } from '../../features/timePivotChartProvider';
import type { IWebView } from '../../features/webview';
import type { ResultTable, ChartOptions } from '../../features/server';

// ─── Mock IWebView ──────────────────────────────────────────────────────────

function createMockWebView(): IWebView & {
    setup: ReturnType<typeof vi.fn>;
    setContent: ReturnType<typeof vi.fn>;
    invoke: ReturnType<typeof vi.fn>;
} {
    return {
        setup: vi.fn<IWebView['setup']>(),
        setContent: vi.fn<IWebView['setContent']>(),
        invoke: vi.fn<IWebView['invoke']>(),
        handle: vi.fn(() => ({ dispose: () => { } })),
    };
}

// ─── Test Data Helpers ──────────────────────────────────────────────────────

function makeTable(columns: { name: string; type: string }[], rows: unknown[][]): ResultTable {
    return { name: 'TestTable', columns, rows };
}

function defaultOptions(): ChartOptions {
    return { type: 'timepivot' };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('TimePivotChartProvider', () => {
    let provider: TimePivotChartProvider;

    beforeEach(() => {
        provider = new TimePivotChartProvider();
    });

    describe('createView', () => {
        it('returns a view with renderChart and dispose', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            expect(view).toBeDefined();
            expect(typeof view.renderChart).toBe('function');
            expect(typeof view.dispose).toBe('function');

            view.dispose();
        });

        it('does not call webview.setup (no external dependencies)', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.setup).not.toHaveBeenCalled();
        });
    });

    describe('renderChart', () => {
        it('does nothing when table has fewer than 2 columns', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [{ name: 'Time', type: 'datetime' }],
                [['2024-01-01T00:00:00Z']],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).not.toHaveBeenCalled();
            view.dispose();
        });

        it('does nothing when table has no rows', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [{ name: 'Time', type: 'datetime' }, { name: 'Series', type: 'string' }],
                [],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).not.toHaveBeenCalled();
            view.dispose();
        });

        it('does nothing when no datetime column exists', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [{ name: 'Name', type: 'string' }, { name: 'Value', type: 'int' }],
                [['A', 1]],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).not.toHaveBeenCalled();
            view.dispose();
        });

        it('does nothing when no series (non-numeric, non-datetime) column exists', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            // Only datetime and numeric — no string column for series
            const table = makeTable(
                [{ name: 'Time', type: 'datetime' }, { name: 'Value', type: 'real' }],
                [['2024-01-01T00:00:00Z', 42]],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).not.toHaveBeenCalled();
            view.dispose();
        });

        it('renders HTML for valid time-pivot data (range mode)', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [
                    { name: 'Start', type: 'datetime' },
                    { name: 'End', type: 'datetime' },
                    { name: 'Task', type: 'string' },
                ],
                [
                    ['2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z', 'Build'],
                    ['2024-01-02T00:00:00Z', '2024-01-03T00:00:00Z', 'Test'],
                ],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).toHaveBeenCalledTimes(1);
            const html = webview.setContent.mock.calls[0]?.[0] as string;
            expect(html).toContain('Build');
            expect(html).toContain('Test');
            expect(html).toContain('tp-swimlane'); // CSS class from the provider
            view.dispose();
        });

        it('renders HTML for valid time-pivot data (point mode, single datetime)', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [
                    { name: 'Time', type: 'datetime' },
                    { name: 'Event', type: 'string' },
                ],
                [
                    ['2024-01-01T00:00:00Z', 'Deploy'],
                    ['2024-01-02T00:00:00Z', 'Rollback'],
                    ['2024-01-03T00:00:00Z', 'Deploy'],
                ],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).toHaveBeenCalledTimes(1);
            const html = webview.setContent.mock.calls[0]?.[0] as string;
            expect(html).toContain('Deploy');
            expect(html).toContain('Rollback');
            view.dispose();
        });

        it('renders with explicit seriesColumns option', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [
                    { name: 'Time', type: 'datetime' },
                    { name: 'Category', type: 'string' },
                    { name: 'SubCategory', type: 'string' },
                ],
                [
                    ['2024-01-01T00:00:00Z', 'A', 'X'],
                    ['2024-01-02T00:00:00Z', 'B', 'Y'],
                ],
            );
            const options: ChartOptions = { type: 'timepivot', seriesColumns: ['Category'] };
            view.renderChart(table, options, false);

            expect(webview.setContent).toHaveBeenCalledTimes(1);
            const html = webview.setContent.mock.calls[0]?.[0] as string;
            expect(html).toContain('A');
            expect(html).toContain('B');
            view.dispose();
        });

        it('does nothing when all rows have null start times', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            const table = makeTable(
                [
                    { name: 'Time', type: 'datetime' },
                    { name: 'Series', type: 'string' },
                ],
                [
                    [null, 'A'],
                    [null, 'B'],
                ],
            );
            view.renderChart(table, defaultOptions(), false);

            expect(webview.setContent).not.toHaveBeenCalled();
            view.dispose();
        });

        it('does nothing when all datetimes are the same (zero range)', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            // Point mode with identical timestamps → globalMin === globalMax → zero range
            const table = makeTable(
                [
                    { name: 'Time', type: 'datetime' },
                    { name: 'Series', type: 'string' },
                ],
                [
                    ['2024-01-01T00:00:00Z', 'A'],
                    ['2024-01-01T00:00:00Z', 'B'],
                ],
            );
            view.renderChart(table, defaultOptions(), false);

            // globalMin >= globalMax → returns undefined, so no setContent
            expect(webview.setContent).not.toHaveBeenCalled();
            view.dispose();
        });
    });
});
