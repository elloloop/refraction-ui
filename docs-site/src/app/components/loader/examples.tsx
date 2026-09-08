'use client'

import * as React from 'react'
import {
  Spinner,
  LoadingBar,
  PageLoadingBar,
  LoadingOverlay,
  useDelayedLoading,
  type LoaderVariant,
  type LoaderSize,
} from '@refraction-ui/react-loader'

interface LoaderExamplesProps {
  section:
    | 'spinners'
    | 'sizes'
    | 'buttons'
    | 'bars'
    | 'page-transition'
    | 'overlay'
    | 'delayed'
}

const VARIANTS: LoaderVariant[] = ['ring', 'dots', 'bars', 'orbit', 'ripple']
const SIZES: LoaderSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const frame = 'rounded-xl border border-border bg-card p-8'
const button =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60'
const outlineButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent'

export function LoaderExamples({ section }: LoaderExamplesProps) {
  switch (section) {
    case 'spinners':
      return (
        <div className={frame}>
          <div className="flex flex-wrap items-end gap-10">
            {VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-col items-center gap-3">
                <Spinner variant={variant} size="lg" label={`Loading (${variant})`} />
                <span className="text-xs font-medium text-muted-foreground">{variant}</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'sizes':
      return (
        <div className={frame}>
          <div className="flex flex-wrap items-end gap-8">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-3">
                <Spinner size={size} />
                <span className="text-xs font-medium text-muted-foreground">{size}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" tone="muted" />
              <span className="text-xs font-medium text-muted-foreground">muted</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" tone="tertiary" variant="dots" />
              <span className="text-xs font-medium text-muted-foreground">tertiary</span>
            </div>
          </div>
        </div>
      )

    case 'buttons':
      return <ButtonExample />

    case 'bars':
      return <BarsExample />

    case 'page-transition':
      return <PageTransitionExample />

    case 'overlay':
      return <OverlayExample />

    case 'delayed':
      return <DelayedExample />

    default:
      return null
  }
}

function ButtonExample() {
  const [saving, setSaving] = React.useState(false)
  const save = () => {
    setSaving(true)
    window.setTimeout(() => setSaving(false), 1800)
  }
  return (
    <div className={frame}>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className={button} onClick={save} disabled={saving} aria-busy={saving}>
          {saving && <Spinner size="sm" tone="current" decorative />}
          {saving ? 'Saving' : 'Save answers'}
        </button>
        <button type="button" className={outlineButton} disabled aria-busy="true">
          <Spinner size="sm" tone="current" variant="dots" decorative />
          Checking
        </button>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="xs" tone="muted" decorative />
          Syncing progress
        </span>
      </div>
    </div>
  )
}

function BarsExample() {
  const [value, setValue] = React.useState(35)
  return (
    <div className={`${frame} space-y-6`}>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Indeterminate</span>
        <LoadingBar label="Loading lesson" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Determinate</span>
          <span className="text-xs tabular-nums text-muted-foreground">{`${value}%`}</span>
        </div>
        <LoadingBar value={value} thickness={6} label="Upload" />
        <div className="flex gap-2 pt-2">
          <button type="button" className={outlineButton} onClick={() => setValue((v) => Math.max(0, v - 20))}>
            −20
          </button>
          <button type="button" className={outlineButton} onClick={() => setValue((v) => Math.min(100, v + 20))}>
            +20
          </button>
        </div>
      </div>
    </div>
  )
}

const PAGES = ['Home', 'Numbers', 'Reading', 'Finish']

function PageTransitionExample() {
  const [page, setPage] = React.useState(0)
  const [pending, setPending] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  const go = (next: number) => {
    window.clearTimeout(timer.current)
    setPending(true)
    timer.current = window.setTimeout(() => {
      setPage(next)
      setPending(false)
    }, 1600)
  }

  return (
    <div className={`${frame} relative overflow-hidden`}>
      {/* Contained here for the demo; in an app use placement="fixed" via PageLoadingBar at the root. */}
      <div className="absolute inset-x-0 top-0">
        <PageLoadingBar active={pending} className="!absolute" label="Loading page" />
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {PAGES.map((name, i) => (
            <button
              key={name}
              type="button"
              className={i === page ? button : outlineButton}
              onClick={() => go(i)}
              aria-current={i === page ? 'page' : undefined}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-muted p-6">
          <p className="text-sm font-medium text-foreground">{`${PAGES[page]} page`}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pending ? 'Fetching the next page…' : 'Pick another page to see the top bar trickle, then finish.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function OverlayExample() {
  const [open, setOpen] = React.useState(false)
  const show = () => {
    setOpen(true)
    window.setTimeout(() => setOpen(false), 2600)
  }
  return (
    <div className={`${frame} relative min-h-[16rem]`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          The overlay covers this card (its nearest positioned ancestor) with a blurred scrim.
        </p>
        <div className="flex gap-2">
          <button type="button" className={button} onClick={show}>
            Reload card
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {['Numbers to 20', 'Sight words', 'Shapes'].map((t) => (
            <div key={t} className="rounded-lg border border-border p-4 text-sm font-medium text-foreground">
              {t}
            </div>
          ))}
        </div>
      </div>
      <LoadingOverlay open={open} scope="contain" message="Refreshing your lessons" />
    </div>
  )
}

function DelayedExample() {
  const [pending, setPending] = React.useState(false)
  const [durationMs, setDurationMs] = React.useState(80)
  const visible = useDelayedLoading(pending, { delayMs: 200, minDurationMs: 600 })

  const run = () => {
    setPending(true)
    window.setTimeout(() => setPending(false), durationMs)
  }

  return (
    <div className={`${frame} space-y-4`}>
      <p className="text-sm text-muted-foreground">
        The spinner only appears after 200ms of waiting and then stays at least 600ms, so an 80ms response never
        flashes and a 300ms one never blinks.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label="Simulated response time"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={durationMs}
          onChange={(e) => setDurationMs(Number(e.target.value))}
        >
          <option value={80}>80ms response</option>
          <option value={300}>300ms response</option>
          <option value={1500}>1500ms response</option>
        </select>
        <button type="button" className={button} onClick={run} disabled={pending}>
          Fetch
        </button>
        <span className="inline-flex h-10 min-w-24 items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          {visible ? <Spinner size="sm" tone="muted" label="Fetching" /> : null}
          {visible ? 'Fetching' : pending ? 'Pending (hidden)' : 'Idle'}
        </span>
      </div>
    </div>
  )
}
