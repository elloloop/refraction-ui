export interface FunnelChartStep {
  /** Stable key. */
  id: string
  /** Step name. */
  label: string
  /** Secondary line under the label. */
  description?: string
  /** Count at this step. */
  value: number
}

export interface FunnelChartTransition {
  /** Percent (0–100) of this step that reached the next one. */
  conversion: number
  /** Absolute count lost between this step and the next. */
  dropped: number
}

export interface FunnelChartRow {
  step: FunnelChartStep
  /** Percent (0–100) of the first step's value. */
  shareOfTop: number
  /** Width the bar draws at, in percent — never below `minBarPercent`. */
  barPercent: number
  /** Transition to the following step; absent on the last step. */
  next?: FunnelChartTransition
}

/** Smallest bar width in percent, so a tiny step stays visible. */
export const DEFAULT_FUNNEL_MIN_BAR_PERCENT = 6

const percentOf = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0)

/**
 * Derive every row of a stepped conversion funnel: each step's share of the top
 * step, the bar width it draws at, and between two steps the continue-rate and
 * how many were lost. Pure and deterministic.
 */
export function computeFunnel(
  steps: FunnelChartStep[],
  minBarPercent: number = DEFAULT_FUNNEL_MIN_BAR_PERCENT,
): FunnelChartRow[] {
  const top = steps.length ? steps[0].value : 0
  return steps.map((step, i) => {
    const shareOfTop = percentOf(step.value, top)
    const following = steps[i + 1]
    return {
      step,
      shareOfTop,
      barPercent: Math.min(100, Math.max(shareOfTop, minBarPercent)),
      next: following
        ? {
            conversion: percentOf(following.value, step.value),
            dropped: step.value - following.value,
          }
        : undefined,
    }
  })
}

/** Default copy + number formatting; every one is overridable by a prop. */
export const funnelChartDefaults = {
  formatValue: (value: number) => value.toLocaleString('en-US'),
  formatPercent: (percent: number) => `${percent.toFixed(1)}%`,
  shareLabel: (share: string) => `${share} of top`,
  conversionLabel: (percent: string) => `${percent} continue`,
  droppedLabel: (count: string) => `−${count} dropped`,
}
