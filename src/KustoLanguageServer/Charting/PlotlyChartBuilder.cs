using System.Collections.Immutable;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Kusto.Lsp;

/// <summary>
/// Immutable fluent builder for creating Plotly charts with C# idioms.
/// </summary>
public sealed class PlotlyChartBuilder
{
    private readonly ImmutableList<PlotlyTrace> _traces;
    private readonly PlotlyLayout _layout;
    private readonly PlotlyConfig _config;

    public PlotlyChartBuilder()
        : this(ImmutableList<PlotlyTrace>.Empty, new PlotlyLayout(), new PlotlyConfig())
    {
    }

    private PlotlyChartBuilder(
        ImmutableList<PlotlyTrace> traces,
        PlotlyLayout layout,
        PlotlyConfig config)
    {
        _traces = traces;
        _layout = layout;
        _config = config;
    }

    /// <summary>
    /// The current list of traces.
    /// </summary>
    public ImmutableList<PlotlyTrace> Traces => _traces;

    /// <summary>
    /// The current layout.
    /// </summary>
    public PlotlyLayout Layout => _layout;

    /// <summary>
    /// The current configuration.
    /// </summary>
    public PlotlyConfig Config => _config;

    /// <summary>
    /// The current 2D X-axis. Returns null if not configured.
    /// </summary>
    public PlotlyAxis? XAxis => _layout.XAxis;

    /// <summary>
    /// The current 2D Y-axis. Returns null if not configured.
    /// </summary>
    public PlotlyAxis? YAxis => _layout.YAxis;

    /// <summary>
    /// Returns a new builder with the added trace.
    /// </summary>
    public PlotlyChartBuilder AddTrace(PlotlyTrace trace)
    {
        return new PlotlyChartBuilder(_traces.Add(trace), _layout, _config);
    }

    /// <summary>
    /// Returns a new builder with the replaced layout.
    /// </summary>
    public PlotlyChartBuilder WithLayout(PlotlyLayout layout)
    {
        return new PlotlyChartBuilder(_traces, layout, _config);
    }

    /// <summary>
    /// Returns a new builder with the replaced configuration.
    /// </summary>
    public PlotlyChartBuilder WithConfig(PlotlyConfig config)
    {
        return new PlotlyChartBuilder(_traces, _layout, config);
    }

    /// <summary>
    /// Returns a new builder with the updated title.
    /// </summary>
    public PlotlyChartBuilder WithTitle(string title)
    {
        return new PlotlyChartBuilder(_traces, _layout with { Title = title }, _config);
    }

    /// <summary>
    /// Replaces the 2D X-axis with a new axis configuration.
    /// </summary>
    public PlotlyChartBuilder WithXAxis(PlotlyAxis axis)
    {
        return new PlotlyChartBuilder(_traces, _layout with { XAxis = axis }, _config);
    }

    /// <summary>
    /// Replaces the 2D Y-axis with a new axis configuration.
    /// </summary>
    public PlotlyChartBuilder WithYAxis(PlotlyAxis axis)
    {
        return new PlotlyChartBuilder(_traces, _layout with { YAxis = axis }, _config);
    }

    /// <summary>
    /// Replaces the 3D scene configuration.
    /// </summary>
    public PlotlyChartBuilder WithScene(PlotlyScene scene)
    {
        return new PlotlyChartBuilder(_traces, _layout with { Scene = scene }, _config);
    }

    /// <summary>
    /// Adds a secondary axis (e.g., "yaxis2") to the layout.
    /// </summary>
    public PlotlyChartBuilder AddSecondaryYAxis(string axisId, PlotlyAxis axis)
    {
        var newAxes = _layout.AdditionalAxes.SetItem(axisId, axis);
        return new PlotlyChartBuilder(_traces, _layout with { AdditionalAxes = newAxes }, _config);
    }

    /// <summary>
    /// Sets the bar display mode. Use <see cref="PlotlyBarModes"/> constants.
    /// </summary>
    public PlotlyChartBuilder SetBarMode(string barMode)
    {
        return new PlotlyChartBuilder(_traces, _layout with { BarMode = barMode }, _config);
    }

