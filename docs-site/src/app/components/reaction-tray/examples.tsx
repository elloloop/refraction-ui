'use client'

import * as React from 'react'
import { ReactionTray, type ReactionTrayOption } from '@refraction-ui/react-reaction-tray'

interface ReactionTrayExamplesProps {
  section: 'basic' | 'expanded' | 'sizes' | 'custom-glyph'
}

const REACTIONS: ReactionTrayOption[] = [
  { id: 'thumbs-up', glyph: '\u{1F44D}', label: 'Thumbs up' },
  { id: 'heart', glyph: '❤️', label: 'Heart' },
  { id: 'joy', glyph: '\u{1F602}', label: 'Tears of joy' },
  { id: 'wow', glyph: '\u{1F62E}', label: 'Surprised' },
  { id: 'sad', glyph: '\u{1F622}', label: 'Sad' },
  { id: 'pray', glyph: '\u{1F64F}', label: 'Thank you' },
  { id: 'party', glyph: '\u{1F389}', label: 'Party' },
  { id: 'fire', glyph: '\u{1F525}', label: 'Fire' },
  { id: 'eyes', glyph: '\u{1F440}', label: 'Looking' },
  { id: 'rocket', glyph: '\u{1F680}', label: 'Rocket' },
  { id: 'check', glyph: '✅', label: 'Done' },
  { id: 'hundred', glyph: '\u{1F4AF}', label: 'Hundred' },
]

/** Parent-owned state: the tray reports a pick, the parent flips `isActive`. */
function useReactions(initial: ReactionTrayOption[]) {
  const [options, setOptions] = React.useState(initial)
  const onSelected = React.useCallback((picked: ReactionTrayOption) => {
    setOptions((list) =>
      list.map((o) => (o.id === picked.id ? { ...o, isActive: !o.isActive } : o)),
    )
  }, [])
  return { options, onSelected }
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-8 space-y-4">{children}</div>
}

function Picked({ options }: { options: ReactionTrayOption[] }) {
  const active = options.filter((o) => o.isActive).map((o) => o.label)
  return (
    <p className="text-sm text-muted-foreground">
      {active.length > 0 ? `Your reactions: ${active.join(', ')}` : 'No reactions yet'}
    </p>
  )
}

function BasicExample() {
  const tray = useReactions(REACTIONS.map((o) => (o.id === 'heart' ? { ...o, isActive: true } : o)))
  return (
    <Frame>
      <ReactionTray {...tray} aria-label="React to message" />
      <Picked options={tray.options} />
    </Frame>
  )
}

function ExpandedExample() {
  const tray = useReactions(REACTIONS)
  return (
    <Frame>
      <ReactionTray
        {...tray}
        inlineCount={4}
        initiallyExpanded
        moreLabel="Show all reactions"
        fewerLabel="Show quick reactions"
        aria-label="React to message"
      />
      <Picked options={tray.options} />
    </Frame>
  )
}

function SizesExample() {
  const tray = useReactions(REACTIONS)
  return (
    <Frame>
      <ReactionTray {...tray} inlineCount={5} cellSize={56} glyphSize={32} aria-label="React to message" />
      <Picked options={tray.options} />
    </Frame>
  )
}

function CustomGlyphExample() {
  const tray = useReactions(REACTIONS.slice(0, 6))
  return (
    <Frame>
      <ReactionTray
        {...tray}
        renderGlyph={(option) =>
          option.isActive ? (
            <span className="drop-shadow-sm">{option.glyph}</span>
          ) : (
            <span className="grayscale">{option.glyph}</span>
          )
        }
        aria-label="React to message"
      />
      <Picked options={tray.options} />
    </Frame>
  )
}

export function ReactionTrayExamples({ section }: ReactionTrayExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'expanded') return <ExpandedExample />
  if (section === 'sizes') return <SizesExample />
  if (section === 'custom-glyph') return <CustomGlyphExample />
  return null
}
