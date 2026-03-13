// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { LanguageClient } from 'vscode-languageclient/node';

/**
 * Wrapper methods for LSP requests to the Kusto Language Server.
 * Centralizes all custom client.sendRequest calls so return type signatures
 * are defined in one place.
 */

/**
 * Runs a query with the given text, cluster, and database, returning results as ResultData.
 * @param client The language client for LSP communication
 * @param query The query text to execute
 * @param cluster The cluster name to connect to
 * @param database Optional database name
 * @param isReadOnly Optional flag to run the query in read-only mode
 * @param maxRows Optional maximum number of rows to return
 * @returns The query results as ResultData, or null if the query failed
 */
export function runQuery(
    client: LanguageClient,
    query: string,
    cluster?: string,
    database?: string,
    isReadOnly?: boolean,
    maxRows?: number
): Promise<RunQueryResult | null> {
    return client.sendRequest<RunQueryResult | null>(
        'kusto/runQuery',
        { query, cluster, database, isReadOnly, maxRows }
    );
}

/**
 * Gets the result type of a query as a formatted string.
 * @param client The language client for LSP communication
 * @param query The query text to analyze
 * @param cluster The cluster name for context
 * @param database Optional database name for context
 * @returns The result type as a schema string for tables, type name for scalars, or null if no result
 */
export function getQueryResultType(
    client: LanguageClient,
    query: string,
    cluster: string,
    database?: string
): Promise<GetQueryResultTypeResult | null> {
    return client.sendRequest<GetQueryResultTypeResult | null>(
        'kusto/getQueryResultType',
        { query, cluster, database }
    );
}

/**
 * Gets the result type of a database function.
 * @param client The language client for LSP communication
 * @param cluster The cluster name
 * @param database The database name
 * @param functionName The name of the function
 * @returns The result type as a schema string for tables, type name for scalars, or null if not found
 */
export function getFunctionResultType(
    client: LanguageClient,
    cluster: string,
    database: string,
    functionName: string
): Promise<GetFunctionResultTypeResult | null> {
    return client.sendRequest<GetFunctionResultTypeResult | null>(
        'kusto/getFunctionResultType',
        { cluster, database, functionName }
    );
}

/**
 * Gets the query ranges (boundaries) for a document.
 */
export function getQueryRanges(
    client: LanguageClient,
    uri: string
): Promise<QueryRangesResult | null> {
    return client.sendRequest<QueryRangesResult | null>(
        'kusto/getQueryRanges',
        { uri }
    );
}

/**
 * Gets the query range containing the given position in a document.
 */
export function getQueryRange(
    client: LanguageClient,
    uri: string,
    position: Position
): Promise<Range | null> {
    return client.sendRequest<Range | null>(
        'kusto/getQueryRange',
        { uri, position }
    );
}

/**
 * Gets the server kind for a connection string.
 */
export function getServerKind(
    client: LanguageClient,
    connection: string
): Promise<ServerKindResult | null> {
    return client.sendRequest<ServerKindResult | null>(
        'kusto/getServerKind',
        { connection }
    );
}

/**
 * Decodes a connection string to extract the cluster and database names.
 * @param client The language client for LSP communication
 * @param connectionString The connection string to decode
 * @returns The decoded cluster and database names, or null if decoding failed
 */
export function decodeConnectionString(
    client: LanguageClient,
    connectionString: string
): Promise<DecodeConnectionStringResult | null> {
    return client.sendRequest<DecodeConnectionStringResult | null>(
        'kusto/decodeConnectionString',
        { connectionString }
    );
}

/**
 * Gets server info (list of databases) for a cluster.
 */
export function getServerInfo(
    client: LanguageClient,
    connection: string,
    serverKind: string | null
): Promise<ServerInfoResult | null> {
    return client.sendRequest<ServerInfoResult | null>(
        'kusto/getServerInfo',
        { connection, serverKind }
    );
}

/**
 * Gets detailed database info (tables, functions, etc.) for a database.
 */
export function getDatabaseInfo(
    client: LanguageClient,
    cluster: string,
    database: string
): Promise<DatabaseInfo | null> {
    return client.sendRequest<DatabaseInfo | null>(
        'kusto/getDatabaseInfo',
        { cluster, database }
    );
}

