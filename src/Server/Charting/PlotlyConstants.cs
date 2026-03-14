namespace Kusto.Vscode;

/// <summary>
/// Hover interaction modes for Plotly charts.
/// </summary>
public static class PlotlyHoverModes
{
    /// <summary>Show data for all points with the same X value.</summary>
    public const string X = "x";
    
    /// <summary>Show data for all points with the same Y value.</summary>
    public const string Y = "y";
    
    /// <summary>Show data for the single closest point.</summary>
    public const string Closest = "closest";
    
    /// <summary>Show a single hover label for all points with the same X value.</summary>
    public const string XUnified = "x unified";
    
    /// <summary>Show a single hover label for all points with the same Y value.</summary>
    public const string YUnified = "y unified";
    
    /// <summary>Disable hover interactions.</summary>
    public const string False = "false";
}

/// <summary>
/// Bar display modes for Plotly bar charts.
/// </summary>
public static class PlotlyBarModes
{
    /// <summary>Bars are displayed side-by-side (grouped).</summary>
    public const string Group = "group";
    
    /// <summary>Bars are stacked on top of each other.</summary>
    public const string Stack = "stack";
    
    /// <summary>Bars can overlap (useful for multiple Y-axes).</summary>
    public const string Overlay = "overlay";
    
    /// <summary>Bars are stacked as percentages (100% stacked).</summary>
    public const string Relative = "relative";
}

/// <summary>
/// Orientation modes for bar, box, and violin charts.
/// </summary>
public static class PlotlyOrientations
{
    /// <summary>Vertical orientation (columns).</summary>
    public const string Vertical = "v";
    
    /// <summary>Horizontal orientation (bars).</summary>
    public const string Horizontal = "h";
}

/// <summary>
/// Display modes for scatter/line traces.
/// </summary>
public static class PlotlyScatterModes
{
    /// <summary>Display only lines connecting points.</summary>
    public const string Lines = "lines";
    
    /// <summary>Display only markers at data points.</summary>
    public const string Markers = "markers";
    
    /// <summary>Display both lines and markers.</summary>
    public const string LinesAndMarkers = "lines+markers";
    
    /// <summary>Display no visual elements (useful for hover-only traces).</summary>
    public const string None = "none";
}

/// <summary>
/// Fill modes for area charts using scatter traces.
/// </summary>
public static class PlotlyFillModes
{
    /// <summary>No fill (default for line/scatter charts).</summary>
    public const string None = "none";
    
    /// <summary>Fill to Y=0.</summary>
    public const string ToZeroY = "tozeroy";
    
    /// <summary>Fill to X=0.</summary>
    public const string ToZeroX = "tozerox";
    
    /// <summary>Fill to the next trace (for stacked area charts).</summary>
    public const string ToNextY = "tonexty";
    
    /// <summary>Fill to the next trace horizontally.</summary>
    public const string ToNextX = "tonextx";
    
    /// <summary>Fill to the first point (for closed shapes).</summary>
    public const string ToSelf = "toself";
}

/// <summary>
/// Display modes for indicator traces (card charts/KPIs).
/// </summary>
public static class PlotlyIndicatorModes
{
    /// <summary>Display only the numeric value.</summary>
    public const string Number = "number";
    
    /// <summary>Display only the delta (change).</summary>
    public const string Delta = "delta";
    
    /// <summary>Display only a gauge.</summary>
    public const string Gauge = "gauge";
    
    /// <summary>Display number and delta.</summary>
    public const string NumberAndDelta = "number+delta";
    
    /// <summary>Display number and gauge.</summary>
    public const string NumberAndGauge = "number+gauge";
    
    /// <summary>Display delta and gauge.</summary>
    public const string DeltaAndGauge = "delta+gauge";
    
    /// <summary>Display number, delta, and gauge.</summary>
    public const string NumberDeltaAndGauge = "number+delta+gauge";
}

