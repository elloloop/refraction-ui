'use client'

import * as React from 'react'
import { LiveCursors, Cursor } from '@refraction-ui/react-live-cursors'
import { CURSOR_COLORS, assignCursorColor } from '@refraction-ui/react-live-cursors'
import type { CursorData } from '@refraction-ui/react-live-cursors'

interface LiveCursorsExamplesProps {
  section: 'labeled' | 'color-assignment' | 'canvas'
}

export function LiveCursorsExamples({ section }: LiveCursorsExamplesProps) {
  if (section === 'labeled') {
    return <LabeledExample />
  }

  if (section === 'color-assignment') {
    return <ColorAssignmentExample />
  }

  if (section === 'canvas') {
    return <CanvasExample />
  }

  return null
}

function LabeledExample() {
  const cursors: CursorData[] = [
    { id: 'user-1', name: 'Maya', x: 60, y: 40, color: CURSOR_COLORS[0] },
    { id: 'user-2', name: 'Kwame', x: 200, y: 110, color: CURSOR_COLORS[4] },
    { id: 'user-3', name: 'Camille', x: 340, y: 60, color: CURSOR_COLORS[6] },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-0 overflow-hidden">
      <div className="relative h-48 bg-muted/30">
        <LiveCursors cursors={cursors} />
        <p className="absolute bottom-3 left-3 text-xs text-muted-foreground select-none">
          Three collaborators on a shared surface
        </p>
      </div>
    </div>
  )
}

function ColorAssignmentExample() {
  const ids = ['alice', 'bob', 'charlie', 'diana', 'evan', 'fiona', 'george', 'hannah']

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
      <p className="text-sm text-muted-foreground">
        Colors are assigned deterministically — same id, same color, every time.
      </p>
      <div className="flex flex-wrap gap-3">
        {ids.map((id, index) => (
          <div key={id} className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{ backgroundColor: assignCursorColor(id, index) }}
            />
            <span className="text-sm font-medium text-foreground">{id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CanvasExample() {
  const [cursors, setCursors] = React.useState<CursorData[]>([
    { id: 'user-1', name: 'Maya', x: 80, y: 60 },
    { id: 'user-2', name: 'Kwame', x: 280, y: 130 },
  ])

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setCursors((prev) =>
        prev.map((c, i) =>
          i === 0 ? { ...c, x: Math.round(x), y: Math.round(y) } : c,
        ),
      )
    },
    [],
  )

  return (
    <div className="rounded-xl border border-border bg-card p-0 overflow-hidden">
      <div
        className="relative h-56 bg-gradient-to-br from-muted/20 to-muted/60 cursor-none"
        onMouseMove={handleMouseMove}
      >
        <LiveCursors cursors={cursors} />
        <p className="absolute bottom-3 left-3 text-xs text-muted-foreground select-none pointer-events-none">
          Move your mouse — Maya follows your cursor
        </p>
      </div>
    </div>
  )
}
