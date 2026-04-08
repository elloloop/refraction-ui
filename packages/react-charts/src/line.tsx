import * as React from 'react'
import { useContext } from 'react'
import { createLinearScale, computeExtent, linePath } from '@refraction-ui/charts'
import { ChartContext } from './chart-context.js'

export interface LineProps<T = unknown> {
  data: T[]
  x: (d: T) => number
  y: (d: T) => number
  stroke?: string
  strokeWidth?: number
  fill?: string
}

export function Line<T>({
  data,
  x,
  y,
  stroke = 'currentColor',
  strokeWidth = 2,
  fill = 'none',
}: LineProps<T>) {
  const { dimensions } = useContext(ChartContext)
  const { boundedWidth, boundedHeight } = dimensions

  const xValues = data.map(x)
  const yValues = data.map(y)
  const [xMin, xMax] = computeExtent(xValues)
  const [yMin, yMax] = computeExtent(yValues)

  const xScale = createLinearScale([xMin, xMax], [0, boundedWidth])
  const yScale = createLinearScale([yMin, yMax], [boundedHeight, 0])

  const points = data.map((d) => ({
    x: xScale(x(d)),
    y: yScale(y(d)),
  }))

  const d = linePath(points)

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
    />
  )
}
