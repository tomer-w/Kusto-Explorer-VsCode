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
    public string? RenderChartToHtmlDiv(DataTable data, ChartVisualizationOptions options, bool darkMode = false)
    {
        var builder = BuildChart(data, options, darkMode);
        return builder != null ? builder.ToHtmlDiv() : null;
    }

    public string? RenderChartToHtmlDocument(DataTable data, ChartVisualizationOptions options, bool darkMode = false)
    {
        var chartDiv = RenderChartToHtmlDiv(data, options, darkMode);
        return chartDiv != null ? PlotlyHtmlHelper.CreateHtmlDocument(chartDiv, darkMode) : null;
    }

    private PlotlyChartBuilder? BuildChart(DataTable data, ChartVisualizationOptions options, bool darkMode)
    {
        var builder = options.Visualization switch
        {
            VisualizationKind.BarChart or VisualizationKind.ColumnChart => BuildBarOrColumnChart(data, options),
            VisualizationKind.LineChart => BuildLineChart(data, options),
            VisualizationKind.ScatterChart => BuildScatterChart(data, options),
            VisualizationKind.PieChart => BuildPieChart(data, options),
            VisualizationKind.AreaChart => BuildAreaChart(data, options),
            VisualizationKind.StackedAreaChart => BuildStackedAreaChart(data, options),
            VisualizationKind.Card => BuildCardChart(data, options),
            VisualizationKind.ThreeDChart => BuildThreeDChart(data, options),
            _ => null
        };

        if (builder != null)
        {
            // Apply dark mode styling if requested
            if (darkMode)
            {
                builder = builder.WithDarkMode();
            }

            // Disable zoom/pan on 2D charts but keep hover tooltips - 3D charts need full interaction for rotation
            if (options.Visualization != VisualizationKind.ThreeDChart)
            {
                builder = builder.WithFixedRange();
            }
        }

        return builder;
    }

    private PlotlyChartBuilder? BuildBarOrColumnChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();
        bool isHorizontal = options.Visualization == VisualizationKind.BarChart;

        builder = options.Mode switch
        {
            VisualizationMode.Stacked => builder.SetStacked(),
            VisualizationMode.Stacked100 => builder.SetStacked100(),
            VisualizationMode.Unstacked => builder.SetGrouped(),
            _ => builder
        };

        return Build2dChart(builder, data, options, 
            (builder, keys, values, name, yAxis) =>
                builder.Add2DBarTrace(
                    x: keys,
                    y: values,
                    name: name,
                    horizontal: isHorizontal,
                    yAxis: yAxis,
                    offsetGroup: null
                )
            );
    }

    private PlotlyChartBuilder? BuildLineChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();
        return Build2dChart(builder, data, options, 
            (builder, x, y, name, yAxis) => builder.Add2DLineTrace(x, y, name, yAxis: yAxis)
            );
    }

    private PlotlyChartBuilder? BuildScatterChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();
        return Build2dChart(builder, data, options, 
            (builder, x, y, name, yAxis) => builder.Add2DScatterTrace(x, y, name, yAxis: yAxis)
            );
    }

    private PlotlyChartBuilder? BuildPieChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();

        // Configure chart title
        if (options.Title != null)
            builder = builder.WithTitle(options.Title);

        if (options.Legend != LegendVisualizationMode.Visible)
            builder = builder.HideLegend();

        // Get label and value columns
        var labelColumn = this.Get2dXColumn(data, options);
        if (labelColumn == null)
            return null;

        var valueColumns = this.Get2dYColumns(data, options, labelColumn);
        
        // For pie charts, we typically use only the first value column
        // Multiple value columns would create multiple pie charts
        foreach (var valueColumn in valueColumns)
        {
            var (labels, values) = this.Get2DChartData(labelColumn, valueColumn);

            if (labels != null && values != null)
            {
                builder = builder.AddPieTrace(
                    labels: labels,
                    values: values,
                    name: valueColumn.ColumnName,
                    hole: 0.0  // Can be made configurable via options if needed
                );
            }
        }

        return builder;
    }

    private PlotlyChartBuilder? BuildAreaChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();
        return Build2dChart(builder, data, options, 
            (builder, x, y, name, yAxis) => builder.AddAreaChart(x, y, name, stackGroup: null, yAxis: yAxis)
        );
    }

    private PlotlyChartBuilder? BuildStackedAreaChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();
        return Build2dChart(builder, data, options, 
            (builder, x, y, name, yAxis) => builder.AddAreaChart(x, y, name, stackGroup: "1", yAxis: yAxis)
        );
    }

    private PlotlyChartBuilder? BuildCardChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();

        // Card charts expect a single aggregated value
        // Get the first numeric column's first row value
        if (data.Rows.Count == 0 || data.Columns.Count == 0)
            return null;

        // Try to find a numeric column
        DataColumn? valueColumn = null;
        foreach (DataColumn col in data.Columns)
        {
            if (IsNumeric(col.DataType))
            {
                valueColumn = col;
                break;
            }
        }

        if (valueColumn == null)
            return null;

        var firstRow = data.Rows[0];
        var cellValue = firstRow[valueColumn];

        if (cellValue == null || cellValue == DBNull.Value)
            return null;

        double value = Convert.ToDouble(cellValue);

        // Sanitize infinity values
        value = SanitizeDoubleValue(value);

        // Determine title - use the column name or the provided title
        string? title = options.Title ?? valueColumn.ColumnName;

        builder = builder.AddIndicatorTrace(
            value: value,
            title: title,
            mode: PlotlyIndicatorModes.Number
        );

        return builder;
    }

    private PlotlyChartBuilder? BuildThreeDChart(DataTable data, ChartVisualizationOptions options)
    {
        var builder = new PlotlyChartBuilder();

        // 3D charts expect 3 columns: X, Y, Z
        if (data.Columns.Count < 3 || data.Rows.Count == 0)
            return null;

        // Get the three columns
        var xColumn = data.Columns[0];
        var yColumn = data.Columns[1];
        var zColumn = data.Columns[2];

        // Z must be numeric
        if (!IsNumeric(zColumn.DataType))
            return null;

        // Extract data from rows
        var rows = data.Rows.OfType<DataRow>().ToList();

        // Get unique X and Y values (sorted)
        var xValues = rows
            .Select(r => r[xColumn])
            .Where(v => v != null && v != DBNull.Value)
            .Distinct()
            .OrderBy(v => v)
            .ToArray();

        var yValues = rows
            .Select(r => r[yColumn])
            .Where(v => v != null && v != DBNull.Value)
            .Distinct()
            .OrderBy(v => v)
            .ToArray();

        if (xValues.Length == 0 || yValues.Length == 0)
            return null;

        // Create a lookup dictionary for quick access: (x, y) -> z
        var dataLookup = new Dictionary<(object x, object y), double>();
        
        foreach (var row in rows)
        {
            var x = row[xColumn];
            var y = row[yColumn];
            var z = row[zColumn];

            if (x != null && x != DBNull.Value &&
                y != null && y != DBNull.Value &&
                z != null && z != DBNull.Value)
            {
                var zValue = SanitizeDoubleValue(Convert.ToDouble(z));
                dataLookup[(x, y)] = zValue;
            }
        }

        // Build the 2D Z array in the format Z[yIndex][xIndex]
        var zGrid = new object[yValues.Length][];
        
        for (int i = 0; i < yValues.Length; i++)
        {
            zGrid[i] = new object[xValues.Length];
            
            for (int j = 0; j < xValues.Length; j++)
            {
                // Try to get the value from the lookup
                if (dataLookup.TryGetValue((xValues[j], yValues[i]), out var zValue))
                {
                    zGrid[i][j] = zValue;
                }
                else
                {
                    // If no data point exists for this (x, y), use null or 0
                    zGrid[i][j] = 0.0;
                }
            }
        }

        // Configure title
        if (options.Title != null)
            builder = builder.WithTitle(options.Title);

        // Add the surface trace
        builder = builder.Add3DSurfaceTrace(
            z: zGrid,
            x: xValues,
            y: yValues,
            name: zColumn.ColumnName
        );

        // Configure scene axes if titles are provided
        var scene = new PlotlyScene();
        bool hasSceneConfig = false;

        if (options.XTitle != null)
        {
            scene = scene with { XAxis = new PlotlyAxis { Title = new PlotlyTitle { Text = options.XTitle } } };
            hasSceneConfig = true;
        }

        if (options.YTitle != null)
        {
            scene = scene with { YAxis = new PlotlyAxis { Title = new PlotlyTitle { Text = options.YTitle } } };
            hasSceneConfig = true;
        }

        // For 3D charts, we could use a "ZTitle" if it existed in options
        // For now, use the column name for Z axis
        scene = scene with { ZAxis = new PlotlyAxis { Title = new PlotlyTitle { Text = zColumn.ColumnName } } };
        hasSceneConfig = true;

        if (hasSceneConfig)
        {
            builder = builder.WithScene(scene);
        }

        if (options.Legend != LegendVisualizationMode.Visible)
            builder = builder.HideLegend();

        return builder;
    }

    /// <summary>
    /// Common rendering logic for 2D charts (bar, column, line, scatter, etc.)
    /// </summary>
    private PlotlyChartBuilder? Build2dChart(
        PlotlyChartBuilder builder,
        DataTable data, 
        ChartVisualizationOptions options,
        Func<PlotlyChartBuilder, object[], double[], string, string?, PlotlyChartBuilder> addTrace)
    {
        var xColumn = Get2dXColumn(data, options);
        if (xColumn == null)
            return null;

        var yColumns = Get2dYColumns(data, options, xColumn);

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
            && TryGetDouble(options.Xmax, out var xMaxD))
            builder = builder.SetXAxisRange(xMinD, xMaxD);

        if (TryGetDouble(options.Ymin, out var yMinD)
            && TryGetDouble(options.Ymax, out var yMaxD))
            builder = builder.SetYAxisRange(yMinD, yMaxD);

        if (options.Legend != LegendVisualizationMode.Visible)
            builder = builder.HideLegend();

        // Add traces for each value column
        bool useSecondaryAxis = false;

        for (int i = 0; i < yColumns.Length; i++)
        {
            var valueColumn = yColumns[i];
            var (keys, values) = Get2DChartData(xColumn, valueColumn);

            if (keys != null && values != null)
            {
                string? yAxis = null;

                // Assign to secondary axis if split mode
                if (useSecondaryAxis && i > 0)
                {
                    yAxis = "y2";
                }

                builder = addTrace(builder, keys, values, valueColumn.ColumnName, yAxis);
            }
        }

        // Add secondary Y axis if needed
        if (useSecondaryAxis)
        {
            builder = builder.AddSecondaryYAxis("yaxis2",
                new PlotlyAxis
                {
                    Overlaying = "y",
                    Side = PlotlyAxisSides.Right,
                    Type = options.YAxis == AxisVisualizationMode.Log ? PlotlyAxisTypes.Log : null
                });
        }

        return builder;
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

    private DataColumn? Get2dXColumn(DataTable data, ChartVisualizationOptions options)
    {
        return options.XColumn != null
            ? data.Columns[options.XColumn]
            : options.YColumns != null
                ? data.Columns.OfType<DataColumn>().FirstOrDefault(c => !options.YColumns.Contains(c.ColumnName))
                : data.Columns[0];
    }

    private DataColumn[] Get2dYColumns(DataTable data, ChartVisualizationOptions options, DataColumn keyColumn)
    {
        return options.YColumns != null
            ? data.Columns.OfType<DataColumn>().Where(c => options.YColumns.Contains(c.ColumnName)).ToArray()
            : data.Columns.OfType<DataColumn>().Where(c => c != keyColumn).ToArray();
    }

    private (object[]? x, double[]? y) Get2DChartData(DataColumn xColumn, DataColumn yColumn)
    {
        if (!IsNumeric(yColumn.DataType))
            return (null, null);

        var xValues = GetColumnValues(xColumn);
        var yValues = GetColumnValues(yColumn);

        (xValues, yValues) = TrimNullRows(xValues, yValues);

        var x = xValues;
        var y = ConvertToNumeric(yValues);
        
        return (x, y);
    }

    private object[] GetColumnValues(DataColumn column)
    {
        return column.Table!.Rows.OfType<DataRow>().Select(dr => dr[column]).ToArray();
    }

    private T[] ConvertValues<T>(object[] values)
    {
        return values.Select(v => (T)Convert.ChangeType(v, typeof(T))).ToArray();
    }

    private double[] ConvertToNumeric(object[] values)
    {
        return values.Select(v => SanitizeDoubleValue(Convert.ToDouble(v))).ToArray();
    }

    /// <summary>
    /// Sanitizes double values by replacing infinity with min/max values.
    /// </summary>
    private static double SanitizeDoubleValue(double value)
    {
        if (double.IsPositiveInfinity(value))
            return double.MaxValue;
        
        if (double.IsNegativeInfinity(value))
            return double.MinValue;
        
        return value;
    }

    /// <summary>
    /// Trim (x,y) pairs if either is null/DBNull
    /// </summary>
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
