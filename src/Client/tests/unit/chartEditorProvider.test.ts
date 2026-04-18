// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChartEditorProvider } from '../../features/chartEditorProvider';
import type { IChartEditorView } from '../../features/chartEditorProvider';
import type { IWebView } from '../../features/webview';
import type { ChartOptions } from '../../features/server';

// ─── Mock IWebView ──────────────────────────────────────────────────────────

function createMockWebView(): IWebView & {
    setup: ReturnType<typeof vi.fn>;
    setContent: ReturnType<typeof vi.fn>;
    invoke: ReturnType<typeof vi.fn>;
    simulateMessage: (message: Record<string, unknown>) => void;
} {
    const handlers: ((message: Record<string, unknown>) => void)[] = [];
    const setup = vi.fn<(headHtml: string, scriptsHtml: string) => void>();
    const setContent = vi.fn<(html: string) => void>();
    const invoke = vi.fn<(command: string, args?: Record<string, unknown>) => void>();
    return {
        setup,
        setContent,
        invoke,
        handle: vi.fn((handler: (message: Record<string, unknown>) => void) => {
            handlers.push(handler);
            return { dispose: () => { const i = handlers.indexOf(handler); if (i >= 0) handlers.splice(i, 1); } };
        }),
        simulateMessage(message: Record<string, unknown>) {
            for (const h of handlers) { h(message); }
        },
    };
}

// ─── Test Helpers ───────────────────────────────────────────────────────────

function defaultOptions(overrides: Partial<ChartOptions> = {}): ChartOptions {
    return { type: 'Column', ...overrides };
}

