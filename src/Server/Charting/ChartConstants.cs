// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

/// <summary>
/// Constants for chart visualization types.
/// </summary>
public static class ChartType
{
    public const string None = "none";
    public const string AreaChart = "areachart";
    public const string BarChart = "barchart";
    public const string Card = "card";
    public const string ColumnChart = "columnchart";
    public const string Graph = "graph";
    public const string LineChart = "linechart";
    public const string PieChart = "piechart";
    public const string PivotChart = "pivotchart";
    public const string Plotly = "plotly";
    public const string Sankey = "sankey";
    public const string ScatterChart = "scatterchart";
    public const string StackedAreaChart = "stackedareachart";
    public const string ThreeDChart = "3Dchart";
    public const string TimeLadderChart = "ladderchart";
    public const string TimeLineChart = "timechart";
    public const string TimeLineWithAnomalyChart = "anomalychart";
    public const string TimePivot = "timepivot";
    public const string TreeMap = "treemap";
}

/// <summary>
/// Constants for chart visualization kinds.
/// </summary>
public static class ChartKind
{
    public const string Default = "Default";
    public const string Stacked = "Stacked";
    public const string Stacked100 = "Stacked100";
    public const string Unstacked = "Unstacked";
}

/// <summary>
/// Constants for chart axis modes.
/// </summary>
public static class ChartAxis
{
    public const string Linear = "Linear";
    public const string Log = "Log";
}

/// <summary>
/// Constants for chart sort order.
/// </summary>
public static class ChartSortOrder
{
    public const string Default = "Default";
    public const string Ascending = "Ascending";
    public const string Descending = "Descending";
}

/// <summary>
/// Constants for chart legend position.
/// </summary>
public static class ChartLegendPosition
{
    public const string Right = "Right";
    public const string Bottom = "Bottom";
    public const string Hidden = "Hidden";
}

/// <summary>
/// Constants for chart color mode (light/dark).
/// </summary>
public static class ChartMode
{
    public const string Light = "Light";
    public const string Dark = "Dark";
}

/// <summary>
/// Constants for chart text size presets.
/// </summary>
public static class ChartTextSize
{
    public const string ExtraSmall = "Extra Small";
    public const string Small = "Small";
    public const string Medium = "Medium";
    public const string Large = "Large";
    public const string ExtraLarge = "Extra Large";
}

/// <summary>
/// Constants for chart aspect ratio presets.
/// </summary>
public static class ChartAspectRatio
{
    public const string Ratio16x9 = "16:9";
    public const string Ratio3x2 = "3:2";
    public const string Ratio4x3 = "4:3";
    public const string Ratio1x1 = "1:1";
    public const string Ratio3x4 = "3:4";
    public const string Ratio2x3 = "2:3";
    public const string Ratio9x16 = "9:16";
}

/// <summary>
/// Constants for Y-axis split modes.
/// </summary>
public static class ChartYSplit
{
    public const string None = "None";
    public const string Axes = "Axes";
    public const string Panels = "Panels";
    public const string Charts = "Charts";
}
