using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using System.Collections.Immutable;
using System.Text;

namespace Kusto.Lsp;

/// <summary>
/// A Kusto document, represents the query text and the associated operations for providing intellisense and other editor services.
/// </summary>
public abstract class Document
{
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
    public abstract Document WithText(string text);

    /// <summary>
    /// Returns a new document with the globals modified.
    /// </summary>
    public abstract Document WithGlobals(GlobalState globals);

    /// <summary>
    /// Applies the code action to the document and returns the resulting text and new caret position.
    /// </summary>
    public abstract CodeActionResult ApplyCodeAction(ApplyAction action, int caretPosition, CodeActionOptions? options = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the analyzer diagnostics for the document.
    /// </summary>
    public abstract IReadOnlyList<Diagnostic> GetAnalyzerDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the text ranges for the individual queries in the document.
    /// </summary>
    public abstract IReadOnlyList<TextRange> GetQueryRanges(CancellationToken cancellationToken = default);

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
    /// Gets the minimal text for the query at the position.
    /// </summary>
    public abstract string GetQueryMinimalText(int position, MinimalTextKind kind, CancellationToken cancellationToken = default);

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

/// <summary>
/// A Kusto document that contains multiple queries separated by blank lines. 
/// </summary>
public class MultiQueryDocument : Document
{
    private readonly CodeScript _script;

    private MultiQueryDocument(CodeScript script)
    {
        _script = script ?? throw new ArgumentNullException(nameof(script));
    }

    public MultiQueryDocument(string text, GlobalState globals)
        : this(CodeScript.From(text, globals))
    {
    }

    public CodeScript Script => _script;

    public override string Text => _script.Text;
    public override GlobalState Globals => _script.Globals;

    public override Document WithText(string text)
    {
        return new MultiQueryDocument(_script.WithText(text));
    }

    public override Document WithGlobals(GlobalState globals)
    {  
        return new MultiQueryDocument(_script.WithGlobals(globals)); 
    }

    public override CodeActionResult ApplyCodeAction(ApplyAction action, int caretPosition, CodeActionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(caretPosition);
        if (block != null)
        {
            var result = block.Service.ApplyCodeAction(action, caretPosition, options, cancellationToken);
            var adjusted = result.Actions.Select(a =>
            {
                switch (a)
                {
                    case ChangeTextAction ca:
                        var edits = ca.Changes.Select(c => new TextEdit(c.Start + block.Start, c.DeleteLength, c.InsertText)).ToImmutableList();
                        var changedText = new EditString(_script.Text).ApplyAll(edits);
                        return (ResultAction)new ChangeTextAction(changedText);
                    case MoveCaretAction ma:
                        return new MoveCaretAction(ma.NewCaretPosition + block.Start);
                    default:
                        return a;
                }
            }).ToImmutableList();
            return new CodeActionResult(adjusted);
        }
        return CodeActionResult.Nothing;
    }

    private ImmutableList<Diagnostic>? _analyzerDiagnostics;
    public override IReadOnlyList<Diagnostic> GetAnalyzerDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        if (_analyzerDiagnostics == null)
        {
            var list = new List<Diagnostic>();
            foreach (var block in _script.Blocks)
            {
                var dx = block.Service.GetAnalyzerDiagnostics(waitForAnalysis, cancellationToken);
                list.AddRange(dx);
            }

            _analyzerDiagnostics = list.ToImmutableList();
        }

        return _analyzerDiagnostics;
    }

    public override ClassificationInfo GetClassifications(int start, int length, bool clipToRange = true, bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        var range = new TextRange(start, length);
        var classifiedRanges = new List<ClassifiedRange>();

        foreach (var block in _script.Blocks)
        {
            var blockRange = new TextRange(block.Start, block.Length);
            if (range.Overlaps(blockRange))
            {
                var info = block.Service.GetClassifications(start, length, clipToRange, waitForAnalysis, cancellationToken);
                classifiedRanges.AddRange(info.Classifications);
            }
        }

        return new ClassificationInfo(classifiedRanges);
    }

    public override IReadOnlyList<ClientParameter> GetQueryClientParameters(int position)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetClientParameters();
        return Array.Empty<ClientParameter>();
    }

    public override CodeActionInfo GetCodeActions(int position, int selectionStart, int selectionLength, CodeActionOptions? options = null, bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetCodeActions(position, selectionStart, selectionLength, options, waitForAnalysis, actorName: null, cancellationToken);
        return CodeActionInfo.NoActions;
    }

    public override CompletionInfo GetCompletionItems(int position, CompletionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetCompletionItems(position, options, cancellationToken);
        return CompletionInfo.Empty;
    }

    private ImmutableList<Diagnostic>? _diagnostics;
    public override IReadOnlyList<Diagnostic> GetDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        if (_diagnostics == null)
        {
            var list = new List<Diagnostic>();
            foreach (var block in _script.Blocks)
            {
                var dx = block.Service.GetDiagnostics(waitForAnalysis, cancellationToken);
                list.AddRange(dx);
            }
            _diagnostics = list.ToImmutableList();
        }

