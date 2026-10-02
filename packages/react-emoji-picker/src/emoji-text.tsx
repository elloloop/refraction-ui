import * as React from 'react'
import { unicodeEmojiRuns, type EmojiEntry } from '@refraction-ui/emoji-picker'
import { createTwemojiRenderer } from './emoji-picker.js'

export interface EmojiTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  /** Artwork is opt-in so private Unicode creates no CDN requests by default. */
  emojiArtwork?: boolean
  twemojiBaseUrl?: string
}

/** Unicode stays selectable text; artwork floats over its original font metrics. */
export const EmojiText = React.forwardRef<HTMLSpanElement, EmojiTextProps>(
  function EmojiText({ text, emojiArtwork = false, twemojiBaseUrl, ...props }, ref) {
    const renderEmoji = React.useMemo(() => createTwemojiRenderer(twemojiBaseUrl), [twemojiBaseUrl])
    if (!emojiArtwork) return <span ref={ref} {...props}>{text}</span>
    const children: React.ReactNode[] = []
    let cursor = 0
    for (const run of unicodeEmojiRuns(text, twemojiBaseUrl)) {
      children.push(text.slice(cursor, run.start))
      const entry: EmojiEntry = { emoji: run.emoji, name: run.emoji, category: 'symbols', keywords: [], shortcode: '' }
      children.push(<React.Fragment key={run.start}>{renderEmoji(entry)}</React.Fragment>)
      cursor = run.end
    }
    children.push(text.slice(cursor))
    return <span ref={ref} {...props}>{children}</span>
  },
)
