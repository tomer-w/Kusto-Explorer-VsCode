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

public class KustoLspServer : LspServer, ILogger, ISettingSource
{
    private readonly IOptionsManager _optionsManager;
    private readonly IConnectionManager _connectionManager;
    private readonly ISchemaManager _schemaManager;
    private readonly ISymbolManager _symbolManager;
    private readonly IDocumentManager _documentManager;
    private readonly IDiagnosticsManager _diagnosticsManager;
    private readonly IQueryManager _queryManager;
    private readonly IChartManager _chartManager;
    private readonly IResultsManager _resultsManager;
    private readonly IEntityManager _entityManager;
    private readonly ImmutableList<string> _args;

    public KustoLspServer(
        Stream input, 
        Stream output, 
        string[] args,
        IOptionsManager optionsManager,
        IConnectionManager connectionManager,
        ISchemaManager schemaManager,
        ISymbolManager symbolManager,
        IDocumentManager documentManager,
        IDiagnosticsManager diagnosticsManager,
        IQueryManager queryManager,
        IChartManager chartManager,
        IResultsManager resultsManager,
        IEntityManager entityManager)
        : base(input, output)
    {
        _args = args.ToImmutableList();
        _optionsManager = optionsManager;
        _schemaManager = schemaManager;
        _connectionManager = connectionManager;
        _symbolManager = symbolManager;
        _documentManager = documentManager;
        _diagnosticsManager = diagnosticsManager;
        _queryManager = queryManager;
        _chartManager = chartManager;
        _resultsManager = resultsManager;
        _entityManager = entityManager;
        InitEvents();
    }

    public KustoLspServer(
        Stream input,
        Stream output,
        string[] args)
        : base(input, output)
    {
        _args = args.ToImmutableList();
        ILogger logger = this;
        ISettingSource settingSource = this;
        _optionsManager = new OptionsManager(settingSource);
        _connectionManager = new ConnectionManager();
        var schemaSource = new ServerSchemaSource(_connectionManager, logger);
        _schemaManager = new SchemaManager(schemaSource, logger);
        _symbolManager = new SymbolManager(_schemaManager, _optionsManager, logger);
        _documentManager = new DocumentManager(_symbolManager, logger);
        _resultsManager = new ResultsManager(_documentManager);
        _diagnosticsManager = new DiagnosticsManager(_documentManager);
        _queryManager = new QueryManager(_connectionManager, _documentManager, _optionsManager, logger);
        _chartManager = new PlotlyChartManager();
        _entityManager = new EntityManager(_schemaManager);
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
    public override async Task<LSP.InitializeResult> OnInitializeAsync(LSP.InitializeParams @params, CancellationToken cancellationToken)
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
            TriggerCharacters = ["(", "[", ".", " ", "="],
            // will always commit when these are typed, even if no other typing has narrowed the selection
            AllCommitCharacters = ["\t"]
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

        return this.ServerSettings;
    }

