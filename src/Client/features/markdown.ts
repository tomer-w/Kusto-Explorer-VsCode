// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ResultData, ResultTable } from './server';

/**
 * Converts a ResultData to markdown table text.
 * @param data The result data to convert
 * @param tableName Optional name of a specific table to convert (defaults to first table)
 * @returns The markdown representation of the table, or empty string if not found
 */
export function resultDataToMarkdown(data: ResultData, tableName?: string): string {
    if (!data.tables || data.tables.length === 0) {
        return '';
    }
    const table = tableName
        ? data.tables.find(t => t.name === tableName)
        : data.tables[0];
    if (!table) {
        return '';
    }
    return resultTableToMarkdown(table);
}

/**
 * Converts a ResultTable to markdown table text.
 * @param table The result table to convert
 * @returns The markdown representation of the table
 */
export function resultTableToMarkdown(table: ResultTable): string {
    if (table.columns.length === 0) {
        return '';
    }

    const lines: string[] = [];

    // Header row
    const headers = table.columns.map(col => escapeMarkdown(col.name));
    lines.push(`| ${headers.join(' | ')} |`);

    // Separator row
    const separators = table.columns.map(() => '---');
    lines.push(`| ${separators.join(' | ')} |`);

    // Data rows
    for (const row of table.rows) {
        const cells = row.map(cell => escapeMarkdown(formatCellValue(cell)));
        lines.push(`| ${cells.join(' | ')} |`);
    }

    return lines.join('\n');
}

/**
 * Formats a cell value for display in markdown.
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
 * Escapes special markdown characters in text.
 * @param text The text to escape
 * @returns The escaped text safe for use in markdown tables
 */
function escapeMarkdown(text: string): string {
    // Replace pipe characters which would break table structure
    // Replace newlines which would break row structure
    return text
        .replace(/\|/g, '\\|')
        .replace(/\n/g, ' ')
        .replace(/\r/g, '');
}
