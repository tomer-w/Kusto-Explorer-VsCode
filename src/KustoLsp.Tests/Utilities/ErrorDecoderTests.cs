// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Data.Exceptions;
using Kusto.Lsp;
using Kusto.Language;
using Kusto.Language.Editor;

namespace KustoLspTests;

using static TestHelpers;

[TestClass]
public class ErrorDecoderTests
{
    #region SyntaxException Tests

    [TestMethod]
    public void TestGetDiagnostic_SyntaxException()
    {
        TestGetDiagnostic(
            "T | were x > y",
            new SyntaxException("Bad Syntax", null)
            {
                ErrorCode = "SYNTAX_ERROR", 
                Line = 1,
                CharacterPositionInLine = 5,
                Token = "were"
            },
            new Diagnostic("SYNTAX_ERROR", "Bad Syntax").WithLocation(4, 4)
            );
    }

    [TestMethod]
    public void TestGetDiagnostic_SyntaxException_WithLeadingCommentRemoved()
    {
        // Simulates a query where a leading comment was removed before sending to server
        // Original: "// comment\nT | were x > y"
        // Sent:     "T | were x > y"
        var original = "// comment\nT | were x > y";
        var modified = "T | were x > y";
        var query = new EditString(original).ReplaceAt(0, "// comment\n".Length, "");

        Assert.AreEqual(modified, query.CurrentText);

        var error = new SyntaxException("Bad Syntax", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = 1,
            CharacterPositionInLine = 5,
            Token = "were"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        // Position should be mapped back to original text (after the comment)
        Assert.AreEqual("SYNTAX_ERROR", diagnostic.Code);
        Assert.AreEqual(15, diagnostic.Start); // "// comment\n" (11) + "T | " (4) = 15
        Assert.AreEqual(4, diagnostic.Length); // "were"
    }

    [TestMethod]
    public void TestGetDiagnostic_SyntaxException_MultiLineQuery()
    {
        // Error on second line
        var query = new EditString("T\n| were x > y");
        var error = new SyntaxException("Bad Syntax", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = 2,
            CharacterPositionInLine = 3,
            Token = "were"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual("SYNTAX_ERROR", diagnostic.Code);
        Assert.AreEqual(4, diagnostic.Start); // "T\n| " = 4
        Assert.AreEqual(4, diagnostic.Length);
    }

    [TestMethod]
    public void TestGetDiagnostic_SyntaxException_WithMultipleLeadingLinesRemoved()
    {
        // Original has multiple comment lines removed
        var original = "// line 1\n// line 2\nT | were x > y";
        var query = new EditString(original).ReplaceAt(0, "// line 1\n// line 2\n".Length, "");

        var error = new SyntaxException("Bad Syntax", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = 1,
            CharacterPositionInLine = 5,
            Token = "were"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        // Should map back to position in original text
        Assert.AreEqual(24, diagnostic.Start); // "// line 1\n// line 2\n" (20) + "T | " (4) = 24
    }

    [TestMethod]
    public void TestGetDiagnostic_SyntaxException_NoLineInfo_UsesTokenSearch()
    {
        // When line/position info is missing, ErrorDecoder tries to find the token
        var query = new EditString("T | were x > y");
        var error = new SyntaxException("Syntax error at token: 'were' [line:position=1:5]", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = -1,
            CharacterPositionInLine = -1,
            Token = "were"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual("SYNTAX_ERROR", diagnostic.Code);
        // Should find "were" in the query
        Assert.AreEqual(4, diagnostic.Start);
    }

    #endregion

    #region Semantic Exception Tests

    [TestMethod]
    public void TestGetDiagnostic_SemanticException_UnresolvedEntity()
    {
        var query = new EditString("UnknownTable | take 10");
        var error = new RelopSemanticException("Failed to resolve entity 'UnknownTable'", null)
        {
            ErrorCode = "SEMANTIC_ERROR"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual("SEMANTIC_ERROR", diagnostic.Code);
        // Should find "UnknownTable" in the query
        Assert.AreEqual(0, diagnostic.Start);
    }

    [TestMethod]
    public void TestGetDiagnostic_SemanticException_WithEditedQuery()
    {
        // Original: "// find unknown\nUnknownTable | take 10"
        var original = "// find unknown\nUnknownTable | take 10";
        var query = new EditString(original).ReplaceAt(0, "// find unknown\n".Length, "");

        var error = new RelopSemanticException("Failed to resolve entity 'UnknownTable'", null)
        {
            ErrorCode = "SEMANTIC_ERROR"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual("SEMANTIC_ERROR", diagnostic.Code);
        // Position should map to original (after comment)
        Assert.AreEqual(16, diagnostic.Start);
    }

    #endregion

    #region KustoBadRequestException Tests

    [TestMethod]
    public void TestGetDiagnostic_GenericException_SpansWholeQuery()
    {
        // Without position info, should span the whole query
        var query = new EditString("InvalidQuery");
        var error = new Exception("Bad request");

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual(0, diagnostic.Start);
        Assert.AreEqual(query.CurrentText.Length, diagnostic.Length);
    }

    [TestMethod]
    public void TestGetDiagnostic_GenericException_WithEditedQuery_SpansOriginalRange()
    {
        // When there's no position info and query was edited, 
        // diagnostic should span the original query portion (not the removed parts)
        var original = "// comment\nInvalidQuery";
        var query = new EditString(original).ReplaceAt(0, "// comment\n".Length, "");

        var error = new Exception("Bad request");

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        // Should span from the start of the actual query content in original
        Assert.AreEqual(11, diagnostic.Start); // After "// comment\n"
        Assert.AreEqual("InvalidQuery".Length, diagnostic.Length);
    }

    #endregion

    #region EditString Position Mapping Tests

    [TestMethod]
    public void TestGetDiagnostic_EditString_MiddlePortionRemoved()
    {
        // Test case where something in the middle was removed/replaced
        // Original: "T | /* comment */ where x > 10"
        // Sent:     "T |  where x > 10"
        var original = "T | /* comment */ where x > 10";
        var query = new EditString(original).ReplaceAt(4, "/* comment */".Length, "");

        var error = new SyntaxException("Bad Syntax", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = 1,
            CharacterPositionInLine = 6, // Position of "where" in modified query
            Token = "where"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        // Should map back to "where" in original text
        Assert.AreEqual(18, diagnostic.Start); // After "T | /* comment */ "
    }

    [TestMethod]
    public void TestGetDiagnostic_EditString_ErrorAtEndOfQuery()
    {
        // Error at the very end of query
        var query = new EditString("T | take");
        var error = new SyntaxException("Unexpected end of query", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = 1,
            CharacterPositionInLine = 9, // Past end of query
            Token = null
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual("SYNTAX_ERROR", diagnostic.Code);
        // Should handle gracefully without throwing
    }

    [TestMethod]
    public void TestGetDiagnostic_EditString_MultipleEdits()
    {
        // Multiple edits applied to original
        var original = "// header\nT | where /* filter */ x > 10";
        var query = new EditString(original)
            .ReplaceAt(0, "// header\n".Length, "")
            .ReplaceAt(10, "/* filter */ ".Length, ""); // Position adjusted for first edit

        // After edits: "T | where x > 10"
        Assert.AreEqual("T | where x > 10", query.CurrentText);

        var error = new SyntaxException("Bad Syntax", null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = 1,
            CharacterPositionInLine = 11, // Position of "x" in modified query
            Token = "x"
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        // "x" should map back to original position
        Assert.AreEqual(33, diagnostic.Start); // "// header\nT | where /* filter */ " = 33
    }

    #endregion

    #region Error Message Parsing Tests

    [TestMethod]
    public void TestGetDiagnostic_ParsesLinePositionFromMessage()
    {
        // Some exceptions embed line:position in the message itself
        var query = new EditString("T | were x > y");
        var error = new SyntaxException(
            "Syntax error: Command could not be parsed: at token: 'were' [line:position=1:5]", 
            null)
        {
            ErrorCode = "SYNTAX_ERROR",
            Line = -1,
            CharacterPositionInLine = -1
        };

        var diagnostic = ErrorDecoder.GetDiagnostic(error, query);

        Assert.AreEqual("SYNTAX_ERROR", diagnostic.Code);
        Assert.AreEqual(4, diagnostic.Start);
        Assert.AreEqual(4, diagnostic.Length); // "were"
    }

    #endregion

    private void TestGetDiagnostic(EditString query, Exception error, Diagnostic expected)
    {
        var actual = ErrorDecoder.GetDiagnostic(error, query);
        AssertAreEqual(expected, actual);
    }
}