    /// <summary>
    /// Deetermines is the legend is shown or not.
    /// </summary>
    public PlotlyChartBuilder ShowLegend(bool show = true)
    {
        return new PlotlyChartBuilder(_traces, _layout with { ShowLegend = show }, _config);
    }

    /// <summary>
    /// Sets the template/theme for the chart. Use <see cref="PlotlyTemplates"/> constants.
    /// </summary>
    public PlotlyChartBuilder WithTemplate(string template)
    {
        return new PlotlyChartBuilder(_traces, _layout with { Template = template }, _config);
    }

    /// <summary>
    /// Applies dark mode styling to the chart (dark backgrounds, light text).
    /// </summary>
    public PlotlyChartBuilder WithDarkMode()
    {
        return new PlotlyChartBuilder(_traces, _layout with 
        { 
            PaperBackgroundColor = "#1e1e1e",
            PlotBackgroundColor = "#1e1e1e",
            Font = new PlotlyFont { Color = "#f2f5fa" },
            Colorway = PlotlyColorways.Default,
            XAxis = (_layout.XAxis ?? new PlotlyAxis()) with 
            { 
                Color = "#f2f5fa", 
                GridColor = "#444444",
                LineColor = "#666666",
                ZeroLineColor = "#666666"
            },
            YAxis = (_layout.YAxis ?? new PlotlyAxis()) with 
            { 
                Color = "#f2f5fa", 
                GridColor = "#444444",
                LineColor = "#666666",
                ZeroLineColor = "#666666"
            }
        }, _config);
    }

    /// <summary>
    /// Returns the text of an HTML div containing the Plotly chart.
    /// The Plotly.js library must be loaded separately elsewhere in the HTML document.
    /// </summary>
    public string ToHtmlDiv(string divId = "plotly-chart")
    {
        var options = new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        var dataJson = JsonSerializer.Serialize(_traces, options);
        var layoutJson = JsonSerializer.Serialize(_layout, options);
        var configJson = JsonSerializer.Serialize(_config, options);

        var sb = new StringBuilder();
        sb.AppendLine($"<div id=\"{divId}\" style=\"width:100%; height:100%;\"></div>");
        sb.AppendLine("<script>");
        sb.AppendLine("try {");
        sb.AppendLine($"  var data = {dataJson};");
        sb.AppendLine($"  var layout = {layoutJson};");
        sb.AppendLine($"  var config = {configJson};");
        sb.AppendLine($"  Plotly.newPlot('{divId}', data, layout, config);");
        sb.AppendLine("} catch(e) { console.error('Plotly error:', e); document.getElementById('" + divId + "').innerText = 'Chart error: ' + e.message; }");
        sb.AppendLine("</script>");

        return sb.ToString();
    }
}

/// <summary>
/// Base record for all Plotly traces.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(BarTrace), typeDiscriminator: "bar")]
[JsonDerivedType(typeof(ScatterTrace), typeDiscriminator: "scatter")]
[JsonDerivedType(typeof(PieTrace), typeDiscriminator: "pie")]
[JsonDerivedType(typeof(HistogramTrace), typeDiscriminator: "histogram")]
[JsonDerivedType(typeof(HeatmapTrace), typeDiscriminator: "heatmap")]
[JsonDerivedType(typeof(BoxTrace), typeDiscriminator: "box")]
[JsonDerivedType(typeof(ViolinTrace), typeDiscriminator: "violin")]
[JsonDerivedType(typeof(SurfaceTrace), typeDiscriminator: "surface")]
[JsonDerivedType(typeof(IndicatorTrace), typeDiscriminator: "indicator")]
public abstract record PlotlyTrace
{
    /// <summary>
    /// Name of the trace, displayed in the legend and on hover.
    /// </summary>
    [JsonPropertyName("name")]
    public string? Name { get; init; }

    [JsonPropertyName("xaxis")]
    public string? XAxis { get; init; }

    [JsonPropertyName("yaxis")]
    public string? YAxis { get; init; }
}

/// <summary>
/// Bar chart trace.
/// </summary>
public sealed record BarTrace : PlotlyTrace
{
    /// <summary>
    /// X-axis values. Must be JSON-serializable types: numbers, strings, DateTime, or null.
    /// </summary>
    [JsonPropertyName("x")]
    public required object[] X { get; init; } = Array.Empty<object>();

