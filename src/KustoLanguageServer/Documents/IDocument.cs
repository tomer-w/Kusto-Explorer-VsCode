using Kusto.Language;
using Kusto.Language.Editor;
using System.Collections.Immutable;

namespace Kusto.Lsp;

/// <summary>
/// A Kusto document, represents the query text and the associated operations for providing intellisense and other editor services.
/// </summary>
public interface IDocument
{
    /// <summary>
    /// The id of the document.
    /// </summary>
    Uri Id { get; }

    /// <summary>
    /// The text of the query.
    /// </summary>
    string Text { get; }

    /// <summary>
    /// The current <see cref="GlobalState"/> used for understanding semantics of the queries in the document.
    /// </summary>
    GlobalState Globals { get; }

    /// <summary>
    /// Returns a new document with the text modified.
    /// </summary>
    IDocument WithText(string text);

    /// <summary>
    /// Returns a new document with the globals modified.
    /// </summary>
    IDocument WithGlobals(GlobalState globals);

    /// <summary>
    /// Gets the section of the document at the current position.
    /// This item maintains identity across edits of other sections.
    /// </summary>
    ISection? GetSection(int position);

    /// <summary>
    /// Gets the text range of the section that overlaps the position.
    /// </summary>
    TextRange? GetSectionRange(int position);

    /// <summary>
    /// Gets the text ranges for all the document sections.
    /// </summary>
    IReadOnlyList<TextRange> GetSectionRanges();

    /// <summary>
    /// Gets the minimal text of the section associated with the document position.
    /// </summary>
    /// <returns></returns>
    string? GetMinimalText(int position, MinimalTextKind kind);

    /// <summary>
    /// Applies the code action to the document and returns the resulting text and new caret position.
    /// </summary>
    CodeActionResult ApplyCodeAction(ApplyAction action, int caretPosition, CodeActionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the analyzer diagnostics for the document.
    /// </summary>
    IReadOnlyList<Diagnostic> GetAnalyzerDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the classifications for the range within the document.
    /// </summary>
    ClassificationInfo GetClassifications(int start, int length, bool clipToRange = true, bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the client parameters for the query at the position.
    /// </summary>
    IReadOnlyList<ClientParameter> GetQueryClientParameters(int position);

    /// <summary>
    /// Gets the code actions for the position and selection within the document.
    /// </summary>
    CodeActionInfo GetCodeActions(int position, int selectionStart, int selectionLength, CodeActionOptions? options = null, bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the completion items for the position within the document.
    /// </summary>
    CompletionInfo GetCompletionItems(int position, string? trigger, CompletionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the diagnostics for the document.
    /// </summary>
    IReadOnlyList<Diagnostic> GetDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the text range for the syntax element at the position within the document.
    /// </summary>
    TextRange GetElement(int position, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the formatted text of the document.
    /// </summary>
    DocumentEdits GetFormattedText(TextRange range, FormattingOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the outlines for the document.
    /// </summary>
    OutlineInfo GetOutlines(OutliningOptions options, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the quick info for the position within the document.
    /// </summary>
    QuickInfo GetQuickInfo(int position, QuickInfoOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the locations of the items related to the item at the position in the document.
    /// </summary>
    RelatedInfo GetRelatedElements(int position, FindRelatedOptions options = FindRelatedOptions.None, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the clusters referenced in the document.
    /// </summary>
    ImmutableList<ClusterReference> GetClusterReferences(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the databases reference in the document.
    /// </summary>
    ImmutableList<DatabaseReference> GetDatabaseReferences(CancellationToken cancellationToken = default);
}

/// <summary>
/// An instance representing a document section that lasts as long as the text stays the same.
/// </summary>
public interface ISection
{
    /// <summary>
    /// The text of the document in this section
    /// </summary>
    string Text { get; }
}

/// <summary>
/// Represents the result of applying a set of text edits to a document, including the original text, the list of edits,
/// and the resulting edited text.
/// </summary>
public record DocumentEdits
{
    /// <summary>
    /// The original text of the document before formatting.
    /// </summary>
    public required string OriginalText { get; init; }

    /// <summary>
    /// The edits made by formatting the document.
    /// </summary>
    public required ImmutableList<TextEdit> Edits { get; init; }

    /// <summary>
    /// The edited version of the document.
    /// </summary>
    public EditString EditedText
    {
        get
        {
            if (_formattedText == null)
            {
                _formattedText = new EditString(OriginalText).ApplyAll(Edits);
            }
            return _formattedText;
        }
    }

    private EditString? _formattedText;
}
