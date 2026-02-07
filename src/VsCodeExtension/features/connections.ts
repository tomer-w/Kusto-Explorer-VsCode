import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

// Storage keys
const SERVERS_STORAGE_KEY = 'kusto.serversAndGroups';
const DOCUMENT_CONNECTIONS_KEY = 'kusto.documentConnections';

// Data types for document connections
interface DocumentConnection {
    uri: string;
    cluster: string | undefined;
    database: string | undefined;
}

// Data types for servers and server groups
interface ServerInfo {
    connection: string;
    cluster: string;
    displayName?: string;
}

interface ServerGroupInfo {
    name: string;
    servers: ServerInfo[];
}

type ServerOrGroup = ServerInfo | ServerGroupInfo;

interface ServersAndGroupsData {
    items: ServerOrGroup[];
}

/**
 * Type guard to check if an item is a ServerGroupInfo
 */
function isServerGroup(item: ServerOrGroup): item is ServerGroupInfo {
    return 'servers' in item;
}

/**
 * Type guard to check if an item is a ServerInfo
 */
function isServer(item: ServerOrGroup): item is ServerInfo {
    return 'cluster' in item;
}

/**
 * Extracts the hostname from a connection string.
 * @param connection The connection string (URL or hostname)
 * @returns The cluster hostname
 */
