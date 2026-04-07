// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * Client-side chart rendering using Plotly.js.
 * Ported from Server/Charting C# implementation.
 */

import type { ChartOptions, ResultColumn, ResultTable } from './server';

// ─── Chart Constants ────────────────────────────────────────────────────────

export const ChartType = {
    None: 'None',
    AreaChart: 'AreaChart',
    BarChart: 'BarChart',
    Card: 'Card',
    ColumnChart: 'ColumnChart',
    Graph: 'Graph',
    LineChart: 'LineChart',
    PieChart: 'PieChart',
    PivotChart: 'PivotChart',
    Plotly: 'Plotly',
    Sankey: 'Sankey',
    ScatterChart: 'ScatterChart',
    StackedAreaChart: 'StackedAreaChart',
    ThreeDChart: '3DChart',
    TimeLadderChart: 'TimeLadderChart',
    TimeLineChart: 'TimeLineChart',
    TimeLineWithAnomalyChart: 'TimeLineWithAnomalyChart',
    TimePivot: 'TimePivot',
    TreeMap: 'TreeMap',
} as const;

export const ChartKind = {
    Default: 'Default',
    Stacked: 'Stacked',
    Stacked100: 'Stacked100',
    Unstacked: 'Unstacked',
} as const;

export const ChartAxis = {
    Linear: 'Linear',
    Log: 'Log',
} as const;

export const ChartSortOrder = {
    Default: 'Default',
    Ascending: 'Ascending',
    Descending: 'Descending',
} as const;

export const ChartLegendPosition = {
    Right: 'Right',
    Bottom: 'Bottom',
    Hidden: 'Hidden',
} as const;

export const ChartMode = {
    Light: 'Light',
    Dark: 'Dark',
} as const;

// ─── Plotly Constants ───────────────────────────────────────────────────────

const PlotlyHoverModes = {
    Closest: 'closest',
} as const;

const PlotlyBarModes = {
    Group: 'group',
    Stack: 'stack',
    Relative: 'relative',
} as const;

const PlotlyOrientations = {
    Vertical: 'v',
    Horizontal: 'h',
} as const;

const PlotlyScatterModes = {
    Lines: 'lines',
    Markers: 'markers',
    LinesAndMarkers: 'lines+markers',
} as const;

const PlotlyFillModes = {
    ToZeroY: 'tozeroy',
    ToNextY: 'tonexty',
} as const;

const PlotlyIndicatorModes = {
    Number: 'number',
} as const;

const PlotlyAxisTypes = {
    Log: 'log',
} as const;

const PlotlyTickPositions = {
    Outside: 'outside',
} as const;

const PlotlyCategoryOrders = {
    TotalAscending: 'total ascending',
    TotalDescending: 'total descending',
} as const;

const PlotlyAxisSides = {
    Right: 'right',
} as const;

const PlotlyColorways = {
    Default: [
        '#636EFA', '#EF553B', '#00CC96', '#AB63FA', '#FDC826',
        '#19D3F3', '#FF6692', '#B6E880', '#FF97FF', '#FECB52',
    ],
} as const;

const SankeyDefaultNodeColors: readonly string[] = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
];

// ─── Plotly Data Types ──────────────────────────────────────────────────────

interface PlotlyFont {
    family?: string | undefined;
    size?: number | undefined;
    color?: string | undefined;
}

interface PlotlyTitle {
    text?: string | undefined;
    font?: PlotlyFont | undefined;
    x?: number | undefined;
    y?: number | undefined;
    yanchor?: string | undefined;
    yref?: string | undefined;
    pad?: PlotlyTitlePad | undefined;
}

interface PlotlyTitlePad {
    b?: number | undefined;
    l?: number | undefined;
    r?: number | undefined;
    t?: number | undefined;
}

interface PlotlyMarker {
    color?: string | undefined;
    size?: number | undefined;
    opacity?: number | undefined;
}

interface PlotlyLine {
    color?: string | undefined;
    width?: number | undefined;
    dash?: string | undefined;
}

interface PlotlyAxis {
    title?: PlotlyTitle | undefined;
    type?: string | undefined;
    side?: string | undefined;
    overlaying?: string | undefined;
    range?: unknown[] | undefined;
    autorange?: boolean | undefined;
    color?: string | undefined;
    gridcolor?: string | undefined;
    linecolor?: string | undefined;
    zerolinecolor?: string | undefined;
    automargin?: boolean | undefined;
    fixedrange?: boolean | undefined;
    tickmode?: string | undefined;
    nticks?: number | undefined;
    tick0?: unknown | undefined;
    dtick?: unknown | undefined;
    tickvals?: unknown[] | undefined;
    ticktext?: string[] | undefined;
    tickangle?: number | undefined;
    tickformat?: string | undefined;
    tickprefix?: string | undefined;
    ticksuffix?: string | undefined;
    showticklabels?: boolean | undefined;
    ticks?: string | undefined;
    ticklen?: number | undefined;
    tickwidth?: number | undefined;
    tickcolor?: string | undefined;
    tickfont?: PlotlyFont | undefined;
    ticklabelstep?: number | undefined;
    visible?: boolean | undefined;
    showgrid?: boolean | undefined;
    showline?: boolean | undefined;
    zeroline?: boolean | undefined;
    linewidth?: number | undefined;
    gridwidth?: number | undefined;
    zerolinewidth?: number | undefined;
    mirror?: unknown | undefined;
    categoryorder?: string | undefined;
    categoryarray?: unknown[] | undefined;
    hoverformat?: string | undefined;
    separatethousands?: boolean | undefined;
    exponentformat?: string | undefined;
    showexponent?: string | undefined;
    domain?: number[] | undefined;
    anchor?: string | undefined;
    position?: number | undefined;
    constrain?: string | undefined;
    constraintoward?: string | undefined;
    scaleanchor?: string | undefined;
    scaleratio?: number | undefined;
    matches?: string | undefined;
    showspikes?: boolean | undefined;
    spikecolor?: string | undefined;
    spikethickness?: number | undefined;
    spikedash?: string | undefined;
    spikemode?: string | undefined;
    minallowed?: unknown | undefined;
    maxallowed?: unknown | undefined;
    rangeslider?: unknown | undefined;
    rangeselector?: unknown | undefined;
}

interface PlotlyScene {
    xaxis?: PlotlyAxis | undefined;
    yaxis?: PlotlyAxis | undefined;
    zaxis?: PlotlyAxis | undefined;
    camera?: unknown | undefined;
    aspectratio?: unknown | undefined;
    aspectmode?: string | undefined;
}

interface PlotlyLegend {
    x?: number | undefined;
    y?: number | undefined;
    xref?: string | undefined;
    yref?: string | undefined;
    xanchor?: string | undefined;
    yanchor?: string | undefined;
    orientation?: string | undefined;
    font?: PlotlyFont | undefined;
    bgcolor?: string | undefined;
    bordercolor?: string | undefined;
    borderwidth?: number | undefined;
    title?: PlotlyTitle | undefined;
    traceorder?: string | undefined;
    itemwidth?: number | undefined;
}

