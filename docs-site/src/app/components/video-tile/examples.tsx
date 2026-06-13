'use client'

import * as React from 'react'
import { VideoTile } from '@refraction-ui/react-video-tile'

interface VideoTileExamplesProps {
  section: 'basic' | 'speaking-muted' | 'pinned'
}

export function VideoTileExamples({ section }: VideoTileExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <VideoTile name="Maya Goldberg" micState="on" />
          <VideoTile name="Alice Chen" micState="on" />
        </div>
      </div>
    )
  }

  if (section === 'speaking-muted') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <VideoTile name="Bob Kim" speaking={true} micState="on" />
          <VideoTile name="Carol West" speaking={false} micState="muted" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Left: speaking (emerald ring). Right: mic muted (red icon in name chip).
        </p>
      </div>
    )
  }

  if (section === 'pinned') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <VideoTile
            name="Dave Rivera"
            pinned={true}
            reaction="👋"
            micState="on"
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Pinned tile (primary ring) with an optional reaction badge.
        </p>
      </div>
    )
  }

  return null
}
