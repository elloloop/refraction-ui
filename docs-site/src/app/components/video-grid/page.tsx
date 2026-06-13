import { VideoGridExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const videoGridProps = [
  {
    name: 'participants',
    type: 'VideoTileData[]',
    description:
      'List of participant data to render as tiles. Each entry: `{ id, name, micState?, speaking?, pinned? }`.',
  },
  {
    name: 'layout',
    type: "'auto' | 'grid' | 'speaker'",
    default: "'auto'",
    description:
      "Grid layout mode. 'auto' chooses grid unless there is ≤1 participant. 'grid' always renders an even CSS grid. 'speaker' renders a spotlight tile + filmstrip row.",
  },
  {
    name: 'spotlightId',
    type: 'string',
    description:
      "Participant `id` to place in the spotlight in speaker view. Falls back to the first participant when omitted.",
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the grid container.',
  },
]

const usageCode = `import { VideoGrid } from '@refraction-ui/react'
import type { VideoTileData } from '@refraction-ui/react'

const participants: VideoTileData[] = [
  { id: 'p1', name: 'Alice Chen', micState: 'on', speaking: true },
  { id: 'p2', name: 'Bob Marley', micState: 'muted' },
  { id: 'p3', name: 'Carol Nguyen', micState: 'on' },
]

export function MeetingRoom() {
  return (
    <div style={{ height: '100vh' }}>
      <VideoGrid participants={participants} layout="auto" />
    </div>
  )
}`

const speakerCode = `import { VideoGrid } from '@refraction-ui/react'

export function SpeakerRoom({ participants, activeSpeakerId }) {
  return (
    <VideoGrid
      participants={participants}
      layout="speaker"
      spotlightId={activeSpeakerId}
    />
  )
}`

export default function VideoGridPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Video Grid</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Adaptive participant grid for easyloops meetings — from 1:1 calls to
          large town-halls. Automatically picks the right column count based on
          participant count, or switches to a speaker spotlight + filmstrip layout.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Small group grid</h2>
        <p className="text-sm text-muted-foreground">
          Three participants render in a 2-column grid (the{' '}
          <code className="text-xs bg-muted px-1 rounded">auto</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">grid</code> modes
          both apply the column rule: 2–4 participants → 2 columns). The active
          speaker and mute state are conveyed via data attributes for CSS hooks.
        </p>
        <VideoGridExamples section="small-group" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Large grid</h2>
        <p className="text-sm text-muted-foreground">
          Twelve participants render in a 4-column grid (10–16 → 4 columns). The
          column count scales automatically with participant count up to 6 columns
          for very large calls.
        </p>
        <VideoGridExamples section="large-grid" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Speaker view</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">layout="speaker"</code> to
          render a large spotlight area for the active speaker and a horizontal
          filmstrip for the remaining participants. Use{' '}
          <code className="text-xs bg-muted px-1 rounded">spotlightId</code> to
          control which participant is spotlighted.
        </p>
        <VideoGridExamples section="speaker-view" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock
          frameworks={{
            react: usageCode,
            astro: '<!-- Astro implementation pending -->',
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Speaker view usage</h2>
        <CodeBlock
          frameworks={{
            react: speakerCode,
            astro: '<!-- Astro implementation pending -->',
          }}
        />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={videoGridProps} />
      </section>
    </div>
  )
}