interface PlotlyMargin {
    l?: number | undefined;
    r?: number | undefined;
    t?: number | undefined;
    b?: number | undefined;
    pad?: number | undefined;
    autoexpand?: boolean | undefined;
}

interface PlotlyHoverLabel {
    bgcolor?: string | undefined;
    bordercolor?: string | undefined;
    font?: PlotlyFont | undefined;
    align?: string | undefined;
    namelength?: number | undefined;
}

interface PlotlyLayout {
    title?: PlotlyTitle | undefined;
    xaxis?: PlotlyAxis | undefined;
    yaxis?: PlotlyAxis | undefined;
    barmode?: string | undefined;
    showlegend?: boolean | undefined;
    plot_bgcolor?: string | undefined;
    paper_bgcolor?: string | undefined;
    font?: PlotlyFont | undefined;
    hovermode?: string | undefined;
    scene?: PlotlyScene | undefined;
    colorway?: string[] | undefined;
    width?: number | undefined;
    height?: number | undefined;
    autosize?: boolean | undefined;
    margin?: PlotlyMargin | undefined;
    legend?: PlotlyLegend | undefined;
    hoverlabel?: PlotlyHoverLabel | undefined;
    hoverdistance?: number | undefined;
    spikedistance?: number | undefined;
    dragmode?: unknown | undefined;
    selectdirection?: string | undefined;
    clickmode?: string | undefined;
    bargap?: number | undefined;
    bargroupgap?: number | undefined;
    boxmode?: string | undefined;
    violinmode?: string | undefined;
    annotations?: unknown[] | undefined;
    shapes?: unknown[] | undefined;
    grid?: unknown | undefined;
    uniformtext?: unknown | undefined;
    transition?: unknown | undefined;
    // additional axes like yaxis2, yaxis3, etc.
    [key: string]: unknown;
}

interface PlotlyConfig {
    responsive: boolean;
    displayModeBar: boolean;
    displaylogo: boolean;
    staticPlot: boolean;
    scrollZoom: boolean;
    doubleClick: unknown;
    toImageButtonOptions?: unknown | undefined;
}

// ─── Plotly Trace Types ─────────────────────────────────────────────────────

interface PlotlyTraceBase {
    type: string;
    name?: string | undefined;
    xaxis?: string | undefined;
    yaxis?: string | undefined;
}

interface BarTrace extends PlotlyTraceBase {
    type: 'bar';
    x: unknown[];
    y: unknown[];
    orientation: string;
    offsetgroup?: string | undefined;
    marker?: PlotlyMarker | undefined;
    text?: unknown[] | undefined;
    textposition?: string | undefined;
}

interface ScatterTrace extends PlotlyTraceBase {
    type: 'scatter';
    x: unknown[];
    y: unknown[];
    mode: string;
    fill?: string | undefined;
    stackgroup?: string | undefined;
    groupnorm?: string | undefined;
    line?: PlotlyLine | undefined;
    marker?: PlotlyMarker | undefined;
}

interface PieTrace extends PlotlyTraceBase {
    type: 'pie';
    labels: unknown[];
    values: unknown[];
    hole?: number | undefined;
    marker?: PlotlyMarker | undefined;
    hoverinfo?: string | undefined;
    textinfo?: string | undefined;
}

interface IndicatorTrace extends PlotlyTraceBase {
    type: 'indicator';
    value: number;
    mode: string;
    title?: PlotlyTitle | undefined;
    number?: {
        prefix?: string | undefined;
        suffix?: string | undefined;
        font?: PlotlyFont | undefined;
        valueformat?: string | undefined;
    } | undefined;
    delta?: unknown | undefined;
    gauge?: unknown | undefined;
    domain?: unknown | undefined;
}

interface SurfaceTrace extends PlotlyTraceBase {
    type: 'surface';
    x?: unknown[] | undefined;
    y?: unknown[] | undefined;
    z: unknown[][];
    colorscale?: string | undefined;
    showscale?: boolean | undefined;
    opacity?: number | undefined;
    surfacecolor?: unknown[][] | undefined;
    contours?: unknown | undefined;
}

interface TreeMapTrace extends PlotlyTraceBase {
    type: 'treemap';
    labels: unknown[];
    parents: unknown[];
    values?: unknown[] | undefined;
    ids?: unknown[] | undefined;
    text?: unknown[] | undefined;
    texttemplate?: string | undefined;
    textinfo?: string | undefined;
    hovertemplate?: string | undefined;
    marker?: {
        colors?: unknown[] | undefined;
        colorscale?: string | undefined;
        showscale?: boolean | undefined;
        line?: PlotlyLine | undefined;
    } | undefined;
    maxdepth?: number | undefined;
    level?: string | undefined;
    branchvalues?: string | undefined;
    pathbar?: { visible?: boolean | undefined; side?: string | undefined; textfont?: PlotlyFont | undefined } | undefined;
}

interface SankeyTrace extends PlotlyTraceBase {
    type: 'sankey';
    node: {
        label: string[];
        color?: unknown | undefined;
        pad?: number | undefined;
        thickness?: number | undefined;
        line?: PlotlyLine | undefined;
        hovertemplate?: string | undefined;
    };
    link: {
        source: number[];
        target: number[];
        value: number[];
        color?: unknown | undefined;
        label?: string[] | undefined;
        hovertemplate?: string | undefined;
    };
    orientation?: string | undefined;
    valueformat?: string | undefined;
    valuesuffix?: string | undefined;
    arrangement?: string | undefined;
}

type PlotlyTrace = BarTrace | ScatterTrace | PieTrace | IndicatorTrace | SurfaceTrace | TreeMapTrace | SankeyTrace;

// ─── Chart Builder ──────────────────────────────────────────────────────────

class PlotlyChartBuilder {
    private readonly _traces: PlotlyTrace[];
    private readonly _layout: PlotlyLayout;
    private readonly _config: PlotlyConfig;

    constructor(
        traces?: PlotlyTrace[],
        layout?: PlotlyLayout,
        config?: PlotlyConfig,
    ) {
        this._traces = traces ?? [];
        this._layout = layout ?? { hovermode: PlotlyHoverModes.Closest, showlegend: true };
        this._config = config ?? {
            responsive: true,
            displayModeBar: false,
            displaylogo: false,
            staticPlot: false,
            scrollZoom: false,
            doubleClick: false,
        };
    }

    get traces(): PlotlyTrace[] { return this._traces; }
    get layout(): PlotlyLayout { return this._layout; }
    get config(): PlotlyConfig { return this._config; }

    private _new(traces?: PlotlyTrace[], layout?: PlotlyLayout, config?: PlotlyConfig): PlotlyChartBuilder {
        return new PlotlyChartBuilder(
            traces ?? this._traces,
            layout ?? this._layout,
            config ?? this._config,
        );
    }

