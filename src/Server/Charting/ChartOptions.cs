// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Runtime.Serialization;
using Kusto.Data.Utils;

namespace Kusto.Vscode;

/// <summary>
/// Serializable representation of chart visualization options.
/// </summary>
[DataContract]
public class ChartOptions
{
    /// <summary>
    /// Chart type. Use <see cref="ChartType"/> constants (e.g., "LineChart", "BarChart", "PieChart", "ScatterChart").
    /// </summary>
    [DataMember(Name = "type")]
    public required string Type { get; init; }

    /// <summary>
    /// Chart kind. Use <see cref="ChartKind"/> constants: "Default", "Stacked", "Stacked100", "Unstacked".
    /// If null, defaults to "Default". Only applies to bar/column charts.
    /// </summary>
    [DataMember(Name = "kind")]
    public string? Kind { get; init; }

    /// <summary>
    /// Chart title text displayed above the chart. If null, no title is shown.
    /// </summary>
    [DataMember(Name = "title")]
    public string? Title { get; init; }

    /// <summary>
    /// X-axis title text. If null, no X-axis title is shown.
    /// </summary>
    [DataMember(Name = "xTitle")]
    public string? XTitle { get; init; }

    /// <summary>
    /// Y-axis title text. If null, no Y-axis title is shown.
    /// </summary>
    [DataMember(Name = "yTitle")]
    public string? YTitle { get; init; }

    /// <summary>
    /// Name of the data column to use for the X-axis. If null, the first column is used.
    /// </summary>
    [DataMember(Name = "xColumn")]
    public string? XColumn { get; init; }

    /// <summary>
    /// Names of the data columns to plot as Y values. If null, all numeric columns except the X column are used.
    /// </summary>
    [DataMember(Name = "yColumns")]
    public ImmutableList<string>? YColumns { get; init; }

    /// <summary>
    /// Column names used to split data into separate series. If null, each Y column becomes its own series.
    /// </summary>
    [DataMember(Name = "series")]
    public ImmutableList<string>? Series { get; init; }

    /// <summary>
    /// Legend visibility. Use <see cref="ChartLegendMode"/> constants: "Visible", "Hidden".
    /// If null, defaults to "Visible". Overridden by <see cref="LegendPosition"/> if set.
    /// </summary>
    [DataMember(Name = "legend")]
    public string? Legend { get; init; }

    /// <summary>
    /// X-axis scale type. Use <see cref="ChartAxis"/> constants: "Linear", "Log".
    /// If null, defaults to "Linear".
    /// </summary>
    [DataMember(Name = "xAxis")]
    public string? XAxis { get; init; }

    /// <summary>
    /// Y-axis scale type. Use <see cref="ChartAxis"/> constants: "Linear", "Log".
    /// If null, defaults to "Linear".
    /// </summary>
    [DataMember(Name = "yAxis")]
    public string? YAxis { get; init; }

    /// <summary>
    /// Minimum value for the X-axis range. Must be numeric. If null (or if Xmax is also null), auto-ranges.
    /// Both Xmin and Xmax must be set together to take effect.
    /// </summary>
    [DataMember(Name = "xmin")]
    public object? Xmin { get; init; }

    /// <summary>
    /// Maximum value for the X-axis range. Must be numeric. If null (or if Xmin is also null), auto-ranges.
    /// Both Xmin and Xmax must be set together to take effect.
    /// </summary>
    [DataMember(Name = "xmax")]
    public object? Xmax { get; init; }

    /// <summary>
    /// Minimum value for the Y-axis range. Must be numeric. If null (or if Ymax is also null), auto-ranges.
    /// Both Ymin and Ymax must be set together to take effect.
    /// </summary>
    [DataMember(Name = "ymin")]
    public object? Ymin { get; init; }

    /// <summary>
    /// Maximum value for the Y-axis range. Must be numeric. If null (or if Ymin is also null), auto-ranges.
    /// Both Ymin and Ymax must be set together to take effect.
    /// </summary>
    [DataMember(Name = "ymax")]
    public object? Ymax { get; init; }

    /// <summary>
    /// Whether to accumulate Y values across the X-axis (running total). Defaults to false.
    /// </summary>
    [DataMember(Name = "accumulate")]
    public bool Accumulate { get; init; }

    /// <summary>
    /// Z-axis title text for 3D charts. If null, the Z column name is used.
    /// Only applies to 3D chart types.
    /// </summary>
    [DataMember(Name = "zTitle")]
    public string? ZTitle { get; init; }

