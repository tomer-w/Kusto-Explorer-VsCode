// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;
using System.Runtime.Serialization;
using Kusto.Data.Utils;

namespace Kusto.Lsp;

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
    /// Converts a <see cref="ChartVisualizationOptions"/> from the Kusto SDK to a <see cref="ChartOptions"/>.
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