function getHostName(connection: string): string {
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

// Define tree item types
type KustoTreeItem = 
      NoConnectionTreeItem
    | ServerGroupTreeItem 
    | ServerTreeItem 
    | DatabaseTreeItem 
    | FolderTreeItem 
    | TableTreeItem;

class NoConnectionTreeItem extends vscode.TreeItem {
    constructor() {
        super('(No Connection)', vscode.TreeItemCollapsibleState.None);
        this.id = 'no-connection';
        this.contextValue = 'noConnection';
        this.iconPath = new vscode.ThemeIcon('circle-slash');
    }
}

class ServerGroupTreeItem extends vscode.TreeItem {
    constructor(public readonly groupInfo: ServerGroupInfo) {
        super(groupInfo.name, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `group:${groupInfo.name}`;
        this.contextValue = 'serverGroup';
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}

class ServerTreeItem extends vscode.TreeItem {
    constructor(
        public readonly connection: string,
        public readonly clusterName: string, 
        public readonly displayName?: string,
        public readonly groupName?: string
    ) {
        super(displayName ?? clusterName, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `server:${clusterName}`;
        this.contextValue = 'server';
        this.iconPath = new vscode.ThemeIcon('server');
        // Set command to prevent auto-expand on click (selection still fires)
        this.command = {
            command: 'kusto.selectServer',
            title: 'Select Server',
            arguments: [this]
        };
        if (displayName) {
            this.description = clusterName;
        }
    }
}

class DatabaseTreeItem extends vscode.TreeItem {
    constructor(public readonly clusterName: string, public readonly databaseName: string) {
        super(databaseName, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `database:${clusterName}:${databaseName}`;
        this.contextValue = 'database';
        this.iconPath = new vscode.ThemeIcon('database');
        // Set command to prevent auto-expand on click (selection still fires)
        this.command = {
            command: 'kusto.selectDatabase',
            title: 'Select Database',
            arguments: [this]
        };
    }
}

class FolderTreeItem extends vscode.TreeItem {
    constructor(public readonly label: string) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
     }
}


class TableTreeItem extends vscode.TreeItem {
    constructor(public readonly clusterName: string, public readonly databaseName: string, public readonly tableName: string) {
        super(tableName, vscode.TreeItemCollapsibleState.None);
        this.id = `table:${clusterName}:${databaseName}:${tableName}`;
        this.contextValue = 'table';
        this.iconPath = new vscode.ThemeIcon('table');
    }
}

class KustoConnectionsProvider implements vscode.TreeDataProvider<KustoTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<KustoTreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    // Extension context for accessing global state
    private context: vscode.ExtensionContext | undefined;

    // Language client for notifications
    private client: LanguageClient | undefined;

    // Servers and groups data - loaded from global state
    private serversAndGroups: ServersAndGroupsData = { items: [] };

    // Connection data - could come from LSP server
    private connections: { cluster: string, connection: string, databases?: { name: string, tables?: string[] }[] }[] = [];

    /**
     * Initializes the servers and groups from global state.
     * @param context The extension context to read global state from
     */
    initializeServersAndGroups(context: vscode.ExtensionContext): void {
        this.context = context;
        const data = this.loadServersAndGroups();
        this.setServersAndGroups(data);
    }

    /**
     * Loads servers and groups data from global state.
     * @returns The servers and groups data, or a default empty structure
     */
    loadServersAndGroups(): ServersAndGroupsData {
        if (!this.context) {
            return { items: [] };
        }
        const data = this.context.globalState.get<ServersAndGroupsData>(SERVERS_STORAGE_KEY);
        return data ?? { items: [] };
    }

    /**
     * Saves servers and groups data to global state.
     * @param data The servers and groups data to save
     */
    async saveServersAndGroups(data: ServersAndGroupsData): Promise<void> {
        if (!this.context) {
            return;
        }
        await this.context.globalState.update(SERVERS_STORAGE_KEY, data);
        
        // Notify server about the updated connections
        if (this.client) {
            const connections = this.getConnections();
            await this.client.sendNotification('kusto/connectionsUpdated', {
                connections: connections
            });
        }
    }

    /**
     * Sets the language client for notifications.
     * @param client The language client
     */
    setClient(client: LanguageClient): void {
        this.client = client;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    setConnections(data: typeof this.connections) {
        this.connections = data;
        this.refresh();
    }

    setServersAndGroups(data: ServersAndGroupsData) {
        this.serversAndGroups = data;
        this.refresh();
    }

    getServersAndGroups(): ServersAndGroupsData {
        return this.serversAndGroups;
    }

    /**
     * Adds a new server to the root level or to a specific group.
     * @param server The server info to add
     * @param groupName Optional group name to add the server to
     */
    async addServer(server: ServerInfo, groupName?: string): Promise<void> {
        if (groupName) {
            // Add to existing group
            const group = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === groupName
            ) as ServerGroupInfo | undefined;
            
            if (group) {
                group.servers.push(server);
            }
        } else {
            // Add to root level
            this.serversAndGroups.items.push(server);
        }
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Adds a new server group.
     * @param group The server group info to add
     */
    async addServerGroup(group: ServerGroupInfo): Promise<void> {
        this.serversAndGroups.items.push(group);
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Removes a server from the root level or from a specific group.
     * @param cluster The cluster name of the server to remove
     * @param groupName Optional group name to remove the server from
     */
    async removeServer(cluster: string, groupName?: string): Promise<void> {
        if (groupName) {
            // Remove from specific group
            const group = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === groupName
            ) as ServerGroupInfo | undefined;
            
            if (group) {
                group.servers = group.servers.filter(s => s.cluster !== cluster);
            }
        } else {
            // Remove from root level
            this.serversAndGroups.items = this.serversAndGroups.items.filter(
                item => !(isServer(item) && item.cluster === cluster)
            );
        }
        
        // Also remove from connections cache
        this.connections = this.connections.filter(c => c.cluster !== cluster);
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Removes a server group and all its servers.
     * @param groupName The name of the group to remove
     */
    async removeServerGroup(groupName: string): Promise<void> {
        // Find the group to get its servers for cleanup
        const group = this.serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === groupName
        ) as ServerGroupInfo | undefined;
        
        // Remove servers from connections cache
        if (group) {
            const clusterNames = group.servers.map(s => s.cluster);
            this.connections = this.connections.filter(c => !clusterNames.includes(c.cluster));
        }
        
        // Remove the group
        this.serversAndGroups.items = this.serversAndGroups.items.filter(
            item => !(isServerGroup(item) && item.name === groupName)
        );
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Moves a server from one location to another.
     * @param cluster The cluster name of the server to move
     * @param sourceGroupName The source group name (undefined for root level)
     * @param targetGroupName The target group name (undefined for root level)
     */
    async moveServer(cluster: string, sourceGroupName?: string, targetGroupName?: string): Promise<void> {
        // Find the server info first
        let serverInfo: ServerInfo | undefined;
        
        if (sourceGroupName) {
            const sourceGroup = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === sourceGroupName
            ) as ServerGroupInfo | undefined;
            serverInfo = sourceGroup?.servers.find(s => s.cluster === cluster);
        } else {
            serverInfo = this.serversAndGroups.items.find(
                item => isServer(item) && item.cluster === cluster
            ) as ServerInfo | undefined;
        }
        
        if (!serverInfo) {
            return;
        }
        
        // Make a copy to avoid reference issues
        const serverCopy: ServerInfo = { ...serverInfo };
        
        // Remove from source
        if (sourceGroupName) {
            const sourceGroup = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === sourceGroupName
            ) as ServerGroupInfo | undefined;
            if (sourceGroup) {
                sourceGroup.servers = sourceGroup.servers.filter(s => s.cluster !== cluster);
            }
        } else {
            this.serversAndGroups.items = this.serversAndGroups.items.filter(
                item => !(isServer(item) && item.cluster === cluster)
            );
        }
        
        // Add to target
        if (targetGroupName) {
            const targetGroup = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === targetGroupName
            ) as ServerGroupInfo | undefined;
            if (targetGroup) {
                targetGroup.servers.push(serverCopy);
            }
        } else {
            this.serversAndGroups.items.push(serverCopy);
        }
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Prompts the user to select a destination and moves the server.
     * @param cluster The cluster name of the server to move
     * @param displayName The display name of the server
     * @param currentGroupName The current group name (undefined for root level)
     */
    async promptMoveServer(cluster: string, displayName: string, currentGroupName?: string): Promise<void> {
        // Build list of available destinations
        const destinations: vscode.QuickPickItem[] = [];
        
        // Add root option if not already at root
        if (currentGroupName) {
            destinations.push({
                label: '$(home) Root',
                description: 'Move to root level'
            });
        }
        
        // Add all groups except the current one
        for (const item of this.serversAndGroups.items) {
            if (isServerGroup(item) && item.name !== currentGroupName) {
                destinations.push({
                    label: `$(folder) ${item.name}`,
                    description: `Move to group "${item.name}"`
                });
            }
        }
        
        if (destinations.length === 0) {
            vscode.window.showInformationMessage('No other destinations available. Create a group first.');
            return;
        }
        
        const selection = await vscode.window.showQuickPick(destinations, {
            placeHolder: `Select destination for "${displayName}"`
        });
        
        if (!selection) {
            return;
        }
        
        // Determine target group name
        let targetGroupName: string | undefined;
        if (!selection.label.startsWith('$(home)')) {
            // Extract group name from label (remove the icon prefix)
            targetGroupName = selection.label.replace('$(folder) ', '');
        }
        
        await this.moveServer(cluster, currentGroupName, targetGroupName);
    }

    /**
     * Edits a server's connection string and/or display name.
     * @param oldCluster The current cluster name of the server
     * @param newConnection The new connection string
     * @param newDisplayName The new display name (undefined to remove)
     * @param groupName The group name the server belongs to (undefined for root level)
     */
    async editServer(oldCluster: string, newConnection: string, newDisplayName?: string, groupName?: string): Promise<void> {
        let serverInfo: ServerInfo | undefined;
        
        if (groupName) {
            const group = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === groupName
            ) as ServerGroupInfo | undefined;
            serverInfo = group?.servers.find(s => s.cluster === oldCluster);
        } else {
            serverInfo = this.serversAndGroups.items.find(
                item => isServer(item) && item.cluster === oldCluster
            ) as ServerInfo | undefined;
        }
        
        if (!serverInfo) {
            return;
        }
        
        // Extract the new cluster hostname from the connection string
        const newCluster = getHostName(newConnection);
        
        // Update server info
        serverInfo.connection = newConnection;
        serverInfo.cluster = newCluster;
        if (newDisplayName && newDisplayName !== newCluster) {
            serverInfo.displayName = newDisplayName;
        } else {
            delete serverInfo.displayName;
        }
        
        // Update connections cache if cluster name changed
        if (oldCluster !== newCluster) {
            const connectionInfo = this.connections.find(c => c.cluster === oldCluster);
            if (connectionInfo) {
                connectionInfo.cluster = newCluster;
                connectionInfo.connection = newConnection;
            }
        }
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Prompts the user to edit a server's connection string.
     * The display name is preserved unless the cluster hostname changes.
     * @param connection The current connection string
     * @param cluster The current cluster name
     * @param displayName The current display name
     * @param groupName The group name the server belongs to (undefined for root level)
     */
    async promptEditServer(connection: string, cluster: string, displayName?: string, groupName?: string): Promise<void> {
        const newConnectionString = await vscode.window.showInputBox({
            prompt: 'Edit the connection URL or connection string',
            value: connection,
            placeHolder: 'e.g., myserver.kusto.windows.net'
        });

        if (!newConnectionString) {
            return; // User cancelled
        }

        // Extract hostname from new connection string
        const newCluster = getHostName(newConnectionString);
        
        // Keep existing display name if cluster hasn't changed, otherwise generate new one
        let newDisplayName: string | undefined;
        if (newCluster === cluster) {
            // Cluster unchanged, keep existing display name
            newDisplayName = displayName;
        } else {
            // Cluster changed, generate new display name from new cluster
            if (newCluster.endsWith('.kusto.windows.net')) {
                newDisplayName = newCluster.substring(0, newCluster.indexOf('.kusto.windows.net'));
            } else {
                newDisplayName = newCluster;
            }
        }

        await this.editServer(cluster, newConnectionString, newDisplayName, groupName);
    }

    /**
     * Prompts the user to add a new server.
     * @param groupName Optional group name to add the server to
     */
    async promptAddServer(groupName?: string): Promise<void> {
        const connectionString = await vscode.window.showInputBox({
            prompt: 'Enter the connection URL or connection string',
            placeHolder: 'e.g., myserver.kusto.windows.net'
        });

        if (!connectionString) {
            return;
        }

        // Extract cluster hostname from connection string
        const cluster = getHostName(connectionString);

        // Extract short name for display name
        var displayName = cluster;
        if (cluster.endsWith('.kusto.windows.net')) {
            displayName = cluster.substring(0, cluster.indexOf('.kusto.windows.net'));
        }

        const server: ServerInfo = { 
            connection: connectionString,
            cluster: cluster
        };
        if (displayName && displayName !== cluster) {
            server.displayName = displayName;
        }

        await this.addServer(server, groupName);
    }

    /**
     * Prompts the user to add a new server group.
     */
    async promptAddServerGroup(): Promise<void> {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter the group name',
            placeHolder: 'e.g., Production Clusters'
        });

        if (!name) {
            return;
        }

        const group: ServerGroupInfo = {
            name,
            servers: []
        };

        await this.addServerGroup(group);
    }

    /**
     * Prompts the user to rename a server's display name.
     * @param cluster The cluster name of the server
     * @param currentDisplayName The current display name
     * @param groupName The group name the server belongs to (undefined for root level)
     */
    async promptRenameServer(cluster: string, currentDisplayName: string, groupName?: string): Promise<void> {
        const newDisplayName = await vscode.window.showInputBox({
            prompt: 'Enter a new display name',
            value: currentDisplayName
        });

        if (newDisplayName === undefined || newDisplayName === currentDisplayName) {
            return; // User cancelled or no change
        }

        // Find the server and update its display name
        let serverInfo: ServerInfo | undefined;
        
        if (groupName) {
            const group = this.serversAndGroups.items.find(
                item => isServerGroup(item) && item.name === groupName
            ) as ServerGroupInfo | undefined;
            serverInfo = group?.servers.find(s => s.cluster === cluster);
        } else {
            serverInfo = this.serversAndGroups.items.find(
                item => isServer(item) && item.cluster === cluster
            ) as ServerInfo | undefined;
        }
        
        if (!serverInfo) {
            return;
        }
        
        if (newDisplayName && newDisplayName !== serverInfo.cluster) {
            serverInfo.displayName = newDisplayName;
        } else {
            delete serverInfo.displayName;
        }
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Prompts the user to rename a server group.
     * @param currentName The current name of the group
     */
    async promptRenameServerGroup(currentName: string): Promise<void> {
        const newName = await vscode.window.showInputBox({
            prompt: 'Enter a new group name',
            value: currentName
        });

        if (!newName || newName === currentName) {
            return; // User cancelled or no change
        }

        const group = this.serversAndGroups.items.find(
            item => isServerGroup(item) && item.name === currentName
        ) as ServerGroupInfo | undefined;
        
        if (!group) {
            return;
        }
        
        group.name = newName;
        
        await this.saveServersAndGroups(this.serversAndGroups);
        this.refresh();
    }

    /**
     * Ensures a connection entry exists for the given cluster.
     * If not found in connections, creates a new entry based on serversAndGroups data.
     * @param cluster The cluster name to find or create
     * @returns The connection info for the cluster
     */
    private ensureConnection(cluster: string): { cluster: string, connection: string, databases?: { name: string, tables?: string[] }[] } {
        let connectionInfo = this.connections.find(c => c.cluster === cluster);
        if (!connectionInfo) {
            // Look for the server in serversAndGroups
            let serverInfo: ServerInfo | undefined;
            for (const item of this.serversAndGroups.items) {
                if (isServerGroup(item)) {
                    serverInfo = item.servers.find(s => s.cluster === cluster);
                    if (serverInfo) break;
                } else if (item.cluster === cluster) {
                    serverInfo = item;
                    break;
                }
            }

            // Create a new connection entry
            connectionInfo = {
                cluster,
                connection: serverInfo?.connection ?? cluster,
                databases: []
            };
            this.connections.push(connectionInfo);
        }
        return connectionInfo;
    }

    setClusterDatabases(cluster: string, databases: { name: string, tables?: string[] }[]) {
        const connectionInfo = this.ensureConnection(cluster);
        connectionInfo.databases = databases;
        this.refresh();
    }

    setDatabaseContents(cluster: string, database: string, tables: string[]) {
        const connectionInfo = this.ensureConnection(cluster);
        let databaseInfo = connectionInfo.databases?.find(d => d.name === database);
        if (!databaseInfo) {
            // Create database entry if it doesn't exist
            if (!connectionInfo.databases) {
                connectionInfo.databases = [];
            }
            databaseInfo = { name: database, tables: [] };
            connectionInfo.databases.push(databaseInfo);
        }
        databaseInfo.tables = tables;
        this.refresh();
    }

    /**
     * Gets all available server connections from the connections panel.
     * @returns Array of server connection strings (cluster names)
     */
    getConnections(): string[] {
        const servers: string[] = [];
        
        for (const item of this.serversAndGroups.items) {
            if (isServerGroup(item)) {
                // Add all servers from the group
                for (const server of item.servers) {
                    servers.push(server.cluster);
                }
            } else {
                // Add individual server
                servers.push(item.cluster);
            }
        }
        
        return servers;
    }

    /**
     * Gets databases for a specific cluster.
     * @param clusterName The cluster name
     * @param client The language client to request database info from
     * @returns Promise resolving to array of database names
     */
    async getDatabases(clusterName: string, client: LanguageClient): Promise<string[]> {
        try {
            const result = await client.sendRequest<{ cluster: string; databases: { name: string; alternateName: string }[] } | null>(
                'kusto/getServerInfo',
                { connection: clusterName }
            );

            if (result && result.databases) {
                return result.databases.map(db => db.name);
            }
            
            return [];
        } catch (error) {
            console.error(`Failed to get databases for ${clusterName}:`, error);
            return [];
        }
    }

    getTreeItem(element: KustoTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: KustoTreeItem): KustoTreeItem[] | Thenable<KustoTreeItem[]> {
        if (!element) {
            // Root level - show "No Connection" first, then sorted groups, then sorted root-level servers
            const items: KustoTreeItem[] = [];
            
            // Add "No Connection" indicator at top
            items.push(new NoConnectionTreeItem());
            
            // Separate groups and servers
            const groups: ServerGroupTreeItem[] = [];
            const servers: ServerTreeItem[] = [];
            
            for (const item of this.serversAndGroups.items) {
                if (isServerGroup(item)) {
                    groups.push(new ServerGroupTreeItem(item));
                } else {
                    servers.push(new ServerTreeItem(item.connection, item.cluster, item.displayName));
                }
            }
            
            // Sort groups by name
            groups.sort((a, b) => 
                a.groupInfo.name.localeCompare(b.groupInfo.name, undefined, { sensitivity: 'base' })
            );
            
            // Sort servers by display name or cluster name
            servers.sort((a, b) => {
                const aName = a.displayName ?? a.clusterName;
                const bName = b.displayName ?? b.clusterName;
                return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
            });
            
            // Add groups first, then servers
            items.push(...groups);
            items.push(...servers);
            
            return items;
        }

        if (element instanceof ServerGroupTreeItem) {
            // Show servers within this group, sorted by display name
            const servers = element.groupInfo.servers.map(s => 
                new ServerTreeItem(s.connection, s.cluster, s.displayName, element.groupInfo.name)
            );
            
            servers.sort((a, b) => {
                const aName = a.displayName ?? a.clusterName;
                const bName = b.displayName ?? b.clusterName;
                return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
            });
            
            return servers;
        }
        
        if (element instanceof ServerTreeItem) {
            // Show databases for this cluster, sorted by name
            const cluster = this.connections.find(c => c.cluster === element.clusterName);
            const databases = cluster?.databases?.map(db => new DatabaseTreeItem(element.clusterName, db.name)) ?? [];
            
            databases.sort((a, b) => 
                a.databaseName.localeCompare(b.databaseName, undefined, { sensitivity: 'base' })
            );
            
            return databases;
        }
        
        if (element instanceof DatabaseTreeItem) {
            // Show tables for this database, sorted by name
            const cluster = this.connections.find(c => c.cluster === element.clusterName);
            const database = cluster?.databases?.find(db => db.name === element.databaseName);
            const tables = database?.tables?.map(t => new TableTreeItem(element.clusterName, element.databaseName, t)) ?? [];
            
            tables.sort((a, b) => 
                a.tableName.localeCompare(b.tableName, undefined, { sensitivity: 'base' })
            );
            
            return tables;
        }

        return [];
    }

    getParent(element: KustoTreeItem): KustoTreeItem | undefined
    {
        if (element instanceof TableTreeItem)
        {
            // Parent is the database
            return new DatabaseTreeItem(element.clusterName, element.databaseName);
        }

        if (element instanceof DatabaseTreeItem)
        {
            // Parent is the server - find it in the tree
            for (const item of this.serversAndGroups.items)
            {
                if (isServerGroup(item))
                {
                    const server = item.servers.find(s => s.cluster === element.clusterName);
                    if (server)
                    {
                        return new ServerTreeItem(server.connection, server.cluster, server.displayName, item.name);
                    }
                } else if (item.cluster === element.clusterName)
                {
                    return new ServerTreeItem(item.connection, item.cluster, item.displayName);
                }
            }
            return undefined;
        }

        if (element instanceof ServerTreeItem)
        {
            // If server is in a group, parent is the group
            if (element.groupName)
            {
                const group = this.serversAndGroups.items.find(
                    item => isServerGroup(item) && item.name === element.groupName
                ) as ServerGroupInfo | undefined;
                if (group)
                {
                    return new ServerGroupTreeItem(group);
                }
            }
            // Otherwise, server is at root level (no parent)
            return undefined;
        }

        // ServerGroupTreeItem and NoConnectionTreeItem are at root level (no parent)
        return undefined;
    }

    /**
     * Called when a server tree item is expanded.
     * Fetches database list from the language server.
     * @param clusterName The cluster name of the expanded server
     * @returns A promise that resolves when the server contents have been loaded
     */
    async onServerExpanded(clusterName: string, client?: LanguageClient): Promise<void> {
        if (!client) {
            console.log(`Server expanded: ${clusterName} (no client available)`);
            return;
        }

        try {
            const result = await client.sendRequest<{ cluster: string; databases: { name: string; alternateName: string }[] } | null>(
                'kusto/getServerInfo',
                { connection: clusterName }
            );

            if (result && result.databases) {
                const databases = result.databases.map(db => ({ name: db.name }));
                this.setClusterDatabases(clusterName, databases);
            }
        } catch (error) {
            console.error(`Failed to get server info for ${clusterName}:`, error);
            vscode.window.showErrorMessage(`Failed to load databases for ${clusterName}`);
        }
    }

    /**
     * Called when a database tree item is expanded.
     * Fetches table list from the language server.
     * @param clusterName The cluster name
     * @param databaseName The database name of the expanded database
     * @returns A promise that resolves when the database contents have been loaded
     */
    async onDatabaseExpanded(clusterName: string, databaseName: string, client?: LanguageClient): Promise<void> {
        if (!client) {
            console.log(`Database expanded: ${clusterName}/${databaseName} (no client available)`);
            return;
        }

        try {
            const result = await client.sendRequest<{ name: string; tables?: { name: string }[] } | null>(
                'kusto/getDatabaseInfo',
                { cluster: clusterName, database: databaseName }
            );

            if (result && result.tables) {
                const tables = result.tables.map(t => t.name);
                this.setDatabaseContents(clusterName, databaseName, tables);
            }
        } catch (error) {
            console.error(`Failed to get database info for ${clusterName}/${databaseName}:`, error);
            vscode.window.showErrorMessage(`Failed to load tables for ${clusterName}/${databaseName}`);
        }
    }
}

/**
 * Initializes the Kusto connections tree panel and sets up all related features.
 * @param context The extension context for accessing global state
 * @param client The language client to use for communication with the LSP server
 */
export async function activate(context: vscode.ExtensionContext, client: LanguageClient): Promise<void> {
const connectionsProvider = new KustoConnectionsProvider();
    
// Set the client reference for notifications
connectionsProvider.setClient(client);
    
// Create tree view to get access to expansion events
const treeView = vscode.window.createTreeView('kusto.connections', {
    treeDataProvider: connectionsProvider,
    showCollapseAll: true
});
context.subscriptions.push(treeView);

// Initialize servers and groups from global state
connectionsProvider.initializeServersAndGroups(context);

    // Send initial connections list to server
    const initialConnections = connectionsProvider.getConnections();
    client.sendNotification('kusto/connectionsUpdated', {
        connections: initialConnections
    });

    // Document connection management
    const documentConnections = new Map<string, DocumentConnection>();

    // Track whether we're programmatically updating the tree selection
    let isProgrammaticSelection = false;

    /**
     * Loads document connections from workspace state.
     */
    async function loadDocumentConnections(): Promise<void> {
        const stored = context.workspaceState.get<DocumentConnection[]>(DOCUMENT_CONNECTIONS_KEY);
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
        const connections = Array.from(documentConnections.values());
        await context.workspaceState.update(DOCUMENT_CONNECTIONS_KEY, connections);
    }

    // Create a status bar item for connection status
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0  // priority (higher = more to the left)
    );
    statusBarItem.text = "$(database) not connected";
    statusBarItem.tooltip = "Click to change connection";
    statusBarItem.command = "kusto.connectDatabase";
    statusBarItem.show();

    /**
     * Updates the status bar item to reflect the connection for the active document.
     */
    function updateStatusBar(): void {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor || editor.document.languageId !== 'kusto') {
            statusBarItem.hide();
            return;
        }

        statusBarItem.show();
        const connection = getDocumentConnection(editor.document.uri.toString());
        
        if (!connection?.cluster) {
            statusBarItem.text = `$(database) not connected`;
        } else if (!connection.database) {
            statusBarItem.text = `$(database) cluster('${connection.cluster}')`;
        } else {
            statusBarItem.text = `$(database) cluster('${connection.cluster}').database('${connection.database}')`;
        }
    }

    /**
     * Sets the connection for a document, updates status bar, and notifies the server.
     */
    async function setDocumentConnection(uri: string, cluster: string | undefined, database: string | undefined): Promise<void> {
        const connection: DocumentConnection = {
            uri,
            cluster: cluster ?? undefined,
            database: database ?? undefined
        };
        documentConnections.set(uri, connection);
        await saveDocumentConnections();

        // Update status bar if this is the active document
        if (vscode.window.activeTextEditor?.document.uri.toString() === uri) {
            updateStatusBar();
        }

        // Notify server of the connection change
        await client.sendNotification('kusto/documentConnectionChanged', {
            uri,
            cluster: cluster || null,
            database: database || null
        });
    }

    /**
     * Updates the tree selection to match the active document's connection.
     */
    async function updateTreeSelectionForActiveDocument(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'kusto') {
            await selectNeutralTreeItem();
            return;
        }
        
        const connection = getDocumentConnection(editor.document.uri.toString());
        
        if (!connection?.cluster) {
            await selectNeutralTreeItem();
            return;
        }

        isProgrammaticSelection = true;
        try {
            const itemToSelect = await findTreeItem(connection.cluster, connection.database);
            
            if (itemToSelect) {
                try {
                    const currentEditor = vscode.window.activeTextEditor;
                    if (currentEditor && currentEditor.document.languageId === 'kusto') {
                        await treeView.reveal(itemToSelect, { select: true, focus: false, expand: false });
                    }
                } catch {
                    // Silently ignore reveal errors
                }
            }
        } catch {
            // Silently fail - tree might not be fully loaded yet
        } finally {
            setTimeout(() => {
                isProgrammaticSelection = false;
            }, 50);
        }
    }

    /**
     * Selects the "No Connection" tree item to indicate no specific connection.
     */
    async function selectNeutralTreeItem(): Promise<void> {
        isProgrammaticSelection = true;
        try {
            const rootItems = await connectionsProvider.getChildren();
            const noConnectionItem = rootItems.find(item => item instanceof NoConnectionTreeItem);
            
            if (noConnectionItem) {
                try {
                    await treeView.reveal(noConnectionItem, { select: true, focus: false, expand: false });
                } catch {
                    // Silently ignore reveal errors
                }
            }
        } catch {
            // Silently fail
        } finally {
            setTimeout(() => {
                isProgrammaticSelection = false;
            }, 50);
        }
    }

    /**
     * Finds a tree item matching the cluster/database.
     * Returns the actual tree item instance from getChildren().
     * If looking for a database, ensures the server is expanded first.
     */
    async function findTreeItem(cluster: string, database: string | undefined): Promise<ServerTreeItem | DatabaseTreeItem | undefined> {
        // Get root items
        const rootItems = await connectionsProvider.getChildren();
        
        // First pass: find the server item
        let serverItem: ServerTreeItem | undefined;
        
        for (const item of rootItems) {
            if (item instanceof ServerGroupTreeItem) {
                // Check servers within group
                const groupItems = await connectionsProvider.getChildren(item);
                for (const sItem of groupItems) {
                    if (sItem instanceof ServerTreeItem && sItem.clusterName === cluster) {
                        serverItem = sItem;
                        break;
                    }
                }
            } else if (item instanceof ServerTreeItem && item.clusterName === cluster) {
                serverItem = item;
            }
            
            if (serverItem) {
                break;
            }
        }
        
        if (!serverItem) {
            return undefined; // Server not found
        }
        
        // If we're not looking for a database, return the server
        if (!database) {
            return serverItem;
        }
        
        // We need a database - ensure the server is expanded first
        // This triggers loading of databases if not already loaded
        await connectionsProvider.onServerExpanded(cluster, client);
        
        // Small delay to let the tree update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now try to find the database
        const dbItems = await connectionsProvider.getChildren(serverItem);
        for (const dbItem of dbItems) {
            if (dbItem instanceof DatabaseTreeItem && dbItem.databaseName === database) {
                return dbItem;
            }
        }
        
        // Database not found in tree (might not exist or not loaded yet)
        // Fall back to selecting the server
        return serverItem;
    }

    /**
     * Gets the connection for a document.
     */
    function getDocumentConnection(uri: string): DocumentConnection | undefined {
        return documentConnections.get(uri);
    }

    // Load document connections on startup
    await loadDocumentConnections();

    // Initialize connection info for documents that are already open
    // Server will create placeholder scripts if they don't exist yet
    for (const document of vscode.workspace.textDocuments) {
        if (document.languageId === 'kusto') {
            const connection = getDocumentConnection(document.uri.toString());
            await client.sendNotification('kusto/documentConnectionChanged', {
                uri: document.uri.toString(),
                cluster: connection?.cluster || null,
                database: connection?.database || null
            });
        }
    }

    // Handle document open events - notify server of connection
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (document.languageId === 'kusto') {
                const connection = getDocumentConnection(document.uri.toString());
                await client.sendNotification('kusto/documentConnectionChanged', {
                    uri: document.uri.toString(),
                    cluster: connection?.cluster || null,
                    database: connection?.database || null
                });
            }
        })
    );

    // Update status bar when active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            updateStatusBar();
            
            // Update tree selection to match the new active document
            await updateTreeSelectionForActiveDocument();
        })
    );

    // Initialize status bar for currently active editor
    updateStatusBar();

    // Handle tree selection changes - update document connection when user clicks
    context.subscriptions.push(
        treeView.onDidChangeSelection(async (event) => {
            // Ignore if this is a programmatic selection (not user-initiated)
            if (isProgrammaticSelection) {
                return;
            }

            if (event.selection.length === 0) {
                return;
            }

            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'kusto') {
                return;
            }

            const selected = event.selection[0];
            
            if (selected instanceof NoConnectionTreeItem) {
                // "No Connection" selected - clear the document connection
                await setDocumentConnection(
                    editor.document.uri.toString(),
                    undefined,
                    undefined
                );
            } else if (selected instanceof ServerTreeItem) {
                // Server selected - set connection with no database
                await setDocumentConnection(
                    editor.document.uri.toString(),
                    selected.clusterName,
                    undefined
                );
            } else if (selected instanceof DatabaseTreeItem) {
                // Database selected - set connection with cluster and database
                await setDocumentConnection(
                    editor.document.uri.toString(),
                    selected.clusterName,
                    selected.databaseName
                );
            }
            // Note: ServerGroupTreeItem (folder) selection is ignored - it's neutral
        })
    );

    // Initialize tree selection for active document (deferred to avoid activation issues)
    // Only do this if a Kusto document is actually active
    setTimeout(async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'kusto') {
            await updateTreeSelectionForActiveDocument();
        }
    }, 100);

    // Handle tree item expansion events
    context.subscriptions.push(
        treeView.onDidExpandElement(async (event) => {
            const element = event.element;
            
            if (element instanceof ServerTreeItem) {
                await connectionsProvider.onServerExpanded(element.clusterName, client);
            } else if (element instanceof DatabaseTreeItem) {
                await connectionsProvider.onDatabaseExpanded(element.clusterName, element.databaseName, client);
            }
        })
    );

    // Register commands for managing servers and groups
    context.subscriptions.push(
        // No-op commands to prevent auto-expand on click (onDidChangeSelection still fires)
        vscode.commands.registerCommand('kusto.selectServer', () => {
            // Command exists only to override default expand behavior
            // Actual logic is in onDidChangeSelection handler
        }),
        
        vscode.commands.registerCommand('kusto.selectDatabase', () => {
            // Command exists only to override default expand behavior
            // Actual logic is in onDidChangeSelection handler
        }),

        vscode.commands.registerCommand('kusto.addServer', async () => {
            await connectionsProvider.promptAddServer();
        }),

        vscode.commands.registerCommand('kusto.addServerToGroup', async (item: ServerGroupTreeItem) => {
            await connectionsProvider.promptAddServer(item.groupInfo.name);
        }),

        vscode.commands.registerCommand('kusto.addServerGroup', async () => {
            await connectionsProvider.promptAddServerGroup();
        }),

        vscode.commands.registerCommand('kusto.removeServer', async (item: ServerTreeItem) => {
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to remove connection "${item.displayName ?? item.clusterName}"?`,
                { modal: true },
                'Remove'
            );
            if (confirm === 'Remove') {
                await connectionsProvider.removeServer(item.clusterName, item.groupName);
            }
        }),

        vscode.commands.registerCommand('kusto.removeServerGroup', async (item: ServerGroupTreeItem) => {
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to remove group "${item.groupInfo.name}" and all its connections?`,
                { modal: true },
                'Remove'
            );
            if (confirm === 'Remove') {
                await connectionsProvider.removeServerGroup(item.groupInfo.name);
            }
        }),

        vscode.commands.registerCommand('kusto.moveServer', async (item: ServerTreeItem) => {
            await connectionsProvider.promptMoveServer(
                item.clusterName,
                item.displayName ?? item.clusterName,
                item.groupName
            );
        }),

        vscode.commands.registerCommand('kusto.editServer', async (item: ServerTreeItem) => {
            await connectionsProvider.promptEditServer(
                item.connection,
                item.clusterName,
                item.displayName,
                item.groupName
            );
        }),

        vscode.commands.registerCommand('kusto.renameServer', async (item: ServerTreeItem) => {
            await connectionsProvider.promptRenameServer(
                item.clusterName,
                item.displayName ?? item.clusterName,
                item.groupName
            );
        }),

        vscode.commands.registerCommand('kusto.renameServerGroup', async (item: ServerGroupTreeItem) => {
            await connectionsProvider.promptRenameServerGroup(item.groupInfo.name);
        }),

        vscode.commands.registerCommand('kusto.connectDatabase', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'kusto') {
                return;
            }

            // Get list of connections from the connections panel
            const connections = connectionsProvider.getConnections();
            
            if (connections.length === 0) {
                const addServer = await vscode.window.showInformationMessage(
                    'No server connections configured.',
                    'Add Server'
                );
                if (addServer) {
                    await vscode.commands.executeCommand('kusto.addServer');
                }
                return;
            }

            // Prompt user to select a cluster
            const cluster = await vscode.window.showQuickPick(connections, {
                placeHolder: 'Select a cluster',
                title: 'Select Cluster'
            });

            if (!cluster) {
                return; // User cancelled
            }

            // Get databases for the selected cluster
            const databases = await connectionsProvider.getDatabases(cluster, client);
            
            if (databases.length === 0) {
                const noDbSelection = await vscode.window.showInformationMessage(
                    `No databases found for cluster "${cluster}".`,
                    'Connect without database'
                );
                if (noDbSelection) {
                    // Connect with just cluster, no database
                    await setDocumentConnection(editor.document.uri.toString(), cluster, undefined);
                }
                return;
            }

            // Add "None" option for connecting without a database
            const databaseChoices = ['<None>', ...databases];

            // Prompt user to select a database
            const database = await vscode.window.showQuickPick(databaseChoices, {
                placeHolder: 'Select a database',
                title: `Select Database for ${cluster}`
            });

            if (!database) {
                return; // User cancelled
            }

            // Set the document connection (saves, updates status bar, and notifies server)
            await setDocumentConnection(
                editor.document.uri.toString(),
                cluster,
                database === '<None>' ? undefined : database
            );
        })
    );
}
