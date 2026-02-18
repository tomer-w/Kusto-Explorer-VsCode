import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as lspServer from './server';
import { setClipboardContext } from './clipboard';
import * as connections from './connections';
import { getHostName, isServerGroup } from './connections';
import type { ServerInfo, ServerGroupInfo } from './connections';
import type { DatabaseTableInfo, DatabaseColumnInfo, DatabaseFunctionInfo, DatabaseEntityGroupInfo, DatabaseGraphModelInfo } from './server';


// =============================================================================
// Activation function
// =============================================================================

/**
 * Initializes the Kusto connections tree panel and sets up all related features.
 * @param context The extension context for accessing global state
 * @param client The language client to use for communication with the LSP server
 */
export async function activate(context: vscode.ExtensionContext, client: LanguageClient): Promise<void> {
    // Initialize module-level state
    languageClient = client;
    connectionsProvider = new KustoConnectionsProvider();
    
    // Register for connection change events
    context.subscriptions.push(connections.registerOnDocumentConnectionChanged(async (uri: string) => {
        if (vscode.window.activeTextEditor?.document.uri.toString() === uri) {
            await updateTreeSelectionForActiveDocument();
        }
    }));
    context.subscriptions.push(connections.registerOnServersAndGroupsChanged(() => {
        connectionsProvider?.refresh();
    }));
    
    // Create tree view with drag and drop support
    treeView = vscode.window.createTreeView('kusto.connections', {
        treeDataProvider: connectionsProvider,
        showCollapseAll: true,
        dragAndDropController: new KustoDragAndDropController()
    });
    context.subscriptions.push(treeView);

    // Load servers and groups from global state
    connections.loadServersAndGroups();

    // Send initial connections list to server
    const initialConnections = connections.getConfiguredConnections();
    client.sendNotification('kusto/connectionsUpdated', {
        connections: initialConnections
    });

    // Load document connections on startup
    await connections.loadDocumentConnections();

    // Initialize connection info for documents that are already open
    for (const document of vscode.workspace.textDocuments) {
        if (document.languageId === 'kusto') {
            const connection = connections.getDocumentConnection(document.uri.toString());
            const serverKind = connection?.cluster ? (connections.findServerInfo(connection.cluster)?.serverKind ?? null) : null;
            await client.sendNotification('kusto/documentConnectionChanged', {
                uri: document.uri.toString(),
                cluster: connection?.cluster || null,
                database: connection?.database || null,
                serverKind: serverKind
            });
        }
    }

    // Handle document open events - notify server of connection
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (document) => {
            if (document.languageId === 'kusto') {
                const connection = connections.getDocumentConnection(document.uri.toString());
                const serverKind = connection?.cluster ? (connections.findServerInfo(connection.cluster)?.serverKind ?? null) : null;
                await client.sendNotification('kusto/documentConnectionChanged', {
                    uri: document.uri.toString(),
                    cluster: connection?.cluster || null,
                    database: connection?.database || null,
                    serverKind: serverKind
                });
            }
        })
    );

    // Update tree selection when active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async () => {
            await updateTreeSelectionForActiveDocument();
        })
    );

    // Set initial context for view visibility
    const initialEditor = vscode.window.activeTextEditor;
    const initialIsKusto = initialEditor && initialEditor.document.languageId === 'kusto';
    await vscode.commands.executeCommand('setContext', 'kusto.hasActiveDocument', initialIsKusto);

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
                await connections.setDocumentConnection(editor.document.uri.toString(), undefined, undefined);
            } else if (selected instanceof ServerTreeItem) {
                await connections.setDocumentConnection(editor.document.uri.toString(), selected.clusterName, undefined);
            } else if (selected instanceof DatabaseTreeItem) {
                await connections.setDocumentConnection(editor.document.uri.toString(), selected.clusterName, selected.databaseName);
            }
        })
    );

    // Initialize tree selection for active document (deferred to avoid activation issues)
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
                await connections.fetchDatabasesForCluster(element.clusterName);
            } else if (element instanceof DatabaseTreeItem) {
                await connections.fetchDatabaseInfo(element.clusterName, element.databaseName);
            }
        })
    );

    // Register commands for managing servers and groups
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.selectServer', () => {}),
        vscode.commands.registerCommand('kusto.selectDatabase', () => {}),

        vscode.commands.registerCommand('kusto.addServer', async () => {
            await connectionsProvider!.promptAddServer();
        }),

        vscode.commands.registerCommand('kusto.addServerToGroup', async (item: ServerGroupTreeItem) => {
            await connectionsProvider!.promptAddServer(item.groupInfo.name);
        }),

        vscode.commands.registerCommand('kusto.addServerGroup', async () => {
            await connectionsProvider!.promptAddServerGroup();
        }),

        vscode.commands.registerCommand('kusto.removeServer', async (item: ServerTreeItem) => {
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to remove connection "${item.displayName ?? item.clusterName}"?`,
                { modal: true },
                'Remove'
            );
            if (confirm === 'Remove') {
                await connections.removeServer(item.clusterName, item.groupName);
            }
        }),

        vscode.commands.registerCommand('kusto.removeServerGroup', async (item: ServerGroupTreeItem) => {
            const confirm = await vscode.window.showWarningMessage(
                `Are you sure you want to remove group "${item.groupInfo.name}" and all its connections?`,
                { modal: true },
                'Remove'
            );
            if (confirm === 'Remove') {
                await connections.removeServerGroup(item.groupInfo.name);
            }
        }),

        vscode.commands.registerCommand('kusto.moveServer', async (item: ServerTreeItem) => {
            await connectionsProvider!.promptMoveServer(
                item.clusterName,
                item.displayName ?? item.clusterName,
                item.groupName
            );
        }),

        vscode.commands.registerCommand('kusto.editServer', async (item: ServerTreeItem) => {
            await connectionsProvider!.promptEditServer(
                item.connection,
                item.clusterName,
                item.displayName,
                item.groupName
            );
        }),

        vscode.commands.registerCommand('kusto.renameServer', async (item: ServerTreeItem) => {
            await connectionsProvider!.promptRenameServer(
                item.clusterName,
                item.displayName ?? item.clusterName,
                item.groupName
            );
        }),

        vscode.commands.registerCommand('kusto.renameServerGroup', async (item: ServerGroupTreeItem) => {
            await connectionsProvider!.promptRenameServerGroup(item.groupInfo.name);
        }),

        vscode.commands.registerCommand('kusto.copyEntityAsCommand', async (item: EntityTreeItem) => {
            if (!client) {
                return;
            }

            const entityType = getEntityType(item);
            if (!entityType) {
                return;
            }

            const entityName = getEntityName(item);

            try {
                const definition = await lspServer.getEntityAsCommand(
                    client,
                    item.clusterName,
                    item.databaseName,
                    entityType,
                    entityName
                );

                if (definition) {
                    await vscode.env.clipboard.writeText(definition);
                    setClipboardContext({
                        text: definition,
                        kind: 'command',
                        entityCluster: item.clusterName,
                        entityDatabase: item.databaseName,
                        entityType: entityType,
                        entityName: entityName
                    });
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to copy entity: ${error}`);
            }
        }),

        vscode.commands.registerCommand('kusto.copyEntityAsExpression', async (item: EntityTreeItem) => {
            if (!client) {
                return;
            }

            const entityType = getEntityType(item);
            if (!entityType) {
                return;
            }

            const entityName = getEntityName(item);

            try {
                const expression = await lspServer.getEntityAsExpression(
                    client,
                    item.clusterName,
                    item.databaseName,
                    entityType,
                    entityName
                );

                if (expression) {
                    await vscode.env.clipboard.writeText(expression);
                    setClipboardContext({
                        text: expression,
                        kind: 'expression',
                        entityCluster: item.clusterName,
                        entityDatabase: item.databaseName,
                        entityType: entityType,
                        entityName: entityName
                    });
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to copy expression: ${error}`);
            }
        }),

        vscode.commands.registerCommand('kusto.connectDatabase', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'kusto') {
                return;
            }

            const clusterNames = connections.getConfiguredConnections();
            
            if (clusterNames.length === 0) {
                const addServer = await vscode.window.showInformationMessage(
                    'No server connections configured.',
                    'Add Server'
                );
                if (addServer) {
                    await vscode.commands.executeCommand('kusto.addServer');
                }
                return;
            }

            const cluster = await vscode.window.showQuickPick(clusterNames, {
                placeHolder: 'Select a cluster',
                title: 'Select Cluster'
            });

            if (!cluster) {
                return;
            }

            const databases = await connections.getDatabasesForCluster(cluster);
            
            if (databases.length === 0) {
                const noDbSelection = await vscode.window.showInformationMessage(
                    `No databases found for cluster "${cluster}".`,
                    'Connect without database'
                );
                if (noDbSelection) {
                    await connections.setDocumentConnection(editor.document.uri.toString(), cluster, undefined);
                }
                return;
            }

            const databaseChoices = ['<None>', ...databases];
            const database = await vscode.window.showQuickPick(databaseChoices, {
                placeHolder: 'Select a database',
                title: `Select Database for ${cluster}`
            });

            if (!database) {
                return;
            }

            await connections.setDocumentConnection(
                editor.document.uri.toString(),
                cluster,
                database === '<None>' ? undefined : database
            );
        })
    );
}

// =============================================================================
// Entity Helper Functions
// =============================================================================

/** Entity tree item types that support copy operations */
type EntityTreeItem = TableTreeItem | ExternalTableTreeItem | MaterializedViewTreeItem | FunctionTreeItem | EntityGroupTreeItem | GraphModelTreeItem;

/** Maps contextValue to the entity type expected by the server */
const entityTypeMap: Record<string, string> = {
    'table': 'Table',
    'externalTable': 'ExternalTable',
    'materializedView': 'MaterializedView',
    'function': 'Function',
    'entityGroup': 'EntityGroup',
    'graphModel': 'Graph'
};

/**
 * Gets the entity type string for a tree item based on its contextValue.
 * @param item The entity tree item
 * @returns The entity type string, or undefined if not a recognized entity type
 */
function getEntityType(item: EntityTreeItem): string | undefined {
    return entityTypeMap[item.contextValue ?? ''];
}

/**
 * Gets the entity name from a tree item.
 * @param item The entity tree item
 * @returns The entity name
 */
function getEntityName(item: EntityTreeItem): string {
    if (item instanceof TableTreeItem || item instanceof ExternalTableTreeItem) {
        return item.tableInfo.name;
    } else if (item instanceof MaterializedViewTreeItem) {
        return item.viewInfo.name;
    } else if (item instanceof FunctionTreeItem) {
        return item.functionInfo.name;
    } else if (item instanceof EntityGroupTreeItem) {
        return item.groupInfo.name;
    } else if (item instanceof GraphModelTreeItem) {
        return item.graphInfo.name;
    }
    // This should never happen if EntityTreeItem type is correct
    throw new Error(`Unknown entity tree item type`);
}

// =============================================================================
// Connection Tree Provider
// =============================================================================

// Define tree item types
type KustoTreeItem = 
  NoConnectionTreeItem
| ServerGroupTreeItem 
| ServerTreeItem 
| DatabaseTreeItem 
| DatabaseFolderTreeItem 
| TableTreeItem
| ExternalTableTreeItem
| MaterializedViewTreeItem
| ColumnTreeItem
| FunctionTreeItem
| EntityGroupTreeItem
| EntityGroupMemberTreeItem
| GraphModelTreeItem;

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

/**
 * Returns the appropriate ThemeIcon for a server based on its kind.
 * @param serverKind The kind of server (Engine, DataManager, ClusterManager)
 * @returns A ThemeIcon for the server type
 */
function getServerKindIcon(serverKind?: string): vscode.ThemeIcon {
    switch (serverKind) {
        case 'Engine':
            return new vscode.ThemeIcon('server'); // Server icon for query engine
        case 'DataManager':
            return new vscode.ThemeIcon('cloud-upload'); // Cloud upload for data ingestion
        case 'ClusterManager':
            return new vscode.ThemeIcon('settings-gear'); // Gear for cluster management
        default:
            return new vscode.ThemeIcon('server'); // Default server icon
    }
}

class ServerTreeItem extends vscode.TreeItem {
    constructor(
        public readonly connection: string,
        public readonly clusterName: string, 
        public readonly displayName?: string,
        public readonly groupName?: string,
        public readonly serverKind?: string
    ) {
        const name = displayName ?? clusterName;
        
        super(name, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `server:${clusterName}`;
        this.contextValue = 'server';
        this.iconPath = getServerKindIcon(serverKind);
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

/** Folder types for organizing database entities */
type DatabaseFolderType = 'tables' | 'externalTables' | 'materializedViews' | 'functions' | 'entityGroups' | 'graphModels';

class DatabaseFolderTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly folderType: DatabaseFolderType,
        label: string,
        icon: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.id = `folder:${clusterName}:${databaseName}:${folderType}`;
        this.contextValue = 'databaseFolder';
        this.iconPath = new vscode.ThemeIcon(icon);
    }
}

class TableTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly tableInfo: DatabaseTableInfo
    ) {
        // Collapsible if there are columns
        const hasColumns = tableInfo.columns && tableInfo.columns.length > 0;
        super(tableInfo.name, hasColumns ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.id = `table:${clusterName}:${databaseName}:${tableInfo.name}`;
        this.contextValue = 'table';
        this.iconPath = new vscode.ThemeIcon('table');
        if (tableInfo.description) {
            this.tooltip = tableInfo.description;
        }
    }
}

class ExternalTableTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly tableInfo: DatabaseTableInfo
    ) {
        // Collapsible if there are columns
        const hasColumns = tableInfo.columns && tableInfo.columns.length > 0;
        super(tableInfo.name, hasColumns ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.id = `externalTable:${clusterName}:${databaseName}:${tableInfo.name}`;
        this.contextValue = 'externalTable';
        this.iconPath = new vscode.ThemeIcon('cloud');
        if (tableInfo.description) {
            this.tooltip = tableInfo.description;
        }
    }
}

class MaterializedViewTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly viewInfo: DatabaseTableInfo
    ) {
        // Collapsible if there are columns
        const hasColumns = viewInfo.columns && viewInfo.columns.length > 0;
        super(viewInfo.name, hasColumns ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.id = `materializedView:${clusterName}:${databaseName}:${viewInfo.name}`;
        this.contextValue = 'materializedView';
        this.iconPath = new vscode.ThemeIcon('eye');
        if (viewInfo.description) {
            this.tooltip = viewInfo.description;
        }
    }
}

/** Entity type for column parent tracking */
type ColumnParentType = 'table' | 'externalTable' | 'materializedView';

class ColumnTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly parentName: string,
        public readonly parentType: ColumnParentType,
        public readonly columnInfo: DatabaseColumnInfo
    ) {
        super(columnInfo.name, vscode.TreeItemCollapsibleState.None);
        this.id = `column:${clusterName}:${databaseName}:${parentType}:${parentName}:${columnInfo.name}`;
        this.contextValue = 'column';
        this.iconPath = new vscode.ThemeIcon('symbol-field');
        this.description = columnInfo.type;
    }
}

class FunctionTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly functionInfo: DatabaseFunctionInfo
    ) {
        super(functionInfo.name, vscode.TreeItemCollapsibleState.None);
        this.id = `function:${clusterName}:${databaseName}:${functionInfo.name}`;
        this.contextValue = 'function';
        this.iconPath = new vscode.ThemeIcon('symbol-function');
        if (functionInfo.parameters) {
            this.description = functionInfo.parameters;
        }
        if (functionInfo.description) {
            this.tooltip = functionInfo.description;
        }
    }
}

class EntityGroupTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly groupInfo: DatabaseEntityGroupInfo
    ) {
        // Collapsible if there are entities
        const hasEntities = groupInfo.entities && groupInfo.entities.length > 0;
        super(groupInfo.name, hasEntities ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.id = `entityGroup:${clusterName}:${databaseName}:${groupInfo.name}`;
        this.contextValue = 'entityGroup';
        this.iconPath = new vscode.ThemeIcon('symbol-namespace');
        if (groupInfo.description) {
            this.tooltip = groupInfo.description;
        }
    }
}

class EntityGroupMemberTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly groupName: string,
        public readonly entityName: string
    ) {
        super(entityName, vscode.TreeItemCollapsibleState.None);
        this.id = `entityGroupMember:${clusterName}:${databaseName}:${groupName}:${entityName}`;
        this.contextValue = 'entityGroupMember';
        this.iconPath = new vscode.ThemeIcon('symbol-reference');
    }
}

class GraphModelTreeItem extends vscode.TreeItem {
    constructor(
        public readonly clusterName: string,
        public readonly databaseName: string,
        public readonly graphInfo: DatabaseGraphModelInfo
    ) {
        super(graphInfo.name, vscode.TreeItemCollapsibleState.None);
        this.id = `graphModel:${clusterName}:${databaseName}:${graphInfo.name}`;
        this.contextValue = 'graphModel';
        this.iconPath = new vscode.ThemeIcon('type-hierarchy');
    }
}

class KustoConnectionsProvider implements vscode.TreeDataProvider<KustoTreeItem>
{
    private _onDidChangeTreeData = new vscode.EventEmitter<KustoTreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    // =========================================================================
    // UI Prompt Methods
    // =========================================================================

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

        // Fetch server kind from the language server
        const serverKind = await connections.fetchServerKind(connectionString);
        if (serverKind) {
            server.serverKind = serverKind;
        }

        await connections.addServer(server, groupName);
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

        await connections.addServerGroup(group);
    }

    /**
     * Prompts the user to select a destination and moves the server.
     */
    async promptMoveServer(cluster: string, displayName: string, currentGroupName?: string): Promise<void> {
        const destinations: vscode.QuickPickItem[] = [];

        if (currentGroupName) {
            destinations.push({
                label: '$(home) Root',
                description: 'Move to root level'
            });
        }

        for (const item of connections.getServersAndGroups().items) {
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

        let targetGroupName: string | undefined;
        if (!selection.label.startsWith('$(home)')) {
            targetGroupName = selection.label.replace('$(folder) ', '');
        }

        await connections.moveServer(cluster, currentGroupName, targetGroupName);
    }

    /**
     * Prompts the user to edit a server's connection string.
     */
    async promptEditServer(connection: string, cluster: string, displayName?: string, groupName?: string): Promise<void> {
        const newConnectionString = await vscode.window.showInputBox({
            prompt: 'Edit the connection URL or connection string',
            value: connection,
            placeHolder: 'e.g., myserver.kusto.windows.net'
        });

        if (!newConnectionString) {
            return;
        }

        const newCluster = getHostName(newConnectionString);

        let newDisplayName: string | undefined;
        if (newCluster === cluster) {
            newDisplayName = displayName;
        } else {
            if (newCluster.endsWith('.kusto.windows.net')) {
                newDisplayName = newCluster.substring(0, newCluster.indexOf('.kusto.windows.net'));
            } else {
                newDisplayName = newCluster;
            }
        }

        // Fetch server kind from the language server
        const serverKind = await connections.fetchServerKind(newConnectionString);

        await connections.editServer(cluster, newConnectionString, newDisplayName, serverKind ?? undefined, groupName);
    }

    /**
     * Prompts the user to rename a server's display name.
     */
    async promptRenameServer(cluster: string, currentDisplayName: string, groupName?: string): Promise<void> {
        const newDisplayName = await vscode.window.showInputBox({
            prompt: 'Enter a new display name',
            value: currentDisplayName
        });

        if (newDisplayName === undefined || newDisplayName === currentDisplayName) {
            return;
        }

        await connections.renameServer(cluster, newDisplayName, groupName);
    }

    /**
     * Prompts the user to rename a server group.
     */
    async promptRenameServerGroup(currentName: string): Promise<void> {
        const newName = await vscode.window.showInputBox({
            prompt: 'Enter a new group name',
            value: currentName
        });

        if (!newName || newName === currentName) {
            return;
        }

        await connections.renameServerGroup(currentName, newName);
    }

    // =========================================================================
    // Tree Data Provider Implementation
    // =========================================================================

    getTreeItem(element: KustoTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: KustoTreeItem): KustoTreeItem[] | Thenable<KustoTreeItem[]> {
        if (!element) {
            const items: KustoTreeItem[] = [];

            items.push(new NoConnectionTreeItem());

            const groups: ServerGroupTreeItem[] = [];
            const servers: ServerTreeItem[] = [];

            for (const item of connections.getServersAndGroups().items) {
                if (isServerGroup(item)) {
                    groups.push(new ServerGroupTreeItem(item));
                } else {
                    servers.push(new ServerTreeItem(item.connection, item.cluster, item.displayName, undefined, item.serverKind));
                }
            }

            groups.sort((a, b) =>
                a.groupInfo.name.localeCompare(b.groupInfo.name, undefined, { sensitivity: 'base' })
            );

            servers.sort((a, b) => {
                const aName = a.displayName ?? a.clusterName;
                const bName = b.displayName ?? b.clusterName;
                return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
            });

            items.push(...servers);
            items.push(...groups);

            return items;
        }

        if (element instanceof ServerGroupTreeItem) {
            const servers = element.groupInfo.servers.map(s =>
                new ServerTreeItem(s.connection, s.cluster, s.displayName, element.groupInfo.name, s.serverKind)
            );

            servers.sort((a, b) => {
                const aName = a.displayName ?? a.clusterName;
                const bName = b.displayName ?? b.clusterName;
                return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
            });

            return servers;
        }

        if (element instanceof ServerTreeItem) {
            const databases = connections.getClusterDatabases(element.clusterName);
            const items = databases?.map(db => new DatabaseTreeItem(element.clusterName, db.name)) ?? [];

            items.sort((a, b) =>
                a.databaseName.localeCompare(b.databaseName, undefined, { sensitivity: 'base' })
            );

            return items;
        }

        if (element instanceof DatabaseTreeItem) {
            const folders: DatabaseFolderTreeItem[] = [];
            const dbInfo = connections.getDatabaseInfo(element.clusterName, element.databaseName);

            if (dbInfo?.tables && dbInfo.tables.length > 0) {
                folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'tables', 'Tables', 'table'));
            }
            if (dbInfo?.externalTables && dbInfo.externalTables.length > 0) {
                folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'externalTables', 'External Tables', 'cloud'));
            }
            if (dbInfo?.materializedViews && dbInfo.materializedViews.length > 0) {
                folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'materializedViews', 'Materialized Views', 'eye'));
            }
            if (dbInfo?.functions && dbInfo.functions.length > 0) {
                folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'functions', 'Functions', 'symbol-function'));
            }
            if (dbInfo?.entityGroups && dbInfo.entityGroups.length > 0) {
                folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'entityGroups', 'Entity Groups', 'symbol-namespace'));
            }
            if (dbInfo?.graphModels && dbInfo.graphModels.length > 0) {
                folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'graphModels', 'Graph Models', 'type-hierarchy'));
            }

            return folders;
        }

        if (element instanceof DatabaseFolderTreeItem) {
            const dbInfo = connections.getDatabaseInfo(element.clusterName, element.databaseName);
            if (!dbInfo) return [];

            switch (element.folderType) {
                case 'tables':
                    return (dbInfo.tables ?? [])
                        .map(t => new TableTreeItem(element.clusterName, element.databaseName, t))
                        .sort((a, b) => a.tableInfo.name.localeCompare(b.tableInfo.name, undefined, { sensitivity: 'base' }));
                case 'externalTables':
                    return (dbInfo.externalTables ?? [])
                        .map(t => new ExternalTableTreeItem(element.clusterName, element.databaseName, t))
                        .sort((a, b) => a.tableInfo.name.localeCompare(b.tableInfo.name, undefined, { sensitivity: 'base' }));
                case 'materializedViews':
                    return (dbInfo.materializedViews ?? [])
                        .map(v => new MaterializedViewTreeItem(element.clusterName, element.databaseName, v))
                        .sort((a, b) => a.viewInfo.name.localeCompare(b.viewInfo.name, undefined, { sensitivity: 'base' }));
                case 'functions':
                    return (dbInfo.functions ?? [])
                        .map(f => new FunctionTreeItem(element.clusterName, element.databaseName, f))
                        .sort((a, b) => a.functionInfo.name.localeCompare(b.functionInfo.name, undefined, { sensitivity: 'base' }));
                case 'entityGroups':
                    return (dbInfo.entityGroups ?? [])
                        .map(g => new EntityGroupTreeItem(element.clusterName, element.databaseName, g))
                        .sort((a, b) => a.groupInfo.name.localeCompare(b.groupInfo.name, undefined, { sensitivity: 'base' }));
                case 'graphModels':
                    return (dbInfo.graphModels ?? [])
                        .map(g => new GraphModelTreeItem(element.clusterName, element.databaseName, g))
                        .sort((a, b) => a.graphInfo.name.localeCompare(b.graphInfo.name, undefined, { sensitivity: 'base' }));
            }
        }

        if (element instanceof TableTreeItem) {
            return (element.tableInfo.columns ?? [])
                .map(c => new ColumnTreeItem(element.clusterName, element.databaseName, element.tableInfo.name, 'table', c));
        }

        if (element instanceof ExternalTableTreeItem) {
            return (element.tableInfo.columns ?? [])
                .map(c => new ColumnTreeItem(element.clusterName, element.databaseName, element.tableInfo.name, 'externalTable', c));
        }

        if (element instanceof MaterializedViewTreeItem) {
            return (element.viewInfo.columns ?? [])
                .map(c => new ColumnTreeItem(element.clusterName, element.databaseName, element.viewInfo.name, 'materializedView', c));
        }

        if (element instanceof EntityGroupTreeItem) {
            return (element.groupInfo.entities ?? [])
                .map(e => new EntityGroupMemberTreeItem(element.clusterName, element.databaseName, element.groupInfo.name, e));
        }

        return [];
    }

    getParent(element: KustoTreeItem): KustoTreeItem | undefined
    {
        if (element instanceof TableTreeItem)
        {
            return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'tables', 'Tables', 'table');
        }
        if (element instanceof ExternalTableTreeItem)
        {
            return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'externalTables', 'External Tables', 'cloud');
        }
        if (element instanceof MaterializedViewTreeItem)
        {
            return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'materializedViews', 'Materialized Views', 'eye');
        }
        if (element instanceof FunctionTreeItem)
        {
            return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'functions', 'Functions', 'symbol-function');
        }
        if (element instanceof EntityGroupTreeItem)
        {
            return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'entityGroups', 'Entity Groups', 'symbol-namespace');
        }
        if (element instanceof EntityGroupMemberTreeItem)
        {
            const dbInfo = connections.getDatabaseInfo(element.clusterName, element.databaseName);
            const groupInfo = dbInfo?.entityGroups?.find(g => g.name === element.groupName);
            if (groupInfo) {
                return new EntityGroupTreeItem(element.clusterName, element.databaseName, groupInfo);
            }
            return undefined;
        }
        if (element instanceof GraphModelTreeItem)
        {
            return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, 'graphModels', 'Graph Models', 'type-hierarchy');
        }

        if (element instanceof DatabaseFolderTreeItem)
        {
            return new DatabaseTreeItem(element.clusterName, element.databaseName);
        }

        if (element instanceof DatabaseTreeItem)
        {
            for (const item of connections.getServersAndGroups().items)
            {
                if (isServerGroup(item))
                {
                    const server = item.servers.find(s => s.cluster === element.clusterName);
                    if (server)
                    {
                        return new ServerTreeItem(server.connection, server.cluster, server.displayName, item.name, server.serverKind);
                    }
                } else if (item.cluster === element.clusterName)
                {
                    return new ServerTreeItem(item.connection, item.cluster, item.displayName, undefined, item.serverKind);
                }
            }
            return undefined;
        }

        if (element instanceof ServerTreeItem)
        {
            if (element.groupName)
            {
                const group = connections.getServersAndGroups().items.find(
                    item => isServerGroup(item) && item.name === element.groupName
                ) as ServerGroupInfo | undefined;
                if (group)
                {
                    return new ServerGroupTreeItem(group);
                }
            }
            return undefined;
        }

        return undefined;
    }
}

/**
 * Drag and drop controller for moving servers between groups.
 */
class KustoDragAndDropController implements vscode.TreeDragAndDropController<KustoTreeItem> {
    readonly dropMimeTypes = ['application/vnd.code.tree.kusto.connections'];
    readonly dragMimeTypes = ['application/vnd.code.tree.kusto.connections'];

    handleDrag(source: readonly KustoTreeItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void {
        // Only allow dragging ServerTreeItem
        const servers = source.filter((item): item is ServerTreeItem => item instanceof ServerTreeItem);
        if (servers.length > 0) {
            const dragData = servers.map(s => ({
                cluster: s.clusterName,
                groupName: s.groupName
            }));
            dataTransfer.set('application/vnd.code.tree.kusto.connections', new vscode.DataTransferItem(dragData));
        }
    }

    async handleDrop(target: KustoTreeItem | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        const transferItem = dataTransfer.get('application/vnd.code.tree.kusto.connections');
        if (!transferItem) {
            return;
        }

        const dragData = transferItem.value as { cluster: string; groupName?: string }[];
        if (!dragData || dragData.length === 0) {
            return;
        }

        // Determine target group
        let targetGroupName: string | undefined;
        if (target instanceof ServerGroupTreeItem) {
            targetGroupName = target.groupInfo.name;
        } else if (target instanceof ServerTreeItem && target.groupName) {
            // Dropped on a server within a group - move to same group
            targetGroupName = target.groupName;
        }
        // If target is undefined or NoConnectionTreeItem, move to root level (targetGroupName stays undefined)

        // Move each dragged server
        for (const item of dragData) {
            // Skip if source and target are the same
            if (item.groupName === targetGroupName) {
                continue;
            }
            await connections.moveServer(item.cluster, item.groupName, targetGroupName);
        }
    }
}

// =============================================================================
// Module-level state (initialized by activate)
// =============================================================================

let languageClient: LanguageClient | undefined;
let connectionsProvider: KustoConnectionsProvider | undefined;
let treeView: vscode.TreeView<KustoTreeItem> | undefined;
let isProgrammaticSelection = false;

/**
 * Finds a tree item matching the cluster/database.
 * Returns the actual tree item instance from getChildren().
 * If looking for a database, ensures the server is expanded first.
 */
async function findTreeItem(cluster: string, database: string | undefined): Promise<ServerTreeItem | DatabaseTreeItem | undefined> {
    if (!connectionsProvider || !languageClient) return undefined;
    
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
    await connections.fetchDatabasesForCluster(cluster);
    
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
 * Selects the "No Connection" tree item to indicate no specific connection.
 */
async function selectNeutralTreeItem(): Promise<void> {
    if (!connectionsProvider || !treeView) return;
    
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
 * Updates the tree selection to match the active document's connection.
 */
async function updateTreeSelectionForActiveDocument(): Promise<void> {
    if (!treeView) return;
    
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'kusto') {
        await selectNeutralTreeItem();
        return;
    }
    
    const connection = connections.getDocumentConnection(editor.document.uri.toString());
    
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


