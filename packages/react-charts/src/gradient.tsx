import * as React from 'react'

export interface GradientProps {
  id: string
  from: string
  to: string
  direction?: 'vertical' | 'horizontal'
}

export function Gradient({
  id,
  from,
  to,
  direction = 'vertical',
}: GradientProps) {
  const isVertical = direction === 'vertical'

  return (
    <defs>
      <linearGradient
        id={id}
        x1="0"
        y1="0"
        x2={isVertical ? '0' : '1'}
        y2={isVertical ? '1' : '0'}
      >
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    </defs>
  )
}
