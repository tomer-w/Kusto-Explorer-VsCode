import { describe, it, expect } from 'vitest';
import { resultDataToMarkdown, resultTableToMarkdown } from '../features/markdown';
import type { ResultData, ResultTable } from '../features/server';

describe('resultTableToMarkdown', () => {
    it('returns empty string for table with no columns', () => {
        const table: ResultTable = { name: 'Empty', columns: [], rows: [] };
        expect(resultTableToMarkdown(table)).toBe('');
    });

    it('renders a simple table with header, separator, and data rows', () => {
        const table: ResultTable = {
            name: 'Test',
            columns: [
                { name: 'Name', type: 'string' },
                { name: 'Value', type: 'int' },
            ],
            rows: [
                ['Alice', 1],
                ['Bob', 2],
            ],
        };

        const md = resultTableToMarkdown(table);
        const lines = md.split('\n');

        expect(lines).toHaveLength(4); // header + separator + 2 data rows
        expect(lines[0]).toBe('| Name | Value |');
        expect(lines[1]).toBe('| --- | --- |');
        expect(lines[2]).toBe('| Alice | 1 |');
        expect(lines[3]).toBe('| Bob | 2 |');
    });

    it('escapes pipe characters in values', () => {
        const table: ResultTable = {
            name: 'Pipes',
            columns: [{ name: 'Col', type: 'string' }],
            rows: [['a|b']],
        };

        const md = resultTableToMarkdown(table);
        expect(md).toContain('a\\|b');
    });

    it('escapes pipe characters in column names', () => {
        const table: ResultTable = {
            name: 'Pipes',
            columns: [{ name: 'A|B', type: 'string' }],
            rows: [['x']],
        };

        const md = resultTableToMarkdown(table);
        expect(md).toContain('A\\|B');
    });

    it('replaces newlines with spaces in cell values', () => {
        const table: ResultTable = {
            name: 'Newlines',
            columns: [{ name: 'Col', type: 'string' }],
            rows: [['line1\nline2\r\nline3']],
        };

        const md = resultTableToMarkdown(table);
        expect(md).toContain('line1 line2 line3');
    });

    it('renders null and undefined cells as empty', () => {
        const table: ResultTable = {
            name: 'Nulls',
            columns: [{ name: 'Col', type: 'string' }],
            rows: [[null], [undefined]],
        };

        const md = resultTableToMarkdown(table);
        const lines = md.split('\n');

        expect(lines[2]).toBe('|  |');
        expect(lines[3]).toBe('|  |');
    });

    it('serializes object cells as JSON', () => {
        const table: ResultTable = {
            name: 'Objects',
            columns: [{ name: 'Data', type: 'dynamic' }],
            rows: [[{ key: 'value' }]],
        };

        const md = resultTableToMarkdown(table);
        expect(md).toContain('{"key":"value"}');
    });
});

describe('resultDataToMarkdown', () => {
    const data: ResultData = {
        tables: [
            {
                name: 'Table1',
                columns: [{ name: 'A', type: 'string' }],
                rows: [['a1'], ['a2']],
            },
            {
                name: 'Table2',
                columns: [{ name: 'B', type: 'int' }],
                rows: [[1]],
            },
        ],
    };

    it('returns empty string when data has no tables', () => {
        expect(resultDataToMarkdown({ tables: [] })).toBe('');
    });

    it('converts the first table by default', () => {
        const md = resultDataToMarkdown(data);
        expect(md).toContain('| A |');
        expect(md).toContain('a1');
    });

    it('converts a specific table by name', () => {
        const md = resultDataToMarkdown(data, 'Table2');
        expect(md).toContain('| B |');
        expect(md).toContain('1');
        expect(md).not.toContain('| A |');
    });

    it('returns empty string when named table is not found', () => {
        expect(resultDataToMarkdown(data, 'NonExistent')).toBe('');
    });
});
