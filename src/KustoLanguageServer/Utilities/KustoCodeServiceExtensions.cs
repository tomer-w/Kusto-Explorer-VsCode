// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Diagnostics.CodeAnalysis;
using System.Reflection;

using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using Kusto.Language.Syntax;

namespace Kusto.Lsp;

public static class KustoCodeServiceExtensions
{
    // private bool TryGetBoundCode(Kusto.Language.Utils.CancellationToken cancellationToken, bool waitForAnalysis, out KustoCode code)

    public delegate bool TryGetBoundCodeDelegate(Kusto.Language.Utils.CancellationToken cancellationToken, bool waitForAnalysis, out KustoCode code);

    public static bool TryGetBoundCode(this CodeService service, CancellationToken cancellationToken, [NotNullWhen(true)] out KustoCode? code)
    {
        if (service is OffsetCodeService oks)
            service = (CodeService)typeof(OffsetCodeService).GetField("_service", BindingFlags.NonPublic | BindingFlags.Instance)!.GetValue(service)!;

        if (service is KustoCodeService kcs
            && typeof(KustoCodeService).GetMethod("TryGetBoundCode", BindingFlags.NonPublic | BindingFlags.Instance) is { } method)
        {
            var tryGetBoundCode = (TryGetBoundCodeDelegate)Delegate.CreateDelegate(typeof(TryGetBoundCodeDelegate), kcs, method);
            return tryGetBoundCode(cancellationToken, true, out code);
        }

        code = null;
        return false;
    }

    public static Symbol? GetReferencedSymbol(this CodeService service, int position, CancellationToken cancellationToken)
    {
        if (service.TryGetBoundCode(cancellationToken, out var code))
        {
            var token = code.GetTokenWithAffinity(position);
            if (token != null)
            {
                var node = token.Parent;
                while (node != null)
                {
                    if (node.ReferencedSymbol != null)
                        return node.ReferencedSymbol;

                    // if parent has save span as this one, 
                    // check parent.
                    if (node.Parent.TextStart == node.TextStart
                        && node.Parent.Width == node.Width)
                    {
                        node = node.Parent;
                        continue;
                    }
                    break;
                }
            }
        }

        return null;
    }
}

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
