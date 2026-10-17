'use client'

import * as React from 'react'
import { ColorChip, COLOR_CHIP_CATEGORIES, colorFor } from '@refraction-ui/react-color-chip'

export type ColorChipExampleSection = 'basic' | 'hint' | 'editable' | 'palette' | 'transcript'

interface ColorChipExamplesProps {
  section: ColorChipExampleSection
}

const frame = 'rounded-xl border border-border bg-card p-8'

const SPEAKERS = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson']

export function ColorChipExamples({ section }: ColorChipExamplesProps) {
  if (section === 'basic') {
    return (
      <div className={`${frame} flex flex-wrap gap-2`}>
        {SPEAKERS.map((name) => (
          <ColorChip key={name} label={name} />
        ))}
      </div>
    )
  }

  if (section === 'hint') {
    return (
      <div className={`${frame} flex flex-wrap gap-2`}>
        <ColorChip label="Ada Lovelace" hint="from the calendar" />
        <ColorChip label="Speaker 2" hint="unidentified" dot={colorFor('speaker-2')} />
      </div>
    )
  }

  if (section === 'editable') {
    return <EditableExample />
  }

  if (section === 'palette') {
    return (
      <div className={`${frame} flex flex-wrap gap-2`}>
        {COLOR_CHIP_CATEGORIES.map((category) => (
          <ColorChip key={category} label={`Category ${category}`} dot={category} />
        ))}
      </div>
    )
  }

  if (section === 'transcript') {
    return <TranscriptExample />
  }

  return null
}

function EditableExample() {
  const [name, setName] = React.useState('Speaker 1')
  const [draft, setDraft] = React.useState(name)
  const [editing, setEditing] = React.useState(false)
  const chipRef = React.useRef<HTMLElement>(null)
  const returnFocus = React.useRef(false)
  // Colour follows a stable id, so renaming the speaker keeps their colour.
  const dot = colorFor('speaker-1')

  // Closing the rename form puts keyboard focus back on the chip that opened it.
  React.useEffect(() => {
    if (editing || !returnFocus.current) return
    returnFocus.current = false
    chipRef.current?.focus()
  }, [editing])

  if (editing) {
    return (
      <form
        className={`${frame} flex flex-wrap items-center gap-2`}
        onSubmit={(event) => {
          event.preventDefault()
          if (draft.trim()) setName(draft.trim())
          returnFocus.current = true
          setEditing(false)
        }}
      >
        <label className="sr-only" htmlFor="color-chip-rename">
          Speaker name
        </label>
        <input
          id="color-chip-rename"
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Save
        </button>
      </form>
    )
  }

  return (
    <div className={`${frame} flex flex-wrap items-center gap-2`}>
      <ColorChip
        ref={chipRef}
        label={name}
        dot={dot}
        hint="from the calendar"
        onEdit={() => {
          setDraft(name)
          setEditing(true)
        }}
        editLabel={`Rename ${name}`}
        editTooltip="Rename this speaker"
      />
    </div>
  )
}

const LINES = [
  { speakerId: 'u-ada', speaker: 'Ada Lovelace', text: 'Shall we start with the agenda?' },
  { speakerId: 'u-grace', speaker: 'Grace Hopper', text: 'Yes — the compiler review first.' },
  { speakerId: 'u-ada', speaker: 'Ada Lovelace', text: 'Then the release plan.' },
]

function TranscriptExample() {
  return (
    <ol className={`${frame} space-y-3`}>
      {LINES.map((line, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-2 text-sm text-foreground">
          <ColorChip label={line.speaker} dot={colorFor(line.speakerId)} />
          <span>{line.text}</span>
        </li>
      ))}
    </ol>
  )
}
