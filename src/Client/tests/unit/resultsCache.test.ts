// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResultsCache } from '../../features/resultsCache';
import type { Server } from '../../features/server';
import type { ResultData } from '../../features/server';

function makeResultData(name: string): ResultData {
    return {
        tables: [{
            name,
            columns: [{ name: 'Col', type: 'string' }],
            rows: [['value']],
        }],
    };
}

function createMockServer(minify?: (q: string) => string): Server {
    return {
        getMinifiedQuery: vi.fn(async (query: string) => ({
            minifiedQuery: minify ? minify(query) : query.replace(/\s+/g, ' ').trim(),
        })),
    } as unknown as Server;
}

describe('ResultsCache', () => {
    let server: Server;
    let cache: ResultsCache;

    beforeEach(() => {
        server = createMockServer();
        cache = new ResultsCache(server);
    });

    it('returns null for uncached document', async () => {
        const result = await cache.getFromCache('doc1', 'query');
        expect(result).toBeNull();
    });

    it('stores and retrieves a result', async () => {
        const data = makeResultData('T1');
        await cache.addToCache('doc1', 'select *', data);

        const result = await cache.getFromCache('doc1', 'select *');
        expect(result).toEqual(data);
    });

    it('returns null for wrong document URI', async () => {
        await cache.addToCache('doc1', 'query', makeResultData('T'));

        const result = await cache.getFromCache('doc2', 'query');
        expect(result).toBeNull();
    });

    it('returns null for wrong query text', async () => {
        await cache.addToCache('doc1', 'query1', makeResultData('T'));

        const result = await cache.getFromCache('doc1', 'query2');
        expect(result).toBeNull();
    });

    it('matches queries after minification (whitespace normalization)', async () => {
        const data = makeResultData('T1');
        await cache.addToCache('doc1', '  select  *  ', data);

        const result = await cache.getFromCache('doc1', 'select *');
        expect(result).toEqual(data);
    });

    it('stores multiple queries per document', async () => {
        const data1 = makeResultData('T1');
        const data2 = makeResultData('T2');

        await cache.addToCache('doc1', 'query1', data1);
        await cache.addToCache('doc1', 'query2', data2);

        expect(await cache.getFromCache('doc1', 'query1')).toEqual(data1);
        expect(await cache.getFromCache('doc1', 'query2')).toEqual(data2);
    });

    it('overwrites existing entry for the same query', async () => {
        const data1 = makeResultData('Old');
        const data2 = makeResultData('New');

        await cache.addToCache('doc1', 'query', data1);
        await cache.addToCache('doc1', 'query', data2);

        expect(await cache.getFromCache('doc1', 'query')).toEqual(data2);
    });

    describe('hasInCache', () => {
        it('returns false for uncached entry', async () => {
            expect(await cache.hasInCache('doc1', 'query')).toBe(false);
        });

        it('returns true for cached entry', async () => {
            await cache.addToCache('doc1', 'query', makeResultData('T'));
            expect(await cache.hasInCache('doc1', 'query')).toBe(true);
        });
    });

    describe('removeFromCache', () => {
        it('returns false when nothing to remove', async () => {
            expect(await cache.removeFromCache('doc1', 'query')).toBe(false);
        });

        it('removes a specific cached entry', async () => {
            await cache.addToCache('doc1', 'q1', makeResultData('T1'));
            await cache.addToCache('doc1', 'q2', makeResultData('T2'));

            const removed = await cache.removeFromCache('doc1', 'q1');
            expect(removed).toBe(true);
            expect(await cache.getFromCache('doc1', 'q1')).toBeNull();
            expect(await cache.getFromCache('doc1', 'q2')).not.toBeNull();
        });
    });

    describe('clearDocumentCache', () => {
        it('removes all entries for a document', async () => {
            await cache.addToCache('doc1', 'q1', makeResultData('T'));
            await cache.addToCache('doc1', 'q2', makeResultData('T'));

            cache.clearDocumentCache('doc1');

            expect(await cache.getFromCache('doc1', 'q1')).toBeNull();
            expect(await cache.getFromCache('doc1', 'q2')).toBeNull();
        });

        it('does not affect other documents', async () => {
            await cache.addToCache('doc1', 'q', makeResultData('T'));
            await cache.addToCache('doc2', 'q', makeResultData('T'));

            cache.clearDocumentCache('doc1');

            expect(await cache.getFromCache('doc2', 'q')).not.toBeNull();
        });
    });

    describe('clearAllCache', () => {
        it('removes entries for all documents', async () => {
            await cache.addToCache('doc1', 'q', makeResultData('T'));
            await cache.addToCache('doc2', 'q', makeResultData('T'));

            cache.clearAllCache();

            expect(await cache.getFromCache('doc1', 'q')).toBeNull();
            expect(await cache.getFromCache('doc2', 'q')).toBeNull();
        });
    });

    describe('getCachedQueryKeys', () => {
        it('returns empty array for uncached document', () => {
            expect(cache.getCachedQueryKeys('doc1')).toEqual([]);
        });

        it('returns minified keys for cached queries', async () => {
            await cache.addToCache('doc1', 'query  one', makeResultData('T'));
            await cache.addToCache('doc1', 'query  two', makeResultData('T'));

            const keys = cache.getCachedQueryKeys('doc1');
            expect(keys).toContain('query one');
            expect(keys).toContain('query two');
            expect(keys).toHaveLength(2);
        });
    });

    describe('getCacheSize', () => {
        it('returns 0 for uncached document', () => {
            expect(cache.getCacheSize('doc1')).toBe(0);
        });

        it('returns count of cached queries', async () => {
            await cache.addToCache('doc1', 'q1', makeResultData('T'));
            await cache.addToCache('doc1', 'q2', makeResultData('T'));
            expect(cache.getCacheSize('doc1')).toBe(2);
        });
    });

    describe('server minification fallback', () => {
        it('falls back to whitespace trimming when server returns null', async () => {
            const fallbackServer = {
                getMinifiedQuery: vi.fn(async () => null),
            } as unknown as Server;

            const fallbackCache = new ResultsCache(fallbackServer);
            const data = makeResultData('T');

            await fallbackCache.addToCache('doc1', '  hello   world  ', data);
            const result = await fallbackCache.getFromCache('doc1', 'hello world');
            expect(result).toEqual(data);
        });
    });
});
