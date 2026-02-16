using Kusto.Data;
using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using Lsp.Common;
using StreamJsonRpc;

using System.Collections.Immutable;
using System.Data;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using LSP=Microsoft.VisualStudio.LanguageServer.Protocol;

namespace Kusto.Lsp;

public class KustoLspServer : LspServer, ILogger
{
    private readonly IConnectionManager _connectionManager;
    private readonly ISymbolManager _symbolManager;
    private readonly IDocumentManager _documentManager;
    private readonly IDiagnosticsManager _diagnosticsManager;
    private readonly IQueryManager _queryManager;
    private readonly IChartManager _chartManager;
    private readonly IResultsManager _resultsManager;
    private readonly IDefinitionManager _definitionManager;
    private readonly ImmutableList<string> _args;

    public KustoLspServer(
        Stream input, 
        Stream output, 
        string[] args, 
        IConnectionManager connectionManager,
        ISymbolManager symbolManager,
        IDocumentManager documentManager,
        IDiagnosticsManager diagnosticsManager,
        IQueryManager queryManager,
        IChartManager chartManager,
        IResultsManager resultsManager,
        IDefinitionManager definitionManager)
        : base(input, output)
    {
        _args = args.ToImmutableList();
        _connectionManager = connectionManager;
        _symbolManager = symbolManager;
        _documentManager = documentManager;
        _diagnosticsManager = diagnosticsManager;
        _queryManager = queryManager;
        _chartManager = chartManager;
        _resultsManager = resultsManager;
        _definitionManager = definitionManager;
        InitEvents();
    }

    public KustoLspServer(
        Stream input,
        Stream output,
        string[] args)
        : base(input, output)
    {
        _args = args.ToImmutableList();
        _connectionManager = new ConnectionManager();
        _symbolManager = new SymbolManager(_connectionManager);
        _documentManager = new DocumentManager(_symbolManager, this);
        _diagnosticsManager = new DiagnosticsManager(_documentManager);
        _queryManager = new QueryManager(_connectionManager, _documentManager, this);
        _chartManager = new PlotlyChartManager();
        _resultsManager = new ResultsManager();
        _definitionManager = new DefinitionManager(_connectionManager);
        InitEvents();
    }

    private void InitEvents()
    {
        _symbolManager.GlobalsChanged += _symbolManager_GlobalsChanged;
        _documentManager.DocumentChanged += _scriptManager_ScriptChanged;
        _diagnosticsManager.DiagnosticsUpdated += _diagnosticsManager_DiagnosticsUpdated;
    }

    void ILogger.Log(string message)
    {
        var _ = this.SendWindowLogMessageAsync(message);
    }

    /// <summary>
    /// The client settings supplied during initialization.
    /// </summary>
    protected LSP.InitializeParams ClientSettings { get; private set; } = null!;

    /// <summary>
    /// The server settings reported to client during initialization.
    /// </summary>
    protected LSP.InitializeResult ServerSettings { get; private set; } = null!;

    #region Events

    private async void _symbolManager_GlobalsChanged(object? sender, GlobalState e)
    {
        // since globals changed it is possible that some semantic tokens are now different, so request client to refresh them
        await this.SendWorkspaceSemanticTokensRefresh();
    }

    private void _scriptManager_ScriptChanged(object? sender, Uri id)
    {
    }

    private void _diagnosticsManager_DiagnosticsUpdated(object? sender, DiagnosticInfo diagnostics)
    {
        var _ = PublishDiagnosticsAsync(diagnostics);
    }

    #endregion

    #region LSP Implementation

    #region Initialize

    /// <summary>
    /// Initialize the language server document & settings.
    /// </summary>
    public override Task<LSP.InitializeResult> OnInitializeAsync(LSP.InitializeParams @params, CancellationToken cancellationToken)
    {
        this.ClientSettings = @params;

        var semanticTokenOptions = @params.Capabilities?.TextDocument?.SemanticTokens != null
            ? new LSP.SemanticTokensOptions
                {
                    Legend = new LSP.SemanticTokensLegend
                    {
                        TokenTypes = Enum.GetValues<ClassificationKind>().Select(ck => GetSemanticTokenKind(ck)).Where(tk => tk != null).OfType<string>().ToArray() ?? [],
                        TokenModifiers = []
                        //TokenTypes = @params.Capabilities.TextDocument.SemanticTokens.TokenTypes ?? [],
                        //TokenModifiers = @params.Capabilities.TextDocument.SemanticTokens.TokenModifiers ?? []
                    },
                    Full = true,
                    Range = true
                }
            : null;

        var completionOptions = new LSP.CompletionOptions
        {
            ResolveProvider = false,
            TriggerCharacters = ["(", "[", ".", " "],
            AllCommitCharacters = ["\t", " ", "(", ")", "{", "}", "[", "]", ".", ",", ";"]
        };

        this.ServerSettings = new LSP.InitializeResult
        {
            Capabilities = new LSP.ServerCapabilities
            {
                TextDocumentSync = new LSP.TextDocumentSyncOptions
                {
                    OpenClose = true,
                    Change = LSP.TextDocumentSyncKind.Full,
                    Save = new LSP.SaveOptions { IncludeText = true }
                },
                SemanticTokensOptions = semanticTokenOptions, // kusto classifications
                CompletionProvider = completionOptions,
                HoverProvider = true,  // kusto quick infos
                FoldingRangeProvider = true, // kusto outlining
                DocumentFormattingProvider = true,
                DocumentRangeFormattingProvider = true,
                DocumentHighlightProvider = true, // highlights matching elements (brackets, names, etc)
                ReferencesProvider = true, // find references
                DefinitionProvider = true, // goto definition
                CodeActionProvider = new LSP.CodeActionOptions
                {
                    CodeActionKinds =
                    [
                        LSP.CodeActionKind.QuickFix,
                        LSP.CodeActionKind.Refactor,
                        LSP.CodeActionKind.RefactorExtract,
                        LSP.CodeActionKind.RefactorInline,
                        LSP.CodeActionKind.RefactorRewrite,
                        LSP.CodeActionKind.Source,
                        //LSP.CodeActionKind.SourceOrganizeImports
                    ],
                    ResolveProvider = true
                },
                RenameProvider = new LSP.RenameOptions { PrepareProvider = false },
                //ExecuteCommandProvider = new LSP.ExecuteCommandOptions
                //{
                //    Commands = 
                //    [
                //        "Connect",
                //        "Query" 
                //    ]
                //},
#if false
                //DocumentSymbolProvider = true,  // mabye?
                //WorkspaceSymbolProvider = true,  // maybe?
                //SignatureHelpProvider = new SignatureHelpOptions
                //{
                //    TriggerCharacters = new[] { "(", "," }
                //},
                //CodeLensProvider = new CodeLensOptions { ResolveProvider = true },
                //DocumentOnTypeFormattingProvider = new DocumentOnTypeFormattingOptions
                //{
                //    FirstTriggerCharacter = ";",
                //    MoreTriggerCharacter = new[] { "}", "\n" }
                //},
                //DocumentLinkProvider = new DocumentLinkOptions { ResolveProvider = true },
                //DocumentColorProvider = true,
                //CallHierarchyProvider = true,     // a call hierarchy of functions?
                //LinkedEditingRangeProvider = true,
                //TypeDefinitionProvider = true,   // kusto does not have types that can be declared
                //ImplementationProvider = true,   // goto implementation?  Maybe have this open a source file that shows the database function declaration?
                //InlayHintProvider = new InlayHintOptions { ResolveProvider = true }
#endif
            }
        };

        return Task.FromResult(this.ServerSettings);
    }

