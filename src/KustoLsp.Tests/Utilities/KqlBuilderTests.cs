// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Kusto.Lsp;
using Kusto.Language.Editor;
using Kusto.Language.Symbols;
using System.Linq;
using System.Collections.Generic;
using System.Collections.Immutable;

namespace KustoLspTests;

[TestClass]
public class KqlBuilderTests
{
    [TestMethod]
    public void TestTable()
    {
        TestTable(
            new TableSymbol("TestTable", "(x: long, y: string)").ToInfo(),
            FormattingOptions.Default,
            """
            .create-merge table TestTable
            (
                x: long,
                y: string
            )

            """);

        TestTable(
            new TableSymbol("TestTable", "(x: long, y: string)").ToInfo(),
            FormattingOptions.Default.WithSchemaStyle(BrackettingStyle.Diagonal),
            """
            .create-merge table TestTable (
                x: long,
                y: string
            )

            """);

        TestTable(
            new TableSymbol("TestTable", "(x: long, y: string)", "description").ToInfo(),
            FormattingOptions.Default,
            """
            .create-merge table TestTable
            (
                x: long,
                y: string
            )
            with
            (
                docstring='description'
            )

            """);

        TestTable(
            new TableSymbol("TestTable", "(x: long, y: string)", "description").ToInfo(),
            FormattingOptions.Default.WithBrackettingStyle(BrackettingStyle.Diagonal),
            """
            .create-merge table TestTable
            (
                x: long,
                y: string
            )
            with (
                docstring='description'
            )

            """);
    }

    private void TestTable(TableInfo info, FormattingOptions options, string expected)
    {
        var builder = new KqlBuilder(options);
        builder.WriteCreateTableCommand(info);
        var actual = builder.Text;
        TestHelpers.AssertTextEqual(expected, actual);
    }

