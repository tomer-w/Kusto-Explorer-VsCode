// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language;
using KLE=Kusto.Language.Editor;

namespace Kusto.Vscode;

public class OptionsManager : IOptionsManager
{
    private readonly ISettingSource _settingSource;

    private string _defaultDomain = KustoFacts.KustoWindowsNet;
    private KLE.FormattingOptions _formattingOptions = KLE.FormattingOptions.Default;
    private ChartOptions _defaultChartOptions = new ChartOptions { Type = ChartType.None };

    public OptionsManager(ISettingSource settingSource)
    {
        _settingSource = settingSource;

        _settingSource.SettingsChanged += _settingSource_SettingsChanged;
    }

    public event EventHandler? OptionsChanged;

    public string DefaultDomain => _defaultDomain;
    public KLE.FormattingOptions FormattingOptions => _formattingOptions;
    public ChartOptions DefaultChartOptions => _defaultChartOptions;

    private void _settingSource_SettingsChanged(object? sender, EventArgs e)
    {
        _ = this.RefreshAsync(CancellationToken.None);
    }

    private async Task RefreshAsync(CancellationToken cancellationToken)
    {
        _defaultDomain = await _settingSource.GetSettingAsync(ConnectionSettings.DefaultDomain, cancellationToken).ConfigureAwait(false);
        _formattingOptions = await GetFormattingOptionsAsync(cancellationToken).ConfigureAwait(false);
        _defaultChartOptions = await GetDefaultChartOptionsAsync(cancellationToken).ConfigureAwait(false);

        // raise event after refresh
        this.OptionsChanged?.Invoke(this, EventArgs.Empty);
    }

    private async Task<ChartOptions> GetDefaultChartOptionsAsync(CancellationToken cancellationToken)
    {
        var settings = await _settingSource.GetSettingsAsync(ChartSettings.All, cancellationToken).ConfigureAwait(false);

        return new ChartOptions
        {
            Type = ChartType.None,
            LegendPosition = NullIfEmpty(ChartSettings.LegendPosition.GetValue(settings)),
            XShowTicks = YesNoToBool(ChartSettings.XShowTicks.GetValue(settings)),
            YShowTicks = YesNoToBool(ChartSettings.YShowTicks.GetValue(settings)),
            XShowGrid = YesNoToBool(ChartSettings.XShowGrid.GetValue(settings)),
            YShowGrid = YesNoToBool(ChartSettings.YShowGrid.GetValue(settings)),
            ShowValues = YesNoToBool(ChartSettings.ShowValues.GetValue(settings)),
            TextSize = NullIfEmpty(ChartSettings.TextSize.GetValue(settings)),
            AspectRatio = NullIfEmpty(ChartSettings.AspectRatio.GetValue(settings)),
        };
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

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrEmpty(value) ? null : value;

    private static bool? YesNoToBool(string? value) =>
        string.Equals(value, "yes", StringComparison.OrdinalIgnoreCase) ? true
        : string.Equals(value, "no", StringComparison.OrdinalIgnoreCase) ? false
        : null;
}
