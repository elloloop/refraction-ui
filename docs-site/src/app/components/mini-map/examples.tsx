'use client'

import * as React from 'react'
import { MiniMap } from '@refraction-ui/react-mini-map'
import type { MiniMapItem, Rect } from '@refraction-ui/react-mini-map'

interface MiniMapExamplesProps {
  section: 'basic' | 'viewport' | 'interactive'
}

const SAMPLE_ITEMS: MiniMapItem[] = [
  { id: 'node-a', x: 0, y: 0, width: 120, height: 80 },
  { id: 'node-b', x: 250, y: 50, width: 100, height: 60 },
  { id: 'node-c', x: 80, y: 180, width: 90, height: 70 },
  { id: 'node-d', x: 350, y: 220, width: 80, height: 50 },
  { id: 'node-e', x: 160, y: 100, width: 60, height: 40 },
]

const INITIAL_VIEWPORT: Rect = { x: 50, y: 30, width: 200, height: 150 }

export function MiniMapExamples({ section }: MiniMapExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <MiniMap items={SAMPLE_ITEMS} width={200} height={140} />
      </div>
    )
  }

  if (section === 'viewport') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <MiniMap
          items={SAMPLE_ITEMS}
          viewport={INITIAL_VIEWPORT}
          width={200}
          height={140}
        />
      </div>
    )
  }

  if (section === 'interactive') {
    return <InteractiveExample />
  }

  return null
}

function InteractiveExample() {
  const [viewport, setViewport] = React.useState<Rect>(INITIAL_VIEWPORT)

  const handleViewportChange = React.useCallback(
    (center: { x: number; y: number }) => {
      setViewport((prev) => ({
        ...prev,
        x: center.x - prev.width / 2,
        y: center.y - prev.height / 2,
      }))
    },
    [],
  )

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <MiniMap
        items={SAMPLE_ITEMS}
        viewport={viewport}
        width={200}
        height={140}
        onViewportChange={handleViewportChange}
      />
      <p className="text-sm text-muted-foreground">
        Viewport: x={Math.round(viewport.x)}, y={Math.round(viewport.y)}
      </p>
    </div>
  )
}
