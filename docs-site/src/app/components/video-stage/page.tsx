import { VideoStageExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const videoStageProps = [
  {
    name: 'participants',
    type: 'T[] (T extends VideoStageParticipant)',
    description:
      'One entry per tile: `{ id, name, micState?, speaking?, handRaised?, screenShare?, avatarUrl?, local? }` plus any fields of your own (a media track, say), which reach the render callbacks typed. A shared screen is its own entry with `screenShare: true`. Mark the viewer’s own camera `local`: it never becomes the active speaker.',
  },
  {
    name: 'layout',
    type: "'auto' | 'grid' | 'spotlight'",
    default: "'auto'",
    description:
      "'auto' shows the grid until someone is pinned or shares a screen (or speaks, with autoSpotlightSpeaker). 'grid' always shows the grid and offers no pinning. 'spotlight' always puts one participant on the stage.",
  },
  {
    name: 'pinnedId / defaultPinnedId / onPinnedIdChange',
    type: 'string | null',
    description:
      'The participant pinned to the stage, controlled or uncontrolled. The stage reports null when a pinned participant leaves.',
  },
  {
    name: 'zoomedId / defaultZoomedId / onZoomedIdChange',
    type: 'string | null',
    description:
      'The participant maximized over the whole stage, controlled or uncontrolled. The stage reports null when they leave.',
  },
  {
    name: 'autoSpotlightSpeaker',
    type: 'boolean',
    default: 'false',
    description:
      'Put the active speaker on the stage when nobody is pinned or presenting. The speaker stays until someone else speaks.',
  },
  {
    name: 'autoPinScreenShare',
    type: 'boolean',
    default: 'true',
    description:
      'Pin a screen share when it starts, over an existing pin. Shares already live when the stage mounts take the stage without being pinned.',
  },
  {
    name: 'renderMedia',
    type: "(participant: T, context: { region }) => ReactNode",
    description:
      "Live media for a tile — usually a <video> whose ref attaches the stream. Return null for the avatar fallback. region is 'grid', 'stage', 'rail' or 'zoom'; a maximized participant is rendered a second time in 'zoom'.",
  },
  {
    name: 'renderTileActions',
    type: '(participant: T, context: { region, pinned, zoomed, closeOptions }) => ReactNode',
    description:
      'More buttons in a tile’s options, after pin and maximize — "mute for me", say. Give each an accessible name; call closeOptions when it is done.',
  },
  {
    name: 'renderTile',
    type: '(participant: T, context: { region, tileProps }) => ReactNode',
    description:
      'Replace a whole tile. tileProps carry the cues, media, options menu and fill; spread them onto a VideoTile to keep all of that.',
  },
  {
    name: 'labels',
    type: 'Partial<VideoStageLabels>',
    description:
      'Visible and announced text: stage, tileOptions(name), spotlight(name), unpin(name), maximize(name), minimize, previous, next, scroller.',
  },
  {
    name: 'tileLabels',
    type: 'Partial<VideoTileLabels>',
    description: 'Indicator text for every tile (muted, speaking, hand raised, pinned, presenting).',
  },
  {
    name: 'ref / className / HTML attributes',
    type: 'HTMLDivElement / string',
    description:
      'Target the stage root, which fills its parent: give the parent a height. An aria-label replaces the default "Call stage".',
  },
]

const usageCode = `import { VideoStage, type VideoStageParticipant } from '@refraction-ui/react'

// Your participant type: the stage's fields plus whatever your call SDK hands you.
type CallParticipant = VideoStageParticipant & { stream?: MediaStream }

function StreamVideo({ stream }: { stream: MediaStream }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.srcObject = stream
  }, [stream])
  return <video ref={ref} autoPlay muted playsInline />
}

export function Call({ participants }: { participants: CallParticipant[] }) {
  return (
    <div style={{ height: '100dvh' }}>
      <VideoStage
        participants={participants}
        renderMedia={(p) => (p.stream ? <StreamVideo stream={p.stream} /> : null)}
      />
    </div>
  )
}`

const controlledCode = `const [pinnedId, setPinnedId] = React.useState<string | null>(null)

<VideoStage
  participants={participants}
  pinnedId={pinnedId}
  onPinnedIdChange={setPinnedId}
  autoSpotlightSpeaker
  renderMedia={renderMedia}
  renderTileActions={(p, { closeOptions }) =>
    p.local ? null : (
      <button
        type="button"
        aria-label={\`Mute \${p.name} for me\`}
        onClick={() => {
          muteForMe(p.id)
          closeOptions()
        }}
      >
        <VolumeOffIcon />
      </button>
    )
  }
/>`

const code = (text: string) => <code className="text-xs bg-muted px-1 rounded">{text}</code>

export default function VideoStagePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Video Stage</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The stage of a video call. A grid that pages past four tiles, and a presentation
          layout — one participant on the stage, everyone else in a rail — that takes over when
          someone is pinned or shares a screen. Each tile can be pinned or maximized. The layout
          follows the stage&apos;s own size, so the same component works in a full window, a
          side panel and a phone.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Use {code('VideoGrid')} for a stateless gallery whose layout you control. Use{' '}
          {code('VideoStage')} when the call should manage pinning, presenters, the active
          speaker and paging itself. Both render the same {code('VideoTile')}.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Grid</h2>
        <p className="text-sm text-muted-foreground">
          Up to four participants fill the stage: one alone, two side by side (stacked on a
          portrait stage), four in a 2 × 2 grid. Every tile has its options behind the chevron at
          its top-right corner.
        </p>
        <VideoStageExamples section="grid" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Paging</h2>
        <p className="text-sm text-muted-foreground">
          From five participants the grid pages: two rows that scroll sideways on a landscape
          stage (one row when the stage is too short for two), two columns that scroll down on a
          portrait one. Pages snap into place. The previous and next buttons and the thumb below
          show how far there is to go, and reach the next page without a wheel or swipe.
        </p>
        <VideoStageExamples section="paging" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Presentation</h2>
        <p className="text-sm text-muted-foreground">
          A shared screen takes the stage, with the participants in a rail beside it. The rail
          moves below the stage on a portrait stage or one narrower than 600 px. A pinned
          participant beats a shared screen, and a screen share that starts during the call is
          pinned so the newest presenter is always shown.
        </p>
        <VideoStageExamples section="presentation" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pin and maximize</h2>
        <p className="text-sm text-muted-foreground">
          Open a tile&apos;s options to {code('Spotlight')} it (pin it to the stage) or{' '}
          {code('Maximize')} it over the whole stage. Your own actions join them through{' '}
          {code('renderTileActions')} — here, mute for me. This example controls the pin, so it
          can say who is pinned.
        </p>
        <VideoStageExamples section="pin-and-zoom" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Active speaker</h2>
        <p className="text-sm text-muted-foreground">
          With {code('autoSpotlightSpeaker')}, whoever speaks takes the stage, and stays there
          through a pause until someone else speaks. The viewer&apos;s own tile and shared screens
          never do. The speaking tile has a success-toned edge and a sound-wave icon beside the
          name, so the cue does not rely on colour.
        </p>
        <VideoStageExamples section="active-speaker" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Narrow and portrait stages</h2>
        <p className="text-sm text-muted-foreground">
          The stage measures itself, not the window. In a phone-sized frame the rail sits below
          the presentation and is shorter, and a large grid pages downward in two columns.
        </p>
        <VideoStageExamples section="compact" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The stage is a labelled group, and each tile is a group named for its participant
            (&ldquo;Owen Price (Presenting)&rdquo; for a shared screen).
          </li>
          <li>
            Every control is a button with a name: &ldquo;Options for Pia Berg&rdquo;,
            &ldquo;Spotlight Pia Berg&rdquo;, &ldquo;Unpin Pia Berg&rdquo;, &ldquo;Maximize Pia
            Berg&rdquo;, &ldquo;Minimize&rdquo;, &ldquo;Previous participants&rdquo; and
            &ldquo;More participants&rdquo;. All are in the tab order and show a focus ring.
          </li>
          <li>
            The options trigger reports {code('aria-expanded')}; Tab moves from it into the
            actions. Escape closes them and returns focus to the trigger. After pinning or
            unpinning, focus follows the participant to where their tile moved.
          </li>
          <li>
            Maximizing moves focus to Minimize and makes the layout underneath inert. Escape or
            Minimize returns to the layout, with focus on that participant&apos;s options.
          </li>
          <li>
            Pinned and speaking are never colour alone: a labelled pin badge and a sound-wave
            icon go with the coloured edge.
          </li>
          <li>
            Under reduced motion, paging jumps instead of gliding and transitions are off.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation (React)</h2>
        <InstallCommand packageName="@refraction-ui/react" />
        <p className="text-sm text-muted-foreground">
          React only: the stage measures itself and keeps pin, zoom and speaker state, which need
          a client.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled pin and your own actions</h2>
        <CodeBlock frameworks={{ react: controlledCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={videoStageProps} />
      </section>
    </div>
  )
}
