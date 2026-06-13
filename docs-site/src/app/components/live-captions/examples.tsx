'use client'

import * as React from 'react'
import { LiveCaptions } from '@refraction-ui/react-live-captions'
import type { CaptionCue } from '@refraction-ui/react-live-captions'

interface LiveCaptionsExamplesProps {
  section: 'single-line' | 'two-speakers' | 'interim'
}

export function LiveCaptionsExamples({ section }: LiveCaptionsExamplesProps) {
  if (section === 'single-line') {
    const cues: CaptionCue[] = [
      { id: '1', text: 'the bottleneck is review capacity', final: true },
    ]
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <LiveCaptions cues={cues} maxLines={1} />
      </div>
    )
  }

  if (section === 'two-speakers') {
    const cues: CaptionCue[] = [
      { id: '1', speaker: 'Maya', text: 'the bottleneck is review capacity', final: true },
      { id: '2', speaker: 'Alex', text: 'agreed, let me pull up the dashboard', final: true },
    ]
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <LiveCaptions cues={cues} maxLines={2} />
      </div>
    )
  }

  if (section === 'interim') {
    return <InterimExample />
  }

  return null
}

function InterimExample() {
  const [cues, setCues] = React.useState<CaptionCue[]>([
    { id: '1', speaker: 'Maya', text: 'the bottleneck is review capacity', final: true },
    { id: '2', speaker: 'Alex', text: 'agreed, let me pull up', final: false },
  ])

  const finalise = () => {
    setCues((prev) =>
      prev.map((c) =>
        c.id === '2' ? { ...c, text: 'agreed, let me pull up the dashboard', final: true } : c,
      ),
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <LiveCaptions cues={cues} maxLines={2} />
      <p className="text-xs text-muted-foreground">
        The second line is interim (non-final) — dimmed and italic while speech is in flight.
      </p>
      <button
        type="button"
        onClick={finalise}
        className="text-xs underline text-primary"
      >
        Finalise cue
      </button>
    </div>
  )
}
