import * as React from 'react'
import { useContext } from 'react'
import { createBandScale, createLinearScale, computeExtent } from '@elloloop/charts'
import { ChartContext } from './chart-context.js'

export interface BarsProps<T = unknown> {
  data: T[]
  x: (d: T) => string
  y: (d: T) => number
  fill?: string
}

export function Bars<T>({ data, x, y, fill = 'currentColor' }: BarsProps<T>) {
  const { dimensions } = useContext(ChartContext)
  const { boundedWidth, boundedHeight } = dimensions

  const labels = data.map(x)
  const values = data.map(y)
  const [, maxVal] = computeExtent(values)

  const xScale = createBandScale(labels, [0, boundedWidth], 0.1)
  const yScale = createLinearScale([0, maxVal], [boundedHeight, 0])

  return (
    <g>
      {data.map((d, i) => {
        const label = labels[i]
        const value = values[i]
        const barX = xScale(label)
        const barY = yScale(value)
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
    </g>
  )
}
