// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Data;
using System.Runtime.Serialization;

namespace Kusto.Lsp;

/// <summary>
/// Serializable representation of a Kusto query execution result.
/// </summary>
[DataContract]
public class ResultData
{
    [DataMember(Name = "tables")]
    public required ImmutableList<ResultTable> Tables { get; init; }

    [DataMember(Name = "chartOptions")]
    public ChartOptions? ChartOptions { get; init; }

    /// <summary>
    /// Converts an <see cref="ExecuteResult"/> to a <see cref="ResultData"/>.
    /// </summary>
    /// <param name="executeResult">The query execution result to convert.</param>
    /// <param name="tableName">Optional table name to filter to a specific table.</param>
    /// <returns>The serializable result, or null if there are no tables.</returns>
    public static ResultData FromExecuteResult(ExecuteResult executeResult, string? tableName = null)
    {
        ImmutableList<ResultTable> resultTables = ImmutableList<ResultTable>.Empty;

        if (executeResult.Tables != null)
        {
            var tables = executeResult.Tables;

            // Filter to specific table if tableName is provided
            if (tableName != null)
            {
                tables = tables.Where(t => t.TableName == tableName).ToImmutableList();
            }

            resultTables = tables.Select(t => ResultTable.FromDataTable(t)).ToImmutableList();
        }

        return new ResultData
        {
            Tables = resultTables,
            ChartOptions = executeResult.ChartOptions
        };
    }

    /// <summary>
    /// Converts this <see cref="ResultData"/> back to an <see cref="ExecuteResult"/>.
    /// </summary>
    /// <returns>The execution result.</returns>
    public ExecuteResult ToExecuteResult()
    {
        var tables = Tables.Select(t => t.ToDataTable()).ToImmutableList();

        return new ExecuteResult
        {
            Tables = tables,
            ChartOptions = ChartOptions
        };
    }
}

/// <summary>
/// Serializable representation of a data table.
/// </summary>
[DataContract]
public class ResultTable
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "columns")]
    public required ImmutableList<ResultColumn> Columns { get; init; }

    [DataMember(Name = "rows")]
    public required ImmutableList<ImmutableList<object?>> Rows { get; init; }

    /// <summary>
    /// Converts a <see cref="DataTable"/> to a <see cref="ResultTable"/>.
    /// </summary>
    public static ResultTable FromDataTable(DataTable table)
    {
        var columns = table.Columns.OfType<DataColumn>()
            .Select(c => new ResultColumn
            {
                Name = c.ColumnName,
                Type = KustoGenerator.GetKustoSymbol(c.DataType).Name
            })
            .ToImmutableList();

        var rows = table.Rows.OfType<DataRow>()
            .Select(r => r.ItemArray.Select(ConvertCellValue).ToImmutableList())
            .ToImmutableList();

        return new ResultTable
        {
            Name = table.TableName,
            Columns = columns,
            Rows = rows
        };
    }

    /// <summary>
    /// Converts this <see cref="ResultTable"/> back to a <see cref="DataTable"/>.
    /// </summary>
    public DataTable ToDataTable()
    {
        var table = new DataTable(Name);

        // Add columns
        foreach (var col in Columns)
        {
            var clrType = GetClrTypeFromKustoType(col.Type);
            table.Columns.Add(col.Name, clrType);
        }

        // Add rows
        foreach (var row in Rows)
        {
            var values = row.Select((value, index) =>
                ConvertFromCellValue(value, Columns[index].Type)).ToArray();
            table.Rows.Add(values);
        }

        return table;
    }

    private static object? ConvertCellValue(object? value)
    {
        if (value == null || value == DBNull.Value)
            return null;

        // Convert to JSON-safe types
        return value switch
        {
            DateTime dt => dt.ToString("o"), // ISO 8601 format
            TimeSpan ts => ts.ToString("c"), // Constant format
            Guid g => g.ToString(),
            byte[] bytes => Convert.ToBase64String(bytes),
            _ => value
        };
    }

    private static Type GetClrTypeFromKustoType(string kustoType)
    {
        return kustoType switch
        {
            "bool" => typeof(bool),
            "int" => typeof(int),
            "long" => typeof(long),
            "real" => typeof(double),
            "decimal" => typeof(decimal),
            "string" => typeof(string),
            "datetime" => typeof(DateTime),
            "timespan" => typeof(TimeSpan),
            "guid" => typeof(Guid),
            "dynamic" => typeof(object),
            _ => typeof(string)
        };
    }

    private static object? ConvertFromCellValue(object? value, string kustoType)
    {
        if (value == null)
            return DBNull.Value;

        // Convert from JSON types back to CLR types
        return kustoType switch
        {
            "datetime" when value is string s => DateTime.Parse(s, null, System.Globalization.DateTimeStyles.RoundtripKind),
            "timespan" when value is string s => TimeSpan.Parse(s),
            "guid" when value is string s => Guid.Parse(s),
            "dynamic" when value is string s => s, // Keep as string for dynamic
            _ => value
        };
    }
}

/// <summary>
/// Serializable representation of a table column.
/// </summary>
[DataContract]
public class ResultColumn
{
    [DataMember(Name = "name")]
    public required string Name { get; init; }

    [DataMember(Name = "type")]
    public required string Type { get; init; }
}
