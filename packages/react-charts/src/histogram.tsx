import * as React from 'react'
import {
  computeHistogramBins,
  createLinearScale,
  createBandScale,
  combineDimensions,
  formatTick,
} from '@elloloop/charts'
import type { Margin } from '@elloloop/charts'

export interface HistogramProps {
  data: number[]
  width?: number
  height?: number
  bins?: number
  fill?: string
  margin?: Partial<Margin>
}

export function Histogram({
  data,
  width = 600,
  height = 400,
  bins: binCount = 10,
  fill = 'steelblue',
  margin,
}: HistogramProps) {
  const dimensions = combineDimensions({ width, height, margin })
  const { boundedWidth, boundedHeight } = dimensions

  const histBins = computeHistogramBins(data, binCount)
  const maxCount = Math.max(...histBins.map((b) => b.count))

  const labels = histBins.map((b) => `${formatTick(b.x0, 'number')}-${formatTick(b.x1, 'number')}`)
  const xScale = createBandScale(labels, [0, boundedWidth], 0.05)
  const yScale = createLinearScale([0, maxCount], [boundedHeight, 0])

  const yTicks = yScale.ticks(5)

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${dimensions.margin.left},${dimensions.margin.top})`}>
        {histBins.map((bin, i) => {
          const label = labels[i]
          const barX = xScale(label)
          const barY = yScale(bin.count)
          const barHeight = boundedHeight - barY
          const barWidth = xScale.bandwidth()
          return (
            <rect
              key={i}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={fill}
            />
          )
        })}
        {/* X Axis */}
        <g transform={`translate(0,${boundedHeight})`}>
          {labels.map((label, i) => {
            const x = xScale(label) + xScale.bandwidth() / 2
            return (
              <g key={i} transform={`translate(${x},0)`}>
                <line y2={6} stroke="currentColor" />
                <text y={18} textAnchor="middle" fontSize={10} fill="currentColor">
                  {label}
                </text>
              </g>
            )
          })}
        </g>
        {/* Y Axis */}
        <g>
          {yTicks.map((tick, i) => {
            const y = yScale(tick)
            return (
              <g key={i} transform={`translate(0,${y})`}>
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
