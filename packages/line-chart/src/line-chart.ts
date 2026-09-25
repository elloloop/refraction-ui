export interface LineChartSeries {
  /** Stable key for the series. */
  id: string
  /** Legend / tooltip name. */
  name: string
  /**
   * Any CSS colour (a token `hsl(var(--…))` or a data colour). Defaults to the
   * theme's chart palette (`--chart-1` … `--chart-5`) by series position.
   */
  color?: string
  /** One value per label, in label order. */
  data: number[]
}

export interface LineChartPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export interface LineChartOptions {
  series: LineChartSeries[]
  labels: string[]
  /** viewBox width — the SVG scales to its container's width. */
  width: number
  /** viewBox height. */
  height: number
  padding?: Partial<LineChartPadding>
  /** Number of gridline intervals on the y-axis. */
  tickCount?: number
  /** Headroom multiplier above the largest value. */
  headroom?: number
  /** Show every n-th x label (the last label is always shown). */
  labelEvery?: number
}

export interface LineChartTick {
  value: number
  y: number
}

export interface LineChartXLabel {
  index: number
  label: string
  x: number
}

export interface LineChartPath {
  id: string
  /** Resolved stroke colour. */
  color: string
  /** The stroke path. */
  line: string
  /** The line closed down to the zero baseline, for an area fill. */
  area: string
}

export interface LineChartColumn {
  index: number
  x: number
  width: number
}

export interface LineChartGeometry {
  width: number
  height: number
  padding: LineChartPadding
  /** Top of the shared y-scale. */
  max: number
  ticks: LineChartTick[]
  xLabels: LineChartXLabel[]
  paths: LineChartPath[]
  /** One hover/focus column per category. */
  columns: LineChartColumn[]
  x: (index: number) => number
  y: (value: number) => number
  /** Top and bottom of the plot area, for a crosshair. */
  plotTop: number
  plotBottom: number
}

export const DEFAULT_LINE_CHART_PADDING: LineChartPadding = {
  top: 14,
  right: 14,
  bottom: 24,
  left: 40,
}

export const DEFAULT_LINE_CHART_WIDTH = 760
export const DEFAULT_LINE_CHART_HEIGHT = 230
const DEFAULT_TICK_COUNT = 4
const DEFAULT_HEADROOM = 1.08
const DEFAULT_LABEL_EVERY = 2
/** Number of `--chart-N` tokens the theme defines. */
const CHART_TOKEN_COUNT = 5

/** The theme chart colour for the series at `index` (wraps around). */
export function lineChartColor(index: number): string {
  return `hsl(var(--chart-${(index % CHART_TOKEN_COUNT) + 1}))`
}

function pathFrom(points: Array<[number, number]>): string {
  return points.map(([px, py], i) => (i ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1)).join(' ')
}

/**
 * Pure geometry for a responsive multi-series line chart. Every series shares
 * ONE y-scale (zero baseline to the largest value plus headroom), so series are
 * comparable. Coordinates are in viewBox units; the SVG scales to its container.
 */
export function computeLineChart(options: LineChartOptions): LineChartGeometry {
  const {
    series,
    labels,
    width,
    height,
    tickCount = DEFAULT_TICK_COUNT,
    headroom = DEFAULT_HEADROOM,
    labelEvery = DEFAULT_LABEL_EVERY,
  } = options
  const padding = { ...DEFAULT_LINE_CHART_PADDING, ...options.padding }
  const n = labels.length
  const values = series.flatMap((s) => s.data)
  const peak = values.length ? Math.max(...values) : 0
  const max = peak > 0 ? peak * headroom : 1
  const plotW = width - padding.left - padding.right
  const plotTop = padding.top
  const plotBottom = height - padding.bottom
  const plotH = plotBottom - plotTop

  const x = (index: number) => padding.left + (n > 1 ? (index / (n - 1)) * plotW : plotW / 2)
  const y = (value: number) => plotTop + (1 - value / max) * plotH

  const ticks: LineChartTick[] = Array.from({ length: tickCount + 1 }, (_, t) => {
    const value = (max / tickCount) * t
    return { value, y: y(value) }
  })

  const xLabels: LineChartXLabel[] = labels
    .map((label, index) => ({ index, label, x: x(index) }))
    .filter(({ index }) => index % labelEvery === 0 || index === n - 1)

  const paths: LineChartPath[] = series.map((s, si) => {
    const points = s.data.map((v, i): [number, number] => [x(i), y(v)])
    const line = pathFrom(points)
    const first = points.length ? points[0][0] : x(0)
    const last = points.length ? points[points.length - 1][0] : x(0)
    const base = y(0).toFixed(1)
    const area = `${line} L ${last.toFixed(1)} ${base} L ${first.toFixed(1)} ${base} Z`
    return { id: s.id, color: s.color ?? lineChartColor(si), line, area }
  })

  const colW = n > 1 ? plotW / (n - 1) : plotW
  const columns: LineChartColumn[] = labels.map((_, index) => ({
    index,
    x: x(index) - colW / 2,
    width: colW,
  }))

  return { width, height, padding, max, ticks, xLabels, paths, columns, x, y, plotTop, plotBottom }
}

/** Where a tooltip for `index` sits horizontally, as a percent of the chart width. */
export function tooltipLeftPercent(geometry: LineChartGeometry, index: number): number {
  return (geometry.x(index) / geometry.width) * 100
}

/**
 * The category index a keyboard key moves to from `current` (null = nothing
 * active yet). Returns `current` unchanged for keys the chart doesn't handle.
 */
export function nextLineChartIndex(current: number | null, key: string, count: number): number | null {
  if (count === 0) return null
  const last = count - 1
  switch (key) {
    case 'ArrowRight':
      return current == null ? 0 : Math.min(current + 1, last)
    case 'ArrowLeft':
      return current == null ? last : Math.max(current - 1, 0)
    case 'Home':
      return 0
    case 'End':
      return last
    default:
      return current
  }
}
