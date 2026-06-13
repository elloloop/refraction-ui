'use client'

import * as React from 'react'
import { AudioRoom, SpeakingOrb } from '@refraction-ui/react-audio-room'

interface AudioRoomExamplesProps {
  section: 'basic' | 'speaking-muted' | 'hand-raised'
}

export function AudioRoomExamples({ section }: AudioRoomExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <AudioRoom
          participants={[
            { id: '1', name: 'Alice Chen' },
            { id: '2', name: 'Bob Smith' },
            { id: '3', name: 'Carol White' },
            { id: '4', name: 'David Lee' },
          ]}
          aria-label="Audio room"
        />
      </div>
    )
  }

  if (section === 'speaking-muted') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        <p className="text-sm text-muted-foreground">
          Alice is speaking (glowing ring). Bob is muted (dimmed + badge).
        </p>
        <AudioRoom
          participants={[
            { id: '1', name: 'Alice Chen', speaking: true },
            { id: '2', name: 'Bob Smith', muted: true },
            { id: '3', name: 'Carol White' },
          ]}
          aria-label="Audio room — speaking and muted"
        />
      </div>
    )
  }

  if (section === 'hand-raised') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        <p className="text-sm text-muted-foreground">
          David has raised his hand. Carol is both speaking and has her hand raised.
        </p>
        <AudioRoom
          participants={[
            { id: '1', name: 'Alice Chen' },
            { id: '2', name: 'Bob Smith', muted: true },
            { id: '3', name: 'Carol White', speaking: true, handRaised: true },
            { id: '4', name: 'David Lee', handRaised: true },
            { id: '5', name: 'Eve Torres' },
          ]}
          aria-label="Audio room — raised hands"
        />
      </div>
    )
  }

  return null
}

/** Standalone SpeakingOrb usage demonstration. */
export function SpeakingOrbDemo() {
  return (
    <div className="flex flex-wrap gap-8 items-end p-8 rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center gap-2">
        <SpeakingOrb name="Alice Chen" />
        <span className="text-xs text-muted-foreground">Idle</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SpeakingOrb name="Bob Smith" speaking />
        <span className="text-xs text-muted-foreground">Speaking</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SpeakingOrb name="Carol White" muted />
        <span className="text-xs text-muted-foreground">Muted</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <SpeakingOrb name="David Lee" handRaised />
        <span className="text-xs text-muted-foreground">Hand raised</span>
      </div>
    </div>
  )
}
