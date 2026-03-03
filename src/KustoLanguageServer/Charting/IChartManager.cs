// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Data;
using Kusto.Data.Utils;

namespace Kusto.Lsp;

public interface IChartManager
{
    /// <summary>
    /// Renders chart as html.
    /// </summary>
    string? RenderChartToHtmlDiv(DataTable data, ChartVisualizationOptions options, bool darkMode = false);
    string? RenderChartToHtmlDocument(DataTable data, ChartVisualizationOptions options, bool darkMode = false);
}
