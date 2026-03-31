// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
 * This module implements the Importer class for importing data from Kusto Explorer.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import * as connections from './connections';
import type { ServerInfo, ServerGroupInfo } from './connections';
import { addScratchPadFile } from './scratchPad';

// =============================================================================
// Constants
// =============================================================================

/** Configuration key to suppress the import prompt. */
const SUPPRESS_IMPORT_SETTING = 'connections.suppressKustoExplorerImportPrompt';

/** Kusto Explorer user data directory name under %LOCALAPPDATA%. */
const KUSTO_EXPLORER_DIR = 'Kusto.Explorer';

/** Filename for the groups index. */
const GROUPS_FILE = 'UserConnectionGroups.xml';

/** Default group name used by Kusto Explorer for ungrouped connections. */
const DEFAULT_GROUP_NAME = 'Connections';

/** Recovery directory under Kusto Explorer for scratch pad backup files. */
const RECOVERY_DIR = 'Recovery';

/** Extension for Kusto Explorer scratch pad backup files. */
const RECOVERY_EXT = '.kebak';

// =============================================================================
// Types
// =============================================================================

/** Shape of a Kusto Explorer scratch pad recovery (.kebak) file. */
interface KustoExplorerRecoveryFile {
    CustomTitle?: string;
    QueryText?: string;
    ConnectionString?: string;
    TabOrdinal?: number;
    FullPath?: string;
}

// =============================================================================
// Importer Class
// =============================================================================

/**
 * Imports connections and scratch pad query documents from desktop Kusto Explorer.
 */
export class Importer {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand('kusto.importConnectionsFromKustoExplorer', () => this.importConnectionsFromKustoExplorer()),
            vscode.commands.registerCommand('kusto.importScratchPadsFromKustoExplorer', () => this.importAllScratchPads()),
        );
    }

    /**
     * Checks if Kusto Explorer connections exist and the user hasn't dismissed
     * the prompt, then offers to import. Only prompts when the user has no
     * existing connections.
     * @returns true if the user made a definitive choice (Import or Don't Ask Again),
     *          false if they dismissed or no prompt was shown.
     */
    async promptImportIfAvailable(): Promise<boolean> {
        // Only prompt if user has no connections and hasn't suppressed the prompt
        if (vscode.workspace.getConfiguration('kusto').get<boolean>(SUPPRESS_IMPORT_SETTING)) {
            return true;
        }

        const existingConnections = connections.getConfiguredConnections();
        if (existingConnections.length > 0) {
            return true;
        }

        const hasConnections = hasKustoExplorerConnections();
        const hasScratchPads = hasKustoExplorerScratchPads();

        if (!hasConnections && !hasScratchPads) {
            return true;
        }

        const what = hasConnections && hasScratchPads ? 'connections and query set documents'
            : hasConnections ? 'connections'
            : 'query set documents';

        const choice = await vscode.window.showInformationMessage(
            `Kusto Explorer ${what} found. Would you like to import them?`,
            { modal: true },
            'Import',
            "Don't Ask Again"
        );

        if (choice === 'Import') {
            if (hasConnections) {
                await this.importConnectionsFromKustoExplorer(true);
            }
            if (hasScratchPads) {
                await this.importAllScratchPads(true);
            }
            return true;
        } else if (choice === "Don't Ask Again") {
            await vscode.workspace.getConfiguration('kusto').update(SUPPRESS_IMPORT_SETTING, true, vscode.ConfigurationTarget.Global);
            return true;
        }
        // Dismissed (no choice) — caller may re-prompt later
        return false;
    }

    // ─── Import Connections ───────────────────────────────────────────

    /**
     * Main connections import entry point. Reads Kusto Explorer connection files and
     * adds them to the extension, skipping duplicates.
     */
    private async importConnectionsFromKustoExplorer(skipConfirm = false): Promise<void> {
        const groupsPath = getGroupsFilePath();
        if (!groupsPath || !fs.existsSync(groupsPath)) {
            vscode.window.showErrorMessage('No Kusto Explorer installation found.');
            return;
        }

        if (!skipConfirm) {
            const confirm = await vscode.window.showInformationMessage(
                'Import connections from Kusto Explorer?',
                { modal: true },
                'Import'
            );
            if (confirm !== 'Import') { return; }
        }

        try {
            const groups = parseGroupsXml(await fs.promises.readFile(groupsPath, 'utf-8'));
            if (groups.length === 0) {
                vscode.window.showInformationMessage('No connections found in Kusto Explorer.');
                return;
            }

            let importedCount = 0;
            let skippedCount = 0;

            for (const group of groups) {
                if (!fs.existsSync(group.filePath)) {
                    continue;
                }

                const xml = await fs.promises.readFile(group.filePath, 'utf-8');
                const servers = await parseConnectionsXml(xml);
                if (servers.length === 0) {
                    continue;
                }

                const isDefaultGroup = group.name === DEFAULT_GROUP_NAME;

                // Ensure the group exists (unless it's the default root group)
                if (!isDefaultGroup) {
                    const existing = connections.getServersAndGroups();
                    const groupExists = existing.items.some(
                        item => connections.isServerGroup(item) && item.name === group.name
                    );
                    if (!groupExists) {
                        const newGroup: ServerGroupInfo = { name: group.name, servers: [] };
                        await connections.addServerGroup(newGroup);
                    }
                }

                for (const server of servers) {
                    // Check for duplicates by cluster hostname
                    if (connections.findServerInfo(server.cluster)) {
                        skippedCount++;
                        continue;
                    }

                    await connections.addServer(server, isDefaultGroup ? undefined : group.name);
                    importedCount++;
                }
            }

            if (importedCount > 0) {
                const skippedMsg = skippedCount > 0 ? ` (${skippedCount} duplicates skipped)` : '';
                vscode.window.showInformationMessage(
                    `Imported ${importedCount} connection${importedCount !== 1 ? 's' : ''} from Kusto Explorer${skippedMsg}.`
                );
            } else if (skippedCount > 0) {
                vscode.window.showInformationMessage(
                    `All ${skippedCount} Kusto Explorer connection${skippedCount !== 1 ? 's' : ''} already exist.`
                );
            } else {
                vscode.window.showInformationMessage('No connections found in Kusto Explorer.');
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            vscode.window.showErrorMessage(`Failed to import connections: ${message}`);
        }
    }

    // ─── Import Scratch Pads ────────────────────────────────────────────

    /**
     * Imports all scratch pad documents from Kusto Explorer.
     */
    private async importAllScratchPads(skipConfirm = false): Promise<void> {
        const recoveryFiles = getScratchPadRecoveryFiles();
        if (!recoveryFiles) {
            vscode.window.showInformationMessage('No Kusto Explorer scratch pad documents found to import.');
            return;
        }

        if (!skipConfirm) {
            const confirm = await vscode.window.showInformationMessage(
                `Import ${recoveryFiles.length} scratch pad document${recoveryFiles.length !== 1 ? 's' : ''} from Kusto Explorer?`,
                { modal: true },
                'Import'
            );
            if (confirm !== 'Import') { return; }
        }

        const importedCount = await importRecoveryFilesAsScratchPads(recoveryFiles);

        if (importedCount > 0) {
            vscode.window.showInformationMessage(
                `Imported ${importedCount} scratch pad document${importedCount !== 1 ? 's' : ''} from Kusto Explorer.`
            );
        }
    }
}

