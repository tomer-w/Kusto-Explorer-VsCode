// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;

using Kusto.Language;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using Kusto.Language.Syntax;
using Kusto.Lsp;

namespace KustoLspTests;

using static TestHelpers;

[TestClass]
public class DeclarationFinderTests
{
    #region GetSourceLocations Tests

    [TestMethod]
    public void TestGetSourceLocations_SimpleVariable()
    {
        TestGetSourceLocations(
            """
            let x = 10;
            $x
            """,
            GlobalState.Default,
            [new DeclarationLocation { Range = new TextRange(4, 1) }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_Table()   
    {
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var globals = GlobalState.Default
            .WithDatabase(new DatabaseSymbol("db", table));

        TestGetSourceLocations(
            """
            MyTable | where $x > 10
            """,
            globals,
            [new DeclarationLocation { Entity = table }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_ColumnInFunction()
    {
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var function = new FunctionSymbol("MyFunction", "()", "{ MyTable | extend z=x+5 }");

        var globals = GlobalState.Default.WithDatabase(
            new DatabaseSymbol("db", 
                table,
                function
                ));

        TestGetSourceLocations(
            """
            MyFunction | where $z > 10
            """,
            globals,
            [new DeclarationLocation { Range = new TextRange(19, 1), Entity = function }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_ColumnFromTableInFunction()
    {
        // Tests that a column from a table referenced inside a function traces back to the table
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var function = new FunctionSymbol("MyFunction", "()", "{ MyTable }");

        var globals = GlobalState.Default.WithDatabase(
            new DatabaseSymbol("db",
                table,
                function
                ));

        TestGetSourceLocations(
            """
            MyFunction | where $x > 10
            """,
            globals,
            [new DeclarationLocation { Entity = table }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_NestedFunctionColumn()
    {
        // Tests column declared in a function that calls another function
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var innerFunction = new FunctionSymbol("InnerFunc", "()", "{ MyTable | extend z=x+1 }");
        var outerFunction = new FunctionSymbol("OuterFunc", "()", "{ InnerFunc | extend w=z+1 }");

        var globals = GlobalState.Default.WithDatabase(
            new DatabaseSymbol("db",
                table,
                innerFunction,
                outerFunction
                ));

        TestGetSourceLocations(
            """
            OuterFunc | where $w > 10
            """,
            globals,
            [new DeclarationLocation { Range = new TextRange(21, 1), Entity = outerFunction }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_FunctionParameter()
    {
        // Tests finding the declaration of a function parameter
        var function = new FunctionSymbol("MyFunction", "(val: long)", "{ print result=val }");

        var globals = GlobalState.Default.WithDatabase(
            new DatabaseSymbol("db", function));

        TestGetSourceLocations(
            """
            MyFunction(10) | project $result
            """,
            globals,
            [new DeclarationLocation { Range = new TextRange(8, 6), Entity = function }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_MultipleLetStatements()
    {
        // Tests that the correct variable is found when multiple let statements exist
        TestGetSourceLocations(
            """
            let a = 1;
            let b = 2;
            let c = 3;
            print $b
            """,
            GlobalState.Default,
            [new DeclarationLocation { Range = new TextRange(16, 1) }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_VariableReferencingVariable()
    {
        // Tests a variable that references another variable
        TestGetSourceLocations(
            """
            let x = 10;
            let y = x + 5;
            print $y
            """,
            GlobalState.Default,
            [new DeclarationLocation { Range = new TextRange(17, 1) }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_ProjectedColumn()
    {
        // Tests a column created via project
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var globals = GlobalState.Default
            .WithDatabase(new DatabaseSymbol("db", table));

        TestGetSourceLocations(
            """
            MyTable | project newcol = x | where $newcol > 10
            """,
            globals,
            [new DeclarationLocation { Range = new TextRange(18, 6) }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_ExtendedColumn()
    {
        // Tests a column created via extend
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var globals = GlobalState.Default
            .WithDatabase(new DatabaseSymbol("db", table));

        TestGetSourceLocations(
            """
            MyTable | extend computed = x * 2 | where $computed > 10
            """,
            globals,
            [new DeclarationLocation { Range = new TextRange(17, 8) }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_SummarizeColumn()
    {
        // Tests a column created via summarize
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var globals = GlobalState.Default
            .WithDatabase(new DatabaseSymbol("db", table));

        TestGetSourceLocations(
            """
            MyTable | summarize total = sum(x) | where $total > 10
            """,
            globals,
            [new DeclarationLocation { Range = new TextRange(20, 5) }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_DatabaseTable()
    {
        // Tests finding a database table reference
        var table = new TableSymbol("MyTable", "(x: long, y: string)");
        var globals = GlobalState.Default
            .WithDatabase(new DatabaseSymbol("db", table));

        TestGetSourceLocations(
            """
            $MyTable | take 10
            """,
            globals,
            [new DeclarationLocation { Entity = table }]
            );
    }

    [TestMethod]
    public void TestGetSourceLocations_DatabaseFunction()
    {
        // Tests finding a database function reference
        var function = new FunctionSymbol("MyFunction", "()", "{ print 1 }");
        var globals = GlobalState.Default
            .WithDatabase(new DatabaseSymbol("db", function));

        TestGetSourceLocations(
            """
            $MyFunction
            """,
            globals,
            [new DeclarationLocation { Entity = function }]
            );
    }

    private void TestGetSourceLocations(string queryWithMarker, GlobalState globals, ImmutableList<DeclarationLocation> expected)
    {
        var (query, position) = TestHelpers.ExtractPosition(queryWithMarker);
        var code = KustoCode.ParseAndAnalyze(query, globals);
        var symbol = GetSymbolAt(code, position);
        Assert.IsNotNull(symbol, "Expected to find a symbol at the marker position.");
        var actual = DeclarationFinder.GetSourceDeclarations(globals, code.Syntax, symbol);
        Assert.HasCount(expected.Count, actual);
        for (int i = 0; i < expected.Count; i++)
        {
            AssertAreEqual(expected[i].Range, actual[i].Range);
            Assert.AreEqual(expected[i].Entity?.Name, actual[i].Entity?.Name, "location entity");
        }
    }

    #endregion

    #region TryGetLocalDeclaration Tests

    [TestMethod]
    public void TestTryGetLocalDeclaration_VariableFound()
    {
        var code = KustoCode.ParseAndAnalyze("let x = 10; x", GlobalState.Default);
        var symbol = GetReferencedSymbol(code, "x");
        Assert.IsNotNull(symbol);

        var found = DeclarationFinder.TryGetLocalDeclaration(code.Syntax, symbol, out var declaration);

        Assert.IsTrue(found);
        Assert.IsNotNull(declaration);
        Assert.AreEqual("x", ((NameDeclaration)declaration).SimpleName);
    }

    [TestMethod]
    public void TestTryGetLocalDeclaration_NotFound()
    {
        var table = new TableSymbol("MyTable", "(x: long)");
        var globals = GlobalState.Default.WithDatabase(new DatabaseSymbol("db", table));
        var code = KustoCode.ParseAndAnalyze("MyTable", globals);

        // Table symbol won't have a local declaration
        var found = DeclarationFinder.TryGetLocalDeclaration(code.Syntax, table, out var declaration);

        Assert.IsFalse(found);
        Assert.IsNull(declaration);
    }

    #endregion

    #region GetLocalDeclarations Tests

    [TestMethod]
    public void TestGetLocalDeclarations_SingleDeclaration()
    {
        var declarations = DeclarationFinder.GetLocalDeclarations(
            "let x = 10; x",
            GlobalState.Default,
            "x");

        Assert.HasCount(1, declarations);
    }

    [TestMethod]
    public void TestGetLocalDeclarations_MultipleDeclarations()
    {
        // Multiple queries with same variable name
        var declarations = DeclarationFinder.GetLocalDeclarations(
            """
            let x = 10;
            x;
            let x = 20;
            x
            """,
            GlobalState.Default,
            "x");

        Assert.HasCount(2, declarations);
    }

    [TestMethod]
    public void TestGetLocalDeclarations_NoDeclarations()
    {
        var declarations = DeclarationFinder.GetLocalDeclarations(
            "print 1",
            GlobalState.Default,
            "nonexistent");

        Assert.HasCount(0, declarations);
    }

    [TestMethod]
    public void TestGetLocalDeclarations_ExtendColumn()
    {
        var table = new TableSymbol("MyTable", "(x: long)");
        var globals = GlobalState.Default.WithDatabase(new DatabaseSymbol("db", table));

        var declarations = DeclarationFinder.GetLocalDeclarations(
            "MyTable | extend computed = x * 2",
            globals,
            "computed");

        Assert.HasCount(1, declarations);
    }

    #endregion
}
