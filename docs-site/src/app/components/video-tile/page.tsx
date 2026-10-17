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
    description:
      'Whether the participant is actively speaking. Draws a success-toned edge inside the tile and a sound-wave icon in the name chip, so the cue is not colour alone.',
  },
  {
    name: 'pinned',
    type: 'boolean',
    default: 'false',
    description: 'Whether the tile is pinned. Draws a primary edge and a pin badge (the speaking edge wins while they talk; the badge stays).',
  },
  {
    name: 'handRaised',
    type: 'boolean',
    default: 'false',
    description: 'Whether the participant has raised their hand. Shows a labelled hand badge at the top-left.',
  },
  {
    name: 'screenShare',
    type: 'boolean',
    default: 'false',
    description:
      'Whether the tile carries a shared screen. Adds a "Presenting" qualifier to the name chip and the accessible name, and letterboxes the media instead of cropping it.',
  },
  {
    name: 'avatarUrl',
    type: 'string',
    description: 'URL of an avatar image shown in the fallback circle when no mediaSlot is provided.',
  },
  {
    name: 'mediaSlot',
    type: 'React.ReactNode',
    description:
      'A <video> element (or any ReactNode) for the media layer. Direct children are sized to fill the tile; camera video is cropped to cover, a shared screen is letterboxed. When omitted the avatar/initials fallback is shown.',
  },
  {
    name: 'fill',
    type: 'boolean',
    default: 'false',
    description: 'Fill the parent instead of keeping a 16:9 aspect ratio — for a spotlight or stage cell whose size the layout sets.',
  },
  {
    name: 'menu',
    type: 'React.ReactNode',
    description: 'Tile options slot at the top-right, above the media — typically a menu trigger (pin, maximise, mute for me). Interactive content stays keyboard reachable.',
  },
  {
    name: 'labels',
    type: 'Partial<VideoTileLabels>',
    description:
      "Override the indicator text: { muted, speaking, handRaised, pinned, screenShare }. Defaults: 'Microphone muted', 'Speaking', 'Hand raised', 'Pinned', 'Presenting'.",
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

// Attach a participant's MediaStream from whichever call SDK you use.
function StreamVideo({ stream }: { stream: MediaStream }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.srcObject = stream
  }, [stream])
  return <video ref={ref} autoPlay muted playsInline />
}

export function MeetingGrid({ stream, share }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <VideoTile name="Maya Goldberg" speaking handRaised />
      <VideoTile
        name="Bob Kim"
        micState="muted"
        mediaSlot={<StreamVideo stream={stream} />}
        menu={<TileOptionsMenu participant="Bob Kim" />}
      />
      <VideoTile name="Bob Kim" screenShare mediaSlot={<StreamVideo stream={share} />} />
    </div>
  )
}`

const astroUsageCode = `---
import { VideoTile } from '@refraction-ui/astro'
---

<VideoTile name="Maya Goldberg" speaking handRaised />

<VideoTile name="Bob Kim" micState="muted">
  <video autoplay muted playsinline data-stream="bob"></video>
  <button slot="menu" type="button" aria-label="Options for Bob Kim">…</button>
</VideoTile>`

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
          mic state, speaking indicator, raised hand, shared screen, reactions and
          a tile options menu.
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
          Pass <code className="text-xs bg-muted px-1 rounded">speaking</code> to draw a
          success-toned edge and a sound-wave icon for active audio. Set{' '}
          <code className="text-xs bg-muted px-1 rounded">micState="muted"</code> to show
          the mic-off icon in the name chip.
        </p>
        <VideoTileExamples section="speaking-muted" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pinned</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">pinned</code> to highlight
          a tile with a primary edge and a pin badge. The optional{' '}
          <code className="text-xs bg-muted px-1 rounded">reaction</code> prop places a
          badge in the top-right corner.
        </p>
        <VideoTileExamples section="pinned" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live media</h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className="text-xs bg-muted px-1 rounded">&lt;video&gt;</code> as{' '}
          <code className="text-xs bg-muted px-1 rounded">mediaSlot</code> and attach the
          participant&apos;s stream to it. The tile never touches the stream, so it works with
          any call SDK. The examples here use static frames.
        </p>
        <VideoTileExamples section="media" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Raised hand and shared screen
        </h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">handRaised</code> shows a labelled
          hand badge.{' '}
          <code className="text-xs bg-muted px-1 rounded">screenShare</code> marks a shared
          screen: the name chip reads &quot;Presenting&quot;, the accessible name is qualified so
          it is not confused with the same person&apos;s camera, and the media is letterboxed.
        </p>
        <VideoTileExamples section="hand-screen" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tile options</h2>
        <p className="text-sm text-muted-foreground">
          The <code className="text-xs bg-muted px-1 rounded">menu</code> slot sits at the
          top-right above the media. Put a menu trigger there — here a dropdown that pins the tile
          and mutes the participant for you.
        </p>
        <VideoTileExamples section="tile-options" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={videoTileProps} />
      </section>
    </div>
  )
}
