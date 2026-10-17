'use client'

import * as React from 'react'
import { VideoStage, type VideoStageParticipant } from '@refraction-ui/react-video-stage'
import { Button } from '@refraction-ui/react-button'
import { DemoCamera, DemoScreen, LiveDemoVideo } from '../../../components/demo-call-media'

export type VideoStageExampleSection =
  | 'grid'
  | 'paging'
  | 'presentation'
  | 'pin-and-zoom'
  | 'active-speaker'
  | 'compact'
  | 'live-stream'

interface VideoStageExamplesProps {
  section: VideoStageExampleSection
}

/** Your participant type: the stage's fields plus whatever your call SDK hands you. */
type CallParticipant = VideoStageParticipant & { hue: number }

const TEAM: CallParticipant[] = [
  { id: 'nora', name: 'Nora Ali', hue: 200, local: true },
  { id: 'owen', name: 'Owen Price', hue: 30, micState: 'muted' },
  { id: 'pia', name: 'Pia Berg', hue: 300, handRaised: true },
  { id: 'ravi', name: 'Ravi Shah', hue: 140 },
  { id: 'sofia', name: 'Sofia Lund', hue: 260 },
  { id: 'tomas', name: 'Tomás Rey', hue: 80, micState: 'muted' },
  { id: 'uma', name: 'Uma Okafor', hue: 350 },
  { id: 'viktor', name: 'Viktor Hale', hue: 170 },
  { id: 'wen', name: 'Wen Zhao', hue: 230 },
]

const SHARE: CallParticipant = { id: 'owen-screen', name: 'Owen Price', screenShare: true, hue: 0 }

const renderDemoMedia = (p: CallParticipant) =>
  p.screenShare ? <DemoScreen /> : <DemoCamera hue={p.hue} />

/** Example frame: the stage fills a box whose height the page sets. */
function Frame({ children, className = 'h-80 sm:h-96' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={className}>{children}</div>
    </div>
  )
}

export function VideoStageExamples({ section }: VideoStageExamplesProps) {
  if (section === 'grid') {
    return (
      <Frame>
        <VideoStage participants={TEAM.slice(0, 4)} renderMedia={renderDemoMedia} />
      </Frame>
    )
  }

  if (section === 'paging') {
    return (
      <Frame>
        <VideoStage participants={TEAM} renderMedia={renderDemoMedia} aria-label="Large call" />
      </Frame>
    )
  }

  if (section === 'presentation') {
    return (
      <Frame>
        <VideoStage
          participants={[SHARE, ...TEAM.slice(0, 6)]}
          renderMedia={renderDemoMedia}
          aria-label="Presentation"
        />
      </Frame>
    )
  }

  if (section === 'pin-and-zoom') return <PinAndZoomExample />
  if (section === 'active-speaker') return <ActiveSpeakerExample />

  if (section === 'compact') {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap justify-center gap-4">
          <div className="h-[30rem] w-full max-w-[20rem]">
            <VideoStage
              participants={[SHARE, ...TEAM.slice(0, 5)]}
              renderMedia={renderDemoMedia}
              aria-label="Presentation on a narrow stage"
            />
          </div>
          <div className="h-[30rem] w-full max-w-[20rem]">
            <VideoStage
              participants={TEAM.slice(0, 7)}
              renderMedia={renderDemoMedia}
              aria-label="Paged grid on a narrow stage"
            />
          </div>
        </div>
      </div>
    )
  }

  if (section === 'live-stream') {
    return (
      <Frame>
        <VideoStage participants={TEAM.slice(0, 4)} renderMedia={(p) => <LiveDemoVideo hue={p.hue} />} />
      </Frame>
    )
  }

  return null
}

function VolumeIcon({ off }: { off: boolean }) {
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
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      {off ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
      )}
    </svg>
  )
}

/**
 * Pin and maximize from each tile's options, plus an action of your own
 * ("mute for me") through renderTileActions. The pin is controlled here, so
 * the page can show who is pinned.
 */
function PinAndZoomExample() {
  const [pinnedId, setPinnedId] = React.useState<string | null>(null)
  const [silenced, setSilenced] = React.useState<ReadonlySet<string>>(new Set())
  const participants = TEAM.slice(0, 5)
  const pinnedName = participants.find((p) => p.id === pinnedId)?.name

  return (
    <div className="space-y-3">
      <Frame>
        <VideoStage
          aria-label="Team call"
          participants={participants}
          pinnedId={pinnedId}
          onPinnedIdChange={setPinnedId}
          renderMedia={renderDemoMedia}
          renderTileActions={(p, { closeOptions }) => {
            if (p.local) return null
            const off = silenced.has(p.id)
            const label = off ? `Unmute ${p.name} for me` : `Mute ${p.name} for me`
            return (
              <Button
                variant="outline"
                size="icon-xs"
                className="rounded-full bg-background/80"
                aria-label={label}
                title={label}
                onClick={() => {
                  setSilenced((prev) => {
                    const next = new Set(prev)
                    if (off) next.delete(p.id)
                    else next.add(p.id)
                    return next
                  })
                  closeOptions()
                }}
              >
                <VolumeIcon off={off} />
              </Button>
            )
          }}
        />
      </Frame>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {pinnedName ? `Pinned: ${pinnedName}.` : 'Nobody is pinned.'}
        {silenced.size > 0 ? ` Muted for you: ${silenced.size}.` : ''}
      </p>
    </div>
  )
}

/** The active speaker takes the stage and stays there through a pause. */
function ActiveSpeakerExample() {
  const people = TEAM.slice(0, 5)
  const [speakingId, setSpeakingId] = React.useState<string | null>('pia')
  const participants = people.map((p) => ({ ...p, speaking: p.id === speakingId }))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Who is speaking">
        {people
          .filter((p) => !p.local)
          .map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={speakingId === p.id ? 'default' : 'outline'}
              aria-pressed={speakingId === p.id}
              onClick={() => setSpeakingId(p.id)}
            >
              {p.name}
            </Button>
          ))}
        <Button
          size="sm"
          variant={speakingId === null ? 'default' : 'outline'}
          aria-pressed={speakingId === null}
          onClick={() => setSpeakingId(null)}
        >
          Silence
        </Button>
      </div>
      <Frame>
        <VideoStage
          aria-label="Speaker call"
          participants={participants}
          autoSpotlightSpeaker
          renderMedia={renderDemoMedia}
        />
      </Frame>
    </div>
  )
}
