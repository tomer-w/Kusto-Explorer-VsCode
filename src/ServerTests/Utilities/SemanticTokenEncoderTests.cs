// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using Lsp.Common;

namespace Tests.Utilities;

[TestClass]
public class SemanticTokenEncoderTests
{
    private static readonly ImmutableList<string> TokenTypes =
        ["keyword", "variable", "function", "string", "number"];

    private static readonly ImmutableList<string> TokenModifiers =
        ["declaration", "readonly", "static"];

    [TestMethod]
    public void Encode_EmptyInput_ReturnsEmptyArray()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);

        var result = encoder.Encode([]);

        Assert.AreEqual(0, result.Length);
    }

    [TestMethod]
    public void Encode_SingleToken_ReturnsAbsolutePosition()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        var tokens = new[]
        {
            new SemanticToken(2, 5, 3, "variable", null)
        };

        var result = encoder.Encode(tokens);

        // [line, char, length, type, modifiers]
        Assert.AreEqual(5, result.Length);
        Assert.AreEqual(2, result[0]); // absolute line
        Assert.AreEqual(5, result[1]); // absolute char
        Assert.AreEqual(3, result[2]); // length
        Assert.AreEqual(1, result[3]); // "variable" is index 1
        Assert.AreEqual(0, result[4]); // no modifiers
    }

    [TestMethod]
    public void Encode_TwoTokensSameLine_UsesDeltaEncoding()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        var tokens = new[]
        {
            new SemanticToken(0, 0, 3, "keyword", null),
            new SemanticToken(0, 4, 5, "variable", null)
        };

        var result = encoder.Encode(tokens);

        Assert.AreEqual(10, result.Length);

        // First token: absolute
        Assert.AreEqual(0, result[0]); // line
        Assert.AreEqual(0, result[1]); // char
        Assert.AreEqual(3, result[2]); // length
        Assert.AreEqual(0, result[3]); // "keyword" = index 0
        Assert.AreEqual(0, result[4]); // no modifiers

        // Second token: delta on same line
        Assert.AreEqual(0, result[5]); // delta line = 0
        Assert.AreEqual(4, result[6]); // delta char = 4 - 0
        Assert.AreEqual(5, result[7]); // length
        Assert.AreEqual(1, result[8]); // "variable" = index 1
        Assert.AreEqual(0, result[9]); // no modifiers
    }

    [TestMethod]
    public void Encode_TwoTokensDifferentLines_UsesDeltaLineAbsoluteChar()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        var tokens = new[]
        {
            new SemanticToken(1, 10, 3, "keyword", null),
            new SemanticToken(3, 5, 4, "function", null)
        };

        var result = encoder.Encode(tokens);

        Assert.AreEqual(10, result.Length);

        // First token: absolute
        Assert.AreEqual(1, result[0]); // line
        Assert.AreEqual(10, result[1]); // char

        // Second token: delta line, absolute char on new line
        Assert.AreEqual(2, result[5]); // delta line = 3 - 1
        Assert.AreEqual(5, result[6]); // absolute char on new line
    }

    [TestMethod]
    public void Encode_TokenModifiers_ProducesBitmask()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        // "declaration" = bit 0 (mask 1), "readonly" = bit 1 (mask 2), "static" = bit 2 (mask 4)
        var tokens = new[]
        {
            new SemanticToken(0, 0, 5, "variable", ImmutableList.Create("declaration", "static"))
        };

        var result = encoder.Encode(tokens);

        Assert.AreEqual(5, result.Length);
        Assert.AreEqual(5, result[4]); // declaration(1) | static(4) = 5
    }

    [TestMethod]
    public void Encode_UnknownTokenType_DefaultsToZero()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        var tokens = new[]
        {
            new SemanticToken(0, 0, 3, "unknown_type", null)
        };

        var result = encoder.Encode(tokens);

        Assert.AreEqual(0, result[3]); // unknown type falls back to 0
    }

    [TestMethod]
    public void Encode_UnknownModifier_IgnoredInBitmask()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        var tokens = new[]
        {
            new SemanticToken(0, 0, 3, "keyword", ImmutableList.Create("declaration", "nonexistent"))
        };

        var result = encoder.Encode(tokens);

        Assert.AreEqual(1, result[4]); // only "declaration" (mask 1); "nonexistent" contributes 0
    }

    [TestMethod]
    public void Encode_MultipleTokensAcrossLines_FullEncoding()
    {
        var encoder = new SemanticTokenEncoder(TokenTypes, TokenModifiers);
        var tokens = new[]
        {
            new SemanticToken(0, 0, 3, "keyword", null),    // let
            new SemanticToken(0, 4, 1, "variable", ImmutableList.Create("declaration")),  // x
            new SemanticToken(1, 4, 5, "number", null),      // 12345
        };

        var result = encoder.Encode(tokens);

        Assert.AreEqual(15, result.Length);

        // Token 1: line=0, char=0, len=3, type=keyword(0), mod=0
        Assert.AreEqual(0, result[0]);
        Assert.AreEqual(0, result[1]);
        Assert.AreEqual(3, result[2]);
        Assert.AreEqual(0, result[3]);
        Assert.AreEqual(0, result[4]);

        // Token 2: dLine=0, dChar=4, len=1, type=variable(1), mod=declaration(1)
        Assert.AreEqual(0, result[5]);
        Assert.AreEqual(4, result[6]);
        Assert.AreEqual(1, result[7]);
        Assert.AreEqual(1, result[8]);
        Assert.AreEqual(1, result[9]);

        // Token 3: dLine=1, char=4(absolute), len=5, type=number(4), mod=0
        Assert.AreEqual(1, result[10]);
        Assert.AreEqual(4, result[11]);
        Assert.AreEqual(5, result[12]);
        Assert.AreEqual(4, result[13]);
        Assert.AreEqual(0, result[14]);
    }
}
