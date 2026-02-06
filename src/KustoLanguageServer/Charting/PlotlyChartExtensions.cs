namespace Kusto.Lsp;

/// <summary>
/// Extension methods for building charts with fluent syntax.
/// </summary>
public static class PlotlyChartExtensions
{
    #region Bar Charts

    /// <summary>
    /// Adds a bar or column chart trace to the builder.
    /// </summary>
    /// <typeparam name="TX">Type of X-axis values (e.g., string, DateTime, int).</typeparam>
    /// <typeparam name="TY">Type of Y-axis values (must be numeric for proper rendering).</typeparam>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="x">X-axis values (categories or numeric values). Must be JSON-serializable.</param>
    /// <param name="y">Y-axis values (typically numeric). Must be JSON-serializable.</param>
    /// <param name="name">Name of the trace to appear in the legend. If null, no name is shown.</param>
    /// <param name="horizontal">If true, creates a horizontal bar chart; if false (default), creates a vertical column chart.</param>
    /// <param name="yAxis">ID of the Y-axis to use (e.g., "y2" for secondary axis). If null, uses primary Y-axis.</param>
    /// <param name="offsetGroup">Offset group for positioning bars when using multiple Y-axes or overlay mode.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the bar trace added.</returns>
    /// <remarks>
    /// For DateTime values in x or y, consider setting the corresponding axis Type to PlotlyAxisTypes.Date for proper date formatting.
    /// </remarks>
    public static PlotlyChartBuilder AddBarChart<TX, TY>(
        this PlotlyChartBuilder builder,
        IEnumerable<TX> x,
        IEnumerable<TY> y,
        string? name = null,
        bool horizontal = false,
        string? yAxis = null,
        string? offsetGroup = null)
    {
        var trace = new BarTrace
        {
            X = horizontal ? y.Cast<object>().ToArray() : x.Cast<object>().ToArray(),
            Y = horizontal ? x.Cast<object>().ToArray() : y.Cast<object>().ToArray(),
            Orientation = horizontal ? PlotlyOrientations.Horizontal : PlotlyOrientations.Vertical,
            Name = name,
            YAxis = yAxis,
            OffsetGroup = offsetGroup
        };

        return builder.AddTrace(trace);
    }

    #endregion

    #region Line Charts

    /// <summary>
    /// Adds a line chart trace to the builder.
    /// </summary>
    /// <typeparam name="TX">Type of X-axis values (e.g., DateTime for time series, numbers, strings).</typeparam>
    /// <typeparam name="TY">Type of Y-axis values (must be numeric for proper rendering).</typeparam>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="x">X-axis values (typically dates or sequential numbers). Must be JSON-serializable.</param>
    /// <param name="y">Y-axis values (numeric data points). Must be JSON-serializable.</param>
    /// <param name="name">Name of the trace to appear in the legend. If null, no name is shown.</param>
    /// <param name="showMarkers">If true, shows markers at each data point; if false (default), shows only the line.</param>
    /// <param name="yAxis">ID of the Y-axis to use (e.g., "y2" for secondary axis). If null, uses primary Y-axis.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the line trace added.</returns>
    /// <remarks>
    /// For time series data, use DateTime for x values and set axis Type to PlotlyAxisTypes.Date for proper formatting.
    /// </remarks>
    public static PlotlyChartBuilder AddLineChart<TX, TY>(
        this PlotlyChartBuilder builder,
        IEnumerable<TX> x,
        IEnumerable<TY> y,
        string? name = null,
        bool showMarkers = false,
        string? yAxis = null)
    {
        var trace = new ScatterTrace
        {
            X = x.Cast<object>().ToArray(),
            Y = y.Cast<object>().ToArray(),
            Mode = showMarkers ? PlotlyScatterModes.LinesAndMarkers : PlotlyScatterModes.Lines,
            Name = name,
            YAxis = yAxis
        };

        return builder.AddTrace(trace);
    }

