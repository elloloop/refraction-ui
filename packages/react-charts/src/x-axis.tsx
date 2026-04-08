import * as React from 'react'

export interface XAxisProps {
  ticks: (number | string)[]
  scale: (value: number | string) => number
  height: number
  tickSize?: number
}

export function XAxis({
  ticks,
  scale,
  height,
  tickSize = 6,
}: XAxisProps) {
  return (
    <g transform={`translate(0,${height})`}>
      {ticks.map((tick, i) => {
        const x = scale(tick)
        return (
          <g key={i} transform={`translate(${x},0)`}>
            <line y2={tickSize} stroke="currentColor" />
            <text
              y={tickSize + 9}
              textAnchor="middle"
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