    public override async Task OnInitializedAsync(LSP.InitializedParams @params, CancellationToken cancellationToken)
    {
        await _optionsManager.RefreshAsync(CancellationToken.None);
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

            // Notify client that the document is ready
            _ = this.SendNotificationAsync("kusto/documentReady", new
            {
                uri = @params.TextDocument.Uri.ToString()
            });
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

    public async Task<ImmutableDictionary<string, object>> GetWorkspaceSettingsAsync(IReadOnlyList<Setting> settings, CancellationToken cancellationToken)
    {
        var sendParams = new LSP.ConfigurationParams();
        sendParams.Items = settings.Select(s => new LSP.ConfigurationItem { Section = s.Name }).ToArray();
        var results = await this.SendWorkspaceConfigurationAsync(sendParams, cancellationToken).ConfigureAwait(false);
        return results
            .Select((r, i) => (s: settings[i], value: r))
            .ToImmutableDictionary(t => t.s.Name, t => t.value!);
    }

    public override Task OnWorkspaceDidChangeConfigurationAsync(LSP.DidChangeConfigurationParams @params)
    {
        // pass on to ISettingSource listeners
        this.SettingsChanged?.Invoke(this, EventArgs.Empty);
        return Task.CompletedTask;
    }

    public event EventHandler? SettingsChanged;

    public async Task<ImmutableDictionary<string, object?>> GetSettingsAsync(IReadOnlyList<Setting> settings, CancellationToken cancellationToken)
    {
        var sendParams = new LSP.ConfigurationParams();
        sendParams.Items = settings.Select(s => new LSP.ConfigurationItem { Section = s.Name }).ToArray();
        var values = await this.SendWorkspaceConfigurationAsync(sendParams, cancellationToken).ConfigureAwait(false);
        return values
            .Select((r, i) => (s: settings[i], value: r))
            .ToImmutableDictionary(t => t.s.Name, t => t.value)
            ?? ImmutableDictionary<string, object?>.Empty;
    }

    public async Task<T> GetSettingAsync<T>(Setting<T> setting, CancellationToken cancellationToken)
    {
        var map = await GetSettingsAsync([setting], cancellationToken).ConfigureAwait(false);
        return setting.GetValue(map);
    }

    #endregion

    #region Completion Lists

    private static readonly CompletionOptions _completionOptions = CompletionOptions.Default
        .WithIncludePunctuationOnlySyntax(false)
        .WithAutoAppendWhitespace(false)
        .WithIncludeExtendedSyntax(false)
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
                var info = document.GetCompletionItems(position, @params.Context?.TriggerCharacter, _completionOptions, cancellationToken);

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

                var formatted = document.GetFormattedText(textRange, _optionsManager.FormattingOptions, cancellationToken);
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

    /// <summary>
    /// Custom URI scheme for virtual entity definition documents.
    /// </summary>
    private const string EntityDefinitionScheme = "kusto-entity";

    public override Task<LSP.SumType<LSP.Location, LSP.Location[]>?> OnTextDocumentDefinitionAsync(LSP.TextDocumentPositionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var position = GetTextPosition(document.Text, @params.Position);
                RelatedInfo relatedInfo = document.GetRelatedElements(position, _defaultFindRelatedOptions, cancellationToken);
                
                // Check for local declarations first (variables, let statements, etc.)
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

                // No local declaration found - check if it's a database entity
                var entityLocation = TryGetDatabaseEntityLocation(document, position, cancellationToken);
                if (entityLocation != null)
                {
                    return Task.FromResult<LSP.SumType<LSP.Location, LSP.Location[]>?>(entityLocation);
                }
            }
        }
        catch (Exception ex)
        {
            var _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.FromResult<LSP.SumType<LSP.Location, LSP.Location[]>?>(null);
    }

    /// <summary>
    /// Attempts to create a Location pointing to a virtual document for a database entity.
    /// </summary>
    private LSP.Location? TryGetDatabaseEntityLocation(IDocument document, int position, CancellationToken cancellationToken)
    {
        // Get the referenced symbol at the position
        var referencedSymbol = document.GetReferencedSymbol(position, cancellationToken);
        if (referencedSymbol == null)
            return null;

        // Determine the entity type and name based on the symbol
        var (entityType, entityName) = GetEntityTypeAndName(document, referencedSymbol);
        if (entityType == null || entityName == null)
            return null;

        // Get cluster and database from the symbol or document context
        var cluster = GetClusterName(document, referencedSymbol);
        var database = GetDatabaseName(document, referencedSymbol);

        if (cluster == null || database == null)
            return null;

        // Create a virtual document URI for this entity
        var virtualUri = CreateEntityDefinitionUri(cluster, database, entityType, entityName);

        return new LSP.Location
        {
            Uri = virtualUri,
            Range = new LSP.Range
            {
                Start = new LSP.Position { Line = 0, Character = 0 },
                End = new LSP.Position { Line = 0, Character = 0 }
            }
        };
    }

