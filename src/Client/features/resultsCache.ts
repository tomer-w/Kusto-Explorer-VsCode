// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import type { IServer, ResultData } from './server';

/**
 * Cache for query results, keyed by document URI and minified query text.
 * This mirrors the server's ResultsManager concept of caching results.
 */
export class ResultsCache {
    /** Map from document URI to its cached query results */
    private readonly documentCache = new Map<string, Map<string, ResultData>>();

    constructor(private readonly server: IServer) {
        // Clear cached results when a document is closed
        vscode.workspace.onDidCloseTextDocument((document) => {
            if (document.languageId === 'kusto') {
                this.documentCache.delete(document.uri.toString());
            }
        });
    }

    /**
     * Gets the minified form of a query using the server API.
     */
    private async getMinifiedKey(query: string): Promise<string> {
        const result = await this.server.getMinifiedQuery(query);
        return result?.minifiedQuery ?? query.replace(/\s+/g, ' ').trim();
    }

    /**
     * Adds query results to the cache for a document.
     */
    async addToCache(uri: string, queryText: string, data: ResultData): Promise<void> {
        let queryCache = this.documentCache.get(uri);
        if (!queryCache) {
            queryCache = new Map<string, ResultData>();
            this.documentCache.set(uri, queryCache);
        }

        const minifiedKey = await this.getMinifiedKey(queryText);
        queryCache.set(minifiedKey, data);
    }

    /**
     * Retrieves cached query results for a document.
     */
    async getFromCache(uri: string, queryText: string): Promise<ResultData | null> {
        const queryCache = this.documentCache.get(uri);
        if (!queryCache) {
            return null;
        }

        const minifiedKey = await this.getMinifiedKey(queryText);
        return queryCache.get(minifiedKey) ?? null;
    }

    /**
     * Checks if there are cached results for a document and query.
     */
    async hasInCache(uri: string, queryText: string): Promise<boolean> {
        const queryCache = this.documentCache.get(uri);
        if (!queryCache) {
            return false;
        }

        const minifiedKey = await this.getMinifiedKey(queryText);
        return queryCache.has(minifiedKey);
    }

    /**
     * Removes all cached results for a document.
     */
    clearDocumentCache(uri: string): void {
        this.documentCache.delete(uri);
    }

    /**
     * Removes specific cached results for a document and query.
     */
    async removeFromCache(uri: string, queryText: string): Promise<boolean> {
        const queryCache = this.documentCache.get(uri);
        if (!queryCache) {
            return false;
        }

        const minifiedKey = await this.getMinifiedKey(queryText);
        return queryCache.delete(minifiedKey);
    }

    /**
     * Clears all cached results for all documents.
     */
    clearAllCache(): void {
        this.documentCache.clear();
    }

    /**
     * Gets all cached query keys for a document.
     */
    getCachedQueryKeys(uri: string): string[] {
        const queryCache = this.documentCache.get(uri);
        if (!queryCache) {
            return [];
        }
        return Array.from(queryCache.keys());
    }

    /**
     * Gets the number of cached results for a document.
     */
    getCacheSize(uri: string): number {
        const queryCache = this.documentCache.get(uri);
        return queryCache?.size ?? 0;
    }
}
