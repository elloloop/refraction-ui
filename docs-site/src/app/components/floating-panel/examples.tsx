'use client'

import * as React from 'react'
import { FloatingPanel, type FloatingPanelCorner } from '@refraction-ui/react-floating-panel'
import { VideoTile } from '@refraction-ui/react-video-tile'
import { Button } from '@refraction-ui/react-button'

interface FloatingPanelExamplesProps {
  section: 'basic' | 'call' | 'controlled'
}

const CORNERS: { value: FloatingPanelCorner; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
]

/**
 * The panel is `position: fixed` over the whole viewport, so each demo shows
 * it on demand instead of stacking several panels on the page at once.
 */
function useShown() {
  const [shown, setShown] = React.useState(false)
  const toggle = React.useCallback(() => setShown((s) => !s), [])
  return { shown, toggle }
}

export function FloatingPanelExamples({ section }: FloatingPanelExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'call') return <CallExample />
  if (section === 'controlled') return <ControlledExample />
  return null
}

function BasicExample() {
  const { shown, toggle } = useShown()
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-8">
      <Button variant="outline" onClick={toggle} aria-pressed={shown}>
        {shown ? 'Hide panel' : 'Show panel'}
      </Button>
      <p className="text-sm text-muted-foreground">
        Drag the grip, or focus it and press an arrow key, to move the panel to another corner.
      </p>
      {shown && (
        <FloatingPanel label="Notes" header="Notes" className="w-72">
          <p className="p-3 text-sm text-muted-foreground">
            A small panel that stays put while you work elsewhere on the page.
          </p>
        </FloatingPanel>
      )}
    </div>
  )
}

function CallExample() {
  const { shown, toggle } = useShown()
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-8">
      <Button variant="outline" onClick={toggle} aria-pressed={shown}>
        {shown ? 'End call preview' : 'Start call preview'}
      </Button>
      {shown && (
        <FloatingPanel
          label="Call with Maya Goldberg"
          header={`Maya Goldberg · 04:12`}
          defaultCorner="bottom-right"
          className="w-80"
        >
          <div className="p-2">
            <VideoTile name="Maya Goldberg" speaking />
          </div>
        </FloatingPanel>
      )}
    </div>
  )
}

function ControlledExample() {
  const { shown, toggle } = useShown()
  const [corner, setCorner] = React.useState<FloatingPanelCorner>('top-right')
  const [collapsed, setCollapsed] = React.useState(false)
  const cornerLabel = CORNERS.find((c) => c.value === corner)?.label ?? corner

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-8">
      <Button variant="outline" onClick={toggle} aria-pressed={shown}>
        {shown ? 'Hide panel' : 'Show panel'}
      </Button>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Corner</legend>
        <div className="flex flex-wrap gap-2">
          {CORNERS.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={c.value === corner ? 'default' : 'outline'}
              aria-pressed={c.value === corner}
              onClick={() => setCorner(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </fieldset>
      <p className="text-sm text-muted-foreground">
        {`Corner: ${cornerLabel} · ${collapsed ? 'Collapsed' : 'Expanded'}`}
      </p>
      {shown && (
        <FloatingPanel
          label="Controlled panel"
          header="Controlled"
          corner={corner}
          onCornerChange={setCorner}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          margin={24}
          className="w-64"
        >
          <p className="p-3 text-sm text-muted-foreground">
            The parent owns the corner and the collapsed state.
          </p>
        </FloatingPanel>
      )}
    </div>
  )
}
