// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Data;
using Kusto.Language;
using Kusto.Language.Symbols;

namespace Kusto.Vscode;

public static class KustoGenerator
{
    public static string GenerateDataTableExpression(DataTable table)
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
        return string.Join(", ", row.Table.Columns.OfType<DataColumn>().Select(dc => GetLiteral(row[dc], GetKustoSymbol(dc.DataType))));
    }

    public static string GetLiteral(object value) =>
        GetLiteral(value, value.GetType());

    public static string GetLiteral(object? value, Type type) =>
        GetLiteral(value, GetKustoSymbol(type));

    public static string GetLiteral(object? value, ScalarSymbol symbol)
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
            if (isNull)
                return "datetime(null)";
            var dt = Convert.ToDateTime(value).ToUniversalTime();
            return $"datetime({dt:o})";
        }
        else if (symbol == ScalarTypes.TimeSpan)
        {
            if (isNull)
                return "timespan(null)";
            var ts = (TimeSpan)value!;
            return $"timespan({ts:c})"; 
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

    public static ScalarSymbol GetKustoSymbol(Type type)
    {
        // ignore through Nullable<T>
        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>))
            type = type.GetGenericArguments()[0];

        // handle types expected from kusto query results
        return Type.GetTypeCode(type) switch
        {
            TypeCode.Boolean => ScalarTypes.Bool,
            TypeCode.SByte => ScalarTypes.Bool,
            TypeCode.Byte => ScalarTypes.Bool,
            TypeCode.Int16 => ScalarTypes.Int,
            TypeCode.UInt16 => ScalarTypes.Int,
            TypeCode.Int32 => ScalarTypes.Int,
            TypeCode.UInt32 => ScalarTypes.Long,
            TypeCode.Int64 => ScalarTypes.Long,
            TypeCode.UInt64 => ScalarTypes.Decimal,
            TypeCode.Single => ScalarTypes.Real,
            TypeCode.Double => ScalarTypes.Real,
            TypeCode.Decimal => ScalarTypes.Decimal,
            TypeCode.String => ScalarTypes.String,
            TypeCode.DateTime => ScalarTypes.DateTime,
            _ =>
                type == typeof(TimeSpan) ? ScalarTypes.TimeSpan
                : type == typeof(Guid) ? ScalarTypes.Guid
                : type == typeof(System.Data.SqlTypes.SqlDecimal) ? ScalarTypes.Decimal
                : type == typeof(object) ? ScalarTypes.Dynamic
                : ScalarTypes.String // catch all
        }; 
    }

    private static string GetKustoType(Type type)
    {
        return GetKustoSymbol(type).Name;
    }
}
