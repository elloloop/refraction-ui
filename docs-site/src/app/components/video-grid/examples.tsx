'use client'

import * as React from 'react'
import { VideoGrid } from '@refraction-ui/react-video-grid'
import type { VideoTileData } from '@refraction-ui/react-video-grid'
import { VideoTile, getVideoTileLabel } from '@refraction-ui/react-video-tile'
import { Button } from '@refraction-ui/react-button'
import { DemoCamera, DemoScreen, LiveDemoVideo } from '../../../components/demo-call-media'

interface VideoGridExamplesProps {
  section: 'small-group' | 'large-grid' | 'speaker-view' | 'media' | 'tile-options' | 'live-stream'
}

/** Your participant type: VideoTileData plus whatever your call SDK hands you. */
type CallParticipant = VideoTileData & { hue: number }

const MEDIA_PARTICIPANTS: CallParticipant[] = [
  { id: 'm1', name: 'Nora Ali', speaking: true, hue: 200 },
  { id: 'm2', name: 'Owen Price', micState: 'muted', hue: 30 },
  { id: 'm3', name: 'Owen Price', screenShare: true, hue: 0 },
  { id: 'm4', name: 'Pia Berg', handRaised: true, hue: 300 },
]

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
        <VideoGrid participants={SMALL_PARTICIPANTS} layout="grid" />
      </div>
    )
  }

  if (section === 'large-grid') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <VideoGrid participants={LARGE_PARTICIPANTS} layout="grid" />
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

  if (section === 'media') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <VideoGrid
          participants={MEDIA_PARTICIPANTS}
          layout="grid"
          renderMedia={(p) => (p.screenShare ? <DemoScreen /> : <DemoCamera hue={p.hue} />)}
        />
      </div>
    )
  }

  if (section === 'tile-options') {
    return <TileOptionsExample />
  }

  if (section === 'live-stream') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <VideoGrid
          participants={MEDIA_PARTICIPANTS.filter((p) => !p.screenShare)}
          layout="grid"
          renderMedia={(p) => <LiveDemoVideo hue={p.hue} />}
        />
      </div>
    )
  }

  return null
}

function SpotlightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  )
}

/** Speaker view where each filmstrip tile's button moves it into the spotlight. */
function TileOptionsExample() {
  const [spotlightId, setSpotlightId] = React.useState('m1')
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="h-80">
        <VideoGrid
          participants={MEDIA_PARTICIPANTS}
          layout="speaker"
          spotlightId={spotlightId}
          renderMedia={(p) => (p.screenShare ? <DemoScreen /> : <DemoCamera hue={p.hue} />)}
          renderTile={(p, { region, tileProps }) => (
            <VideoTile
              {...tileProps}
              pinned={region === 'spotlight'}
              menu={
                region === 'filmstrip' ? (
                  <Button
                    variant="outline"
                    size="icon-xs"
                    aria-label={`Spotlight ${getVideoTileLabel(p.name, p)}`}
                    onClick={() => setSpotlightId(p.id)}
                  >
                    <SpotlightIcon />
                  </Button>
                ) : undefined
              }
            />
          )}
        />
      </div>
    </div>
  )
}
