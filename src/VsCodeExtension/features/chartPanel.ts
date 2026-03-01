import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';
import { copyToClipboard, ClipboardItem } from './clipboard';

let chartPanel: vscode.WebviewPanel | undefined;

/**
 * Activates chart panel features and registers associated commands.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {

    // Register chart-related commands
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.copyChart', () => copyChartCommand()),
        vscode.commands.registerCommand('kusto.copyChartTransparent', () => copyChartTransparentCommand())
    );
}

/**
 * Returns whether a chart panel currently exists.
 */
export function hasChartPanel(): boolean {
    return chartPanel !== undefined;
}

/**
 * Determines if VS Code is currently using a dark color theme.
 */
function isDarkMode(): boolean {
    const colorTheme = vscode.window.activeColorTheme;
    // ColorThemeKind: Light = 1, Dark = 2, HighContrast = 3, HighContrastLight = 4
    return colorTheme.kind === vscode.ColorThemeKind.Dark || 
           colorTheme.kind === vscode.ColorThemeKind.HighContrast;
}

/**
 * Fetches chart HTML from the server and displays it in the chart panel.
 * @param client The language client for LSP communication
 * @param dataId The data ID from running a query
 */
export async function displayChartById(
    client: LanguageClient,
    dataId?: string
): Promise<void> {
    const darkMode = isDarkMode();
    const chartResult = dataId ? await server.getDataAsHtmlChart(client, dataId, darkMode) : null;
    displayChart(chartResult?.html);
}

/**
 * Displays or hides the chart panel.
 * @param chartHtml The chart HTML to display, or undefined to hide the panel
 */
