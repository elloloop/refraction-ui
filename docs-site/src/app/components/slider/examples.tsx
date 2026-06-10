'use client'

import * as React from 'react'
import type { SliderProps } from '@refraction-ui/react-slider'

// The `@refraction-ui/react-slider` package currently ships the headless
// `SliderProps` contract; the styled component is in development. The previews
// below use a native range input to illustrate the intended controlled API.

interface SliderExamplesProps {
  section: 'default' | 'range'
}

// Reference the published contract so the example stays in sync with the package.
type _Contract = SliderProps

export function SliderExamples({ section }: SliderExamplesProps) {
  const [value, setValue] = React.useState(40)
  const [volume, setVolume] = React.useState(70)

  if (section === 'default') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Brightness</span>
            <span className="font-mono text-muted-foreground">{value}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label="Brightness"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
        </div>
      </div>
    )
  }

  if (section === 'range') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Volume</span>
            <span className="font-mono text-muted-foreground">{volume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Stepped in increments of 5 between 0 and 100.
          </p>
        </div>
      </div>
    )
  }

  return null
}
