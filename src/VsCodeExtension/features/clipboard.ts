import * as vscode from 'vscode';

/** Generic clipboard context that can carry arbitrary metadata. */
export interface ClipboardContext {
    /** The text placed on the system clipboard. Used to verify the clipboard hasn't changed. */
    text: string;
    /** The kind of content that was copied (e.g. 'entity', 'query'). */
    kind: string;
    /** The source cluster name. */
    entityCluster?: string;
    /** The source database name. */
    entityDatabase?: string;
    /** The type of entity being copied (e.g. 'Table', 'Function'). */
    entityType?: string;
    /** The name of the entity being copied. */
    entityName?: string;
}

/** Stored clipboard context from the last copy operation with context. */
let clipboardContext: ClipboardContext | undefined;

/**
 * Stores clipboard context alongside the system clipboard text.
 * Call this when copying content that should carry source connection metadata.
 */
export function setClipboardContext(context: ClipboardContext): void {
    clipboardContext = context;
}

/**
 * Returns the current clipboard context, or undefined if none is set.
 */
export function getClipboardContext(): ClipboardContext | undefined {
    return clipboardContext;
}

/**
 * Clears the stored clipboard context.
 */
export function clearClipboardContext(): void {
    clipboardContext = undefined;
}

/** Describes a single item to place on the clipboard. */
export interface ClipboardItem {
    /** The clipboard format name (e.g. 'PNG', 'image/svg+xml', 'Text'). */
    format: string;
    /** The data to place on the clipboard. */
    data: string;
    /** How the data string is encoded. 'base64' decodes to raw bytes, 'utf8' encodes as UTF-8 bytes, 'text' sets the string directly. Defaults to 'utf8'. */
    encoding?: 'base64' | 'utf8' | 'text';
}

/**
 * Wraps an HTML fragment in the Windows CF_HTML clipboard format,
 * which includes a header with byte offsets so that applications like
 * Word and Excel recognize the content as rich HTML.
 * @param html The raw HTML fragment to wrap
 * @returns The full CF_HTML formatted string
 */
export function formatCfHtml(html: string): string {
    // The header uses fixed-width 10-digit byte offsets.
    // We build a template first to measure the header length, then fill in real values.
    const header =
        'Version:0.9\r\n' +
        'StartHTML:XXXXXXXXXX\r\n' +
        'EndHTML:XXXXXXXXXX\r\n' +
        'StartFragment:XXXXXXXXXX\r\n' +
        'EndFragment:XXXXXXXXXX\r\n';

    const prefix = '<html><body>\r\n<!--StartFragment-->';
    const suffix = '<!--EndFragment-->\r\n</body></html>';

    const headerBytes = Buffer.byteLength(header, 'utf8');
    const prefixBytes = Buffer.byteLength(prefix, 'utf8');
    const htmlBytes = Buffer.byteLength(html, 'utf8');
    const suffixBytes = Buffer.byteLength(suffix, 'utf8');

    const startHtml = headerBytes;
    const startFragment = headerBytes + prefixBytes;
    const endFragment = startFragment + htmlBytes;
    const endHtml = endFragment + suffixBytes;

    const pad = (n: number) => n.toString().padStart(10, '0');

    const filledHeader =
        'Version:0.9\r\n' +
        `StartHTML:${pad(startHtml)}\r\n` +
        `EndHTML:${pad(endHtml)}\r\n` +
        `StartFragment:${pad(startFragment)}\r\n` +
        `EndFragment:${pad(endFragment)}\r\n`;

    return filledHeader + prefix + html + suffix;
}

/**
 * Copies multiple data formats to the clipboard.
 * On Windows, uses PowerShell to set multiple clipboard formats (HTML, PNG, etc.).
 * On other platforms, falls back to plain text only using VS Code's clipboard API.
 * @param items Array of clipboard items to set
 * @returns A promise that resolves when the clipboard operation completes
 */
export async function copyToClipboard(items: ClipboardItem[]): Promise<void> {
    if (process.platform === 'win32') {
        return copyToClipboardWindows(items);
    } else {
        // Fall back to plain text on non-Windows platforms
        // VS Code's clipboard API only supports plain text
        return copyToClipboardFallback(items);
    }
}

/**
 * Copies to clipboard using VS Code's plain text API.
 * Used as fallback on non-Windows platforms.
 */
async function copyToClipboardFallback(items: ClipboardItem[]): Promise<void> {
    // Find the best text item to use
    const textItem = items.find(i => i.format === 'Text' && i.encoding === 'text')
        ?? items.find(i => i.format === 'Text')
        ?? items.find(i => i.encoding === 'text');
    
    if (textItem) {
        await vscode.env.clipboard.writeText(textItem.data);
    } else {
        // No explicit text item, use first item's data as text if available
        const firstItem = items[0];
        if (firstItem) {
            await vscode.env.clipboard.writeText(firstItem.data);
        }
    }
}

/**
 * Copies multiple data formats to the Windows clipboard using PowerShell.
 * Uses System.Windows.Forms.Clipboard to support multiple formats.
 */
function copyToClipboardWindows(items: ClipboardItem[]): Promise<void> {
    const { spawn } = require('child_process') as typeof import('child_process');

    // Use PowerShell to set the clipboard data in multiple formats
    // because vscode does not supply a way to set non-text clipboard data and we want to support both PNG and SVG formats for charts.
    return new Promise<void>((resolve, reject) => {
        const psScript = `
            Add-Type -AssemblyName System.Windows.Forms
            $json = $input | Out-String
            $items = ($json | ConvertFrom-Json)
            $data = New-Object System.Windows.Forms.DataObject
            $streams = @()
            foreach ($item in $items) {
                if ($item.encoding -eq 'text') {
                    $data.SetData($item.format, $item.data)
                } else {
                    if ($item.encoding -eq 'base64') {
                        $bytes = [Convert]::FromBase64String($item.data)
                    } else {
                        $bytes = [System.Text.Encoding]::UTF8.GetBytes($item.data)
                    }
                    $stream = New-Object System.IO.MemoryStream(,$bytes)
                    $streams += $stream
                    $data.SetData($item.format, $false, $stream)
                    # Also set as standard bitmap so Electron apps (Teams, Discord) can paste it
                    if ($item.format -eq 'PNG') {
                        Add-Type -AssemblyName System.Drawing
                        $imgStream = New-Object System.IO.MemoryStream(,$bytes)
                        $streams += $imgStream
                        $bitmap = [System.Drawing.Image]::FromStream($imgStream)
                        # Force 96 DPI so the bitmap renders at full pixel size on HiDPI displays
                        # (otherwise it inherits the screen DPI and appears the same logical size)
                        $bitmap.SetResolution(96, 96)
                        $data.SetImage($bitmap)
                    }
                }
            }
            [System.Windows.Forms.Clipboard]::SetDataObject($data, $true)
            foreach ($s in $streams) { $s.Dispose() }
        `;

        const ps = spawn('powershell', ['-sta', '-NoProfile', '-Command', psScript]);

        const payload = JSON.stringify(items);
        ps.stdin.write(payload);
        ps.stdin.end();

        ps.on('close', (code: number) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`PowerShell exited with code ${code}`));
            }
        });

        ps.on('error', (err: Error) => {
            reject(err);
        });
    });
}
