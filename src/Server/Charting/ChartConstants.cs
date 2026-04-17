// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

/// <summary>
/// Constants for chart visualization types.
/// </summary>
public static class ChartType
{
    public const string None = "None";
    public const string Area = "Area";
    public const string AreaStacked = "AreaStacked";
    public const string AreaStacked100 = "AreaStacked100";
    public const string Bar = "Bar";
    public const string BarStacked = "BarStacked";
    public const string BarStacked100 = "BarStacked100";
    public const string Card = "Card";
    public const string Column = "Column";
    public const string ColumnStacked = "ColumnStacked";
    public const string ColumnStacked100 = "ColumnStacked100";
    public const string Graph = "Graph";
    public const string Ladder = "Ladder";
    public const string Line = "Line";
    public const string Pie = "Pie";
    public const string Plotly = "Plotly";
    public const string Sankey = "Sankey";
    public const string Scatter = "Scatter";
    public const string ThreeD = "ThreeD";
    public const string TimeLine = "TimeLine";
    public const string TimeLineAnomaly = "TimeLineAnomaly";
    public const string TimePivot = "TimePivot";
    public const string TreeMap = "TreeMap";
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
/// Constants for Y-column layout modes.
/// </summary>
public static class ChartYLayout
{
    public const string SharedAxis = "SharedAxis";
    public const string DualAxis = "DualAxis";
    public const string SeparatePanels = "SeparatePanels";
    public const string SeparateCharts = "SeparateCharts";
}
