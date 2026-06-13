import * as React from 'react'
import {
  visibleCues,
  createLiveCaptions,
  liveCaptionsVariants,
  liveCaptionsCueVariants,
  liveCaptionsSpeakerClass,
  type CaptionCue,
} from '@refraction-ui/live-captions'
import { cn } from '@refraction-ui/shared'

export type { CaptionCue }

export interface LiveCaptionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
  /** The full ordered list of caption cues. */
  cues: CaptionCue[]
  /**
   * Maximum number of cue lines to display at once.
   * @default 2
   */
  maxLines?: number
  /**
   * How the container is positioned in the layout.
   * @default 'static'
   */
  position?: 'static' | 'absolute'
}

/**
 * LiveCaptions — a rolling caption overlay for meeting / video surfaces.
 *
 * Renders `role="log"` with `aria-live="polite"` so screen readers announce
 * incoming cues without replaying the full history. Only the last `maxLines`
 * cues are shown; non-final (interim) cues are rendered dimmed and italic.
 * Logic and styles come from the headless `@refraction-ui/live-captions` core.
 */
export const LiveCaptions = React.forwardRef<HTMLDivElement, LiveCaptionsProps>(
  ({ cues, maxLines = 2, position = 'static', className, ...props }, ref) => {
    const { ariaProps, dataAttributes } = createLiveCaptions()
    const shown = visibleCues(cues, maxLines)

    return (
      <div
        ref={ref}
        className={cn(liveCaptionsVariants({ position }), className)}
        {...ariaProps}
        {...dataAttributes}
        {...props}
      >
        {shown.map((cue) => (
          <p
            key={cue.id}
            className={liveCaptionsCueVariants({
              interim: cue.final === false ? 'true' : 'false',
            })}
          >
            {cue.speaker ? (
              <>
                <span className={liveCaptionsSpeakerClass}>{cue.speaker}</span>
                {`: ${cue.text}`}
              </>
            ) : (
              cue.text
            )}
          </p>
        ))}
      </div>
    )
  },
)

LiveCaptions.displayName = 'LiveCaptions'