        return _diagnostics;
    }

    public override TextRange GetElement(int position, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetElement(position, cancellationToken);
        return default;
    }

    public override DocumentEdits GetFormattedText(TextRange range, FormattingOptions? options = null, CancellationToken cancellationToken = default)
    {
        var edits = new List<TextEdit>();

        foreach (var block in _script.Blocks)
        {
            var blockRange = new TextRange(block.Start, block.Length);
            if (!range.Overlaps(blockRange))
                continue;

            var formattedBlock = block.Service.GetFormattedText(options, caretPosition: 0, cancellationToken);
            if (formattedBlock.Text != block.Text)
            {
                edits.Add(TextEdit.Replacement(block.Start, block.Length, formattedBlock.Text));
            }
        }

        return new DocumentEdits { OriginalText = _script.Text, Edits = edits.ToImmutableList() };
    }

    public override string GetQueryMinimalText(int position, MinimalTextKind kind, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetMinimalText(kind, cancellationToken);
        return "";
    }

    public override OutlineInfo GetOutlines(OutliningOptions options, CancellationToken cancellationToken = default)
    {
        var ranges = new List<OutlineRange>();
        foreach (var block in _script.Blocks)
        {
            var info = block.Service.GetOutlines(options, cancellationToken);
            ranges.AddRange(info.Ranges);
        }
        return new OutlineInfo(ranges);
    }

    public override QuickInfo GetQuickInfo(int position, QuickInfoOptions? options = null, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetQuickInfo(position, options, cancellationToken);
        return QuickInfo.Empty;
    }

    public override RelatedInfo GetRelatedElements(int position, FindRelatedOptions options = FindRelatedOptions.None, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetRelatedElements(position, options, cancellationToken);
        return RelatedInfo.Empty;
    }

    public override IReadOnlyList<TextRange> GetQueryRanges(CancellationToken cancellationToken = default)
    {
        return _script.Blocks.Select(b => new TextRange(b.Start, b.Length)).ToImmutableList();
    }
}

/// <summary>
/// A Kusto document that contains a single query.
/// </summary>
public class SingleQueryDocument : Document
{
    private readonly string _text;
    private readonly GlobalState _globals;
    private readonly KustoCodeService _service;

    public SingleQueryDocument(string text, GlobalState globals)
    {
        _text = text;
        _globals = globals;
        _service = new KustoCodeService(text, globals);
    }

    public override string Text => _text;
    public override GlobalState Globals => _globals;

    public override Document WithText(string text)
    {
        return new SingleQueryDocument(text, _globals);
    }

    public override Document WithGlobals(GlobalState globals)
    {
        return new SingleQueryDocument(_text, globals);
    }

    public KustoCode GetCode()
    {
        // TODO: add accessor to KustoCodeService to get the code, rather than reparsing here.
        var code = KustoCode.ParseAndAnalyze(_text, _globals);
        return code;
    }

    public override CodeActionResult ApplyCodeAction(ApplyAction action, int caretPosition, CodeActionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _service.ApplyCodeAction(action, caretPosition, options, cancellationToken);
    }

    public override IReadOnlyList<Diagnostic> GetAnalyzerDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        return _service.GetAnalyzerDiagnostics(waitForAnalysis, cancellationToken);
    }

    public override ClassificationInfo GetClassifications(int start, int length, bool clipToRange = true, bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        return _service.GetClassifications(start, length, clipToRange, waitForAnalysis, cancellationToken);
    }

    public override IReadOnlyList<ClientParameter> GetQueryClientParameters(int position)
    {
        return _service.GetClientParameters();
    }

    public override CodeActionInfo GetCodeActions(int position, int selectionStart, int selectionLength, CodeActionOptions? options = null, bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        return _service.GetCodeActions(position, selectionStart, selectionLength, options, waitForAnalysis, actorName: null, cancellationToken);
    }

    public override CompletionInfo GetCompletionItems(int position, CompletionOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _service.GetCompletionItems(position, options, cancellationToken);
    }

    public override IReadOnlyList<Diagnostic> GetDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        return _service.GetDiagnostics(waitForAnalysis, cancellationToken);
    }

    public override TextRange GetElement(int position, CancellationToken cancellationToken = default)
    {
        return _service.GetElement(position, cancellationToken);
    }

    public override IReadOnlyList<TextRange> GetQueryRanges(CancellationToken cancellationToken = default)
    {
        return ImmutableList.Create(new TextRange(0, _text.Length));
    }

    public override DocumentEdits GetFormattedText(TextRange range, FormattingOptions? options = null, CancellationToken cancellationToken = default)
    {
        var formatted = _service.GetFormattedText(options, caretPosition: 0, cancellationToken);
        if (formatted.Text != _text)
        {
            var edit = TextEdit.Replacement(0, _text.Length, formatted.Text);
            return new DocumentEdits { OriginalText = _text, Edits = [edit] };
        }
        else
        {
            return new DocumentEdits { OriginalText = _text, Edits = [] };
        }
    }

    public override string GetQueryMinimalText(int position, MinimalTextKind kind, CancellationToken cancellationToken = default)
    {
        return _service.GetMinimalText(kind, cancellationToken);
    }

    public override OutlineInfo GetOutlines(OutliningOptions options, CancellationToken cancellationToken = default)
    {
        return _service.GetOutlines(options, cancellationToken);
    }

    public override QuickInfo GetQuickInfo(int position, QuickInfoOptions? options = null, CancellationToken cancellationToken = default)
    {
        return _service.GetQuickInfo(position, options, cancellationToken);
    }

    public override RelatedInfo GetRelatedElements(int position, FindRelatedOptions options = FindRelatedOptions.None, CancellationToken cancellationToken = default)
    {
        return _service.GetRelatedElements(position, options, cancellationToken);
    }
}