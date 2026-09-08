'use client'

import * as React from 'react'
import {
  PageTransition,
  Stagger,
  Reveal,
  CheckDraw,
  MOTION_PATTERNS,
  MOTION_SPEED_NAMES,
  MOTION_SPEEDS,
  type MotionPattern,
  type MotionAxis,
  type MotionSpeedName,
} from '@refraction-ui/react-motion'

interface MotionExamplesProps {
  section: 'page' | 'stagger' | 'celebrate' | 'check' | 'patterns'
}

export function MotionExamples({ section }: MotionExamplesProps) {
  if (section === 'page') return <PageExample />
  if (section === 'stagger') return <StaggerExample />
  if (section === 'celebrate') return <CelebrateExample />
  if (section === 'check') return <CheckExample />
  if (section === 'patterns') return <PatternsExample />
  return null
}

const buttonClass =
  'inline-flex h-9 items-center justify-center rounded-pill border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50'

const selectClass =
  'h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground'

/**
 * Speed picker shared by the demos. Options come from the package so the docs
 * and the component can never drift apart.
 */
function SpeedSelect({
  value,
  onChange,
}: {
  value: MotionSpeedName
  onChange: (speed: MotionSpeedName) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      Speed
      <select
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value as MotionSpeedName)}
      >
        {MOTION_SPEED_NAMES.map((name) => (
          <option key={name} value={name}>
            {`${name} — ${MOTION_SPEEDS[name]}x`}
          </option>
        ))}
      </select>
    </label>
  )
}

const STEPS = [
  { eyebrow: 'Step 1 of 3', title: 'Create your parent account', body: 'This account is yours. Your child gets their own space.' },
  { eyebrow: 'Step 2 of 3', title: 'Who is learning?', body: 'Their age is the only thing we really need.' },
  { eyebrow: 'Step 3 of 3', title: 'Start the free week', body: 'Everything unlocked for seven days. Nothing is a one-way door.' },
]

function PageExample() {
  const [step, setStep] = React.useState(0)
  const [axis, setAxis] = React.useState<MotionAxis>('vertical')
  const [speed, setSpeed] = React.useState<MotionSpeedName>('default')
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={buttonClass} disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          Back
        </button>
        <button type="button" className={buttonClass} disabled={step === STEPS.length - 1} onClick={() => setStep((s) => s + 1)}>
          Continue
        </button>
        <span className="mx-2 h-6 w-px bg-border" />
        <button type="button" className={buttonClass} aria-pressed={axis === 'vertical'} onClick={() => setAxis('vertical')}>
          Vertical
        </button>
        <button type="button" className={buttonClass} aria-pressed={axis === 'horizontal'} onClick={() => setAxis('horizontal')}>
          Horizontal
        </button>
        <span className="mx-2 h-6 w-px bg-border" />
        <SpeedSelect value={speed} onChange={setSpeed} />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background p-6">
        <PageTransition step={step} axis={axis} speed={speed}>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{STEPS[step].eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{STEPS[step].title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{STEPS[step].body}</p>
        </PageTransition>
      </div>
    </div>
  )
}

const TILES = ['Reading', 'Maths', 'Science', 'Code', 'Art', 'World', 'Music', 'History', 'Geography', 'Drama']

function StaggerExample() {
  const [run, setRun] = React.useState(0)
  const [speed, setSpeed] = React.useState<MotionSpeedName>('default')
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={buttonClass} onClick={() => setRun((r) => r + 1)}>
          Replay
        </button>
        <SpeedSelect
          value={speed}
          onChange={(next) => {
            setSpeed(next)
            setRun((r) => r + 1)
          }}
        />
      </div>
      <Stagger key={`${speed}-${run}`} speed={speed} layout="grid" className="grid-cols-2 gap-3 sm:grid-cols-5">
        {TILES.map((tile) => (
          <div key={tile} className="rounded-lg border border-border bg-background px-3 py-4 text-center text-sm font-medium text-foreground">
            {tile}
          </div>
        ))}
      </Stagger>
      <p className="text-xs text-muted-foreground">
        Ten tiles, but only the first eight get their own delay — the rest arrive with the eighth. Speed scales the
        45ms step as well as each tile&apos;s animation.
      </p>
    </div>
  )
}

function CelebrateExample() {
  const [run, setRun] = React.useState(0)
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <button type="button" className={buttonClass} onClick={() => setRun((r) => r + 1)}>
        Award again
      </button>
      <div className="flex items-center gap-6">
        <Reveal key={run} pattern="celebrate" className="flex size-20 items-center justify-center rounded-full bg-warning text-warning-foreground">
          <CheckDraw key={run} size={40} strokeWidth={3} label="Badge earned" />
        </Reveal>
        <div>
          <Reveal key={`n-${run}`} as="p" pattern="num-pop" className="text-3xl font-semibold tabular-nums text-foreground">
            {`${5 + run} days`}
          </Reveal>
          <p className="text-sm text-muted-foreground">Nice and steady. Four steps done.</p>
        </div>
      </div>
    </div>
  )
}

function CheckExample() {
  const [run, setRun] = React.useState(0)
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <button type="button" className={buttonClass} onClick={() => setRun((r) => r + 1)}>
        Draw again
      </button>
      <div className="flex items-center gap-4 text-success">
        <CheckDraw key={run} size={48} strokeWidth={3} label="Saved" />
        <span className="text-sm text-foreground">Saved</span>
      </div>
    </div>
  )
}

function PatternsExample() {
  const [pattern, setPattern] = React.useState<MotionPattern>('page-in')
  const [speed, setSpeed] = React.useState<MotionSpeedName>('default')
  const [run, setRun] = React.useState(0)
  const visual = MOTION_PATTERNS.filter((p) => p !== 'check-draw')
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <div className="flex flex-wrap gap-2">
        {visual.map((p) => (
          <button
            key={p}
            type="button"
            className={buttonClass}
            aria-pressed={pattern === p}
            onClick={() => {
              setPattern(p)
              setRun((r) => r + 1)
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SpeedSelect
          value={speed}
          onChange={(next) => {
            setSpeed(next)
            setRun((r) => r + 1)
          }}
        />
        <button type="button" className={buttonClass} onClick={() => setRun((r) => r + 1)}>
          Replay
        </button>
      </div>
      <div className="flex h-40 items-end justify-center overflow-hidden rounded-lg border border-border bg-background p-6">
        <Reveal
          key={`${pattern}-${speed}-${run}`}
          pattern={pattern}
          speed={speed}
          className="w-full max-w-xs rounded-lg border border-border bg-card p-4 shadow-md"
        >
          {/* SSR text rule: one template literal so the string stays contiguous. */}
          <p className="text-sm font-medium text-foreground">{`${pattern} at ${MOTION_SPEEDS[speed]}x`}</p>
          <p className="text-xs text-muted-foreground">Pick a pattern or a speed to replay.</p>
        </Reveal>
      </div>
    </div>
  )
}
