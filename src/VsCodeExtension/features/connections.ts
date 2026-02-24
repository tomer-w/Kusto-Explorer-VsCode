import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as lspServer from './server';
import type { DatabaseInfo } from './server';

// =============================================================================
// Storage Keys
// =============================================================================

export const SERVERS_STORAGE_KEY = 'kusto.serversAndGroups';
export const DOCUMENT_CONNECTIONS_KEY = 'kusto.documentConnections';

// =============================================================================
// Data Types
// =============================================================================

/** Connection info for a single document (URI  cluster/database mapping). */
export interface DocumentConnection {
    uri: string;
    cluster: string | undefined;
    database: string | undefined;
}

/** Info about a configured server connection. */
export interface ServerInfo {
    connection: string;
    cluster: string;
    displayName?: string;
    serverKind?: string;
}

/** A named group of server connections. */
export interface ServerGroupInfo {
    name: string;
    servers: ServerInfo[];
}

/** A server or a group of servers. */
export type ServerOrGroup = ServerInfo | ServerGroupInfo;

/** Top-level structure for persisted servers and groups. */
export interface ServersAndGroupsData {
    items: ServerOrGroup[];
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if an item is a ServerGroupInfo.
 */
export function isServerGroup(item: ServerOrGroup): item is ServerGroupInfo {
    return 'servers' in item;
}

/**
 * Type guard to check if an item is a ServerInfo.
 */
export function isServer(item: ServerOrGroup): item is ServerInfo {
    return 'cluster' in item;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extracts the hostname from a connection string.
 * @param connection The connection string (URL or hostname)
 * @returns The cluster hostname
 */
export function getHostName(connection: string): string {
    let dataSource = connection;
    var connectionParts = connection.split(';');
    if (connectionParts.length > 1) {
        // Connection string with parameters; find the "Data Source" part
        const dataSourcePart = connectionParts.find(part => part.trim().toLowerCase().startsWith('data source='));
        if (dataSourcePart) {
            var dsParts = dataSourcePart.split('=');
            if (dsParts.length > 1 && dsParts[1]) {
                dataSource = dsParts[1].trim();
            }
        }
        else if (connectionParts[0]) {
            // no Data Source part; assume first part is the data source
            dataSource = connectionParts[0].trim();
        }
    }
    else if (connectionParts.length > 0 && connectionParts[0]) {
        dataSource = connectionParts[0].trim();
    }
    try {
        const url = new URL(dataSource.startsWith('https://') ? dataSource : `https://${dataSource}`);
        return url.hostname;
    } catch {
        // If it's not a valid URL, return as-is (might already be just a hostname)
        return dataSource;
    }
}

// =============================================================================
// Module-level State
// =============================================================================

let extensionContext: vscode.ExtensionContext | undefined;
let languageClient: LanguageClient | undefined;
const documentConnectionChangedListeners: ((uri: string) => Promise<void>)[] = [];
const serversAndGroupsChangedListeners: (() => void)[] = [];

/** Document connections (URI  connection mapping). */
const documentConnections = new Map<string, DocumentConnection>();

/** Servers and groups data - loaded from global state. */
let serversAndGroups: ServersAndGroupsData = { items: [] };

/** Connection data cache - cluster to databases mapping. */
let clusterConnections: { cluster: string, connection: string, databases?: DatabaseInfo[] }[] = [];

// =============================================================================
// Activation
// =============================================================================

/**
 * Activates the connections module with the extension context and language client.
 * Must be called before any other functions.
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    extensionContext = context;
    languageClient = client;
}

/**
 * Registers a listener that is called after a document connection changes.
 * Multiple listeners can be registered.
 */
export function registerOnDocumentConnectionChanged(callback: (uri: string) => Promise<void>): vscode.Disposable {
    documentConnectionChangedListeners.push(callback);
    return new vscode.Disposable(() => {
        const index = documentConnectionChangedListeners.indexOf(callback);
        if (index >= 0) documentConnectionChangedListeners.splice(index, 1);
    });
}

/**
 * Registers a listener that is called when servers and groups data changes.
 * Multiple listeners can be registered.
 */
export function registerOnServersAndGroupsChanged(callback: () => void): vscode.Disposable {
    serversAndGroupsChangedListeners.push(callback);
    return new vscode.Disposable(() => {
        const index = serversAndGroupsChangedListeners.indexOf(callback);
        if (index >= 0) serversAndGroupsChangedListeners.splice(index, 1);
    });
}

/** Raises the document connection changed event for all registered listeners. */
async function raiseDocumentConnectionChanged(uri: string): Promise<void> {
    for (const listener of documentConnectionChangedListeners) {
        await listener(uri);
    }
}

/** Raises the servers and groups changed event for all registered listeners. */
function raiseServersAndGroupsChanged(): void {
    for (const listener of serversAndGroupsChangedListeners) listener();
}

// =============================================================================
// Servers and Groups Management
// =============================================================================

/**
 * Loads servers and groups data from global state.
 */
export function loadServersAndGroups(): void {
    if (!extensionContext) return;
    const data = extensionContext.globalState.get<ServersAndGroupsData>(SERVERS_STORAGE_KEY);
    serversAndGroups = data ?? { items: [] };
}

/**
 * Saves servers and groups data to global state and notifies the language server.
 */
async function saveServersAndGroups(): Promise<void> {
    if (!extensionContext) return;
    await extensionContext.globalState.update(SERVERS_STORAGE_KEY, serversAndGroups);

    // Notify server about the updated connections
    if (languageClient) {
        const connectionsList = getConfiguredConnections();
        await languageClient.sendNotification('kusto/connectionsUpdated', {
            connections: connectionsList
        });
    }
}

/**
 * Gets the servers and groups data structure.
 */
export function getServersAndGroups(): ServersAndGroupsData {
    return serversAndGroups;
}

/**
 * Sorts the servers and groups data structure.
 * Groups are sorted alphabetically, then root-level servers.
 * Servers within each group are also sorted alphabetically.
 */
function sortServersAndGroups(): void {
    const getServerSortName = (s: ServerInfo) => (s.displayName ?? s.cluster).toLowerCase();
    const getGroupSortName = (g: ServerGroupInfo) => g.name.toLowerCase();

    // Sort servers within each group
    for (const item of serversAndGroups.items) {
        if (isServerGroup(item)) {
            item.servers.sort((a, b) => getServerSortName(a).localeCompare(getServerSortName(b)));
        }
    }

    // Separate groups and root-level servers
    const groups = serversAndGroups.items.filter(isServerGroup);
    const servers = serversAndGroups.items.filter(isServer);

    // Sort each separately
    groups.sort((a, b) => getGroupSortName(a).localeCompare(getGroupSortName(b)));
    servers.sort((a, b) => getServerSortName(a).localeCompare(getServerSortName(b)));

    // Rebuild with servers first, then groups
    serversAndGroups.items = [...servers, ...groups];
}

/**
 * Adds a new server to the root level or to a specific group.
 */
export async function addServer(server: ServerInfo, groupName?: string): Promise<void> {
    if (groupName) {
        const group = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === groupName
        ) as ServerGroupInfo | undefined;
        if (group) {
            group.servers.push(server);
        }
    } else {
        serversAndGroups.items.push(server);
    }

    sortServersAndGroups();
    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Adds a new server group.
 */
export async function addServerGroup(group: ServerGroupInfo): Promise<void> {
    serversAndGroups.items.push(group);
    sortServersAndGroups();
    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Removes a server from the root level or from a specific group.
 */
export async function removeServer(cluster: string, groupName?: string): Promise<void> {
    if (groupName) {
        const group = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === groupName
        ) as ServerGroupInfo | undefined;
        if (group) {
            group.servers = group.servers.filter(s => s.cluster !== cluster);
        }
    } else {
        serversAndGroups.items = serversAndGroups.items.filter(
            item => !(isServer(item) && item.cluster === cluster)
        );
    }

    // Also remove from connections cache
    clusterConnections = clusterConnections.filter(c => c.cluster !== cluster);

    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Removes a server group and all its servers.
 */
export async function removeServerGroup(groupName: string): Promise<void> {
    const group = serversAndGroups.items.find(
        item => isServerGroup(item) && item.name === groupName
    ) as ServerGroupInfo | undefined;

    // Remove servers from connections cache
    if (group) {
        const clusterNames = group.servers.map(s => s.cluster);
        clusterConnections = clusterConnections.filter(c => !clusterNames.includes(c.cluster));
    }

    serversAndGroups.items = serversAndGroups.items.filter(
        item => !(isServerGroup(item) && item.name === groupName)
    );

    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Moves a server from one location to another.
 */
export async function moveServer(cluster: string, sourceGroupName?: string, targetGroupName?: string): Promise<void> {
    let serverInfo: ServerInfo | undefined;

    if (sourceGroupName) {
        const sourceGroup = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === sourceGroupName
        ) as ServerGroupInfo | undefined;
        serverInfo = sourceGroup?.servers.find(s => s.cluster === cluster);
    } else {
        serverInfo = serversAndGroups.items.find(
            item => isServer(item) && item.cluster === cluster
        ) as ServerInfo | undefined;
    }

    if (!serverInfo) return;

    const serverCopy: ServerInfo = { ...serverInfo };

    // Remove from source
    if (sourceGroupName) {
        const sourceGroup = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === sourceGroupName
        ) as ServerGroupInfo | undefined;
        if (sourceGroup) {
            sourceGroup.servers = sourceGroup.servers.filter(s => s.cluster !== cluster);
        }
    } else {
        serversAndGroups.items = serversAndGroups.items.filter(
            item => !(isServer(item) && item.cluster === cluster)
        );
    }

    // Add to target
    if (targetGroupName) {
        const targetGroup = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === targetGroupName
        ) as ServerGroupInfo | undefined;
        if (targetGroup) {
            targetGroup.servers.push(serverCopy);
        }
    } else {
        serversAndGroups.items.push(serverCopy);
    }

    sortServersAndGroups();
    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Edits a server's connection string, cluster, display name, and/or server kind.
 */
export async function editServer(oldCluster: string, newConnection: string, newDisplayName?: string, newServerKind?: string, groupName?: string): Promise<void> {
    let serverInfo: ServerInfo | undefined;

    if (groupName) {
        const group = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === groupName
        ) as ServerGroupInfo | undefined;
        serverInfo = group?.servers.find(s => s.cluster === oldCluster);
    } else {
        serverInfo = serversAndGroups.items.find(
            item => isServer(item) && item.cluster === oldCluster
        ) as ServerInfo | undefined;
    }

    if (!serverInfo) return;

    const newCluster = getHostName(newConnection);

    serverInfo.connection = newConnection;
    serverInfo.cluster = newCluster;
    if (newDisplayName && newDisplayName !== newCluster) {
        serverInfo.displayName = newDisplayName;
    } else {
        delete serverInfo.displayName;
    }
    if (newServerKind) {
        serverInfo.serverKind = newServerKind;
    }

    // Update connections cache if cluster name changed
    if (oldCluster !== newCluster) {
        const connectionInfo = clusterConnections.find(c => c.cluster === oldCluster);
        if (connectionInfo) {
            connectionInfo.cluster = newCluster;
            connectionInfo.connection = newConnection;
        }
    }

    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Renames a server's display name.
 */
export async function renameServer(cluster: string, newDisplayName: string, groupName?: string): Promise<void> {
    let serverInfo: ServerInfo | undefined;

    if (groupName) {
        const group = serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === groupName
        ) as ServerGroupInfo | undefined;
        serverInfo = group?.servers.find(s => s.cluster === cluster);
    } else {
        serverInfo = serversAndGroups.items.find(
            item => isServer(item) && item.cluster === cluster
        ) as ServerInfo | undefined;
    }

    if (!serverInfo) return;

    if (newDisplayName && newDisplayName !== serverInfo.cluster) {
        serverInfo.displayName = newDisplayName;
    } else {
        delete serverInfo.displayName;
    }

    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

/**
 * Renames a server group.
 */
export async function renameServerGroup(currentName: string, newName: string): Promise<void> {
    const group = serversAndGroups.items.find(
        item => isServerGroup(item) && item.name === currentName
    ) as ServerGroupInfo | undefined;

    if (!group) return;

    group.name = newName;

    await saveServersAndGroups();
    raiseServersAndGroupsChanged();
}

// =============================================================================
// Database Cache Management
// =============================================================================

/**
 * Ensures a connection cache entry exists for the given cluster.
 */
function ensureClusterConnection(cluster: string): { cluster: string, connection: string, databases?: DatabaseInfo[] } {
    let connectionInfo = clusterConnections.find(c => c.cluster === cluster);
    if (!connectionInfo) {
        let serverInfo: ServerInfo | undefined;
        for (const item of serversAndGroups.items) {
            if (isServerGroup(item)) {
                serverInfo = item.servers.find(s => s.cluster === cluster);
                if (serverInfo) break;
            } else if (item.cluster === cluster) {
                serverInfo = item;
                break;
            }
        }

        connectionInfo = {
            cluster,
            connection: serverInfo?.connection ?? cluster,
            databases: []
        };
        clusterConnections.push(connectionInfo);
    }
    return connectionInfo;
}

/**
 * Sets the list of databases for a cluster.
 */
export function setClusterDatabases(cluster: string, databases: DatabaseInfo[]): void {
    const connectionInfo = ensureClusterConnection(cluster);
    connectionInfo.databases = databases;
    raiseServersAndGroupsChanged();
}

/**
 * Gets the cached database info list for a cluster.
 */
export function getClusterDatabases(cluster: string): DatabaseInfo[] | undefined {
    return clusterConnections.find(c => c.cluster === cluster)?.databases;
}

/**
 * Sets (or updates) cached database info for a cluster/database.
 */
export function setDatabaseInfo(cluster: string, databaseInfo: DatabaseInfo): void {
    const connectionInfo = ensureClusterConnection(cluster);
    if (!connectionInfo.databases) {
        connectionInfo.databases = [];
    }
    const existingIndex = connectionInfo.databases.findIndex(d => d.name === databaseInfo.name);
    if (existingIndex >= 0) {
        connectionInfo.databases[existingIndex] = databaseInfo;
    } else {
        connectionInfo.databases.push(databaseInfo);
    }
    raiseServersAndGroupsChanged();
}

/**
 * Gets cached database info for a specific cluster/database.
 */
export function getDatabaseInfo(cluster: string, database: string): DatabaseInfo | undefined {
    const connectionInfo = clusterConnections.find(c => c.cluster === cluster);
    return connectionInfo?.databases?.find(d => d.name === database);
}

// =============================================================================
// Server Expansion / Database Fetching
// =============================================================================

/**
 * Fetches databases for a cluster from the language server and caches them.
 * Called when a server tree item is expanded.
 */
export async function fetchDatabasesForCluster(clusterName: string): Promise<void> {
    if (!languageClient) return;

    try {
        const serverInfo = findServerInfo(clusterName);
        const serverKind = serverInfo?.serverKind ?? null;
        const result = await lspServer.getServerInfo(languageClient, clusterName, serverKind);

        if (result && result.databases) {
            const databases = result.databases.map(db => ({ name: db.name }));
            setClusterDatabases(clusterName, databases);
        }
    } catch (error) {
        console.error(`Failed to get server info for ${clusterName}:`, error);
        vscode.window.showErrorMessage(`Failed to load databases for ${clusterName}`);
    }
}

/**
 * Fetches full database info from the language server and caches it.
 * Called when a database tree item is expanded.
 */
export async function fetchDatabaseInfo(clusterName: string, databaseName: string): Promise<void> {
    if (!languageClient) return;

    try {
        const result = await lspServer.getDatabaseInfo(languageClient, clusterName, databaseName);
        if (result) {
            setDatabaseInfo(clusterName, result);
        }
    } catch (error) {
        console.error(`Failed to get database info for ${clusterName}/${databaseName}:`, error);
        vscode.window.showErrorMessage(`Failed to load database info for ${clusterName}/${databaseName}`);
    }
}

/**
 * Refreshes the schema for a cluster from the language server.
 * Clears the server-side and client-side caches, then triggers tree refresh
 * so data will be re-fetched through the normal expansion process.
 * Called when user requests refresh on a server tree item.
 */
export async function refreshClusterSchema(clusterName: string): Promise<void> {
    if (!languageClient) return;

    try {
        // Call server to refresh its schema cache
        await lspServer.refreshSchema(languageClient, clusterName);

        // Clear the client-side cache for this cluster so tree will re-fetch on expand
        const connectionInfo = clusterConnections.find(c => c.cluster === clusterName);
        if (connectionInfo) {
            connectionInfo.databases = [];
        }

        // Trigger tree refresh - items will re-fetch data when expanded
        raiseServersAndGroupsChanged();
    } catch (error) {
        console.error(`Failed to refresh schema for ${clusterName}:`, error);
        vscode.window.showErrorMessage(`Failed to refresh schema for ${clusterName}`);
    }
}

/**
 * Refreshes the schema for a specific database from the language server.
 * Clears the server-side and client-side caches, then triggers tree refresh
 * so data will be re-fetched through the normal expansion process.
 * Called when user requests refresh on a database tree item.
 */
export async function refreshDatabaseSchema(clusterName: string, databaseName: string): Promise<void> {
    if (!languageClient) return;

    try {
        // Call server to refresh its schema cache for this database
        await lspServer.refreshSchema(languageClient, clusterName, databaseName);

        // Clear the client-side cache for this database so tree will re-fetch on expand
        const connectionInfo = clusterConnections.find(c => c.cluster === clusterName);
        if (connectionInfo?.databases) {
            const dbIndex = connectionInfo.databases.findIndex(d => d.name === databaseName);
            if (dbIndex >= 0) {
                // Clear the detailed info, keep just the name
                connectionInfo.databases[dbIndex] = { name: databaseName };
            }
        }

        // Trigger tree refresh - items will re-fetch data when expanded
        raiseServersAndGroupsChanged();
    } catch (error) {
        console.error(`Failed to refresh schema for ${clusterName}/${databaseName}:`, error);
        vscode.window.showErrorMessage(`Failed to refresh schema for ${clusterName}/${databaseName}`);
    }
}

// =============================================================================
// Document Connection Management
// =============================================================================

/**
 * Loads document connections from workspace state.
 */
export async function loadDocumentConnections(): Promise<void> {
    if (!extensionContext) return;
    const stored = extensionContext.workspaceState.get<DocumentConnection[]>(DOCUMENT_CONNECTIONS_KEY);
    if (stored) {
        documentConnections.clear();
        for (const conn of stored) {
            documentConnections.set(conn.uri, conn);
        }
    }
}

/**
 * Saves document connections to workspace state.
 */
async function saveDocumentConnections(): Promise<void> {
    if (!extensionContext) return;
    const values = Array.from(documentConnections.values());
    await extensionContext.workspaceState.update(DOCUMENT_CONNECTIONS_KEY, values);
}

/**
 * Gets the connection for a document.
 */
export function getDocumentConnection(uri: string): DocumentConnection | undefined {
    return documentConnections.get(uri);
}

/**
 * Sets the connection for a document, saves it, and notifies the server.
 * Also calls the registered documentConnectionChanged callback for UI updates.
 */
export async function setDocumentConnection(uri: string, cluster: string | undefined, database: string | undefined): Promise<void> {
    if (!languageClient) {
        console.error('Language client not initialized');
        return;
    }

    const connection: DocumentConnection = {
        uri,
        cluster: cluster ?? undefined,
        database: database ?? undefined
    };
    documentConnections.set(uri, connection);
    await saveDocumentConnections();

    // Notify listeners (status bar + tree selection)
    await raiseDocumentConnectionChanged(uri);

    // Get server kind from serversAndGroups if cluster is specified
    let serverKind: string | null = null;
    if (cluster) {
        const info = findServerInfo(cluster);
        serverKind = info?.serverKind ?? null;
    }

    // Notify server of the connection change
    await languageClient.sendNotification('kusto/documentConnectionChanged', {
        uri,
        cluster: cluster || null,
        database: database || null,
        serverKind: serverKind
    });
}

// =============================================================================
// Server Info Helpers
// =============================================================================

/**
 * Finds a ServerInfo for a given cluster name by searching the servers and groups.
 */
export function findServerInfo(cluster: string): ServerInfo | undefined {
    for (const item of serversAndGroups.items) {
        if (isServerGroup(item)) {
            const server = item.servers.find(s => s.cluster === cluster);
            if (server) {
                return server;
            }
        } else if (isServer(item) && item.cluster === cluster) {
            return item;
        }
    }
    return undefined;
}

/**
 * Gets the server kind for a connection string from the language server.
 */
export async function fetchServerKind(connectionString: string): Promise<string | undefined> {
    if (!languageClient) return undefined;
    try {
        const result = await lspServer.getServerKind(languageClient, connectionString);
        return result?.serverKind;
    } catch (error) {
        console.error(`Failed to get server kind for ${connectionString}:`, error);
        return undefined;
    }
}

// =============================================================================
// Exported Query Functions
// =============================================================================

/**
 * Gets the list of configured server connections.
 * @returns Array of cluster names
 */
export function getConfiguredConnections(): string[] {
    const servers: string[] = [];
    for (const item of serversAndGroups.items) {
        if (isServerGroup(item)) {
            for (const server of item.servers) {
                servers.push(server.cluster);
            }
        } else {
            servers.push(item.cluster);
        }
    }
    return servers;
}

/**
 * Gets the list of databases for a cluster from the language server.
 * @param cluster The cluster name
 * @returns Promise resolving to array of database names
 */
export async function getDatabasesForCluster(cluster: string): Promise<string[]> {
    if (!languageClient) {
        return [];
    }

    try {
        const serverInfo = findServerInfo(cluster);
        const serverKind = serverInfo?.serverKind ?? null;
        const result = await lspServer.getServerInfo(languageClient, cluster, serverKind);

        if (result && result.databases) {
            return result.databases.map(db => db.name);
        }

        return [];
    } catch (error) {
        console.error(`Failed to get databases for ${cluster}:`, error);
        return [];
    }
}

/**
 * Gets the schema information for a database.
 * Fetches from server if not cached.
 * @param cluster The cluster name
 * @param database The database name
 * @returns Promise resolving to database info or undefined
 */
export async function getDatabaseSchema(cluster: string, database: string): Promise<DatabaseInfo | undefined> {
    if (!languageClient) {
        return undefined;
    }

    // Check if we already have the info cached
    let dbInfo = getDatabaseInfo(cluster, database);
    if (dbInfo && dbInfo.tables) {
        return dbInfo;
    }

    // Fetch from server
    try {
        const result = await lspServer.getDatabaseInfo(languageClient, cluster, database);

        if (result) {
            setDatabaseInfo(cluster, result);
            return result;
        }
    } catch (error) {
        console.error(`Failed to get database info for ${cluster}/${database}:`, error);
    }

    return undefined;
}

/**
 * Gets the connection for the active document.
 * @returns The cluster and database for the active document, or undefined
 */
export function getActiveDocumentConnection(): { cluster: string; database: string | undefined } | undefined {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'kusto') {
        return undefined;
    }

    const connection = getDocumentConnection(editor.document.uri.toString());
    if (!connection?.cluster) {
        return undefined;
    }

    return {
        cluster: connection.cluster,
        database: connection.database
    };
}
