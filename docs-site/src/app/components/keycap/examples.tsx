'use client'

import * as React from 'react'
import { Keycap, KeyLegend, type KeycapPlatform } from '@refraction-ui/react-keycap'

export type KeycapExampleSection =
  | 'basic'
  | 'sizes'
  | 'states'
  | 'legends'
  | 'platforms'
  | 'inline'
  | 'hold'

interface KeycapExamplesProps {
  section: KeycapExampleSection
}

const PLATFORMS: { platform: KeycapPlatform; title: string }[] = [
  { platform: 'mac', title: 'macOS' },
  { platform: 'windows', title: 'Windows / Linux' },
]

const PLATFORM_KEYS = ['Mod', 'Alt', 'Ctrl', 'Shift', 'Enter', 'Escape', 'Backspace', 'Tab']

/** Width that makes a space bar read as a space bar. */
const SPACE_BAR_MIN_WIDTH = '6rem'

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-8">{children}</div>
}

export function KeycapExamples({ section }: KeycapExamplesProps) {
  if (section === 'basic') {
    return (
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <Keycap legend="Mod" />
          <Keycap legend="Shift" />
          <Keycap legend="K" />
          <Keycap legend="Space" minWidth={SPACE_BAR_MIN_WIDTH} />
        </div>
      </Panel>
    )
  }

  if (section === 'sizes') {
    return (
      <Panel>
        <div className="flex flex-wrap items-end gap-6">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Keycap size={size} legend={<KeyLegend word="Option" side="right" />} />
              <span className="text-xs text-muted-foreground">{size}</span>
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  if (section === 'states') {
    return (
      <Panel>
        <div className="flex flex-wrap items-end gap-6">
          <figure className="flex flex-col items-center gap-2">
            <Keycap size="lg" legend="K" />
            <figcaption className="text-xs text-muted-foreground">resting</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Keycap size="lg" legend="K" pressed />
            <figcaption className="text-xs text-muted-foreground">pressed</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Keycap size="lg" legend="K" highlighted />
            <figcaption className="text-xs text-muted-foreground">highlighted</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <Keycap size="lg" legend="K" pressed highlighted />
            <figcaption className="text-xs text-muted-foreground">both</figcaption>
          </figure>
        </div>
      </Panel>
    )
  }

  if (section === 'legends') {
    return (
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Keycap legend={<KeyLegend word="Option" side="right" platform="mac" />} />
          <Keycap legend={<KeyLegend word="Option" show="word" platform="mac" />} />
          <Keycap legend={<KeyLegend word="Option" show="both" side="left" platform="mac" />} />
          <Keycap legend={<KeyLegend word="Fn" icon={<GlobeIcon />} />} />
          <Keycap legend="Fn" semanticLabel="Function key" />
        </div>
      </Panel>
    )
  }

  if (section === 'platforms') {
    return (
      <Panel>
        <div className="grid gap-6 sm:grid-cols-2">
          {PLATFORMS.map(({ platform, title }) => (
            <div key={platform} className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_KEYS.map((key) => (
                  <Keycap key={key} legend={key} platform={platform} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    )
  }

  if (section === 'inline') {
    return (
      <Panel>
        <p className="text-base leading-relaxed text-foreground">
          Hold <Keycap size="sm" legend={<KeyLegend word="Option" side="right" />} /> to dictate,
          or press <Keycap size="sm" legend="Mod" /> <Keycap size="sm" legend="K" /> to open the
          command menu.
        </p>
      </Panel>
    )
  }

  if (section === 'hold') {
    return <HoldExample />
  }

  return null
}

/** Mirrors the held state of the real Alt / Option key. */
function HoldExample() {
  const [held, setHeld] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Alt') setHeld(true)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') setHeld(false)
    }
    const release = () => setHeld(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', release)
    }
  }, [])

  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-4">
        <Keycap
          size="lg"
          legend={<KeyLegend word="Alt" show="both" />}
          pressed={held}
          highlighted={!held}
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {held ? 'Held — release to stop.' : 'Press and hold the key on your keyboard.'}
        </p>
      </div>
    </Panel>
  )
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  )
}