    /// <summary>
    /// Y-axis values. Must be JSON-serializable types: numbers, strings, DateTime, or null.
    /// </summary>
    [JsonPropertyName("y")]
    public required object[] Y { get; init; } = Array.Empty<object>();

    /// <summary>
    /// Bar orientation. Use <see cref="PlotlyOrientations"/> constants.
    /// </summary>
    [JsonPropertyName("orientation")]
    public string Orientation { get; init; } = PlotlyOrientations.Vertical;

    /// <summary>
    /// Offset group for positioning bars when using multiple Y-axes or overlay mode.
    /// </summary>
    [JsonPropertyName("offsetgroup")]
    public string? OffsetGroup { get; init; }

    /// <summary>
    /// Marker styling for the bars (color, size, opacity).
    /// </summary>
    [JsonPropertyName("marker")]
    public PlotlyMarker? Marker { get; init; }
}

/// <summary>
/// Line/Scatter chart trace.
/// </summary>
public sealed record ScatterTrace : PlotlyTrace
{
    /// <summary>
    /// X-axis values. Must be JSON-serializable types: numbers, strings, DateTime, or null.
    /// </summary>
    [JsonPropertyName("x")]
    public required object[] X { get; init; } = Array.Empty<object>();

    /// <summary>
    /// Y-axis values. Must be JSON-serializable types: numbers, strings, DateTime, or null.
    /// </summary>
    [JsonPropertyName("y")]
    public required object[] Y { get; init; } = Array.Empty<object>();

    /// <summary>
    /// Display mode. Use <see cref="PlotlyScatterModes"/> constants.
    /// </summary>
    [JsonPropertyName("mode")]
    public string Mode { get; init; } = PlotlyScatterModes.Lines;

    /// <summary>
    /// Fill mode for area charts. Use <see cref="PlotlyFillModes"/> constants. If null, no fill.
    /// </summary>
    [JsonPropertyName("fill")]
    public string? Fill { get; init; }

    /// <summary>
    /// Line styling (color, width, dash style).
    /// </summary>
    [JsonPropertyName("line")]
    public PlotlyLine? Line { get; init; }

    /// <summary>
    /// Marker styling for data points (color, size, opacity).
    /// </summary>
    [JsonPropertyName("marker")]
    public PlotlyMarker? Marker { get; init; }
}

/// <summary>
/// Pie chart trace.
/// </summary>
public sealed record PieTrace : PlotlyTrace
{
    /// <summary>
    /// Sector labels. Must be JSON-serializable types: strings, numbers, or null.
    /// </summary>
    [JsonPropertyName("labels")]
    public required object[] Labels { get; init; } = Array.Empty<object>();

    /// <summary>
    /// Sector values (sizes). Must be numeric values.
    /// </summary>
    [JsonPropertyName("values")]
    public required object[] Values { get; init; } = Array.Empty<object>();

    /// <summary>
    /// Fraction of the radius to cut out of the pie. 0 for pie, >0 for donut chart.
    /// </summary>
    [JsonPropertyName("hole")]
    public double? Hole { get; init; }

    /// <summary>
    /// Marker styling for the pie sectors (color, opacity).
    /// </summary>
    [JsonPropertyName("marker")]
    public PlotlyMarker? Marker { get; init; }

    /// <summary>
    /// Text information to display on hover.
    /// </summary>
    [JsonPropertyName("hoverinfo")]
    public string? HoverInfo { get; init; }
}

/// <summary>
/// Histogram trace.
/// </summary>
public sealed record HistogramTrace : PlotlyTrace
{
    /// <summary>
    /// Sample values for the histogram. Must be numeric.
    /// </summary>
    [JsonPropertyName("x")]
    public object[]? X { get; init; }

    /// <summary>
    /// Sample values for the histogram (alternative to X for vertical orientation). Must be numeric.
    /// </summary>
    [JsonPropertyName("y")]
    public object[]? Y { get; init; }

    /// <summary>
    /// Number of bins or binning specification.
    /// </summary>
    [JsonPropertyName("nbinsx")]
    public int? NBinsX { get; init; }

