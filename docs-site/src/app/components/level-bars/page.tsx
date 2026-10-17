import { LevelBarsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const colorType =
  "'primary' | 'foreground' | 'success' | 'destructive' | 'warning' | 'info' | 'pending' | 'neutral' | 'muted'"

const colorProp = {
  name: 'color',
  type: colorType,
  default: "'primary'",
  description: 'Semantic colour token for the bars — a token name, not a CSS colour.',
}
const heightProp = {
  name: 'height',
  type: 'number',
  default: '24',
  description: 'Height of the meter, in px. A level of 1 fills it.',
}
const barWidthProp = {
  name: 'barWidth',
  type: 'number',
  default: '3',
  description: 'Width of one bar, in px.',
}
const gapProp = {
  name: 'gap',
  type: 'number',
  default: '2',
  description: 'Space between bars, in px.',
}
const labelProp = {
  name: 'label',
  type: 'string',
  description:
    'Accessible name, e.g. "Microphone level". Turns the decorative meter into a `role="meter"`.',
}
const classNameProp = {
  name: 'className',
  type: 'string',
  description: 'Additional CSS classes to apply.',
}

const levelBarsProps = [
  {
    name: 'levels',
    type: 'number[] | Float32Array',
    description: 'Levels to draw, one bar each, left to right. Clamped to 0–1.',
  },
  colorProp,
  heightProp,
  barWidthProp,
  gapProp,
  {
    name: 'taper',
    type: 'boolean',
    default: 'false',
    description: 'Ease the bars down towards both ends of the row (35% at the ends).',
  },
  labelProp,
  classNameProp,
]

const liveLevelBarsProps = [
  {
    name: 'level',
    type: 'number',
    description: 'The current 0–1 input level. Clamped; NaN counts as silence.',
  },
  colorProp,
  {
    name: 'bars',
    type: 'number',
    default: '16',
    description: 'How many readings the scrolling history keeps.',
  },
  heightProp,
  barWidthProp,
  gapProp,
  {
    name: 'interval',
    type: 'number',
    default: '100',
    description:
      'How often `level` is sampled into the history, in ms (at least 16). A steady level still scrolls.',
  },
  labelProp,
  classNameProp,
]

const usageCode = `import { LevelBars, LiveLevelBars } from '@refraction-ui/react'

// A fixed snapshot, drawn exactly.
<LevelBars levels={[0.2, 0.6, 0.9, 0.4]} taper />

// A live input: pass the latest 0–1 level, e.g. the RMS of an AnalyserNode.
export function MicCheck({ level }: { level: number }) {
  return <LiveLevelBars level={level} bars={20} label="Microphone level" />
}`

const code = 'text-xs bg-muted px-1 rounded'

export default function LevelBarsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Level Bars</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Audio level meters for recording and microphone checks.{' '}
          <code className={code}>LevelBars</code> draws the 0–1 levels you give it, exactly;{' '}
          <code className={code}>LiveLevelBars</code> takes one live level and keeps a fixed
          number of bars as a scrolling history.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          One bar per level, centred vertically. The same levels always render the same
          boxes, so snapshots and tests stay stable.
        </p>
        <LevelBarsExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Taper</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>taper</code> eases the bars down towards both ends along a
          half sine — the middle keeps full height, the ends keep 35%.
        </p>
        <LevelBarsExamples section="taper" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Colours</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>color</code> takes a semantic token name, so the bars follow
          light, dark and system themes. Say what a colour means in text beside it.
        </p>
        <LevelBarsExamples section="colors" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live history</h2>
        <p className="text-sm text-muted-foreground">
          Every <code className={code}>interval</code> ms the current{' '}
          <code className={code}>level</code> is pushed on the right and the oldest reading
          scrolls off the left. A steady or silent input keeps scrolling, so old sound clears.
        </p>
        <LevelBarsExamples section="live" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Microphone check</h2>
        <p className="text-sm text-muted-foreground">
          A labelled meter fed by the microphone: the level is the RMS of an{' '}
          <code className={code}>AnalyserNode</code>&apos;s samples, read every frame.
        </p>
        <LevelBarsExamples section="microphone" />
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
            Decorative by default (<code className={code}>aria-hidden</code>): put it beside
            text that says what it shows.
          </li>
          <li>
            With a <code className={code}>label</code> it is a{' '}
            <code className={code}>role=&quot;meter&quot;</code> from 0 to 100 with{' '}
            <code className={code}>aria-valuenow</code> and{' '}
            <code className={code}>aria-valuetext</code> as a percent.{' '}
            <code className={code}>LevelBars</code> reports its loudest bar;{' '}
            <code className={code}>LiveLevelBars</code> reports the current level.
          </li>
          <li>
            Steady under <code className={code}>prefers-reduced-motion</code>:{' '}
            <code className={code}>LevelBars</code> never animates. In{' '}
            <code className={code}>LiveLevelBars</code> the easing between samples is removed,
            so each bar snaps to its new height; the history still samples at the same
            cadence so it keeps telling the truth about the input.
          </li>
          <li>
            Height carries the level, not colour. It is a readout, not a control, so it
            takes no focus — pair it with a focusable control to start or stop the input.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">LevelBars props</h2>
        <PropsTable props={levelBarsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">LiveLevelBars props</h2>
        <PropsTable props={liveLevelBarsProps} />
      </section>
    </div>
  )
}
