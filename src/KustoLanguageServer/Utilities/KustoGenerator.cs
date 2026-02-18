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
            datatable {{schema}} 
            [
            {{rows}}
            ]           
            """;           
    }

    public static string GenerateTableSchema(DataTable table)
    {
        return $"({table.Columns.OfType<DataColumn>().Select(c => $"{KustoFacts.BracketNameIfNecessary(c.ColumnName)}: {GetKustoType(c.DataType)}")})";
    }

    public static string GenerateTableRows(DataTable table)
    {
        return string.Join("\n", table.Rows.OfType<DataRow>().Select(r => $"    {GenerateTableRow(r)}"));
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
            return $"int({(isNull ? "null" : symbol!.ToString())})";
        }
        else if (symbol == ScalarTypes.DateTime)
        {
            return $"datatime({(isNull ? "null" : symbol!.ToString())})";
        }
        else if (symbol == ScalarTypes.TimeSpan)
        {
            return $"timespan({(isNull ? "null" : symbol!.ToString())})";
        }
        else if (symbol == ScalarTypes.Guid)
        {
            return $"guid({(isNull ? "null" : symbol!.ToString())})";
        }
        else if (symbol is DynamicSymbol)
        {
            return $"dynamic({(isNull ? "null" : symbol!.ToString())})";
        }
        else
        {
            if (isNull)
                return "''";
            return KustoFacts.GetSingleQuotedStringLiteral(value!.ToString()!);
        }
    }

    private static ScalarSymbol GetKustoSymbol(Type type)
    {
        return ScalarTypes.GetSymbol(type.Name) is { } symbol ? symbol : ScalarTypes.Dynamic;
    }

    private static string GetKustoType(Type type)
    {
        return GetKustoSymbol(type).Name;
    }
}
