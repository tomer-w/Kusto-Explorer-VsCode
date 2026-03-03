// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;

namespace Lsp.Common;

public class SemanticTokenEncoder
{
    private readonly ImmutableDictionary<string, int> _tokenTypeToIndex;
    private readonly ImmutableDictionary<string, int> _modifierToMask;

    public SemanticTokenEncoder(
        ImmutableList<string> tokenTypes,
        ImmutableList<string> tokenModifiers)
    {
        _tokenTypeToIndex = tokenTypes.Distinct().Select((text, index) => (text, index)).ToImmutableDictionary(x => x.text, x => x.index);
        _modifierToMask = tokenModifiers.Distinct().Select((text, index) => (text, mask: 1 << index)).ToImmutableDictionary(x => x.text, x => x.mask);
    }

    /// <summary>
    /// Encodes the given semantic ranges into the LSP semantic token format.
    /// All semantic ranges must be sorted by line and character, 
    /// must not overlap, and must be on a single line.
    /// </summary>
    public int[] Encode(IReadOnlyList<SemanticToken> semanticTokens)
    {
        var encoded = new List<int>();

        var prevToken = default(SemanticToken);

        foreach (var token in semanticTokens)
        {
            System.Diagnostics.Debug.Assert(token.Line >= prevToken.Line, "unordered semantic tokens");
            System.Diagnostics.Debug.Assert(token.Line > prevToken.Line || token.Character >= prevToken.Character + prevToken.Length, "unordered semantic tokens");

            // delta line
            encoded.Add(
                encoded.Count == 0  // first position is absolute
                    ? token.Line
                    : token.Line - prevToken.Line
                    );

            // delta character
            if (token.Line == prevToken.Line)
            {
                // token is relative to start of previous token on same line
                encoded.Add(token.Character - prevToken.Character);
            }
            else
            {
                // absolute character position on new line
                encoded.Add(token.Character);
            }

            // token length
            encoded.Add(token.Length);

            // token type
            var tokenType = _tokenTypeToIndex.TryGetValue(token.Type, out var tt) ? tt : 0;
            encoded.Add(tokenType);

            // token modifier
            int modifier = 0;
            if (token.Modifiers != null
                && token.Modifiers.Count > 0)
            {
                foreach (var mod in token.Modifiers)
                {
                    var modifierMask = _modifierToMask.TryGetValue(mod, out var tm) ? tm : 0;
                    modifier |= modifierMask;
                }
            }
            encoded.Add(modifier);

            prevToken = token;
        }

        return encoded.ToArray();
    }
}

/// <summary>
/// Information related to classification of semantic tokens.
/// </summary>
public record struct SemanticToken(
    int Line,
    int Character,
    int Length,
    string Type,
    ImmutableList<string>? Modifiers
    );