    addTrace(trace: PlotlyTrace): PlotlyChartBuilder {
        return this._new([...this._traces, trace]);
    }

    withLayout(layout: PlotlyLayout): PlotlyChartBuilder {
        return this._new(undefined, layout);
    }

    withConfig(config: PlotlyConfig): PlotlyChartBuilder {
        return this._new(undefined, undefined, config);
    }

    withTitle(title: string): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, title: { text: title } });
    }

    withXAxis(axis: PlotlyAxis): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, xaxis: axis });
    }

    withYAxis(axis: PlotlyAxis): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, yaxis: axis });
    }

    withScene(scene: PlotlyScene): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, scene });
    }

    addSecondaryYAxis(axisId: string, axis: PlotlyAxis): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, [axisId]: axis });
    }

    setBarMode(barMode: string): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, barmode: barMode });
    }

    showLegend(show = true): PlotlyChartBuilder {
        return this._new(undefined, { ...this._layout, showlegend: show });
    }

    withDarkMode(): PlotlyChartBuilder {
        const darkAxis: Partial<PlotlyAxis> = {
            color: '#f2f5fa',
            gridcolor: '#444444',
            linecolor: '#666666',
            zerolinecolor: '#666666',
        };
        return this._new(undefined, {
            ...this._layout,
            paper_bgcolor: '#1e1e1e',
            plot_bgcolor: '#1e1e1e',
            font: { color: '#f2f5fa' },
            colorway: [...PlotlyColorways.Default],
            xaxis: { ...(this._layout.xaxis ?? {}), ...darkAxis },
            yaxis: { ...(this._layout.yaxis ?? {}), ...darkAxis },
        });
    }

    withFixedRange(): PlotlyChartBuilder {
        return this._new(
            undefined,
            {
                ...this._layout,
                xaxis: { ...(this._layout.xaxis ?? {}), fixedrange: true },
                yaxis: { ...(this._layout.yaxis ?? {}), fixedrange: true },
            },
            {
                ...this._config,
                scrollZoom: false,
                doubleClick: false,
            },
        );
    }

    toHtmlDiv(divId = 'plotly-chart'): string {
        const dataJson = JSON.stringify(this._traces);
        const layoutJson = JSON.stringify(this._layout);
        const configJson = JSON.stringify(this._config);
        return createChartDiv(dataJson, layoutJson, configJson, divId);
    }

    // ─── Trace helpers (ported from PlotlyChartExtensions.cs) ───────────

    add2DBarTrace(
        x: unknown[],
        y: unknown[],
        name?: string,
        horizontal = false,
        yAxisId?: string,
        offsetGroup?: string,
        text?: unknown[],
        textPosition?: string,
    ): PlotlyChartBuilder {
        const trace: BarTrace = {
            type: 'bar',
            x: horizontal ? y : x,
            y: horizontal ? x : y,
            orientation: horizontal ? PlotlyOrientations.Horizontal : PlotlyOrientations.Vertical,
            name,
            yaxis: yAxisId,
            offsetgroup: offsetGroup,
            text,
            textposition: textPosition,
        };
        return this.addTrace(trace);
    }

    add2DLineTrace(
        x: unknown[],
        y: unknown[],
        name?: string,
        showMarkers = false,
        yAxisId?: string,
    ): PlotlyChartBuilder {
        const trace: ScatterTrace = {
            type: 'scatter',
            x,
            y,
            mode: showMarkers ? PlotlyScatterModes.LinesAndMarkers : PlotlyScatterModes.Lines,
            name,
            yaxis: yAxisId,
        };
        return this.addTrace(trace);
    }

    add2DScatterTrace(
        x: unknown[],
        y: unknown[],
        name?: string,
        yAxisId?: string,
    ): PlotlyChartBuilder {
        const trace: ScatterTrace = {
            type: 'scatter',
            x,
            y,
            mode: PlotlyScatterModes.Markers,
            name,
            yaxis: yAxisId,
        };
        return this.addTrace(trace);
    }

    addAreaChart(
        x: unknown[],
        y: unknown[],
        name?: string,
        stackGroup?: string,
        yAxisId?: string,
        groupNorm?: string,
    ): PlotlyChartBuilder {
        const trace: ScatterTrace = {
            type: 'scatter',
            x,
            y,
            mode: PlotlyScatterModes.Lines,
            fill: stackGroup != null ? PlotlyFillModes.ToNextY : PlotlyFillModes.ToZeroY,
            stackgroup: stackGroup,
            groupnorm: groupNorm,
            name,
            yaxis: yAxisId,
        };
        return this.addTrace(trace);
    }

    addIndicatorTrace(
        value: number,
        title?: string,
        mode?: string,
        prefix?: string,
        suffix?: string,
        valueFormat?: string,
    ): PlotlyChartBuilder {
        const hasNumber = prefix != null || suffix != null || valueFormat != null;
        const trace: IndicatorTrace = {
            type: 'indicator',
            value,
            mode: mode ?? PlotlyIndicatorModes.Number,
            title: title != null ? { text: title } : undefined,
            number: hasNumber ? { prefix, suffix, valueformat: valueFormat } : undefined,
        };
        return this.addTrace(trace);
    }

    addPieTrace(
        labels: unknown[],
        values: unknown[],
        name?: string,
        hole = 0.0,
        textInfo?: string,
    ): PlotlyChartBuilder {
        const trace: PieTrace = {
            type: 'pie',
            labels,
            values,
            name,
            hole: hole > 0 ? hole : undefined,
            textinfo: textInfo,
        };
        return this.addTrace(trace);
    }

    add3DSurfaceTrace(
        z: unknown[][],
        x?: unknown[],
        y?: unknown[],
        name?: string,
        colorScale?: string,
        showScale = true,
        opacity?: number,
    ): PlotlyChartBuilder {
        const trace: SurfaceTrace = {
            type: 'surface',
            z,
            x,
            y,
            name,
            colorscale: colorScale,
            showscale: showScale,
            opacity,
        };
        return this.addTrace(trace);
    }

    addTreeMapTrace(
        labels: unknown[],
        parents: unknown[],
        values?: unknown[],
        name?: string,
        ids?: unknown[],
        textInfo?: string,
        branchValues?: string,
        maxDepth?: number,
    ): PlotlyChartBuilder {
        const trace: TreeMapTrace = {
            type: 'treemap',
            labels,
            parents,
            values,
            name,
            ids,
            textinfo: textInfo,
            branchvalues: branchValues,
            maxdepth: maxDepth,
            pathbar: { visible: true },
        };
        return this.addTrace(trace);
    }

    addSankeyTrace(
        nodeLabels: string[],
        linkSources: number[],
        linkTargets: number[],
        linkValues: number[],
        name?: string,
        nodeColors?: string[],
        linkColors?: string[],
        orientation?: string,
        arrangement?: string,
    ): PlotlyChartBuilder {
        // Generate default node colors if not provided
        let colors = nodeColors;
        if (!colors || colors.length === 0) {
            colors = nodeLabels.map((_, i) => SankeyDefaultNodeColors[i % SankeyDefaultNodeColors.length]!);
        }

        // Generate link colors based on source node colors with transparency
        let lColors = linkColors;
        if (!lColors || lColors.length === 0) {
            lColors = linkSources.map(srcIdx => {
                const srcColor = colors![srcIdx % colors!.length]!;
                return hexToRgba(srcColor, 0.4);
            });
        }

        const trace: SankeyTrace = {
            type: 'sankey',
            name,
            orientation: orientation ?? 'h',
            arrangement: arrangement ?? 'snap',
            node: {
                label: nodeLabels,
                color: colors,
                pad: 15,
                thickness: 20,
                line: { color: '#444444', width: 0.5 },
            },
            link: {
                source: linkSources,
                target: linkTargets,
                value: linkValues,
                color: lColors,
            },
        };
        return this.addTrace(trace);
    }

    // ─── Layout helpers (ported from PlotlyChartExtensions.cs) ──────────

    setStacked(): PlotlyChartBuilder {
        return this.withLayout({ ...this._layout, barmode: PlotlyBarModes.Stack });
    }

    setStacked100(): PlotlyChartBuilder {
        return this.withLayout({ ...this._layout, barmode: PlotlyBarModes.Relative });
    }

    setGrouped(): PlotlyChartBuilder {
        return this.withLayout({ ...this._layout, barmode: PlotlyBarModes.Group });
    }

    setXAxisTitle(title: string): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), title: { text: title } };
        return this.withXAxis(xaxis);
    }

    setYAxisTitle(title: string): PlotlyChartBuilder {
        const yaxis: PlotlyAxis = { ...(this._layout.yaxis ?? {}), title: { text: title } };
        return this.withYAxis(yaxis);
    }

    setLogX(): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), type: PlotlyAxisTypes.Log };
        return this.withXAxis(xaxis);
    }

    setLogY(): PlotlyChartBuilder {
        const yaxis: PlotlyAxis = { ...(this._layout.yaxis ?? {}), type: PlotlyAxisTypes.Log };
        return this.withYAxis(yaxis);
    }

    setXAxisRange(min: number, max: number): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), range: [min, max] };
        return this.withXAxis(xaxis);
    }

    setYAxisRange(min: number, max: number): PlotlyChartBuilder {
        const yaxis: PlotlyAxis = { ...(this._layout.yaxis ?? {}), range: [min, max] };
        return this.withYAxis(yaxis);
    }

    setSceneXAxisTitle(title: string): PlotlyChartBuilder {
        const scene = this._layout.scene ?? {};
        const xaxis: PlotlyAxis = { ...(scene.xaxis ?? {}), title: { text: title } };
        return this.withScene({ ...scene, xaxis });
    }

    setSceneYAxisTitle(title: string): PlotlyChartBuilder {
        const scene = this._layout.scene ?? {};
        const yaxis: PlotlyAxis = { ...(scene.yaxis ?? {}), title: { text: title } };
        return this.withScene({ ...scene, yaxis });
    }

    setSceneZAxisTitle(title: string): PlotlyChartBuilder {
        const scene = this._layout.scene ?? {};
        const zaxis: PlotlyAxis = { ...(scene.zaxis ?? {}), title: { text: title } };
        return this.withScene({ ...scene, zaxis });
    }

    setSceneZAxisRange(min: number, max: number): PlotlyChartBuilder {
        const scene = this._layout.scene ?? {};
        const zaxis: PlotlyAxis = { ...(scene.zaxis ?? {}), range: [min, max] };
        return this.withScene({ ...scene, zaxis });
    }

    setSceneAspectMode(mode: string): PlotlyChartBuilder {
        const scene = this._layout.scene ?? {};
        return this.withScene({ ...scene, aspectmode: mode });
    }

    setShowLegend(show: boolean): PlotlyChartBuilder {
        return this.withLayout({ ...this._layout, showlegend: show });
    }

    hideLegend(): PlotlyChartBuilder {
        return this.setShowLegend(false);
    }

    setColorway(...colors: string[]): PlotlyChartBuilder {
        return this.withLayout({ ...this._layout, colorway: colors });
    }

    setSize(width: number | undefined, height: number | undefined): PlotlyChartBuilder {
        const newLayout: PlotlyLayout = { ...this._layout };
        if (width !== undefined) { newLayout.width = width; }
        if (height !== undefined) { newLayout.height = height; }
        return this.withLayout(newLayout);
    }

    setXShowTicks(show: boolean): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), ticks: show ? PlotlyTickPositions.Outside : '' };
        return this.withLayout({ ...this._layout, xaxis });
    }

    setYShowTicks(show: boolean): PlotlyChartBuilder {
        const yaxis: PlotlyAxis = { ...(this._layout.yaxis ?? {}), ticks: show ? PlotlyTickPositions.Outside : '' };
        return this.withLayout({ ...this._layout, yaxis });
    }

    setXShowGrid(show: boolean): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), showgrid: show };
        return this.withLayout({ ...this._layout, xaxis });
    }

    setYShowGrid(show: boolean): PlotlyChartBuilder {
        const yaxis: PlotlyAxis = { ...(this._layout.yaxis ?? {}), showgrid: show };
        return this.withLayout({ ...this._layout, yaxis });
    }

    setXTickAngle(angle: number): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), tickangle: angle };
        return this.withLayout({ ...this._layout, xaxis });
    }

    setYTickAngle(angle: number): PlotlyChartBuilder {
        const yaxis: PlotlyAxis = { ...(this._layout.yaxis ?? {}), tickangle: angle };
        return this.withLayout({ ...this._layout, yaxis });
    }

    setCategoryOrder(order: string): PlotlyChartBuilder {
        const xaxis: PlotlyAxis = { ...(this._layout.xaxis ?? {}), categoryorder: order };
        return this.withLayout({ ...this._layout, xaxis });
    }

    setLegendPosition(position: string): PlotlyChartBuilder {
        let legend: PlotlyLegend;
        if (position === ChartLegendPosition.Bottom) {
            legend = { orientation: 'h', x: 0.5, y: -0.2, xanchor: 'center', yanchor: 'top' };
        } else {
            legend = { x: 1.02, y: 1, xanchor: 'left', yanchor: 'auto' };
        }
        return this.withLayout({ ...this._layout, legend });
    }
}

