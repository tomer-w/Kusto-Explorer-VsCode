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
    /// Chart type. Use <see cref="ChartType"/> constants (e.g., "linechart", "barchart", "piechart", "scatterchart").
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
    /// Whether the legend is visible. If null, defaults to true.
    /// Overridden by <see cref="LegendPosition"/> if set.
    /// </summary>
    [DataMember(Name = "showLegend")]
    public bool? ShowLegend { get; init; }

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
    /// Whether tick marks are visible on the X-axis. If null, ticks are hidden by default.
    /// </summary>
    [DataMember(Name = "xShowTicks")]
    public bool? XShowTicks { get; init; }

    /// <summary>
    /// Whether tick marks are visible on the Y-axis. If null, ticks are hidden by default.
    /// </summary>
    [DataMember(Name = "yShowTicks")]
    public bool? YShowTicks { get; init; }

    /// <summary>
    /// Whether grid lines are visible on the X-axis. If null, grid lines are shown by default.
    /// </summary>
    [DataMember(Name = "xShowGrid")]
    public bool? XShowGrid { get; init; }

    /// <summary>
    /// Whether grid lines are visible on the Y-axis. If null, grid lines are shown by default.
    /// </summary>
    [DataMember(Name = "yShowGrid")]
    public bool? YShowGrid { get; init; }

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
    /// Whether data value labels are shown. If null, values are hidden.
    /// When true, bar charts show values on bars and pie charts show label+value+percent.
    /// </summary>
    [DataMember(Name = "showValues")]
    public bool? ShowValues { get; init; }

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
    /// Aspect ratio for the chart display area. Use <see cref="ChartAspectRatio"/> constants: "16:9", "3:2", "4:3", "1:1", "3:4", "2:3", "9:16".
    /// If null, the chart fills the available space.
    /// </summary>
    [DataMember(Name = "aspectRatio")]
    public string? AspectRatio { get; init; }

    /// <summary>
    /// Text size preset for chart titles and axis labels. Use <see cref="ChartTextSize"/> constants: "Small", "Large", "Extra Large".
    /// If null, font sizes scale dynamically based on chart dimensions.
    /// </summary>
    [DataMember(Name = "textSize")]
    public string? TextSize { get; init; }

    /// <summary>
    /// Column names to render as anomaly points on an anomaly chart.
    /// Only applies to the anomalychart visualization type.
    /// </summary>
    [DataMember(Name = "anomalyColumns")]
    public ImmutableList<string>? AnomalyColumns { get; init; }

    /// <summary>
    /// Converts a <see cref="ChartVisualizationOptions"/> from the Kusto SDK to a <see cref="ChartOptions"/>.
    /// </summary>
    public static ChartOptions FromChartVisualizationOptions(ChartVisualizationOptions options)
    {
        return new ChartOptions
        {
            Type = VisualizationToChartType(options.Visualization),
            Kind = options.Mode.ToString(),
            Title = options.Title,
            XTitle = options.XTitle,
            YTitle = options.YTitle,
            XColumn = options.XColumn,
            YColumns = options.YColumns?.ToImmutableList(),
            Series = options.Series?.ToImmutableList(),
            ShowLegend = options.Legend.ToString() != "Hidden",
            XAxis = options.XAxis.ToString(),
            YAxis = options.YAxis.ToString(),
            Xmin = ConvertNanToNull(options.Xmin),
            Xmax = ConvertNanToNull(options.Xmax),
            Ymin = ConvertNanToNull(options.Ymin),
            Ymax = ConvertNanToNull(options.Ymax),
            Accumulate = options.Accumulate,
            AnomalyColumns = options.AnomalyColumns?.ToImmutableList(),
        };
    }

    /// <summary>
    /// Returns a new <see cref="ChartOptions"/> with null properties filled in from the specified defaults.
    /// </summary>
    public ChartOptions WithDefaults(ChartOptions defaults)
    {
        return new ChartOptions
        {
            Type = this.Type,
            Kind = this.Kind,
            Title = this.Title,
            XTitle = this.XTitle,
            YTitle = this.YTitle,
            XColumn = this.XColumn,
            YColumns = this.YColumns,
            Series = this.Series,
            ShowLegend = this.ShowLegend ?? defaults.ShowLegend,
            XAxis = this.XAxis,
            YAxis = this.YAxis,
            Xmin = this.Xmin,
            Xmax = this.Xmax,
            Ymin = this.Ymin,
            Ymax = this.Ymax,
            Accumulate = this.Accumulate,
            ZTitle = this.ZTitle,
            XShowTicks = this.XShowTicks ?? defaults.XShowTicks,
            YShowTicks = this.YShowTicks ?? defaults.YShowTicks,
            XShowGrid = this.XShowGrid ?? defaults.XShowGrid,
            YShowGrid = this.YShowGrid ?? defaults.YShowGrid,
            XTickAngle = this.XTickAngle,
            YTickAngle = this.YTickAngle,
            ShowValues = this.ShowValues ?? defaults.ShowValues,
            Sort = this.Sort,
            LegendPosition = this.LegendPosition ?? defaults.LegendPosition,
            Mode = this.Mode,
            AspectRatio = this.AspectRatio ?? defaults.AspectRatio,
            TextSize = this.TextSize ?? defaults.TextSize,
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

    private static string VisualizationToChartType(VisualizationKind kind)
    {
        return kind switch
        {
            VisualizationKind.AreaChart => ChartType.AreaChart,
            VisualizationKind.BarChart => ChartType.BarChart,
            VisualizationKind.Card => ChartType.Card,
            VisualizationKind.ColumnChart => ChartType.ColumnChart,
            VisualizationKind.Graph => ChartType.Graph,
            VisualizationKind.LineChart => ChartType.LineChart,
            VisualizationKind.PieChart => ChartType.PieChart,
            VisualizationKind.PivotChart => ChartType.PivotChart,
            VisualizationKind.Plotly => ChartType.Plotly,
            VisualizationKind.Sankey => ChartType.Sankey,
            VisualizationKind.ScatterChart => ChartType.ScatterChart,
            VisualizationKind.StackedAreaChart => ChartType.StackedAreaChart,
            VisualizationKind.ThreeDChart => ChartType.ThreeDChart,
            VisualizationKind.TimeLadderChart => ChartType.TimeLadderChart,
            VisualizationKind.TimeLineChart => ChartType.TimeLineChart,
            VisualizationKind.TimeLineWithAnomalyChart => ChartType.TimeLineWithAnomalyChart,
            VisualizationKind.TimePivot => ChartType.TimePivot,
            VisualizationKind.TreeMap => ChartType.TreeMap,
            _ => ChartType.None,
        };
    }
}