/**
 * Gets the create command for a database entity.
 * @param client The language client for LSP communication
 * @param cluster The cluster name
 * @param database The database name
 * @param entityType The type of entity (e.g., 'Table', 'ExternalTable', 'Function', etc.)
 * @param entityName The name of the entity
 * @returns The entity create command as a string, or null if not found
 */
export function getEntityAsCommand(
    client: LanguageClient,
    cluster: string,
    database: string,
    entityType: string,
    entityName: string
): Promise<string | null> {
    return client.sendRequest<string | null>(
        'kusto/getEntityAsCommand',
        { cluster, database, entityType, entityName }
    );
}

/**
 * Gets a KQL expression that references a database entity in a query.
 * @param client The language client for LSP communication
 * @param cluster The cluster name
 * @param database The database name
 * @param entityType The type of entity (e.g., 'Table', 'ExternalTable', 'Function', etc.)
 * @param entityName The name of the entity
 * @param uri The document URI, or null
 * @returns The entity expression as a string, or null if not found
 */
export function getEntityAsExpression(
    client: LanguageClient,
    cluster: string,
    database: string,
    entityType: string,
    entityName: string,
    uri: string | null
): Promise<string | null> {
    return client.sendRequest<string | null>(
        'kusto/getEntityAsExpression',
        { cluster, database, entityType, entityName, uri }
    );
}

/**
 * Gets the HTML representation of a chart from result data.
 * @param client The language client for LSP communication
 * @param data The result data containing tables and chart options
 * @param darkMode Whether to render the chart in dark mode
 * @returns The chart as HTML, or null if not available
 */
export function getChartAsHtml(
    client: LanguageClient,
    data: ResultData,
    darkMode?: boolean
): Promise<ChartAsHtmlResult | null> {
    return client.sendRequest<ChartAsHtmlResult | null>(
        'kusto/getChartAsHtml',
        {
            data,
            darkMode: darkMode ?? false
        }
    );
}

/** Result of getting chart as HTML. */
export interface ChartAsHtmlResult {
    html: string;
}

/**
 * Gets the HTML representation of query text with syntax colorization.
 * @param client The language client for LSP communication
 * @param query The query text to colorize
 * @param cluster Optional cluster name for semantic coloring
 * @param database Optional database name for semantic coloring
 * @param darkMode Whether to render in dark mode
 * @returns The colorized query as HTML, or null if not available
 */
export function getQueryAsHtml(
    client: LanguageClient,
    query: string,
    cluster?: string,
    database?: string,
    darkMode?: boolean
): Promise<QueryAsHtmlResult | null> {
    return client.sendRequest<QueryAsHtmlResult | null>(
        'kusto/getQueryAsHtml',
        { query, cluster, database, darkMode }
    );
}

/**
 * Gets the query result data as a KQL datatable expression.
 * @param client The language client for LSP communication
 * @param data The result data containing tables
 * @param tableName Optional name of a specific table to convert (defaults to first table)
 * @returns The datatable expression as a string, or null if not available
 */
export function getDataAsExpression(
    client: LanguageClient,
    data: ResultData,
    tableName?: string
): Promise<DataAsExpression | null> {
    return client.sendRequest<DataAsExpression | null>(
        'kusto/getDataAsExpression',
        {
            data,
            tableName
        }
    );
}

export interface DatabaseTableInfo {
    name: string;
    columns?: DatabaseColumnInfo[];
    description?: string;
    folder?: string;
}

export interface DatabaseExternalTableInfo
{
    name: string;
    columns?: DatabaseColumnInfo[];
    description?: string;
    folder?: string;
}

export interface DatabaseMaterializedViewInfo
{
    name: string;
    source: string;
    query: string;
    columns?: DatabaseColumnInfo[];
    description?: string;
    folder?: string;
}

export interface DatabaseColumnInfo {
    name: string;
    type: string;
    description?: string;
}

export interface DatabaseFunctionInfo {
    name: string;
    parameters?: string;
    body?: string;
    description?: string;
    folder?: string;
}

export interface DatabaseEntityGroupInfo {
    name: string;
    entities?: string[];
    description?: string;
    folder?: string;
}

export interface DatabaseGraphModelInfo {
    name: string;
    model?: string;
    snapshots?: string[];
    description?: string;
    folder?: string;
}

export interface DatabaseStoredQueryResultInfo
{
    name: string;
    columns?: DatabaseColumnInfo[];
    description?: string;
    folder?: string;
}

