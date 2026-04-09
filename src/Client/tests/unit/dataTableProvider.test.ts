// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataTableProvider } from '../../features/dataTableProvider';
import type { IDataTableView } from '../../features/dataTableProvider';
import type { IWebView } from '../../features/webview';
import { NullServer } from '../../features/server';
import type { IServer, ResultTable } from '../../features/server';
import type { IClipboard } from '../../features/clipboard';

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

function createMockServer(getTableAsExpression?: (table: ResultTable) => Promise<string | null>): IServer {
    const server = new NullServer();
    if (getTableAsExpression) {
        server.getTableAsExpression = getTableAsExpression;
    }
    return server;
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
    let provider: DataTableProvider;
    let clipboard: IClipboard;

    beforeEach(() => {
        clipboard = {
            setContext: vi.fn(),
            getContext: vi.fn(),
            clearContext: vi.fn(),
            copyItems: vi.fn(),
            copyText: vi.fn(),
        };
        provider = new DataTableProvider(new NullServer(), clipboard);
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

    describe('expression resolver', () => {
        it('calls the server with the table after renderTable', async () => {
            const mockGetExpr = vi.fn(async () => 'datatable(x:int)[1]');
            const p = new DataTableProvider(createMockServer(mockGetExpr), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);
            const table = make2dTable();

            view.renderTable(table);
            await Promise.resolve();

            expect(mockGetExpr).toHaveBeenCalledWith(table);
            expect(webview.invoke).toHaveBeenCalledWith('setExpression', { expression: 'datatable(x:int)[1]' });
        });

        it('calls the server on requestExpression message', async () => {
            const mockGetExpr = vi.fn(async () => 'expr');
            const p = new DataTableProvider(createMockServer(mockGetExpr), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);
            view.renderTable(make2dTable());

            await Promise.resolve();
            webview.invoke.mockClear();
            mockGetExpr.mockClear();

            const html: string = webview.setContent.mock.calls[0]![0];
            const match = html.match(/var token = '(dt-[a-z0-9]+)'/);
            const token = match![1]!;

            webview.simulateMessage({ command: 'requestExpression', _token: token });
            await Promise.resolve();

            expect(mockGetExpr).toHaveBeenCalledOnce();
            expect(webview.invoke).toHaveBeenCalledWith('setExpression', { expression: 'expr' });
        });

        it('does not invoke setExpression when server returns null', async () => {
            const p = new DataTableProvider(createMockServer(async () => null), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);

            view.renderTable(make2dTable());
            await Promise.resolve();

            expect(webview.invoke).not.toHaveBeenCalledWith('setExpression', expect.anything());
        });

        it('does not throw when server rejects', async () => {
            const p = new DataTableProvider(createMockServer(async () => { throw new Error('server error'); }), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);

            view.renderTable(make2dTable());
            await Promise.resolve();
            // no error thrown
        });

        it('does not invoke setExpression when server returns null (NullServer)', async () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            view.renderTable(make2dTable());
            await Promise.resolve();

            expect(webview.invoke).not.toHaveBeenCalledWith('setExpression', expect.anything());
        });

        it('does not call server before renderTable', async () => {
            const mockGetExpr = vi.fn(async () => 'expr');
            const p = new DataTableProvider(createMockServer(mockGetExpr), clipboard);
            const webview = createMockWebView();
            p.createView(webview);

            await Promise.resolve();

            expect(mockGetExpr).not.toHaveBeenCalled();
        });
    });

    // ─── copyTableAsExpression ────────────────────────────────────────

    describe('copyTableAsExpression', () => {
        it('copies expression to clipboard', async () => {
            const mockGetExpr = vi.fn(async () => 'datatable(x:int)[1]');
            const p = new DataTableProvider(createMockServer(mockGetExpr), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);
            const table = make2dTable();

            view.renderTable(table);
            await view.copyTableAsExpression();

            expect(mockGetExpr).toHaveBeenCalledWith(table);
            expect(clipboard.copyText).toHaveBeenCalledWith('datatable(x:int)[1]');
        });

        it('does not copy when server returns null', async () => {
            const p = new DataTableProvider(createMockServer(async () => null), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);

            view.renderTable(make2dTable());
            await view.copyTableAsExpression();

            expect(clipboard.copyText).not.toHaveBeenCalled();
        });

        it('does nothing before renderTable', async () => {
            const mockGetExpr = vi.fn(async () => 'expr');
            const p = new DataTableProvider(createMockServer(mockGetExpr), clipboard);
            const webview = createMockWebView();
            const view = p.createView(webview);

            await view.copyTableAsExpression();

            expect(mockGetExpr).not.toHaveBeenCalled();
            expect(clipboard.copyText).not.toHaveBeenCalled();
        });
    });

    // ─── copyTableAsText ────────────────────────────────────────────────

    describe('copyTableAsText', () => {
        it('copies HTML and markdown to clipboard', async () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            view.renderTable(make2dTable());
            await view.copyTableAsText();

            expect(clipboard.copyItems).toHaveBeenCalledOnce();
            const items = (clipboard.copyItems as ReturnType<typeof vi.fn>).mock.calls[0]![0];
            expect(items).toHaveLength(2);
            expect(items[0].format).toBe('HTML Format');
            expect(items[1].format).toBe('Text');
            // Text item should be markdown
            expect(items[1].data).toContain('|');
        });

        it('does nothing before renderTable', async () => {
            const webview = createMockWebView();
            const view = provider.createView(webview);

            await view.copyTableAsText();

            expect(clipboard.copyItems).not.toHaveBeenCalled();
            expect(clipboard.copyText).not.toHaveBeenCalled();
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

        it('copies text to clipboard when copyText message matches token', () => {
            webview.simulateMessage({ command: 'copyText', text: 'hello', _token: token });

            expect(clipboard.copyText).toHaveBeenCalledOnce();
            expect(clipboard.copyText).toHaveBeenCalledWith('hello');
        });

        it('does not copy to clipboard for mismatched token', () => {
            webview.simulateMessage({ command: 'copyText', text: 'hello', _token: 'wrong-token' });

            expect(clipboard.copyText).not.toHaveBeenCalled();
        });

        it('does not fire for unrelated messages', () => {
            webview.simulateMessage({ command: 'someOtherCommand', _token: token });

            expect(clipboard.copyText).not.toHaveBeenCalled();
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

        it('only the matching view copies to clipboard when sharing a webview', () => {
            const webview = createMockWebView();
            const view1 = provider.createView(webview);
            provider.createView(webview);

            view1.renderTable(make2dTable());
            // Extract token from first view
            const html1: string = webview.setContent.mock.calls[0]![0];
            const match1 = html1.match(/var token = '(dt-[a-z0-9]+)'/);
            const token1 = match1![1]!;

            // Send with view1's token — clipboard should be called once
            webview.simulateMessage({ command: 'copyText', text: 'test', _token: token1 });

            expect(clipboard.copyText).toHaveBeenCalledOnce();
            expect(clipboard.copyText).toHaveBeenCalledWith('test');
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

            view.dispose();

            webview.simulateMessage({ command: 'copyText', text: 'hello', _token: token });
            expect(clipboard.copyText).not.toHaveBeenCalled();
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
