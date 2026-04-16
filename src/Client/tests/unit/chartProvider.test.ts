// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect } from 'vitest';
import {
    hexToRgba,
    isNumericType,
    isDateTimeType,
    getColumnRef,
    getColumnRefByIndex,
} from '../../features/chartProvider';
import type { ResultTable } from '../../features/server';

// ─── Test Data ──────────────────────────────────────────────────────────────

function makeTable(columns: { name: string; type: string }[], rows: unknown[][] = []): ResultTable {
    return { name: 'T', columns, rows };
}

// ─── hexToRgba ──────────────────────────────────────────────────────────────

describe('hexToRgba', () => {
    it('converts 6-digit hex to rgba', () => {
        expect(hexToRgba('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
        expect(hexToRgba('#00FF00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
        expect(hexToRgba('#0000FF', 0)).toBe('rgba(0, 0, 255, 0)');
    });

    it('converts 3-digit hex to rgba', () => {
        expect(hexToRgba('#F00', 1)).toBe('rgba(255, 0, 0, 1)');
        expect(hexToRgba('#0F0', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
    });

    it('handles hex without # prefix', () => {
        expect(hexToRgba('636EFA', 0.3)).toBe('rgba(99, 110, 250, 0.3)');
    });

    it('returns fallback gray for invalid hex length', () => {
        expect(hexToRgba('', 1)).toBe('rgba(128, 128, 128, 1)');
        expect(hexToRgba('#12', 1)).toBe('rgba(128, 128, 128, 1)');
    });

    it('produces NaN for non-hex characters with valid length', () => {
        // The function only checks length, not character validity
        const result = hexToRgba('#ZZZZZZ', 0.5);
        expect(result).toContain('NaN');
    });
});

// ─── isNumericType ──────────────────────────────────────────────────────────

describe('isNumericType', () => {
    it.each(['int', 'long', 'real', 'decimal'])('returns true for %s', (type) => {
        expect(isNumericType(type)).toBe(true);
    });

    it.each(['string', 'datetime', 'bool', 'timespan', 'guid', ''])('returns false for %s', (type) => {
        expect(isNumericType(type)).toBe(false);
    });
});

// ─── isDateTimeType ─────────────────────────────────────────────────────────

describe('isDateTimeType', () => {
    it('returns true for datetime', () => {
        expect(isDateTimeType('datetime')).toBe(true);
    });

    it('returns true for timespan', () => {
        expect(isDateTimeType('timespan')).toBe(true);
    });

    it.each(['string', 'int', 'real', 'bool', ''])('returns false for %s', (type) => {
        expect(isDateTimeType(type)).toBe(false);
    });
});

// ─── getColumnRef ───────────────────────────────────────────────────────────

describe('getColumnRef', () => {
    it('returns column ref for existing column', () => {
        const table = makeTable([
            { name: 'A', type: 'string' },
            { name: 'B', type: 'int' },
        ]);
        const ref = getColumnRef(table, 'B');
        expect(ref).toBeDefined();
        expect(ref!.index).toBe(1);
        expect(ref!.column.name).toBe('B');
        expect(ref!.column.type).toBe('int');
    });

    it('returns undefined for non-existent column', () => {
        const table = makeTable([{ name: 'A', type: 'string' }]);
        expect(getColumnRef(table, 'Z')).toBeUndefined();
    });

    it('returns first match when names are unique', () => {
        const table = makeTable([
            { name: 'X', type: 'long' },
            { name: 'Y', type: 'real' },
        ]);
        const ref = getColumnRef(table, 'X');
        expect(ref!.index).toBe(0);
    });
});

// ─── getColumnRefByIndex ────────────────────────────────────────────────────

describe('getColumnRefByIndex', () => {
    it('returns column ref for valid index', () => {
        const table = makeTable([
            { name: 'A', type: 'string' },
            { name: 'B', type: 'int' },
        ]);
        const ref = getColumnRefByIndex(table, 1);
        expect(ref).toBeDefined();
        expect(ref!.column.name).toBe('B');
        expect(ref!.index).toBe(1);
    });

    it('returns undefined for negative index', () => {
        const table = makeTable([{ name: 'A', type: 'string' }]);
        expect(getColumnRefByIndex(table, -1)).toBeUndefined();
    });

    it('returns undefined for out-of-range index', () => {
        const table = makeTable([{ name: 'A', type: 'string' }]);
        expect(getColumnRefByIndex(table, 5)).toBeUndefined();
    });
});
