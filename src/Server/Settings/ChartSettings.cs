// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Immutable;

namespace Kusto.Vscode;

public static class ChartSettings
{
    public static readonly Setting<string?> LegendPosition =
        new Setting<string?>("kusto.chart.legendPosition", null);

    public static readonly Setting<string?> XShowTicks =
        new Setting<string?>("kusto.chart.xShowTicks", null);

    public static readonly Setting<string?> YShowTicks =
        new Setting<string?>("kusto.chart.yShowTicks", null);

    public static readonly Setting<string?> XShowGrid =
        new Setting<string?>("kusto.chart.xShowGrid", null);

    public static readonly Setting<string?> YShowGrid =
        new Setting<string?>("kusto.chart.yShowGrid", null);

    public static readonly Setting<string?> ShowValues =
        new Setting<string?>("kusto.chart.showValues", null);

    public static readonly Setting<string?> TextSize =
        new Setting<string?>("kusto.chart.textSize", null);

    public static readonly Setting<string?> AspectRatio =
        new Setting<string?>("kusto.chart.aspectRatio", null);

    public static readonly ImmutableList<Setting> All =
        [
            LegendPosition,
            XShowTicks,
            YShowTicks,
            XShowGrid,
            YShowGrid,
            ShowValues,
            TextSize,
            AspectRatio
        ];
}
