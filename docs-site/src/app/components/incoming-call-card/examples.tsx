'use client'

import * as React from 'react'
import { IncomingCallCard } from '@refraction-ui/react-incoming-call-card'

export type IncomingCallCardSection = 'overlay' | 'video' | 'window' | 'countdown'

interface IncomingCallCardExamplesProps {
  section: IncomingCallCardSection
}

const RING_SECONDS = 20
const CONTROLLED_RING_SECONDS = 10
const TICK_MS = 1000

/**
 * A transformed element is the containing block for `position: fixed`
 * descendants, so the overlay pins to this frame instead of the docs page.
 */
const frameStyle: React.CSSProperties = { transform: 'translateZ(0)' }

function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-[26rem] overflow-hidden rounded-xl border border-border bg-muted/40"
      style={frameStyle}
    >
      {children}
    </div>
  )
}

export function IncomingCallCardExamples({ section }: IncomingCallCardExamplesProps) {
  if (section === 'overlay') return <OverlayExample />
  if (section === 'video') return <VideoExample />
  if (section === 'window') return <WindowExample />
  if (section === 'countdown') return <ControlledCountdownExample />
  return null
}

function OverlayExample() {
  const [ringing, setRinging] = React.useState(false)
  const [outcome, setOutcome] = React.useState('No call yet.')

  const end = (message: string) => {
    setRinging(false)
    setOutcome(message)
  }

  return (
    <AppFrame>
      <div className="space-y-3 p-6">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
          onClick={() => setRinging(true)}
          disabled={ringing}
        >
          Simulate incoming call
        </button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {outcome}
        </p>
      </div>
      {ringing && (
        <IncomingCallCard
          callerName="Ada Lovelace"
          context="Analytical Engine team"
          timeoutSeconds={RING_SECONDS}
          escapeBehavior="dismiss"
          onAccept={() => end('Accepted — connecting…')}
          onDecline={() => end('Declined.')}
          onDismiss={() => end('Dismissed — the call keeps ringing elsewhere.')}
          onTimeout={() => end('Missed call from Ada Lovelace.')}
        />
      )}
    </AppFrame>
  )
}

function VideoExample() {
  return (
    <AppFrame>
      <IncomingCallCard
        callerName="Grace Hopper"
        kind="video"
        context="Compiler sync · #platform"
        escapeBehavior="decline"
        autoFocus={false}
        onAccept={() => {}}
        onDecline={() => {}}
      />
    </AppFrame>
  )
}

function WindowExample() {
  return (
    <div className="flex justify-center rounded-xl border border-border bg-muted/40 p-6">
      <div className="h-[28rem] w-80 overflow-hidden rounded-lg border border-border shadow-lg">
        <IncomingCallCard
          layout="window"
          callerName="Katherine Johnson"
          kind="video"
          context="Trajectory review"
          timeoutSeconds={45}
          remaining={45}
          autoFocus={false}
          acceptLabel="Answer"
          declineLabel="Reject"
          onAccept={() => {}}
          onDecline={() => {}}
        />
      </div>
    </div>
  )
}

/**
 * The app owns the clock (e.g. synced to the server's ring deadline) and
 * passes `remaining`; the card only renders it and fires `onTimeout` at zero.
 */
function ControlledCountdownExample() {
  const [remaining, setRemaining] = React.useState(CONTROLLED_RING_SECONDS)
  const [missed, setMissed] = React.useState(false)

  React.useEffect(() => {
    if (missed) return
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), TICK_MS)
    return () => clearInterval(id)
  }, [missed])

  const restart = () => {
    setRemaining(CONTROLLED_RING_SECONDS)
    setMissed(false)
  }

  return (
    <AppFrame>
      <div className="space-y-3 p-6">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={restart}
        >
          Restart ring
        </button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {missed ? 'Missed call.' : 'Ringing…'}
        </p>
      </div>
      {!missed && (
        <IncomingCallCard
          callerName="Alan Turing"
          timeoutSeconds={CONTROLLED_RING_SECONDS}
          remaining={remaining}
          countdownLabel={(s) => `Missed in ${s}s`}
          autoFocus={false}
          onAccept={() => setMissed(true)}
          onDecline={() => setMissed(true)}
          onTimeout={() => setMissed(true)}
        />
      )}
    </AppFrame>
  )
}
