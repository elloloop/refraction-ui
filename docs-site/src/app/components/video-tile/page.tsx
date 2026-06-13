import { VideoTileExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const videoTileProps = [
  {
    name: 'name',
    type: 'string',
    description: 'Participant display name — shown in the name chip and used for the avatar initials fallback.',
  },
  {
    name: 'micState',
    type: "'on' | 'muted'",
    default: "'on'",
    description: 'Current microphone state. When muted, a mic-off icon appears in the name chip.',
  },
  {
    name: 'speaking',
    type: 'boolean',
    default: 'false',
    description: 'Whether the participant is actively speaking. Adds an emerald ring around the tile.',
  },
  {
    name: 'pinned',
    type: 'boolean',
    default: 'false',
    description: 'Whether the tile is pinned in the meeting grid. Adds a primary ring.',
  },
  {
    name: 'avatarUrl',
    type: 'string',
    description: 'URL of an avatar image shown in the fallback circle when no mediaSlot is provided.',
  },
  {
    name: 'mediaSlot',
    type: 'React.ReactNode',
    description: 'A <video> element or any ReactNode to use as the tile media layer. When omitted the avatar/initials fallback is shown.',
  },
  {
    name: 'reaction',
    type: 'React.ReactNode',
    description: 'Optional emoji or badge rendered at the top-right of the tile.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the tile container.',
  },
]

const usageCode = `import { VideoTile } from '@refraction-ui/react'

export function MeetingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <VideoTile
        name="Maya Goldberg"
        speaking={true}
        micState="on"
      />
      <VideoTile
        name="Bob Kim"
        micState="muted"
        mediaSlot={<video autoPlay muted ref={videoRef} />}
      />
    </div>
  )
}`

export default function VideoTilePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Video Tile</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A participant tile for video meeting grids — shows a live media stream
          or an avatar/initials fallback, with overlays for the participant name,
          mic state, speaking indicator, and optional reactions.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic with avatar fallback</h2>
        <p className="text-sm text-muted-foreground">
          When no <code className="text-xs bg-muted px-1 rounded">mediaSlot</code> is
          provided, the tile renders a centred circle with the participant's initials
          derived from their name.
        </p>
        <VideoTileExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Speaking + muted states</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">speaking</code> to add an
          emerald ring indicating active audio. Set{' '}
          <code className="text-xs bg-muted px-1 rounded">micState="muted"</code> to show
          the mic-off icon in the name chip.
        </p>
        <VideoTileExamples section="speaking-muted" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pinned</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">pinned</code> to highlight
          a tile with a primary ring. The optional{' '}
          <code className="text-xs bg-muted px-1 rounded">reaction</code> prop places a
          badge in the top-right corner.
        </p>
        <VideoTileExamples section="pinned" />
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
        <PropsTable props={videoTileProps} />
      </section>
    </div>
  )
}