    #endregion

    #region Diagnostics Publishing

    private async Task PublishDiagnosticsAsync(DiagnosticInfo info)
    {
        var lspDiagnostics = info.Diagnostics.Select(d =>
            new LSP.Diagnostic
            {
                Range = GetLspRange(info.Text, new TextRange(d.Start, d.Length)),
                Code = d.Code,
                Message = d.Message,
                Severity = GetSeverity(d.Severity)
            }).ToArray();

        var pdParams = new LSP.PublishDiagnosticParams
        {
            Uri = info.Id,
            Diagnostics = lspDiagnostics
        };

        // publish new diagnostics to the client
        await this.SendTextDocumentPublishDiagnosticsAsync(pdParams).ConfigureAwait(false);

        LSP.DiagnosticSeverity GetSeverity(string severity) =>
            severity switch
            {
                DiagnosticSeverity.Error => LSP.DiagnosticSeverity.Error,
                DiagnosticSeverity.Warning => LSP.DiagnosticSeverity.Warning,
                DiagnosticSeverity.Suggestion => LSP.DiagnosticSeverity.Hint,
                DiagnosticSeverity.Information => LSP.DiagnosticSeverity.Information,
                _ => LSP.DiagnosticSeverity.Information
            };
    }

    #endregion

    #region Document Open/Close/Change

    public override Task OnTextDocumentOpenedAsync(LSP.DidOpenTextDocumentParams @params)
    {
        try
        {
            _documentManager.AddDocument(@params.TextDocument.Uri, @params.TextDocument.Text);

            // temporary telemetry
            _ = this.SendWindowLogMessageAsync($"text document opened: {@params.TextDocument.Uri}");
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.CompletedTask;
    }

    public override Task OnTextDocumentDidCloseAsync(LSP.DidCloseTextDocumentParams @params)
    {
        try
        {
            _documentManager.RemoveDocument(@params.TextDocument.Uri);
            this.SendWindowLogMessageAsync($"text document closed: {@params.TextDocument.Uri}");
        }
        catch (Exception ex)
        {
            this.SendWindowLogMessageAsync(ex);
        }

        return Task.CompletedTask;
    }

    public override Task OnTextDocumentDidChangeAsync(LSP.DidChangeTextDocumentParams @params)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                // apply edits to current script text
                var edits = @params.ContentChanges.Select(c =>
                {
                    if (c.Range != null)
                    {
                        document.Text.TryGetTextPosition(c.Range.Start.Line, c.Range.Start.Character, out var position);
                        return TextEdit.Replacement(position, c.RangeLength ?? 0, c.Text);
                    }
                    else
                    {
                        return TextEdit.Replacement(0, document.Text.Length, c.Text);
                    }
                }).ToImmutableList();

                var newText = new EditString(document.Text).ApplyAll(edits);

                _documentManager.UpdateTextAsync(@params.TextDocument.Uri, newText);
            }
        }
        catch (Exception ex)
        {
            this.SendWindowLogMessageAsync(ex);
        }

        return Task.CompletedTask;
    }

    #endregion

    #region Workspace Configuration

    public async Task<Dictionary<string, object>> GetWorkspaceSettingsAsync(IReadOnlyList<Setting> settings, CancellationToken cancellationToken)
    {
        var sendParams = new LSP.ConfigurationParams();
        sendParams.Items = settings.Select(s => new LSP.ConfigurationItem { Section = s.Name }).ToArray();
        var results = await this.SendWorkspaceConfigurationAsync(sendParams, cancellationToken).ConfigureAwait(false);
        return results
            .Select((r, i) => (s: settings[i], value: r))
            .ToDictionary(t => t.s.Name, t => t.value!);
    }

    #endregion

    #region Query Highlighting

    //public override async Task OnTextDocumentSelectionAsync(TextDocumentSelectionParams @params, CancellationToken cancellationToken)
    //{
    //    try
    //    {
    //        var uri = new Uri(@params.Uri);
    //        if (_scriptManager.TryGetScript(uri, out var script))
    //        {
    //            if (@params.Selections.Length > 0)
    //            {
    //                var position = GetTextPosition(script, @params.Selections[0].Start);
    //                var block = script.GetBlockAtPosition(position);
    //                if (block != null)
    //                {
    //                    var lspRange = GetLspRange(script, new TextRange(block.Start, block.Length));
    //                    await this.SendSetDecorationsAsync(@params.Uri, "currentQuery", [lspRange], cancellationToken).ConfigureAwait(false);
    //                }
    //            }
    //            else
    //            {
    //                // clear decoration
    //                await this.SendSetDecorationsAsync(@params.Uri, "currentQuery", [], cancellationToken).ConfigureAwait(false);
    //            }
    //        }

    //    }
    //    catch (Exception e)
    //    {
    //        await this.SendWindowLogMessageAsync(e.Message);
    //    }
    //}

    #endregion

    #region Completion Lists

    private static readonly CompletionOptions _completionOptions = CompletionOptions.Default
        .WithIncludePunctuationOnlySyntax(false)
        .WithAutoAppendWhitespace(false)
        .WithIncludeExtendedSyntax(true)
        .WithIncludeFunctions(true)
        .WithIncludeSymbols(true)
        .WithIncludeSyntax(true);

    public override async Task<LSP.SumType<LSP.CompletionItem[], LSP.CompletionList>?> OnTextDocumentCompletionAsync(LSP.CompletionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);
                var elementRange = document.GetElement(position, cancellationToken);
                var info = document.GetCompletionItems(position, _completionOptions, cancellationToken);

                return info.Items.Select(CreateItem).ToArray();

                LSP.CompletionItem CreateItem(CompletionItem item)
                {
                    LSP.CompletionItem lspItem;

                    var displayText = item.DisplayText;
                    var kind = GetCompletionItemKind(item.Kind);

                    if (!string.IsNullOrEmpty(item.AfterText))
                    {
                        // Use snippet to control cursor position
                        var snippetText = $"{item.BeforeText}$0{item.AfterText}";

                        lspItem = new LSP.CompletionItem
                        {
                            Kind = kind,
                            Label = displayText,
                            SortText = item.OrderText,
                            FilterText = item.MatchText,
                            InsertTextFormat = LSP.InsertTextFormat.Snippet,
                            InsertText = snippetText
                        };
                    }
                    else
                    {
                        lspItem = new LSP.CompletionItem
                        {
                            Kind = kind,
                            Label = displayText,
                            SortText = item.OrderText,
                            FilterText = item.MatchText,
                            InsertText = item.BeforeText,
                        };
                    }

                    // Retrigger completion after insertion?
                    if (ShouldRetriggerCompletion(item))
                    {
                        lspItem.Command = new LSP.Command
                        {
                            Title = "Trigger Suggest",
                            CommandIdentifier = "editor.action.triggerSuggest"
                        };
                    }

                    return lspItem;
                }

                bool ShouldRetriggerCompletion(CompletionItem item)
                {
                    // Retrigger after function calls, member access, etc.
                    return item.BeforeText.EndsWith("(") ||
                            item.BeforeText.EndsWith("[") ||
                            item.BeforeText.EndsWith(".") ||
                            item.BeforeText.EndsWith("=") ||
                            item.BeforeText.EndsWith(" ");
                }
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    private static LSP.CompletionItemKind GetCompletionItemKind(CompletionKind kind) =>
        kind switch
        {
            CompletionKind.Keyword => LSP.CompletionItemKind.Keyword,
            CompletionKind.Punctuation => LSP.CompletionItemKind.Text,
            CompletionKind.Syntax => LSP.CompletionItemKind.Text,
            CompletionKind.Identifier => LSP.CompletionItemKind.Variable,
            CompletionKind.Example => LSP.CompletionItemKind.Constant,
            CompletionKind.ScalarPrefix => LSP.CompletionItemKind.Operator,
            CompletionKind.TabularPrefix => LSP.CompletionItemKind.Keyword,
            CompletionKind.TabularSuffix => LSP.CompletionItemKind.Keyword,
            CompletionKind.QueryPrefix => LSP.CompletionItemKind.Keyword,
            CompletionKind.CommandPrefix => LSP.CompletionItemKind.Keyword,
            CompletionKind.ScalarInfix => LSP.CompletionItemKind.Operator,
            CompletionKind.RenderChart => LSP.CompletionItemKind.Template,
            CompletionKind.Column => LSP.CompletionItemKind.Property,
            CompletionKind.Table => LSP.CompletionItemKind.Class,
            CompletionKind.BuiltInFunction => LSP.CompletionItemKind.Function,
            CompletionKind.LocalFunction => LSP.CompletionItemKind.Method,
            CompletionKind.DatabaseFunction => LSP.CompletionItemKind.Method,
            CompletionKind.AggregateFunction => LSP.CompletionItemKind.Function,
            CompletionKind.Parameter => LSP.CompletionItemKind.Property,
            CompletionKind.Variable => LSP.CompletionItemKind.Variable,
            CompletionKind.Database => LSP.CompletionItemKind.Module,
            CompletionKind.Cluster => LSP.CompletionItemKind.Module,
            CompletionKind.MaterialiedView => LSP.CompletionItemKind.Class,
            CompletionKind.EntityGroup => LSP.CompletionItemKind.Class,
            CompletionKind.Graph => LSP.CompletionItemKind.Class,
            CompletionKind.ScalarType => LSP.CompletionItemKind.Keyword,
            CompletionKind.Option => LSP.CompletionItemKind.Text,
            CompletionKind.StoredQueryResult => LSP.CompletionItemKind.Class,
            _ =>  LSP.CompletionItemKind.None
        };