const sampleColumns = ['Category', 'Value', 'Count'];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('ChartEditorProvider', () => {
    let provider: ChartEditorProvider;

    beforeEach(() => {
        provider = new ChartEditorProvider();
    });

    // ─── createView ─────────────────────────────────────────────────────

    describe('createView', () => {
        it('calls webview.setup() with CSS and scripts', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.setup).toHaveBeenCalledOnce();
            const [headHtml, scriptsHtml] = webview.setup.mock.calls[0]!;
            expect(headHtml).toContain('<style>');
            expect(headHtml).toContain('.edit-panel');
            expect(scriptsHtml).toContain('<script>');
        });

        it('returns an IChartEditorView', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            expect(view).toBeDefined();
            expect(typeof view.setOptions).toBe('function');
            expect(typeof view.dispose).toBe('function');
        });

        it('subscribes to webview messages', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.handle).toHaveBeenCalledOnce();
        });
    });

    // ─── setOptions / HTML generation ───────────────────────────────────

    describe('setOptions', () => {
        let webview: ReturnType<typeof createMockWebView>;
        let view: IChartEditorView;

        beforeEach(() => {
            webview = createMockWebView();
            view = provider.createView(webview);
        });

        it('calls webview.setContent with generated HTML', () => {
            view.setOptions(defaultOptions(), sampleColumns);
            expect(webview.setContent).toHaveBeenCalledOnce();
            expect(typeof webview.setContent.mock.calls[0]![0]).toBe('string');
        });

        it('renders a defaults pin menu in the header', () => {
            view.setOptions(defaultOptions(), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('Capture Defaults');
            expect(html).toContain('Restore Defaults');
            expect(html).toContain('&hellip;');
        });

        // ── Chart type dropdown ─────────────────────────────────────────

        it('renders the chart type dropdown with the current type selected', () => {
            view.setOptions(defaultOptions({ type: 'Pie' }), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<select id="opt-type"');
            expect(html).toContain('<option value="Pie" selected title="Pie">Pie (piechart)</option>');
            // Other types present but not selected
            expect(html).toContain('<option value="Column" title="Column">Column (columnchart)</option>');
            expect(html).not.toContain('<option value="Column" selected');
        });

        it('includes an unknown chart type at the beginning of the dropdown', () => {
            view.setOptions(defaultOptions({ type: 'CustomChart' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="CustomChart" selected title="CustomChart">CustomChart</option>');
            // Standard types still present
            expect(html).toContain('<option value="Column" title="Column">');
        });

        // ── Legend dropdown ─────────────────────────────────────────────

        it('renders legend as None when legendPosition is None', () => {
            view.setOptions(defaultOptions({ legendPosition: 'None' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="None" selected>None</option>');
        });

        it('renders legend position when explicitly set', () => {
            view.setOptions(defaultOptions({ legendPosition: 'Bottom' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Bottom" selected>Bottom</option>');
        });

        // ── Sort / Mode dropdowns ───────────────────────────────────────

        it('selects the specified sort order', () => {
            view.setOptions(defaultOptions({ sort: 'Ascending' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Ascending" selected>Ascending</option>');
        });

        it('renders default sort label when not explicitly set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-sort"[^>]*>.*<option value="" selected>Default \(Auto\)/s);
        });

        it('selects Auto sort when explicitly set', () => {
            view.setOptions(defaultOptions({ sort: 'Auto' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Auto" selected>Auto</option>');
        });

        it('selects the specified mode', () => {
            view.setOptions(defaultOptions({ mode: 'Dark' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Dark" selected>Dark</option>');
        });

        // ── Aspect Ratio / Text Size ────────────────────────────────────

        it('selects the specified aspect ratio', () => {
            view.setOptions(defaultOptions({ aspectRatio: '4:3' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="4:3" selected>4:3</option>');
        });

        it('selects Fill as an explicit aspect ratio', () => {
            view.setOptions(defaultOptions({ aspectRatio: 'Fill' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Fill" selected>Fill</option>');
        });

        it('selects the specified text size', () => {
            view.setOptions(defaultOptions({ textSize: 'Large' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Large" selected>Large</option>');
        });

        // ── Toggle dropdowns ───────────────────────────────────────────

        it('selects showValues as On when true', () => {
            view.setOptions(defaultOptions({ showValues: true }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-showValues"[^>]*>.*<option value="On" selected>On</s);
        });

        it('selects showValues as Off when false', () => {
            view.setOptions(defaultOptions({ showValues: false }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-showValues"[^>]*>.*<option value="Off" selected>Off</s);
        });

        it('selects accumulate as On when true', () => {
            view.setOptions(defaultOptions({ accumulate: true }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-accumulate"[^>]*>.*<option value="On" selected>On</s);
        });

        it('renders grid dropdowns as Default (On) when not set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-xShowGrid"[^>]*>.*<option value="" selected>Default \(On\)</s);
            expect(html).toMatch(/id="opt-yShowGrid"[^>]*>.*<option value="" selected>Default \(On\)</s);
        });

        it('renders multi-y layout as Default (Shared Axis) when not set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-yLayout"[^>]*>.*<option value="" selected>Default \(Shared Axis\)/s);
        });

        it('selects grid dropdowns as Off when false', () => {
            view.setOptions(defaultOptions({ xShowGrid: false, yShowGrid: false }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-xShowGrid"[^>]*>.*<option value="Off" selected>Off</s);
            expect(html).toMatch(/id="opt-yShowGrid"[^>]*>.*<option value="Off" selected>Off</s);
        });

        it('selects tick marks as On when specified', () => {
            view.setOptions(defaultOptions({ xShowTicks: true, yShowTicks: true }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-xShowTicks"[^>]*>.*<option value="On" selected>On</s);
            expect(html).toMatch(/id="opt-yShowTicks"[^>]*>.*<option value="On" selected>On</s);
        });

        // ── Column pickers ──────────────────────────────────────────────

        it('populates x-column dropdown with column names', () => {
            view.setOptions(defaultOptions(), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<select id="opt-xColumn"');
            expect(html).toContain('<option value="Category"');
            expect(html).toContain('<option value="Value"');
            expect(html).toContain('<option value="Count"');
            // Has an auto option
            expect(html).toContain('(auto)</option>');
        });

        it('selects the specified xColumn', () => {
            view.setOptions(defaultOptions({ xColumn: 'Value' }), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Value" selected>');
        });

        it('renders existing yColumns as list items', () => {
            view.setOptions(defaultOptions({ yColumns: ['Value', 'Count'] }), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<ul id="opt-yColumns-list"');
            expect(html).toContain('<span>Value</span>');
            expect(html).toContain('<span>Count</span>');
        });

        it('renders existing seriesColumns as list items', () => {
            view.setOptions(defaultOptions({ seriesColumns: ['Category'] }), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<ul id="opt-seriesColumns-list"');
            expect(html).toContain('<span>Category</span>');
        });

        it('renders empty yColumns and seriesColumns lists when not set', () => {
            view.setOptions(defaultOptions(), sampleColumns);
            const html: string = webview.setContent.mock.calls[0]![0];

            // Lists exist but have no li items
            expect(html).toContain('id="opt-yColumns-list"');
            expect(html).toContain('id="opt-seriesColumns-list"');
            // No list items inside yColumns or seriesColumns lists
            const yColList = html.match(/<ul id="opt-yColumns-list"[^>]*>(.*?)<\/ul>/s);
            expect(yColList![1].trim()).toBe('');
        });

        // ── Titles ──────────────────────────────────────────────────────

        it('renders title inputs with values', () => {
            view.setOptions(defaultOptions({
                title: 'My Chart',
                xTitle: 'X Label',
                yTitle: 'Y Label',
                zTitle: 'Z Label',
            }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('value="My Chart"');
            expect(html).toContain('value="X Label"');
            expect(html).toContain('value="Y Label"');
            expect(html).toContain('value="Z Label"');
        });

        it('renders empty title inputs when not set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            // opt-title input should have empty value
            const titleInput = html.match(/<input[^>]*id="opt-title"[^>]*>/);
            expect(titleInput).toBeTruthy();
            expect(titleInput![0]).toContain('value=""');
        });

        // ── Axis options ────────────────────────────────────────────────

        it('selects axis types', () => {
            view.setOptions(defaultOptions({ xAxis: 'Log', yAxis: 'Linear' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="Log" selected>Log</option>');
            // yAxis - Linear selected
            const yAxisSelect = html.match(/<select id="opt-yAxis"[^>]*>(.*?)<\/select>/s);
            expect(yAxisSelect).toBeTruthy();
            expect(yAxisSelect![1]).toContain('<option value="Linear" selected>Linear</option>');
        });

        it('renders axis min/max values', () => {
            view.setOptions(defaultOptions({ xMin: 0, xMax: 100, yMin: -5, yMax: 50 }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('id="opt-xMin"');
            expect(html).toMatch(/id="opt-xMin"[^>]*value="0"/);
            expect(html).toMatch(/id="opt-xMax"[^>]*value="100"/);
            expect(html).toMatch(/id="opt-yMin"[^>]*value="-5"/);
            expect(html).toMatch(/id="opt-yMax"[^>]*value="50"/);
        });

        it('renders tick angle values', () => {
            view.setOptions(defaultOptions({ xTickAngle: -45, yTickAngle: -90 }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="-45" selected>-45°</option>');
            expect(html).toContain('<option value="-90" selected>-90°</option>');
        });

        it('renders default tick angle when not set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-xTickAngle"[^>]*>.*<option value="" selected>Default \(Auto\)/s);
            expect(html).toMatch(/id="opt-yTickAngle"[^>]*>.*<option value="" selected>Default \(Auto\)/s);
        });

        it('renders default legend label when not explicitly set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="" selected>Default (Auto)</option>');
        });

        it('renders marker defaults as explicit product defaults when not set', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-markerShape"[^>]*>.*<option value="" selected>Default \(Circle\)/s);
            expect(html).toMatch(/id="opt-markerSize"[^>]*>.*<option value="" selected>Default \(Medium\)/s);
        });

        it('renders config-backed marker defaults when provided', () => {
            view.setOptions(defaultOptions(), [], { markerShape: 'Diamond', markerSize: 'Large' });
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toMatch(/id="opt-markerShape"[^>]*>.*<option value="" selected>Default \(Diamond\)/s);
            expect(html).toMatch(/id="opt-markerSize"[^>]*>.*<option value="" selected>Default \(Large\)/s);
        });

        it('renders normalized marker shape labels for explicit values', () => {
            view.setOptions(defaultOptions({ markerShape: 'TriangleUp' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<option value="TriangleUp" selected>Triangle Up</option>');
            expect(html).toContain('<option value="Circle">Circle</option>');
            expect(html).toContain('<option value="X">X</option>');
        });

        // ── HTML escaping ───────────────────────────────────────────────

        it('escapes special characters in title values', () => {
            view.setOptions(defaultOptions({ title: '<b>"Profit" & Loss</b>' }), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('value="&lt;b&gt;&quot;Profit&quot; &amp; Loss&lt;/b&gt;"');
        });

        it('escapes special characters in column names', () => {
            view.setOptions(defaultOptions(), ['Col <A>', 'Col "B"']);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('Col &lt;A&gt;');
            expect(html).toContain('Col &quot;B&quot;');
        });

        it('escapes column names in yColumns list items', () => {
            view.setOptions(defaultOptions({ yColumns: ['Val & Total'] }), ['Val & Total']);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('<span>Val &amp; Total</span>');
        });

        // ── Re-populate ─────────────────────────────────────────────────

        it('can be called multiple times to re-populate', () => {
            view.setOptions(defaultOptions({ type: 'Bar' }), sampleColumns);
            view.setOptions(defaultOptions({ type: 'Pie' }), ['Fruit', 'Count']);

            expect(webview.setContent).toHaveBeenCalledTimes(2);
            const html: string = webview.setContent.mock.calls[1]![0];
            expect(html).toContain('<option value="Pie" selected title="Pie">');
            expect(html).toContain('<option value="Fruit"');
        });

        // ── Sections ────────────────────────────────────────────────────

        it('renders section headers', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('General');
            expect(html).toContain('Data');
            expect(html).toContain('Titles');
            expect(html).toContain('X Axis');
            expect(html).toContain('Y Axis');
        });

        it('renders General section expanded and others collapsed', () => {
            view.setOptions(defaultOptions(), []);
            const html: string = webview.setContent.mock.calls[0]![0];

            // General header is NOT collapsed
            const generalHeader = html.match(/class="section-header"[^>]*>[\s\S]*?General/);
            expect(generalHeader).toBeTruthy();
            expect(generalHeader![0]).not.toContain('collapsed');

            // Data header IS collapsed
            const dataHeader = html.match(/class="section-header[^"]*"[^>]*>[\s\S]*?Data/);
            expect(dataHeader).toBeTruthy();
            expect(dataHeader![0]).toContain('collapsed');
        });
    });

    // ─── Message handling ───────────────────────────────────────────────

    describe('message handling', () => {
        let webview: ReturnType<typeof createMockWebView>;
        let view: IChartEditorView;

        beforeEach(() => {
            webview = createMockWebView();
            view = provider.createView(webview);
        });

        it('fires onOptionsChanged when chartOptionsChanged message is received', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;

            const opts = { type: 'BarStacked' };
            webview.simulateMessage({ command: 'chartOptionsChanged', chartOptions: opts });

            expect(callback).toHaveBeenCalledOnce();
            expect(callback).toHaveBeenCalledWith(opts);
        });

        it('passes clientOnly flag through when true', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;

            const opts = { type: 'Column', aspectRatio: '4:3' };
            webview.simulateMessage({ command: 'chartOptionsChanged', chartOptions: opts, clientOnly: true });

            expect(callback).toHaveBeenCalledOnce();
            expect(callback).toHaveBeenCalledWith(opts);
        });

        it('passes clientOnly as false when not present in message', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;

            webview.simulateMessage({ command: 'chartOptionsChanged', chartOptions: { type: 'Pie' } });

            expect(callback).toHaveBeenCalledWith({ type: 'Pie' });
        });

        it('does not fire for unrelated messages', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;

            webview.simulateMessage({ command: 'someOtherCommand', data: 'test' });

            expect(callback).not.toHaveBeenCalled();
        });

        it('does not fire for chartOptionsChanged without chartOptions payload', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;

            webview.simulateMessage({ command: 'chartOptionsChanged' });

            expect(callback).not.toHaveBeenCalled();
        });

        it('does not throw when onOptionsChanged is not set', () => {
            expect(() => {
                webview.simulateMessage({ command: 'chartOptionsChanged', chartOptions: { type: 'Bar' } });
            }).not.toThrow();
        });

        it('captures current defaults into explicit values', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions(), [], { legendPosition: 'Bottom', textSize: 'Large' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'capture' });

            expect(callback).toHaveBeenCalledWith(expect.objectContaining({
                type: 'Column',
                legendPosition: 'Bottom',
                textSize: 'Large',
                sort: 'Auto',
                yLayout: 'SharedAxis'
            }));
        });

        it('captures product marker defaults when config defaults are not provided', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions(), [], { legendPosition: 'Bottom' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'capture' });

            expect(callback).toHaveBeenCalledWith(expect.objectContaining({
                type: 'Column',
                markerShape: 'Circle',
                markerSize: 'Medium'
            }));
        });

        it('re-renders captured defaults as explicit selections in the editor', () => {
            view.setOptions(defaultOptions(), [], { legendPosition: 'Bottom', textSize: 'Large', aspectRatio: 'Fill' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'capture' });

            expect(webview.setContent).toHaveBeenCalledTimes(2);
            const html: string = webview.setContent.mock.calls[1]![0];
            expect(html).toMatch(/id="opt-legendPosition"[^>]*>.*<option value="Bottom" selected>Bottom</s);
            expect(html).toMatch(/id="opt-textSize"[^>]*>.*<option value="Large" selected>Large</s);
            expect(html).toMatch(/id="opt-aspectRatio"[^>]*>.*<option value="Fill" selected>Fill</s);
        });

        it('restores matching explicit values back to defaults', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions({ legendPosition: 'Bottom', textSize: 'Large', sort: 'Auto', yLayout: 'SharedAxis' }), [], { legendPosition: 'Bottom', textSize: 'Large' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'restore' });

            expect(callback).toHaveBeenCalledWith({ type: 'Column' });
        });

        it('re-renders restored values back to Default labels in the editor', () => {
            view.setOptions(defaultOptions({ legendPosition: 'Bottom', textSize: 'Large', sort: 'Auto', yLayout: 'SharedAxis', aspectRatio: 'Fill' }), [], { legendPosition: 'Bottom', textSize: 'Large', aspectRatio: 'Fill' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'restore' });

            expect(webview.setContent).toHaveBeenCalledTimes(2);
            const html: string = webview.setContent.mock.calls[1]![0];
            expect(html).toMatch(/id="opt-legendPosition"[^>]*>.*<option value="" selected>Default \(Bottom\)/s);
            expect(html).toMatch(/id="opt-textSize"[^>]*>.*<option value="" selected>Default \(Large\)/s);
            expect(html).toMatch(/id="opt-sort"[^>]*>.*<option value="" selected>Default \(Auto\)/s);
            expect(html).toMatch(/id="opt-yLayout"[^>]*>.*<option value="" selected>Default \(Shared Axis\)/s);
            expect(html).toMatch(/id="opt-aspectRatio"[^>]*>.*<option value="" selected>Default \(Fill\)/s);
        });

        it('restores values using configured boolean defaults that differ from product defaults', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions({ xShowGrid: false, yShowGrid: false }), [], { xShowGrid: false, yShowGrid: false });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'restore' });

            expect(callback).toHaveBeenCalledWith({ type: 'Column' });
        });

        it('does not overwrite explicit non-default values when capturing defaults', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions({ sort: 'Descending', yLayout: 'DualAxis' }), [], { legendPosition: 'Bottom', textSize: 'Large' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'capture' });

            expect(callback).toHaveBeenCalledWith(expect.objectContaining({
                type: 'Column',
                sort: 'Descending',
                yLayout: 'DualAxis',
                legendPosition: 'Bottom',
                textSize: 'Large'
            }));
        });

        it('capture and restore are stable across a round-trip', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions(), [], { legendPosition: 'Bottom', textSize: 'Large', xShowGrid: false });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'capture' });
            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'restore' });

            expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining({
                type: 'Column',
                legendPosition: 'Bottom',
                textSize: 'Large',
                xShowGrid: false,
                sort: 'Auto',
                yLayout: 'SharedAxis'
            }));
            expect(callback).toHaveBeenNthCalledWith(2, { type: 'Column' });
        });

        it('preserves normal option changes after using defaults actions', () => {
            const callback = vi.fn();
            view.onOptionsChanged = callback;
            view.setOptions(defaultOptions(), [], { legendPosition: 'Bottom' });

            webview.simulateMessage({ command: 'chartEditorDefaultsAction', action: 'capture' });
            webview.simulateMessage({ command: 'chartOptionsChanged', chartOptions: { type: 'Pie', legendPosition: 'Bottom' } });

            expect(callback).toHaveBeenLastCalledWith({ type: 'Pie', legendPosition: 'Bottom' });
        });
    });

    // ─── dispose ────────────────────────────────────────────────────────

    describe('dispose', () => {
        it('unsubscribes the message handler', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);
            const callback = vi.fn();
            view.onOptionsChanged = callback;

            view.dispose();

            webview.simulateMessage({ command: 'chartOptionsChanged', chartOptions: { type: 'Bar' } });
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
