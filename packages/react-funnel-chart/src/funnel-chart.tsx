import * as React from 'react'
import {
  computeFunnel,
  funnelChartClasses as c,
  funnelChartDefaults,
  DEFAULT_FUNNEL_MIN_BAR_PERCENT,
  type FunnelChartStep,
} from '@refraction-ui/funnel-chart'
import { cn } from '@refraction-ui/shared'

export type { FunnelChartStep }

export interface FunnelChartProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  /** The funnel steps, top first. */
  steps: FunnelChartStep[]
  /** Formats a count. */
  formatValue?: (value: number) => string
  /** Formats a percent (already 0–100). */
  formatPercent?: (percent: number) => string
  /** Smallest bar width in percent, so a tiny step stays visible. Defaults to 6. */
  minBarPercent?: number
  /** Copy — a step's share of the top step. */
  shareLabel?: (share: string) => string
  /** Copy — continue-rate between two steps. */
  conversionLabel?: (percent: string) => string
  /** Copy — count lost between two steps. */
  droppedLabel?: (count: string) => string
}

function Chevron() {
  return (
    <svg
      className={c.chevron}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

/**
 * FunnelChart — a vertical conversion funnel: one bar per step, filled to its
 * share of the first step, with the continue-rate and drop-off between steps.
 * Renders an ordered list, so the figures are real text for assistive tech.
 */
export const FunnelChart = React.forwardRef<HTMLOListElement, FunnelChartProps>(function FunnelChart(
  {
    steps,
    formatValue = funnelChartDefaults.formatValue,
    formatPercent = funnelChartDefaults.formatPercent,
    minBarPercent = DEFAULT_FUNNEL_MIN_BAR_PERCENT,
    shareLabel = funnelChartDefaults.shareLabel,
    conversionLabel = funnelChartDefaults.conversionLabel,
    droppedLabel = funnelChartDefaults.droppedLabel,
    className,
    ...rest
  },
  ref,
) {
  const rows = React.useMemo(() => computeFunnel(steps, minBarPercent), [steps, minBarPercent])
  return (
    <ol ref={ref} className={cn(c.root, className)} data-slot="funnel-chart" {...rest}>
      {rows.map((row) => (
        <li key={row.step.id}>
          <div className={c.bar}>
            <div className={c.fill} style={{ width: `${row.barPercent}%` }} aria-hidden="true" />
            <Chevron />
            <div className={c.text}>
              <b className={c.label}>{row.step.label}</b>
              {row.step.description && <span className={c.description}>{row.step.description}</span>}
            </div>
            <div className={c.figure}>
              <b className={c.value}>{formatValue(row.step.value)}</b>
              <span className={c.share}>{shareLabel(formatPercent(row.shareOfTop))}</span>
            </div>
          </div>
          {row.next && (
            <div className={c.transition}>
              <span className={c.conversion}>{conversionLabel(formatPercent(row.next.conversion))}</span>
              <span aria-hidden="true">·</span>
              <span className={c.dropped}>{droppedLabel(formatValue(row.next.dropped))}</span>
            </div>
          )}
        </li>
      ))}
    </ol>
  )
})
