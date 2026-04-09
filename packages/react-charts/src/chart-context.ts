import { createContext } from 'react'
import type { Dimensions, Margin } from '@elloloop/charts'

export interface ChartContextValue {
  dimensions: Dimensions
}

const DEFAULT_MARGIN: Margin = { top: 40, right: 30, bottom: 40, left: 75 }

export const ChartContext = createContext<ChartContextValue>({
  dimensions: {
    width: 600,
    height: 400,
    margin: DEFAULT_MARGIN,
    boundedWidth: 600 - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right,
    boundedHeight: 400 - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom,
  },
})
