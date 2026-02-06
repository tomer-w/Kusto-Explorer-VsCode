namespace Kusto.Lsp;

/// <summary>
/// Helper for creating complete HTML documents with Plotly charts.
/// </summary>
public static class PlotlyHtmlHelper
{
    private const string PlotlyJsCdn = "https://cdn.plot.ly/plotly-2.27.0.min.js";

    public static string CreateHtmlDocument(string chartDiv)
    {
        return $$"""
            <!DOCTYPE html>
            <html style="height: 100%;">
            <head>
                <meta charset="utf-8">
                <script src="{{PlotlyJsCdn}}" charset="utf-8"></script>
                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        width: 100%;
                        overflow: hidden;
                    }
                    #plotly-chart {
                        width: 100%;
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                {{chartDiv}}
            </body>
            </html>
            """;
    }
}
