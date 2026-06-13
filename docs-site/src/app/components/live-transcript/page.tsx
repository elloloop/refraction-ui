import { LiveTranscriptExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const liveTranscriptProps = [
  {
    name: 'entries',
    type: 'TranscriptEntry[]',
    description:
      'The ordered list of transcript entries. Each entry has `id`, `speaker`, `text`, and optional `timestamp` and `speakerColor`.',
  },
  {
    name: 'compact',
    type: 'boolean',
    default: 'false',
    description: 'Tightens the spacing between speaker blocks for dense layouts.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the scroll container.',
  },
]

const usageCode = `import { LiveTranscript } from '@refraction-ui/react'
import type { TranscriptEntry } from '@refraction-ui/react'

const entries: TranscriptEntry[] = [
  { id: '1', speaker: 'Alice', text: 'Good morning, everyone!', timestamp: '0:00' },
  { id: '2', speaker: 'Bob', text: 'Morning! Ready when you are.', timestamp: '0:04' },
]

export function MeetingPanel() {
  return (
    <LiveTranscript
      entries={entries}
      className="max-h-96"
    />
  )
}`

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
          a single block so the panel stays readable. The container is a live
          region (<code className="text-sm bg-muted px-1 rounded">role="log"</code>{' '}
          <code className="text-sm bg-muted px-1 rounded">aria-live="polite"</code>)
          so screen readers announce new entries without interrupting the user.
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={liveTranscriptProps} />
      </section>
    </div>
  )
}
