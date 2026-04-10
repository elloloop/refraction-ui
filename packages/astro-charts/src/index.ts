export { default as Chart } from './Chart.astro'
export { default as Bars } from './Bars.astro'
export { default as Line } from './Line.astro'
export { default as PieChart } from './PieChart.astro'
export { default as ScatterPlot } from './ScatterPlot.astro'
export { default as Histogram } from './Histogram.astro'
export { default as XAxis } from './XAxis.astro'
export { default as YAxis } from './YAxis.astro'
export { default as Gradient } from './Gradient.astro'
export { default as Circles } from './Circles.astro'

// Re-export core types and utilities
export {
  combineDimensions,
  createLinearScale,
  createBandScale,
  computeExtent,
  computeHistogramBins,
  linePath,
  areaPath,
  arcPath,
  formatTick,
  generateTicks,
  COLORBLIND_SAFE_PALETTE,
  getChartColor,
} from '@refraction-ui/charts'
