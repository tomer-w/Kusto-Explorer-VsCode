using System.Data;
using Kusto.Language;
using Kusto.Language.Symbols;

namespace Kusto.Lsp;

public static class KustoGenerator
{
    public static string GenerateTableStatement(DataTable table)
    {
        var tableExpression = GenerateTableExpression(table);
        return $"let {KustoFacts.BracketNameIfNecessary(table.TableName)} = {tableExpression};\n";
    }

    public static string GenerateTableExpression(DataTable table)
    {
        var schema = GenerateTableSchema(table);
        var rows = GenerateTableRows(table);
        return
            $$"""
            datatable {{schema}} {{rows}}
            """;           
    }

    public static string GenerateTableSchema(DataTable table)
    {
        var columnDecls = string.Join(", ", table.Columns.OfType<DataColumn>().Select(c => $"{KustoFacts.BracketNameIfNecessary(c.ColumnName)}: {GetKustoType(c.DataType)}"));
        return $"({columnDecls})";
    }

    public static string GenerateTableRows(DataTable table)
    {
        var rows = string.Join(",\n", table.Rows.OfType<DataRow>().Select(r => $"    {GenerateTableRow(r)}"));
        return
            $$"""
            [
            {{rows}}
            ]
            """;
    }

    public static string GenerateTableRow(DataRow row)
    {
        return string.Join(", ", row.Table.Columns.OfType<DataColumn>().Select(dc => GetKustoLiteral(row[dc], GetKustoSymbol(dc.DataType))));
    }

    private static string GetKustoLiteral(object? value, ScalarSymbol symbol)
    {
        var isNull = value == null || value == DBNull.Value;

        if (symbol == ScalarTypes.Bool)
        {
            return isNull ? "bool(null)" : value!.ToString()!;
        }
        else if (symbol == ScalarTypes.Long)
        {
            return isNull ? "long(null)" : value!.ToString()!;
        }
        else if (symbol == ScalarTypes.Real)
        {
            return isNull ? "real(null)" : Convert.ToDouble(value).ToString("0.0###############")!;
        }
        else if (symbol == ScalarTypes.Decimal)
        {
            return $"decimal({(isNull ? "null" : value!.ToString())})";
        }
        else if (symbol == ScalarTypes.Int)
        {
            return $"int({(isNull ? "null" : value!.ToString())})";
        }
        else if (symbol == ScalarTypes.DateTime)
        {
            return $"datatime({(isNull ? "null" : value!.ToString())})";
        }
        else if (symbol == ScalarTypes.TimeSpan)
        {
            return $"timespan({(isNull ? "null" : value!.ToString())})";
        }
        else if (symbol == ScalarTypes.Guid)
        {
            return $"guid({(isNull ? "null" : value!.ToString())})";
        }
        else if (symbol is DynamicSymbol)
        {
            if (isNull)
                return "dynamic(null)";
            var text = value is Newtonsoft.Json.Linq.JToken token
                ? token.ToString(Newtonsoft.Json.Formatting.None)
                : value?.ToString();
            return $"dynamic({text})";
        }
        else
        {
            if (isNull)
                return "''";
            return KustoFacts.GetStringLiteral(value!.ToString()!);
        }
    }

    private static ScalarSymbol GetKustoSymbol(Type type)
    {
        if (type.IsAssignableTo(typeof(Newtonsoft.Json.Linq.JToken)))
            return ScalarTypes.Dynamic;
        return ScalarTypes.GetSymbol(type.Name.ToLower()) is { } symbol ? symbol : ScalarTypes.Dynamic;
    }

    private static string GetKustoType(Type type)
    {
        return GetKustoSymbol(type).Name;
    }
}
