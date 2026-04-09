// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimpleDataTableProvider } from '../../features/dataTableProvider';
import type { IDataTableView } from '../../features/dataTableProvider';
import type { IWebView } from '../../features/webview';
import type { ResultTable } from '../../features/server';

// ─── Mock IWebView ──────────────────────────────────────────────────────────

function createMockWebView(): IWebView & {
    setup: ReturnType<typeof vi.fn>;
    setContent: ReturnType<typeof vi.fn>;
    invoke: ReturnType<typeof vi.fn>;
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

// ─── Test Helpers ───────────────────────────────────────────────────────────

function makeTable(columns: { name: string; type: string }[], rows: unknown[][]): ResultTable {
    return { name: 'TestTable', columns, rows };
}

function make2dTable(): ResultTable {
    return makeTable(
        [{ name: 'Category', type: 'string' }, { name: 'Value', type: 'real' }],
        [['A', 10], ['B', 20], ['C', 30]],
    );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('SimpleDataTableProvider', () => {
    let provider: SimpleDataTableProvider;

    beforeEach(() => {
        provider = new SimpleDataTableProvider();
    });

    // ─── createView ─────────────────────────────────────────────────────

    describe('createView', () => {
        it('calls webview.setup() with CDN link and CSS', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.setup).toHaveBeenCalledOnce();
            const [headHtml, scriptsHtml] = webview.setup.mock.calls[0]!;
            expect(headHtml).toContain('simple-datatables');
            expect(headHtml).toContain('<style>');
            expect(headHtml).toContain('.datatable-wrapper');
            expect(scriptsHtml).toBe('');
        });

        it('returns an IDataTableView', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            expect(view).toBeDefined();
            expect(typeof view.renderTable).toBe('function');
            expect(typeof view.copyCell).toBe('function');
            expect(typeof view.toggleSearch).toBe('function');
            expect(typeof view.setExpression).toBe('function');
            expect(typeof view.dispose).toBe('function');
        });

        it('subscribes to webview messages', () => {
            const webview = createMockWebView();
            provider.createView(webview);

            expect(webview.handle).toHaveBeenCalledOnce();
        });
    });

    // ─── renderTable ────────────────────────────────────────────────────

    describe('renderTable', () => {
        let webview: ReturnType<typeof createMockWebView>;
        let view: IDataTableView;

        beforeEach(() => {
            webview = createMockWebView();
            view = provider.createView(webview);
        });

        it('calls webview.setContent with HTML containing a table and script', () => {
            view.renderTable(make2dTable());

            expect(webview.setContent).toHaveBeenCalledOnce();
            const html: string = webview.setContent.mock.calls[0]![0];
            expect(html).toContain('<table>');
            expect(html).toContain('<script>');
        });

        it('embeds column names in the content', () => {
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('Category');
            expect(html).toContain('Value');
        });

        it('embeds row data in the content', () => {
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('"A"');
            expect(html).toContain('"10"');
            expect(html).toContain('"20"');
        });

        it('formats null and undefined as empty strings', () => {
            const table = makeTable(
                [{ name: 'Col', type: 'string' }],
                [[null], [undefined]],
            );
            view.renderTable(table);
            const html: string = webview.setContent.mock.calls[0]![0];

            // Both null and undefined become empty strings in the JSON
            expect(html).toContain('""');
        });

        it('formats objects as JSON strings', () => {
            const table = makeTable(
                [{ name: 'Col', type: 'dynamic' }],
                [[{ a: 1 }]],
            );
            view.renderTable(table);
            const html: string = webview.setContent.mock.calls[0]![0];

            // formatCellValue produces '{"a":1}', then JSON.stringify double-encodes it
            expect(html).toContain('{\\\"a\\\":1}');
        });

        it('escapes closing script tags in JSON data', () => {
            const table = makeTable(
                [{ name: 'Col', type: 'string' }],
                [['</script>']],
            );
            view.renderTable(table);
            const html: string = webview.setContent.mock.calls[0]![0];

            // The </ in JSON data must be escaped to prevent premature script closing
            expect(html).not.toContain('</script>');
        });

        it('includes Simple-DataTables initialization in the script', () => {
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('simpleDatatables.DataTable');
            expect(html).toContain('perPage');
        });

        it('includes container-relative DOM queries in the script', () => {
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('document.currentScript.parentElement');
            expect(html).toContain('container.querySelector');
        });

        it('can be called multiple times to re-render', () => {
            const table1 = makeTable([{ name: 'A', type: 'string' }], [['x']]);
            const table2 = makeTable([{ name: 'B', type: 'string' }], [['y']]);

            view.renderTable(table1);
            view.renderTable(table2);

            expect(webview.setContent).toHaveBeenCalledTimes(2);
            const html2: string = webview.setContent.mock.calls[1]![0];
            expect(html2).toContain('"B"');
        });

        it('includes cleanup support for re-render', () => {
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('_dtCleanup');
        });
    });

    // ─── invoke methods ─────────────────────────────────────────────────

    describe('copyCell', () => {
        it('invokes copyCell command on the webview', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            view.copyCell();

            expect(webview.invoke).toHaveBeenCalledWith('copyCell');
        });
    });

    describe('toggleSearch', () => {
        it('invokes toggleSearch command on the webview', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            view.toggleSearch();

            expect(webview.invoke).toHaveBeenCalledWith('toggleSearch');
        });
    });

    describe('setExpression', () => {
        it('invokes setExpression with expression on the webview', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            view.setExpression('datatable(x:int)[1,2,3]');

            expect(webview.invoke).toHaveBeenCalledWith('setExpression', { expression: 'datatable(x:int)[1,2,3]' });
        });
    });

    // ─── message handling ───────────────────────────────────────────────

    describe('message handling', () => {
        let webview: ReturnType<typeof createMockWebView>;
        let view: IDataTableView;
        let token: string;

        beforeEach(() => {
            webview = createMockWebView();
            view = provider.createView(webview);
            // Extract the token from the rendered content
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];
            const match = html.match(/var token = '(dt-[a-z0-9]+)'/);
            token = match![1]!;
        });

        it('fires onCopyText when copyText message matches token', () => {
            const callback = vi.fn();
            view.onCopyText = callback;

            webview.simulateMessage({ command: 'copyText', text: 'hello', _token: token });

            expect(callback).toHaveBeenCalledOnce();
            expect(callback).toHaveBeenCalledWith('hello');
        });

        it('does not fire onCopyText for mismatched token', () => {
            const callback = vi.fn();
            view.onCopyText = callback;

            webview.simulateMessage({ command: 'copyText', text: 'hello', _token: 'wrong-token' });

            expect(callback).not.toHaveBeenCalled();
        });

        it('fires onRequestExpression when requestExpression message matches token', () => {
            const callback = vi.fn();
            view.onRequestExpression = callback;

            webview.simulateMessage({ command: 'requestExpression', _token: token });

            expect(callback).toHaveBeenCalledOnce();
        });

        it('does not fire onRequestExpression for mismatched token', () => {
            const callback = vi.fn();
            view.onRequestExpression = callback;

            webview.simulateMessage({ command: 'requestExpression', _token: 'wrong-token' });

            expect(callback).not.toHaveBeenCalled();
        });

        it('does not fire for unrelated messages', () => {
            const copyCallback = vi.fn();
            const exprCallback = vi.fn();
            view.onCopyText = copyCallback;
            view.onRequestExpression = exprCallback;

            webview.simulateMessage({ command: 'someOtherCommand', _token: token });

            expect(copyCallback).not.toHaveBeenCalled();
            expect(exprCallback).not.toHaveBeenCalled();
        });

        it('does not throw when callbacks are not set', () => {
            expect(() => {
                webview.simulateMessage({ command: 'copyText', text: 'hello', _token: token });
                webview.simulateMessage({ command: 'requestExpression', _token: token });
            }).not.toThrow();
        });
    });

    // ─── token uniqueness ───────────────────────────────────────────────

    describe('token scoping', () => {
        it('generates unique tokens for different views', () => {
            const webview1 = createMockWebView();
            const webview2 = createMockWebView();
            const view1 = provider.createView(webview1);
            const view2 = provider.createView(webview2);

            view1.renderTable(make2dTable());
            view2.renderTable(make2dTable());

            const html1: string = webview1.setContent.mock.calls[0]![0];
            const html2: string = webview2.setContent.mock.calls[0]![0];

            const match1 = html1.match(/var token = '(dt-[a-z0-9]+)'/);
            const match2 = html2.match(/var token = '(dt-[a-z0-9]+)'/);

            expect(match1![1]).not.toBe(match2![1]);
        });

        it('only the matching view fires callbacks when sharing a webview', () => {
            const webview = createMockWebView();
            const view1 = provider.createView(webview);
            const view2 = provider.createView(webview);

            view1.renderTable(make2dTable());
            // Extract token from first view
            const html1: string = webview.setContent.mock.calls[0]![0];
            const match1 = html1.match(/var token = '(dt-[a-z0-9]+)'/);
            const token1 = match1![1]!;

            const callback1 = vi.fn();
            const callback2 = vi.fn();
            view1.onCopyText = callback1;
            view2.onCopyText = callback2;

            // Send with view1's token — only view1 should fire
            webview.simulateMessage({ command: 'copyText', text: 'test', _token: token1 });

            expect(callback1).toHaveBeenCalledOnce();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

    // ─── dispose ────────────────────────────────────────────────────────

    describe('dispose', () => {
        it('unsubscribes the message handler', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];
            const match = html.match(/var token = '(dt-[a-z0-9]+)'/);
            const token = match![1]!;

            const callback = vi.fn();
            view.onCopyText = callback;

            view.dispose();

            webview.simulateMessage({ command: 'copyText', text: 'hello', _token: token });
            expect(callback).not.toHaveBeenCalled();
        });
    });

    // ─── in-page script content ─────────────────────────────────────────

    describe('in-page script', () => {
        it('includes row selection handling', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('row-selected');
        });

        it('includes drag-drop support', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('dragstart');
            expect(html).toContain('draggable');
        });

        it('includes context menu tracking for copyCell', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('contextmenu');
            expect(html).toContain('lastContextTarget');
        });

        it('checks active class before responding to commands', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain("container.classList.contains('active')");
        });

        it('includes search toggle support', () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);
            view.renderTable(make2dTable());
            const html: string = webview.setContent.mock.calls[0]![0];

            expect(html).toContain('toggleSearch');
            expect(html).toContain('search-visible');
        });
    });
});
