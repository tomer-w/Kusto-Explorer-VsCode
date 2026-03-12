// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { ResultData, getMinifiedQuery } from './server';

/**
 * Cache for query results, keyed by document URI and minified query text.
 * This mirrors the server's ResultsManager concept of caching results.
 */

/** The language client for LSP communication */
let languageClient: LanguageClient | null = null;

/** Map from document URI to its cached query results */
const documentCache = new Map<string, Map<string, ResultData>>();

/**
 * Initializes the results cache with the language client.
 * Must be called before using cache functions that require query minification.
 * @param client The language client for LSP communication
 */
export function initialize(client: LanguageClient): void {
    languageClient = client;

    // Clear cached results when a document is closed
    vscode.workspace.onDidCloseTextDocument((document) => {
        if (document.languageId === 'kusto') {
            documentCache.delete(document.uri.toString());
        }
    });
}

/**
 * Gets the minified form of a query using the server API.
 * @param query The query text to minify
 * @returns The minified query text, or the original if minification fails
 */
async function getMinifiedKey(query: string): Promise<string> {
    if (!languageClient) {
        // Fallback to simple whitespace normalization if not initialized
        return query.replace(/\s+/g, ' ').trim();
    }

    const result = await getMinifiedQuery(languageClient, query);
    return result?.minifiedQuery ?? query.replace(/\s+/g, ' ').trim();
}

/**
 * Adds query results to the cache for a document.
 * @param uri The document URI
 * @param queryText The original query text (will be minified for the cache key)
 * @param data The result data to cache
 */
export async function addToCache(uri: string, queryText: string, data: ResultData): Promise<void> {
    let queryCache = documentCache.get(uri);
    if (!queryCache) {
        queryCache = new Map<string, ResultData>();
        documentCache.set(uri, queryCache);
    }

    const minifiedKey = await getMinifiedKey(queryText);
    queryCache.set(minifiedKey, data);
}

/**
 * Retrieves cached query results for a document.
 * @param uri The document URI
 * @param queryText The original query text (will be minified to find the cache key)
 * @returns The cached result data, or null if not found
 */
export async function getFromCache(uri: string, queryText: string): Promise<ResultData | null> {
    const queryCache = documentCache.get(uri);
    if (!queryCache) {
        return null;
    }

    const minifiedKey = await getMinifiedKey(queryText);
    return queryCache.get(minifiedKey) ?? null;
}

/**
 * Checks if there are cached results for a document and query.
 * @param uri The document URI
 * @param queryText The original query text (will be minified to find the cache key)
 * @returns True if cached results exist, false otherwise
 */
export async function hasInCache(uri: string, queryText: string): Promise<boolean> {
    const queryCache = documentCache.get(uri);
    if (!queryCache) {
        return false;
    }

    const minifiedKey = await getMinifiedKey(queryText);
    return queryCache.has(minifiedKey);
}

/**
 * Removes all cached results for a document.
 * Call this when a document is closed.
 * @param uri The document URI
 */
export function clearDocumentCache(uri: string): void {
    documentCache.delete(uri);
}

/**
 * Removes specific cached results for a document and query.
 * @param uri The document URI
 * @param queryText The original query text (will be minified to find the cache key)
 * @returns True if the entry was removed, false if it didn't exist
 */
export async function removeFromCache(uri: string, queryText: string): Promise<boolean> {
    const queryCache = documentCache.get(uri);
    if (!queryCache) {
        return false;
    }

    const minifiedKey = await getMinifiedKey(queryText);
    return queryCache.delete(minifiedKey);
}

/**
 * Clears all cached results for all documents.
 */
export function clearAllCache(): void {
    documentCache.clear();
}

/**
 * Gets all cached query keys for a document.
 * Useful for debugging or inspecting the cache state.
 * @param uri The document URI
 * @returns Array of minified query keys, or empty array if no cache exists
 */
export function getCachedQueryKeys(uri: string): string[] {
    const queryCache = documentCache.get(uri);
    if (!queryCache) {
        return [];
    }
    return Array.from(queryCache.keys());
}

/**
 * Gets the number of cached results for a document.
 * @param uri The document URI
 * @returns The number of cached results, or 0 if no cache exists
 */
export function getCacheSize(uri: string): number {
    const queryCache = documentCache.get(uri);
    return queryCache?.size ?? 0;
}