// ─── HTML Helpers ───────────────────────────────────────────────────────────

const PlotlyJsCdn = 'https://cdn.plot.ly/plotly-2.27.0.min.js';

function createChartDiv(dataJson: string, layoutJson: string, configJson: string, divId = 'plotly-chart'): string {
    return `<div id="${divId}"></div>
<script>
try {
  var data = ${dataJson};
  var layout = ${layoutJson};
  var config = ${configJson};
  Plotly.newPlot('${divId}', data, layout, config);
} catch(e) { console.error('Plotly error:', e); document.getElementById('${divId}').innerText = 'Chart error: ' + e.message; }
</script>`;
}

function createHtmlDocument(chartDiv: string, darkMode = false): string {
    const backgroundColor = darkMode ? '#1e1e1e' : '#ffffff';
    const textColor = darkMode ? '#f2f5fa' : '#000000';

    // Extract script content from chartDiv
    const scriptStart = chartDiv.indexOf('<script>');
    const scriptEnd = chartDiv.indexOf('</script>');

    let divPart: string;
    let scriptContent: string;

    if (scriptStart >= 0 && scriptEnd > scriptStart) {
        divPart = chartDiv.substring(0, scriptStart).trim();
        scriptContent = chartDiv.substring(scriptStart + 8, scriptEnd);
    } else {
        divPart = chartDiv;
        scriptContent = '';
    }

    return `<!DOCTYPE html>
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
            background-color: ${backgroundColor};
            color: ${textColor};
        }
        #plotly-chart {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    ${divPart}
    <script src="${PlotlyJsCdn}" charset="utf-8"></script>
    <script>
    ${scriptContent}
    </script>
</body>
</html>`;
}