    /// <summary>
    /// Number of bins for Y-axis binning.
    /// </summary>
    [JsonPropertyName("nbinsy")]
    public int? NBinsY { get; init; }

    /// <summary>
    /// Histogram normalization mode. Use <see cref="PlotlyHistogramNorms"/> constants. If null, shows raw counts.
    /// </summary>
    [JsonPropertyName("histnorm")]
    public string? HistNorm { get; init; }

    /// <summary>
    /// Marker styling for the histogram bars (color, opacity).
    /// </summary>
    [JsonPropertyName("marker")]
    public PlotlyMarker? Marker { get; init; }
}

/// <summary>
/// Heatmap trace.
/// </summary>
public sealed record HeatmapTrace : PlotlyTrace
{
    /// <summary>
    /// X coordinates. Can be 1D array or null for auto-generated coordinates.
    /// </summary>
    [JsonPropertyName("x")]
    public object[]? X { get; init; }

    /// <summary>
    /// Y coordinates. Can be 1D array or null for auto-generated coordinates.
    /// </summary>
    [JsonPropertyName("y")]
    public object[]? Y { get; init; }

    /// <summary>
    /// Z values as a 2D array (array of arrays). Must be numeric values.
    /// </summary>
    [JsonPropertyName("z")]
    public required object[][] Z { get; init; }

    /// <summary>
    /// Colorscale for the heatmap. Use <see cref="PlotlyColorScales"/> constants. If null, uses default colorscale.
    /// </summary>
    [JsonPropertyName("colorscale")]
    public string? ColorScale { get; init; }

    /// <summary>
    /// Whether to show the color bar.
    /// </summary>
    [JsonPropertyName("showscale")]
    public bool? ShowScale { get; init; }
}

/// <summary>
/// Box plot trace.
/// </summary>
public sealed record BoxTrace : PlotlyTrace
{

    /// <summary>
    /// X coordinates or categories for the boxes.
    /// </summary>
    [JsonPropertyName("x")]
    public object[]? X { get; init; }

    /// <summary>
    /// Y values for the box plot. Must be numeric.
    /// </summary>
    [JsonPropertyName("y")]
    public object[]? Y { get; init; }

    /// <summary>
    /// Box orientation. Use <see cref="PlotlyOrientations"/> constants. If null, defaults to vertical.
    /// </summary>
    [JsonPropertyName("orientation")]
    public string? Orientation { get; init; }

    /// <summary>
    /// How to display box points. Use <see cref="PlotlyBoxPointsModes"/> constants. If null, uses default behavior.
    /// </summary>
    [JsonPropertyName("boxpoints")]
    public object? BoxPoints { get; init; }

    /// <summary>
    /// Marker styling for outlier points (color, size, opacity).
    /// </summary>
    [JsonPropertyName("marker")]
    public PlotlyMarker? Marker { get; init; }

    /// <summary>
    /// Line styling for the box outline (color, width).
    /// </summary>
    [JsonPropertyName("line")]
    public PlotlyLine? Line { get; init; }
}

/// <summary>
/// Violin plot trace.
/// </summary>
public sealed record ViolinTrace : PlotlyTrace
{
    /// <summary>
    /// X coordinates or categories for the violins.
    /// </summary>
    [JsonPropertyName("x")]
    public object[]? X { get; init; }

    /// <summary>
    /// Y values for the violin plot. Must be numeric.
    /// </summary>
    [JsonPropertyName("y")]
    public object[]? Y { get; init; }

    /// <summary>
    /// Violin orientation. Use <see cref="PlotlyOrientations"/> constants. If null, defaults to vertical.
    /// </summary>
    [JsonPropertyName("orientation")]
    public string? Orientation { get; init; }

    /// <summary>
    /// Whether to show the box plot inside the violin.
    /// </summary>
    [JsonPropertyName("box")]
    public object? Box { get; init; }

    /// <summary>
    /// Whether to show the mean line.
    /// </summary>
    [JsonPropertyName("meanline")]
    public object? MeanLine { get; init; }

    /// <summary>
    /// Marker styling for data points (color, size, opacity).
    /// </summary>
    [JsonPropertyName("marker")]
    public PlotlyMarker? Marker { get; init; }

