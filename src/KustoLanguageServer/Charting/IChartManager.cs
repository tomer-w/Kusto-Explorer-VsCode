// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Data;

namespace Kusto.Lsp;

public interface IChartManager
{
    /// <summary>
    /// Renders chart as html.
    /// </summary>
    string? RenderChartToHtmlDiv(DataTable data, ChartOptions options, bool darkMode = false);
    string? RenderChartToHtmlDocument(DataTable data, ChartOptions options, bool darkMode = false);
}
