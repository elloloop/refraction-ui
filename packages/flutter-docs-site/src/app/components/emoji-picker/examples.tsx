'use client'
import { useState } from 'react'
import { EmojiPicker } from '@refraction-ui/react-emoji-picker'
interface EmojiPickerExamplesProps { section: 'basic' }
export function EmojiPickerExamples({ section }: EmojiPickerExamplesProps) {
  const [emoji, setEmoji] = useState('')
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4">
          <EmojiPicker onSelect={(e) => setEmoji(e)} />
          {emoji && <p className="text-sm text-muted-foreground">Selected: {emoji}</p>}
        </div>
      </div>
    )
  }
  return null
}
