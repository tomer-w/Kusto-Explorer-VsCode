using Kusto.Language.Editor;

namespace Kusto.Lsp;

public class OptionsManager : IOptionsManager
{
    private readonly ISettingSource _settingSource;
    private FormattingOptions? _formattingOptions;

    public OptionsManager(ISettingSource settingSource)
    {
        _settingSource = settingSource;

        _settingSource.SettingsChanged += _settingSource_SettingsChanged;
    }

    private void _settingSource_SettingsChanged(object? sender, EventArgs e)
    {
        throw new NotImplementedException();
    }

    public async Task<FormattingOptions> GetFormattingOptionsAsync(CancellationToken cancellationToken)
    {
        var options = _formattingOptions;
        if (options == null)
        {
            var settings = await _settingSource.GetSettingsAsync(FormatSettings.All, cancellationToken).ConfigureAwait(false);

            options = _formattingOptions = FormattingOptions.Default
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

        return options;
    }
}
