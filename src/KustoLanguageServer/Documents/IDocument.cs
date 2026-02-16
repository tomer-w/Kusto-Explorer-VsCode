using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using System.Collections.Immutable;
using System.Text;

namespace Kusto.Lsp;

/// <summary>
/// A Kusto document, represents the query text and the associated operations for providing intellisense and other editor services.
/// </summary>
public interface IDocument
{
    /// <summary>
    /// The id of the document.
    /// </summary>
    public abstract Uri Id { get; }

    /// <summary>
    /// The text of the query.
    /// </summary>
    public abstract string Text { get; }

    /// <summary>
    /// The current <see cref="GlobalState"/> used for understanding semantics of the queries in the document.
    /// </summary>
    public abstract GlobalState Globals { get; }

    /// <summary>
    /// Returns a new document with the text modified.
    /// </summary>
    public abstract IDocument WithText(string text);

    /// <summary>
    /// Returns a new document with the globals modified.
    /// </summary>
    public abstract IDocument WithGlobals(GlobalState globals);

    /// <summary>
    /// Gets the section of the document at the current position.
    /// This item maintains identity across edits of other sections.
    /// </summary>
    public abstract ISection? GetSection(int position);

    /// <summary>
    /// Gets the text range of the section that overlaps the position.
    /// </summary>
    public abstract TextRange? GetSectionRange(int position);

    /// <summary>
    /// Gets the text ranges for all the document sections.
    /// </summary>
    public abstract IReadOnlyList<TextRange> GetSectionRanges();

    /// <summary>
    /// Applies the code action to the document and returns the resulting text and new caret position.
    /// </summary>
    public abstract CodeActionResult ApplyCodeAction(ApplyAction action, int caretPosition, CodeActionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the analyzer diagnostics for the document.
    /// </summary>
    public abstract IReadOnlyList<Diagnostic> GetAnalyzerDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the classifications for the range within the document.
    /// </summary>
    public abstract ClassificationInfo GetClassifications(int start, int length, bool clipToRange = true, bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the client parameters for the query at the position.
    /// </summary>
    public abstract IReadOnlyList<ClientParameter> GetQueryClientParameters(int position);

    /// <summary>
    /// Gets the code actions for the position and selection within the document.
    /// </summary>
    public abstract CodeActionInfo GetCodeActions(int position, int selectionStart, int selectionLength, CodeActionOptions? options = null, bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the completion items for the position within the document.
    /// </summary>
    public abstract CompletionInfo GetCompletionItems(int position, CompletionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the diagnostics for the document.
    /// </summary>
    public abstract IReadOnlyList<Diagnostic> GetDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the text range for the syntax element at the position within the document.
    /// </summary>
    public abstract TextRange GetElement(int position, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the formatted text of the document.
    /// </summary>
    public abstract DocumentEdits GetFormattedText(TextRange range, FormattingOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the outlines for the document.
    /// </summary>
    public abstract OutlineInfo GetOutlines(OutliningOptions options, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the quick info for the position within the document.
    /// </summary>
    public abstract QuickInfo GetQuickInfo(int position, QuickInfoOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the locations of the items related to the item at the position in the document.
    /// </summary>
    public abstract RelatedInfo GetRelatedElements(int position, FindRelatedOptions options = FindRelatedOptions.None, CancellationToken cancellationToken = default);
}

/// <summary>
/// An instance representing a document section that lasts as long as the text stays the same.
/// </summary>
public interface ISection
{
    /// <summary>
    /// The text of the document in this section
    /// </summary>
    public string Text { get; }
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
