'use client'

import * as React from 'react'
import { Button } from '@refraction-ui/react-button'
import { LiveTranscript, applyTranscriptUpdate } from '@refraction-ui/react-live-transcript'
import type { TranscriptEntry } from '@refraction-ui/react-live-transcript'

interface LiveTranscriptExamplesProps {
  section: 'basic' | 'grouped' | 'compact' | 'sides' | 'interim' | 'live'
}

const basicEntries: TranscriptEntry[] = [
  { id: '1', speaker: 'Alice', text: 'Good morning everyone, let\'s get started.', timestamp: '0:00' },
  { id: '2', speaker: 'Bob', text: 'Morning! Ready when you are.', timestamp: '0:04' },
  { id: '3', speaker: 'Carol', text: 'Same here.', timestamp: '0:06' },
]

const groupedEntries: TranscriptEntry[] = [
  { id: '1', speaker: 'Alice', text: 'So to summarise the agenda:', timestamp: '0:10', speakerColor: '#3b82f6' },
  { id: '2', speaker: 'Alice', text: 'First we\'ll cover last week\'s highlights.', speakerColor: '#3b82f6' },
  { id: '3', speaker: 'Alice', text: 'Then we\'ll open the floor for questions.', speakerColor: '#3b82f6' },
  { id: '4', speaker: 'Bob', text: 'Sounds great. I have a few items for the Q&A.', timestamp: '0:22', speakerColor: '#10b981' },
  { id: '5', speaker: 'Bob', text: 'Specifically around the launch timeline.', speakerColor: '#10b981' },
]

const compactEntries: TranscriptEntry[] = [
  { id: '1', speaker: 'Alice', text: 'Can everyone hear me?', timestamp: '0:00' },
  { id: '2', speaker: 'Bob', text: 'Yes, loud and clear.', timestamp: '0:02' },
  { id: '3', speaker: 'Carol', text: 'Same.', timestamp: '0:03' },
  { id: '4', speaker: 'Alice', text: 'Great. Let\'s begin.', timestamp: '0:04' },
]

const sidesEntries: TranscriptEntry[] = [
  { id: '1', speaker: 'Sam', side: 'them', text: 'Thanks for making the time today.', timestamp: '0:00' },
  { id: '2', speaker: 'You', side: 'me', text: 'Happy to. Shall we start with the timeline?', timestamp: '0:03' },
  { id: '3', speaker: 'Sam', side: 'them', text: 'Yes. The first draft is nearly done.', timestamp: '0:07' },
  { id: '4', speaker: 'Sam', side: 'them', text: 'I can share it by', interim: true },
]

const interimEntries: TranscriptEntry[] = [
  { id: '1', speaker: 'Alice', text: 'The venue is booked for the twelfth.', timestamp: '0:31' },
  { id: '2', speaker: 'Alice', text: 'and catering is still', interim: true },
]

// A recorded call, replayed one recogniser result at a time.
const liveOpening: TranscriptEntry[] = [
  { id: 'o1', speaker: 'Sam', side: 'them', startMs: 0, timestamp: '0:00', text: 'Thanks for making the time today.' },
  { id: 'o2', speaker: 'You', side: 'me', startMs: 3000, timestamp: '0:03', text: 'Happy to. Where should we start?' },
  { id: 'o3', speaker: 'Sam', side: 'them', startMs: 6000, timestamp: '0:06', text: 'With the timeline, if that works.' },
  { id: 'o4', speaker: 'You', side: 'me', startMs: 9000, timestamp: '0:09', text: 'Works for me.' },
  { id: 'o5', speaker: 'Sam', side: 'them', startMs: 11000, timestamp: '0:11', text: 'The first draft is nearly done.' },
  { id: 'o6', speaker: 'Sam', side: 'them', startMs: 14000, text: 'Review would start next week.' },
]

const liveScript: TranscriptEntry[] = [
  { id: 'l1', speaker: 'You', side: 'me', startMs: 17000, timestamp: '0:17', text: 'who reviews', interim: true },
  { id: 'l1', speaker: 'You', side: 'me', startMs: 17000, timestamp: '0:17', text: 'who reviews it first', interim: true },
  { id: 'l1', speaker: 'You', side: 'me', startMs: 17000, timestamp: '0:17', text: 'Who reviews it first?' },
  { id: 'l2', speaker: 'Sam', side: 'them', startMs: 20000, timestamp: '0:20', text: 'probably', interim: true },
  { id: 'l2', speaker: 'Sam', side: 'them', startMs: 20000, timestamp: '0:20', text: 'probably the design team', interim: true },
  { id: 'l2', speaker: 'Sam', side: 'them', startMs: 20000, timestamp: '0:20', text: 'Probably the design team.' },
  { id: 'l3', speaker: 'You', side: 'me', startMs: 23000, timestamp: '0:23', text: 'Good, then legal after that.' },
  { id: 'l4', speaker: 'Sam', side: 'them', startMs: 26000, timestamp: '0:26', text: 'Agreed. I will send the invite.' },
]

function LiveDemo() {
  const [entries, setEntries] = React.useState(liveOpening)
  const [next, setNext] = React.useState(0)
  const done = next >= liveScript.length

  const hearNext = () => {
    const result = liveScript[next]
    if (!result) return
    setEntries((current) => applyTranscriptUpdate(current, result))
    setNext(next + 1)
  }

  const restart = () => {
    setEntries(liveOpening)
    setNext(0)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LiveTranscript
          entries={entries}
          autoFollow
          className="h-64"
          aria-label="Call transcript"
          data-testid="live-transcript-demo"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={hearNext} disabled={done}>
          Next result
        </Button>
        <Button size="sm" variant="outline" onClick={restart}>
          Restart
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {next} of {liveScript.length} results
        </span>
      </div>
    </div>
  )
}

export function LiveTranscriptExamples({ section }: LiveTranscriptExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LiveTranscript entries={basicEntries} className="max-h-48" />
      </div>
    )
  }

  if (section === 'grouped') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LiveTranscript entries={groupedEntries} className="max-h-56" />
      </div>
    )
  }

  if (section === 'compact') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LiveTranscript entries={compactEntries} compact className="max-h-40" />
      </div>
    )
  }

  if (section === 'sides') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LiveTranscript entries={sidesEntries} />
      </div>
    )
  }

  if (section === 'interim') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <LiveTranscript entries={interimEntries} />
      </div>
    )
  }

  if (section === 'live') return <LiveDemo />

  return null
}
