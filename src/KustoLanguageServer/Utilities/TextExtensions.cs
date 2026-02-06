using System.Runtime.CompilerServices;

namespace Kusto.Lsp;

public static class TextExtensions
{
    private static readonly ConditionalWeakTable<string, List<int>> 
        _textToLineStartPositions = new ConditionalWeakTable<string, List<int>>();

    private static List<int> GetLineStartPositions(string text)
    {
        if (!_textToLineStartPositions.TryGetValue(text, out var lineStartPositions))
        {
            lineStartPositions = _textToLineStartPositions.GetOrAdd(text, _ => Kusto.Language.Parsing.TextFacts.GetLineStarts(text).ToList());
        }
        return lineStartPositions;
    }

    /// <summary>
    /// Gets the zero-based text position from the zero-based line and line offset (character).
    /// </summary>
    public static bool TryGetTextPosition(this string text, int line, int lineOffset, out int position)
    {
        var lineStarts = GetLineStartPositions(text);
        // Kusto's TextFacts uses 1-based line and offset, so we need to adjust the input values accordingly.
        return Kusto.Language.Parsing.TextFacts.TryGetPosition(lineStarts, line + 1, lineOffset + 1, out position);
    }

    /// <summary>
    /// Gets the zero-based line and line offset (character) from the zero-based text position.
    /// </summary>
    public static bool TryGetLineAndOffset(this string text, int position, out int line, out int lineOffset)
    {
        var lineStarts = GetLineStartPositions(text);
        // Kusto's TextFacts uses 1-based line and offset, so we need to adjust the output values accordingly.
        if (Kusto.Language.Parsing.TextFacts.TryGetLineAndOffset(lineStarts, position, out line, out lineOffset))
        {
            line--;
            lineOffset--;
            return true;
        }
        line = 0;
        lineOffset = 0;
        return false;
    }
}
