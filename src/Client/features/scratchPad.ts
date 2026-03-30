// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/*
* This module implements the "Query Sets" feature in the sidebar. 
* Each query set is considered a scratch pad - a temporary workspace for Kusto queries that isn't part of the user's source code project,
* but instead a .kql file stored in a space provided by the extension.
*/

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as connections from './connections';

// =============================================================================
// Constants
// =============================================================================

/** URI scheme for scratch pad virtual documents. */
export const SCRATCH_PAD_SCHEME = 'kusto-scratch';

/** Name of the JSON file that stores scratch pad display order. */
const ORDER_FILE = '_order.json';

/** MIME type for scratch pad drag-and-drop within the tree view. */
const SCRATCH_PAD_DRAG_MIME = 'application/vnd.code.tree.kusto.scratchPads';

// =============================================================================
// Module-level State
// =============================================================================

let scratchpadDir: string;
let scratchFs: ScratchPadFileSystemProvider;
let treeProvider: ScratchPadTreeProvider;
let treeView: vscode.TreeView<ScratchPadItem>;

/** Per-document debounce timers for auto-save. */
const autoSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
const AUTO_SAVE_DELAY_MS = 1000;

/** Decoration type for the placeholder hint shown in empty scratch pad documents. */
const placeholderDecoration = vscode.window.createTextEditorDecorationType({
    after: {
        contentText: 'Write a KQL query here, then press F5 to run it.',
        color: new vscode.ThemeColor('editorGhostText.foreground'),
        fontStyle: 'italic',
    },
    isWholeLine: true,
});

// =============================================================================
// URI Helpers
// =============================================================================

/** Builds a virtual URI for a scratch pad file: kusto-scratch:/ScratchPad1.kql */
function scratchUri(fileName: string): vscode.Uri {
    return vscode.Uri.from({ scheme: SCRATCH_PAD_SCHEME, path: '/' + fileName });
}

/** Resolves a virtual URI to its backing file path on disk. */
function diskPath(uri: vscode.Uri): string {
    // uri.path is like "/ScratchPad1.kql" — strip the leading slash
    const fileName = uri.path.replace(/^\//, '');
    return path.join(scratchpadDir, fileName);
}

// =============================================================================
// FileSystemProvider — maps kusto-scratch:/ URIs to real files on disk
// =============================================================================

class ScratchPadFileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile = this._onDidChangeFile.event;

    watch(): vscode.Disposable {
        // No-op: we fire change events explicitly when we write files
        return new vscode.Disposable(() => {});
    }

    stat(uri: vscode.Uri): vscode.FileStat {
        const filePath = diskPath(uri);
        const stat = fs.statSync(filePath);
        return {
            type: vscode.FileType.File,
            ctime: stat.ctimeMs,
            mtime: stat.mtimeMs,
            size: stat.size,
        };
    }

    readDirectory(_uri: vscode.Uri): [string, vscode.FileType][] {
        return getScratchPadFiles().map(f => [f, vscode.FileType.File]);
    }

    readFile(uri: vscode.Uri): Uint8Array {
        const filePath = diskPath(uri);
        return fs.readFileSync(filePath);
    }

    writeFile(uri: vscode.Uri, content: Uint8Array, _options: { create: boolean; overwrite: boolean }): void {
        const filePath = diskPath(uri);
        fs.writeFileSync(filePath, content);
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Changed, uri }]);
    }

    delete(uri: vscode.Uri): void {
        const filePath = diskPath(uri);
        fs.unlinkSync(filePath);
        this._onDidChangeFile.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    rename(oldUri: vscode.Uri, newUri: vscode.Uri): void {
        fs.renameSync(diskPath(oldUri), diskPath(newUri));
        this._onDidChangeFile.fire([
            { type: vscode.FileChangeType.Deleted, uri: oldUri },
            { type: vscode.FileChangeType.Created, uri: newUri },
        ]);
    }

    createDirectory(_uri: vscode.Uri): void {
        // Not needed — the backing directory is managed in activate()
    }

    dispose(): void {
        this._onDidChangeFile.dispose();
    }
}

// =============================================================================
// Activation
// =============================================================================