    [TestMethod]
    public void TestExternalTable()
    {
        TestExternalTable(
            new ExternalTableInfoEx
            {
                Name = "TestExternalTable",
                Columns = ToInfo("(x: long, y: string)"),
                Type = "Blob",
                ConnectionStrings = ["some_connection"],
                Properties = Properties(("Format", "Csv")),
                Partitions = 
                [
                    new ExternalTablePartition
                    {
                        Name = "Partition1",
                        Function = "Bin",
                        ColumnName = "abc",
                        PartitionBy = "1day",
                        Ordinal = 0
                    }
                ],
                PathFormat = "Some_Format"
            },
            FormattingOptions.Default,
            """"
            .create-or-alter external table TestExternalTable
            (
                x: long,
                y: string
            )
            kind = blob
            partition by (Partition1: datetime = bin(abc, timespan(1day)))
            pathformat = (Some_Format)
            dataformat = csv
            (
                'some_connection'
            )

            """");

        // different format
        TestExternalTable(
            new ExternalTableInfoEx
            {
                Name = "Test External Table",
                Columns = ToInfo("(x: long, y: string)"),
                Type = "Blob",
                ConnectionStrings = ["some_connection"],
                Properties = Properties(("Format", "fake_format")),
            },
            FormattingOptions.Default,
            """"
            .create-or-alter external table ['Test External Table']
            (
                x: long,
                y: string
            )
            kind = blob
            dataformat = fake_format
            (
                'some_connection'
            )

            """");

        // different type
        TestExternalTable(
            new ExternalTableInfoEx
            {
                Name = "Test External Table",
                Columns = ToInfo("(x: long, y: string)"),
                Type = "Sql",
                ConnectionStrings = ["some_connection"],
            },
            FormattingOptions.Default,
            """"
            .create-or-alter external table ['Test External Table']
            (
                x: long,
                y: string
            )
            kind = sql
            ('some_connection')

            """");
    }

    private void TestExternalTable(ExternalTableInfoEx info, FormattingOptions options, string expected)
    {
        var builder = new KqlBuilder(options);
        builder.WriteCreateExternalTableCommand(info);
        var actual = builder.Text;
        TestHelpers.AssertTextEqual(expected, actual);
    }

    [TestMethod]
    public void TestMaterializedView()
    {
        TestMaterializedView(
            new MaterializedViewInfo
            {
                Name = "MyView",
                Source = "MyTable",
                Query = "MyTable | where a > y",
                Columns = ToInfo("(x: long, y: string)"),
            },
            FormattingOptions.Default,
            """
            .create-or-alter materialized-view MyView on table MyTable
            {
                MyTable | where a > y
            }

            """
            );
    }

    private void TestMaterializedView(MaterializedViewInfo info, FormattingOptions options, string expected)
    {
        var builder = new KqlBuilder(options);
        builder.WriteCreateMaterializedViewCommand(info);
        var actual = builder.Text;
        TestHelpers.AssertTextEqual(expected, actual);
    }

    [TestMethod]
    public void TestFunction()
    {
        TestFunction(
            new FunctionInfo
            {
                Name = "TestFunction",
                Parameters = "(x: int, y: string)",
                Body =
                """
                T | where a > b
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter function TestFunction (x: int, y: string)
            {
                T | where a > b
            }

            """
            );

        TestFunction(
            new FunctionInfo
            {
                Name = "TestFunction",
                Parameters = "(x: int, y: string)",
                Body =
                """
                T | where a > b
                """,
                Folder = "folder",
                Description = "description"
            },
            FormattingOptions.Default,
            """
            .create-or-alter function
                with
                (
                    folder='folder',
                    docstring='description'
                )
            TestFunction (x: int, y: string)
            {
                T | where a > b
            }

            """
            );

        // no parameters
        TestFunction(
            new FunctionInfo
            {
                Name = "TestFunction",
                Parameters = "()",
                Body =
                """
                T | where a > b
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter function TestFunction ()
            {
                T | where a > b
            }

            """
            );

        // includes braces
        TestFunction(
            new FunctionInfo
            {
                Name = "TestFunction",
                Parameters = "()",
                Body =
                """
                { T | where a > b }
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter function TestFunction ()
            { T | where a > b }

            """
            );

        // lots of parameters
        TestFunction(
            new FunctionInfo
            {
                Name = "TestFunction",
                Parameters = "(a: long, b: long, c: long, d: long, e: long, f: long)",
                Body =
                """
                { T | where a > b }
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter function TestFunction
            (
                a: long,
                b: long,
                c: long,
                d: long,
                e: long,
                f: long
            )
            { T | where a > b }

            """
            );
    }

    private void TestFunction(FunctionInfo info, FormattingOptions options, string expected)
    {
        var builder = new KqlBuilder(options);
        builder.WriteCreateFunctionCommand(info);
        var actual = builder.Text;
        TestHelpers.AssertTextEqual(expected, actual);
    }

    [TestMethod]
    public void TestEntityGroup()
    {
        TestEntityGroup(
            new EntityGroupInfo
            {
                Name = "TestEntityGroup",
                Entities = [
                    "cluster('abc').database('db123')",
                    "cluster('efg').database('db123')"
                    ]
            },
            FormattingOptions.Default,
            """
            .create-or-alter entity_group TestEntityGroup
            (
                cluster('abc').database('db123'),
                cluster('efg').database('db123')
            )

            """
            );
    }

    private void TestEntityGroup(EntityGroupInfo info, FormattingOptions options, string expected)
    {
        var builder = new KqlBuilder(options);
        builder.WriteCreateEntityGroupCommand(info);
        var actual = builder.Text;
        TestHelpers.AssertTextEqual(expected, actual);
    }

    [TestMethod]
    public void TestGraphModel()
    {
        TestGraphModel(
            new GraphModelInfo
            {
                Name = "TestGraphModel",
                Model = 
                """
                {
                    // crazy JSON
                }
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter graph_model TestGraphModel
            ```
            {
                // crazy JSON
            }
            ```

            """
            );

        TestGraphModel(
            new GraphModelInfo
            {
                Name = "TestGraphModel",
                Model =
                """
                {
                    // crazy JSON with ```
                }
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter graph_model TestGraphModel
            ~~~
            {
                // crazy JSON with ```
            }
            ~~~

            """
            );

        TestGraphModel(
            new GraphModelInfo
            {
                Name = "TestGraphModel",
                Model =
                """
                both ``` and ~~~
                """
            },
            FormattingOptions.Default,
            """
            .create-or-alter graph_model TestGraphModel
            'both ``` and ~~~'

            """
            );
    }

    private void TestGraphModel(GraphModelInfo info, FormattingOptions options, string expected)
    {
        var builder = new KqlBuilder(options);
        builder.WriteCreateGraphModelCommand(info);
        var actual = builder.Text;
        TestHelpers.AssertTextEqual(expected, actual);
    }

    public static ImmutableList<ColumnInfo> ToInfo(string columns) =>
        TableSymbol.From(columns).Columns.ToInfo();

    public static ImmutableDictionary<string, object> Properties(params (string name, object value)[] pairs)
    {
        return pairs.ToImmutableDictionary(p => p.name, p => p.value);
    }
}

public static class SymbolInfoExtensions
{
    public static TableInfo ToInfo(this TableSymbol symbol) =>
        new TableInfo { Name = symbol.Name, Columns = symbol.Columns.ToInfo(), Description = symbol.Description };

    public static ImmutableList<ColumnInfo> ToInfo(this IEnumerable<ColumnSymbol> columns) =>
        columns.Select(c => c.ToInfo()).ToImmutableList();

    public static ColumnInfo ToInfo(this ColumnSymbol symbol) =>
        new ColumnInfo { Name = symbol.Name, Type = symbol.Type.Name };
}