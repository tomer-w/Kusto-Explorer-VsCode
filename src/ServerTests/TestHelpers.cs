namespace Tests;

using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using Kusto.Language.Syntax;
using Kusto.Vscode;

public static class TestHelpers
{
    /// <summary>
    /// Normalizes line endings to LF (\n) for cross-platform test consistency.
    /// </summary>
    public static string NormalizeLineEndings(string text)
    {
        return text.Replace("\r\n", "\n").Replace("\r", "\n");
    }

    /// <summary>
    /// Asserts that two strings are equal after normalizing line endings.
    /// Use this for comparing generated KQL or other multi-line text.
    /// </summary>
    public static void AssertTextEqual(string expected, string actual, string? message = null)
    {
        var normalizedExpected = NormalizeLineEndings(expected);
        var normalizedActual = NormalizeLineEndings(actual);
        Assert.AreEqual(normalizedExpected, normalizedActual, message);
    }

    public static (string queryWithMarker, int position) ExtractPosition(string queryWithMarker, string marker = "$")
    {
        var position = queryWithMarker.IndexOf(marker);
        if (position < 0)
            throw new ArgumentException("Marker not found in query", nameof(queryWithMarker));
        var query = queryWithMarker.Remove(position, marker.Length);
        return (query, position);
    }

    public static void AssertAreEqual(Diagnostic expected, Diagnostic actual)
    {
        AssertAreEqual(new TextRange(expected.Start, expected.Length), new TextRange(actual.Start, actual.Length));
        Assert.AreEqual(expected.Message, actual.Message, "diagnostic message");
    }

    public static void AssertAreEqual(TextRange expected, TextRange actual)
    {
        if (!expected.Equals(actual))
        {
            Assert.Fail($"expected: ({expected.Start}, {expected.Length}) actual: ({actual.Start}, {actual.Length})");
        }
    }

    public static Symbol? GetSymbolAt(KustoCode code, int position)
    {
        var token = code.Syntax.GetTokenAt(position);
        var node = token.Parent;
        return node?.GetFirstAncestorOrSelf<SyntaxNode>(n => n.TextStart == node.TextStart && n.Width == n.Width && n.ReferencedSymbol != null)?.ReferencedSymbol;
    }

    public static Symbol? GetReferencedSymbol(KustoCode code, string name)
    {
        Symbol? result = null;
        SyntaxElement.WalkNodes(
            code.Syntax,
            fnBefore: node =>
            {
                if (node is NameReference nr && nr.SimpleName == name && nr.ReferencedSymbol != null)
                {
                    result = nr.ReferencedSymbol;
                }
            });
        return result;
    }

}
