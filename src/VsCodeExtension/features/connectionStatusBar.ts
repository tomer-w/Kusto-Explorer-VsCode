import * as vscode from 'vscode';

let connectionStatusBarItem: vscode.StatusBarItem | undefined;

/**
 * Creates and shows the connection status bar item.
 * @param context The extension context for registering disposables
 */
export function activate(context: vscode.ExtensionContext): void {
    connectionStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        0  // priority (higher = more to the left)
    );
    connectionStatusBarItem.text = "$(database) not connected";
    connectionStatusBarItem.tooltip = "Click to change connection";
    connectionStatusBarItem.command = "kusto.connectDatabase";
    connectionStatusBarItem.show();
    context.subscriptions.push(connectionStatusBarItem);
}

/**
 * Updates the status bar item to reflect the connection for the active document.
 * @param cluster The cluster name, or undefined if not connected
 * @param database The database name, or undefined if not selected
 */
export function update(cluster: string | undefined, database: string | undefined): void {
    if (!connectionStatusBarItem) return;

    if (!cluster) {
        connectionStatusBarItem.text = `$(database) not connected`;
    } else if (!database) {
        connectionStatusBarItem.text = `$(database) cluster('${cluster}')`;
    } else {
        connectionStatusBarItem.text = `$(database) cluster('${cluster}').database('${database}')`;
    }
}

/**
 * Shows the status bar item.
 */
export function show(): void {
    connectionStatusBarItem?.show();
}

/**
 * Hides the status bar item.
 */
export function hide(): void {
    connectionStatusBarItem?.hide();
}