/**
 * Activates the scratch pad feature: creates the storage directory, registers
 * the virtual file system, tree view and commands, and ensures a default scratch pad exists.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    // Ensure scratchpads directory exists under extension global storage
    scratchpadDir = path.join(context.globalStorageUri.fsPath, 'scratchpads');
    await fs.promises.mkdir(scratchpadDir, { recursive: true });

    // Register virtual file system provider
    scratchFs = new ScratchPadFileSystemProvider();
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider(SCRATCH_PAD_SCHEME, scratchFs)
    );

    // Register tree data provider with drag and drop support
    treeProvider = new ScratchPadTreeProvider();
    treeView = vscode.window.createTreeView('kusto.scratchPads', {
        treeDataProvider: treeProvider,
        dragAndDropController: new ScratchPadDragAndDropController(),
    });
    context.subscriptions.push(treeView);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('kusto.newScratchPad', () => createScratchPad()),
        vscode.commands.registerCommand('kusto.openScratchPad', (item: ScratchPadItem) => openScratchPad(item)),
        vscode.commands.registerCommand('kusto.deleteScratchPad', (item: ScratchPadItem) => deleteScratchPad(item)),
        vscode.commands.registerCommand('kusto.renameScratchPad', (item: ScratchPadItem) => renameScratchPad(item)),
        vscode.commands.registerCommand('kusto.saveScratchPadAs', () => saveScratchPadAs()),
    );

    // Auto-open a scratch pad when the sidebar becomes visible and no Kusto doc is active
    treeView.onDidChangeVisibility(async (e) => {
        if (e.visible && !hasActiveKustoDocument()) {
            await openOrCreateDefaultScratchPad();
        }
    });

    // Auto-save scratch pad documents after a pause in editing
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.scheme === SCRATCH_PAD_SCHEME) {
                scheduleAutoSave(e.document);
            }
        })
    );

    // Show/hide placeholder hint when scratch pad content or active editor changes
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updatePlaceholder),
        vscode.workspace.onDidChangeTextDocument((e) => {
            const editor = vscode.window.activeTextEditor;
            if (editor && e.document === editor.document) {
                updatePlaceholder(editor);
            }
        }),
        placeholderDecoration,
    );

    // Create a default scratch pad if none exist yet
    if (getScratchPadFiles().length === 0) {
        await createScratchPadFile(nextScratchPadFileName([]));
    }
}

// =============================================================================
// File Helpers
// =============================================================================

/** Returns ordered list of .kql filenames in the scratchpads directory, respecting user-defined order. */
function getScratchPadFiles(): string[] {
    if (!fs.existsSync(scratchpadDir)) {
        return [];
    }
    const filesOnDisk = fs.readdirSync(scratchpadDir)
        .filter(f => f.endsWith('.kql'));
    if (filesOnDisk.length === 0) {
        return [];
    }
    const order = readOrder();
    return reconcileOrder(order, filesOnDisk);
}

/** Reads the order list from disk. Returns an empty array if the file doesn't exist or is invalid. */
function readOrder(): string[] {
    const orderPath = path.join(scratchpadDir, ORDER_FILE);
    try {
        const data = fs.readFileSync(orderPath, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed;
        }
    } catch {
        // File missing or invalid — return empty
    }
    return [];
}

/** Writes the order list to disk. */
function saveOrder(order: string[]): void {
    const orderPath = path.join(scratchpadDir, ORDER_FILE);
    fs.writeFileSync(orderPath, JSON.stringify(order, null, 2), 'utf-8');
}

/**
 * Reconciles the persisted order with actual files on disk.
 * - Preserves order for files that still exist
 * - Removes entries for files that no longer exist on disk
 * - Appends any new files not in the order list to the end
 * Saves the reconciled order if it changed.
 */
