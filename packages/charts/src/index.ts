// Scales
export {
  createLinearScale,
  createBandScale,
  createTimeScale,
} from './scales.js'

export type {
  LinearScale,
  BandScale,
  TimeScale,
} from './scales.js'

// Data utilities
export {
  computeExtent,
  computeMean,
  computeHistogramBins,
  normalizeData,
} from './data.js'

export type { HistogramBin } from './data.js'

// Geometry
export {
  linePath,
  areaPath,
  arcPath,
} from './geometry.js'

export type { Point } from './geometry.js'

// Chart
export {
  createChart,
  combineDimensions,
} from './chart.js'

export type {
  ChartConfig,
  ChartAPI,
  Dimensions,
  Margin,
} from './chart.js'

// Axis
export {
  generateTicks,
  formatTick,
} from './axis.js'

// Colorblind-safe palette & patterns
export {
  COLORBLIND_SAFE_PALETTE,
  hexToHSL,
  getChartColor,
  getPatternDef,
  PATTERNS,
} from './colorblind.js'

export type { PatternType } from './colorblind.js'
