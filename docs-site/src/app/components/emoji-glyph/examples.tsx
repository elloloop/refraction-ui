'use client'

import * as React from 'react'
import { EmojiGlyph } from '@refraction-ui/react-emoji-glyph'
import { Button } from '@refraction-ui/react-button'

export type EmojiGlyphExampleSection = 'basic' | 'fallback' | 'still' | 'reactions' | 'self-hosted'

interface EmojiGlyphExamplesProps {
  section: EmojiGlyphExampleSection
}

const FRAME = 'rounded-xl border border-border bg-card p-8'

const BASIC = [
  { emoji: '👍', name: 'Thumbs up' },
  { emoji: '❤️', name: 'Red heart' },
  { emoji: '😂', name: 'Tears of joy' },
  { emoji: '🎉', name: 'Party popper' },
  { emoji: '🔥', name: 'Fire' },
]

const FALLBACK = [
  { emoji: '🙏', name: 'Animated Noto', note: 'has animated art' },
  { emoji: '🇬🇧', name: 'Twemoji still', note: 'no animation ships' },
  { emoji: '❤︎', name: 'Native glyph', note: 'text presentation (U+FE0E)' },
]

const REACTIONS = [
  { emoji: '👍', label: 'Thumbs up', count: 4 },
  { emoji: '🎉', label: 'Party popper', count: 2 },
  { emoji: '👀', label: 'Eyes', count: 1 },
]

/** A labelled figure: the glyph is decorative, so the visible caption names it. */
function Captioned({ emoji, name, note, animate }: { emoji: string; name: string; note?: string; animate?: boolean }) {
  return (
    <figure className="flex flex-col items-center gap-2 text-center">
      <EmojiGlyph emoji={emoji} size={48} animate={animate} />
      <figcaption className="text-xs text-muted-foreground">
        <span className="block font-medium text-foreground">{name}</span>
        {note}
      </figcaption>
    </figure>
  )
}

function ReactionsExample() {
  const [pressed, setPressed] = React.useState<Record<string, boolean>>({ '👍': true })
  return (
    <div className={`${FRAME} flex flex-wrap gap-2`} role="group" aria-label="Reactions">
      {REACTIONS.map(({ emoji, label, count }) => {
        const isPressed = pressed[emoji] ?? false
        const total = count + (isPressed ? 1 : 0)
        return (
          <Button
            key={emoji}
            variant={isPressed ? 'soft' : 'outline'}
            aria-pressed={isPressed}
            aria-label={`${label}, ${total} reactions`}
            onClick={() => setPressed((current) => ({ ...current, [emoji]: !isPressed }))}
            className="h-11 min-w-11 gap-1.5 rounded-full px-3 focus-visible:ring-ring focus-visible:ring-offset-background"
          >
            <EmojiGlyph emoji={emoji} size={20} />
            <span className="text-sm tabular-nums">{total}</span>
          </Button>
        )
      })}
    </div>
  )
}

export function EmojiGlyphExamples({ section }: EmojiGlyphExamplesProps) {
  if (section === 'basic') {
    return (
      <div className={`${FRAME} flex flex-wrap items-end gap-8`}>
        {BASIC.map((item) => (
          <Captioned key={item.emoji} {...item} />
        ))}
      </div>
    )
  }

  if (section === 'fallback') {
    return (
      <div className={`${FRAME} flex flex-wrap items-end gap-10`}>
        {FALLBACK.map((item) => (
          <Captioned key={item.name} {...item} />
        ))}
      </div>
    )
  }

  if (section === 'still') {
    return (
      <div className={`${FRAME} flex flex-wrap items-end gap-10`}>
        <Captioned emoji="😂" name="animate" note="plays (unless reduced motion)" />
        <Captioned emoji="😂" name="animate={false}" note="always the Twemoji still" animate={false} />
      </div>
    )
  }

  if (section === 'reactions') return <ReactionsExample />

  if (section === 'self-hosted') {
    return (
      <div className={`${FRAME} flex flex-wrap items-center gap-6`}>
        <p className="text-base text-foreground">
          Shipped it <EmojiGlyph emoji="🔥" animatedBaseUrl="/emoji-animated" twemojiBaseUrl="/emoji" />
          <span className="sr-only">(fire)</span> thanks{' '}
          <EmojiGlyph emoji="❤️" animatedBaseUrl="/emoji-animated" twemojiBaseUrl="/emoji" />
          <span className="sr-only">(red heart)</span>
        </p>
      </div>
    )
  }

  return null
}
