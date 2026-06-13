'use client'

import * as React from 'react'
import { StickyNote } from '@refraction-ui/react-sticky-note'
import { STICKY_NOTE_COLORS, nextStickyColor, type StickyNoteColor } from '@refraction-ui/react-sticky-note'

interface StickyNoteExamplesProps {
  section: 'colors' | 'editable' | 'board'
}

export function StickyNoteExamples({ section }: StickyNoteExamplesProps) {
  if (section === 'colors') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap gap-4">
          {STICKY_NOTE_COLORS.map((color) => (
            <StickyNote
              key={color}
              color={color}
              text={`${color.charAt(0).toUpperCase()}${color.slice(1)}`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (section === 'editable') {
    return <EditableExample />
  }

  if (section === 'board') {
    return <BoardExample />
  }

  return null
}

function EditableExample() {
  const [text, setText] = React.useState('Type your idea here…')
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <StickyNote
        color="yellow"
        text={text}
        onTextChange={setText}
        author="Alice"
      />
    </div>
  )
}

function BoardExample() {
  const initialNotes: Array<{ id: number; color: StickyNoteColor; text: string; x: number; y: number }> = [
    { id: 1, color: 'yellow', text: 'Design the layout', x: 20, y: 20 },
    { id: 2, color: 'pink', text: 'Review with team', x: 200, y: 60 },
    { id: 3, color: 'blue', text: 'Ship it!', x: 380, y: 30 },
  ]
  const [notes, setNotes] = React.useState(initialNotes)

  const moveNote = (id: number, position: { x: number; y: number }) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...position } : n)),
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="relative bg-muted/30" style={{ height: 240 }}>
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            color={note.color}
            text={note.text}
            x={note.x}
            y={note.y}
            draggable
            onMove={(pos) => moveNote(note.id, pos)}
            style={{ cursor: 'grab', userSelect: 'none' }}
          />
        ))}
      </div>
      <p className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
        Drag notes to reposition them.
      </p>
    </div>
  )
}