/// <summary>
/// Axis scale types for Plotly charts.
/// </summary>
public static class PlotlyAxisTypes
{
    /// <summary>Linear scale (default).</summary>
    public const string Linear = "linear";
    
    /// <summary>Logarithmic scale.</summary>
    public const string Log = "log";
    
    /// <summary>Date/time scale (for DateTime data).</summary>
    public const string Date = "date";
    
    /// <summary>Categorical scale (for discrete categories).</summary>
    public const string Category = "category";
}

/// <summary>
/// Drag interaction modes for Plotly charts.
/// </summary>
public static class PlotlyDragModes
{
    /// <summary>Drag to zoom into a rectangular area.</summary>
    public const string Zoom = "zoom";

    /// <summary>Drag to pan the chart.</summary>
    public const string Pan = "pan";

    /// <summary>Drag to select data points in a rectangle.</summary>
    public const string Select = "select";

    /// <summary>Drag to select data points with a freeform lasso.</summary>
    public const string Lasso = "lasso";

    /// <summary>Drag to draw a line.</summary>
    public const string DrawLine = "drawline";

    /// <summary>Drag to draw a rectangle.</summary>
    public const string DrawRect = "drawrect";

    /// <summary>Drag to draw a circle.</summary>
    public const string DrawCircle = "drawcircle";

    /// <summary>Orbit mode for 3D charts.</summary>
    public const string Orbit = "orbit";

    /// <summary>Turntable rotation for 3D charts.</summary>
    public const string Turntable = "turntable";
}

/// <summary>
/// Shape type constants for PlotlyShape.
/// </summary>
public static class PlotlyShapeTypes
{
    /// <summary>A straight line between two points.</summary>
    public const string Line = "line";

    /// <summary>A rectangle.</summary>
    public const string Rect = "rect";

    /// <summary>A circle (defined by bounding box).</summary>
    public const string Circle = "circle";

    /// <summary>An arbitrary SVG path.</summary>
    public const string Path = "path";
}

/// <summary>
/// Layer positioning for shapes and annotations.
/// </summary>
public static class PlotlyLayers
{
    /// <summary>Draw below the traces.</summary>
    public const string Below = "below";

    /// <summary>Draw above the traces.</summary>
    public const string Above = "above";
}

/// <summary>
/// Category ordering modes for Plotly axes.
/// </summary>
public static class PlotlyCategoryOrders
{
    /// <summary>Categories are ordered by their order of appearance in the trace data.</summary>
    public const string Trace = "trace";

    /// <summary>Categories are sorted alphabetically ascending.</summary>
    public const string CategoryAscending = "category ascending";

    /// <summary>Categories are sorted alphabetically descending.</summary>
    public const string CategoryDescending = "category descending";

    /// <summary>Categories are sorted by total value ascending.</summary>
    public const string TotalAscending = "total ascending";

    /// <summary>Categories are sorted by total value descending.</summary>
    public const string TotalDescending = "total descending";

    /// <summary>Categories are ordered by an explicit array (use CategoryArray).</summary>
    public const string Array = "array";
}

/// <summary>
/// Exponent display formats for Plotly axis tick labels.
/// </summary>
public static class PlotlyExponentFormats
{
    /// <summary>No exponent notation (always show full number).</summary>
    public const string None = "none";

    /// <summary>Lowercase "e" notation (e.g., 1e+6).</summary>
    public const string LowercaseE = "e";

    /// <summary>Uppercase "E" notation (e.g., 1E+6).</summary>
    public const string UppercaseE = "E";

    /// <summary>Superscript power notation (e.g., 10^6).</summary>
    public const string Power = "power";

    /// <summary>SI prefix notation (e.g., 1M, 1k).</summary>
    public const string SI = "SI";

    /// <summary>Abbreviation notation (e.g., 1B, 1T).</summary>
    public const string B = "B";
}

