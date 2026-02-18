import { LanguageClient } from 'vscode-languageclient/node';

/**
 * Wrapper methods for LSP requests to the Kusto Language Server.
 * Centralizes all custom client.sendRequest calls so return type signatures
 * are defined in one place.
 */

/**
 * Runs a query at the given document URI and selection.
 */
export function runQuery(
    client: LanguageClient,
    uri: string,
    selection: SelectionRange
): Promise<RunQueryResult | null> {
    return client.sendRequest<RunQueryResult | null>(
        'kusto/runQuery',
        {
            textDocument: { uri },
            selection
        }
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
 * @returns The entity expression as a string, or null if not found
 */
export function getEntityAsExpression(
    client: LanguageClient,
    cluster: string,
    database: string,
    entityType: string,
    entityName: string
): Promise<string | null> {
    return client.sendRequest<string | null>(
        'kusto/getEntityAsExpression',
        { cluster, database, entityType, entityName }
    );
}

/**
 * Gets the HTML representation of data from the last run query.
 * @param client The language client for LSP communication
 * @param dataId The data ID from running a query
 * @returns The data result with HTML tables and row count, or null if not available
 */
export function getDataAsHmtlTables(
    client: LanguageClient,
    dataId: string
): Promise<DataAsHtmlTables | null> {
    return client.sendRequest<DataAsHtmlTables | null>(
        'kusto/getDataAsHtmlTables',
        {
            dataId
        }
    );
}

/**
 * Gets the HTML representation of a chart from the last run query.
 * @param client The language client for LSP communication
 * @param dataId The data ID from running a query
 * @param darkMode Whether to render the chart in dark mode
 * @returns The chart result with HTML, or null if not available
 */
export function getDataAsHtmlChart(
    client: LanguageClient,
    dataId: string,
    darkMode: boolean = false
): Promise<DataAsHtmlChart | null> {
    return client.sendRequest<DataAsHtmlChart | null>(
        'kusto/getDataAsHtmlChart',
        {
            dataId,
            darkMode
        }
    );
}

/**
 * Gets the query result data as a KQL datatable expression.
 * @param client The language client for LSP communication
 * @param dataId The data ID from running a query
 * @param tableName Optional name of a specific table to convert (defaults to first table)
 * @returns The datatable expression as a string, or null if not available
 */
export function getDataAsExpression(
    client: LanguageClient,
    dataId: string,
    tableName?: string
): Promise<DataAsExpression | null> {
    return client.sendRequest<DataAsExpression | null>(
        'kusto/getDataAsExpression',
        {
            dataId,
            tableName
        }
    );
}

export interface DatabaseTableInfo {
    name: string;
    description?: string;
    columns?: DatabaseColumnInfo[];
}

export interface DatabaseColumnInfo {
    name: string;
    type: string;
}

export interface DatabaseFunctionInfo {
    name: string;
    description?: string;
    parameters?: string;
    body?: string;
}

export interface DatabaseParameterInfo {
    name: string;
    type: string;
}

export interface DatabaseEntityGroupInfo {
    name: string;
    description?: string;
    entities?: string[];
}

export interface DatabaseGraphModelInfo {
    name: string;
    edges?: string[];
    nodes?: string[];
    snapshots?: string[];
}

export interface DatabaseInfo {
    name: string;
    tables?: DatabaseTableInfo[];
    externalTables?: DatabaseTableInfo[];
    materializedViews?: DatabaseTableInfo[];
    functions?: DatabaseFunctionInfo[];
    entityGroups?: DatabaseEntityGroupInfo[];
    graphModels?: DatabaseGraphModelInfo[];
}

/** Result of running a query. */
export interface RunQueryResult {
    dataId?: string;
    cluster?: string;
    database?: string;
}

/** A single HTML table from the query result. */
export interface HtmlTable {
    name: string;
    html: string;
    rowCount: number;
}

/** Result of getting data as html tables. */
export interface DataAsHtmlTables {
    tables: HtmlTable[];
    hasChart: boolean;
}

/** Result of getting data as html chart. */
export interface DataAsHtmlChart {
    html: string;
}

/** Result of getting data as a KQL expression. */
export interface DataAsExpression {
    expression: string;
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

/** Result of getting server info (databases) for a connection. */
export interface ServerInfoResult {
    cluster: string;
    databases: { name: string; alternateName: string }[];
}

/** Selection range passed to runQuery. */
export interface SelectionRange {
    start: Position;
    end: Position;
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