    private static (string? entityType, string? entityName) GetEntityTypeAndName(IDocument document, Symbol symbol)
    {
        if (document.Globals.GetDatabase(symbol) == null)
            return (null, null);

        return symbol switch
        {
            ExternalTableSymbol extable => ("ExternalTable", extable.Name),
            MaterializedViewSymbol mv => ("MaterializedView", mv.Name),
            StoredQueryResultSymbol sqr => ("StoredQueryResult", sqr.Name),
            TableSymbol table => ("Table", table.Name),
            FunctionSymbol func => ("Function", func.Name),
            EntityGroupSymbol eg => ("EntityGroup", eg.Name),
            GraphModelSymbol graph => ("Graph", graph.Name),
            _ => (null, null)
        };
    }

    private static string? GetClusterName(IDocument document, Symbol symbol)
    {
        var db = document.Globals.GetDatabase(symbol);
        return db != null ? document.Globals.GetCluster(db).Name : null;
    }

    private static string? GetDatabaseName(IDocument document, Symbol symbol)
    {
        return document.Globals.GetDatabase(symbol)?.Name;
    }

    /// <summary>
    /// Creates a virtual document URI for an entity definition.
    /// Format: kusto-entity://cluster/database/entityType/entityName.kql
    /// </summary>
    private static Uri CreateEntityDefinitionUri(string cluster, string database, string entityType, string entityName)
    {
        var encodedCluster = Uri.EscapeDataString(cluster);
        var encodedDatabase = Uri.EscapeDataString(database);
        var encodedEntityType = Uri.EscapeDataString(entityType);
        var encodedEntityName = Uri.EscapeDataString(entityName);
        return new Uri($"{EntityDefinitionScheme}://{encodedCluster}/{encodedDatabase}/{encodedEntityType}/{encodedEntityName}.kql");
    }