/**
 * Gets a list of all recovery files from Kusto Explorer that appear to be scratch pad documents.
 */
function getScratchPadRecoveryFiles(): KustoExplorerRecoveryFile[] | undefined {
    const recoveryDir = getRecoveryDirPath();
    if (!recoveryDir || !fs.existsSync(recoveryDir)) {
        return undefined;
    }

    const kebakFiles = fs.readdirSync(recoveryDir).filter(f => f.endsWith(RECOVERY_EXT));
    if (kebakFiles.length === 0) {
        return undefined;
    }

    const entries: KustoExplorerRecoveryFile[] = [];
    for (const file of kebakFiles) {
        try {
            const raw = fs.readFileSync(path.join(recoveryDir, file), 'utf-8');
            const entry: KustoExplorerRecoveryFile = JSON.parse(raw);
            // Only import scratch pad documents (no FullPath). Files with a
            // FullPath were already saved to disk and are just recovery backups.
            if (entry.QueryText?.trim() && !entry.FullPath?.trim()) {
                entries.push(entry);
            }
        } catch {
            // Skip malformed files
        }
    }

    if (entries.length === 0) {
        return undefined;
    }

    // Sort by tab ordinal to preserve the user's tab order
    entries.sort((a, b) => (a.TabOrdinal ?? 0) - (b.TabOrdinal ?? 0));
    return entries;
}

/**
 * Imports a list of recovery files as scratch pad files.
 * Returns the number of successfully imported entries.
 */
