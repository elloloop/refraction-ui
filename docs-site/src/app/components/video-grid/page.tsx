import { VideoGridExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const videoGridProps = [
  {
    name: 'participants',
    type: 'T[] (T extends VideoTileData)',
    description:
      'Participants to render as tiles. Each entry: `{ id, name, micState?, speaking?, pinned?, handRaised?, screenShare?, avatarUrl? }` plus any fields of your own (a media track, say), which reach renderMedia and renderTile typed.',
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
    name: 'renderMedia',
    type: "(participant: T, context: { region }) => ReactNode",
    description:
      "Live media for a participant — typically a <video> whose ref attaches the participant's stream. Return null for the avatar fallback. region is 'grid', 'spotlight' or 'filmstrip'. The grid never touches a stream itself.",
  },
  {
    name: 'renderTile',
    type: '(participant: T, context: { region, tileProps }) => ReactNode',
    description:
      'Replace a whole tile. tileProps are the props the grid would give its own VideoTile (state cues, media, sizing); spread them onto <VideoTile {...tileProps} menu={…} /> to add tile options.',
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

const mediaCode = `import { VideoGrid, type VideoTileData } from '@refraction-ui/react'

// Your participant type: the tile data plus whatever your call SDK hands you.
type CallParticipant = VideoTileData & { stream?: MediaStream }

function StreamVideo({ stream }: { stream: MediaStream }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.srcObject = stream
  }, [stream])
  return <video ref={ref} autoPlay muted playsInline />
}

export function MeetingRoom({ participants }: { participants: CallParticipant[] }) {
  return (
    <VideoGrid
      participants={participants}
      renderMedia={(p) => (p.stream ? <StreamVideo stream={p.stream} /> : null)}
      renderTile={(p, { tileProps }) => (
        <VideoTile {...tileProps} menu={<TileOptionsMenu participant={p} />} />
      )}
    />
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
          Adaptive participant grid for video meetings — from 1:1 calls to
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
          for very large calls. Tiles keep 16:9 and rows pack to the top, so a
          parent shorter than the grid can scroll it (add an overflow class) instead
          of tiles overlapping.
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live media</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">renderMedia</code> returns the media for
          each participant — a <code className="text-xs bg-muted px-1 rounded">&lt;video&gt;</code>{' '}
          with the participant&apos;s stream attached. The grid stays transport-agnostic, and a
          participant&apos;s element stays mounted as others join. Raised hands and shared screens
          from the participant data show on the tiles. The examples here use static frames.
        </p>
        <VideoGridExamples section="media" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom tiles</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">renderTile</code> receives the props
          the grid would give its own tile, plus the region it sits in. Spread them onto a{' '}
          <code className="text-xs bg-muted px-1 rounded">VideoTile</code> and add a{' '}
          <code className="text-xs bg-muted px-1 rounded">menu</code> — here each filmstrip tile
          can be moved into the spotlight.
        </p>
        <VideoGridExamples section="tile-options" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
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
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live media usage</h2>
        <CodeBlock
          frameworks={{
            react: mediaCode,
            astro: '<!-- Live media is React-only: an Astro page renders static markup -->',
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
