// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as vscode from 'vscode';

import type { ConnectionManager } from '../../features/connectionManager';
import { isServer, isServerGroup } from '../../features/connectionManager';
import type { ServerInfo, ServerGroupInfo } from '../../features/connectionManager';

/** Get the extension's exported ConnectionManager instance. */
async function getConnectionManager(): Promise<ConnectionManager> {
    const ext = vscode.extensions.getExtension('Microsoft.kusto-explorer-vscode')!;
    const exports = ext.isActive ? ext.exports : await ext.activate();
    return (exports as any).connectionManager as ConnectionManager;
}

/** Helper to find a server in the connections data (at root or in a group). */
function findServer(cm: ConnectionManager, cluster: string): { server: ServerInfo; groupName?: string } | undefined {
    for (const item of cm.getServersAndGroups().items) {
        if (isServer(item) && item.cluster === cluster) {
            return { server: item };
        }
        if (isServerGroup(item)) {
            const server = item.servers.find(s => s.cluster === cluster);
            if (server) {
                return { server, groupName: item.name };
            }
        }
    }
    return undefined;
}

/** Helper to find a group in the connections data. */
function findGroup(cm: ConnectionManager, name: string): ServerGroupInfo | undefined {
    for (const item of cm.getServersAndGroups().items) {
        if (isServerGroup(item) && item.name === name) {
            return item;
        }
    }
    return undefined;
}

