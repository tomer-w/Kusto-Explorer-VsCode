import { describe, it, expect, beforeEach } from 'vitest';
import { Clipboard, formatCfHtml } from '../../features/clipboard';
import type { ClipboardContext } from '../../features/clipboard';

// ─── formatCfHtml ────────────────────────────────────────────────────────────

describe('formatCfHtml', () => {
    it('wraps HTML in CF_HTML format with header', () => {
        const result = formatCfHtml('<b>hello</b>');

        expect(result).toContain('Version:0.9');
        expect(result).toContain('StartHTML:');
        expect(result).toContain('EndHTML:');
        expect(result).toContain('StartFragment:');
        expect(result).toContain('EndFragment:');
    });

    it('includes the original HTML between fragment markers', () => {
        const html = '<table><tr><td>data</td></tr></table>';
        const result = formatCfHtml(html);

        expect(result).toContain('<!--StartFragment-->');
        expect(result).toContain('<!--EndFragment-->');
        expect(result).toContain(html);
    });

    it('wraps in html/body tags', () => {
        const result = formatCfHtml('<b>test</b>');

        expect(result).toContain('<html><body>');
        expect(result).toContain('</body></html>');
    });

    it('has correct byte offsets for ASCII content', () => {
        const html = '<b>test</b>';
        const result = formatCfHtml(html);

        // Extract the offsets from the header
        const startHtml = parseInt(result.match(/StartHTML:(\d+)/)?.[1] ?? '0');
        const endHtml = parseInt(result.match(/EndHTML:(\d+)/)?.[1] ?? '0');
        const startFragment = parseInt(result.match(/StartFragment:(\d+)/)?.[1] ?? '0');
        const endFragment = parseInt(result.match(/EndFragment:(\d+)/)?.[1] ?? '0');

        // Convert to buffer to check byte positions
        const buf = Buffer.from(result, 'utf8');
        const text = buf.toString('utf8');

        // StartHTML should point to <html>
        expect(text.substring(startHtml)).toMatch(/^<html>/);

        // EndHTML should be at the end
        expect(endHtml).toBe(buf.byteLength);

        // StartFragment should point right after <!--StartFragment-->
        expect(text.substring(startFragment, startFragment + html.length)).toBe(html);

        // EndFragment should point right after the HTML content
        expect(text.substring(endFragment)).toMatch(/^<!--EndFragment-->/);
    });

    it('handles multi-byte UTF-8 characters correctly', () => {
        const html = '<td>日本語</td>';
        const result = formatCfHtml(html);

        const startFragment = parseInt(result.match(/StartFragment:(\d+)/)?.[1] ?? '0');
        const endFragment = parseInt(result.match(/EndFragment:(\d+)/)?.[1] ?? '0');

        // Byte offsets should account for multi-byte characters
        const buf = Buffer.from(result, 'utf8');
        const extracted = buf.subarray(startFragment, endFragment).toString('utf8');
        expect(extracted).toBe(html);
    });

    it('handles empty HTML', () => {
        const result = formatCfHtml('');

        const startFragment = parseInt(result.match(/StartFragment:(\d+)/)?.[1] ?? '0');
        const endFragment = parseInt(result.match(/EndFragment:(\d+)/)?.[1] ?? '0');

        expect(startFragment).toBe(endFragment);
    });
});

// ─── Clipboard context ───────────────────────────────────────────────────────

describe('Clipboard', () => {
    let clipboard: Clipboard;

    beforeEach(() => {
        clipboard = new Clipboard();
    });

    it('starts with no context', () => {
        expect(clipboard.getContext()).toBeUndefined();
    });

    it('setContext / getContext round-trips', () => {
        const ctx: ClipboardContext = {
            text: 'StormEvents',
            kind: 'entity',
            entityCluster: 'help.kusto.windows.net',
            entityDatabase: 'Samples',
            entityType: 'Table',
            entityName: 'StormEvents',
        };

        clipboard.setContext(ctx);
        expect(clipboard.getContext()).toEqual(ctx);
    });

    it('setContext overwrites previous context', () => {
        clipboard.setContext({ text: 'first', kind: 'query' });
        clipboard.setContext({ text: 'second', kind: 'entity' });

        expect(clipboard.getContext()?.text).toBe('second');
    });

    it('clearContext removes the stored context', () => {
        clipboard.setContext({ text: 'data', kind: 'query' });
        clipboard.clearContext();

        expect(clipboard.getContext()).toBeUndefined();
    });

    it('clearContext is safe to call when no context is set', () => {
        clipboard.clearContext();
        expect(clipboard.getContext()).toBeUndefined();
    });
});