// ─── Utility Functions ──────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
    let h = hex.replace(/^#/, '');
    if (h.length === 3) {
        h = (h[0] ?? '') + (h[0] ?? '') + (h[1] ?? '') + (h[1] ?? '') + (h[2] ?? '') + (h[2] ?? '');
    }
    if (h.length !== 6) {
        return `rgba(128, 128, 128, ${opacity})`;
    }
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function isNumericType(type: string): boolean {
    switch (type) {
        case 'int':
        case 'long':
        case 'real':
        case 'decimal':
            return true;
        default:
            return false;
    }
}

function toNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') { const n = Number(value); return isNaN(n) ? 0 : n; }
    return 0;
}

function sanitizeDouble(value: number): number {
    if (value === Infinity) return Number.MAX_VALUE;
    if (value === -Infinity) return -Number.MAX_VALUE;
    return value;
}

function tryGetDouble(value: unknown): number | undefined {
    if (value == null) return undefined;
    const n = Number(value);
    if (isNaN(n)) return undefined;
    return n;
}

// ─── Data Access Helpers (replaces DataTable/DataColumn) ────────────────────

/** A ResultColumn together with its position in the table. */
interface ColumnRef {
    column: ResultColumn;
    index: number;
}

function getColumnRef(table: ResultTable, name: string): ColumnRef | undefined {
    const idx = table.columns.findIndex(c => c.name === name);
    if (idx < 0) return undefined;
    const col = table.columns[idx];
    if (!col) return undefined;
    return { column: col, index: idx };
}

function getColumnRefByIndex(table: ResultTable, index: number): ColumnRef | undefined {
    if (index < 0 || index >= table.columns.length) return undefined;
    const col = table.columns[index];
    if (!col) return undefined;
    return { column: col, index };
}

function getColumnValues(table: ResultTable, col: ColumnRef): unknown[] {
    return table.rows.map(row => row?.[col.index]);
}

function trimNullRows(xValues: unknown[], yValues: unknown[]): { x: unknown[]; y: unknown[] } {
    const xResult: unknown[] = [];
    const yResult: unknown[] = [];
    const len = Math.min(xValues.length, yValues.length);
    for (let i = 0; i < len; i++) {
        if (xValues[i] != null && yValues[i] != null) {
            xResult.push(xValues[i]);
            yResult.push(yValues[i]);
        }
    }
    return { x: xResult, y: yResult };
}

function convertToNumeric(values: unknown[]): number[] {
    return values.map(v => sanitizeDouble(toNumber(v)));
}

// ─── Chart Manager ──────────────────────────────────────────────────────────

export class ChartManager {

    renderChartToHtmlDiv(data: ResultTable, options: ChartOptions, darkMode = false): string | undefined {
        if (options.type === ChartType.Plotly) {
            return this.renderRawPlotlyChart(data, darkMode);
        }

        const builder = this.buildChart(data, options, darkMode);
        return builder?.toHtmlDiv();
    }

    renderChartToHtmlDocument(data: ResultTable, options: ChartOptions, darkMode = false): string | undefined {
        const chartDiv = this.renderChartToHtmlDiv(data, options, darkMode);
        return chartDiv != null ? createHtmlDocument(chartDiv, darkMode) : undefined;
    }

    // ─── Raw Plotly ─────────────────────────────────────────────────────

    private renderRawPlotlyChart(data: ResultTable, darkMode = false, divId = 'plotly-chart'): string | undefined {
        if (data.columns.length === 0 || data.rows.length === 0) return undefined;

        const firstRow = data.rows[0];
        if (!firstRow) return undefined;
        const cellValue = firstRow[0];
        if (cellValue == null) return undefined;

        const jsonString = typeof cellValue === 'string' ? cellValue : String(cellValue);
        if (!jsonString.trim()) return undefined;

        try {
            const root = JSON.parse(jsonString) as Record<string, unknown>;
            if (!root || !root.data) return undefined;

            const dataJson = JSON.stringify(root.data);
            let layoutJson = root.layout ? JSON.stringify(root.layout) : '{}';

            if (darkMode) {
                layoutJson = applyDarkModeToLayout(layoutJson);
            }

            const configJson = root.config
                ? JSON.stringify(root.config)
                : '{"responsive": true, "displayModeBar": false}';

            return createChartDiv(dataJson, layoutJson, configJson, divId);
        } catch {
            return undefined;
        }
    }

    // ─── Build Chart ────────────────────────────────────────────────────

    private buildChart(data: ResultTable, options: ChartOptions, darkMode: boolean): PlotlyChartBuilder | undefined {
        let builder: PlotlyChartBuilder | undefined;

        switch (options.type) {
            case ChartType.BarChart:
            case ChartType.ColumnChart:
                builder = this.buildBarOrColumnChart(data, options);
                break;
            case ChartType.LineChart:
                builder = this.buildLineChart(data, options);
                break;
            case ChartType.ScatterChart:
                builder = this.buildScatterChart(data, options);
                break;
            case ChartType.PieChart:
                builder = this.buildPieChart(data, options);
                break;
            case ChartType.AreaChart:
                builder = (options.kind === ChartKind.Stacked || options.kind === ChartKind.Stacked100)
                    ? this.buildStackedAreaChart(data, options)
                    : this.buildAreaChart(data, options);
                break;
            case ChartType.StackedAreaChart:
                builder = this.buildStackedAreaChart(data, options);
                break;
            case ChartType.Card:
                builder = this.buildCardChart(data, options);
                break;
            case ChartType.ThreeDChart:
                builder = this.buildThreeDChart(data, options);
                break;
            case ChartType.TreeMap:
                builder = this.buildTreeMapChart(data, options);
                break;
            case ChartType.Sankey:
                builder = this.buildSankeyChart(data, options);
                break;
            default:
                return undefined;
        }

        if (builder) {
            if (darkMode) {
                builder = builder.withDarkMode();
            }
            if (options.type !== ChartType.ThreeDChart) {
                builder = builder.withFixedRange();
            }
        }

        return builder;
    }

