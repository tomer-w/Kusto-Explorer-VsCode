import { describe, it, expect } from 'vitest';
import { resultDataToHtml, resultTableToHtml } from '../../features/html';
import type { ResultData, ResultTable } from '../../features/server';

describe('resultTableToHtml', () => {
    it('returns empty string for table with no columns', () => {
        const table: ResultTable = { name: 'Empty', columns: [], rows: [] };
        expect(resultTableToHtml(table)).toBe('');
    });

    it('renders a simple table with header and data rows', () => {
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

        const html = resultTableToHtml(table);

        expect(html).toContain('<table');
        expect(html).toContain('<th');
        expect(html).toContain('Name');
        expect(html).toContain('Value');
        expect(html).toContain('Alice');
        expect(html).toContain('Bob');
        expect(html).toContain('1');
        expect(html).toContain('2');
    });

    it('escapes HTML special characters', () => {
        const table: ResultTable = {
            name: 'Escape',
            columns: [{ name: '<script>', type: 'string' }],
            rows: [['a & b "c"']],
        };

        const html = resultTableToHtml(table);

        expect(html).toContain('&lt;script&gt;');
        expect(html).toContain('a &amp; b &quot;c&quot;');
        expect(html).not.toContain('<script>');
    });

    it('renders null and undefined cells as empty', () => {
        const table: ResultTable = {
            name: 'Nulls',
            columns: [{ name: 'Col', type: 'string' }],
            rows: [[null], [undefined]],
        };

        const html = resultTableToHtml(table);

        // Two data cells, both empty
        const tdMatches = html.match(/<td[^>]*><\/td>/g);
        expect(tdMatches).toHaveLength(2);
    });

    it('serializes object cells as JSON', () => {
        const table: ResultTable = {
            name: 'Objects',
            columns: [{ name: 'Data', type: 'dynamic' }],
            rows: [[{ key: 'value' }]],
        };

        const html = resultTableToHtml(table);

        expect(html).toContain('{&quot;key&quot;:&quot;value&quot;}');
    });

    it('applies custom HTML options', () => {
        const table: ResultTable = {
            name: 'Custom',
            columns: [{ name: 'A', type: 'string' }],
            rows: [['x']],
        };

        const html = resultTableToHtml(table, {
            tableAttributes: 'class="custom"',
            thAttributes: 'class="hdr"',
            tdAttributes: 'class="cell"',
        });

        expect(html).toContain('<table class="custom">');
        expect(html).toContain('<th class="hdr">');
        expect(html).toContain('<td class="cell">');
    });
});

describe('resultDataToHtml', () => {
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

    it('converts all tables when no tableName specified', () => {
        const result = resultDataToHtml(data);
        expect(result.tables).toHaveLength(2);
        expect(result.tables[0]!.name).toBe('Table1');
        expect(result.tables[0]!.rowCount).toBe(2);
        expect(result.tables[1]!.name).toBe('Table2');
        expect(result.tables[1]!.rowCount).toBe(1);
    });

    it('filters to a specific table by name', () => {
        const result = resultDataToHtml(data, 'Table2');
        expect(result.tables).toHaveLength(1);
        expect(result.tables[0]!.name).toBe('Table2');
    });

    it('reports hasChart when chartOptions present', () => {
        const withChart: ResultData = {
            ...data,
            chartOptions: { type: 'bar' },
        };
        expect(resultDataToHtml(withChart).hasChart).toBe(true);
    });

    it('reports no chart when chartOptions absent', () => {
        expect(resultDataToHtml(data).hasChart).toBe(false);
    });
});
