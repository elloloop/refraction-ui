import { LiveTranscriptExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const liveTranscriptProps = [
  {
    name: 'entries',
    type: 'TranscriptEntry[]',
    description:
      'The ordered list of transcript entries (fields below). Build it with `applyTranscriptUpdate` so interim lines are replaced by their finals.',
  },
  {
    name: 'compact',
    type: 'boolean',
    default: 'false',
    description: 'Tightens the spacing between speaker blocks for dense layouts.',
  },
  {
    name: 'autoFollow',
    type: 'boolean',
    default: 'false',
    description:
      'Keeps the newest line in view as entries arrive. Scrolling up pauses it and shows a jump-to-live control; scrolling back to the bottom or using the control resumes it. React only. Give the panel a height so it scrolls.',
  },
  {
    name: 'jumpToLiveLabel',
    type: 'string',
    default: "'Jump to live'",
    description: 'Label of the jump-to-live control.',
  },
  {
    name: 'interimLabel',
    type: 'string',
    default: "'still listening'",
    description: 'Screen-reader suffix read after an interim line.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the scroll container.',
  },
]

const transcriptEntryFields = [
  { name: 'id', type: 'string', description: 'Unique id of the line.' },
  { name: 'speaker', type: 'string', description: 'Display name of the speaker.' },
  { name: 'text', type: 'string', description: 'The spoken text.' },
  { name: 'timestamp', type: 'string', description: 'Optional formatted time shown beside the speaker (e.g. "0:42").' },
  { name: 'speakerColor', type: 'string', description: 'Optional CSS colour for the speaker name.' },
  {
    name: 'side',
    type: "'me' | 'them'",
    description: 'Which side of a two-party conversation spoke. Omit for a single-sided transcript.',
  },
  {
    name: 'interim',
    type: 'boolean',
    default: 'false',
    description: 'A partial result the recogniser may still revise. Drawn softer with a dotted underline.',
  },
  {
    name: 'startMs',
    type: 'number',
    description: 'Offset from the start of the session. Orders final lines from both sides by when they were spoken.',
  },
]

const usageCode = `import * as React from 'react'
import { LiveTranscript, applyTranscriptUpdate } from '@refraction-ui/react'
import type { TranscriptEntry } from '@refraction-ui/react'

export function CallTranscript() {
  const [entries, setEntries] = React.useState<TranscriptEntry[]>([])

  // Call with every recogniser result, interim or final. Each side keeps one
  // interim line; its final replaces it, and finals interleave by startMs.
  const onResult = React.useCallback((result: TranscriptEntry) => {
    setEntries((current) => applyTranscriptUpdate(current, result))
  }, [])

  useSpeechResults(onResult) // your recogniser

  return <LiveTranscript entries={entries} autoFollow className="h-96" />
}`

const astroUsageCode = `---
import { LiveTranscript } from '@refraction-ui/astro'

const entries = [
  { id: '1', speaker: 'Sam', side: 'them', text: 'Thanks for making the time.' },
  { id: '2', speaker: 'You', side: 'me', text: 'Happy to.' },
]
---

<LiveTranscript entries={entries} class="max-h-96" />`

export default function LiveTranscriptPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Transcript</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A speaker-attributed transcript panel for audio rooms and meetings.
          Consecutive entries from the same speaker are automatically merged into
          a single block so the panel stays readable. It can show both sides of
          a call, interim lines that settle into finals, and follow the live
          line until the reader scrolls back. The container is a live
          region (<code className="text-sm bg-muted px-1 rounded">role="log"</code>{' '}
          <code className="text-sm bg-muted px-1 rounded">aria-live="polite"</code>)
          so screen readers announce new entries without interrupting the user,
          and it is focusable so a reader can scroll it from the keyboard (pass{' '}
          <code className="text-sm bg-muted px-1 rounded">tabIndex=&#123;-1&#125;</code> to opt out).
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Pass an array of entries; the panel renders each speaker in order.
        </p>
        <LiveTranscriptExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Grouped consecutive</h2>
        <p className="text-sm text-muted-foreground">
          When the same speaker has multiple consecutive entries, they are merged
          under one speaker header. Speaker colors can be applied via{' '}
          <code className="text-xs bg-muted px-1 rounded">speakerColor</code> on
          each entry.
        </p>
        <LiveTranscriptExamples section="grouped" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Compact</h2>
        <p className="text-sm text-muted-foreground">
          The <code className="text-xs bg-muted px-1 rounded">compact</code> prop
          tightens spacing for dense side-panel layouts.
        </p>
        <LiveTranscriptExamples section="compact" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Me and them</h2>
        <p className="text-sm text-muted-foreground">
          Give each entry a{' '}
          <code className="text-xs bg-muted px-1 rounded">side</code> of{' '}
          <code className="text-xs bg-muted px-1 rounded">'me'</code> or{' '}
          <code className="text-xs bg-muted px-1 rounded">'them'</code> for a two-party
          call. Your lines sit at the end edge and theirs at the start edge, each
          in its own bubble and under its speaker name, so the sides read without
          relying on colour.
        </p>
        <LiveTranscriptExamples section="sides" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Interim lines</h2>
        <p className="text-sm text-muted-foreground">
          A line marked{' '}
          <code className="text-xs bg-muted px-1 rounded">interim</code> is still being
          heard: it is muted with a dotted underline, screen readers hear it as
          still listening, and it is left out of the log&apos;s announcements while
          it changes. Pass each recogniser result to{' '}
          <code className="text-xs bg-muted px-1 rounded">applyTranscriptUpdate</code>:
          each side keeps one interim line, the final replaces it and is
          announced once, and finals from both sides are ordered by{' '}
          <code className="text-xs bg-muted px-1 rounded">startMs</code>.
        </p>
        <LiveTranscriptExamples section="interim" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Auto-follow</h2>
        <p className="text-sm text-muted-foreground">
          With <code className="text-xs bg-muted px-1 rounded">autoFollow</code> the
          panel keeps the newest line in view. Scroll up to read back and it
          stops moving under you; a <strong>Jump to live</strong> control appears
          at the bottom. Scrolling back down or using the control picks the live
          line up again. The jump scrolls without animation when reduced motion
          is preferred. Step through the call below, then scroll up.
        </p>
        <LiveTranscriptExamples section="live" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} />
        <p className="text-sm text-muted-foreground">
          The Astro component renders sides and interim lines on the server.
          Auto-follow needs live updates, so it is part of the React component.
        </p>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={liveTranscriptProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">TranscriptEntry</h2>
        <PropsTable props={transcriptEntryFields} />
      </section>
    </div>
  )
}
