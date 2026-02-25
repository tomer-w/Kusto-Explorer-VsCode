using Kusto.Language;
using KLE=Kusto.Language.Editor;

namespace Kusto.Lsp;

public class OptionsManager : IOptionsManager
{
    private readonly ISettingSource _settingSource;

    private string _defaultDomain = KustoFacts.KustoWindowsNet;
    private KLE.FormattingOptions _formattingOptions = KLE.FormattingOptions.Default;

    public OptionsManager(ISettingSource settingSource)
    {
        _settingSource = settingSource;

        _settingSource.SettingsChanged += _settingSource_SettingsChanged;
    }

    public event EventHandler? OptionsChanged;

    public string DefaultDomain => _defaultDomain;
    public KLE.FormattingOptions FormattingOptions => _formattingOptions;

    private void _settingSource_SettingsChanged(object? sender, EventArgs e)
    {
        _ = this.RefreshAsync(CancellationToken.None);
    }

    public async Task RefreshAsync(CancellationToken cancellationToken)
    {
        _defaultDomain = await _settingSource.GetSettingAsync(ConnectionSettings.DefaultDomain, cancellationToken).ConfigureAwait(false);
        _formattingOptions = await GetFormattingOptionsAsync(cancellationToken).ConfigureAwait(false);

        // raise event after refresh
        this.OptionsChanged?.Invoke(this, EventArgs.Empty);
    }

    private async Task<KLE.FormattingOptions> GetFormattingOptionsAsync(CancellationToken cancellationToken)
    {
        var settings = await _settingSource.GetSettingsAsync(FormatSettings.All, cancellationToken).ConfigureAwait(false);

        return Kusto.Language.Editor.FormattingOptions.Default
            .WithIndentationSize(FormatSettings.TabSize.GetValue(settings))
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
}