export interface DatabaseInfo {
    name: string;
    alternateName?: string;
    tables?: DatabaseTableInfo[];
    externalTables?: DatabaseExternalTableInfo[];
    materializedViews?: DatabaseMaterializedViewInfo[];
    functions?: DatabaseFunctionInfo[];
    entityGroups?: DatabaseEntityGroupInfo[];
    graphModels?: DatabaseGraphModelInfo[];
    storedQueryResults?: DatabaseStoredQueryResultInfo[];
}

/** Result of running a query and returning results as ResultData. */
export interface RunQueryResult {
    data?: ResultData;
    connection?: string;
    cluster?: string;
    database?: string;
    error?: QueryDiagnostic;
}

/** Result of getting the query result type. */
export interface GetQueryResultTypeResult {
    resultType?: string;
}

/** Result of getting a function's result type. */
export interface GetFunctionResultTypeResult {
    resultType?: string;
}

/** Error from running a query. */
export interface QueryDiagnostic {
    message: string,
    details?: string,
    range?: Range
}

/** Result of getting query as HTML. */
export interface QueryAsHtmlResult {
    html: string;
}

/** Result of getting data as a KQL expression. */
export interface DataAsExpression {
    expression: string;
}

/** Serializable representation of a query execution result. */
export interface ResultData {
    query?: string;
    cluster?: string;
    database?: string;
    tables: ResultTable[];
    chartOptions?: ChartOptions;
}

/** Serializable representation of a data table. */
export interface ResultTable {
    name: string;
    columns: ResultColumn[];
    rows: (unknown | null)[][];
}

/** Serializable representation of a table column. */
export interface ResultColumn {
    name: string;
    type: string;
}

/** Serializable representation of chart visualization options. */
export interface ChartOptions {
    kind: string;
    mode?: string;
    title?: string;
    xTitle?: string;
    yTitle?: string;
    xColumn?: string;
    yColumns?: string[];
    series?: string[];
    legend?: string;
    xAxis?: string;
    yAxis?: string;
    xmin?: unknown;
    xmax?: unknown;
    ymin?: unknown;
    ymax?: unknown;
    accumulate?: boolean;
}

/** Position in a document. */
export interface Position {
    line: number;
    character: number;
}

/** Range in a document. */
export interface Range {
    start: Position;
    end: Position;
}

/** Result of getting query ranges for a document. */
export interface QueryRangesResult {
    uri: string;
    ranges: Range[];
}

/** Result of getting the server kind for a connection. */
export interface ServerKindResult {
    serverKind: string;
}

/** Result of decoding a connection string. */
export interface DecodeConnectionStringResult {
    cluster: string;
    database?: string;
}

/** Result of getting server info (databases) for a connection. */
export interface ServerInfoResult {
    cluster: string;
    databases: DatabaseName[];
}

export interface DatabaseName {
    name: string;
    alternateName?: string;
}

/** Selection range passed to runQuery. */
export interface SelectionRange {
    start: Position;
    end: Position;
}

/** Result of getting entity definition content. */
export interface EntityDefinitionContentResult {
    content: string;
}

/**
 * Gets the content of a virtual entity definition document.
 * This is called by the EntityDefinitionProvider when VS Code opens a kusto-entity:// URI.
 * @param client The language client for LSP communication
 * @param uri The kusto-entity:// URI for the entity
 * @returns The entity definition content, or null if not available
 */
export function getEntityDefinitionContent(
    client: LanguageClient,
    uri: string
): Promise<EntityDefinitionContentResult | null> {
    return client.sendRequest<EntityDefinitionContentResult | null>(
        'kusto/getEntityDefinitionContent',
        { uri }
    );
}

/**
 * Asks the server to transform pasted text based on source and target connection context.
 * Returns the transformed text, or null if no transformation is needed.
 * @param client The language client for LSP communication
 * @param text The text being pasted
 * @param kind The kind of content being pasted (e.g. 'entity', 'query')
 * @param sourceCluster The cluster where the content was copied from
 * @param sourceDatabase The database where the content was copied from
 * @param entityType The type of entity being pasted (e.g. 'Table', 'Function')
 * @param entityName The name of the entity being pasted
 * @param targetUri The URI of the document being pasted into
 * @param targetPosition The position in the document where the paste will occur
 * @param properties Optional additional properties for the transformation
 */