    // ─── Bar / Column ───────────────────────────────────────────────────

    private buildBarOrColumnChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        let builder = new PlotlyChartBuilder();
        const isHorizontal = options.type === ChartType.BarChart;

        switch (options.kind) {
            case ChartKind.Stacked:
                builder = builder.setStacked();
                break;
            case ChartKind.Stacked100:
                builder = builder.setStacked();
                break;
            case ChartKind.Unstacked:
                builder = builder.setGrouped();
                break;
        }

        if (options.kind === ChartKind.Stacked100) {
            return this.buildStacked100BarOrColumnChart(builder, data, options, isHorizontal);
        }

        const showValues = options.showValues === true;
        return this.build2dChart(builder, data, options,
            (b, keys, values, name, yAxis) =>
                b.add2DBarTrace(
                    keys, values, name, isHorizontal, yAxis, undefined,
                    showValues ? values.map(v => v as unknown) : undefined,
                    showValues ? 'auto' : undefined,
                ),
        );
    }

    private buildStacked100BarOrColumnChart(
        builder: PlotlyChartBuilder, data: ResultTable, options: ChartOptions, isHorizontal: boolean,
    ): PlotlyChartBuilder | undefined {
        const xColumn = this.get2dXColumn(data, options);
        if (!xColumn) return undefined;

        const yColumns = this.get2dYColumns(data, options, xColumn);

        const seriesData: { keys: unknown[]; values: number[]; name: string }[] = [];

        for (const valueColumn of yColumns) {
            const result = this.get2DChartData(data, xColumn, valueColumn);
            if (result) {
                seriesData.push({ keys: result.x, values: result.y, name: valueColumn.column.name });
            }
        }

        if (seriesData.length === 0) return undefined;

        const first = seriesData[0]!;
        const totals = new Array<number>(first.keys.length).fill(0);

        for (const { values } of seriesData) {
            for (let i = 0; i < Math.min(values.length, totals.length); i++) {
                totals[i] = (totals[i] ?? 0) + Math.abs(values[i] ?? 0);
            }
        }

        if (options.title) builder = builder.withTitle(options.title);
        if (options.xTitle) builder = builder.setXAxisTitle(options.xTitle);
        if (options.yTitle) builder = builder.setYAxisTitle(options.yTitle);
        if (options.showLegend === false) builder = builder.hideLegend();

        builder = builder.setYAxisRange(0, 1);

        const showValues = options.showValues === true;
        for (const { keys, values, name } of seriesData) {
            const normalized = values.map((v, i) => {
                const total = totals[i] ?? 0;
                return total > 0 ? v / total : 0;
            });
            builder = builder.add2DBarTrace(
                keys, normalized, name, isHorizontal, undefined, undefined,
                showValues ? normalized.map(v => v as unknown) : undefined,
                showValues ? 'auto' : undefined,
            );
        }

        return builder;
    }

    // ─── Line / Scatter / Area ──────────────────────────────────────────

    private buildLineChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        return this.build2dChart(new PlotlyChartBuilder(), data, options,
            (b, x, y, name, yAxis) => b.add2DLineTrace(x, y, name, false, yAxis));
    }

    private buildScatterChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        return this.build2dChart(new PlotlyChartBuilder(), data, options,
            (b, x, y, name, yAxis) => b.add2DScatterTrace(x, y, name, yAxis));
    }

    private buildAreaChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        return this.build2dChart(new PlotlyChartBuilder(), data, options,
            (b, x, y, name, yAxis) => b.addAreaChart(x, y, name, undefined, yAxis));
    }

    private buildStackedAreaChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        const groupNorm = options.kind === ChartKind.Stacked100 ? 'percent' : undefined;
        return this.build2dChart(new PlotlyChartBuilder(), data, options,
            (b, x, y, name, yAxis) => b.addAreaChart(x, y, name, '1', yAxis, groupNorm));
    }

    // ─── Pie ────────────────────────────────────────────────────────────

    private buildPieChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        let builder = new PlotlyChartBuilder();

        if (options.title) builder = builder.withTitle(options.title);
        if (options.showLegend === false) builder = builder.hideLegend();
        builder = applyCommonOptions(builder, options);

        const labelColumn = this.get2dXColumn(data, options);
        if (!labelColumn) return undefined;

        const valueColumns = this.get2dYColumns(data, options, labelColumn);
        const textInfo = options.showValues === true ? 'label+value+percent' : undefined;

        for (const valueColumn of valueColumns) {
            const result = this.get2DChartData(data, labelColumn, valueColumn);
            if (result) {
                builder = builder.addPieTrace(result.x, result.y, valueColumn.column.name, 0.0, textInfo);
            }
        }

        return builder;
    }

    // ─── Card ───────────────────────────────────────────────────────────

    private buildCardChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        if (data.rows.length === 0 || data.columns.length === 0) return undefined;

        let valueColumn: ColumnRef | undefined;
        for (let i = 0; i < data.columns.length; i++) {
            const col = data.columns[i];
            if (col && isNumericType(col.type)) {
                valueColumn = getColumnRefByIndex(data, i);
                break;
            }
        }
        if (!valueColumn) return undefined;

        const firstRow = data.rows[0];
        if (!firstRow) return undefined;
        const cellValue = firstRow[valueColumn.index];
        if (cellValue == null) return undefined;

        const value = sanitizeDouble(toNumber(cellValue));
        const title = options.title ?? valueColumn.column.name;

        return new PlotlyChartBuilder().addIndicatorTrace(value, title, PlotlyIndicatorModes.Number);
    }

    // ─── 3D Chart ───────────────────────────────────────────────────────

    private buildThreeDChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        if (data.columns.length < 3 || data.rows.length === 0) return undefined;

        const xCol = getColumnRefByIndex(data, 0);
        const yCol = getColumnRefByIndex(data, 1);
        const zCol = getColumnRefByIndex(data, 2);
        if (!xCol || !yCol || !zCol) return undefined;

        if (!isNumericType(zCol.column.type)) return undefined;

        // Get unique sorted X and Y values
        const xSet = new Map<string, unknown>();
        const ySet = new Map<string, unknown>();
        for (const row of data.rows) {
            if (!row) continue;
            const xv = row[xCol.index];
            const yv = row[yCol.index];
            if (xv != null) xSet.set(String(xv), xv);
            if (yv != null) ySet.set(String(yv), yv);
        }

        const xValues = [...xSet.values()];
        const yValues = [...ySet.values()];
        if (xValues.length === 0 || yValues.length === 0) return undefined;

        // Build (x, y) -> z lookup
        const dataLookup = new Map<string, number>();
        for (const row of data.rows) {
            if (!row) continue;
            const x = row[xCol.index];
            const y = row[yCol.index];
            const z = row[zCol.index];
            if (x != null && y != null && z != null) {
                dataLookup.set(`${String(x)}|${String(y)}`, sanitizeDouble(toNumber(z)));
            }
        }

        // Build Z grid [yIndex][xIndex]
        const zGrid: unknown[][] = [];
        for (let i = 0; i < yValues.length; i++) {
            const row: unknown[] = [];
            for (let j = 0; j < xValues.length; j++) {
                const key = `${String(xValues[j])}|${String(yValues[i])}`;
                row.push(dataLookup.get(key) ?? 0.0);
            }
            zGrid.push(row);
        }

        let builder = new PlotlyChartBuilder();
        if (options.title) builder = builder.withTitle(options.title);

        builder = builder.add3DSurfaceTrace(zGrid, xValues, yValues, zCol.column.name);

        // Configure scene axes
        let scene: PlotlyScene = {};
        if (options.xTitle) {
            scene = { ...scene, xaxis: { title: { text: options.xTitle } } };
        }
        if (options.yTitle) {
            scene = { ...scene, yaxis: { title: { text: options.yTitle } } };
        }
        scene = { ...scene, zaxis: { title: { text: options.zTitle ?? zCol.column.name } } };
        builder = builder.withScene(scene);

        if (options.showLegend === false) builder = builder.hideLegend();
        builder = applyCommonOptions(builder, options);

        return builder;
    }

    // ─── TreeMap ────────────────────────────────────────────────────────

    private buildTreeMapChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        if (data.columns.length < 2 || data.rows.length === 0) return undefined;

        // Find value column (last numeric) and hierarchy columns (non-numeric)
        let valueColumn: ColumnRef | undefined;
        const hierarchyColumns: ColumnRef[] = [];

        for (let i = 0; i < data.columns.length; i++) {
            const col = data.columns[i];
            if (!col) continue;
            if (isNumericType(col.type)) {
                valueColumn = getColumnRefByIndex(data, i);
            } else {
                const ref = getColumnRefByIndex(data, i);
                if (ref) hierarchyColumns.push(ref);
            }
        }

        // If no non-numeric columns found, use all but last as hierarchy
        if (hierarchyColumns.length === 0) {
            for (let i = 0; i < data.columns.length - 1; i++) {
                const ref = getColumnRefByIndex(data, i);
                if (ref) hierarchyColumns.push(ref);
            }
            valueColumn = getColumnRefByIndex(data, data.columns.length - 1);
        }

        if (!valueColumn || hierarchyColumns.length === 0) return undefined;

        const labels: string[] = [];
        const parents: string[] = [];
        const values: number[] = [];
        const ids: string[] = [];
        const branchIndices = new Map<string, number>();
        const addedNodes = new Set<string>();

        for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex++) {
            const row = data.rows[rowIndex];
            if (!row) continue;
            const cellValue = row[valueColumn.index];
            if (cellValue == null) continue;

            const value = sanitizeDouble(toNumber(cellValue));
            let parentId = '';

            for (let level = 0; level < hierarchyColumns.length; level++) {
                const col = hierarchyColumns[level];
                if (!col) continue;
                const nodeValue = row[col.index];
                if (nodeValue == null) continue;

                const nodeLabel = String(nodeValue);
                const nodeId = parentId === '' ? nodeLabel : `${parentId}/${nodeLabel}`;

                if (level < hierarchyColumns.length - 1) {
                    // Branch node
                    if (!addedNodes.has(nodeId)) {
                        const branchIndex = labels.length;
                        labels.push(nodeLabel);
                        parents.push(parentId);
                        values.push(0);
                        ids.push(nodeId);
                        addedNodes.add(nodeId);
                        branchIndices.set(nodeId, branchIndex);
                    }
                    const idx = branchIndices.get(nodeId);
                    if (idx !== undefined) {
                        values[idx] = (values[idx] ?? 0) + value;
                    }
                } else {
                    // Leaf node
                    const leafId = `${nodeId}_${rowIndex}`;
                    labels.push(nodeLabel);
                    parents.push(parentId);
                    values.push(value);
                    ids.push(leafId);
                }

                parentId = nodeId;
            }
        }

        if (labels.length === 0) return undefined;

        let builder = new PlotlyChartBuilder();
        if (options.title) builder = builder.withTitle(options.title);

        builder = builder.addTreeMapTrace(labels, parents, values, valueColumn.column.name, ids, 'label+value', 'total');

        if (options.showLegend === false) builder = builder.hideLegend();
        builder = applyCommonOptions(builder, options);

        return builder;
    }

    // ─── Sankey ─────────────────────────────────────────────────────────

    private buildSankeyChart(data: ResultTable, options: ChartOptions): PlotlyChartBuilder | undefined {
        if (data.columns.length < 3 || data.rows.length === 0) return undefined;

        let sourceColumn: ColumnRef | undefined;
        let targetColumn: ColumnRef | undefined;
        let valueColumn: ColumnRef | undefined;

        for (let i = 0; i < data.columns.length; i++) {
            const col = data.columns[i];
            if (!col) continue;
            if (isNumericType(col.type)) {
                if (!valueColumn) valueColumn = getColumnRefByIndex(data, i);
            } else {
                if (!sourceColumn) sourceColumn = getColumnRefByIndex(data, i);
                else if (!targetColumn) targetColumn = getColumnRefByIndex(data, i);
            }
        }

        // Fallback: first two columns as source/target, third as value
        if (!sourceColumn || !targetColumn) {
            if (data.columns.length >= 3) {
                sourceColumn = getColumnRefByIndex(data, 0);
                targetColumn = getColumnRefByIndex(data, 1);
                valueColumn = getColumnRefByIndex(data, 2);
            } else {
                return undefined;
            }
        }

        if (!sourceColumn || !targetColumn || !valueColumn) return undefined;

        const nodeLabels: string[] = [];
        const nodeIndexMap = new Map<string, number>();

        function ensureNode(label: string) {
            if (!nodeIndexMap.has(label)) {
                nodeIndexMap.set(label, nodeLabels.length);
                nodeLabels.push(label);
            }
        }

        const linkSources: number[] = [];
        const linkTargets: number[] = [];
        const linkValues: number[] = [];

        for (const row of data.rows) {
            if (!row) continue;
            const sourceValue = row[sourceColumn.index];
            const targetValue = row[targetColumn.index];
            const flowValue = row[valueColumn.index];

            if (sourceValue == null || targetValue == null || flowValue == null) continue;

            const sourceLabel = String(sourceValue);
            const targetLabel = String(targetValue);
            const value = sanitizeDouble(toNumber(flowValue));

            if (value <= 0) continue;

            ensureNode(sourceLabel);
            ensureNode(targetLabel);

            linkSources.push(nodeIndexMap.get(sourceLabel)!);
            linkTargets.push(nodeIndexMap.get(targetLabel)!);
            linkValues.push(value);
        }

        if (nodeLabels.length === 0 || linkSources.length === 0) return undefined;

        let builder = new PlotlyChartBuilder();
        if (options.title) builder = builder.withTitle(options.title);

        builder = builder.addSankeyTrace(nodeLabels, linkSources, linkTargets, linkValues, valueColumn.column.name);

        if (options.showLegend === false) builder = builder.hideLegend();
        builder = applyCommonOptions(builder, options);

        return builder;
    }

    // ─── Common 2D Chart Builder ────────────────────────────────────────

    private build2dChart(
        builder: PlotlyChartBuilder,
        data: ResultTable,
        options: ChartOptions,
        addTrace: (b: PlotlyChartBuilder, x: unknown[], y: number[], name: string, yAxis?: string) => PlotlyChartBuilder,
    ): PlotlyChartBuilder | undefined {
        const xColumn = this.get2dXColumn(data, options);
        if (!xColumn) return undefined;

        const yColumns = this.get2dYColumns(data, options, xColumn);

        if (options.title) builder = builder.withTitle(options.title);
        if (options.xTitle) builder = builder.setXAxisTitle(options.xTitle);
        if (options.yTitle) builder = builder.setYAxisTitle(options.yTitle);
        if (options.xAxis === ChartAxis.Log) builder = builder.setLogX();
        if (options.yAxis === ChartAxis.Log) builder = builder.setLogY();

        const xMinD = tryGetDouble(options.xmin);
        const xMaxD = tryGetDouble(options.xmax);
        if (xMinD !== undefined && xMaxD !== undefined) {
            builder = builder.setXAxisRange(xMinD, xMaxD);
        }

        const yMinD = tryGetDouble(options.ymin);
        const yMaxD = tryGetDouble(options.ymax);
        if (yMinD !== undefined && yMaxD !== undefined) {
            builder = builder.setYAxisRange(yMinD, yMaxD);
        }

        if (options.showLegend === false) builder = builder.hideLegend();
        builder = applyCommonOptions(builder, options);

        for (const valueColumn of yColumns) {
            const result = this.get2DChartData(data, xColumn, valueColumn);
            if (result) {
                builder = addTrace(builder, result.x, result.y, valueColumn.column.name, undefined);
            }
        }

        return builder;
    }

    // ─── Data Column Helpers ────────────────────────────────────────────

    private get2dXColumn(data: ResultTable, options: ChartOptions): ColumnRef | undefined {
        if (options.xColumn) {
            return getColumnRef(data, options.xColumn);
        }
        if (options.yColumns) {
            for (let i = 0; i < data.columns.length; i++) {
                const col = data.columns[i];
                if (col && !options.yColumns.includes(col.name)) {
                    return getColumnRefByIndex(data, i);
                }
            }
        }
        return getColumnRefByIndex(data, 0);
    }

    private get2dYColumns(data: ResultTable, options: ChartOptions, xColumn: ColumnRef): ColumnRef[] {
        if (options.yColumns) {
            return options.yColumns
                .map(name => getColumnRef(data, name))
                .filter((c): c is ColumnRef => c !== undefined);
        }
        const result: ColumnRef[] = [];
        for (let i = 0; i < data.columns.length; i++) {
            if (i !== xColumn.index) {
                const ref = getColumnRefByIndex(data, i);
                if (ref) result.push(ref);
            }
        }
        return result;
    }

    private get2DChartData(data: ResultTable, xColumn: ColumnRef, yColumn: ColumnRef): { x: unknown[]; y: number[] } | undefined {
        if (!isNumericType(yColumn.column.type)) return undefined;

        const xValues = getColumnValues(data, xColumn);
        const yValues = getColumnValues(data, yColumn);

        const trimmed = trimNullRows(xValues, yValues);
        return { x: trimmed.x, y: convertToNumeric(trimmed.y) };
    }
}

