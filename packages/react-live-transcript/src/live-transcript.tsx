import * as React from 'react'
import {
  createLiveTranscript,
  groupConsecutiveBySpeaker,
  interimLineAriaProps,
  liveTranscriptVariants,
  transcriptBlockVariants,
  transcriptJumpToLiveBarClass,
  transcriptJumpToLiveButtonClass,
  transcriptSpeakerRowClass,
  transcriptSpeakerNameClass,
  transcriptTimestampClass,
  transcriptTextLineVariants,
  DEFAULT_INTERIM_LABEL,
  DEFAULT_JUMP_TO_LIVE_LABEL,
  type TranscriptEntry,
} from '@refraction-ui/live-transcript'
import { cn } from '@refraction-ui/shared'
import { useAutoFollow } from './use-auto-follow.js'

export type { TranscriptEntry }

export interface LiveTranscriptProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
  /**
   * The ordered list of transcript entries to display. Build it with
   * `applyTranscriptUpdate` to replace interim lines with their finals.
   */
  entries: TranscriptEntry[]
  /** Tightens spacing between speaker blocks. */
  compact?: boolean
  /**
   * Keep the newest line in view as entries arrive. Scrolling up to read
   * earlier lines pauses it and shows a "jump to live" control; scrolling
   * back to the bottom, or the control, resumes it. Give the panel a height
   * (e.g. `className="h-80"`) so it scrolls.
   */
  autoFollow?: boolean
  /** Label of the jump-to-live control. */
  jumpToLiveLabel?: string
  /** Screen-reader suffix read after an interim line. */
  interimLabel?: string
}

function IconArrowDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

/**
 * LiveTranscript — a speaker-attributed transcript panel for audio rooms and
 * meetings.
 *
 * Consecutive entries from the same speaker are merged into a single block
 * (one speaker header followed by all their text lines) so the panel stays
 * readable. On a two-sided transcript (`side: 'me' | 'them'`) each side sits
 * at its own edge. Interim lines are drawn softer with a dotted underline and
 * are kept out of announcements until their final line replaces them. The
 * container carries `role="log"` and `aria-live="polite"` so screen readers
 * announce new entries without interrupting the user.
 */
export const LiveTranscript = React.forwardRef<
  HTMLDivElement,
  LiveTranscriptProps
>(function LiveTranscript(
  {
    entries,
    compact = false,
    autoFollow = false,
    jumpToLiveLabel = DEFAULT_JUMP_TO_LIVE_LABEL,
    interimLabel = DEFAULT_INTERIM_LABEL,
    className,
    onScroll,
    tabIndex,
    ...props
  },
  ref,
) {
  const api = createLiveTranscript()
  const blocks = React.useMemo(
    () => groupConsecutiveBySpeaker(entries),
    [entries],
  )
  const compactVariant = compact ? 'true' : 'false'
  const follow = useAutoFollow(autoFollow, entries)
  const { containerRef } = follow

  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref, containerRef],
  )

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    follow.onScroll()
    onScroll?.(event)
  }

  return (
    <div
      ref={mergedRef}
      className={cn(liveTranscriptVariants({ compact: compactVariant }), className)}
      {...api.ariaProps}
      {...api.dataAttributes}
      data-following={autoFollow ? String(follow.following) : undefined}
      // The panel scrolls, so it must be reachable by keyboard to be scrolled.
      tabIndex={tabIndex ?? 0}
      onScroll={handleScroll}
      {...props}
    >
      {blocks.map((block, blockIndex) => (
        <div
          key={`${block.speaker}-${blockIndex}`}
          className={transcriptBlockVariants({
            compact: compactVariant,
            side: block.side ?? 'none',
          })}
          data-side={block.side}
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
          {block.lines.map((line) =>
            line.interim ? (
              // Keyed apart from its final, so the final is a new line and
              // the log announces it once.
              <p
                key={`${line.id}:interim`}
                className={transcriptTextLineVariants({ interim: 'true' })}
                data-interim="true"
                {...interimLineAriaProps}
              >
                {line.text}
                <span className="sr-only">{` (${interimLabel})`}</span>
              </p>
            ) : (
              <p
                key={`${line.id}:final`}
                className={transcriptTextLineVariants({ interim: 'false' })}
              >
                {line.text}
              </p>
            ),
          )}
        </div>
      ))}
      {autoFollow && !follow.following && (
        <div className={transcriptJumpToLiveBarClass} aria-live="off">
          <button
            ref={follow.jumpRef}
            type="button"
            className={transcriptJumpToLiveButtonClass}
            onClick={follow.jumpToLive}
          >
            <IconArrowDown />
            {jumpToLiveLabel}
          </button>
        </div>
      )}
    </div>
  )
})
