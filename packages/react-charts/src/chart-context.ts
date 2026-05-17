import { createContext, useContext } from 'react'
import { devWarn } from '@refraction-ui/shared'
import type { Dimensions, Margin } from '@refraction-ui/charts'

export interface ChartContextValue {
  dimensions: Dimensions
  /**
   * Internal marker: `true` only on the context *default* (i.e. no `<Chart>`
   * provider above this consumer). `<Chart>` always supplies a value without
   * this flag. Used purely to detect the silent-default footgun — never read
   * for rendering, and stripped from the public type surface.
   *
   * @internal
   */
  __isDefault?: boolean
}

const DEFAULT_MARGIN: Margin = { top: 40, right: 30, bottom: 40, left: 75 }

export const ChartContext = createContext<ChartContextValue>({
  __isDefault: true,
  dimensions: {
    width: 600,
    height: 400,
    margin: DEFAULT_MARGIN,
    boundedWidth: 600 - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right,
    boundedHeight: 400 - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom,
  },
})

/**
 * Read the chart context for a sub-chart (`Bars`, `Line`, `Circles`, …).
 *
 * Footgun seam (epic #254 / #256, policy: `silent-default-context`): when a
 * sub-chart is rendered without a `<Chart>` ancestor it silently falls back to
 * a 600x400 default and renders visibly wrong (wrong scale, clipped, or
 * zero-sized) with no error. There is no throw today and adding one would be a
 * breaking change, so per `docs/instrumentation/policy.md` a dev-only
 * `devWarn` is the *only* signal. Stripped in production, warn-once.
 *
 * Behaviour is unchanged: the default dimensions are still returned.
 */
export function useChartContext(): ChartContextValue {
  const ctx = useContext(ChartContext)
  if (ctx.__isDefault) {
    devWarn(
      'react-charts/no-chart-provider',
      'A chart sub-component (Bars/Line/Circles/…) was rendered without a <Chart> ancestor. ' +
        'It is silently falling back to default 600x400 dimensions and will render with the ' +
        'wrong scale. Wrap it in <Chart>…</Chart>.',
    )
  }
  return ctx
}
