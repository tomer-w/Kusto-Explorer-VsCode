using System.Data;
using Kusto.Data.Utils;

namespace Kusto.Lsp;

public interface IChartManager
{
    /// <summary>
    /// Renders chart as html.
    /// </summary>
    string? RenderChartToHtmlDiv(DataTable data, ChartVisualizationOptions options);
    string? RenderChartToHtmlDocument(DataTable data, ChartVisualizationOptions options);
}
