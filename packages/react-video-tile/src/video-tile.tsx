import * as React from 'react'
import {
  createVideoTile,
  getInitials,
  videoTileVariants,
  videoTileNameChipClass,
  videoTileMicIconClass,
  videoTileAvatarFallbackClass,
  videoTileAvatarCircleClass,
  videoTileReactionBadgeClass,
  type VideoTileMicState,
  type VideoTileData,
} from '@refraction-ui/video-tile'
import { cn } from '@refraction-ui/shared'

export type { VideoTileMicState, VideoTileData }

export interface VideoTileProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
  /** Participant display name — shown in the name chip and used for initials. */
  name: string
  /** Current microphone state. Defaults to 'on'. */
  micState?: VideoTileMicState
  /** Whether the participant is actively speaking. Adds an emerald ring. */
  speaking?: boolean
  /** Whether the tile is pinned in the grid. Adds a primary ring. */
  pinned?: boolean
  /** URL of the participant's avatar image, used in the fallback circle. */
  avatarUrl?: string
  /**
   * Media slot — pass a `<video>` element (or any ReactNode) to render as the
   * tile's background media layer. When omitted, an avatar fallback is shown.
   */
  mediaSlot?: React.ReactNode
  /** Optional emoji/reaction badge rendered at the top-right of the tile. */
  reaction?: React.ReactNode
}

/**
 * VideoTile — a single participant tile for a video meeting grid.
 *
 * Renders a `role="group"` container with an aspect-video aspect ratio.
 * If a `mediaSlot` is provided it fills the tile; otherwise an avatar fallback
 * with initials is centred on a muted background.
 *
 * Overlays:
 * - Name chip (bottom-left) with optional mic-muted indicator
 * - Speaking ring (emerald) when `speaking` is true
 * - Pinned ring (primary) when `pinned` is true
 * - Reaction badge (top-right) when `reaction` is provided
 *
 * Logic and styles come from the headless `@refraction-ui/video-tile` core.
 */
export const VideoTile = React.forwardRef<HTMLDivElement, VideoTileProps>(
  (
    {
      name,
      micState = 'on',
      speaking = false,
      pinned = false,
      avatarUrl,
      mediaSlot,
      reaction,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createVideoTile({ speaking, pinned })
    const initials = getInitials(name)
    const isMuted = micState === 'muted'

    return (
      <div
        ref={ref}
        className={cn(
          videoTileVariants({
            speaking: speaking ? 'true' : 'false',
            pinned: pinned ? 'true' : 'false',
          }),
          className,
        )}
        aria-label={name}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {/* Media layer */}
        {mediaSlot != null ? (
          <div className="absolute inset-0 h-full w-full object-cover">
            {mediaSlot}
          </div>
        ) : (
          /* Avatar fallback */
          <div className={videoTileAvatarFallbackClass}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className={videoTileAvatarCircleClass}
              />
            ) : (
              <div className={videoTileAvatarCircleClass} aria-hidden="true">
                {initials}
              </div>
            )}
          </div>
        )}

        {/* Reaction badge (top-right) */}
        {reaction != null && (
          <div className={videoTileReactionBadgeClass} aria-hidden="true">
            {reaction}
          </div>
        )}

        {/* Name chip (bottom-left) */}
        <div className={videoTileNameChipClass}>
          <span>{`${name}${isMuted ? '' : ''}`}</span>
          {isMuted && (
            <span className={videoTileMicIconClass} aria-label="Microphone muted">
              {/* Inline SVG mic-off icon — no external icon dep */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="2" y1="2" x2="22" y2="22" />
                <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                <path d="M5 10v2a7 7 0 0 0 12 5" />
                <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </span>
          )}
        </div>
      </div>
    )
  },
)

VideoTile.displayName = 'VideoTile'
