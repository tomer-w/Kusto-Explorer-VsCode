using Kusto.Cloud.Platform.Utils;
using Kusto.Language.Editor;
using System.Collections.Immutable;

namespace Kusto.Lsp;

public static class KustoHtmlExtensions
{
    /// <summary>
    /// Converts the text of the <see cref="IDocument"> into an HTML fragment.
    /// </summary>
    public static string ToHmtlFragment(this IDocument document, bool isDarkTheme = false)
    {
        return ToHmtlFragment(document, 0, document.Text.Length, isDarkTheme);
    }

    /// <summary>
    /// Converts the range of text in the <see cref="IDocument"> into an HTML fragment.
    /// </summary>
    public static string ToHmtlFragment(this IDocument document, int start, int length, bool isDarkTheme = false)
    {
        var builder = new HtmlBuilder();
        var style = isDarkTheme
            ? DarkThemeStyle
            : LightThemeStyle;

        var classificationKindToStyleMap = isDarkTheme
            ? DarkThemeColors
            : LightThemeColors;

        WriteDocument(builder, document, start, length, style, classificationKindToStyleMap);

        return builder.Text;
    }

    /// <summary>
    /// Writes document text to html.
    /// </summary>
    public static void WriteDocument(
        this HtmlBuilder builder, 
        IDocument document, 
        int start, 
        int length, 
        string? defaultStyle = null,
        ImmutableDictionary<ClassificationKind, string>? classificationStyles = null)
    {
        defaultStyle ??= LightThemeStyle;
        classificationStyles ??= LightThemeColors;

        builder.WriteTagInline("pre", $"style='{defaultStyle}'", () =>
        {
            var classificationResult = document.GetClassifications(start, length);
            var end = start + length;
            int prevEnd = start;

            foreach (var classifiedRange in classificationResult.Classifications)
            {
                // if there is a gap between ranges or text before the first range add that here.
                if (classifiedRange.Start > prevEnd)
                {
                    var textBetween = document.Text.Substring(prevEnd, classifiedRange.Start - prevEnd);
                    var encodedTextBetween = ExtendedUri.HtmlEncode(textBetween);
                    builder.Write(encodedTextBetween);
                }

                // add text for the classified range
                var classifiedText = document.Text.Substring(classifiedRange.Start, classifiedRange.Length);
                var encodedText = ExtendedUri.HtmlEncode(classifiedText);

                if (classificationStyles.TryGetValue(classifiedRange.Kind, out var style))
                {
                    builder.WriteTagInline("span", $"style='{style}'", encodedText);
                }
                else
                {
                    // no style for this classification kind, just add without style.
                    builder.Write(encodedText);
                }

                prevEnd = classifiedRange.End;
            }

            // add any text after last range
            if (prevEnd < end)
            {
                var textAfter = document.Text.Substring(prevEnd, end - prevEnd);
                var encodedTextAfter = ExtendedUri.HtmlEncode(textAfter);
                builder.Write(encodedTextAfter);
            }
        });
    }

    public static readonly string DarkThemeStyle = "font: 10pt consolas; background: #252526; color: white;";
    public static readonly string LightThemeStyle = "font: 10pt consolas";

    public static readonly ImmutableDictionary<ClassificationKind, string> LightThemeColors =
        new Dictionary<ClassificationKind, string>()
        {
            {ClassificationKind.ClientParameter, "color: #2b91af"},
            {ClassificationKind.Column, "color: MediumVioletRed"},
            {ClassificationKind.Command, "color: blue"},
            {ClassificationKind.Comment, "color: green"},
            {ClassificationKind.Database, "color: DarkOrchid" },
            {ClassificationKind.Directive, "color: DarkViolet;" },
            {ClassificationKind.Function, "color: blue;"},
            {ClassificationKind.Identifier, "color: purple"},
            {ClassificationKind.Keyword, "color: blue"},
            {ClassificationKind.MaterializedView, "color: DarkOrchid"},
            {ClassificationKind.Parameter, "color: MidnightBlue"},
            {ClassificationKind.QueryOperator, "color: #da3900"},
            {ClassificationKind.QueryParameter, "color: #2b91af"},
            {ClassificationKind.ScalarOperator, "color: blue"},
            {ClassificationKind.StringLiteral, "color: firebrick"},
            {ClassificationKind.Table, "color: DarkOrchid"},
            {ClassificationKind.Type, "color: blue;"},
            {ClassificationKind.Variable, "color: MidnightBlue"},
        }.ToImmutableDictionary();

    private static readonly ImmutableDictionary<ClassificationKind, string> DarkThemeColors =
       new Dictionary<ClassificationKind, string>()
       {
            {ClassificationKind.ClientParameter, "color: LightGoldenrodYellow"},
            {ClassificationKind.Column, "color: PaleVioletRed"},
            {ClassificationKind.Command, "color: #569cd6"},
            {ClassificationKind.Comment, "color: #608b4e"},
            {ClassificationKind.Database, "color: #d7ba7d" },
            {ClassificationKind.Directive, "color: LightGoldenrodYellow;" },
            {ClassificationKind.Function, "color: #569cd6;"},
            {ClassificationKind.Identifier, "color: white"},
            {ClassificationKind.Keyword, "color: #569cd6"},
            {ClassificationKind.MaterializedView, "color: #d7ba7d"},
            {ClassificationKind.Parameter, "color: #92caf4"},
            {ClassificationKind.QueryOperator, "color: #4ec9b0"},
            {ClassificationKind.QueryParameter, "color: #2b91af"},
            {ClassificationKind.ScalarOperator, "color: #569cd6"},
            {ClassificationKind.StringLiteral, "color: #d69d85"},
            {ClassificationKind.Table, "color: #d7ba7d"},
            {ClassificationKind.Type, "color: #569cd6;"},
            {ClassificationKind.Variable, "color: #92caf4"},
       }.ToImmutableDictionary();
}
