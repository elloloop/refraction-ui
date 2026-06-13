import * as React from 'react'
import {
  createVideoGrid,
  computeGridColumns,
  videoGridVariants,
  videoGridSpotlightClass,
  videoGridFilmstripClass,
  videoGridFilmstripTileClass,
  type VideoGridLayout,
} from '@refraction-ui/video-grid'
import { cn } from '@refraction-ui/shared'
import { VideoTile, type VideoTileData } from '@refraction-ui/react-video-tile'

export type { VideoGridLayout, VideoTileData }

export interface VideoGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** List of participant data to render as tiles. */
  participants: VideoTileData[]
  /**
   * Grid layout mode.
   * - 'auto'    — grid unless ≤1 participant (falls back to speaker)
   * - 'grid'    — always uniform CSS grid
   * - 'speaker' — spotlight for `spotlightId` (or first participant) + filmstrip
   */
  layout?: VideoGridLayout
  /**
   * Participant `id` to spotlight in speaker view.
   * Falls back to the first participant when omitted.
   */
  spotlightId?: string
}

/**
 * VideoGrid — adaptive participant grid for easyloops meetings.
 *
 * Composes `<VideoTile>` tiles in a responsive CSS grid (1→6 columns based on
 * participant count) or a speaker-view layout (spotlight + filmstrip). The
 * column math lives in the headless `@refraction-ui/video-grid` core so it is
 * shared with the Astro adapter.
 */
export const VideoGrid = React.forwardRef<HTMLDivElement, VideoGridProps>(
  (
    {
      participants,
      layout = 'auto',
      spotlightId,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const count = participants.length

    // Resolve effective layout: 'auto' with ≤1 participant shows speaker view.
    const effectiveLayout: VideoGridLayout =
      layout === 'auto' ? (count <= 1 ? 'speaker' : 'grid') : layout

    const api = createVideoGrid({ layout: effectiveLayout })
    const columns = computeGridColumns(count)

    const gridStyle: React.CSSProperties =
      effectiveLayout !== 'speaker'
        ? { gridTemplateColumns: `repeat(${columns}, 1fr)`, ...style }
        : { ...style }

    if (effectiveLayout === 'speaker') {
      const spotlightParticipant =
        participants.find((p) => p.id === spotlightId) ?? participants[0]
      const filmstrip = participants.filter(
        (p) => p.id !== spotlightParticipant?.id,
      )

      return (
        <div
          ref={ref}
          className={cn(videoGridVariants({ layout: 'speaker' }), className)}
          style={style}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          <div className={videoGridSpotlightClass}>
            {spotlightParticipant && (
              <VideoTile
                key={spotlightParticipant.id}
                name={spotlightParticipant.name}
                micState={spotlightParticipant.micState ?? 'on'}
                speaking={spotlightParticipant.speaking}
                pinned={spotlightParticipant.pinned}
              />
            )}
          </div>
          {filmstrip.length > 0 && (
            <div className={videoGridFilmstripClass}>
              {filmstrip.map((p) => (
                <div key={p.id} className={videoGridFilmstripTileClass}>
                  <VideoTile
                    name={p.name}
                    micState={p.micState ?? 'on'}
                    speaking={p.speaking}
                    pinned={p.pinned}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(videoGridVariants({ layout: effectiveLayout }), className)}
        style={gridStyle}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {participants.map((p) => (
          <VideoTile
            key={p.id}
            name={p.name}
            micState={p.micState ?? 'on'}
            speaking={p.speaking}
            pinned={p.pinned}
          />
        ))}
      </div>
    )
  },
)

VideoGrid.displayName = 'VideoGrid'