// ─── Apply Common Options ───────────────────────────────────────────────────

function applyCommonOptions(builder: PlotlyChartBuilder, options: ChartOptions): PlotlyChartBuilder {
    if (options.xShowTicks === true) builder = builder.setXShowTicks(true);
    else if (options.xShowTicks === false) builder = builder.setXShowTicks(false);

    if (options.yShowTicks === true) builder = builder.setYShowTicks(true);
    else if (options.yShowTicks === false) builder = builder.setYShowTicks(false);

    if (options.xShowGrid === false) builder = builder.setXShowGrid(false);
    else if (options.xShowGrid === true) builder = builder.setXShowGrid(true);

    if (options.yShowGrid === false) builder = builder.setYShowGrid(false);
    else if (options.yShowGrid === true) builder = builder.setYShowGrid(true);

    if (options.xTickAngle != null) builder = builder.setXTickAngle(options.xTickAngle);
    if (options.yTickAngle != null) builder = builder.setYTickAngle(options.yTickAngle);

    if (options.sort != null && options.sort !== ChartSortOrder.Default) {
        const order = options.sort === ChartSortOrder.Ascending
            ? PlotlyCategoryOrders.TotalAscending
            : PlotlyCategoryOrders.TotalDescending;
        builder = builder.setCategoryOrder(order);
    }

    if (options.legendPosition != null) {
        if (options.legendPosition === ChartLegendPosition.Hidden) {
            builder = builder.hideLegend();
        } else {
            builder = builder.setLegendPosition(options.legendPosition);
        }
    }

    return builder;
}

