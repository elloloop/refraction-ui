import * as React from 'react'
import { arcPath } from '@elloloop/charts'

const DEFAULT_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2',
  '#59a14f', '#edc948', '#b07aa1', '#ff9da7',
  '#9c755f', '#bab0ac',
]

export interface PieChartProps<T = unknown> {
  data: T[]
  value: (d: T) => number
  width?: number
  height?: number
  colors?: string[]
}

export function PieChart<T>({
  data,
  value,
  width = 300,
  height = 300,
  colors = DEFAULT_COLORS,
}: PieChartProps<T>) {
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(cx, cy) - 10

  const values = data.map(value)
  const total = values.reduce((sum, v) => sum + v, 0)

  let currentAngle = -Math.PI / 2

  const arcs = data.map((_, i) => {
    const sliceAngle = (values[i] / total) * Math.PI * 2
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle
    currentAngle = endAngle
    return { startAngle, endAngle, color: colors[i % colors.length] }
  })

  return (
    <svg width={width} height={height}>
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arcPath(cx, cy, radius, arc.startAngle, arc.endAngle)}
          fill={arc.color}
        />
      ))}
    </svg>
  )
}
