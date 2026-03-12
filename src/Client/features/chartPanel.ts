// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';
import { isDarkMode, injectChartMessageHandler, handleChartWebviewMessage, registerChartWebview, saveResults } from './resultsViewer';

let chartPanel: vscode.WebviewPanel | undefined;
let currentResultData: server.ResultData | undefined;
let languageClient: LanguageClient;

/**
 * Activates chart panel features and registers associated commands.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {
    languageClient = client;

    // Register chart-related commands
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.saveChart', () => saveChartFromPanel()),
        vscode.commands.registerCommand('kusto.moveChartToMain', () => moveChartToMain())
    );
}

/**
 * Returns whether a chart panel currently exists.
 */
export function hasChartPanel(): boolean {
    return chartPanel !== undefined;
}

/**
 * Fetches chart HTML from the server and displays it in the chart panel.
 * @param client The language client for LSP communication
 * @param resultData The ResultData object, or undefined to hide the panel
 */
export async function displayChart(
    client: LanguageClient,
    resultData?: server.ResultData
): Promise<void> {
    currentResultData = resultData;

    const darkMode = isDarkMode();
    const chartResult = resultData
        ? await server.getChartAsHtml(client, resultData, darkMode)
        : null;
    showChart(chartResult?.html);
}

/**
 * Returns the view column for the chart panel.
 */
function getChartViewColumn(): vscode.ViewColumn {
    return vscode.ViewColumn.Beside;
}

/**
 * Toggles the chart panel between the main editor group and the beside group.
 */
function moveChartToMain(): void {
    if (chartPanel) {
        const isMain = chartPanel.viewColumn === vscode.ViewColumn.One;
        chartPanel.reveal(isMain ? vscode.ViewColumn.Beside : vscode.ViewColumn.One, false);
    }
}

/**
 * Displays or hides the chart panel.
 * @param chartHtml The chart HTML to display, or undefined to hide the panel
 */
function showChart(chartHtml: string | undefined): void
{
    if (chartHtml)
    {
        const viewColumn = getChartViewColumn();

        // Create panel only if it doesn't exist
        if (!chartPanel)
        {
            chartPanel = vscode.window.createWebviewPanel(
                'kusto',
                'Chart',
                {
                    viewColumn: viewColumn,
                    preserveFocus: true
                },
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Notify that chart panel state changed
            vscode.commands.executeCommand('kusto.chartPanelStateChanged');

            // Track this panel for copy commands
            registerChartWebview(chartPanel);

            // Listen for messages from the chart webview
            chartPanel.webview.onDidReceiveMessage(async (message) => {
                handleChartWebviewMessage(message);
            });

            // Clear reference when user closes it
            chartPanel.onDidDispose(() =>
            {
                chartPanel = undefined;
                currentResultData = undefined;
                // Notify that chart panel state changed
                vscode.commands.executeCommand('kusto.chartPanelStateChanged');
            });
        }

        // Update content and reveal
        chartPanel.webview.html = injectChartMessageHandler(chartHtml);
        chartPanel.reveal(viewColumn, true);
    }
    else if (chartPanel)
    {
        // No chart to show, dispose the panel
        try
        {
            chartPanel.dispose();
        } catch
        {
            // Ignore disposal errors
        }
        chartPanel = undefined;
        currentResultData = undefined;
        // Notify that chart panel state changed
        vscode.commands.executeCommand('kusto.chartPanelStateChanged');
    }
}

/**
 * Saves the current chart panel's data to a .kqr file.
 */
async function saveChartFromPanel(): Promise<void> {
    if (!currentResultData) {
        vscode.window.showWarningMessage('No chart data available to save.');
        return;
    }

    const result = await saveResults({ data: currentResultData });
    if (result) {
        // Close the singleton chart panel and open/reveal the saved document in the main editor group
        chartPanel?.dispose();
        await vscode.commands.executeCommand('vscode.openWith', result.uri, 'kusto.resultEditor', vscode.ViewColumn.One);
    }
}
