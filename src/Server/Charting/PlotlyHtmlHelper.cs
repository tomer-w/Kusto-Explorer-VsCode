// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

namespace Kusto.Vscode;

/// <summary>
/// Helper for creating complete HTML documents with Plotly charts.
/// </summary>
public static class PlotlyHtmlHelper
{
    private const string PlotlyJsCdn = "https://cdn.plot.ly/plotly-2.27.0.min.js";

    /// <summary>
    /// Creates an HTML div element with embedded script to render a Plotly chart.
    /// </summary>
    /// <param name="dataJson">JSON string representing the Plotly data array (traces).</param>
    /// <param name="layoutJson">JSON string representing the Plotly layout object.</param>
    /// <param name="configJson">JSON string representing the Plotly config object.</param>
    /// <param name="divId">The HTML element ID for the chart container.</param>
    /// <returns>HTML string containing the div and script elements.</returns>
    public static string CreateChartDiv(string dataJson, string layoutJson, string configJson, string divId = "plotly-chart")
    {
        return $$"""
            <div id="{{divId}}"></div>
            <script>
            try {
              var data = {{dataJson}};
              var layout = {{layoutJson}};
              var config = {{configJson}};
              Plotly.newPlot('{{divId}}', data, layout, config);
            } catch(e) { console.error('Plotly error:', e); document.getElementById('{{divId}}').innerText = 'Chart error: ' + e.message; }
            </script>
            """;
    }

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