    /// <summary>
    /// Adds a scatter plot trace to the builder (points only, no connecting lines).
    /// </summary>
    /// <typeparam name="TX">Type of X-axis values (numeric or categorical).</typeparam>
    /// <typeparam name="TY">Type of Y-axis values (must be numeric for proper rendering).</typeparam>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="x">X-axis values. Must be JSON-serializable.</param>
    /// <param name="y">Y-axis values. Must be JSON-serializable.</param>
    /// <param name="name">Name of the trace to appear in the legend. If null, no name is shown.</param>
    /// <param name="yAxis">ID of the Y-axis to use (e.g., "y2" for secondary axis). If null, uses primary Y-axis.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the scatter trace added.</returns>
    public static PlotlyChartBuilder AddScatterChart<TX, TY>(
        this PlotlyChartBuilder builder,
        IEnumerable<TX> x,
        IEnumerable<TY> y,
        string? name = null,
        string? yAxis = null)
    {
        var trace = new ScatterTrace
        {
            X = x.Cast<object>().ToArray(),
            Y = y.Cast<object>().ToArray(),
            Mode = PlotlyScatterModes.Markers,
            Name = name,
            YAxis = yAxis
        };

        return builder.AddTrace(trace);
    }

    #endregion

    #region 3D Surface Charts

    /// <summary>
    /// Adds a 3D surface plot trace to the builder.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="z">2D array of Z values (heights) defining the surface. Must be numeric.</param>
    /// <param name="x">X coordinates for the grid. If null, uses auto-generated coordinates (0, 1, 2, ...).</param>
    /// <param name="y">Y coordinates for the grid. If null, uses auto-generated coordinates (0, 1, 2, ...).</param>
    /// <param name="name">Name of the trace to appear in the legend. If null, no name is shown.</param>
    /// <param name="colorScale">Colorscale for the surface. Use <see cref="PlotlyColorScales"/> constants. If null, uses default.</param>
    /// <param name="showScale">Whether to show the color bar legend. Default is true.</param>
    /// <param name="opacity">Surface opacity (0.0 to 1.0). If null, uses default opacity.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the surface trace added.</returns>
    /// <remarks>
    /// The Z array should be a rectangular 2D grid where Z[i][j] represents the height at position (X[i], Y[j]).
    /// </remarks>
    public static PlotlyChartBuilder AddSurfacePlot<TZ>(
        this PlotlyChartBuilder builder,
        TZ[][] z,
        object[]? x = null,
        object[]? y = null,
        string? name = null,
        string? colorScale = null,
        bool? showScale = true,
        double? opacity = null)
    {
        var trace = new SurfaceTrace
        {
            Z = z.Select(row => row.Cast<object>().ToArray()).ToArray(),
            X = x,
            Y = y,
            Name = name,
            ColorScale = colorScale,
            ShowScale = showScale,
            Opacity = opacity
        };

        return builder.AddTrace(trace);
    }

    /// <summary>
    /// Adds a 3D surface plot trace using a function to generate Z values.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="xRange">Range of X values as (min, max, step).</param>
    /// <param name="yRange">Range of Y values as (min, max, step).</param>
    /// <param name="function">Function that takes (x, y) and returns z value.</param>
    /// <param name="name">Name of the trace to appear in the legend. If null, no name is shown.</param>
    /// <param name="colorScale">Colorscale for the surface. Use <see cref="PlotlyColorScales"/> constants. If null, uses default.</param>
    /// <param name="showScale">Whether to show the color bar legend. Default is true.</param>
    /// <param name="opacity">Surface opacity (0.0 to 1.0). If null, uses default opacity.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the surface trace added.</returns>
    /// <remarks>
    /// Generates a surface by evaluating the function over a grid defined by xRange and yRange.
    /// Example: builder.AddSurfaceFunction((0, 10, 0.5), (0, 10, 0.5), (x, y) => Math.Sin(x) * Math.Cos(y))
    /// </remarks>
    public static PlotlyChartBuilder AddSurfaceFunction(
        this PlotlyChartBuilder builder,
        (double min, double max, double step) xRange,
        (double min, double max, double step) yRange,
        Func<double, double, double> function,
        string? name = null,
        string? colorScale = null,
        bool? showScale = true,
        double? opacity = null)
    {
        // Generate X and Y arrays
        var xValues = new List<double>();
        for (double x = xRange.min; x <= xRange.max; x += xRange.step)
        {
            xValues.Add(x);
        }

        var yValues = new List<double>();
        for (double y = yRange.min; y <= yRange.max; y += yRange.step)
        {
            yValues.Add(y);
        }

        // Generate Z values by evaluating the function
        var zValues = new object[yValues.Count][];
        for (int i = 0; i < yValues.Count; i++)
        {
            zValues[i] = new object[xValues.Count];
            for (int j = 0; j < xValues.Count; j++)
            {
                zValues[i][j] = function(xValues[j], yValues[i]);
            }
        }

        var trace = new SurfaceTrace
        {
            Z = zValues,
            X = xValues.Cast<object>().ToArray(),
            Y = yValues.Cast<object>().ToArray(),
            Name = name,
            ColorScale = colorScale,
            ShowScale = showScale,
            Opacity = opacity
        };

        return builder.AddTrace(trace);
    }