    /// <summary>
    /// Parses an entity definition URI to extract entity information.
    /// </summary>
    private static bool TryParseEntityDefinitionUri(Uri uri, out string cluster, out string database, out string entityType, out string entityName)
    {
        cluster = database = entityType = entityName = "";

        if (uri.Scheme != EntityDefinitionScheme)
            return false;

        try
        {
            cluster = Uri.UnescapeDataString(uri.Host);
            var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (segments.Length >= 3)
            {
                database = Uri.UnescapeDataString(segments[0]);
                entityType = Uri.UnescapeDataString(segments[1]);
                entityName = Uri.UnescapeDataString(Path.GetFileNameWithoutExtension(segments[2]));
                return true;
            }
        }
        catch
        {
            // Parsing failed
        }

        return false;
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
    private readonly ConditionalWeakTable<IDocument, DocumentActions> _scriptActions =
        new ConditionalWeakTable<IDocument, DocumentActions>();

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
                        var applyOptions = _codeActionOptions.WithFormattingOptions(_optionsManager.FormattingOptions);

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

    #region Schema

    [JsonRpcMethod("kusto/getServerInfo", UseSingleObjectParameterDeserialization = true)]
    public async Task<GetServerInfoResult?> OnGetServerInfoAsync(GetServerInfoParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var clusterName = _connectionManager.GetOrAddConnection(@params.Connection).Cluster;

            // ensure server databases are loaded
            var clusterInfo = await _schemaManager.GetClusterInfoAsync(clusterName, null, cancellationToken).ConfigureAwait(false);
            if (clusterInfo != null)
            {
                var dbs = clusterInfo.Databases.Select(db => new ServerDatabase
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
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
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
            var connection = _connectionManager.GetOrAddConnection(@params.Connection);
            var serverKind = await connection.GetServerKindAsync(cancellationToken).ConfigureAwait(false);
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
    public async Task<DatabaseInfo?> OnGetDatabaseInfo(GetDatabaseInfoParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var clusterName = @params.Cluster;
            var databaseName = @params.Database;

            return await _schemaManager.GetDatabaseInfoAsync(clusterName, databaseName, contextCluster: null, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    [DataContract]
    public class GetDatabaseInfoParams
    {
        [DataMember(Name = "cluster")]
        public required string Cluster { get; init; }

        [DataMember(Name = "database")]
        public required string Database { get; init; }
    }

    [JsonRpcMethod("kusto/refreshSchema", UseSingleObjectParameterDeserialization = true)]
    public async Task OnRefreshSchemaAsync(RefreshSchemaParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var clusterName = @params.Cluster;
            var databaseName = @params.Database;

            _ = this.SendWindowLogMessageAsync($"RefreshSchema: refreshing schema for cluster: {clusterName}, database: {databaseName ?? "(all)"}");

            // Refresh the schema cache first
            await _schemaManager.RefreshAsync(clusterName, databaseName, cancellationToken).ConfigureAwait(false);

            // Refresh the symbol cache
            await _symbolManager.RefreshAsync(clusterName, databaseName, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }
    }

    [DataContract]
    public class RefreshSchemaParams
    {
        [DataMember(Name = "cluster")]
        public required string Cluster { get; init; }

        [DataMember(Name = "database")]
        public string? Database { get; init; }
    }

    /// <summary>
    /// Refreshes the database schemas specifically referenced by the document.
    /// </summary>
    [JsonRpcMethod("kusto/refreshDocumentSchema", UseSingleObjectParameterDeserialization = true)]
    public async Task OnRefreshDocumentSchemaAsync(RefreshDocumentSchemaParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.Uri, out var document))
            {
                var dbRefs = document.GetDatabaseReferences(cancellationToken);
                foreach (var dbRef in dbRefs)
                {
                    // Refresh the schema cache first
                    await _schemaManager.RefreshAsync(dbRef.Cluster, dbRef.Database, cancellationToken).ConfigureAwait(false);
                    // Refresh the symbol cache
                    await _symbolManager.RefreshAsync(dbRef.Cluster, dbRef.Database, cancellationToken).ConfigureAwait(false);
                }
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }
    }

    [DataContract]
    public class RefreshDocumentSchemaParams
    {
        [DataMember(Name = "uri")]
        public required Uri Uri { get; init; }
    }

    #endregion

    #region Document Connections

    /// <summary>
    /// Ensures the server has a document. If the document is not known to the server,
    /// it will be added with the provided text. Always sends a documentReady notification.
    /// This handles the VS Code case where closing a tab may send didClose but reopening
    /// doesn't always send didOpen.
    /// </summary>
    [JsonRpcMethod("kusto/ensureDocument", UseSingleObjectParameterDeserialization = true)]
    public Task OnEnsureDocumentAsync(EnsureDocumentParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var uri = new Uri(@params.Uri);
            
            if (!_documentManager.TryGetDocument(uri, out _))
            {
                // Document not known to server - add it
                _documentManager.AddDocument(uri, @params.Text);
                _ = this.SendWindowLogMessageAsync($"ensureDocument: added document {@params.Uri}");
            }
            
            // Always send documentReady notification
            _ = this.SendNotificationAsync("kusto/documentReady", new
            {
                uri = @params.Uri
            });
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return Task.CompletedTask;
    }

    [DataContract]
    public class EnsureDocumentParams
    {
        [DataMember(Name = "uri")]
        public required string Uri { get; set; }

        [DataMember(Name = "text")]
        public required string Text { get; set; }
    }

    [JsonRpcMethod("kusto/connectionsUpdated", UseSingleObjectParameterDeserialization = true)]
    public async Task OnConnectionsUpdatedAsync(ConnectionsUpdatedParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var clusterNames = new List<string>();

            // ensure all connections are known by the connection manager
            foreach (var connectionString in @params.Connections)
            {
                var conn = _connectionManager.GetOrAddConnection(connectionString);
                clusterNames.Add(conn.Cluster);
            }

            // Ensure cluster symbols exist for all configured connections
            await _symbolManager.EnsureClustersAsync(clusterNames.ToImmutableList(), cancellationToken);
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }
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


    [JsonRpcMethod("kusto/inferDocumentConnection", UseSingleObjectParameterDeserialization = true)]
    public async Task<InferDocumentConnectionResult?> OnInferDocumentConnectionAsync(InferDocumentConnectionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.Uri, out var document))
            {
                var info = document.GetInferredConnection(cancellationToken);
                if (info != null)
                {
                    return new InferDocumentConnectionResult
                    {
                        Connection = info.Connection,
                        Cluster = info.ClusterName,
                        Database = info.DatabaseName
                    };
                }
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    [DataContract]
    public class InferDocumentConnectionParams
    {
        [DataMember(Name = "uri")]
        public required Uri Uri { get; set; }
    }

    [DataContract]
    public class InferDocumentConnectionResult
    {
        [DataMember(Name = "connection")]
        public string? Connection { get; set; }

        [DataMember(Name = "cluster")]
        public string? Cluster { get; set; }

        [DataMember(Name = "database")]
        public string? Database { get; set; }
    }

    #endregion

    #region Query

    #region Ranges

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

    #region Run

    [JsonRpcMethod("kusto/runQuery", UseSingleObjectParameterDeserialization = true)]
    public async Task<RunQueryResults?> OnRunQueryAsync(RunQueryParams @params, CancellationToken cancellationToken)
    {
        try
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

                var runResult = await _queryManager.RunQueryAsync(document, range, queryOptions, queryParameters, cancellationToken).ConfigureAwait(false);

                string? resultId = null;
                if (runResult?.ExecuteResult != null)
                {
                    // cache results for lookup later
                    resultId = _resultsManager.CacheResult(document, range.Start, runResult.ExecuteResult);
                }

                if (runResult?.Error != null)
                {
                    var errorRange = runResult.Error.HasLocation
                        ? GetLspRange(document.Text, new TextRange(runResult.Error.Start, runResult.Error.Length))
                        : null;

                    return new RunQueryResults
                    {
                        Error = new RunQueryDiagnostic
                        {
                            Message = runResult.Error.Message,
                            Details = runResult.Error.Description,
                            Range = errorRange
                        }
                    };
                }
                else if (runResult?.ExecuteResult != null)
                {
                    return new RunQueryResults
                    {
                        DataId = resultId,
                        Connection = runResult?.Connection,
                        Cluster = runResult?.Cluster,
                        Database = runResult?.Database
                    };
                }
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex.Message);
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
        [DataMember(Name = "dataId")]
        public string? DataId { get; init; }

        [DataMember(Name = "connection")]
        public string? Connection { get; init; }

        [DataMember(Name = "cluster")]
        public string? Cluster { get; init; }

        [DataMember(Name = "database")]
        public string? Database { get; init; }

        [DataMember(Name = "error")]
        public RunQueryDiagnostic? Error { get; init; }
    }

    [DataContract]
    public class RunQueryDiagnostic
    {
        [DataMember(Name = "message")]
        public required string Message { get; init; }

        [DataMember(Name = "details")]
        public string? Details { get; init; }

        [DataMember(Name = "range")]
        public LSP.Range? Range { get; init; }
    }
    #endregion

    #region Html Query

    [JsonRpcMethod("kusto/getQueryAsHtml", UseSingleObjectParameterDeserialization = true)]
    public Task<GetQueryAsHtmlResult?> OnGetQueryAsHtmlAsync(GetQueryAsHtmlParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                var range = GetTextRange(document.Text, @params.Selection);
                var queryFragment = document.ToHmtlFragment(range.Start, range.Length, @params.DarkMode == true);
                return Task.FromResult<GetQueryAsHtmlResult?>(
                    new GetQueryAsHtmlResult
                    {
                        Html = $"<html><body>{queryFragment}</body></html>"
                    });
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex.Message);
        }

        return Task.FromResult<GetQueryAsHtmlResult?>(null);
    }

    [DataContract]
    public class GetQueryAsHtmlParams
    {
        [DataMember(Name = "textDocument")]
        public required LSP.TextDocumentIdentifier TextDocument { get; init; }

        [DataMember(Name = "selection")]
        public required LSP.Range Selection { get; init; }

        [DataMember(Name = "darkMode")]
        public bool? DarkMode { get; init; }
    }

    [DataContract]
    public class GetQueryAsHtmlResult
    {
        [DataMember(Name = "html")]
        public required string Html { get; init; }
    }
    #endregion

    #endregion

    #region Data (Tables, Charts, etc)

    #region Data ID
    [JsonRpcMethod("kusto/getDataId", UseSingleObjectParameterDeserialization = true)]
    public Task<string?> OnGetDataIdAsync(GetDataIdParams @params, CancellationToken cancellationToken)
    {
        if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
        {
            var pos = GetTextPosition(document.Text, @params.Position);
            if (_resultsManager.TryGetLastResultId(document, pos, out var id))
            {
                return Task.FromResult<string?>(id);
            }
        }

        return Task.FromResult<string?>(null);
    }

    [DataContract]
    public class GetDataIdParams
    {
        [DataMember(Name = "textDocument")]
        public required LSP.TextDocumentIdentifier TextDocument { get; init; }

        [DataMember(Name = "position")]
        public required LSP.Position Position { get; init; }
    }
    #endregion

    #region Html Tables
    [JsonRpcMethod("kusto/getDataAsHtmlTables", UseSingleObjectParameterDeserialization = true)]
    public Task<GetDataAsHtmlTablesResult?> OnGetDataAsHtmlTablesAsync(GetDataAsHtmlTablesParams @params, CancellationToken cancellationToken)
    {
        if (_resultsManager.TryGetCachedResultById(@params.DataId, out var cachedResults))
        {
            if (cachedResults?.Tables != null)
            {
                var hasChart = cachedResults.ChartOptions != null
                    && cachedResults.ChartOptions.Visualization != Data.Utils.VisualizationKind.None;

                return Task.FromResult<GetDataAsHtmlTablesResult?>(
                    new GetDataAsHtmlTablesResult
                    {
                        Tables = cachedResults.Tables.Select(t => new HtmlTable
                        {
                            Html = GetDataAsHtml(t),
                            Name = t.TableName,
                            RowCount = t.Rows.Count
                        }).ToImmutableList(),
                        HasChart = hasChart
                    });
            }
        }

        return Task.FromResult<GetDataAsHtmlTablesResult?>(null);
    }

    [DataContract]
    public class GetDataAsHtmlTablesParams
    {
        [DataMember(Name = "dataId")]
        public required string DataId { get; init; }
    }

    [DataContract]
    public class GetDataAsHtmlTablesResult
    {
        [DataMember(Name = "tables")]
        public required ImmutableList<HtmlTable> Tables { get; init; }

        [DataMember(Name = "hasChart")]
        public bool HasChart { get; init; }
    }

    [DataContract]
    public class HtmlTable
    {
        [DataMember(Name = "name")]
        public required string Name { get; init; }

        [DataMember(Name = "html")]
        public required string Html { get; init; }

        [DataMember(Name = "rowCount")]
        public int RowCount { get; init; }
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
    #endregion

    #region Html Chart
    [JsonRpcMethod("kusto/getDataAsHtmlChart", UseSingleObjectParameterDeserialization = true)]
    public Task<GetDataAsHtmlChartResult?> OnGetDataAsHtmlChart(GetDataAsHtmlChartParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_resultsManager.TryGetCachedResultById(@params.DataId, out var cachedResults)
                && cachedResults.Tables != null
                && cachedResults.Tables.Count > 0
                && cachedResults.ChartOptions != null
                && cachedResults.ChartOptions.Visualization != Data.Utils.VisualizationKind.None)
            {
                var chartHtml = GetChartAsHtml(cachedResults.Tables[0], cachedResults.ChartOptions, @params.DarkMode);
                return Task.FromResult<GetDataAsHtmlChartResult?>(
                    new GetDataAsHtmlChartResult
                    {
                        Html = chartHtml
                    });
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex.Message);
        }

        return Task.FromResult<GetDataAsHtmlChartResult?>(null);
    }