    /// <summary>
    /// Tick mark visibility on the X-axis. Use <see cref="ChartVisibility"/> constants: "Visible", "Hidden".
    /// If null, ticks are hidden by default.
    /// </summary>
    [DataMember(Name = "xShowTicks")]
    public string? XShowTicks { get; init; }

    /// <summary>
    /// Tick mark visibility on the Y-axis. Use <see cref="ChartVisibility"/> constants: "Visible", "Hidden".
    /// If null, ticks are hidden by default.
    /// </summary>
    [DataMember(Name = "yShowTicks")]
    public string? YShowTicks { get; init; }

    /// <summary>
    /// Grid line visibility on the X-axis. Use <see cref="ChartVisibility"/> constants: "Visible", "Hidden".
    /// If null, grid lines are shown by default.
    /// </summary>
    [DataMember(Name = "xShowGrid")]
    public string? XShowGrid { get; init; }

    /// <summary>
    /// Grid line visibility on the Y-axis. Use <see cref="ChartVisibility"/> constants: "Visible", "Hidden".
    /// If null, grid lines are shown by default.
    /// </summary>
    [DataMember(Name = "yShowGrid")]
    public string? YShowGrid { get; init; }

    /// <summary>
    /// Rotation angle for tick labels on the X-axis, in degrees (e.g., -45, 90).
    /// If null, labels auto-rotate to avoid overlap.
    /// </summary>
    [DataMember(Name = "xTickAngle")]
    public double? XTickAngle { get; init; }

    /// <summary>
    /// Rotation angle for tick labels on the Y-axis, in degrees (e.g., -45, 90).
    /// If null, labels auto-rotate to avoid overlap.
    /// </summary>
    [DataMember(Name = "yTickAngle")]
    public double? YTickAngle { get; init; }

    /// <summary>
    /// Data value label visibility. Use <see cref="ChartVisibility"/> constants: "Visible", "Hidden".
    /// If null, values are hidden. When visible, bar charts show values on bars and pie charts show label+value+percent.
    /// </summary>
    [DataMember(Name = "showValues")]
    public string? ShowValues { get; init; }

    /// <summary>
    /// Category sort order on the X-axis. Use <see cref="ChartSortOrder"/> constants: "Default", "Ascending", "Descending".
    /// If null, categories appear in the order encountered in the data. Sorts by total value.
    /// </summary>
    [DataMember(Name = "sort")]
    public string? Sort { get; init; }

    /// <summary>
    /// Legend position. Use <see cref="ChartLegendPosition"/> constants: "Right", "Bottom", "Top", "Hidden".
    /// If null, the legend position is determined by the <see cref="Legend"/> property (defaults to right side).
    /// </summary>
    [DataMember(Name = "legendPosition")]
    public string? LegendPosition { get; init; }

    /// <summary>
    /// Color mode override. Use <see cref="ChartMode"/> constants: "Light", "Dark".
    /// If null, the chart uses the darkMode parameter (which reflects the editor theme).
    /// "Light" or "Dark" overrides the darkMode parameter.
    /// </summary>
    [DataMember(Name = "mode")]
    public string? Mode { get; init; }

    /// <summary>
    /// Converts a <see cref="ChartVisualizationOptions"/> from the Kusto SDK to a <see cref="ChartOptions"/>.
    /// </summary>
    public static ChartOptions FromChartVisualizationOptions(ChartVisualizationOptions options)
    {
        return new ChartOptions
        {
            Type = options.Visualization.ToString(),
            Kind = options.Mode.ToString(),
            Title = options.Title,
            XTitle = options.XTitle,
            YTitle = options.YTitle,
            XColumn = options.XColumn,
            YColumns = options.YColumns?.ToImmutableList(),
            Series = options.Series?.ToImmutableList(),
            Legend = options.Legend.ToString(),
            XAxis = options.XAxis.ToString(),
            YAxis = options.YAxis.ToString(),
            Xmin = ConvertNanToNull(options.Xmin),
            Xmax = ConvertNanToNull(options.Xmax),
            Ymin = ConvertNanToNull(options.Ymin),
            Ymax = ConvertNanToNull(options.Ymax),
            Accumulate = options.Accumulate
        };
    }

    private static object? ConvertNanToNull(object? value)
    {
        return value switch
        {
            double d when double.IsNaN(d) => null,
            double d when double.IsPositiveInfinity(d) => double.MaxValue,
            double d when double.IsNegativeInfinity(d) => double.MinValue,
            float f when float.IsNaN(f) => null,
            float f when float.IsPositiveInfinity(f) => float.MaxValue,
            float f when float.IsNegativeInfinity(f) => float.MinValue,
            _ => value
        };
    }
}
