// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

/// <summary>
/// Constants for chart visualization kinds.
/// </summary>
public static class ChartKind
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
/// Constants for chart visualization modes.
/// </summary>
public static class ChartMode
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
