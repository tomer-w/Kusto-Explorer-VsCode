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
