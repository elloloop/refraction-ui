'use client'

import * as React from 'react'
import { LiveTranscript } from '@refraction-ui/react-live-transcript'
import type { TranscriptEntry } from '@refraction-ui/react-live-transcript'

interface LiveTranscriptExamplesProps {
  section: 'basic' | 'grouped' | 'compact'
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

  return null
}