    /// <summary>
    /// Line styling for the violin outline (color, width).
    /// </summary>
    [JsonPropertyName("line")]
    public PlotlyLine? Line { get; init; }
}

/// <summary>
/// 3D surface plot trace.
/// </summary>
public sealed record SurfaceTrace : PlotlyTrace
{
    /// <summary>
    /// X coordinates. Can be 1D array or null for auto-generated coordinates.
    /// </summary>
    [JsonPropertyName("x")]
    public object[]? X { get; init; }

    /// <summary>
    /// Y coordinates. Can be 1D array or null for auto-generated coordinates.
    /// </summary>
    [JsonPropertyName("y")]
    public object[]? Y { get; init; }

    /// <summary>
    /// Z values as a 2D array (array of arrays) representing the surface heights. Must be numeric values.
    /// </summary>
    [JsonPropertyName("z")]
    public required object[][] Z { get; init; }

    /// <summary>
    /// Colorscale for the surface. Use <see cref="PlotlyColorScales"/> constants. If null, uses default colorscale.
    /// </summary>
    [JsonPropertyName("colorscale")]
    public string? ColorScale { get; init; }

    /// <summary>
    /// Whether to show the color bar.
    /// </summary>
    [JsonPropertyName("showscale")]
    public bool? ShowScale { get; init; }

    /// <summary>
    /// Surface opacity (0.0 to 1.0, where 0 is transparent and 1 is opaque).
    /// </summary>
    [JsonPropertyName("opacity")]
    public double? Opacity { get; init; }

    /// <summary>
    /// Array of colors for custom surface coloring. If provided, overrides the colorscale.
    /// </summary>
    [JsonPropertyName("surfacecolor")]
    public object[][]? SurfaceColor { get; init; }

    /// <summary>
    /// Contour configuration for the surface (x, y, z contours).
    /// </summary>
    [JsonPropertyName("contours")]
    public object? Contours { get; init; }
}

/// <summary>
/// Indicator trace for displaying single values/KPIs (card charts).
/// </summary>
public sealed record IndicatorTrace : PlotlyTrace
{
    /// <summary>
    /// The value to display.
    /// </summary>
    [JsonPropertyName("value")]
    public required double Value { get; init; }

    /// <summary>
    /// Display mode. Use <see cref="PlotlyIndicatorModes"/> constants.
    /// </summary>
    [JsonPropertyName("mode")]
    public string Mode { get; init; } = PlotlyIndicatorModes.Number;

    /// <summary>
    /// Title configuration for the indicator.
    /// </summary>
    [JsonPropertyName("title")]
    public PlotlyTitle? Title { get; init; }

    /// <summary>
    /// Number formatting configuration.
    /// </summary>
    [JsonPropertyName("number")]
    public PlotlyIndicatorNumber? Number { get; init; }

    /// <summary>
    /// Delta configuration for showing change from a reference value.
    /// </summary>
    [JsonPropertyName("delta")]
    public PlotlyIndicatorDelta? Delta { get; init; }

    /// <summary>
    /// Gauge configuration for gauge-style indicators.
    /// </summary>
    [JsonPropertyName("gauge")]
    public object? Gauge { get; init; }

    /// <summary>
    /// Domain (position and size) of the indicator in the plot area.
    /// </summary>
    [JsonPropertyName("domain")]
    public object? Domain { get; init; }
}

/// <summary>
/// Marker styling for traces.
/// </summary>
public sealed record PlotlyMarker
{
    /// <summary>
    /// Marker color. Use hex ("#FF5733"), RGB ("rgb(255,87,51)"), or named colors.
    /// </summary>
    [JsonPropertyName("color")]
    public string? Color { get; init; }

    /// <summary>
    /// Marker size in pixels.
    /// </summary>
    [JsonPropertyName("size")]
    public double? Size { get; init; }

    /// <summary>
    /// Marker opacity (0.0 to 1.0, where 0 is transparent and 1 is opaque).
    /// </summary>
    [JsonPropertyName("opacity")]
    public double? Opacity { get; init; }
}

