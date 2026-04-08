import * as React from 'react'
import { useContext } from 'react'
import { createLinearScale, computeExtent } from '@refraction-ui/charts'
import { ChartContext } from './chart-context.js'

export interface CirclesProps<T = unknown> {
  data: T[]
  cx: (d: T) => number
  cy: (d: T) => number
  r?: number
  fill?: string
}

export function Circles<T>({
  data,
  cx,
  cy,
  r = 4,
  fill = 'currentColor',
}: CirclesProps<T>) {
  const { dimensions } = useContext(ChartContext)
  const { boundedWidth, boundedHeight } = dimensions

  const xValues = data.map(cx)
  const yValues = data.map(cy)
  const [xMin, xMax] = computeExtent(xValues)
  const [yMin, yMax] = computeExtent(yValues)

  const xScale = createLinearScale([xMin, xMax], [0, boundedWidth])
  const yScale = createLinearScale([yMin, yMax], [boundedHeight, 0])

  return (
    <g>
      {data.map((d, i) => (
        <circle
          key={i}
          cx={xScale(cx(d))}
          cy={yScale(cy(d))}
          r={r}
          fill={fill}
        />
      ))}
    </g>
  )
}