    private string GetChartAsHtml(DataTable data, Data.Utils.ChartVisualizationOptions chartOptions, bool darkMode = false)
    {
        return _chartManager.RenderChartToHtmlDocument(data, chartOptions, darkMode)
            ?? "<html>chart style not implemented yet</html>";
    }

    [DataContract]
    public class GetDataAsHtmlChartParams
    {
        [DataMember(Name = "dataId")]
        public required string DataId { get; init; }

        [DataMember(Name = "darkMode")]
        public bool DarkMode { get; init; }
    }

    [DataContract]
    public class GetDataAsHtmlChartResult
    {
        [DataMember(Name = "html")]
        public required string Html { get; init; }
    }

    #endregion

    #region Kusto Expression

    [JsonRpcMethod("kusto/getDataAsExpression", UseSingleObjectParameterDeserialization = true)]
    public Task<GetDataAsExpressionResult?> OnGetDataAsExpression(GetDataAsExpressionParams @params, CancellationToken cancellationToken)
    {
        try
        {
            if (_resultsManager.TryGetCachedResultById(@params.DataId, out var results)
                && results.Tables != null
                && results.Tables.Count > 0)
            {
                var table = @params.TableName != null ? results.Tables.FirstOrDefault(t => t.TableName == @params.TableName) : null;
                if (table == null)
                    table = results.Tables[0];

                var statement = KustoGenerator.GenerateDataTableExpression(table);

                return Task.FromResult<GetDataAsExpressionResult?>(
                    new GetDataAsExpressionResult { Expression = statement }
                    );
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex.Message);
        }

        return Task.FromResult<GetDataAsExpressionResult?>(null);
    }