/// <summary>
/// Line styling for traces.
/// </summary>
public sealed record PlotlyLine
{
    /// <summary>
    /// Line color. Use hex ("#FF5733"), RGB ("rgb(255,87,51)"), or named colors.
    /// </summary>
    [JsonPropertyName("color")]
    public string? Color { get; init; }

    /// <summary>
    /// Line width in pixels.
    /// </summary>
    [JsonPropertyName("width")]
    public double? Width { get; init; }

    /// <summary>
    /// Line dash style. Use <see cref="PlotlyDashStyles"/> constants. If null, uses solid line.
    /// </summary>
    [JsonPropertyName("dash")]
    public string? Dash { get; init; }
}

/// <summary>
/// Plotly axis configuration.
/// </summary>
public sealed record PlotlyAxis
{
    /// <summary>
    /// Title configuration for the axis.
    /// </summary>
    [JsonPropertyName("title")]
    public PlotlyTitle? Title { get; init; }

    /// <summary>
    /// Axis type. Use <see cref="PlotlyAxisTypes"/> constants. If null, defaults to linear scale.
    /// </summary>
    [JsonPropertyName("type")]
    public string? Type { get; init; }

    /// <summary>
    /// Axis position. Use <see cref="PlotlyAxisSides"/> constants. If null, uses default position for the axis.
    /// </summary>
    [JsonPropertyName("side")]
    public string? Side { get; init; }

    /// <summary>
    /// ID of axis to overlay on (e.g., "y" to overlay on primary y-axis).
    /// </summary>
    [JsonPropertyName("overlaying")]
    public string? Overlaying { get; init; }

    /// <summary>
    /// Axis range as [min, max]. Values must be numbers or null for auto-range.
    /// </summary>
    [JsonPropertyName("range")]
    public object[]? Range { get; init; }

    /// <summary>
    /// Whether to automatically determine the axis range based on data. If null, uses default behavior.
    /// </summary>
    [JsonPropertyName("autorange")]
    public bool? AutoRange { get; init; }

    /// <summary>
    /// Color for axis line, tick marks, and tick labels. Use hex, RGB, or named colors.
    /// </summary>
    [JsonPropertyName("color")]
    public string? Color { get; init; }

    /// <summary>
    /// Color of the grid lines. Use hex, RGB, or named colors.
    /// </summary>
    [JsonPropertyName("gridcolor")]
    public string? GridColor { get; init; }

    /// <summary>
    /// Color of the axis line. Use hex, RGB, or named colors.
    /// </summary>
    [JsonPropertyName("linecolor")]
    public string? LineColor { get; init; }

    /// <summary>
    /// Color of the zero line. Use hex, RGB, or named colors.
    /// </summary>
    [JsonPropertyName("zerolinecolor")]
    public string? ZeroLineColor { get; init; }
}

/// <summary>
/// 3D scene configuration for surface and other 3D plots.
/// </summary>
public sealed record PlotlyScene
{
    /// <summary>
    /// X-axis configuration for the 3D scene.
    /// </summary>
    [JsonPropertyName("xaxis")]
    public PlotlyAxis? XAxis { get; init; }

    /// <summary>
    /// Y-axis configuration for the 3D scene.
    /// </summary>
    [JsonPropertyName("yaxis")]
    public PlotlyAxis? YAxis { get; init; }

    /// <summary>
    /// Z-axis configuration for the 3D scene.
    /// </summary>
    [JsonPropertyName("zaxis")]
    public PlotlyAxis? ZAxis { get; init; }

    /// <summary>
    /// Camera configuration for the 3D view (eye position, center, up vector).
    /// </summary>
    [JsonPropertyName("camera")]
    public object? Camera { get; init; }

    /// <summary>
    /// Aspect ratio configuration for the 3D scene (x, y, z ratios).
    /// </summary>
    [JsonPropertyName("aspectratio")]
    public object? AspectRatio { get; init; }

    /// <summary>
    /// Aspect mode: "auto", "cube", "data", or "manual".
    /// </summary>
    [JsonPropertyName("aspectmode")]
    public string? AspectMode { get; init; }
}