    #endregion

    #region Layout Configuration


    /// <summary>
    /// Sets the bar chart display mode to stacked.
    /// Equivalent to SetBarMode(<see cref="PlotlyBarModes.Stack"/>).
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with stacked bar mode.</returns>
    /// <remarks>
    /// Only applies to bar and column charts. Multiple series will be stacked vertically (columns) or horizontally (bars).
    /// </remarks>
    public static PlotlyChartBuilder SetStacked(this PlotlyChartBuilder builder)
    {
        return builder.WithLayout(builder.Layout with { BarMode = PlotlyBarModes.Stack });
    }

    /// <summary>
    /// Sets the bar chart display mode to 100% stacked.
    /// Equivalent to SetBarMode(<see cref="PlotlyBarModes.Relative"/>).
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with 100% stacked bar mode.</returns>
    /// <remarks>
    /// Only applies to bar and column charts. Shows relative proportions with bars totaling 100%.
    /// </remarks>
    public static PlotlyChartBuilder SetStacked100(this PlotlyChartBuilder builder)
    {
        return builder.WithLayout(builder.Layout with { BarMode = PlotlyBarModes.Relative });
    }

    /// <summary>
    /// Sets the bar chart display mode to grouped (side-by-side bars).
    /// Equivalent to SetBarMode(<see cref="PlotlyBarModes.Group"/>).
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with grouped bar mode.</returns>
    /// <remarks>
    /// This is the default mode for bar charts. Multiple series will be displayed side-by-side for easy comparison.
    /// </remarks>
    public static PlotlyChartBuilder SetGrouped(this PlotlyChartBuilder builder)
    {
        return builder.WithLayout(builder.Layout with { BarMode = PlotlyBarModes.Group });
    }

    #endregion

    #region Axis Configuration

    /// <summary>
    /// Sets the title for the 2D X-axis.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="title">The axis title text (e.g., "Time", "Region", "Temperature (°C)").</param>
    /// <returns>A new immutable PlotlyChartBuilder with the X-axis title set.</returns>
    public static PlotlyChartBuilder SetXAxisTitle(this PlotlyChartBuilder builder, string title)
    {
        var layout = builder.Layout;
        var xAxis = layout.XAxis ?? new PlotlyAxis();
        return builder.WithXAxis(xAxis with { Title = new PlotlyTitle { Text = title } });
    }

    /// <summary>
    /// Sets the title for the 2D Y-axis.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="title">The axis title text (e.g., "Sales ($)", "Count", "Revenue").</param>
    /// <returns>A new immutable PlotlyChartBuilder with the Y-axis title set.</returns>
    public static PlotlyChartBuilder SetYAxisTitle(this PlotlyChartBuilder builder, string title)
    {
        var layout = builder.Layout;
        var yAxis = layout.YAxis ?? new PlotlyAxis();
        return builder.WithYAxis(yAxis with { Title = new PlotlyTitle { Text = title } });
    }

    /// <summary>
    /// Sets the 2D X-axis to use a logarithmic scale.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with logarithmic X-axis.</returns>
    /// <remarks>
    /// Useful for data that spans multiple orders of magnitude. Cannot display zero or negative values.
    /// </remarks>
    public static PlotlyChartBuilder SetLogX(this PlotlyChartBuilder builder)
    {
        var layout = builder.Layout;
        var xAxis = layout.XAxis ?? new PlotlyAxis();
        return builder.WithXAxis(xAxis with { Type = PlotlyAxisTypes.Log });
    }