#endregion

    #region Semantic Tokens

    public override Task<LSP.SemanticTokens?> OnTextDocumentTokensFullAsync(LSP.SemanticTokensParams @params, CancellationToken cancellationToken)
    {
        return GetSemanticTokens(@params, null, cancellationToken);
    }

    public override Task<LSP.SemanticTokens?> OnTextDocumentSemanticTokensRangeAsync(LSP.SemanticTokensRangeParams @params, CancellationToken cancellationToken)
    {
        return GetSemanticTokens(@params, @params.Range, cancellationToken);
    }

    private Task<LSP.SemanticTokens?> GetSemanticTokens(LSP.SemanticTokensParams @params, LSP.Range? range, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var textRange = range != null
                    ? GetTextRange(document.Text, range)
                    : new TextRange(0, document.Text.Length);

                var semanticTokens = new List<SemanticToken>();

                var result = document.GetClassifications(textRange.Start, textRange.Length, clipToRange: true, waitForAnalysis: true, cancellationToken);
                var tokens = result.Classifications.Select(Create).Where(t => t != null).OfType<SemanticToken>().ToList();
                semanticTokens.AddRange(tokens);

                if (_semanticEncoder == null)
                {
                    // make encode with the legend supplied by client during initialization, so we only encode token types/modifiers that client supports
                    _semanticEncoder = new SemanticTokenEncoder(
                        this.ServerSettings?.Capabilities?.SemanticTokensOptions?.Legend.TokenTypes.ToImmutableList() ?? ImmutableList<string>.Empty,
                        this.ServerSettings?.Capabilities?.SemanticTokensOptions?.Legend.TokenModifiers.ToImmutableList() ?? ImmutableList<string>.Empty
                        );
                }

                var data = _semanticEncoder.Encode(semanticTokens);
                var semanticResults = new LSP.SemanticTokens { Data = data };
                return Task.FromResult<LSP.SemanticTokens?>(semanticResults);
            }

            SemanticToken? Create(ClassifiedRange cr)
            {
                var kind = GetSemanticTokenKind(cr.Kind);
                if (kind != null)
                {
                    var position = GetLspPosition(document.Text, cr.Start);
                    return new SemanticToken
                    {
                        Line = position.Line,
                        Character = position.Character,
                        Length = cr.Length,
                        Type = kind,
                        Modifiers = ImmutableList<string>.Empty
                    };
                }
                else
                {
                    return null;
                }
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.SemanticTokens?>(null);
    }

    private SemanticTokenEncoder? _semanticEncoder;

    private static string? GetSemanticTokenKind(ClassificationKind kind) =>
        kind switch
        {
            //ClassificationKind.Comment => LSP.SemanticTokenTypes.Comment,
            //ClassificationKind.Directive => LSP.SemanticTokenTypes.Macro, //"directive",
            //ClassificationKind.Literal => LSP.SemanticTokenTypes.Number,
            //ClassificationKind.StringLiteral => LSP.SemanticTokenTypes.String,
            ClassificationKind.Type => LSP.SemanticTokenTypes.Type,
            ClassificationKind.Column => LSP.SemanticTokenTypes.Property, //"column",
            ClassificationKind.Table => LSP.SemanticTokenTypes.Class, //"table",
            ClassificationKind.Database => LSP.SemanticTokenTypes.Namespace, //"database",
            ClassificationKind.Function => LSP.SemanticTokenTypes.Function,
            ClassificationKind.Parameter => LSP.SemanticTokenTypes.Parameter,
            ClassificationKind.Variable => LSP.SemanticTokenTypes.Variable,
            //ClassificationKind.Identifier => LSP.SemanticTokenTypes.Variable,
            //ClassificationKind.ClientParameter => LSP.SemanticTokenTypes.String, //"clientParameter",
            ClassificationKind.QueryParameter => LSP.SemanticTokenTypes.Parameter, //"queryParameter",
            //ClassificationKind.ScalarOperator => LSP.SemanticTokenTypes.Operator,
            //ClassificationKind.MathOperator => LSP.SemanticTokenTypes.Operator,
            //ClassificationKind.QueryOperator => LSP.SemanticTokenTypes.Keyword, //"queryOperator",
            //ClassificationKind.Command => LSP.SemanticTokenTypes.Keyword, //"command",
            //ClassificationKind.Keyword => LSP.SemanticTokenTypes.Keyword,
            ClassificationKind.MaterializedView => LSP.SemanticTokenTypes.Class, //"materializedView",
            ClassificationKind.SchemaMember => LSP.SemanticTokenTypes.Property, // "schemaMember",
            ClassificationKind.SignatureParameter => LSP.SemanticTokenTypes.Parameter, //"signatureParameter",
            //ClassificationKind.Option => LSP.SemanticTokenTypes.Keyword, //"option",
            _ => null
        };

