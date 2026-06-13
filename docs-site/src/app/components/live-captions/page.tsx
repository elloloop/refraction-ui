import { LiveCaptionsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const liveCaptionsProps = [
  {
    name: 'cues',
    type: 'CaptionCue[]',
    description: 'The full ordered list of caption cues to track.',
  },
  {
    name: 'maxLines',
    type: 'number',
    default: '2',
    description: 'Maximum number of cue lines to display at once.',
  },
  {
    name: 'position',
    type: "'static' | 'absolute'",
    default: "'static'",
    description:
      "How the container is placed in the layout. Use 'absolute' to overlay a video element.",
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the caption container.',
  },
]

const captionCueProps = [
  {
    name: 'id',
    type: 'string',
    description: 'Unique identifier for this cue (used as React key).',
  },
  {
    name: 'speaker',
    type: 'string',
    description: 'Speaker name — shown as a muted prefix when present.',
  },
  {
    name: 'text',
    type: 'string',
    description: 'The caption text for this cue.',
  },
  {
    name: 'final',
    type: 'boolean',
    description:
      'Whether this cue is finalised. Non-final (interim) cues are rendered dimmed and italic.',
  },
]

const usageCode = `import { LiveCaptions } from '@refraction-ui/react'

const cues = [
  { id: '1', speaker: 'Maya', text: 'the bottleneck is review capacity', final: true },
  { id: '2', speaker: 'Alex', text: 'agreed, let me pull up the dashboard', final: false },
]

export function MeetingView() {
  return (
    <div className="relative">
      <video src="..." />
      <LiveCaptions
        cues={cues}
        maxLines={2}
        position="absolute"
        className="bottom-4 inset-x-4"
      />
    </div>
  )
}`

export default function LiveCaptionsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Captions</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A rolling caption overlay for meeting and video surfaces. Shows the last N cue lines
          in a translucent dark bubble, with speaker names and live interim transcription
          rendered dimmed while speech is still in flight.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Single line</h2>
        <p className="text-sm text-muted-foreground">
          A minimal caption display with <code className="text-xs bg-muted px-1 rounded">maxLines={1}</code> — useful for subtitle-style overlays.
        </p>
        <LiveCaptionsExamples section="single-line" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Two speakers</h2>
        <p className="text-sm text-muted-foreground">
          When <code className="text-xs bg-muted px-1 rounded">speaker</code> is set, a muted
          prefix identifies who is talking. Multiple speakers scroll naturally within the window.
        </p>
        <LiveCaptionsExamples section="two-speakers" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Interim vs final</h2>
        <p className="text-sm text-muted-foreground">
          Non-final cues (where <code className="text-xs bg-muted px-1 rounded">final</code> is{' '}
          <code className="text-xs bg-muted px-1 rounded">false</code>) are rendered dimmed and
          italic to signal they may still change. Click "Finalise cue" to see the transition.
        </p>
        <LiveCaptionsExamples section="interim" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation available via @refraction-ui/astro -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">LiveCaptions props</h2>
        <PropsTable props={liveCaptionsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CaptionCue shape</h2>
        <PropsTable props={captionCueProps} />
      </section>
    </div>
  )
}
