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
}

export interface VideoTileHeadlessProps {
  /** Whether the participant is actively speaking. */
  speaking?: boolean
  /** Whether the tile is pinned in the grid. */
  pinned?: boolean
}

export interface VideoTileAPI {
  /** Data attributes for styling hooks — spread onto the tile container. */
  dataAttributes: {
    'data-speaking': string
    'data-pinned': string
  }
  /** ARIA props — spread onto the tile container. */
  ariaProps: {
    role: 'group'
  }
}

/**
 * Derive framework-agnostic data attributes and ARIA props for a VideoTile.
 *
 * Adapters spread `dataAttributes` and `ariaProps` onto the tile container so
 * CSS selectors and assistive technology can reflect the current participant
 * state without coupling to a specific framework.
 */
export function createVideoTile(props: VideoTileHeadlessProps = {}): VideoTileAPI {
  const { speaking = false, pinned = false } = props

  return {
    dataAttributes: {
      'data-speaking': speaking ? 'true' : 'false',
      'data-pinned': pinned ? 'true' : 'false',
    },
    ariaProps: {
      role: 'group',
    },
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