#endregion

    #region Hover Tips

    private static readonly QuickInfoOptions _quickInfoOptions =
        QuickInfoOptions.Default
        .WithShowDiagnostics(false); // already shown in vs code editor

    public override Task<LSP.Hover?> OnTextDocumentHoverAsync(LSP.TextDocumentPositionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);
                var textRange = document.GetElement(position, cancellationToken);
                var info = document.GetQuickInfo(position, _quickInfoOptions, cancellationToken);

                if (info != null)
                {
                    var hover = new LSP.Hover
                    {
                        Contents = new LSP.MarkupContent
                        {
                            Kind = LSP.MarkupKind.Markdown,
                            Value = ToMarkdown(info)
                        },
                        Range = GetLspRange(document.Text, textRange)
                    };
                    return Task.FromResult<LSP.Hover?>(hover);
                }
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return base.OnTextDocumentHoverAsync(@params, cancellationToken);
    }

    private static string ToMarkdown(QuickInfo info)
    {
        return string.Join("\n-----\n", info.Items.Select(ToMarkdown));
    }

    private static string ToMarkdown(QuickInfoItem item)
    {
        return $"{ToMarkdownGlyph(item.Kind)}\t{string.Concat(item.Parts.Select(ToMarkdown))}";
    }

    private static string ToMarkdownGlyph(QuickInfoKind kind)
    {
        return kind switch
        {
            QuickInfoKind.BuiltInFunction => "ƒ",
            QuickInfoKind.LocalFunction => "ƒ",
            QuickInfoKind.DatabaseFunction => "ƒ",
            QuickInfoKind.Column => "🔤",
            QuickInfoKind.Cluster => "🏢",
            QuickInfoKind.Command => "💻",
            QuickInfoKind.Database => "🗄️",
            QuickInfoKind.Error => "❗",
            QuickInfoKind.Graph => "📊",
            QuickInfoKind.Literal => "🔢",
            QuickInfoKind.Operator => "➗",
            QuickInfoKind.Option => "⚙️",
            QuickInfoKind.Parameter => "🎯",
            QuickInfoKind.Pattern => "📐",
            QuickInfoKind.Scalar => "🔢",
            QuickInfoKind.Suggestion => "💡",
            QuickInfoKind.Table => "📋",
            QuickInfoKind.Type => "🏷️",
            QuickInfoKind.Variable => "🔣",
            QuickInfoKind.Warning => "⚠️",
            _ => ""
        };
    }

    private static string ToMarkdown(ClassifiedText classyText)
    {
        switch (classyText.Kind)
        {
            case ClassificationKind.Column:
            case ClassificationKind.Table:
            case ClassificationKind.Database:
            case ClassificationKind.Function:
            case ClassificationKind.Parameter:
            case ClassificationKind.Variable:
            case ClassificationKind.Identifier:
            case ClassificationKind.ClientParameter:
            case ClassificationKind.QueryParameter:
                return $"**{classyText.Text}**"; // name like things are italic

            case ClassificationKind.QueryOperator:
            case ClassificationKind.ScalarOperator:
            case ClassificationKind.Command:
            case ClassificationKind.Type:
            case ClassificationKind.Keyword:
            case ClassificationKind.MaterializedView:
            case ClassificationKind.SchemaMember:
            case ClassificationKind.SignatureParameter:
                return $"*{classyText.Text}*"; // keyword like things are bold

            default:
                return classyText.Text;
        }
    }
    #endregion

    #region Folding Ranges (Outlining)

    public override Task<LSP.FoldingRange[]?> OnTextDocumentFoldingAsync(LSP.FoldingRangeParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var foldingRanges = new List<LSP.FoldingRange>();
                var info = document.GetOutlines(OutliningOptions.Default, cancellationToken);
                foreach (var fr in info.Ranges)
                {
                    var lspRange = GetLspRange(document.Text, new TextRange(fr.Start, fr.Length));
                    foldingRanges.Add(
                        new LSP.FoldingRange
                        {
                            StartLine = lspRange.Start.Line,
                            StartCharacter = lspRange.Start.Character,
                            EndLine = lspRange.End.Line,
                            EndCharacter = lspRange.End.Character,
                            Kind = LSP.FoldingRangeKind.Region
                        });
                }

                return Task.FromResult<LSP.FoldingRange[]?>(foldingRanges.ToArray());
            }
            
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.FoldingRange[]?>(null);
    }

    #endregion

    #region Formatting

    public override Task<LSP.TextEdit[]?> OnTextDocumentFormattingAsync(LSP.DocumentFormattingParams @params, CancellationToken cancellationToken)
    {
        return FormatDocumentAsync(@params.TextDocument.Uri, @params.Options, null, cancellationToken);
    }

    public override Task<LSP.TextEdit[]?> OnTextDocumentRangeFormattingAsync(LSP.DocumentRangeFormattingParams @params, CancellationToken cancellationToken)
    {
        return FormatDocumentAsync(@params.TextDocument.Uri, @params.Options, @params.Range, cancellationToken);
    }

    private async Task<LSP.TextEdit[]?> FormatDocumentAsync(
        Uri docId,
        LSP.FormattingOptions lspOptions,
        LSP.Range? lspRange, 
        CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(docId, out var document))
            {
                var textRange = lspRange != null
                    ? GetTextRange(document.Text, lspRange)
                    : new TextRange(0, document.Text.Length);

                if (lspOptions.OtherOptions == null)
                {
                    // vs code does not send all formatting options, so request them from workspace settings
                    var workspaceFormattingOptions = await GetWorkspaceSettingsAsync(FormatSettings.All, cancellationToken).ConfigureAwait(false);
                    lspOptions.OtherOptions = workspaceFormattingOptions;
                }

                var formattingOptions = GetFormattingOptions(lspOptions);
                var formatted = document.GetFormattedText(textRange, formattingOptions, cancellationToken);
                var edits = formatted.Edits.Select(e => GetLspTextEdit(document.Text, e)).ToArray();
                return edits;
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    private static readonly FormattingOptions _defaultFormattingOption =
        FormattingOptions.Default;

    private static FormattingOptions GetFormattingOptions(LSP.FormattingOptions lspOptions)
    {
        var options = FormattingOptions.Default
            .WithIndentationSize(lspOptions.TabSize);

        var otherOptions = lspOptions.OtherOptions;
        if (otherOptions != null)
        {
            options = WithFormattingOptionsFromSettings(options, otherOptions);
        }

        return options;
    }

    private static FormattingOptions WithFormattingOptionsFromSettings(FormattingOptions options, Dictionary<string, object> settings)
    {
        options ??= FormattingOptions.Default;

        return options
            .WithInsertMissingTokens(FormatSettings.InsertMissingTokens.GetValue(settings))
            .WithBrackettingStyle(FormatSettings.DefaultBrackettingStyle.GetValue(settings))
            .WithSchemaStyle(FormatSettings.SchemaBrackettingStyle.GetValue(settings))
            .WithDataTableValueStyle(FormatSettings.DataTableBrackettingStyle.GetValue(settings))
            .WithFunctionBodyStyle(FormatSettings.FunctionBodyBrackettingStyle.GetValue(settings))
            .WithFunctionParameterStyle(FormatSettings.FunctionParameterBrackettingStyle.GetValue(settings))
            .WithFunctionArgumentStyle(FormatSettings.FunctionArgumentBrackettingStyle.GetValue(settings))
            .WithPipeOperatorStyle(FormatSettings.PipeOperatorPlacementStyle.GetValue(settings))
            .WithExpressionStyle(FormatSettings.ExpressionPlacementStyle.GetValue(settings))
            .WithStatementStyle(FormatSettings.StatementPlacementStyle.GetValue(settings))
            .WithSemicolonStyle(FormatSettings.SemicolonPlacementStyle.GetValue(settings));
    }

    public async Task<FormattingOptions> GetFormattingOptionsAsync(CancellationToken cancellationToken)
    {
        var settings = await GetWorkspaceSettingsAsync(FormatSettings.All, cancellationToken).ConfigureAwait(false);
        return WithFormattingOptionsFromSettings(_defaultFormattingOption, settings);
    }


    #endregion

    #region Rename

    public override Task<LSP.RenameRange?> OnTextDocumentPrepareRenameAsync(LSP.PrepareRenameParams @params, CancellationToken cancellation)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);

                //// Use Kusto.Language to find the symbol at this position
                //var symbol = document.GetReferencedSymbol(position);

                //if (symbol == null || !CanRename(symbol))
                //{
                //    // Return null to indicate rename is not supported here
                //    return Task.FromResult<RenameRange?>(null);
                //}

                //// Get the range of the symbol name
                //var symbolRange = document.GetSymbolNameRange(position);

                //return Task.FromResult<RenameRange?>(new RenameRange
                //{
                //    Range = GetLspRange(document.Text, symbolRange),
                //    Placeholder = symbol.Name
                //});
            }
        }
        catch (Exception ex)
        {
            _ = SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.RenameRange?>(null);
    }

    public override Task<LSP.WorkspaceEdit?> OnTextDocumentRenameAsync(LSP.RenameParams @params, CancellationToken cancellationToken)
    {
        if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
        {
            var position = GetTextPosition(document.Text, @params.Position);

            RelatedInfo relatedInfo = document.GetRelatedElements(position, _defaultFindRelatedOptions, cancellationToken);

            // only rename if a declaration is present, so we don't try renaming columns from database tables, etc.
            if (relatedInfo.Elements.Any(e => e.Kind == RelatedElementKind.Declaration))
            {
                var edits = relatedInfo.Elements
                    .Where(elem => elem.Kind == RelatedElementKind.Declaration || elem.Kind == RelatedElementKind.Reference)
                    .Select(elem =>
                        new LSP.TextEdit
                        {
                            Range = GetLspRange(document.Text, elem.Range),
                            NewText = @params.NewName
                        }).ToArray();
                var workspaceEdit = new LSP.WorkspaceEdit
                {
                    Changes = new Dictionary<string, LSP.TextEdit[]>
                    {
                        [@params.TextDocument.Uri.ToString()] = edits
                    }
                };
                return Task.FromResult<LSP.WorkspaceEdit?>(workspaceEdit);
            }
        }
        return base.OnTextDocumentRenameAsync(@params, cancellationToken);
    }

    #endregion

    #region Document Highlighting

    private static readonly FindRelatedOptions _defaultFindRelatedOptions =
        FindRelatedOptions.None;

    public override Task<LSP.DocumentHighlight[]?> OnTextDocumentHighlightAsync(LSP.TextDocumentPositionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);

                RelatedInfo relatedInfo = document.GetRelatedElements(position, _defaultFindRelatedOptions, cancellationToken);
                var lspHighlights = relatedInfo.Elements.Select(elem =>
                    new LSP.DocumentHighlight
                    {
                        Range = GetLspRange(document.Text, new TextRange(elem.Start, elem.Length)),
                        Kind = elem.Kind switch
                        {
                            RelatedElementKind.Reference => LSP.DocumentHighlightKind.Read,
                            RelatedElementKind.Declaration => LSP.DocumentHighlightKind.Write,
                            _ => LSP.DocumentHighlightKind.Text
                        }
                    }).ToArray();

                return Task.FromResult<LSP.DocumentHighlight[]?>(lspHighlights);
            }
            
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.DocumentHighlight[]?>(null);
    }

    #endregion

    #region Find References

    public override Task<LSP.Location[]?> OnTextDocumentReferencesAsync(LSP.ReferenceParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);
                RelatedInfo relatedInfo = document.GetRelatedElements(position, _defaultFindRelatedOptions, cancellationToken);
                if (relatedInfo.Elements.Any(e => e.Kind == RelatedElementKind.Declaration || e.Kind == RelatedElementKind.Reference))
                {
                    var lspLocations = relatedInfo.Elements
                        .Where(elem => elem.Kind == RelatedElementKind.Reference
                            || (@params.Context.IncludeDeclaration && elem.Kind == RelatedElementKind.Declaration))
                        .Select(elem =>
                            new LSP.Location
                            {
                                Uri = @params.TextDocument.Uri,
                                Range = GetLspRange(document.Text, elem.Range)
                            }).ToArray();
                    return Task.FromResult<LSP.Location[]?>(lspLocations);
                }
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.Location[]?>(null);
    }

    #endregion

    #region Goto Definition

    public override Task<LSP.SumType<LSP.Location, LSP.Location[]>?> OnTextDocumentDefinitionAsync(LSP.TextDocumentPositionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);
                RelatedInfo relatedInfo = document.GetRelatedElements(position, _defaultFindRelatedOptions, cancellationToken);
                var definitionElements = relatedInfo.Elements
                    .Where(elem => elem.Kind == RelatedElementKind.Declaration)
                    .ToArray();
                if (definitionElements.Length == 1)
                {
                    var elem = definitionElements[0];
                    var lspLocation = new LSP.Location
                    {
                        Uri = @params.TextDocument.Uri,
                        Range = GetLspRange(document.Text, elem.Range)
                    };
                    return Task.FromResult<LSP.SumType<LSP.Location, LSP.Location[]>?>(lspLocation);
                }
                else if (definitionElements.Length > 1)
                {
                    var lspLocations = definitionElements
                        .Select(elem =>
                            new LSP.Location
                            {
                                Uri = @params.TextDocument.Uri,
                                Range = GetLspRange(document.Text, elem.Range)
                            }).ToArray();
                    return Task.FromResult<LSP.SumType<LSP.Location, LSP.Location[]>?>(lspLocations);
                }
            }

        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.SumType<LSP.Location, LSP.Location[]>?>(null);
    }

    #endregion

    #region Code Actions

    /// <summary>
    /// CodeActions created for this script so far
    /// </summary>
    private class DocumentActions
    {
        // a map from action id to action
        public ImmutableDictionary<string, ApplyAction> Actions = ImmutableDictionary<string, ApplyAction>.Empty;
    }

    /// <summary>
    /// Table of actions per script.
    /// </summary>
    private readonly ConditionalWeakTable<Document, DocumentActions> _scriptActions =
        new ConditionalWeakTable<Document, DocumentActions>();

    private static readonly CodeActionOptions _codeActionOptions =
        CodeActionOptions.Default;

    public override Task<LSP.SumType<LSP.Command, LSP.CodeAction>[]?> OnTextDocumentCodeActionAsync(LSP.CodeActionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var range = GetTextRange(document.Text, @params.Range);
                var position = range.Start;

                var lspActions = new List<LSP.SumType<LSP.Command, LSP.CodeAction>>();

                var info = document.GetCodeActions(position, range.Start, range.Length, _codeActionOptions, cancellationToken: cancellationToken);

                var scriptActions = _scriptActions.GetOrCreateValue(document);
                foreach (var action in info.Actions)
                {
                    AddAction(action, action.Title);
                }

                 return Task.FromResult<LSP.SumType<LSP.Command, LSP.CodeAction>[]?>(lspActions.ToArray());

                void AddAction(CodeAction action, string title)
                {
                    switch (action)
                    {
                        case ApplyAction apply:
                            // add to map so we can look this action back when resolved.
                            var id = $"Action{scriptActions.Actions.Count + 1}";
                            scriptActions.Actions = scriptActions.Actions.Add(id, apply);
                            lspActions.Add(new LSP.CodeAction
                            {
                                Title = action.Title,
                                Kind = LSP.CodeActionKind.QuickFix,
                                Data = $"{@params.TextDocument.Uri}|{position}|{id}"  // combine uri, text position and action id so we can look up later
                            });
                            break;
                        case MenuAction menu:
                            // LSP cannot describe nested actions, so flatten them out
                            foreach (var subAction in menu.Actions)
                            {
                                AddAction(subAction, $"{menu.Title}: {subAction.Title}" );
                            }
                            break;
                    }
                }
            }

        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.SumType<LSP.Command, LSP.CodeAction>[]?>(null);
    }

    public override async Task<LSP.CodeAction> OnCodeActionResolveAsync(LSP.CodeAction lspAction, CancellationToken cancellationToken)
    {
        try
        {
            if (lspAction.Data is string stringData)
            {
                var dataParts = stringData.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (dataParts.Length == 3)
                {
                    var docUriText = dataParts[0];
                    var docUri = new Uri(docUriText);
                    var position = int.Parse(dataParts[1]);
                    var actionId = dataParts[2];

                    if (_documentManager.TryGetDocument(docUri, out var document)
                        && _scriptActions.TryGetValue(document, out var scriptActions)
                        && scriptActions.Actions.TryGetValue(actionId, out var action))
                    {
                        var formatOptions = await GetFormattingOptionsAsync(cancellationToken).ConfigureAwait(false);
                        var applyOptions = _codeActionOptions.WithFormattingOptions(formatOptions);

                        var result = document.ApplyCodeAction(action, position, applyOptions, cancellationToken);

                        var changes = new Dictionary<string, LSP.TextEdit[]>();

                        foreach (var resultAction in result.Actions)
                        {
                            switch (resultAction)
                            {
                                case ChangeTextAction changeText:
                                    changes[docUriText] = changeText.Changes
                                        .Select(edit => GetLspTextEdit(document.Text, TextEdit.Replacement(edit.Start, edit.DeleteLength, edit.InsertText)))
                                        .ToArray();
                                    break;
                                case MoveCaretAction:
                                    break;
                                case RenameAction:
                                    break;
                                default:
                                    break;
                            }
                        }

                        lspAction.Edit = new LSP.WorkspaceEdit
                        {
                            Changes = changes
                        };
                    }
                }
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return lspAction;
    }
    #endregion

#endregion

    #region Kusto Extensions

    #region Run Query

    [JsonRpcMethod("kusto/runQuery", UseSingleObjectParameterDeserialization = true)]
    public async Task<RunQueryResults?> OnRunQueryAsync(RunQueryParams @params, CancellationToken cancellationToken)
    {
        if (@params.Selection == null)
        {
            await this.SendWindowShowMessageAsync("Failed to run: no query selected");
            return null;
        }

        var queryOptions = ImmutableDictionary<string, string>.Empty;
        var queryParameters = ImmutableDictionary<string, string>.Empty;

        if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
        {
            var range = GetTextRange(document.Text, @params.Selection);

            var results = await _queryManager.RunQueryAsync(document, range, queryOptions, queryParameters, cancellationToken).ConfigureAwait(false);

            string dataHtml;
            string? chartHtml = null;

            if (results != null && results.Data != null)
            {
                // cache results for lookup later
                _resultsManager.SetResults(document, range.Start, new ExecuteResult { Data = results.Data, ChartOptions = results.ChartOptions });

                dataHtml = GetDataAsHtml(results.Data);

                if (results.ChartOptions != null
                    && results.ChartOptions.Visualization != Data.Utils.VisualizationKind.None)
                {
                    chartHtml = GetChartAsHtml(results.Data, results.ChartOptions);
                }
            }
            else
            {
                dataHtml = "<html>no results</html>";
            }

            return new RunQueryResults
            {
                Title = "Query Results",
                DataHtml = dataHtml,
                RowCount = results?.Data?.Rows?.Count,
                ChartHtml = chartHtml,
                Cluster = results?.Cluster,
                Database = results?.Database
            };
        }

        return null;
    }

    public class RunQueryParams
    {
        [DataMember(Name = "textDocument")]
        public required LSP.TextDocumentIdentifier TextDocument { get; init; }
         
        [DataMember(Name = "selection")]
        public required LSP.Range Selection { get; init; }
    }

    [DataContract]
    public class RunQueryResults
    {
        [DataMember(Name = "title")]
        public required string Title { get; init; }

        [DataMember(Name = "dataHtml")]
        public string? DataHtml { get; init; }

        [DataMember(Name = "rowCount")]
        public int? RowCount { get; init; }

        [DataMember(Name = "chartHtml")]
        public string? ChartHtml { get; init; }

        [DataMember(Name = "cluster")]
        public string? Cluster { get; init; }

        [DataMember(Name = "database")]
        public string? Database { get; init; }
    }

    [JsonRpcMethod("kusto/getLastRunDataAsHtml", UseSingleObjectParameterDeserialization = true)]
    public async Task<string?> OnGetLastRunDataAsHtmlAsync(GetResultsParams @params, CancellationToken cancellationToken)
    {
        if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
        {
            var position = GetTextPosition(document.Text, @params.Position);
            var cachedResults = _resultsManager.GetResults(document, position);
            if (cachedResults?.Data != null)
            {
                return GetDataAsHtml(cachedResults.Data);
            }
        }

        return null;
    }

    private string GetDataAsHtml(DataTable data)
    {
        var dataBuilder = new HtmlBuilder();
        dataBuilder.WriteHtml(
            head: () =>
            {
            },
            body: () =>
            {
                dataBuilder.WriteTable(data);
            }
        );

        return dataBuilder.Text;
    }

    [JsonRpcMethod("kusto/getLastRunChartAsHtml", UseSingleObjectParameterDeserialization = true)]
    public async Task<string?> OnGetLastRunChartAsHtmlAsync(GetResultsParams @params, CancellationToken cancellationToken)
    {
        if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
        {
            var position = GetTextPosition(document.Text, @params.Position);
            var cachedResults = _resultsManager.GetResults(document, position);
            if (cachedResults != null
                && cachedResults.Data != null
                && cachedResults.ChartOptions != null
                && cachedResults.ChartOptions.Visualization != Data.Utils.VisualizationKind.None)
            {
                return GetChartAsHtml(cachedResults.Data, cachedResults.ChartOptions);
            }
        }

        return null;
    }

    private string GetChartAsHtml(DataTable data, Data.Utils.ChartVisualizationOptions chartOptions)
    {
        return _chartManager.RenderChartToHtmlDocument(data, chartOptions)
            ?? "<html>chart style not implemented yet</html>";
    }

    [DataContract]
    public class GetResultsParams
    {
        [DataMember(Name = "textDocument")]
        public required LSP.TextDocumentIdentifier TextDocument { get; init; }

        [DataMember(Name = "position")]
        public required LSP.Position Position { get; init; }
    }

    #endregion

    #region Query Ranges

    [JsonRpcMethod("kusto/getQueryRanges", UseSingleObjectParameterDeserialization = true)]
    public Task<QueryRangesResult?> OnGetQueryRangesAsync(QueryRangesParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var uri = new Uri(@params.Uri);
            if (_documentManager.TryGetDocument(uri, out var document))
            {
                var ranges = document.GetSectionRanges().Select(r => GetLspRange(document.Text, r)).ToArray();
                return Task.FromResult<QueryRangesResult?>(new QueryRangesResult
                {
                    Uri = @params.Uri,
                    Ranges = ranges
                });
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<QueryRangesResult?>(null);
    }

    [DataContract]
    public class QueryRangesParams
    {
        [DataMember(Name = "uri")]
        public required string Uri { get; init; }
    }

    [DataContract]
    public class QueryRangesResult
    {
        [DataMember(Name = "uri")]
        public required string Uri { get; init; }

        [DataMember(Name = "ranges")]
        public required LSP.Range[] Ranges { get; init; }
    }

    [JsonRpcMethod("kusto/getQueryRange", UseSingleObjectParameterDeserialization = true)]
    public Task<LSP.Range?> OnGetQueryRangeAsync(QueryRangeParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var uri = new Uri(@params.Uri);
            if (_documentManager.TryGetDocument(uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);
                if (document.GetSectionRange(position) is { } textRange)
                {
                    var lspRange = GetLspRange(document.Text, textRange);
                    return Task.FromResult<LSP.Range?>(lspRange);
                }
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.Range?>(null);
    }

    [DataContract]
    public class QueryRangeParams
    {
        [DataMember(Name = "uri")]
        public required string Uri { get; init; }

        [DataMember(Name = "position")]
        public required LSP.Position Position { get; init; }
    }

    #endregion

    #region Connection Info

    [JsonRpcMethod("kusto/getServerInfo", UseSingleObjectParameterDeserialization = true)]
    public async Task<GetServerInfoResult?> OnGetServerInfoAsync(GetServerInfoParams @params, CancellationToken cancellationToken)
    {
        var clusterName = _connectionManager.GetConnection(@params.Connection).Cluster;
        
        // ensure server databases are loaded
        await _symbolManager.GetOrLoadDatabaseNamesAsync(@params.Connection, cancellationToken).ConfigureAwait(false);

        var globals = _symbolManager.Globals;
        var clusterSymbol = globals.GetCluster(clusterName);
        if (clusterSymbol != null)
        {
            var dbs = clusterSymbol.Databases.Select(db => new ServerDatabase
            {
                Name = db.Name,
                AlternateName = db.AlternateName ?? ""
            }).ToArray();
            return new GetServerInfoResult
            {
                Cluster = clusterName,
                Databases = dbs
            };
        }

        return null;
    }

    [DataContract]
    public class GetServerInfoParams
    {
        [DataMember(Name = "connection")]
        public required string Connection { get; set; }

        [DataMember(Name = "serverKind")]
        public string? ServerKind { get; set; }
    }

    [DataContract]
    public class GetServerInfoResult
    {
        [DataMember(Name = "cluster")]
        public required string Cluster { get; set; }

        [DataMember(Name = "databases")]
        public required ServerDatabase[] Databases { get; set; }
    }

    [DataContract]
    public class ServerDatabase
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "alternateName")]
        public required string AlternateName { get; set; }
    }

    [JsonRpcMethod("kusto/getServerKind", UseSingleObjectParameterDeserialization = true)]
    public async Task<GetServerKindResult?> OnGetServerKindAsync(GetServerKindParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var serverKind = await _connectionManager.GetServerKindAsync(@params.Connection, cancellationToken).ConfigureAwait(false);
            return new GetServerKindResult
            {
                ServerKind = serverKind
            };
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
            return null;
        }
    }

    [DataContract]
    public class GetServerKindParams
    {
        [DataMember(Name = "connection")]
        public required string Connection { get; set; }
    }

    [DataContract]
    public class GetServerKindResult
    {
        [DataMember(Name = "serverKind")]
        public required string ServerKind { get; set; }
    }

    [JsonRpcMethod("kusto/getDatabaseInfo", UseSingleObjectParameterDeserialization = true)]
    public async Task<GetDatabaseInfoResult?> OnGetDatabaseInfo(GetDatabaseInfoParams @params, CancellationToken cancellationToken)
    {
        var clusterName = @params.Cluster;
        var databaseName = @params.Database;

        // ensure database symbols are loaded
        await _symbolManager.LoadSymbolsAsync(clusterName, databaseName, cancellationToken).ConfigureAwait(false);

        var globals = _symbolManager.Globals;
        var clusterSymbol = globals.GetCluster(clusterName);
        if (clusterSymbol != null)
        {
            var databaseSymbol = clusterSymbol.GetDatabase(databaseName);
            if (databaseSymbol != null)
            {
                return new GetDatabaseInfoResult
                {
                    Name = databaseName,
                    Tables = databaseSymbol.Tables.Select(ToTableInfo).ToArray(),
                    ExternalTables = databaseSymbol.ExternalTables.Select(ToTableInfo).ToArray(),
                    MaterializedViews = databaseSymbol.MaterializedViews.Select(ToTableInfo).ToArray(),
                    Functions = databaseSymbol.Functions.Select(ToFunctionInfo).ToArray(),
                    EntityGroups = databaseSymbol.EntityGroups.Select(ToEntityGroupInfo).ToArray(),
                    GraphModels = databaseSymbol.GraphModels.Select(g => ToGraphModelInfo(g)).ToArray()
                };
            }
        }

        return null;

        static DatabaseTableInfo ToTableInfo(TableSymbol table) =>
            new()
            {
                Name = table.Name,
                Description = table.Description,
                Columns = table.Columns.Select(c => new DatabaseColumnInfo
                {
                    Name = c.Name,
                    Type = c.Type.Name
                }).ToArray()
            };

        static DatabaseFunctionInfo ToFunctionInfo(FunctionSymbol func) =>
            new()
            {
                Name = func.Name,
                Description = func.Description,
                Parameters = func.Signatures.FirstOrDefault()?.Parameters is { } prms
                    ? Parameter.GetParameterListDeclaration(prms)
                    : "()",
                Body = func.Signatures.FirstOrDefault()?.Body ?? ""
            };

        static DatabaseEntityGroupInfo ToEntityGroupInfo(EntityGroupSymbol group) =>
            new()
            {
                Name = group.Name,
                Description = group.Description,
                Entities = group.Members.Select(m => m.Name).ToArray()
            };

        static DatabaseGraphModelInfo ToGraphModelInfo(GraphModelSymbol graph) =>
            new()
            {
                Name = graph.Name,
                Edges = graph.Edges.Select(e => e.Body ?? "").ToArray(),
                Nodes = graph.Nodes.Select(n => n.Body ?? "").ToArray(),
                Snapshots = graph.Snapshots.Select(s => s.Name).ToArray()
            };
    }


    [DataContract]
    public class GetDatabaseInfoParams
    {
        [DataMember(Name = "cluster")]
        public required string Cluster { get; set; }

        [DataMember(Name = "database")]
        public required string Database { get; set; }
    }

    [DataContract]
    public class GetDatabaseInfoResult
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "tables")]
        public DatabaseTableInfo[]? Tables { get; set; }

        [DataMember(Name = "externalTables")]
        public DatabaseTableInfo[]? ExternalTables { get; set; }

        [DataMember(Name = "materializedViews")]
        public DatabaseTableInfo[]? MaterializedViews { get; set; }

        [DataMember(Name = "functions")]
        public DatabaseFunctionInfo[]? Functions { get; set; }

        [DataMember(Name = "entityGroups")]
        public DatabaseEntityGroupInfo[]? EntityGroups { get; set; }

        [DataMember(Name = "graphModels")]
        public DatabaseGraphModelInfo[]? GraphModels { get; set; }
    }

    [DataContract]
    public class DatabaseTableInfo
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "description")]
        public string? Description { get; set; }

        [DataMember(Name = "columns")]
        public DatabaseColumnInfo[]? Columns { get; set; }
    }

    [DataContract]
    public class DatabaseColumnInfo
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "type")]
        public required string Type { get; set; }
    }

    [DataContract]
    public class DatabaseFunctionInfo
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "description")]
        public string? Description { get; set; }

        [DataMember(Name = "parameters")]
        public string? Parameters { get; set; }

        [DataMember(Name = "body")]
        public string? Body { get; set; }
    }

    [DataContract]
    public class DatabaseParameterInfo
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "type")]
        public required string Type { get; set; }
    }

    [DataContract]
    public class DatabaseEntityGroupInfo
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "description")]
        public string? Description { get; set; }

        [DataMember(Name = "entities")]
        public string[]? Entities { get; set; }
    }

    [DataContract]
    public class DatabaseGraphModelInfo
    {
        [DataMember(Name = "name")]
        public required string Name { get; set; }

        [DataMember(Name = "edges")]
        public string[]? Edges { get; set; }

        [DataMember(Name = "nodes")]
        public string[]? Nodes { get; set; }

        [DataMember(Name = "snapshots")]
        public string[]? Snapshots { get; set; }
    }

    #endregion

    #region Enitity Definition

    [JsonRpcMethod("kusto/getEntityDefinition", UseSingleObjectParameterDeserialization = true)]
    public async Task<string?> OnGetEntityDefinitionAsync(EntityDefinitionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (Kusto.Data.Common.ExtendedEntityType.FastTryParse(@params.EntityType, out var entityType))
            {
                var entityId = new EntityId()
                {
                    Cluster = @params.Cluster,
                    Database = @params.Database,
                    EntityType = entityType,
                    EntityName = @params.EntityName
                };

                return await _definitionManager.GetDefinitionAsync(entityId, cancellationToken).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    public class EntityDefinitionParams
    {
        [DataMember(Name="cluster")]
        public required string Cluster { get; init; }

        [DataMember(Name="database")]
        public required string Database { get; init; }

        /// <summary>
        /// Kind of entity: Table, ExternalTable, etc.
        /// </summary>
        [DataMember(Name = "entityType")]
        public required string EntityType { get; init; }

        [DataMember(Name="entityName")]
        public required string EntityName { get; init; }
    }
    #endregion

    #region Document Connections

    [JsonRpcMethod("kusto/connectionsUpdated", UseSingleObjectParameterDeserialization = true)]
    public Task OnConnectionsUpdatedAsync(ConnectionsUpdatedParams @params, CancellationToken cancellationToken)
    {
        try
        {
            // Ensure cluster symbols exist for all configured connections
            _ = _symbolManager.EnsureClustersAsync(@params.Connections, cancellationToken);
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.CompletedTask;
    }

    [DataContract]
    public class ConnectionsUpdatedParams
    {
        [DataMember(Name = "connections")]
        public required string[] Connections { get; set; }
    }

    [JsonRpcMethod("kusto/documentConnectionChanged", UseSingleObjectParameterDeserialization = true)]
    public Task OnDocumentConnectionChangedAsync(DocumentConnectionChangedParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var uri = new Uri(@params.Uri);
            _documentManager.UpdateConnectionAsync(uri, @params.Cluster, @params.Database, @params.ServerKind);
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.CompletedTask;
    }

    [DataContract]
    public class DocumentConnectionChangedParams
    {
        [DataMember(Name = "uri")]
        public required string Uri { get; set; }

        [DataMember(Name = "cluster")]
        public string? Cluster { get; set; }

        [DataMember(Name = "database")]
        public string? Database { get; set; }

        [DataMember(Name = "serverKind")]
        public string? ServerKind { get; set; }
    }

    #endregion

    #endregion

    #region Position and Range Conversion
    public static LSP.Position GetLspPosition(string text, int textPosition)
    {
        if (text.TryGetLineAndOffset(textPosition, out var line, out var character))
        {
            return new LSP.Position
            {
                Line = line,
                Character = character
            };
        }
        else
        {
            return new LSP.Position
            {
                Line = 0,
                Character = 0
            };
        }
    }

    public static int GetTextPosition(string text, LSP.Position position)
    {
        if (text.TryGetTextPosition(position.Line, position.Character, out var textPosition))
        {
            return textPosition;
        }
        else
        {
            return 0;
        }
    }

    public static LSP.Range GetLspRange(string text, TextRange textRange)
    {
        var start = GetLspPosition(text, textRange.Start);
        var end = GetLspPosition(text, textRange.End);
        return new LSP.Range
        {
            Start = start,
            End = end
        };
    }

    public static TextRange GetTextRange(string text, LSP.Range range)
    {
        if (text.TryGetTextPosition(range.Start.Line, range.Start.Character, out var startPosition)
            && text.TryGetTextPosition(range.End.Line, range.End.Character, out var endPosition))
        {
            return TextRange.FromBounds(startPosition, endPosition);
        }
        else
        {
            return TextRange.Empty;
        }
    }

    public static LSP.TextEdit GetLspTextEdit(string text, TextEdit edit)
    {
        return new LSP.TextEdit
        {
            Range = GetLspRange(text, new TextRange(edit.Start, edit.DeleteLength)),
            NewText = edit.InsertText
        };
    }

    public static TextEdit GetTextEdit(string text, LSP.TextEdit edit)
    {
        var range = GetTextRange(text, edit.Range);
        return TextEdit.Replacement(range.Start, range.Length, edit.NewText);
    }

    #endregion
}
