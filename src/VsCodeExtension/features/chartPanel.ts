import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as server from './server';

let chartPanel: vscode.WebviewPanel | undefined;

/**
 * Activates chart panel features and registers associated commands.
 * @param context The extension context
 * @param client The language client for LSP communication
 */
export function activate(context: vscode.ExtensionContext, client: LanguageClient): void {

    // Register chart-related commands
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.copyChart', () => copyChart())
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
        const pngBase64 = pngDataUrl.split(',')[1];

        // Extract SVG text if available
        let svgText = '';
        if (svgDataUrl) {
            // SVG data URL is: data:image/svg+xml,<svg>...</svg>
            const svgPart = svgDataUrl.split(',').slice(1).join(',');
            svgText = decodeURIComponent(svgPart);
        }

        const { spawn } = require('child_process') as typeof import('child_process');

        // Pass PNG and SVG via stdin as a JSON payload to avoid command-line length limits
        const psScript = `
            Add-Type -AssemblyName System.Windows.Forms
            $json = $input | Out-String
            $obj = $json | ConvertFrom-Json
            $pngBytes = [Convert]::FromBase64String($obj.png)
            $pngStream = New-Object System.IO.MemoryStream(,$pngBytes)
            $data = New-Object System.Windows.Forms.DataObject
            $data.SetData('PNG', $false, $pngStream)
            if ($obj.svg) {
                $svgBytes = [System.Text.Encoding]::UTF8.GetBytes($obj.svg)
                $svgStream = New-Object System.IO.MemoryStream(,$svgBytes)
                $data.SetData('image/svg+xml', $false, $svgStream)
            }
            [System.Windows.Forms.Clipboard]::SetDataObject($data, $true)
            $pngStream.Dispose()
        `;
        const ps = spawn('powershell', ['-sta', '-NoProfile', '-Command', psScript]);
        // Pipe data as JSON via stdin
        const payload = JSON.stringify({ png: pngBase64, svg: svgText || null });
        ps.stdin.write(payload);
        ps.stdin.end();
        ps.on('close', (code: number) => {
            if (code !== 0) {
                vscode.window.showErrorMessage(`Failed to copy chart to clipboard (exit code ${code})`);
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy chart: ${error}`);
    }
}

/**
 * Copies the chart as a PNG image to the clipboard.
 */
async function copyChart(): Promise<void> {
    if (!chartPanel) {
        return;
    }

    chartPanel.webview.postMessage({ command: 'copyChart' });
}

/** Script injected into chart webview HTML to handle copy as PNG. */
const chartMessageHandlerScript = `
<script>
    (function() {
        const vscodeApi = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;
        if (!vscodeApi) return;
        window.addEventListener('message', async event => {
            const message = event.data;
            if (message.command === 'copyChart') {
                try {
                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: plotDiv.offsetWidth, height: plotDiv.offsetHeight });
                        const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: plotDiv.offsetWidth, height: plotDiv.offsetHeight });
                        vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
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
