'use client'

import * as React from 'react'
import {
  LiveDot,
  LIVE_DOT_COLORS,
  LIVE_DOT_SIZES,
} from '@refraction-ui/react-live-dot'

export type LiveDotExampleSection =
  | 'basic'
  | 'colors'
  | 'sizes'
  | 'in-context'
  | 'standalone'

interface LiveDotExamplesProps {
  section: LiveDotExampleSection
}

const frame = 'rounded-xl border border-border bg-card p-8'

export function LiveDotExamples({ section }: LiveDotExamplesProps) {
  if (section === 'basic') return <ToggleExample />

  if (section === 'colors') {
    return (
      <div className={`${frame} flex flex-wrap gap-6`}>
        {LIVE_DOT_COLORS.map((color) => (
          <span key={color} className="inline-flex items-center gap-2 text-sm text-foreground">
            <LiveDot color={color} />
            {color}
          </span>
        ))}
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className={`${frame} flex flex-wrap items-center gap-6`}>
        {LIVE_DOT_SIZES.map((size) => (
          <span key={size} className="inline-flex items-center gap-2 text-sm text-foreground">
            <LiveDot size={size} color="primary" />
            {size}
          </span>
        ))}
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <LiveDot size={1} color="primary" />
          1rem
        </span>
      </div>
    )
  }

  if (section === 'in-context') {
    return (
      <div className={`${frame} flex flex-col gap-4`}>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <LiveDot color="destructive" />
          Recording
        </span>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <LiveDot color="info" size="xs" />
          Checking for updates…
        </span>
        <span className="inline-flex items-center gap-2 text-sm text-foreground">
          <LiveDot color="success" />
          Live call · 3 people
        </span>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <LiveDot color="muted" live={false} />
          Call ended
        </span>
      </div>
    )
  }

  if (section === 'standalone') {
    return (
      <div className={`${frame} flex items-center gap-3`}>
        <span className="text-sm text-foreground">Camera</span>
        <LiveDot color="destructive" size="md" label="Recording" />
      </div>
    )
  }

  return null
}

function ToggleExample() {
  const [live, setLive] = React.useState(true)
  return (
    <div className={`${frame} flex flex-wrap items-center gap-6`}>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
        <LiveDot live={live} color="destructive" size="md" />
        {live ? 'Recording' : 'Paused'}
      </span>
      <button
        type="button"
        onClick={() => setLive((v) => !v)}
        aria-pressed={live}
        className="inline-flex min-h-11 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {live ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
