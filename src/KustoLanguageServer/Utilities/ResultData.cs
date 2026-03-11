// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Data;
using System.Runtime.Serialization;
using Kusto.Data.Utils;

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

        ChartOptions? chartOptions = null;
        if (executeResult.ChartOptions != null
            && executeResult.ChartOptions.Visualization != VisualizationKind.None)
        {
            chartOptions = ChartOptions.FromChartVisualizationOptions(executeResult.ChartOptions);
        }

        return new ResultData
        {
            Tables = resultTables,
            ChartOptions = chartOptions
        };
    }

    /// <summary>
    /// Converts this <see cref="ResultData"/> back to an <see cref="ExecuteResult"/>.
    /// </summary>
    /// <returns>The execution result.</returns>
    public ExecuteResult ToExecuteResult()
    {
        var tables = Tables.Select(t => t.ToDataTable()).ToImmutableList();

        ChartVisualizationOptions? chartOptions = null;
        if (ChartOptions != null)
        {
            chartOptions = ChartOptions.ToChartVisualizationOptions();
        }

        return new ExecuteResult
        {
            Tables = tables,
            ChartOptions = chartOptions
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

/// <summary>
/// Serializable representation of chart visualization options.
/// </summary>
[DataContract]
public class ChartOptions
{
    [DataMember(Name = "kind")]
    public required string Kind { get; init; }

    [DataMember(Name = "mode")]
    public string? Mode { get; init; }

    [DataMember(Name = "title")]
    public string? Title { get; init; }

    [DataMember(Name = "xTitle")]
    public string? XTitle { get; init; }

    [DataMember(Name = "yTitle")]
    public string? YTitle { get; init; }

    [DataMember(Name = "xColumn")]
    public string? XColumn { get; init; }

    [DataMember(Name = "yColumns")]
    public ImmutableList<string>? YColumns { get; init; }

    [DataMember(Name = "series")]
    public ImmutableList<string>? Series { get; init; }

    [DataMember(Name = "legend")]
    public string? Legend { get; init; }

    [DataMember(Name = "xAxis")]
    public string? XAxis { get; init; }

    [DataMember(Name = "yAxis")]
    public string? YAxis { get; init; }

    [DataMember(Name = "xmin")]
    public object? Xmin { get; init; }

    [DataMember(Name = "xmax")]
    public object? Xmax { get; init; }

    [DataMember(Name = "ymin")]
    public object? Ymin { get; init; }

    [DataMember(Name = "ymax")]
    public object? Ymax { get; init; }

    [DataMember(Name = "accumulate")]
    public bool Accumulate { get; init; }

    /// <summary>
    /// Converts a <see cref="ChartVisualizationOptions"/> to a <see cref="ChartOptions"/>.
    /// </summary>
    public static ChartOptions FromChartVisualizationOptions(ChartVisualizationOptions options)
    {
        return new ChartOptions
        {
            Kind = options.Visualization.ToString(),
            Mode = options.Mode.ToString(),
            Title = options.Title,
            XTitle = options.XTitle,
            YTitle = options.YTitle,
            XColumn = options.XColumn,
            YColumns = options.YColumns?.ToImmutableList(),
            Series = options.Series?.ToImmutableList(),
            Legend = options.Legend.ToString(),
            XAxis = options.XAxis.ToString(),
            YAxis = options.YAxis.ToString(),
            Xmin = options.Xmin,
            Xmax = options.Xmax,
            Ymin = options.Ymin,
            Ymax = options.Ymax,
            Accumulate = options.Accumulate
        };
    }

    /// <summary>
    /// Converts this <see cref="ChartOptions"/> back to a <see cref="ChartVisualizationOptions"/>.
    /// </summary>
    public ChartVisualizationOptions ToChartVisualizationOptions()
    {
        return new ChartVisualizationOptions
        {
            Visualization = Enum.TryParse<VisualizationKind>(Kind, out var viz) ? viz : VisualizationKind.None,
            Mode = Enum.TryParse<VisualizationMode>(Mode, out var mode) ? mode : default,
            Title = Title,
            XTitle = XTitle,
            YTitle = YTitle,
            XColumn = XColumn,
            YColumns = YColumns?.ToArray(),
            Series = Series?.ToArray(),
            Legend = Enum.TryParse<LegendVisualizationMode>(Legend, out var legend) ? legend : default,
            XAxis = Enum.TryParse<AxisVisualizationMode>(XAxis, out var xAxis) ? xAxis : default,
            YAxis = Enum.TryParse<AxisVisualizationMode>(YAxis, out var yAxis) ? yAxis : default,
            Xmin = Xmin,
            Xmax = Xmax,
            Ymin = ConvertToDouble(Ymin),
            Ymax = ConvertToDouble(Ymax),
            Accumulate = Accumulate
        };
    }

    private static double ConvertToDouble(object? value)
    {
        if (value == null)
            return 0;
        return Convert.ToDouble(value);
    }
}
