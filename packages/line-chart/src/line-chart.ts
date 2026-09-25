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
  /** Target number of gridline intervals on the y-axis (the nice scale may use fewer). */
  tickCount?: number
  /** Headroom multiplier above the largest value. */
  headroom?: number
  /**
   * Show every n-th x label (the last label is always shown). Defaults to
   * thinning so labels are at least ~48 viewBox units apart.
   */
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
/** Minimum horizontal room per x label when thinning automatically. */
const MIN_LABEL_SPACING = 48
/** Number of `--chart-N` tokens the theme defines. */
const CHART_TOKEN_COUNT = 5

/** The theme chart colour for the series at `index` (wraps around). */
export function lineChartColor(index: number): string {
  return `hsl(var(--chart-${(index % CHART_TOKEN_COUNT) + 1}))`
}

const NICE_STEPS = [1, 2, 5, 10]

/**
 * A "nice" y-scale: a 1-2-5 × 10^k step so there are at most `tickCount`
 * intervals up to `rawMax`, and the max rounded up to a whole step. Tick
 * values are therefore round numbers by construction (0, 2000, 4000, …) —
 * never 5999.9999 — so any tick formatter prints clean labels.
 */
export function niceScale(rawMax: number, tickCount: number): { max: number; step: number; ticks: number[] } {
  const intervals = Math.max(1, Math.floor(tickCount))
  if (!(rawMax > 0)) return { max: 1, step: 1 / intervals, ticks: Array.from({ length: intervals + 1 }, (_, i) => i / intervals) }
  const target = rawMax / intervals
  const magnitude = 10 ** Math.floor(Math.log10(target))
  const step = NICE_STEPS.map((m) => m * magnitude).find((candidate) => candidate >= target) ?? 10 * magnitude
  const count = Math.ceil(rawMax / step - 1e-9)
  // Strip binary floating-point noise (e.g. 0.1 * 3) to the step's precision.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  const clean = (value: number) => Number(value.toFixed(decimals))
  const ticks = Array.from({ length: count + 1 }, (_, i) => clean(i * step))
  return { max: ticks[ticks.length - 1], step: clean(step), ticks }
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
  } = options
  const padding = { ...DEFAULT_LINE_CHART_PADDING, ...options.padding }
  const n = labels.length
  const values = series.flatMap((s) => s.data)
  const peak = values.length ? Math.max(...values) : 0
  const scale = niceScale(peak > 0 ? peak * headroom : 0, tickCount)
  const max = scale.max
  const plotW = width - padding.left - padding.right
  const plotTop = padding.top
  const plotBottom = height - padding.bottom
  const plotH = plotBottom - plotTop

  const labelEvery =
    options.labelEvery ??
    Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / MIN_LABEL_SPACING))))

  const x = (index: number) => padding.left + (n > 1 ? (index / (n - 1)) * plotW : plotW / 2)
  const y = (value: number) => plotTop + (1 - value / max) * plotH

  const ticks: LineChartTick[] = scale.ticks.map((value) => ({ value, y: y(value) }))

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