/// <summary>
/// Spike line drawing modes for Plotly axes.
/// </summary>
public static class PlotlySpikeModes
{
    /// <summary>Draw a spike line to the axis.</summary>
    public const string ToAxis = "toaxis";

    /// <summary>Draw a spike line across the full plot area.</summary>
    public const string Across = "across";

    /// <summary>Place a marker at the data point.</summary>
    public const string Marker = "marker";

    /// <summary>Draw spike line to the axis and place a marker.</summary>
    public const string ToAxisAndMarker = "toaxis+marker";

    /// <summary>Draw spike line across and place a marker.</summary>
    public const string AcrossAndMarker = "across+marker";
}

/// <summary>
/// Tick placement modes for Plotly axes.
/// </summary>
public static class PlotlyTickModes
{
    /// <summary>Plotly determines the number and placement of ticks automatically.</summary>
    public const string Auto = "auto";

    /// <summary>Ticks are placed at regular intervals defined by Tick0 and DTick.</summary>
    public const string Linear = "linear";

    /// <summary>Ticks are placed at explicit positions defined by TickValues/TickText.</summary>
    public const string Array = "array";
}

/// <summary>
/// Tick mark drawing positions for Plotly axes.
/// </summary>
public static class PlotlyTickPositions
{
    /// <summary>Draw tick marks outside the plot area.</summary>
    public const string Outside = "outside";

    /// <summary>Draw tick marks inside the plot area.</summary>
    public const string Inside = "inside";

    /// <summary>Do not draw tick marks.</summary>
    public const string None = "";
}

/// <summary>
/// Axis position options for Plotly charts.
/// </summary>
public static class PlotlyAxisSides
{
    /// <summary>Position axis on the left side.</summary>
    public const string Left = "left";
    
    /// <summary>Position axis on the right side.</summary>
    public const string Right = "right";
    
    /// <summary>Position axis on the top.</summary>
    public const string Top = "top";
    
    /// <summary>Position axis on the bottom.</summary>
    public const string Bottom = "bottom";
}

/// <summary>
/// Line dash styles for Plotly charts.
/// </summary>
public static class PlotlyDashStyles
{
    /// <summary>Solid line (default).</summary>
    public const string Solid = "solid";
    
    /// <summary>Dotted line.</summary>
    public const string Dot = "dot";
    
    /// <summary>Dashed line.</summary>
    public const string Dash = "dash";
    
    /// <summary>Long dashed line.</summary>
    public const string LongDash = "longdash";
    
    /// <summary>Alternating dash and dot.</summary>
    public const string DashDot = "dashdot";
}

/// <summary>
/// Built-in Plotly templates/themes.
/// </summary>
public static class PlotlyTemplates
{
    /// <summary>Default Plotly theme.</summary>
    public const string Plotly = "plotly";
    
    /// <summary>Clean white background theme.</summary>
    public const string PlotlyWhite = "plotly_white";
    
    /// <summary>Dark background theme.</summary>
    public const string PlotlyDark = "plotly_dark";
    
    /// <summary>ggplot2-inspired theme.</summary>
    public const string GGPlot2 = "ggplot2";
    
    /// <summary>Seaborn-inspired theme.</summary>
    public const string Seaborn = "seaborn";
    
    /// <summary>Simple white theme.</summary>
    public const string SimpleWhite = "simple_white";
    
    /// <summary>Presentation-friendly theme.</summary>
    public const string Presentation = "presentation";
}

/// <summary>
/// Histogram normalization modes.
/// </summary>
public static class PlotlyHistogramNorms
{
    /// <summary>No normalization (raw counts).</summary>
    public const string None = "";
    
    /// <summary>Normalize to percentages.</summary>
    public const string Percent = "percent";
    
    /// <summary>Normalize to probability (sum = 1).</summary>
    public const string Probability = "probability";
    
    /// <summary>Normalize to density.</summary>
    public const string Density = "density";
    
    /// <summary>Normalize to probability density.</summary>
    public const string ProbabilityDensity = "probability density";
}