export function transformPaste(
    client: LanguageClient,
    text: string,
    kind: string,
    targetUri: string,
    targetPosition: Position,
    entityCluster?: string | undefined,
    entityDatabase?: string | undefined,
    entityType?: string | undefined,
    entityName?: string | undefined,
): Promise<string | null> {
    return client.sendRequest<string | null>(
        'kusto/transformPaste',
        {
            text,
            kind,
            textDocument: { uri: targetUri },
            position: targetPosition,
            entityCluster,
            entityDatabase,
            entityType,
            entityName
        }
    );
}

/**
 * Refreshes the schema cache for a cluster or specific database on the server.
 * After this completes, the client should clear its local cache and re-fetch data through normal means.
 * @param client The language client for LSP communication
 * @param cluster The cluster name
 * @param database The database name (optional - if omitted, refreshes all databases in the cluster)
 */
export function refreshSchema(
    client: LanguageClient,
    cluster: string,
    database?: string
): Promise<void> {
    return client.sendRequest<void>(
        'kusto/refreshSchema',
        { cluster, database }
    );
}

/**
 * Refreshes the schema cache for all databases referenced by a document.
 * This includes databases accessed via cluster() and database() functions.
 * @param client The language client for LSP communication
 * @param uri The document URI
 */
export function refreshDocumentSchema(
    client: LanguageClient,
    uri: string
): Promise<void> {
    return client.sendRequest<void>(
        'kusto/refreshDocumentSchema',
        { uri }
    );
}

/** Result of inferring a document's connection from its content. */
export interface InferDocumentConnectionResult {
    connection?: string;
    cluster?: string;
    database?: string;
}

/**
 * Infers the connection for a document based on its content.
 * This analyzes the document for cluster() and database() references.
 * @param client The language client for LSP communication
 * @param uri The document URI
 * @returns The inferred connection info, or null if none could be inferred
 */
export function inferDocumentConnection(
    client: LanguageClient,
    uri: string
): Promise<InferDocumentConnectionResult | null> {
    return client.sendRequest<InferDocumentConnectionResult | null>(
        'kusto/inferDocumentConnection',
        { uri }
    );
}

/** Notification sent by the server when a document has been fully processed and is ready. */
export interface DocumentReadyNotification {
    uri: string;
}

/**
 * Ensures the server has a document. If the server doesn't have the document,
 * it will be added with the provided text. Always triggers a kusto/documentReady
 * notification from the server.
 * @param client The language client for LSP communication
 * @param uri The document URI
 * @param text The document text content
 */
export function ensureDocument(
    client: LanguageClient,
    uri: string,
    text: string
): Promise<void> {
    return client.sendRequest<void>(
        'kusto/ensureDocument',
        { uri, text }
    );
}

/** A diagnostic from validating a query. */
export interface ValidateQueryDiagnostic {
    range: Range;
    code?: string;
    message: string;
    severity: number;
}

/** Result of validating a query. */
export interface ValidateQueryResult {
    diagnostics: ValidateQueryDiagnostic[];
}

/**
 * Validates a query and returns any diagnostics.
 * This can be used to validate queries without opening them as documents.
 * @param client The language client for LSP communication
 * @param query The query text to validate
 * @param cluster The cluster name for schema context
 * @param database Optional database name for schema context
 * @returns The validation result with diagnostics, or null if validation failed
 */
export function validateQuery(
    client: LanguageClient,
    query: string,
    cluster: string,
    database?: string
): Promise<ValidateQueryResult | null> {
    return client.sendRequest<ValidateQueryResult | null>(
        'kusto/validateQuery',
        { query, cluster, database }
    );
}

/** Result of getting a minified query. */
export interface GetMinifiedQueryResult {
    minifiedQuery?: string;
}

/**
 * Gets the minified form of a query.
 * This removes unnecessary whitespace and formatting while preserving semantics.
 * @param client The language client for LSP communication
 * @param query The query text to minify
 * @returns The minified query text, or null if minification failed
 */
export function getMinifiedQuery(
    client: LanguageClient,
    query: string
): Promise<GetMinifiedQueryResult | null> {
    return client.sendRequest<GetMinifiedQueryResult | null>(
        'kusto/getMinifiedQuery',
        { query }
    );
}