    /// <summary>
    /// Sets the 2D Y-axis to use a logarithmic scale.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with logarithmic Y-axis.</returns>
    /// <remarks>
    /// Useful for data that spans multiple orders of magnitude. Cannot display zero or negative values.
    /// </remarks>
    public static PlotlyChartBuilder SetLogY(this PlotlyChartBuilder builder)
    {
        var layout = builder.Layout;
        var yAxis = layout.YAxis ?? new PlotlyAxis();
        return builder.WithYAxis(yAxis with { Type = PlotlyAxisTypes.Log });
    }

    /// <summary>
    /// Sets a fixed range for the 2D X-axis.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="min">Minimum value for the X-axis (left edge).</param>
    /// <param name="max">Maximum value for the X-axis (right edge).</param>
    /// <returns>A new immutable PlotlyChartBuilder with the X-axis range set.</returns>
    /// <remarks>
    /// Overrides auto-ranging. Use when you want to zoom to a specific range or ensure consistent scaling across multiple charts.
    /// </remarks>
    public static PlotlyChartBuilder SetXAxisRange(this PlotlyChartBuilder builder, double min, double max)
    {
        var layout = builder.Layout;
        var xAxis = layout.XAxis ?? new PlotlyAxis();
        return builder.WithXAxis(xAxis with { Range = new object[] { min, max } });
    }

    /// <summary>
    /// Sets a fixed range for the 2D Y-axis.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="min">Minimum value for the Y-axis (bottom edge).</param>
    /// <param name="max">Maximum value for the Y-axis (top edge).</param>
    /// <returns>A new immutable PlotlyChartBuilder with the Y-axis range set.</returns>
    /// <remarks>
    /// Overrides auto-ranging. Use when you want to zoom to a specific range or ensure consistent scaling across multiple charts.
    /// </remarks>
    public static PlotlyChartBuilder SetYAxisRange(this PlotlyChartBuilder builder, double min, double max)
    {
        var layout = builder.Layout;
        var yAxis = layout.YAxis ?? new PlotlyAxis();
        return builder.WithYAxis(yAxis with { Range = new object[] { min, max } });
    }

    #endregion

    #region 3D Scene Configuration

    /// <summary>
    /// Sets the title for the X-axis in the 3D scene.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="title">The axis title text.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the scene X-axis title set.</returns>
    public static PlotlyChartBuilder SetSceneXAxisTitle(this PlotlyChartBuilder builder, string title)
    {
        var layout = builder.Layout;
        var scene = layout.Scene ?? new PlotlyScene();
        var xAxis = scene.XAxis ?? new PlotlyAxis();
        
        return builder.WithScene(scene with 
        { 
            XAxis = xAxis with { Title = new PlotlyTitle { Text = title } } 
        });
    }

    /// <summary>
    /// Sets the title for the Y-axis in the 3D scene.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="title">The axis title text.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the scene Y-axis title set.</returns>
    public static PlotlyChartBuilder SetSceneYAxisTitle(this PlotlyChartBuilder builder, string title)
    {
        var layout = builder.Layout;
        var scene = layout.Scene ?? new PlotlyScene();
        var yAxis = scene.YAxis ?? new PlotlyAxis();
        
        return builder.WithScene(scene with 
        { 
            YAxis = yAxis with { Title = new PlotlyTitle { Text = title } } 
        });
    }

    /// <summary>
    /// Sets the title for the Z-axis in the 3D scene.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="title">The axis title text.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the scene Z-axis title set.</returns>
    public static PlotlyChartBuilder SetSceneZAxisTitle(this PlotlyChartBuilder builder, string title)
    {
        var layout = builder.Layout;
        var scene = layout.Scene ?? new PlotlyScene();
        var zAxis = scene.ZAxis ?? new PlotlyAxis();
        
        return builder.WithScene(scene with 
        { 
            ZAxis = zAxis with { Title = new PlotlyTitle { Text = title } } 
        });
    }

    /// <summary>
    /// Sets the range for the Z-axis in the 3D scene.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="min">Minimum value for the Z-axis.</param>
    /// <param name="max">Maximum value for the Z-axis.</param>
    /// <returns>A new immutable PlotlyChartBuilder with the scene Z-axis range set.</returns>
    public static PlotlyChartBuilder SetSceneZAxisRange(this PlotlyChartBuilder builder, double min, double max)
    {
        var layout = builder.Layout;
        var scene = layout.Scene ?? new PlotlyScene();
        var zAxis = scene.ZAxis ?? new PlotlyAxis();
        
        return builder.WithScene(scene with 
        { 
            ZAxis = zAxis with { Range = new object[] { min, max } } 
        });
    }