async function importRecoveryFilesAsScratchPads(recoveryFiles: KustoExplorerRecoveryFile[]): Promise<number> {
    let importedCount = 0;
    for (const recoveryFile of recoveryFiles) {
        // Resolve the connection first so we can use the friendly name for naming
        let cluster: string | undefined;
        let database: string | undefined;
        if (recoveryFile.ConnectionString) {
            try {
                cluster = await connections.getHostName(recoveryFile.ConnectionString);
                database = parseDatabaseFromConnectionString(recoveryFile.ConnectionString);
                if (cluster && !connections.findServerInfo(cluster)) {
                    const server: ServerInfo = {
                        connection: recoveryFile.ConnectionString,
                        cluster,
                    };
                    const serverKind = await connections.fetchServerKind(recoveryFile.ConnectionString);
                    if (serverKind) {
                        server.serverKind = serverKind;
                    }
                    await connections.addServer(server);
                }
            } catch {
                // Connection resolution is best-effort; don't block import
            }
        }

        // Determine the scratch pad name:
        // 1. Use CustomTitle if the user named it
        // 2. Derive from connection.database (matching Kusto Explorer's convention)
        // 3. Fall back to auto-naming (ScratchPad<N>)
        const customTitle = recoveryFile.CustomTitle?.trim() || null;
        let name: string | null;
        if (customTitle) {
            name = sanitizeFileName(customTitle);
        } else if (cluster) {
            const serverInfo = connections.findServerInfo(cluster);
            const connectionName = serverInfo?.displayName ?? cluster;
            name = database ? sanitizeFileName(`${connectionName}.${database}`) : sanitizeFileName(connectionName);
        } else {
            name = null;
        }

        const finalName = await addScratchPadFile(name, recoveryFile.QueryText!);

        // Associate the connection with the new scratch pad
        if (cluster) {
            try {
                const scratchUri = `kusto-scratch:/${finalName}`;
                await connections.setDocumentConnection(scratchUri, cluster, database);
            } catch {
                // Connection association is best-effort; don't block import
            }
        }

        importedCount++;
    }
    return importedCount;
}

/**
 * Sanitizes a string for use as a filename by removing characters
 * that are invalid on Windows/macOS/Linux.
 */
function sanitizeFileName(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, ' ').trim() || 'ScratchPad';
}

/**
 * Extracts the database name (Initial Catalog) from a Kusto connection string.
 * Returns undefined if the database is "NetDefaultDB" (Kusto Explorer's placeholder).
 */
function parseDatabaseFromConnectionString(connectionString: string): string | undefined {
    const match = connectionString.match(/Initial Catalog\s*=\s*([^;]+)/i);
    const database = match?.[1]?.trim();
    if (!database || database === 'NetDefaultDB') {
        return undefined;
    }
    return database;
}

// =============================================================================
// Connection XML Parsing
// =============================================================================

const xmlParser = new XMLParser();

/**
 * Parses UserConnectionGroups.xml to get group names and their connection file paths.
 */
function parseGroupsXml(xml: string): { name: string; filePath: string }[] {
    const doc = xmlParser.parse(xml);
    const entries = doc?.ArrayOfServerGroupDescription?.ServerGroupDescription;
    if (!entries) { return []; }
    const list = Array.isArray(entries) ? entries : [entries];
    return list
        .filter((e: any) => e.Name && e.Details)
        .map((e: any) => ({
            name: e.Name as string,
            filePath: e.Details as string,
        }));
}

/**
 * Parses a UserConnections.xml (or group connections file) into ServerInfo[].
 */
async function parseConnectionsXml(xml: string): Promise<ServerInfo[]> {
    const doc = xmlParser.parse(xml);
    const entries = doc?.ArrayOfServerDescriptionBase?.ServerDescriptionBase;
    if (!entries) { return []; }
    const list = Array.isArray(entries) ? entries : [entries];

    const results: ServerInfo[] = [];
    for (const entry of list) {
        const connectionString = entry.ConnectionString;
        if (!connectionString) { continue; }

        const cluster = await connections.getHostName(connectionString);
        const displayName = entry.Name as string | undefined;

        const server: ServerInfo = {
            connection: connectionString,
            cluster,
        };

        // Use the KE display name if it differs from the cluster hostname
        if (displayName && displayName !== cluster) {
            server.displayName = displayName;
        }

        // Fetch server kind (e.g. DataManager, ClusterManager) from the server API
        const serverKind = await connections.fetchServerKind(connectionString);
        if (serverKind) {
            server.serverKind = serverKind;
        }

        results.push(server);
    }

    return results;
}

// =============================================================================
// Path Helpers
// =============================================================================

/**
 * Returns the path to UserConnectionGroups.xml if it exists, or undefined.
 */
function getGroupsFilePath(): string | undefined {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) { return undefined; }
    return path.join(localAppData, KUSTO_EXPLORER_DIR, GROUPS_FILE);
}

/**
 * Returns the path to the Kusto Explorer Recovery directory, or undefined.
 */
function getRecoveryDirPath(): string | undefined {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) { return undefined; }
    return path.join(localAppData, KUSTO_EXPLORER_DIR, RECOVERY_DIR);
}

/** Returns true if Kusto Explorer connection files exist on disk. */
function hasKustoExplorerConnections(): boolean {
    const groupsPath = getGroupsFilePath();
    return !!groupsPath && fs.existsSync(groupsPath);
}

/** Returns true if Kusto Explorer scratch pad recovery files exist on disk. */
function hasKustoExplorerScratchPads(): boolean {
    const recoveryDir = getRecoveryDirPath();
    if (!recoveryDir || !fs.existsSync(recoveryDir)) { return false; }
    return fs.readdirSync(recoveryDir).some(f => f.endsWith(RECOVERY_EXT));
}
