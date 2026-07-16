'use client'
import { useState } from 'react'
import { EmojiPicker, nativeEmojiRenderer } from '@refraction-ui/react-emoji-picker'
interface EmojiPickerExamplesProps { section: 'basic' | 'seam' | 'stickers' }
export function EmojiPickerExamples({ section }: EmojiPickerExamplesProps) {
  const [emoji, setEmoji] = useState('')
  const [uniform, setUniform] = useState(true)
  const [picked, setPicked] = useState('')

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4">
          <EmojiPicker onSelect={(e) => setEmoji(e.emoji)} />
          {emoji && <p className="text-sm text-muted-foreground">Selected: {emoji}</p>}
        </div>
      </div>
    )
  }

  if (section === 'seam') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={uniform} onChange={(e) => setUniform(e.target.checked)} />
            Uniform Twemoji (default) — uncheck for OS-native glyphs
          </label>
          <EmojiPicker
            emojiRenderer={uniform ? undefined : nativeEmojiRenderer}
            onSelect={(e) => setEmoji(e.emoji)}
          />
          {emoji && <p className="text-sm text-muted-foreground">Selected: {emoji}</p>}
        </div>
      </div>
    )
  }

  if (section === 'stickers') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4">
          <EmojiPicker onStickerSelect={(s) => setPicked(s.label)} />
          {picked && <p className="text-sm text-muted-foreground">Sticker: {picked}</p>}
          <p className="text-xs text-muted-foreground">
            Open the ⭐ tab. The starter pack ships bundled; the pulsing heart proves the animated
            (SMIL) render path. Host packs plug in via the <code>stickerSets</code> prop.
          </p>
        </div>
      </div>
    )
  }

  return null
}