    /// <summary>
    /// Sets the aspect ratio mode for the 3D scene.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="mode">Aspect mode: "auto", "cube", "data", or "manual".</param>
    /// <returns>A new immutable PlotlyChartBuilder with the scene aspect mode set.</returns>
    /// <remarks>
    /// - "auto": Automatically determines aspect ratio based on data
    /// - "cube": Forces a cube shape (equal aspect ratios)
    /// - "data": Uses data ranges to determine aspect ratio
    /// - "manual": Uses custom aspect ratio specified separately
    /// </remarks>
    public static PlotlyChartBuilder SetSceneAspectMode(this PlotlyChartBuilder builder, string mode)
    {
        var layout = builder.Layout;
        var scene = layout.Scene ?? new PlotlyScene();
        
        return builder.WithScene(scene with { AspectMode = mode });
    }

    #endregion

    #region Legend and Display


    /// <summary>
    /// Controls the visibility of the chart legend.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="show">If true, shows the legend; if false, hides it.</param>
    /// <returns>A new immutable PlotlyChartBuilder with legend visibility set.</returns>
    /// <remarks>
    /// The legend displays trace names and allows toggling trace visibility by clicking.
    /// </remarks>
    public static PlotlyChartBuilder SetShowLegend(this PlotlyChartBuilder builder, bool show)
    {
        return builder.WithLayout(builder.Layout with { ShowLegend = show });
    }

    /// <summary>
    /// Hides the chart legend (convenience method for SetShowLegend(false)).
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with legend hidden.</returns>
    public static PlotlyChartBuilder HideLegend(this PlotlyChartBuilder builder)
    {
        return builder.SetShowLegend(false);
    }

    /// <summary>
    /// Sets the color palette to cycle through for traces when colors are not explicitly specified.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="colors">Array of color strings (hex, RGB, or named colors).</param>
    /// <returns>A new immutable PlotlyChartBuilder with the custom colorway.</returns>
    /// <remarks>
    /// Colors can be hex ("#FF5733"), RGB ("rgb(255,87,51)"), or named colors ("red").
    /// Plotly cycles through this array for each trace added to the chart.
    /// </remarks>
    public static PlotlyChartBuilder SetColorway(this PlotlyChartBuilder builder, params string[] colors)
    {
        return builder.WithLayout(builder.Layout with { Colorway = colors });
    }

    /// <summary>
    /// Sets the chart dimensions.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="width">Width in pixels. If null, uses responsive/container width.</param>
    /// <param name="height">Height in pixels. If null, uses responsive/container height.</param>
    /// <returns>A new immutable PlotlyChartBuilder with size set.</returns>
    /// <remarks>
    /// Setting both to null enables fully responsive sizing based on container dimensions.
    /// </remarks>
    public static PlotlyChartBuilder SetSize(this PlotlyChartBuilder builder, double? width = null, double? height = null)
    {
        return builder.WithLayout(builder.Layout with { Width = width, Height = height });
    }

    #endregion

    #region Template and Theme

    /// <summary>
    /// Sets the chart template/theme.
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <param name="template">Template name. Built-in options: "plotly", "plotly_white", "plotly_dark", "ggplot2", "seaborn", "simple_white", "none".</param>
    /// <returns>A new immutable PlotlyChartBuilder with the specified template.</returns>
    /// <remarks>
    /// Templates control the overall styling including colors, fonts, and backgrounds.
    /// Default is "plotly".
    /// </remarks>
    public static PlotlyChartBuilder SetTemplate(this PlotlyChartBuilder builder, string template)
    {
        return builder.WithLayout(builder.Layout with { Template = template });
    }

    /// <summary>
    /// Sets the chart to use dark mode theme (convenience method for SetTemplate("plotly_dark")).
    /// </summary>
    /// <param name="builder">The chart builder instance.</param>
    /// <returns>A new immutable PlotlyChartBuilder with dark theme applied.</returns>
    public static PlotlyChartBuilder SetDarkMode(this PlotlyChartBuilder builder)
    {
        return builder.SetTemplate("plotly_dark");
    }

    #endregion
}
