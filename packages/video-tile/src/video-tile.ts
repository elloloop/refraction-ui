/** Microphone state for a video participant. */
export type VideoTileMicState = 'on' | 'muted'

/** Data describing a video meeting participant tile. */
export interface VideoTileData {
  /** Unique participant identifier. */
  id: string
  /** Display name shown in the name chip. */
  name: string
  /** Current microphone state. Defaults to 'on'. */
  micState?: VideoTileMicState
  /** Whether the participant is currently speaking (active audio). */
  speaking?: boolean
  /** Whether the tile is pinned in the grid. */
  pinned?: boolean
  /** Avatar image shown when the tile has no media. */
  avatarUrl?: string
  /** Whether the participant has raised their hand. */
  handRaised?: boolean
  /** Whether the tile carries a shared screen rather than a camera. */
  screenShare?: boolean
}

/** Text the tile announces and shows. Override for localisation. */
export interface VideoTileLabels {
  /** Name of the mic-off indicator. */
  muted: string
  /** Name of the active-speaker sound-wave indicator. */
  speaking: string
  /** Name of the raised-hand badge. */
  handRaised: string
  /** Name of the pinned badge. */
  pinned: string
  /** Visible suffix and accessible qualifier of a shared-screen tile. */
  screenShare: string
}

export const videoTileDefaultLabels: VideoTileLabels = {
  muted: 'Microphone muted',
  speaking: 'Speaking',
  handRaised: 'Hand raised',
  pinned: 'Pinned',
  screenShare: 'Presenting',
}

/**
 * Which state the tile edge highlights. Speaking wins over pinned: the edge is
 * the live cue, while a pinned tile keeps its pin badge either way.
 */
export type VideoTileEmphasis = 'speaking' | 'pinned' | 'none'

export interface VideoTileHeadlessProps {
  /** Whether the participant is actively speaking. */
  speaking?: boolean
  /** Whether the tile is pinned in the grid. */
  pinned?: boolean
  /** Whether the participant has raised their hand. */
  handRaised?: boolean
  /** Whether the tile carries a shared screen. */
  screenShare?: boolean
}

export interface VideoTileAPI {
  /** Data attributes for styling hooks — spread onto the tile container. */
  dataAttributes: {
    'data-speaking': string
    'data-pinned': string
    'data-hand-raised': string
    'data-screen-share': string
  }
  /** ARIA props — spread onto the tile container. */
  ariaProps: {
    role: 'group'
  }
  /** The state the tile edge highlights. */
  emphasis: VideoTileEmphasis
}

/** Resolve the edge highlight for a tile's state. */
export function getVideoTileEmphasis(
  props: Pick<VideoTileHeadlessProps, 'speaking' | 'pinned'>,
): VideoTileEmphasis {
  if (props.speaking) return 'speaking'
  if (props.pinned) return 'pinned'
  return 'none'
}

/**
 * Accessible name of a tile. A shared screen is qualified so it is not
 * confused with the same person's camera tile.
 */
export function getVideoTileLabel(
  name: string,
  props: Pick<VideoTileHeadlessProps, 'screenShare'> = {},
  labels: Pick<VideoTileLabels, 'screenShare'> = videoTileDefaultLabels,
): string {
  return props.screenShare ? `${name} (${labels.screenShare})` : name
}

/**
 * Derive framework-agnostic data attributes and ARIA props for a VideoTile.
 *
 * Adapters spread `dataAttributes` and `ariaProps` onto the tile container so
 * CSS selectors and assistive technology can reflect the current participant
 * state without coupling to a specific framework.
 */
export function createVideoTile(props: VideoTileHeadlessProps = {}): VideoTileAPI {
  const { speaking = false, pinned = false, handRaised = false, screenShare = false } = props

  return {
    dataAttributes: {
      'data-speaking': speaking ? 'true' : 'false',
      'data-pinned': pinned ? 'true' : 'false',
      'data-hand-raised': handRaised ? 'true' : 'false',
      'data-screen-share': screenShare ? 'true' : 'false',
    },
    ariaProps: {
      role: 'group',
    },
    emphasis: getVideoTileEmphasis({ speaking, pinned }),
  }
}

/**
 * Derive up to two uppercase initials from a display name.
 *
 * Splits on whitespace and takes the first character of the first two words.
 * Single-word names produce a single initial.
 *
 * @example
 * getInitials('Maya Goldberg') // 'MG'
 * getInitials('Alice')         // 'A'
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
