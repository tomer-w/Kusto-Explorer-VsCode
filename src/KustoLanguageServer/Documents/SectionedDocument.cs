using Kusto.Language;
using Kusto.Language.Editor;
using System.Collections.Immutable;
using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

/// <summary>
/// A Kusto document that contains multiple query sections separated by blank lines. 
/// </summary>
public class SectionedDocument : IDocument
{
    private readonly Uri _id;
    private readonly CodeScript _script;

    private SectionedDocument(Uri id, CodeScript script)
    {
        _id = id;
        _script = script ?? throw new ArgumentNullException(nameof(script));
    }

    public SectionedDocument(Uri id, string text, GlobalState globals)
        : this(id, CodeScript.From(text, globals))
    {
    }

    public CodeScript Script => _script;

    public Uri Id => _id;
    public string Text => _script.Text;
    public GlobalState Globals => _script.Globals;

    public IDocument WithText(string text)
    {
        return new SectionedDocument(_id, _script.WithText(text));
    }

    public IDocument WithGlobals(GlobalState globals)
    {  
        return new SectionedDocument(_id, _script.WithGlobals(globals)); 
    }


    private static readonly ConditionalWeakTable<CodeBlock, ISection> _blockSections =
        new ConditionalWeakTable<CodeBlock, ISection>();

    private record BlockSection(CodeService Service) : ISection
    {
        public string Text => this.Service.Text;
    }

    public ISection? GetSection(int position)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
        {
            if (!_blockSections.TryGetValue(block, out var section))
            {
                section = _blockSections.GetOrAdd(block, _block => new BlockSection(_block.Service));
            }
            return section;
        }

        return null;
    }

    public TextRange? GetSectionRange(int position)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
        {
            return new TextRange(block.Start, block.Length);
        }
        return null;
    }

    public IReadOnlyList<TextRange> GetSectionRanges()
    {
        return _script.Blocks.Select(b => new TextRange(b.Start, b.Length)).ToImmutableList();
    }

    public CodeActionResult ApplyCodeAction(ApplyAction action, int caretPosition, CodeActionOptions? options = null, CancellationToken cancellationToken = default)
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
    public IReadOnlyList<Diagnostic> GetAnalyzerDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default)
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

    public ClassificationInfo GetClassifications(int start, int length, bool clipToRange = true, bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        var range = new TextRange(start, length);
        var classifiedRanges = new List<ClassifiedRange>();

        foreach (var block in _script.Blocks)
        {
            var blockRange = new TextRange(block.Start, block.Length);
            if (range.Intersects(blockRange))
            {
                var info = block.Service.GetClassifications(start, length, clipToRange, waitForAnalysis, cancellationToken);
                classifiedRanges.AddRange(info.Classifications);
            }
        }

        return new ClassificationInfo(classifiedRanges);
    }

    public IReadOnlyList<ClientParameter> GetQueryClientParameters(int position)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetClientParameters();
        return Array.Empty<ClientParameter>();
    }

    public CodeActionInfo GetCodeActions(int position, int selectionStart, int selectionLength, CodeActionOptions? options = null, bool waitForAnalysis = true, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetCodeActions(position, selectionStart, selectionLength, options, waitForAnalysis, actorName: null, cancellationToken);
        return CodeActionInfo.NoActions;
    }

    public CompletionInfo GetCompletionItems(int position, string? trigger, CompletionOptions? options = null, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null 
            && (string.IsNullOrEmpty(trigger) || block.Service.ShouldAutoComplete(position, trigger[0], cancellationToken)))
        {
            return block.Service.GetCompletionItems(position, options, cancellationToken);
        }
        return CompletionInfo.Empty;
    }

    private ImmutableList<Diagnostic>? _diagnostics;
    public IReadOnlyList<Diagnostic> GetDiagnostics(bool waitForAnalysis = true, CancellationToken cancellationToken = default)
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

    public TextRange GetElement(int position, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetElement(position, cancellationToken);
        return default;
    }

    public DocumentEdits GetFormattedText(TextRange range, FormattingOptions? options = null, CancellationToken cancellationToken = default)
    {
        var edits = new List<TextEdit>();

        foreach (var block in _script.Blocks)
        {
            var blockRange = new TextRange(block.Start, block.Length);
            if (range.Intersects(blockRange))
            {
                var formattedBlock = block.Service.GetFormattedText(options, caretPosition: 0, cancellationToken);
                if (formattedBlock.Text != block.Text)
                {
                    edits.Add(TextEdit.Replacement(block.Start, block.Length, formattedBlock.Text));
                }
            }
        }

        return new DocumentEdits { OriginalText = _script.Text, Edits = edits.ToImmutableList() };
    }

    public OutlineInfo GetOutlines(OutliningOptions options, CancellationToken cancellationToken = default)
    {
        var ranges = new List<OutlineRange>();
        foreach (var block in _script.Blocks)
        {
            var info = block.Service.GetOutlines(options, cancellationToken);
            ranges.AddRange(info.Ranges);
        }
        return new OutlineInfo(ranges);
    }

    public QuickInfo GetQuickInfo(int position, QuickInfoOptions? options = null, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetQuickInfo(position, options, cancellationToken);
        return QuickInfo.Empty;
    }

    public RelatedInfo GetRelatedElements(int position, FindRelatedOptions options = FindRelatedOptions.None, CancellationToken cancellationToken = default)
    {
        var block = _script.GetBlockAtPosition(position);
        if (block != null)
            return block.Service.GetRelatedElements(position, options, cancellationToken);
        return RelatedInfo.Empty;
    }
}