function displayChart(chartHtml: string | undefined): void
{
    if (chartHtml)
    {
        // Create panel only if it doesn't exist
        if (!chartPanel)
        {
            chartPanel = vscode.window.createWebviewPanel(
                'kusto',
                'Chart',
                {
                    viewColumn: vscode.ViewColumn.Beside,
                    preserveFocus: true
                },
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            // Notify that chart panel state changed
            vscode.commands.executeCommand('kusto.chartPanelStateChanged');

            // Listen for messages from the chart webview
            chartPanel.webview.onDidReceiveMessage(async (message) => {
                if (message.command === 'copyChartError') {
                    vscode.window.showErrorMessage(`Chart copy failed in webview: ${message.error}`);
                }
                if (message.command === 'copyChartResult' && message.pngDataUrl) {
                    onCopyChartMessage(message.pngDataUrl, message.svgDataUrl);
                }
            });

            // Clear reference when user closes it
            chartPanel.onDidDispose(() =>
            {
                chartPanel = undefined;
                // Notify that chart panel state changed
                vscode.commands.executeCommand('kusto.chartPanelStateChanged');
            });
        }

        // Update content and reveal
        chartPanel.webview.html = injectChartMessageHandler(chartHtml);
        chartPanel.reveal(vscode.ViewColumn.Beside, true);
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
        // Notify that chart panel state changed
        vscode.commands.executeCommand('kusto.chartPanelStateChanged');
    }
}

/**
 * Handles the chart image data received from the webview and copies it to the clipboard.
 * Places both PNG and SVG (if available) formats on the clipboard.
 * @param pngDataUrl The PNG image as a data URL
 * @param svgDataUrl Optional SVG image as a data URL
 */
function onCopyChartMessage(pngDataUrl: string, svgDataUrl?: string): void {
    try {
        const pngBase64 = pngDataUrl.split(',')[1] ?? '';

        const items: ClipboardItem[] = [
            { format: 'PNG', data: pngBase64, encoding: 'base64' }
        ];

        if (svgDataUrl) {
            // SVG data URL is: data:image/svg+xml,<svg>...</svg>
            const svgPart = svgDataUrl.split(',').slice(1).join(',');
            const svgText = decodeURIComponent(svgPart);
            items.push({ format: 'image/svg+xml', data: svgText });
        }

        copyToClipboard(items).catch(error => {
            vscode.window.showErrorMessage(`Failed to copy chart to clipboard: ${error}`);
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy chart: ${error}`);
    }
}

/**
 * Implementation of the 'kusto.copyChart' command.
 */
async function copyChartCommand(): Promise<void> {
    if (!chartPanel) {
        return;
    }

    // request the webview to copy the chart using Plotly commands to generate the image encodings
    // and sends either a copyChartResult or copyChartError message back that we handle in onDidReceiveMessage
    // eventually calling onCopyChartMessage to place the data on the clipboard
    chartPanel.webview.postMessage({ command: 'copyChart' });
}

/**
 * Implementation of the 'kusto.copyChartTransparent' command.
 * Copies the chart with a transparent background and light-mode colors,
 * suitable for pasting into documents with white backgrounds.
 */
async function copyChartTransparentCommand(): Promise<void> {
    if (!chartPanel) {
        return;
    }

    chartPanel.webview.postMessage({ command: 'copyChartTransparent' });
}

/** Script injected into chart webview HTML to handle copy commands. */
const chartMessageHandlerScript = `
<script>
    (function() {
        const vscodeApi = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;
        if (!vscodeApi) return;

        // Light-mode color overrides (dot-notation keys for precise save/restore)
        const lightModeColors = {
            'font.color': '#333333',
            'xaxis.color': '#333333',
            'xaxis.gridcolor': '#e0e0e0',
            'yaxis.color': '#333333',
            'yaxis.gridcolor': '#e0e0e0',
            'legend.font.color': '#333333'
        };

        // Transparent background for SVG (pastes well into Word/Outlook)
        const transparentBg = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        // White background for bitmap (pastes well into Teams/Discord)
        const whiteBg = {
            paper_bgcolor: '#ffffff',
            plot_bgcolor: '#ffffff'
        };

        window.addEventListener('message', async event => {
            const message = event.data;
            if (message.command === 'copyChart' || message.command === 'copyChartTransparent') {
                try {
                    const transparent = message.command === 'copyChartTransparent';
                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        const width = plotDiv.offsetWidth;
                        const height = plotDiv.offsetHeight;

                        // Save original layout properties before any changes
                        let savedLayout = null;
                        if (transparent) {
                            const layout = plotDiv.layout || {};
                            // Use dot-notation keys so Plotly restores nested properties correctly.
                            savedLayout = {
                                paper_bgcolor: layout.paper_bgcolor,
                                plot_bgcolor: layout.plot_bgcolor,
                                'font.color': layout.font?.color ?? null,
                                'xaxis.color': layout.xaxis?.color ?? null,
                                'xaxis.gridcolor': layout.xaxis?.gridcolor ?? null,
                                'yaxis.color': layout.yaxis?.color ?? null,
                                'yaxis.gridcolor': layout.yaxis?.gridcolor ?? null,
                                'legend.font.color': layout.legend?.font?.color ?? null
                            };

                            // Generate transparent SVG with light-mode colors
                            await Plotly.relayout(plotDiv, { ...transparentBg, ...lightModeColors });
                            const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });

                            // Generate white-background PNG with light-mode colors (for bitmap: Teams, Discord)
                            // Scale 2x so the bitmap is large enough to read when pasted
                            await Plotly.relayout(plotDiv, whiteBg);
                            const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });

                            // Restore original layout
                            await Plotly.relayout(plotDiv, savedLayout);

                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
                        } else {
                            // Scale 2x so the bitmap is large enough to read when pasted
                            const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });
                            const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });
                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
                        }
                    } else {
                        // Fallback: use canvas if available
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            const dataUrl = canvas.toDataURL('image/png');
                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: dataUrl });
                        }
                    }
                } catch (err) {
                    vscodeApi.postMessage({ command: 'copyChartError', error: String(err) });
                }
            }
        });
    })();
</script>`;

/**
 * Injects the chart message handler script into chart HTML content.
 * Also adds data-vscode-context to suppress default context menu items.
 */
function injectChartMessageHandler(html: string): string {
    // Add data-vscode-context to suppress default Cut/Copy/Paste context menu items
    let result = html;
    const contextAttr = ` data-vscode-context='{"preventDefaultContextMenuItems": true}'`;
    if (result.includes('<body')) {
        result = result.replace('<body', '<body' + contextAttr);
    } else if (result.includes('<html')) {
        result = result.replace('<html>', '<html><body' + contextAttr + '>');
        if (result.includes('</html>')) {
            result = result.replace('</html>', '</body></html>');
        }
    }

    if (result.includes('</html>')) {
        return result.replace('</html>', chartMessageHandlerScript + '</html>');
    }
    if (result.includes('</body>')) {
        return result.replace('</body>', chartMessageHandlerScript + '</body>');
    }
    return result + chartMessageHandlerScript;
}