suite('Connections Panel Integration Tests', () => {
    let connectionManager: ConnectionManager;

    suiteSetup(async () => {
        connectionManager = await getConnectionManager();
    });

    setup(async () => {
        // Clear all servers and groups before each test
        const data = connectionManager.getServersAndGroups();
        for (const item of [...data.items]) {
            if (isServerGroup(item)) {
                await connectionManager.removeServerGroup(item.name);
            } else if (isServer(item)) {
                await connectionManager.removeServer(item.cluster);
            }
        }
    });

    teardown(async () => {
        // Clear all servers and groups after each test
        const data = connectionManager.getServersAndGroups();
        for (const item of [...data.items]) {
            if (isServerGroup(item)) {
                await connectionManager.removeServerGroup(item.name);
            } else if (isServer(item)) {
                await connectionManager.removeServer(item.cluster);
            }
        }
    });

    test('Add a server via command', async () => {
        assert.strictEqual(
            connectionManager.getServersAndGroups().items.length, 0,
            'Should start with no connections'
        );

        // Stub showInputBox to return a connection URL
        const original = vscode.window.showInputBox;
        (vscode.window as any).showInputBox = async () => 'https://testcluster.kusto.windows.net';
        try {
            await vscode.commands.executeCommand('kusto.addServer');
        } finally {
            (vscode.window as any).showInputBox = original;
        }

        const result = findServer(connectionManager, 'testcluster.kusto.windows.net');
        assert.ok(result, 'Server should exist after adding');
        assert.strictEqual(result.server.cluster, 'testcluster.kusto.windows.net');
        assert.strictEqual(result.groupName, undefined, 'Server should be at root level');
    });

    test('Remove a server via command', async () => {
        // Add a server directly
        await connectionManager.addServer({
            connection: 'https://mycluster.kusto.windows.net',
            cluster: 'mycluster.kusto.windows.net',
        });
        assert.ok(findServer(connectionManager, 'mycluster.kusto.windows.net'), 'Server should exist');

        // Stub showWarningMessage to confirm removal
        const original = vscode.window.showWarningMessage;
        (vscode.window as any).showWarningMessage = async () => 'Remove';
        try {
            await vscode.commands.executeCommand('kusto.removeServer', {
                clusterName: 'mycluster.kusto.windows.net',
                displayName: 'mycluster',
            });
        } finally {
            (vscode.window as any).showWarningMessage = original;
        }

        assert.strictEqual(
            findServer(connectionManager, 'mycluster.kusto.windows.net'),
            undefined,
            'Server should be removed'
        );
    });

    test('Add a server group via command', async () => {
        // Stub showInputBox to return a group name
        const original = vscode.window.showInputBox;
        (vscode.window as any).showInputBox = async () => 'Production';
        try {
            await vscode.commands.executeCommand('kusto.addServerGroup');
        } finally {
            (vscode.window as any).showInputBox = original;
        }

        const group = findGroup(connectionManager, 'Production');
        assert.ok(group, 'Group should exist after adding');
        assert.strictEqual(group.servers.length, 0, 'New group should have no servers');
    });

    test('Remove a server group via command', async () => {
        // Add a group with a server in it
        await connectionManager.addServerGroup({ name: 'TestGroup', servers: [] });
        await connectionManager.addServer({
            connection: 'https://grouped.kusto.windows.net',
            cluster: 'grouped.kusto.windows.net',
        }, 'TestGroup');
        assert.ok(findGroup(connectionManager, 'TestGroup'), 'Group should exist');

        // Stub showWarningMessage to confirm removal
        const original = vscode.window.showWarningMessage;
        (vscode.window as any).showWarningMessage = async () => 'Remove';
        try {
            await vscode.commands.executeCommand('kusto.removeServerGroup', {
                groupInfo: { name: 'TestGroup' },
            });
        } finally {
            (vscode.window as any).showWarningMessage = original;
        }

        assert.strictEqual(findGroup(connectionManager, 'TestGroup'), undefined, 'Group should be removed');
        assert.strictEqual(
            findServer(connectionManager, 'grouped.kusto.windows.net'),
            undefined,
            'Server in the group should also be removed'
        );
    });

    test('Rename a server via command', async () => {
        await connectionManager.addServer({
            connection: 'https://renameme.kusto.windows.net',
            cluster: 'renameme.kusto.windows.net',
            displayName: 'renameme',
        });

        // Stub showInputBox to return new name
        const original = vscode.window.showInputBox;
        (vscode.window as any).showInputBox = async () => 'NewDisplayName';
        try {
            await vscode.commands.executeCommand('kusto.renameServer', {
                clusterName: 'renameme.kusto.windows.net',
                displayName: 'renameme',
            });
        } finally {
            (vscode.window as any).showInputBox = original;
        }

        const result = findServer(connectionManager, 'renameme.kusto.windows.net');
        assert.ok(result, 'Server should still exist');
        assert.strictEqual(result.server.displayName, 'NewDisplayName', 'Display name should be updated');
    });

    test('Rename a server group via command', async () => {
        await connectionManager.addServerGroup({ name: 'OldGroupName', servers: [] });
        await connectionManager.addServer({
            connection: 'https://ingroup.kusto.windows.net',
            cluster: 'ingroup.kusto.windows.net',
        }, 'OldGroupName');

        // Stub showInputBox to return new group name
        const original = vscode.window.showInputBox;
        (vscode.window as any).showInputBox = async () => 'NewGroupName';
        try {
            await vscode.commands.executeCommand('kusto.renameServerGroup', {
                groupInfo: { name: 'OldGroupName' },
            });
        } finally {
            (vscode.window as any).showInputBox = original;
        }

        assert.strictEqual(findGroup(connectionManager, 'OldGroupName'), undefined, 'Old group name should be gone');
        const group = findGroup(connectionManager, 'NewGroupName');
        assert.ok(group, 'Group should exist with new name');
        assert.strictEqual(group.servers.length, 1, 'Servers should be preserved after rename');
        assert.strictEqual(group.servers[0].cluster, 'ingroup.kusto.windows.net');
    });

    test('Move a server to a group via command', async () => {
        // Create a group and a root-level server
        await connectionManager.addServerGroup({ name: 'TargetGroup', servers: [] });
        await connectionManager.addServer({
            connection: 'https://moveme.kusto.windows.net',
            cluster: 'moveme.kusto.windows.net',
        });

        // Verify server is at root
        let result = findServer(connectionManager, 'moveme.kusto.windows.net');
        assert.ok(result, 'Server should exist');
        assert.strictEqual(result.groupName, undefined, 'Server should start at root');

        // Stub showQuickPick to select the target group
        const original = vscode.window.showQuickPick;
        (vscode.window as any).showQuickPick = async () => ({
            label: '$(folder) TargetGroup',
            description: 'Move to group "TargetGroup"',
        });
        try {
            await vscode.commands.executeCommand('kusto.moveServer', {
                clusterName: 'moveme.kusto.windows.net',
                displayName: 'moveme',
            });
        } finally {
            (vscode.window as any).showQuickPick = original;
        }

        result = findServer(connectionManager, 'moveme.kusto.windows.net');
        assert.ok(result, 'Server should still exist');
        assert.strictEqual(result.groupName, 'TargetGroup', 'Server should be in the target group');
    });
});