/// <summary>
/// Title configuration.
/// </summary>
public sealed record PlotlyTitle
{
    /// <summary>
    /// The title text to display.
    /// </summary>
    [JsonPropertyName("text")]
    public string? Text { get; init; }

    /// <summary>
    /// Font styling for the title text.
    /// </summary>
    [JsonPropertyName("font")]
    public PlotlyFont? Font { get; init; }
}

/// <summary>
/// Font configuration.
/// </summary>
public sealed record PlotlyFont
{
    /// <summary>
    /// Font family name (e.g., "Arial", "Courier New", "Times New Roman").
    /// </summary>
    [JsonPropertyName("family")]
    public string? Family { get; init; }

    /// <summary>
    /// Font size in pixels.
    /// </summary>
    [JsonPropertyName("size")]
    public double? Size { get; init; }

    /// <summary>
    /// Font color. Use hex ("#FF5733"), RGB ("rgb(255,87,51)"), or named colors.
    /// </summary>
    [JsonPropertyName("color")]
    public string? Color { get; init; }
}

/// <summary>
/// Number formatting for indicator traces.
/// </summary>
public sealed record PlotlyIndicatorNumber
{
    /// <summary>
    /// Number format prefix (e.g., "$" for currency).
    /// </summary>
    [JsonPropertyName("prefix")]
    public string? Prefix { get; init; }

    /// <summary>
    /// Number format suffix (e.g., "%" for percentage).
    /// </summary>
    [JsonPropertyName("suffix")]
    public string? Suffix { get; init; }

    /// <summary>
    /// Font styling for the number.
    /// </summary>
    [JsonPropertyName("font")]
    public PlotlyFont? Font { get; init; }

    /// <summary>
    /// Number format (e.g., ".2f" for 2 decimal places).
    /// </summary>
    [JsonPropertyName("valueformat")]
    public string? ValueFormat { get; init; }
}

/// <summary>
/// Delta configuration for indicator traces (shows change from reference).
/// </summary>
public sealed record PlotlyIndicatorDelta
{
    /// <summary>
    /// Reference value to compare against.
    /// </summary>
    [JsonPropertyName("reference")]
    public double? Reference { get; init; }

    /// <summary>
    /// Whether to show the delta as relative (percentage).
    /// </summary>
    [JsonPropertyName("relative")]
    public bool? Relative { get; init; }

    /// <summary>
    /// Position of the delta ("left", "right", "top", "bottom").
    /// </summary>
    [JsonPropertyName("position")]
    public string? Position { get; init; }

    /// <summary>
    /// Font styling for the delta.
    /// </summary>
    [JsonPropertyName("font")]
    public PlotlyFont? Font { get; init; }

    /// <summary>
    /// Whether the delta is increasing or decreasing.
    /// </summary>
    [JsonPropertyName("increasing")]
    public object? Increasing { get; init; }

    /// <summary>
    /// Whether the delta is decreasing.
    /// </summary>
    [JsonPropertyName("decreasing")]
    public object? Decreasing { get; init; }
}

/// <summary>
/// Plotly layout configuration.
/// </summary>
public sealed record PlotlyLayout
{
    /// <summary>
    /// Title configuration object. Use the Title property for simple string titles.
    /// </summary>
    [JsonPropertyName("title")]
    public PlotlyTitle? TitleObject { get; init; }

    [JsonIgnore]
    public string? Title
    {
        get => TitleObject?.Text;
        init => TitleObject = value != null ? new PlotlyTitle { Text = value } : null;
    }

    /// <summary>
    /// Primary X-axis configuration for 2D charts. If null, uses Plotly defaults.
    /// </summary>
    [JsonPropertyName("xaxis")]
    public PlotlyAxis? XAxis { get; init; }

    /// <summary>
    /// Primary Y-axis configuration for 2D charts. If null, uses Plotly defaults.
    /// </summary>
    [JsonPropertyName("yaxis")]
    public PlotlyAxis? YAxis { get; init; }

    /// <summary>
    /// Additional axes (e.g., "yaxis2", "yaxis3"). Values must be PlotlyAxis objects.
    /// </summary>
    [JsonIgnore]
    public ImmutableDictionary<string, PlotlyAxis> AdditionalAxes { get; init; } = ImmutableDictionary<string, PlotlyAxis>.Empty;

