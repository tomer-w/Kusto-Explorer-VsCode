namespace Kusto.Lsp;

/// <summary>
/// Helper for creating complete HTML documents with Plotly charts.
/// </summary>
public static class PlotlyHtmlHelper
{
    private const string PlotlyJsCdn = "https://cdn.plot.ly/plotly-2.27.0.min.js";

    public static string CreateHtmlDocument(string chartDiv, bool darkMode = false)
    {
        var backgroundColor = darkMode ? "#1e1e1e" : "#ffffff";
        var textColor = darkMode ? "#f2f5fa" : "#000000";

        // Extract the script content from chartDiv (everything between <script> and </script>)
        // and wrap it in a function that runs after Plotly loads
        var scriptStart = chartDiv.IndexOf("<script>");
        var scriptEnd = chartDiv.IndexOf("</script>");
        
        string divPart;
        string scriptContent;
        
        if (scriptStart >= 0 && scriptEnd > scriptStart)
        {
            divPart = chartDiv.Substring(0, scriptStart).Trim();
            scriptContent = chartDiv.Substring(scriptStart + 8, scriptEnd - scriptStart - 8);
        }
        else
        {
            divPart = chartDiv;
            scriptContent = "";
        }

        return $$"""
            <!DOCTYPE html>
            <html style="height: 100%;">
            <head>
                <meta charset="utf-8">
                <style>
                    html, body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        width: 100%;
                        overflow: hidden;
                        background-color: {{backgroundColor}};
                        color: {{textColor}};
                    }
                    #plotly-chart {
                        width: 100%;
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                {{divPart}}
                <script src="{{PlotlyJsCdn}}" charset="utf-8"></script>
                <script>
                {{scriptContent}}
                </script>
            </body>
            </html>
            """;
    }
}
