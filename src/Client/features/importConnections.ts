// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import * as connections from './connections';
import type { ServerInfo, ServerGroupInfo } from './connections';

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

// =============================================================================
// Module-level State
// =============================================================================

let extensionContext: vscode.ExtensionContext;

// =============================================================================
// Activation
// =============================================================================

/**
 * Activates the import feature: registers the import command and optionally
 * prompts the user to import connections from Kusto Explorer.
 */
export function activate(context: vscode.ExtensionContext): void {
    extensionContext = context;

    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.importFromKustoExplorer', () => importFromKustoExplorer()),
    );
}

// =============================================================================
// Auto-detection and Prompting
// =============================================================================

/**
 * Checks if Kusto Explorer connections exist and the user hasn't dismissed
 * the prompt, then offers to import. Only prompts when the user has no
 * existing connections.
 * @returns true if the user made a definitive choice (Import or Don't Ask Again),
 *          false if they dismissed or no prompt was shown.
 */
export async function promptImportIfAvailable(): Promise<boolean> {
    // Only prompt if user has no connections and hasn't suppressed the prompt
    if (vscode.workspace.getConfiguration('kusto').get<boolean>(SUPPRESS_IMPORT_SETTING)) {
        return true;
    }

    const existingConnections = connections.getConfiguredConnections();
    if (existingConnections.length > 0) {
        return true;
    }

    const groupsPath = getGroupsFilePath();
    if (!groupsPath || !fs.existsSync(groupsPath)) {
        return true;
    }

    const choice = await vscode.window.showInformationMessage(
        'Kusto Explorer connections found. Would you like to import them?',
        { modal: true },
        'Import',
        "Don't Ask Again"
    );

    if (choice === 'Import') {
        await importFromKustoExplorer(true);
        return true;
    } else if (choice === "Don't Ask Again") {
        await vscode.workspace.getConfiguration('kusto').update(SUPPRESS_IMPORT_SETTING, true, vscode.ConfigurationTarget.Global);
        return true;
    }
    // Dismissed (no choice) — caller may re-prompt later
    return false;
}

// =============================================================================
// Import Logic
// =============================================================================

/**
 * Main import entry point. Reads Kusto Explorer connection files and
 * adds them to the extension, skipping duplicates.
 * @param skipConfirm If true, skip the confirmation dialog (used when already confirmed by the auto-prompt).
 */
async function importFromKustoExplorer(skipConfirm = false): Promise<void> {
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

// =============================================================================
// XML Parsing
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