function reconcileOrder(order: string[], filesOnDisk: string[]): string[] {
    const diskSet = new Set(filesOnDisk);
    const orderSet = new Set(order);

    // Keep only entries that still exist on disk
    const reconciled = order.filter(f => diskSet.has(f));

    // Append any files on disk that aren't in the order list (sorted for determinism on first migration)
    const newFiles = filesOnDisk.filter(f => !orderSet.has(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    reconciled.push(...newFiles);

    // Save if the order changed
    if (reconciled.length !== order.length || reconciled.some((f, i) => f !== order[i])) {
        saveOrder(reconciled);
    }

    return reconciled;
}

/** Returns the next available ScratchPad filename (e.g. "ScratchPad1.kql") that doesn't conflict with existing files. */
function nextScratchPadFileName(existing: string[]): string {
    let num = 1;
    while (existing.includes(`ScratchPad${num}.kql`)) {
        num++;
    }
    return `ScratchPad${num}.kql`;
}

/** Creates an empty .kql file in the scratchpads directory if it doesn't exist, and appends to order. */
async function createScratchPadFile(name: string): Promise<void> {
    const filePath = path.join(scratchpadDir, name);
    if (!fs.existsSync(filePath)) {
        await fs.promises.writeFile(filePath, '', 'utf-8');
    }
    const order = readOrder();
    if (!order.includes(name)) {
        order.push(name);
        saveOrder(order);
    }
}

/**
 * Adds a scratch pad file with the given name and content.
 * If name is null, the next available ScratchPad name is used.
 * If a file with the same name already exists, a numeric suffix is added.
 * Returns the final filename used.
 */
export async function addScratchPadFile(name: string | null, content: string): Promise<string> {
    const existing = getScratchPadFiles();
    let finalName = name ?? nextScratchPadFileName(existing);
    if (!finalName.endsWith('.kql')) {
        finalName += '.kql';
    }
    if (existing.includes(finalName)) {
        const base = path.basename(finalName, '.kql');
        let num = 2;
        while (existing.includes(`${base} (${num}).kql`)) {
            num++;
        }
        finalName = `${base} (${num}).kql`;
    }
    const filePath = path.join(scratchpadDir, finalName);
    await fs.promises.writeFile(filePath, content, 'utf-8');
    const order = readOrder();
    if (!order.includes(finalName)) {
        order.push(finalName);
        saveOrder(order);
    }
    treeProvider.refresh();
    return finalName;
}

function hasActiveKustoDocument(): boolean {
    return vscode.window.activeTextEditor?.document.languageId === 'kusto' || false;
}

/** Shows or hides the placeholder decoration based on whether the document is an empty scratch pad. */
function updatePlaceholder(editor: vscode.TextEditor | undefined): void {
    if (!editor) {
        return;
    }
    if (editor.document.uri.scheme === SCRATCH_PAD_SCHEME && editor.document.getText().length === 0) {
        const range = new vscode.Range(0, 0, 0, 0);
        editor.setDecorations(placeholderDecoration, [{ range }]);
    } else {
        editor.setDecorations(placeholderDecoration, []);
    }
}

/** Debounced auto-save: resets the timer on each edit, saves after the delay. */
function scheduleAutoSave(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const existing = autoSaveTimers.get(key);
    if (existing) {
        clearTimeout(existing);
    }
    autoSaveTimers.set(key, setTimeout(async () => {
        autoSaveTimers.delete(key);
        if (!document.isClosed && document.isDirty) {
            await document.save();
        }
    }, AUTO_SAVE_DELAY_MS));
}

// =============================================================================
// Command Handlers
// =============================================================================

/**
 * Resolves a connection to inherit for a new scratch pad document.
 * Priority: active editor's connection > first existing scratch pad's connection.
 */
async function resolveConnectionToInherit(): Promise<connections.DocumentConnection | undefined> {
    // Try the active editor's document connection first
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === 'kusto') {
        const conn = await connections.getDocumentConnection(activeEditor.document.uri.toString());
        if (conn?.cluster) {
            return conn;
        }
    }

    // Fall back to the first existing scratch pad's connection
    const files = getScratchPadFiles();
    for (const file of files) {
        const uri = scratchUri(file).toString();
        const conn = await connections.getDocumentConnection(uri);
        if (conn?.cluster) {
            return conn;
        }
    }

    return undefined;
}

/** Opens a scratch pad document by virtual URI. */
async function openScratchPadByName(fileName: string): Promise<void> {
    const uri = scratchUri(fileName);
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc);
    updatePlaceholder(editor);
}

/** Opens or creates the first scratch pad. */
async function openOrCreateDefaultScratchPad(): Promise<void> {
    const files = getScratchPadFiles();
    let name: string;
    if (files.length > 0) {
        name = files[0]!;
    } else {
        name = nextScratchPadFileName([]);
        await createScratchPadFile(name);
    }
    await openScratchPadByName(name);
}

