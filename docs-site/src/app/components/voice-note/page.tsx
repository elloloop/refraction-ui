import { VoiceNoteExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const voiceNoteProps = [
  {
    name: 'src',
    type: 'string',
    description: 'Audio URL. Only metadata is fetched (`preload="metadata"`) until the user presses play.',
  },
  {
    name: 'peaks',
    type: 'number[] | Float32Array',
    description:
      'Pre-computed waveform peaks, any length (resampled to the bar count). Drawn by the existing Waveform, which acts as the scrubber.',
  },
  {
    name: 'duration',
    type: 'number',
    description:
      'Known length in seconds. Shown before metadata loads, and used whenever the browser reports no finite duration (common for recorder-produced WebM).',
  },
  {
    name: 'playbackRate',
    type: 'number',
    description: 'Controlled playback speed.',
  },
  {
    name: 'defaultPlaybackRate',
    type: 'number',
    default: '1',
    description: 'Initial playback speed when uncontrolled.',
  },
  {
    name: 'onPlaybackRateChange',
    type: '(rate: number) => void',
    description: 'Called with the next speed (1 → 1.5 → 2 → 1) when the speed control is pressed.',
  },
  {
    name: 'getAriaValueText',
    type: '(currentTime: number, duration: number) => string',
    description: 'Replaces the scrubber’s default `aria-valuetext` ("0:12 of 0:45").',
  },
  {
    name: 'labels',
    type: 'Partial<VoiceNoteLabels>',
    description:
      'Overrides for `group`, `play`, `pause`, `seek`, `playbackRate`, `loading` and `error` strings.',
  },
  {
    name: 'onStateChange',
    type: "(state: 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error') => void",
    description: 'Called whenever the playback state changes (not on mount).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the player row.',
  },
]

const usageCode = `import { VoiceNote } from '@refraction-ui/react'

export function Message({ note }) {
  // peaks and duration are computed once, when the note is uploaded.
  return (
    <VoiceNote
      src={note.url}
      peaks={note.peaks}
      duration={note.durationSeconds}
      aria-label={\`Voice note from \${note.author}\`}
    />
  )
}`

export default function VoiceNotePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Voice Note</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A compact player for audio messages: play and pause, a waveform that doubles as a
          keyboard-operable seek slider, elapsed and total time, a 1× / 1.5× / 2× speed control,
          and loading and error states. You supply the source and pre-computed peaks.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Press play, then click or drag on the waveform to seek. With the scrubber focused,
          the arrow keys seek by 5 seconds and Home / End jump to the ends. The speed button
          cycles 1×, 1.5× and 2×.
        </p>
        <VoiceNoteExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled speed</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>playbackRate</code> and{' '}
          <code className={code}>onPlaybackRateChange</code> to keep one speed across every note
          in a conversation.
        </p>
        <VoiceNoteExamples section="speed" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Localised labels</h2>
        <p className="text-sm text-muted-foreground">
          Every string is replaceable through <code className={code}>labels</code>, and{' '}
          <code className={code}>getAriaValueText</code> rewrites what screen readers hear for
          the position.
        </p>
        <VoiceNoteExamples section="labels" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Error</h2>
        <p className="text-sm text-muted-foreground">
          When the audio cannot be loaded or decoded, the player says so in text with an icon,
          announces it, and disables its controls.
        </p>
        <VoiceNoteExamples section="error" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The player is a <code className={code}>role=&quot;group&quot;</code> named
            &quot;Voice note&quot; (override with <code className={code}>aria-label</code>).
          </li>
          <li>
            The play button names the action it performs next — &quot;Play&quot; or
            &quot;Pause&quot; — and swaps its icon to match. It is deliberately not an{' '}
            <code className={code}>aria-pressed</code> toggle, whose label must stay fixed.
          </li>
          <li>
            The waveform is a <code className={code}>role=&quot;slider&quot;</code> with{' '}
            <code className={code}>aria-valuemin</code>, <code className={code}>aria-valuemax</code>{' '}
            and <code className={code}>aria-valuenow</code> in whole seconds, and{' '}
            <code className={code}>aria-valuetext</code> such as &quot;0:12 of 0:45&quot;. Arrow
            keys seek 5 s; Home and End jump to the start and end.
          </li>
          <li>
            The speed button’s name is &quot;Playback speed 1.5×&quot;, so it contains its visible
            text. Loading and error messages are announced through a polite{' '}
            <code className={code}>role=&quot;status&quot;</code> region.
          </li>
          <li>
            Play and speed controls have a 44 × 44 px target, and the scrubber is 44 px tall.
            Progress is shown by a playhead and the clock, not only by bar colour; errors use
            text and an icon.
          </li>
          <li>
            Every control has a visible <code className={code}>focus-visible</code> ring. The
            waveform is drawn once rather than animated, and the loading spinner stops under{' '}
            <code className={code}>prefers-reduced-motion</code>.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={voiceNoteProps} />
      </section>
    </div>
  )
}
