using System.Collections.Immutable;
using Kusto.Language.Editor;

namespace Kusto.Lsp;

public static class FormatSettings
{
    public static readonly Setting<int> TabSize =
        new Setting<int>("editor.tabSize", 4);

    public static readonly Setting<bool> InsertMissingTokens = 
        new Setting<bool>("kusto.format.insertMissingTokens", false);

    public static ImmutableDictionary<string, BrackettingStyle> BrackettingStyles { get; } =
        new Dictionary<string, BrackettingStyle>
        {
            { "none", BrackettingStyle.None },
            { "vertical", BrackettingStyle.Vertical },
            { "diagonal", BrackettingStyle.Diagonal }
        }
        .ToImmutableDictionary();

    public static readonly Setting<BrackettingStyle> DefaultBrackettingStyle = 
        new StringMappedSetting<BrackettingStyle>(
            "kusto.format.bracketStyle", BrackettingStyle.Vertical, BrackettingStyles);

    public static readonly Setting<BrackettingStyle> SchemaBrackettingStyle = 
        new StringMappedSetting<BrackettingStyle>(
            "kusto.format.schemaBracketStyle", BrackettingStyle.None, BrackettingStyles);

    public static readonly Setting<BrackettingStyle> DataTableBrackettingStyle =
        new StringMappedSetting<BrackettingStyle>(
            "kusto.format.dataTableBracketStyle", BrackettingStyle.Vertical, BrackettingStyles);

    public static readonly Setting<BrackettingStyle> FunctionBodyBrackettingStyle =
        new StringMappedSetting<BrackettingStyle>(
            "kusto.format.functionBodyBracketStyle", BrackettingStyle.Vertical, BrackettingStyles);

    public static readonly Setting<BrackettingStyle> FunctionParameterBrackettingStyle =
        new StringMappedSetting<BrackettingStyle>(
            "kusto.format.functionParameterBracketStyle", BrackettingStyle.None, BrackettingStyles);

    public static readonly Setting<BrackettingStyle> FunctionArgumentBrackettingStyle =
        new StringMappedSetting<BrackettingStyle>(
            "kusto.format.functionArgumentBracketStyle", BrackettingStyle.None, BrackettingStyles);

    public static ImmutableDictionary<string, PlacementStyle> PlacementStyles { get; } =
        new Dictionary<string, PlacementStyle>
        {
            { "none", PlacementStyle.None  },
            { "newLine", PlacementStyle.NewLine },
            { "smart", PlacementStyle.Smart },
        }
        .ToImmutableDictionary();

    public static readonly Setting<PlacementStyle> PipeOperatorPlacementStyle =
        new StringMappedSetting<PlacementStyle>(
            "kusto.format.pipeOperatorPlacementStyle", PlacementStyle.Smart, PlacementStyles);

    public static readonly Setting<PlacementStyle> ExpressionPlacementStyle =
        new StringMappedSetting<PlacementStyle>(
            "kusto.format.expressionListPlacementStyle", PlacementStyle.Smart, PlacementStyles);

    public static readonly Setting<PlacementStyle> StatementPlacementStyle =
        new StringMappedSetting<PlacementStyle>(
            "kusto.format.statementListPlacementStyle", PlacementStyle.Smart, PlacementStyles);

    public static readonly Setting<PlacementStyle> SemicolonPlacementStyle =
        new StringMappedSetting<PlacementStyle>(
            "kusto.format.semicolonPlacementStyle", PlacementStyle.None, PlacementStyles);

    public static readonly ImmutableList<Setting> All =
        [
            TabSize,
            InsertMissingTokens,
            DefaultBrackettingStyle,
            SchemaBrackettingStyle,
            DataTableBrackettingStyle,
            FunctionBodyBrackettingStyle,
            FunctionParameterBrackettingStyle,
            FunctionArgumentBrackettingStyle,
            ExpressionPlacementStyle,
            StatementPlacementStyle,
            SemicolonPlacementStyle
        ];
}