/** Creates a new scratch pad with the lowest available number. */
async function createScratchPad(): Promise<void> {
    const existing = getScratchPadFiles();
    const name = nextScratchPadFileName(existing);

    // Resolve connection to inherit before opening the new document
    const inheritedConnection = await resolveConnectionToInherit();

    await createScratchPadFile(name);
    await openScratchPadByName(name);

    // Apply the inherited connection to the new scratch pad
    if (inheritedConnection?.cluster) {
        const newUri = scratchUri(name).toString();
        await connections.setDocumentConnection(newUri, inheritedConnection.cluster, inheritedConnection.database);
    }

    treeProvider.refresh();
}

/** Opens the scratch pad file associated with a tree item. */
async function openScratchPad(item: ScratchPadItem): Promise<void> {
    await openScratchPadByName(item.fileName);
}

/** Deletes a scratch pad file after confirmation. */
async function deleteScratchPad(item: ScratchPadItem): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
        `Delete query "${path.basename(item.fileName, '.kql')}"?`,
        { modal: true },
        'Delete'
    );
    if (confirm !== 'Delete') {
        return;
    }

    // Close any editors showing this virtual URI
    const uri = scratchUri(item.fileName);
    for (const tabGroup of vscode.window.tabGroups.all) {
        for (const tab of tabGroup.tabs) {
            if (tab.input instanceof vscode.TabInputText && tab.input.uri.toString() === uri.toString()) {
                await vscode.window.tabGroups.close(tab);
            }
        }
    }

    scratchFs.delete(uri);
    const order = readOrder();
    const idx = order.indexOf(item.fileName);
    if (idx !== -1) {
        order.splice(idx, 1);
        saveOrder(order);
    }
    treeProvider.refresh();
}

/** Renames a scratch pad, updating the backing file, any open editor tab, and the tree. */
async function renameScratchPad(item: ScratchPadItem): Promise<void> {
    const currentName = path.basename(item.fileName, '.kql');
    const newName = await vscode.window.showInputBox({
        prompt: 'Enter new name for the query document',
        value: currentName,
        validateInput: (value) => {
            if (!value.trim()) {
                return 'Name cannot be empty';
            }
            const newFileName = value.trim() + '.kql';
            if (newFileName !== item.fileName && getScratchPadFiles().includes(newFileName)) {
                return 'A query document with that name already exists';
            }
            return undefined;
        },
    });
    if (!newName || newName.trim() + '.kql' === item.fileName) {
        return;
    }

    const newFileName = newName.trim() + '.kql';
    const oldUri = scratchUri(item.fileName);
    const newUri = scratchUri(newFileName);

    // Save any unsaved content before renaming
    const openDoc = vscode.workspace.textDocuments.find(d => d.uri.toString() === oldUri.toString());
    if (openDoc?.isDirty) {
        await openDoc.save();
    }

    // Close the old editor tab (if open)
    let viewColumn: vscode.ViewColumn | undefined;
    for (const tabGroup of vscode.window.tabGroups.all) {
        for (const tab of tabGroup.tabs) {
            if (tab.input instanceof vscode.TabInputText && tab.input.uri.toString() === oldUri.toString()) {
                viewColumn = tabGroup.viewColumn;
                await vscode.window.tabGroups.close(tab);
            }
        }
    }

    // Rename the backing file and update the order in-place
    scratchFs.rename(oldUri, newUri);
    const order = readOrder();
    const idx = order.indexOf(item.fileName);
    if (idx !== -1) {
        order[idx] = newFileName;
        saveOrder(order);
    }
    treeProvider.refresh();

    // Re-open under the new URI in the same column
    if (viewColumn !== undefined) {
        await openScratchPadByName(newFileName);
    }
}

