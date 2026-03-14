// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

/// <summary>
/// Constants for chart visualization types.
/// </summary>
public static class ChartType
{
    public const string None = "None";
    public const string AreaChart = "AreaChart";
    public const string BarChart = "BarChart";
    public const string Card = "Card";
    public const string ColumnChart = "ColumnChart";
    public const string Graph = "Graph";
    public const string LineChart = "LineChart";
    public const string PieChart = "PieChart";
    public const string PivotChart = "PivotChart";
    public const string Plotly = "Plotly";
    public const string Sankey = "Sankey";
    public const string ScatterChart = "ScatterChart";
    public const string StackedAreaChart = "StackedAreaChart";
    public const string ThreeDChart = "3DChart";
    public const string TimeLadderChart = "TimeLadderChart";
    public const string TimeLineChart = "TimeLineChart";
    public const string TimeLineWithAnomalyChart = "TimeLineWithAnomalyChart";
    public const string TimePivot = "TimePivot";
    public const string TreeMap = "TreeMap";
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
/// Constants for chart legend visibility.
/// </summary>
public static class ChartLegendMode
{
    public const string Visible = "Visible";
    public const string Hidden = "Hidden";
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
/// Constants for chart visibility options (ticks, grid, values).
/// </summary>
public static class ChartVisibility
{
    public const string Visible = "Visible";
    public const string Hidden = "Hidden";
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
    public const string Ratio4x3 = "4:3";
    public const string Ratio1x1 = "1:1";
    public const string Ratio3x2 = "3:2";
}