/// <summary>
/// Box plot point display options.
/// </summary>
public static class PlotlyBoxPointsModes
{
    /// <summary>Show all data points.</summary>
    public const string All = "all";
    
    /// <summary>Show only outlier points.</summary>
    public const string Outliers = "outliers";
    
    /// <summary>Show suspected outliers.</summary>
    public const string SuspectedOutliers = "suspectedoutliers";
    
    /// <summary>Don't show any points.</summary>
    public const string False = "false";
}

/// <summary>
/// Colorscale options for heatmaps and other plots.
/// </summary>
public static class PlotlyColorScales
{
    /// <summary>Viridis color scale (perceptually uniform).</summary>
    public const string Viridis = "Viridis";
    
    /// <summary>Hot color scale (black-red-yellow-white).</summary>
    public const string Hot = "Hot";
    
    /// <summary>Jet color scale (rainbow).</summary>
    public const string Jet = "Jet";
    
    /// <summary>Portland color scale.</summary>
    public const string Portland = "Portland";
    
    /// <summary>Blues color scale.</summary>
    public const string Blues = "Blues";
    
    /// <summary>Greens color scale.</summary>
    public const string Greens = "Greens";
    
    /// <summary>Reds color scale.</summary>
    public const string Reds = "Reds";
    
    /// <summary>Red-Yellow-Blue diverging scale.</summary>
    public const string RdBu = "RdBu";
    
    /// <summary>Picnic color scale.</summary>
    public const string Picnic = "Picnic";
}

/// <summary>
/// Common color palettes for chart traces.
/// </summary>
public static class PlotlyColorways
{
    /// <summary>Default Plotly colorway (blue, red, green, purple, orange, cyan, pink, lime, teal).</summary>
    public static readonly string[] Default = 
    [
        "#636EFA", "#EF553B", "#00CC96", "#AB63FA", "#FDC826",
        "#19D3F3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"
    ];

    /// <summary>Vibrant color palette (bright, saturated colors).</summary>
    public static readonly string[] Vibrant = 
    [
        "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FFD700",
        "#00CED1", "#FF1493", "#32CD32", "#FF8C00", "#9370DB"
    ];

    /// <summary>Pastel color palette (soft, muted colors).</summary>
    public static readonly string[] Pastel = 
    [
        "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
        "#E0BBE4", "#FFDFD3", "#D5AAFF", "#C9E4DE", "#FFC8DD"
    ];

    /// <summary>Dark color palette (deep, rich colors for dark backgrounds).</summary>
    public static readonly string[] Dark = 
    [
        "#8B0000", "#006400", "#00008B", "#8B008B", "#B8860B",
        "#008B8B", "#483D8B", "#2F4F4F", "#8B4513", "#4B0082"
    ];

    /// <summary>Categorical color palette (distinctly different colors for easy differentiation).</summary>
    public static readonly string[] Categorical = 
    [
        "#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD",
        "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF"
    ];

    /// <summary>Warm color palette (reds, oranges, yellows).</summary>
    public static readonly string[] Warm = 
    [
        "#8B0000", "#DC143C", "#FF4500", "#FF6347", "#FF8C00",
        "#FFA500", "#FFD700", "#FFFF00", "#F0E68C", "#EEE8AA"
    ];

    /// <summary>Cool color palette (blues, greens, purples).</summary>
    public static readonly string[] Cool = 
    [
        "#000080", "#0000CD", "#4169E1", "#1E90FF", "#87CEEB",
        "#00CED1", "#48D1CC", "#40E0D0", "#7B68EE", "#9370DB"
    ];

    /// <summary>Earth tones palette (browns, greens, tans).</summary>
    public static readonly string[] Earth = 
    [
        "#8B4513", "#A0522D", "#D2691E", "#CD853F", "#DEB887",
        "#F4A460", "#D2B48C", "#BC8F8F", "#9ACD32", "#6B8E23"
    ];
}