    private ImmutableDictionary<string, JsonElement>? _extensionData;
    
    /// <summary>
    /// JSON extension data for serializing additional axes as top-level layout properties.
    /// Automatically populated from AdditionalAxes dictionary.
    /// </summary>
    [JsonExtensionData]
    public ImmutableDictionary<string, JsonElement> ExtensionData
    {
        get
        {
            if (_extensionData == null)
            {
                _extensionData = this.AdditionalAxes.ToImmutableDictionary(kvp => kvp.Key, kvp => JsonSerializer.SerializeToElement(kvp.Value));
            }
            return _extensionData;
        }
    }

    /// <summary>
    /// Bar display mode. Use <see cref="PlotlyBarModes"/> constants. If null, uses default grouping behavior.
    /// </summary>
    [JsonPropertyName("barmode")]
    public string? BarMode { get; init; }

    /// <summary>
    /// Whether to show the legend. Default is true.
    /// </summary>
    [JsonPropertyName("showlegend")]
    public bool ShowLegend { get; init; } = true;

    /// <summary>
    /// Template/theme to use for the chart. Use <see cref="PlotlyTemplates"/> constants.
    /// This property is not serialized directly - it's handled specially in ToHtmlDiv to reference
    /// the actual Plotly template object.
    /// </summary>
    [JsonIgnore]
    public string? Template { get; init; }

    /// <summary>
    /// Background color of the plotting area. Use hex, RGB, or named colors.
    /// </summary>
    [JsonPropertyName("plot_bgcolor")]
    public string? PlotBackgroundColor { get; init; }

    /// <summary>
    /// Background color of the paper/canvas around the plot. Use hex, RGB, or named colors.
    /// </summary>
    [JsonPropertyName("paper_bgcolor")]
    public string? PaperBackgroundColor { get; init; }

    /// <summary>
    /// Default font settings for the entire chart.
    /// </summary>
    [JsonPropertyName("font")]
    public PlotlyFont? Font { get; init; }

    /// <summary>
    /// Hover behavior. Use <see cref="PlotlyHoverModes"/> constants.
    /// </summary>
    [JsonPropertyName("hovermode")]
    public string? HoverMode { get; init; } = PlotlyHoverModes.Closest;

    /// <summary>
    /// 3D scene configuration for surface and other 3D plots.
    /// </summary>
    [JsonPropertyName("scene")]
    public PlotlyScene? Scene { get; init; }

    /// <summary>
    /// Array of colors to cycle through for traces when colors are not explicitly specified.
    /// Use hex colors (e.g., "#FF5733"), RGB strings (e.g., "rgb(255,87,51)"), or named colors.
    /// If null, uses the template's default colorway.
    /// </summary>
    [JsonPropertyName("colorway")]
    public string[]? Colorway { get; init; }

    /// <summary>
    /// Chart width in pixels. If null, uses responsive/container width.
    /// </summary>
    [JsonPropertyName("width")]
    public double? Width { get; init; }

    /// <summary>
    /// Chart height in pixels. If null, uses responsive/container height.
    /// </summary>
    [JsonPropertyName("height")]
    public double? Height { get; init; }
}

/// <summary>
/// Plotly configuration options.
/// </summary>
public sealed record PlotlyConfig
{
    /// <summary>
    /// Whether the chart should be responsive and resize with its container. Default is true.
    /// </summary>
    [JsonPropertyName("responsive")]
    public bool Responsive { get; init; } = true;

    /// <summary>
    /// Whether to display the mode bar (toolbar with zoom, pan, download buttons). Default is true.
    /// </summary>
    [JsonPropertyName("displayModeBar")]
    public bool DisplayModeBar { get; init; } = true;

    /// <summary>
    /// Whether to display the Plotly logo in the mode bar. Default is false.
    /// </summary>
    [JsonPropertyName("displaylogo")]
    public bool DisplayLogo { get; init; } = false;

    /// <summary>
    /// Options for the "Download plot as PNG" button. Value should be a JSON-serializable object.
    /// </summary>
    [JsonPropertyName("toImageButtonOptions")]
    public object? ToImageButtonOptions { get; init; }
}