/** Saves the current scratch pad as a regular file, removes the scratch pad, and opens the new file. */
async function saveScratchPadAs(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.scheme !== SCRATCH_PAD_SCHEME) {
        return;
    }

    const scratchDocument = editor.document;
    const scratchUriValue = scratchDocument.uri;
    const viewColumn = editor.viewColumn;

    // Prompt user for destination
    const defaultName = path.basename(scratchUriValue.path);
    const target = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(defaultName),
        filters: { 'Kusto Query': ['kql', 'csl', 'kusto'] },
    });
    if (!target) {
        return;
    }

    // Capture the scratch pad's connection info before any changes
    const scratchConnection = await connections.getDocumentConnection(scratchUriValue.toString());

    // Write content to the new file location
    const content = Buffer.from(scratchDocument.getText(), 'utf-8');
    await vscode.workspace.fs.writeFile(target, content);

    // Transfer connection info to the new file
    if (scratchConnection?.cluster) {
        await connections.setDocumentConnection(target.toString(), scratchConnection.cluster, scratchConnection.database);
    }

    // Ask the user what to do with the original scratch pad
    const action = await vscode.window.showInformationMessage(
        `What would you like to do with the original query set "${path.basename(scratchUriValue.path, '.kql')}"?`,
        { modal: true },
        'Keep',
        'Keep and Clear',
        'Remove',
    );
    if (!action) {
        // User dismissed the dialog — just open the saved file, keep scratch pad as-is
        const newDoc = await vscode.workspace.openTextDocument(target);
        await vscode.window.showTextDocument(newDoc, viewColumn);
        return;
    }

    if (action === 'Remove') {
        // Close the scratch pad tab and delete it
        for (const tabGroup of vscode.window.tabGroups.all) {
            for (const tab of tabGroup.tabs) {
                if (tab.input instanceof vscode.TabInputText && tab.input.uri.toString() === scratchUriValue.toString()) {
                    await vscode.window.tabGroups.close(tab);
                }
            }
        }
        scratchFs.delete(scratchUriValue);
        const order = readOrder();
        const orderIdx = order.indexOf(path.basename(scratchUriValue.path.replace(/^\//, '')));
        if (orderIdx !== -1) {
            order.splice(orderIdx, 1);
            saveOrder(order);
        }
        treeProvider.refresh();
    } else if (action === 'Keep and Clear') {
        // Clear the scratch pad content
        scratchFs.writeFile(scratchUriValue, new Uint8Array(), { create: false, overwrite: true });
    }

    // Open the new file in the same column
    const newDoc = await vscode.workspace.openTextDocument(target);
    await vscode.window.showTextDocument(newDoc, viewColumn);
}

// =============================================================================
// Tree Data Provider
// =============================================================================

class ScratchPadTreeProvider implements vscode.TreeDataProvider<ScratchPadItem> {
    private _onDidChange = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this._onDidChange.event;

    refresh(): void {
        this._onDidChange.fire();
    }

    getTreeItem(element: ScratchPadItem): vscode.TreeItem {
        return element;
    }

    getChildren(): ScratchPadItem[] {
        return getScratchPadFiles().map(f => new ScratchPadItem(f));
    }
}

// =============================================================================
// Drag and Drop Controller
// =============================================================================

class ScratchPadDragAndDropController implements vscode.TreeDragAndDropController<ScratchPadItem> {
    readonly dropMimeTypes = [SCRATCH_PAD_DRAG_MIME];
    readonly dragMimeTypes = [SCRATCH_PAD_DRAG_MIME];

    handleDrag(source: readonly ScratchPadItem[], dataTransfer: vscode.DataTransfer): void {
        if (source.length === 1) {
            dataTransfer.set(SCRATCH_PAD_DRAG_MIME, new vscode.DataTransferItem(source[0]!.fileName));
        }
    }

    async handleDrop(target: ScratchPadItem | undefined, dataTransfer: vscode.DataTransfer): Promise<void> {
        const transferItem = dataTransfer.get(SCRATCH_PAD_DRAG_MIME);
        if (!transferItem || !target) {
            return;
        }

        const draggedFileName = transferItem.value as string;
        if (draggedFileName === target.fileName) {
            return;
        }

        const order = readOrder();
        const fromIndex = order.indexOf(draggedFileName);
        const toIndex = order.indexOf(target.fileName);
        if (fromIndex === -1 || toIndex === -1) {
            return;
        }

        // Remove from old position and insert at new position
        order.splice(fromIndex, 1);
        order.splice(toIndex, 0, draggedFileName);
        saveOrder(order);
        treeProvider.refresh();
    }
}

// =============================================================================
// Tree Items
// =============================================================================

class ScratchPadItem extends vscode.TreeItem {
    constructor(public readonly fileName: string) {
        super(path.basename(fileName, '.kql'), vscode.TreeItemCollapsibleState.None);
        this.command = {
            command: 'kusto.openScratchPad',
            title: 'Open',
            arguments: [this]
        };
        this.contextValue = 'scratchPad';
        this.iconPath = new vscode.ThemeIcon('file');
        this.resourceUri = scratchUri(fileName);
    }
}
