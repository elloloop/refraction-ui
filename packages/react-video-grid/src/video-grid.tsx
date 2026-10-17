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
import {
  VideoTile,
  type VideoTileData,
  type VideoTileProps,
} from '@refraction-ui/react-video-tile'

export type { VideoGridLayout, VideoTileData }

/** Where VideoGrid places a tile. */
export type VideoGridRegion = 'grid' | 'spotlight' | 'filmstrip'

/** What VideoGrid knows about a tile it is about to render. */
export interface VideoGridTileContext {
  /** Where the tile sits: the uniform grid, the speaker-view spotlight or its filmstrip. */
  region: VideoGridRegion
  /**
   * The props VideoGrid gives its own `<VideoTile>` — the participant's state
   * cues, the media from `renderMedia` and the region's sizing. Spread them
   * onto a custom tile to keep those cues and add your own (a `menu`, say).
   */
  tileProps: VideoTileProps
}

export interface VideoGridProps<T extends VideoTileData = VideoTileData>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /**
   * Participants to render as tiles. Extra fields on your participant type
   * (a media track, say) reach `renderMedia` and `renderTile` typed.
   */
  participants: T[]
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
  /**
   * Live media for a participant — typically a `<video>` with a ref that
   * attaches the participant's stream. Returning `null` (or omitting the
   * prop) shows the avatar fallback. VideoGrid stays transport-agnostic: it
   * never touches a stream itself.
   */
  renderMedia?: (participant: T, context: { region: VideoGridRegion }) => React.ReactNode
  /**
   * Replace a whole tile. Receives the props VideoGrid would pass to its own
   * `<VideoTile>`; return a tile of your own, or
   * `<VideoTile {...context.tileProps} menu={…} />` to extend the default.
   */
  renderTile?: (participant: T, context: VideoGridTileContext) => React.ReactNode
}

function tilePropsFor<T extends VideoTileData>(
  participant: T,
  region: VideoGridRegion,
  renderMedia: VideoGridProps<T>['renderMedia'],
): VideoTileProps {
  return {
    name: participant.name,
    micState: participant.micState ?? 'on',
    speaking: participant.speaking,
    pinned: participant.pinned,
    handRaised: participant.handRaised,
    screenShare: participant.screenShare,
    avatarUrl: participant.avatarUrl,
    mediaSlot: renderMedia?.(participant, { region }) ?? undefined,
    // The spotlight's height is set by the layout; a 16:9 box would overflow it.
    fill: region === 'spotlight',
  }
}

function VideoGridInner<T extends VideoTileData>(
  {
    participants,
    layout = 'auto',
    spotlightId,
    renderMedia,
    renderTile,
    className,
    style,
    ...props
  }: VideoGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const count = participants.length

  // Resolve effective layout: 'auto' with ≤1 participant shows speaker view.
  const effectiveLayout: VideoGridLayout =
    layout === 'auto' ? (count <= 1 ? 'speaker' : 'grid') : layout

  const api = createVideoGrid({ layout: effectiveLayout })
  const columns = computeGridColumns(count)

  const tile = (participant: T, region: VideoGridRegion): React.ReactNode => {
    const tileProps = tilePropsFor(participant, region, renderMedia)
    return renderTile ? renderTile(participant, { region, tileProps }) : <VideoTile {...tileProps} />
  }

  if (effectiveLayout === 'speaker') {
    const spotlightParticipant =
      participants.find((p) => p.id === spotlightId) ?? participants[0]
    const filmstrip = participants.filter((p) => p.id !== spotlightParticipant?.id)

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
            <React.Fragment key={spotlightParticipant.id}>
              {tile(spotlightParticipant, 'spotlight')}
            </React.Fragment>
          )}
        </div>
        {filmstrip.length > 0 && (
          <div className={videoGridFilmstripClass}>
            {filmstrip.map((p) => (
              <div key={p.id} className={videoGridFilmstripTileClass}>
                {tile(p, 'filmstrip')}
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
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, ...style }}
      {...api.ariaProps}
      {...api.dataAttributes}
      {...props}
    >
      {participants.map((p) => (
        <React.Fragment key={p.id}>{tile(p, 'grid')}</React.Fragment>
      ))}
    </div>
  )
}

/**
 * VideoGrid — adaptive participant grid for video meetings.
 *
 * Composes `<VideoTile>` tiles in a responsive CSS grid (1→6 columns based on
 * participant count) or a speaker-view layout (spotlight + filmstrip). The
 * column math lives in the headless `@refraction-ui/video-grid` core so it is
 * shared with the Astro adapter.
 *
 * Live media goes in through `renderMedia`; `renderTile` replaces or extends
 * a tile (tile options, custom chrome). Neither ties the grid to a media
 * transport.
 */
export const VideoGrid = React.forwardRef(VideoGridInner) as <
  T extends VideoTileData = VideoTileData,
>(
  props: VideoGridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement | null
