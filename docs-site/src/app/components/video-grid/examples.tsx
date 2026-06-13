'use client'

import * as React from 'react'
import { VideoGrid } from '@refraction-ui/react-video-grid'
import type { VideoTileData } from '@refraction-ui/react-video-grid'

interface VideoGridExamplesProps {
  section: 'small-group' | 'large-grid' | 'speaker-view'
}

const SMALL_PARTICIPANTS: VideoTileData[] = [
  { id: 'p1', name: 'Alice Chen', micState: 'on', speaking: true },
  { id: 'p2', name: 'Bob Marley', micState: 'muted' },
  { id: 'p3', name: 'Carol Nguyen', micState: 'on' },
]

const LARGE_PARTICIPANTS: VideoTileData[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Participant ${i + 1}`,
  micState: i % 3 === 0 ? ('muted' as const) : ('on' as const),
  speaking: i === 2,
}))

const SPEAKER_PARTICIPANTS: VideoTileData[] = [
  { id: 'sp1', name: 'Maya Goldberg', micState: 'on', speaking: true, pinned: true },
  { id: 'sp2', name: 'Liam Torres', micState: 'muted' },
  { id: 'sp3', name: 'Priya Patel', micState: 'on' },
  { id: 'sp4', name: 'James Kim', micState: 'on' },
]

export function VideoGridExamples({ section }: VideoGridExamplesProps) {
  if (section === 'small-group') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-64">
          <VideoGrid participants={SMALL_PARTICIPANTS} layout="grid" />
        </div>
      </div>
    )
  }

  if (section === 'large-grid') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-80">
          <VideoGrid participants={LARGE_PARTICIPANTS} layout="grid" />
        </div>
      </div>
    )
  }

  if (section === 'speaker-view') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-80">
          <VideoGrid
            participants={SPEAKER_PARTICIPANTS}
            layout="speaker"
            spotlightId="sp1"
          />
        </div>
      </div>
    )
  }

  return null
}
