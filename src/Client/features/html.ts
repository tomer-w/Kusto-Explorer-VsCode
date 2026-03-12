// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ResultData, ResultTable } from './server';

/** A single HTML table from the query result. */
export interface HtmlTable {
    name: string;
    html: string;
    rowCount: number;
}

/** Result of getting data as html. */
export interface DataAsHtml {
    tables: HtmlTable[];
    hasChart: boolean;
}

/** Attribute options for HTML table rendering. Each value is a full attribute string (e.g. 'style="..." class="..."'). */
export interface HtmlOptions {
    /** Attributes for the table element. */
    tableAttributes?: string;
    /** Attributes for header cells (th). */
    thAttributes?: string;
    /** Attributes for data cells (td). */
    tdAttributes?: string;
}

const DEFAULT_OPTIONS: Required<HtmlOptions> = {
    tableAttributes: 'border="1" style="border-collapse: collapse; width: fit-content;"',
    thAttributes: 'style="padding: 4px; font-weight: bold;"',
    tdAttributes: 'style="padding: 4px; white-space: nowrap; overflow-x: auto; max-width: 500px;"',
};

/**
 * Converts ResultData to a DataAsHtml structure.
 * @param data The result data to convert
 * @param tableName Optional name of a specific table to convert (defaults to all tables)
 * @param options Optional attribute options for the HTML table elements
 * @returns The DataAsHtml with HTML tables and chart indicator
 */
export function resultDataToHtml(data: ResultData, tableName?: string, options?: HtmlOptions): DataAsHtml {
    const tables = tableName
        ? data.tables.filter(t => t.name === tableName)
        : data.tables;

    return {
        tables: tables.map(t => ({
            name: t.name,
            html: resultTableToHtml(t, options),
            rowCount: t.rows.length
        })),
        hasChart: !!data.chartOptions
    };
}

/**
 * Converts a ResultTable to an HTML table string.
 * @param table The result table to convert
 * @param options Optional attribute options for the HTML table elements
 * @returns The HTML table representation, or empty string if no columns
 */
export function resultTableToHtml(
    table: ResultTable,
    options?: HtmlOptions
): string {
    if (table.columns.length === 0) {
        return '';
    }

    const { tableAttributes, thAttributes, tdAttributes } = { ...DEFAULT_OPTIONS, ...options };

    const lines: string[] = [];
    lines.push(`<table ${tableAttributes}>`);

    // Header row
    lines.push('<thead><tr>');
    for (const col of table.columns) {
        lines.push(`<th ${thAttributes}>${escapeHtml(col.name)}</th>`);
    }
    lines.push('</tr></thead>');

    // Data rows
    lines.push('<tbody>');
    for (const row of table.rows) {
        lines.push('<tr>');
        for (const cell of row) {
            lines.push(`<td ${tdAttributes}>${escapeHtml(formatCellValue(cell))}</td>`);
        }
        lines.push('</tr>');
    }
    lines.push('</tbody>');

    lines.push('</table>');
    return lines.join('');
}

/**
 * Formats a cell value for display.
 * @param value The cell value to format
 * @returns The formatted string representation
 */
function formatCellValue(value: unknown | null): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

/**
 * Escapes special HTML characters in text.
 * @param text The text to escape
 * @returns The escaped text safe for use in HTML
 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
