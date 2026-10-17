'use client'

import * as React from 'react'
import { VideoTile } from '@refraction-ui/react-video-tile'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@refraction-ui/react-dropdown-menu'
import { Button } from '@refraction-ui/react-button'
import { DemoCamera, DemoScreen, LiveDemoVideo } from '../../../components/demo-call-media'

interface VideoTileExamplesProps {
  section:
    | 'basic'
    | 'speaking-muted'
    | 'pinned'
    | 'media'
    | 'hand-screen'
    | 'tile-options'
    | 'live-stream'
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

/** Tile options in the `menu` slot: pin, maximise, and mute for me. */
function TileOptions({
  name,
  pinned,
  onTogglePin,
}: {
  name: string
  pinned: boolean
  onTogglePin: () => void
}) {
  const [mutedForMe, setMutedForMe] = React.useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-xs" aria-label={`Options for ${name}`}>
          <MoreIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onTogglePin}>{pinned ? 'Unpin' : 'Pin'}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setMutedForMe((m) => !m)}>
          {mutedForMe ? 'Unmute for me' : 'Mute for me'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TileOptionsExample() {
  const [pinned, setPinned] = React.useState(false)
  return (
    <VideoTile
      name="Rosa Diaz"
      pinned={pinned}
      mediaSlot={<DemoCamera hue={150} />}
      menu={
        <TileOptions name="Rosa Diaz" pinned={pinned} onTogglePin={() => setPinned((p) => !p)} />
      }
    />
  )
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
          Left: speaking (success edge and a sound-wave icon). Right: mic muted (icon in the name
          chip).
        </p>
      </div>
    )
  }

  if (section === 'pinned') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <VideoTile name="Dave Rivera" pinned={true} reaction="👋" micState="on" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Pinned tile (primary edge and a pin badge) with an optional reaction badge.
        </p>
      </div>
    )
  }

  if (section === 'media') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <VideoTile name="Eli Novak" speaking mediaSlot={<DemoCamera hue={210} />} />
          <VideoTile name="Fatima Khan" micState="muted" mediaSlot={<DemoCamera hue={20} />} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          The media slot fills the tile; the overlays stay above it.
        </p>
      </div>
    )
  }

  if (section === 'hand-screen') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <VideoTile name="Gabe Lin" handRaised mediaSlot={<DemoCamera hue={280} />} />
          <VideoTile name="Gabe Lin" screenShare mediaSlot={<DemoScreen />} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Left: raised hand. Right: the same person&apos;s shared screen, letterboxed and named
          &quot;Gabe Lin (Presenting)&quot;.
        </p>
      </div>
    )
  }

  if (section === 'tile-options') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <TileOptionsExample />
        </div>
      </div>
    )
  }

  if (section === 'live-stream') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <VideoTile name="Hana Sato" speaking mediaSlot={<LiveDemoVideo hue={200} />} />
          <VideoTile name="Ivan Petrov" mediaSlot={<LiveDemoVideo hue={30} />} />
        </div>
      </div>
    )
  }

  return null
}
