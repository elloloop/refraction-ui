import * as React from 'react'
import {
  computeLineChart,
  lineChartClasses as c,
  nextLineChartIndex,
  tooltipLeftPercent,
  DEFAULT_LINE_CHART_WIDTH,
  DEFAULT_LINE_CHART_HEIGHT,
  type LineChartSeries,
} from '@refraction-ui/line-chart'
import { cn } from '@refraction-ui/shared'

export type { LineChartSeries }

export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The series to plot, all on one shared y-scale. */
  series: LineChartSeries[]
  /** One category label per data point. */
  labels: string[]
  /** Accessible name of the chart image (required). */
  ariaLabel: string
  /** Rendered height in px (also the viewBox height). Defaults to 230. */
  height?: number
  /**
   * Fallback width, used for the server render and before the container is
   * measured. On the client the chart measures its container and draws at that
   * width, so text and strokes stay at their authored size. Defaults to 760.
   */
  width?: number
  /** Formats a value in the tooltip. */
  formatValue?: (value: number) => string
  /** Formats a y-axis tick. Defaults to `formatValue`. */
  formatTick?: (value: number) => string
  /** Fill the area under each line. Defaults to on for a single series only. */
  area?: boolean
  /** Show the series legend under the chart. Defaults to true. */
  showLegend?: boolean
}

const defaultFormat = (value: number) => String(Math.round(value))
const MARKER_RADIUS = 3.5
const STROKE_WIDTH = 2.2
const TOOLTIP_TOP_PX = 8

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

/**
 * Width of `ref`'s element in CSS px, tracked with a ResizeObserver; `null`
 * until measured (server render, or no ResizeObserver).
 */
function useMeasuredWidth(ref: React.RefObject<HTMLElement | null>): number | null {
  const [measured, setMeasured] = React.useState<number | null>(null)
  useIsomorphicLayoutEffect(() => {
    const node = ref.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const apply = (w: number) => {
      const rounded = Math.round(w)
      if (rounded > 0) setMeasured((prev) => (prev === rounded ? prev : rounded))
    }
    apply(node.getBoundingClientRect().width)
    const observer = new ResizeObserver((entries) => apply(entries[0]?.contentRect.width ?? 0))
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return measured
}

/**
 * LineChart — a responsive multi-series line chart on one shared y-scale, with
 * gridlines, category x-labels, a hover/keyboard crosshair + tooltip and a
 * legend. It measures its container and draws at that width (1:1 viewBox), so
 * axis text keeps its authored size in narrow panels.
 * Keyboard: focus the chart, then ←/→/Home/End move between categories.
 */
export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  {
    series,
    labels,
    ariaLabel,
    height = DEFAULT_LINE_CHART_HEIGHT,
    width: fallbackWidth = DEFAULT_LINE_CHART_WIDTH,
    formatValue = defaultFormat,
    formatTick,
    area,
    showLegend = true,
    className,
    ...rest
  },
  forwardedRef,
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )
  // Draw at the container's real width: a fixed viewBox stretched to a narrow
  // panel would shrink the axis text and the chart height with it.
  const width = useMeasuredWidth(rootRef) ?? fallbackWidth
  const [active, setActive] = React.useState<number | null>(null)
  const gradientBase = React.useId().replace(/:/g, '')
  const geo = React.useMemo(
    () => computeLineChart({ series, labels, width, height }),
    [series, labels, width, height],
  )
  const fillArea = area ?? series.length === 1
  const tick = formatTick ?? formatValue

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const next = nextLineChartIndex(active, event.key, labels.length)
    if (next === active) return
    event.preventDefault()
    setActive(next)
  }

  return (
    <div ref={ref} className={cn(c.root, className)} data-slot="line-chart" {...rest}>
      <svg
        className={c.svg}
        viewBox={`0 0 ${width} ${height}`}
        style={{ height }}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
      >
        {geo.ticks.map((t, i) => (
          <g key={i}>
            <line className={c.gridline} x1={geo.padding.left} y1={t.y} x2={width - geo.padding.right} y2={t.y} />
            <text className={c.axis} x={geo.padding.left - 8} y={t.y + 3} textAnchor="end">
              {tick(t.value)}
            </text>
          </g>
        ))}
        {geo.xLabels.map((l) => (
          <text key={l.index} className={c.axis} x={l.x} y={height - 6} textAnchor="middle">
            {l.label}
          </text>
        ))}
        {geo.paths.map((p, si) => {
          const gid = `${gradientBase}-${si}`
          const value = active != null ? series[si].data[active] : undefined
          return (
            <g key={p.id}>
              {fillArea && (
                <>
                  <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={p.color} stopOpacity="0.22" />
                      <stop offset="100%" stopColor={p.color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={p.area} fill={`url(#${gid})`} />
                </>
              )}
              <path
                d={p.line}
                fill="none"
                stroke={p.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {active != null && value != null && (
                <circle
                  className={c.marker}
                  cx={geo.x(active)}
                  cy={geo.y(value)}
                  r={MARKER_RADIUS}
                  fill={p.color}
                  strokeWidth="1.5"
                />
              )}
            </g>
          )
        })}
        {active != null && (
          <line
            className={c.crosshair}
            x1={geo.x(active)}
            y1={geo.plotTop}
            x2={geo.x(active)}
            y2={geo.plotBottom}
            strokeDasharray="3 3"
          />
        )}
        {geo.columns.map((col) => (
          <rect
            key={col.index}
            data-index={col.index}
            x={col.x}
            y={0}
            width={col.width}
            height={height}
            fill="transparent"
            onMouseEnter={() => setActive(col.index)}
          />
        ))}
      </svg>
      {active != null && (
        <div
          className={c.tooltip}
          role="status"
          style={{ left: `${tooltipLeftPercent(geo, active)}%`, top: TOOLTIP_TOP_PX }}
        >
          <div className={c.tooltipLabel}>{labels[active]}</div>
          {series.map((s, si) => (
            <div key={s.id} className={c.tooltipRow}>
              <span style={{ color: geo.paths[si].color }}>{s.name}</span>
              <b>{s.data[active] != null ? formatValue(s.data[active]) : '—'}</b>
            </div>
          ))}
        </div>
      )}
      {showLegend && (
        <div className={c.legend}>
          {series.map((s, si) => (
            <span key={s.id} className={c.legendItem}>
              <i className={c.legendSwatch} style={{ background: geo.paths[si].color }} aria-hidden="true" />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
})
