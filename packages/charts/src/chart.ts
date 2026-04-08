export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Dimensions {
  width: number
  height: number
  margin: Margin
  boundedWidth: number
  boundedHeight: number
}

export interface ChartConfig {
  width?: number
  height?: number
  margin?: Partial<Margin>
  data?: unknown[]
}

export interface ChartAPI {
  dimensions: Dimensions
  scales: Record<string, unknown>
  updateDimensions: (partial: Partial<ChartConfig>) => void
}

const DEFAULT_MARGIN: Margin = {
  top: 40,
  right: 30,
  bottom: 40,
  left: 75,
}

const DEFAULT_WIDTH = 600
const DEFAULT_HEIGHT = 400

export function combineDimensions(partial: Partial<ChartConfig>): Dimensions {
  const width = partial.width ?? DEFAULT_WIDTH
  const height = partial.height ?? DEFAULT_HEIGHT
  const margin: Margin = {
    ...DEFAULT_MARGIN,
    ...(partial.margin ?? {}),
  }
  const boundedWidth = Math.max(0, width - margin.left - margin.right)
  const boundedHeight = Math.max(0, height - margin.top - margin.bottom)

  return { width, height, margin, boundedWidth, boundedHeight }
}

export function createChart(config: ChartConfig): ChartAPI {
  let dimensions = combineDimensions(config)
  const scales: Record<string, unknown> = {}

  return {
    get dimensions() {
      return dimensions
    },
    scales,
    updateDimensions(partial: Partial<ChartConfig>) {
      const merged: Partial<ChartConfig> = {
        width: partial.width ?? dimensions.width,
        height: partial.height ?? dimensions.height,
        margin: {
          ...dimensions.margin,
          ...(partial.margin ?? {}),
        },
      }
      dimensions = combineDimensions(merged)
    },
  }
}
