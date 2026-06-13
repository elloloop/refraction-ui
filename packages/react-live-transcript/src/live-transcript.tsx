import * as React from 'react'
import {
  createLiveTranscript,
  groupConsecutiveBySpeaker,
  liveTranscriptVariants,
  transcriptBlockVariants,
  transcriptSpeakerRowClass,
  transcriptSpeakerNameClass,
  transcriptTimestampClass,
  transcriptTextLineClass,
  type TranscriptEntry,
} from '@refraction-ui/live-transcript'
import { cn } from '@refraction-ui/shared'

export type { TranscriptEntry }

export interface LiveTranscriptProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
  /** The ordered list of transcript entries to display. */
  entries: TranscriptEntry[]
  /** Tightens spacing between speaker blocks. */
  compact?: boolean
}

/**
 * LiveTranscript — a speaker-attributed transcript panel for audio rooms and
 * meetings.
 *
 * Consecutive entries from the same speaker are merged into a single block
 * (one speaker header followed by all their text lines) so the panel stays
 * readable. The container carries `role="log"` and `aria-live="polite"` so
 * screen readers announce new entries without interrupting the user.
 */
export const LiveTranscript = React.forwardRef<
  HTMLDivElement,
  LiveTranscriptProps
>(({ entries, compact = false, className, ...props }, ref) => {
  const api = createLiveTranscript()
  const blocks = React.useMemo(
    () => groupConsecutiveBySpeaker(entries),
    [entries],
  )
  const compactVariant = compact ? 'true' : 'false'

  return (
    <div
      ref={ref}
      className={cn(liveTranscriptVariants({ compact: compactVariant }), className)}
      {...api.ariaProps}
      {...api.dataAttributes}
      {...props}
    >
      {blocks.map((block, blockIndex) => (
        <div
          key={`${block.speaker}-${blockIndex}`}
          className={transcriptBlockVariants({ compact: compactVariant })}
        >
          <div className={transcriptSpeakerRowClass}>
            <span
              className={transcriptSpeakerNameClass}
              style={block.speakerColor ? { color: block.speakerColor } : undefined}
            >
              {block.speaker}
            </span>
            {block.timestamp && (
              <span className={transcriptTimestampClass}>{block.timestamp}</span>
            )}
          </div>
          {block.texts.map((text, textIndex) => (
            <p
              key={textIndex}
              className={transcriptTextLineClass}
            >
              {text}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
})

LiveTranscript.displayName = 'LiveTranscript'