    [DataContract]
    public class GetDataAsExpressionParams
    {
        [DataMember(Name = "dataId")]
        public required string DataId { get; init; }

        [DataMember(Name = "tableName")]
        public string? TableName { get; init; }
    }

    [DataContract]
    public class GetDataAsExpressionResult
    {
        [DataMember(Name = "expression")]
        public required string Expression { get; init; }
    }
    #endregion

    #endregion

    #region Entities

    [JsonRpcMethod("kusto/getEntityAsCommand", UseSingleObjectParameterDeserialization = true)]
    public async Task<string?> OnGetEntityAsCommandAsync(GetEntityCreateCommandParams @params, CancellationToken cancellationToken)
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

                return await _entityManager.GetCreateCommand(entityId, cancellationToken).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    [DataContract]
    public class GetEntityCreateCommandParams
    {
        [DataMember(Name="cluster")]
        public required string Cluster { get; init; }

        [DataMember(Name="database")]
        public required string Database { get; init; }

        [DataMember(Name = "entityType")]
        public required string EntityType { get; init; }

        [DataMember(Name="entityName")]
        public required string EntityName { get; init; }
    }

    [JsonRpcMethod("kusto/getEntityAsExpression", UseSingleObjectParameterDeserialization = true)]
    public async Task<string?> OnGetEntityAsExpressionAsync(GetEntityExpressionParams @params, CancellationToken cancellationToken)
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