// ─── Dark Mode Layout Helper ────────────────────────────────────────────────

function applyDarkModeToLayout(layoutJson: string): string {
    const layout = (JSON.parse(layoutJson) as Record<string, unknown>) ?? {};

    layout.paper_bgcolor = '#1e1e1e';
    layout.plot_bgcolor = '#1e1e1e';

    if (!layout.font || typeof layout.font !== 'object') { layout.font = {}; }
    (layout.font as Record<string, unknown>).color = '#f2f5fa';

    applyDarkModeToAxis(layout, 'xaxis');
    applyDarkModeToAxis(layout, 'yaxis');

    // Apply to additional axes (xaxis2, yaxis2, etc.)
    for (const key of Object.keys(layout)) {
        if ((key.startsWith('xaxis') || key.startsWith('yaxis')) && key !== 'xaxis' && key !== 'yaxis') {
            applyDarkModeToAxis(layout, key);
        }
    }

    // Apply to 3D scene axes if present
    if (layout.scene && typeof layout.scene === 'object') {
        const scene = layout.scene as Record<string, unknown>;
        applyDarkModeToAxis(scene, 'xaxis');
        applyDarkModeToAxis(scene, 'yaxis');
        applyDarkModeToAxis(scene, 'zaxis');
    }

    return JSON.stringify(layout);
}

function applyDarkModeToAxis(parent: Record<string, unknown>, axisKey: string): void {
    if (!parent[axisKey] || typeof parent[axisKey] !== 'object') { parent[axisKey] = {}; }
    const axis = parent[axisKey] as Record<string, unknown>;
    axis.color = '#f2f5fa';
    axis.gridcolor = '#444444';
    axis.linecolor = '#666666';
    axis.zerolinecolor = '#666666';
}
