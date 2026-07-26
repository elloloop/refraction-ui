import * as React from 'react'

export interface YAxisProps {
  ticks: (number | string)[]
  scale: (value: number | string) => number
  tickSize?: number
  className?: string
}

export function YAxis({
  ticks,
  scale,
  tickSize = 6,
  className,
}: YAxisProps) {
  return (
    <g className={className}>
      {ticks.map((tick, i) => {
        const y = scale(tick)
        return (
          <g key={i} transform={`translate(0,${y})`}>
            <line x2={-tickSize} stroke="currentColor" />
            <text
              x={-tickSize - 4}
              dy="0.32em"
              textAnchor="end"
              fontSize={12}
              fill="currentColor"
            >
              {String(tick)}
            </text>
          </g>
        )
      })}
    </g>
  )
}
