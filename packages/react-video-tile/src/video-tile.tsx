import * as React from 'react'
import {
  createVideoTile,
  getInitials,
  getVideoTileLabel,
  videoTileDefaultLabels,
  videoTileVariants,
  videoTileMediaVariants,
  videoTileEdgeVariants,
  videoTileNameChipClass,
  videoTileNameClass,
  videoTileScreenShareLabelClass,
  videoTileMicIconClass,
  videoTileSpeakingIconClass,
  videoTileAvatarFallbackClass,
  videoTileAvatarCircleClass,
  videoTileInitialsClass,
  videoTileInitialsSvg,
  videoTileTopStartClass,
  videoTileTopEndClass,
  videoTileBadgeVariants,
  videoTileReactionBadgeClass,
  type VideoTileMicState,
  type VideoTileData,
  type VideoTileLabels,
} from '@refraction-ui/video-tile'
import { cn } from '@refraction-ui/shared'

export type { VideoTileMicState, VideoTileData, VideoTileLabels }

export interface VideoTileProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content' | 'color'> {
  /** Participant display name — shown in the name chip and used for initials. */
  name: string
  /** Current microphone state. Defaults to 'on'. */
  micState?: VideoTileMicState
  /** Whether the participant is actively speaking: a success-toned edge and a sound-wave icon. */
  speaking?: boolean
  /** Whether the tile is pinned: a primary edge and a pin badge. */
  pinned?: boolean
  /** Whether the participant has raised their hand: a hand badge at the top-left. */
  handRaised?: boolean
  /**
   * Whether the tile carries a shared screen. The name chip gains a screen
   * icon and a "Presenting" qualifier, and media is letterboxed instead of
   * cropped.
   */
  screenShare?: boolean
  /** URL of the participant's avatar image, used in the fallback circle. */
  avatarUrl?: string
  /**
   * Fill the parent instead of keeping a 16:9 aspect ratio — for a spotlight
   * or stage cell whose size the layout sets. Defaults to false.
   */
  fill?: boolean
  /**
   * Media slot — pass a `<video>` element (or any ReactNode) to render as the
   * tile's background media layer. Direct children fill the tile. When
   * omitted, an avatar fallback is shown.
   */
  mediaSlot?: React.ReactNode
  /** Optional emoji/reaction badge rendered at the top-right of the tile. */
  reaction?: React.ReactNode
  /**
   * Tile options slot, rendered at the top-right corner above the media —
   * typically a menu trigger (pin, maximise, mute for me). Interactive
   * content stays keyboard reachable; the slot adds no behaviour of its own.
   */
  menu?: React.ReactNode
  /** Override the announced and visible indicator text. */
  labels?: Partial<VideoTileLabels>
}

/** Sound-wave glyph: the non-colour active-speaker cue. Static, so it honours reduced motion. */
function SpeakingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="10" x2="4" y2="14" />
      <line x1="9" y1="6" x2="9" y2="18" />
      <line x1="14" y1="3" x2="14" y2="21" />
      <line x1="19" y1="8" x2="19" y2="16" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  )
}

function ScreenIcon() {
  return (
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
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function MicOffIcon() {
  return (
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
  )
}

/**
 * VideoTile — a single participant tile for a video meeting grid.
 *
 * Renders a `role="group"` container with a 16:9 aspect ratio (or filling
 * its parent with `fill`).
 * If a `mediaSlot` is provided it fills the tile; otherwise an avatar fallback
 * with initials is centred on a muted background.
 *
 * Overlays:
 * - Name chip (bottom-left) with the speaking sound-wave, mic-muted indicator
 *   and the "Presenting" qualifier for a shared screen
 * - Inset edge: success when speaking, primary when pinned
 * - Raised-hand badge (top-left)
 * - Reaction, pin badge and the `menu` slot (top-right)
 *
 * Logic and styles come from the headless `@refraction-ui/video-tile` core.
 */
export const VideoTile = React.forwardRef<HTMLDivElement, VideoTileProps>(
  function VideoTile(
    {
      name,
      micState = 'on',
      speaking = false,
      pinned = false,
      handRaised = false,
      screenShare = false,
      avatarUrl,
      fill = false,
      mediaSlot,
      reaction,
      menu,
      labels: labelOverrides,
      className,
      ...props
    },
    ref,
  ) {
    const labels = { ...videoTileDefaultLabels, ...labelOverrides }
    const api = createVideoTile({ speaking, pinned, handRaised, screenShare })
    const initials = getInitials(name)
    const isMuted = micState === 'muted'
    const hasTopEnd = reaction != null || pinned || menu != null
    const label = getVideoTileLabel(name, { screenShare }, labels)

    return (
      <div
        ref={ref}
        className={cn(videoTileVariants({ fill: fill ? 'true' : 'false' }), className)}
        aria-label={label}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {/* Media layer */}
        {mediaSlot != null ? (
          <div className={videoTileMediaVariants({ fit: screenShare ? 'contain' : 'cover' })}>
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
                <svg viewBox={videoTileInitialsSvg.viewBox} className={videoTileInitialsClass}>
                  <text
                    x={videoTileInitialsSvg.x}
                    y={videoTileInitialsSvg.y}
                    fontSize={videoTileInitialsSvg.fontSize}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                  >
                    {initials}
                  </text>
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Inset state edge — above the media so it is never covered or clipped */}
        <div
          className={videoTileEdgeVariants({ emphasis: api.emphasis })}
          data-emphasis={api.emphasis}
          aria-hidden="true"
        />

        {handRaised && (
          <div className={videoTileTopStartClass}>
            <span
              className={videoTileBadgeVariants({ tone: 'hand' })}
              role="img"
              aria-label={labels.handRaised}
              title={labels.handRaised}
            >
              <HandIcon />
            </span>
          </div>
        )}

        {hasTopEnd && (
          <div className={videoTileTopEndClass}>
            {reaction != null && (
              <div className={videoTileReactionBadgeClass} aria-hidden="true">
                {reaction}
              </div>
            )}
            {pinned && (
              <span
                className={videoTileBadgeVariants({ tone: 'pinned' })}
                role="img"
                aria-label={labels.pinned}
                title={labels.pinned}
              >
                <PinIcon />
              </span>
            )}
            {menu}
          </div>
        )}

        {/* Name chip (bottom-left) */}
        <div className={videoTileNameChipClass}>
          {speaking && (
            <span className={videoTileSpeakingIconClass} role="img" aria-label={labels.speaking}>
              <SpeakingIcon />
            </span>
          )}
          {screenShare && (
            <span className={videoTileScreenShareLabelClass}>
              <ScreenIcon />
            </span>
          )}
          <span className={videoTileNameClass}>{label}</span>
          {isMuted && (
            <span className={videoTileMicIconClass} role="img" aria-label={labels.muted}>
              <MicOffIcon />
            </span>
          )}
        </div>
      </div>
    )
  },
)
