// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';
import { isDarkMode, injectChartMessageHandler, handleChartWebviewMessage, registerChartWebview, saveResults } from './results';

let chartPanel: vscode.WebviewPanel | undefined;
let currentDataId: string | undefined;
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
        vscode.commands.registerCommand('kusto.saveChart', () => saveChartFromPanel())
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
 * @param source A data ID string, ResultData object, or undefined to hide the panel
 */
export async function displayChart(
    client: LanguageClient,
    source?: string | server.ResultData
): Promise<void> {
    if (typeof source === 'string') {
        currentDataId = source;
        currentResultData = undefined;
    } else {
        currentDataId = undefined;
        currentResultData = source;
    }

    const darkMode = isDarkMode();
    const chartResult = source
        ? await server.getChartAsHtml(client, currentDataId, currentResultData, darkMode)
        : null;
    showChart(chartResult?.html);
}

/**
 * Determines the best view column for the chart panel.
 * If there are already 2+ editor groups, opens as a regular tab to avoid cramping.
 */
function getChartViewColumn(): vscode.ViewColumn {
    const groups = vscode.window.tabGroups.all;
    if (groups.length >= 2) {
        return vscode.ViewColumn.Active;
    }
    return vscode.ViewColumn.Beside;
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
                currentDataId = undefined;
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
        currentDataId = undefined;
        currentResultData = undefined;
        // Notify that chart panel state changed
        vscode.commands.executeCommand('kusto.chartPanelStateChanged');
    }
}

/**
 * Saves the current chart panel's data to a .kqr file.
 */
async function saveChartFromPanel(): Promise<void> {
    let source: { dataId: string } | { data: server.ResultData } | undefined;

    if (currentResultData) {
        source = { data: currentResultData };
    } else if (currentDataId) {
        source = { dataId: currentDataId };
    }

    if (!source) {
        vscode.window.showWarningMessage('No chart data available to save.');
        return;
    }

    const savedUri = await saveResults(source);
    if (savedUri) {
        // Close the singleton chart panel and open the saved document in the main editor group
        chartPanel?.dispose();
        await vscode.commands.executeCommand('vscode.openWith', savedUri, 'kusto.resultEditor', vscode.ViewColumn.One);
    }
}
