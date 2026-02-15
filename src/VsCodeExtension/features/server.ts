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
    title: string;
    dataHtml: string;
    rowCount?: number;
    chartHtml?: string;
    cluster?: string;
    database?: string;
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

