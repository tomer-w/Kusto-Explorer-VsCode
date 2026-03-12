// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Language;
using Kusto.Language.Syntax;

namespace Kusto.Vscode;

public static class KustoCodeExtensions
{
    /// <summary>
    /// Get the token that the position has affinity with,
    /// or null if the position does not have affinity (in whitespace between tokens).
    /// </summary>
    public static SyntaxToken? GetTokenWithAffinity(this KustoCode code, int position)
    {
        var token = code.Syntax.GetTokenAt(position);
        var previous = token.GetPreviousToken();

        if (HasAffinity(token, position))
        {
            return token;
        }
        else if (previous != null && HasAffinity(previous, position))
        {
            return previous;
        }
        else
        {
            // fully inside trivia between tokens, no affinity
            return null;
        }
    }

    /// <summary>
    /// Returns true if the token has affinity with the position.
    /// </summary>
    private static bool HasAffinity(SyntaxToken token, int position)
    {
        return (position > token.TextStart && position < token.End)
            || position == token.TextStart && IsNameLikeToken(token.Kind)
            || position == token.End && IsNameLikeToken(token.Kind);
    }

    private static bool IsNameLikeToken(SyntaxKind kind)
    {
        switch (kind.GetCategory())
        {
            case SyntaxCategory.Identifier:
            case SyntaxCategory.Keyword:
                return true;
            default:
                // ! can be start of some keywords
                return kind == SyntaxKind.BangToken;
        }
    }

    /// <summary>
    /// Gets the token left of the token that has affinity with the position.
    /// </summary>
    public static SyntaxToken? GetTokenLeftOfPosition(this KustoCode code, int position)
    {
        var token = code.Syntax.GetTokenAt(position);
        var hasAffinity = token != null && HasAffinity(token, position);

        if (token != null && (position <= token.TextStart || !hasAffinity || token.Kind == SyntaxKind.EndOfTextToken))
        {
            token = token.GetPreviousToken();
        }

        return token;
    }

    /// <summary>
    /// Returns the complete expression that exists to the left of the position.
    /// </summary>
    public static Expression? GetCompleteExpressionLeftOfPosition(this KustoCode code, int position)
    {
        var token = GetTokenLeftOfPosition(code, position);

        var expr = token?.GetFirstAncestorOrSelf<Expression>();
        if (expr != null && token != null && expr.End == token.End && !expr.HasMissingChildren())
            return expr;

        return null;
    }
}
