using System.Data;
using Kusto.Data.Data;
using Kusto.Data.Utils;

namespace Kusto.Lsp;

/// <summary>
/// Plotly-based implementation of IChartManager using immutable PlotlyChartBuilder.
/// </summary>
public class PlotlyChartManager : IChartManager
{
    /// <summary>
    /// Renders chart as HTML using Plotly.js.
    /// </summary>
    public string? RenderChartToHtmlDiv(DataTable data, ChartVisualizationOptions options)
    {
        VisualizationKind kind = options.Visualization;
        
        switch (kind)
        {
            case VisualizationKind.BarChart:
            case VisualizationKind.ColumnChart:
                return RenderBarOrColumnChart(data, options);
            
            // Add more chart types here as needed
            // case VisualizationKind.LineChart:
            //     return RenderLineChart(data.TableData, options);
            
            default:
                return null;
        }
    }

    public string? RenderChartToHtmlDocument(DataTable data, ChartVisualizationOptions options)
    {
        var chartDiv = RenderChartToHtmlDiv(data, options);
        return chartDiv != null ? PlotlyHtmlHelper.CreateHtmlDocument(chartDiv) : null;
    }

    private string? RenderBarOrColumnChart(DataTable data, ChartVisualizationOptions options)
    {
        var keyColumn = GetKeyColumn(data, options);
        if (keyColumn == null)
            return null;

        var valueColumns = GetValueColumns(data, options, keyColumn);

        var builder = new PlotlyChartBuilder();

        // Configure chart based on visualization options
        if (options.Title != null)
            builder = builder.WithTitle(options.Title);

        if (options.XTitle != null)
            builder = builder.SetXAxisTitle(options.XTitle);

        if (options.YTitle != null)
            builder = builder.SetYAxisTitle(options.YTitle);

        if (options.XAxis == AxisVisualizationMode.Log)
            builder = builder.SetLogX();

        if (options.YAxis == AxisVisualizationMode.Log)
            builder = builder.SetLogY();

        if (TryGetDouble(options.Xmin, out var xMinD)
            && TryGetDouble(options.Ymax, out var xMaxD))
            builder = builder.SetXAxisRange(xMinD, xMaxD);

        if (TryGetDouble(options.Ymin, out var yMinD)
            && TryGetDouble(options.Ymax, out var yMaxD))
            builder = builder.SetYAxisRange(yMinD, yMaxD);

        // Set stacking mode
        builder = options.Mode switch
        {
            VisualizationMode.Stacked => builder.SetStacked(),
            VisualizationMode.Stacked100 => builder.SetStacked100(),
            VisualizationMode.Unstacked => builder.SetGrouped(),
            _ => builder
        };

        if (options.Legend != LegendVisualizationMode.Visible)
            builder = builder.HideLegend();

        // Add traces for each value column
        bool isHorizontal = options.Visualization == VisualizationKind.BarChart;
        bool useSecondaryAxis = false; // options.YSplit == SplitVisualizationMode.Axes && valueColumns.Length > 1;

        for (int i = 0; i < valueColumns.Length; i++)
        {
            var valueColumn = valueColumns[i];
            var (keys, values) = GetChartData(keyColumn, valueColumn);

            if (keys != null && values != null)
            {
                string? yAxis = null;

                // Assign to secondary axis if split mode
                if (useSecondaryAxis && i > 0)
                {
                    yAxis = "y2";
                }

                builder = builder.AddBarChart(
                    x: keys,
                    y: values,
                    name: valueColumn.ColumnName,
                    horizontal: isHorizontal,
                    yAxis: yAxis,
                    offsetGroup: null  // Don't use offsetgroup with group mode
                );
            }
        }

        // Add secondary Y axis if needed
        if (useSecondaryAxis)
        {
            //builder = builder.SetBarMode("group");

            builder = builder.AddSecondaryYAxis("yaxis2",
                new PlotlyAxis
                {
                    Overlaying = "y",
                    Side = PlotlyAxisSides.Right,
                    Type = options.YAxis == AxisVisualizationMode.Log ? PlotlyAxisTypes.Log : null
                });
        }

        return builder.ToHtmlDiv();
    }

    private static bool TryGetDouble(object value, out double result)
    {
        if (value is IConvertible valueC
            && Convert.ToDouble(valueC) is double valueD
            && !double.IsNaN(valueD))
        {
            result = valueD;
            return true;
        }
        result = default;
        return false;
    }

    private DataColumn? GetKeyColumn(DataTable data, ChartVisualizationOptions options)
    {
        return options.XColumn != null
            ? data.Columns[options.XColumn]
            : options.YColumns != null
                ? data.Columns.OfType<DataColumn>().FirstOrDefault(c => !options.YColumns.Contains(c.ColumnName))
                : data.Columns[0];
    }

    private DataColumn[] GetValueColumns(DataTable data, ChartVisualizationOptions options, DataColumn keyColumn)
    {
        return options.YColumns != null
            ? data.Columns.OfType<DataColumn>().Where(c => options.YColumns.Contains(c.ColumnName)).ToArray()
            : data.Columns.OfType<DataColumn>().Where(c => c != keyColumn).ToArray();
    }

    private (object[]? keys, double[]? values) GetChartData(DataColumn keyColumn, DataColumn valueColumn)
    {
        if (!IsNumeric(valueColumn.DataType))
            return (null, null);

        var untypedKeys = GetColumnValues(keyColumn);
        var untypedValues = GetColumnValues(valueColumn);

        (untypedKeys, untypedValues) = TrimNullRows(untypedKeys, untypedValues);

        var typedValues = ConvertValues<double>(untypedValues);

        return (untypedKeys, typedValues);
    }

    private object[] GetColumnValues(DataColumn column)
    {
        return column.Table!.Rows.OfType<DataRow>().Select(dr => dr[column]).ToArray();
    }

    private T[] ConvertValues<T>(object[] values)
    {
        return values.Select(v => (T)Convert.ChangeType(v, typeof(T))).ToArray();
    }

    private (object[] x, object[] y) TrimNullRows(object[] xValues, object[] yValues)
    {
        var result = new List<(object x, object y)>();

        for (int i = 0; i < Math.Min(xValues.Length, yValues.Length); i++)
        {
            if (xValues[i] != null && xValues[i] != DBNull.Value &&
                yValues[i] != null && yValues[i] != DBNull.Value)
            {
                result.Add((xValues[i], yValues[i]));
            }
        }

        return (result.Select(t => t.x).ToArray(), result.Select(t => t.y).ToArray());
    }

    private static bool IsNumeric(Type type)
    {
        return type == typeof(byte) ||
               type == typeof(sbyte) ||
               type == typeof(short) ||
               type == typeof(ushort) ||
               type == typeof(int) ||
               type == typeof(uint) ||
               type == typeof(long) ||
               type == typeof(ulong) ||
               type == typeof(float) ||
               type == typeof(double) ||
               type == typeof(decimal);
    }
}