                IDocument? document = null;
                if (@params.Uri is { } uri)
                {
                    _documentManager.TryGetDocument(uri, out document);
                }

                return await _entityManager.GetQueryExpression(entityId, document, cancellationToken).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    [DataContract]
    public class GetEntityExpressionParams
    {
        [DataMember(Name="cluster")]
        public required string Cluster { get; init; }

        [DataMember(Name="database")]
        public required string Database { get; init; }

        [DataMember(Name = "entityType")]
        public required string EntityType { get; init; }

        [DataMember(Name="entityName")]
        public required string EntityName { get; init; }

        [DataMember(Name = "uri")]
        public Uri? Uri { get; init; }
    }

    /// <summary>
    /// Gets the content of a virtual entity definition document.
    /// Called by the VS Code extension's TextDocumentContentProvider.
    /// </summary>
    [JsonRpcMethod("kusto/getEntityDefinitionContent", UseSingleObjectParameterDeserialization = true)]
    public async Task<GetEntityDefinitionContentResult?> OnGetEntityDefinitionContentAsync(GetEntityDefinitionContentParams @params, CancellationToken cancellationToken)
    {
        try
        {
            var uri = new Uri(@params.Uri);
            if (TryParseEntityDefinitionUri(uri, out var cluster, out var database, out var entityType, out var entityName))
            {
                if (Kusto.Data.Common.ExtendedEntityType.FastTryParse(entityType, out var parsedEntityType))
                {
                    var entityId = new EntityId
                    {
                        Cluster = cluster,
                        Database = database,
                        EntityType = parsedEntityType,
                        EntityName = entityName
                    };

                    var content = await _entityManager.GetCreateCommand(entityId, cancellationToken).ConfigureAwait(false);
                    if (content != null)
                    {
                        return new GetEntityDefinitionContentResult
                        {
                            Content = content
                        };
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex);
        }

        return null;
    }

    [DataContract]
    public class GetEntityDefinitionContentParams
    {
        [DataMember(Name = "uri")]
        public required string Uri { get; init; }
    }

    [DataContract]
    public class GetEntityDefinitionContentResult
    {
        [DataMember(Name = "content")]
        public required string Content { get; init; }
    }

    #endregion

    #region Transform Paste

    [JsonRpcMethod("kusto/transformPaste", UseSingleObjectParameterDeserialization = true)]
    public async Task<string?> OnTransformPasteAsync(TransformPasteParams @params, CancellationToken cancellationToken)
    {
        var text = @params.Text;

        try
        {
            if (_documentManager.TryGetDocument(@params.TextDocument.Uri, out var document))
            {
                switch (@params.Kind)
                {
                    case "command":
                        if (document.Globals.Cluster.Name != @params.EntityCluster
                            || document.Globals.Database.Name != @params.EntityDatabase)
                        {
                            var conn = $"cluster({KustoFacts.GetSingleQuotedStringLiteral(@params.EntityCluster)})";
                            if (@params.EntityDatabase != null)
                                conn = $"{conn}.database({KustoFacts.GetSingleQuotedStringLiteral(@params.EntityDatabase)})";
                            text = $"#connect {conn}\n{text}";
                        }
                        break;
                    case "expression":
                        if (@params.EntityName != null
                            && Kusto.Data.Common.ExtendedEntityType.FastTryParse(@params.EntityType, out var entityType))
                        {
                            var entityId = new EntityId()
                            {
                                Cluster = @params.EntityCluster,
                                Database = @params.EntityDatabase,
                                EntityType = entityType,
                                EntityName = @params.EntityName
                            };

                            // recreate expression text based on target document
                            text = await _entityManager.GetQueryExpression(entityId, document, cancellationToken).ConfigureAwait(false);
                        }
                        break;
                }
            }
        }
        catch (Exception ex)
        {
            _ = this.SendWindowLogMessageAsync(ex.Message);
        }

        return text;
    }

    [DataContract]
    public class TransformPasteParams
    {
        [DataMember(Name = "text")]
        public required string Text { get; init; }

        [DataMember(Name = "kind")]
        public required string Kind { get; init; }

        [DataMember(Name = "textDocument")]
        public required LSP.TextDocumentIdentifier TextDocument { get; init; }

        [DataMember(Name = "position")]
        public required LSP.Position Position { get; init; }

        [DataMember(Name = "entityCluster")]
        public string? EntityCluster { get; init; }

        [DataMember(Name = "entityDatabase")]
        public string? EntityDatabase { get; init; }

        [DataMember(Name = "entityType")]
        public string? EntityType { get; init; }

        [DataMember(Name = "entityName")]
        public string? EntityName { get; init; }
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
