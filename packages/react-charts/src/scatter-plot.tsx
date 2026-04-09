import * as React from 'react'
import {
  createLinearScale,
  computeExtent,
  combineDimensions,
  formatTick,
} from '@elloloop/charts'
import type { Margin } from '@elloloop/charts'

export interface ScatterPlotProps<T = unknown> {
  data: T[]
  x: (d: T) => number
  y: (d: T) => number
  width?: number
  height?: number
  r?: number
  fill?: string
  margin?: Partial<Margin>
}

export function ScatterPlot<T>({
  data,
  x,
  y,
  width = 600,
  height = 400,
  r = 4,
  fill = 'steelblue',
  margin,
}: ScatterPlotProps<T>) {
  const dimensions = combineDimensions({ width, height, margin })
  const { boundedWidth, boundedHeight } = dimensions

  const xValues = data.map(x)
  const yValues = data.map(y)
  const [xMin, xMax] = computeExtent(xValues)
  const [yMin, yMax] = computeExtent(yValues)

  const xScale = createLinearScale([xMin, xMax], [0, boundedWidth])
  const yScale = createLinearScale([yMin, yMax], [boundedHeight, 0])

  const xTicks = xScale.ticks(5)
  const yTicks = yScale.ticks(5)

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${dimensions.margin.left},${dimensions.margin.top})`}>
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(x(d))}
            cy={yScale(y(d))}
            r={r}
            fill={fill}
          />
        ))}
        {/* X Axis */}
        <g transform={`translate(0,${boundedHeight})`}>
          {xTicks.map((tick, i) => {
            const px = xScale(tick)
            return (
              <g key={i} transform={`translate(${px},0)`}>
                <line y2={6} stroke="currentColor" />
                <text y={18} textAnchor="middle" fontSize={10} fill="currentColor">
                  {formatTick(tick, 'number')}
                </text>
              </g>
            )
          })}
        </g>
        {/* Y Axis */}
        <g>
          {yTicks.map((tick, i) => {
            const py = yScale(tick)
            return (
              <g key={i} transform={`translate(0,${py})`}>
                <line x2={-6} stroke="currentColor" />
                <text x={-9} dy="0.32em" textAnchor="end" fontSize={10} fill="currentColor">
                  {formatTick(tick, 'number')}
                </text>
              </g>
            )
          })}
        </g>
      </g>
    </svg>
  )
}
