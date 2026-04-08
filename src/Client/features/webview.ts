// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Webview abstraction for decoupling extension-side controllers from VS Code webview APIs.
 */

import * as vscode from 'vscode';

/**
 * Abstraction over a VS Code webview for sending and receiving messages.
 * Both WebviewView and WebviewPanel expose a `.webview` property of type `vscode.Webview`,
 * which is what the adapter wraps.
 */
export interface IWebView {
    /** Send a command message to the webview. */
    invoke(command: string, args?: Record<string, unknown>): void;
    /** Subscribe to messages from the webview. Returns a disposable to unsubscribe. */
    handle(handler: (message: Record<string, unknown>) => void): vscode.Disposable;
}

/**
 * Adapts a VS Code `Webview` to the `IWebView` interface.
 */
export class WebViewAdapter implements IWebView {
    private readonly webview: vscode.Webview;

    constructor(webview: vscode.Webview) {
        this.webview = webview;
    }

    invoke(command: string, args?: Record<string, unknown>): void {
        this.webview.postMessage({ command, ...args });
    }

    handle(handler: (message: Record<string, unknown>) => void): vscode.Disposable {
        return this.webview.onDidReceiveMessage(handler);
    }
}
