import * as React from 'react'
import { combineDimensions } from '@refraction-ui/charts'
import type { Margin } from '@refraction-ui/charts'
import { ChartContext } from './chart-context.js'

export interface ChartProps {
  width?: number
  height?: number
  margin?: Partial<Margin>
  children?: React.ReactNode
  className?: string
}

export function Chart({
  width = 600,
  height = 400,
  margin,
  children,
  className,
}: ChartProps) {
  const dimensions = combineDimensions({ width, height, margin })

  return (
    <svg width={width} height={height} className={className}>
      <ChartContext.Provider value={{ dimensions }}>
        <g transform={`translate(${dimensions.margin.left},${dimensions.margin.top})`}>
          {children}
        </g>
      </ChartContext.Provider>
    </svg>
  )
}
