// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';

/**
 * Identifies completion items where a commit character also appears in the insertText,
 * which would cause the character to be doubled when used to commit the completion.
 * Attaches a post-completion command that detects and removes the duplicate.
 * @param globalCommitChars Commit characters defined in server capabilities (apply to all items)
 */
export function fixCompletionCommit(
    result: vscode.CompletionItem[] | vscode.CompletionList | null | undefined,
    globalCommitChars: string[]
): vscode.CompletionItem[] | vscode.CompletionList | null | undefined {
    if (!result) {
        return result;
    }

    const items = Array.isArray(result) ? result : result.items;

    for (const item of items) {
        // Use per-item commit characters if set, otherwise fall back to global
        const commitChars = (item.commitCharacters && item.commitCharacters.length > 0)
            ? item.commitCharacters
            : globalCommitChars;

        if (commitChars.length === 0) {
            continue;
        }

        const insertText = typeof item.insertText === 'string'
            ? item.insertText
            : item.insertText instanceof vscode.SnippetString
                ? item.insertText.value
                : undefined;

        if (!insertText) {
            continue;
        }

        // Find commit characters that appear in the insert text and could be doubled
        const conflicting = commitChars.filter(ch => insertText.includes(ch));
        if (conflicting.length > 0) {
            // Attach a command that runs after the completion is accepted.
            // It checks if the typed commit character was doubled and removes the duplicate.
            item.command = {
                title: '',
                command: 'kusto.fixCommitCharDoubling',
                arguments: [conflicting, item.command]
            };
        }
    }

    return result;
}

/**
 * Handles the post-completion fix for doubled commit characters.
 * The command fires before the commit character is inserted into the document,
 * so we listen for the next document change and use the change event to find
 * where the commit character was inserted, then check if it caused a doubling.
 */
export async function fixCommitCharDoubling(commitChars: string[], originalCommand?: vscode.Command): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'kusto') {
        const disposable = vscode.workspace.onDidChangeTextDocument(async (e) => {
            if (e.document !== editor.document) {
                return;
            }
            disposable.dispose();

            // Find a single-character insertion that matches a conflicting commit char
            for (const change of e.contentChanges) {
                if (change.text.length === 1 && commitChars.includes(change.text)) {
                    // The commit char was inserted at change.range.start
                    // Check if the character just before it is the same
                    const insertPos = change.range.start;
                    if (insertPos.character >= 1) {
                        const charBefore = e.document.getText(
                            new vscode.Range(insertPos.translate(0, -1), insertPos)
                        );
                        if (charBefore === change.text) {
                            // Delete the duplicate (the newly inserted one, now at insertPos)
                            await editor.edit(eb => {
                                eb.delete(new vscode.Range(insertPos, insertPos.translate(0, 1)));
                            }, { undoStopBefore: false, undoStopAfter: false });
                        }
                    }
                    break;
                }
            }
        });

        // Safety: dispose the listener if no change comes within 1 second
        setTimeout(() => disposable.dispose(), 1000);
    }

    // Preserve any original command from the server
    if (originalCommand) {
        await vscode.commands.executeCommand(originalCommand.command, ...(originalCommand.arguments ?? []));
    }
}
