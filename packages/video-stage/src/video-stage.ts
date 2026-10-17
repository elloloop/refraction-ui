/**
 * Headless layout and selection logic for a video call stage.
 *
 * Everything here is pure: given the participants, the stage's measured size
 * and the viewer's choices (a pin, a zoom), it decides which layout to show,
 * who takes the stage and how the grid pages. Adapters own state, measuring
 * and rendering; media never passes through this module.
 */

/**
 * Which layout the stage may use.
 * - `'auto'`      — a grid, switching to the presentation layout when someone
 *                   is pinned, a screen is shared or (with
 *                   `autoSpotlightSpeaker`) someone is speaking
 * - `'grid'`      — always the grid; pinning is not offered
 * - `'spotlight'` — always the presentation layout
 */
export type VideoStageLayout = 'auto' | 'grid' | 'spotlight'

/** The layout actually shown. */
export type VideoStageMode = 'grid' | 'spotlight'

/** The stage's own orientation, from its measured size (not the device's). */
export type VideoStageOrientation = 'portrait' | 'landscape'

/** Why a participant is on the stage in the presentation layout. */
export type VideoStageFocusReason = 'pinned' | 'screen-share' | 'active-speaker' | 'layout'

/** Where the presentation layout puts the participant rail. */
export type VideoStageRailPlacement = 'side' | 'bottom'

/** Rail and control sizing: compact on a narrow stage. */
export type VideoStageDensity = 'compact' | 'regular'

/** Scroll axis of an overflowing grid or rail. */
export type VideoStageScrollAxis = 'none' | 'vertical' | 'horizontal'

/**
 * Grid arrangement.
 * - `'single'`           — one tile fills the stage
 * - `'pair-stacked'`     — two tiles, one above the other (portrait)
 * - `'pair-side'`        — two tiles side by side (landscape)
 * - `'quad'`             — three or four tiles in a 2×2 grid
 * - `'paged-vertical'`   — five or more: two columns, two rows per page, scrolling down (portrait)
 * - `'paged-horizontal'` — five or more: two rows, two columns per page, scrolling across (landscape)
 * - `'paged-strip'`      — five or more on a short landscape stage: one row, two tiles per page
 */
export type VideoStageGridShape =
  | 'single'
  | 'pair-stacked'
  | 'pair-side'
  | 'quad'
  | 'paged-vertical'
  | 'paged-horizontal'
  | 'paged-strip'

/** The fields the stage reads from a participant. */
export interface VideoStageItem {
  /** Unique participant (or shared-screen) identifier. */
  id: string
  /** Whether the participant is speaking now. */
  speaking?: boolean
  /** Whether this entry is a shared screen. */
  screenShare?: boolean
  /** Whether this is the viewer's own tile. It never becomes the active speaker. */
  local?: boolean
}

/** A measured stage size in CSS pixels. */
export interface VideoStageSize {
  width: number
  height: number
}

/** Participant count from which the grid pages instead of shrinking tiles. */
export const VIDEO_STAGE_PAGED_MIN_COUNT = 5

/** A stage narrower than this (CSS px) is narrow: the rail moves below the stage and gets compact. */
export const VIDEO_STAGE_NARROW_WIDTH = 600

/**
 * The shortest a grid row may be (CSS px) when a landscape stage pages. A
 * stage too short for two such rows pages one row at a time.
 */
export const VIDEO_STAGE_MIN_ROW_HEIGHT = 160

/** Gap between tiles (CSS px); matches the `gap-2` the styles use. */
export const VIDEO_STAGE_GAP = 8

/** The smallest a scroll thumb gets, as a percentage of its track. */
export const VIDEO_STAGE_SCROLL_THUMB_MIN_PCT = 18

function measured(size: VideoStageSize | undefined): size is VideoStageSize {
  return size !== undefined && size.width > 0 && size.height > 0
}

/**
 * Orientation of the stage from its measured size. Unmeasured (server render,
 * first paint, a hidden stage) counts as landscape.
 */
export function getVideoStageOrientation(size?: VideoStageSize): VideoStageOrientation {
  if (!measured(size)) return 'landscape'
  return size.width >= size.height ? 'landscape' : 'portrait'
}

/** Whether a stage of this size is narrow (below `VIDEO_STAGE_NARROW_WIDTH`). Unmeasured is not. */
export function isVideoStageNarrow(size?: VideoStageSize): boolean {
  return measured(size) && size.width < VIDEO_STAGE_NARROW_WIDTH
}

/** Rail and control density for a stage of this size. */
export function getVideoStageDensity(size?: VideoStageSize): VideoStageDensity {
  return isVideoStageNarrow(size) ? 'compact' : 'regular'
}

/**
 * Where the presentation layout puts the rail: beside the stage on a wide
 * landscape stage, below it when the stage is portrait or narrow.
 */
export function getVideoStageRailPlacement(size?: VideoStageSize): VideoStageRailPlacement {
  return getVideoStageOrientation(size) === 'landscape' && !isVideoStageNarrow(size)
    ? 'side'
    : 'bottom'
}

/**
 * Grid arrangement for a participant count on a stage of this size.
 *
 * Up to four tiles fill the stage. From five, tiles keep a readable size and
 * the grid pages: two columns scrolling down in portrait, two rows scrolling
 * across in landscape, or a single row when the landscape stage is too short
 * for two rows of `VIDEO_STAGE_MIN_ROW_HEIGHT`.
 */
export function getVideoStageGridShape(count: number, size?: VideoStageSize): VideoStageGridShape {
  const orientation = getVideoStageOrientation(size)
  if (count <= 1) return 'single'
  if (count === 2) return orientation === 'portrait' ? 'pair-stacked' : 'pair-side'
  if (count < VIDEO_STAGE_PAGED_MIN_COUNT) return 'quad'
  if (orientation === 'portrait') return 'paged-vertical'
  const twoRows = 2 * VIDEO_STAGE_MIN_ROW_HEIGHT + VIDEO_STAGE_GAP
  return measured(size) && size.height < twoRows ? 'paged-strip' : 'paged-horizontal'
}

/** Scroll axis of a grid arrangement. */
export function getVideoStageGridScrollAxis(shape: VideoStageGridShape): VideoStageScrollAxis {
  if (shape === 'paged-vertical') return 'vertical'
  if (shape === 'paged-horizontal' || shape === 'paged-strip') return 'horizontal'
  return 'none'
}

/** Scroll axis of the presentation rail for its placement. */
export function getVideoStageRailScrollAxis(placement: VideoStageRailPlacement): VideoStageScrollAxis {
  return placement === 'side' ? 'vertical' : 'horizontal'
}

/** `id` when a participant with it is present, else `null` — drops a stale pin or zoom. */
export function resolveVideoStageId(
  id: string | null | undefined,
  participants: readonly VideoStageItem[],
): string | null {
  if (id == null) return null
  return participants.some((p) => p.id === id) ? id : null
}

/** Ids of the shared screens, in participant order. */
export function getVideoStageScreenShareIds(participants: readonly VideoStageItem[]): string[] {
  return participants.filter((p) => p.screenShare).map((p) => p.id)
}

/**
 * The first shared screen that was not live before, or `null`. A stage pins
 * it so the newest presenter takes the stage, even over an existing pin.
 */
export function findNewScreenShare(
  previousShareIds: readonly string[],
  participants: readonly VideoStageItem[],
): string | null {
  const fresh = participants.find((p) => p.screenShare && !previousShareIds.includes(p.id))
  return fresh?.id ?? null
}

function canBeActiveSpeaker(p: VideoStageItem): boolean {
  return !p.local && !p.screenShare
}

/**
 * The active speaker, kept until someone else speaks: the first remote
 * participant speaking now, else the previous speaker while they are still
 * in the call. The viewer and shared screens never qualify, so the stage does
 * not flip to the viewer or to a screen when a pause falls silent.
 */
export function nextActiveSpeakerId(
  previousId: string | null,
  participants: readonly VideoStageItem[],
): string | null {
  const speaking = participants.find((p) => p.speaking && canBeActiveSpeaker(p))
  if (speaking) return speaking.id
  const previous = participants.find((p) => p.id === previousId)
  return previous && canBeActiveSpeaker(previous) ? previous.id : null
}

export interface VideoStageFocusInput {
  participants: readonly VideoStageItem[]
  layout: VideoStageLayout
  /** The pinned participant, if any. A stale id is ignored. */
  pinnedId?: string | null
  /** The active speaker from `nextActiveSpeakerId`. */
  activeSpeakerId?: string | null
  /** Whether `'auto'` puts the active speaker on the stage when nobody is pinned or presenting. */
  autoSpotlightSpeaker?: boolean
}

export interface VideoStageFocus {
  mode: VideoStageMode
  /** Who is on the stage; `null` in the grid. */
  focusId: string | null
  reason: VideoStageFocusReason | null
}

const GRID: VideoStageFocus = { mode: 'grid', focusId: null, reason: null }

/**
 * Who takes the stage: the pinned participant, else a shared screen, else the
 * active speaker (when `autoSpotlightSpeaker` is on). `layout: 'grid'` always
 * shows the grid. `layout: 'spotlight'` always shows the presentation layout,
 * falling back to the first remote participant (or the first of all) when
 * nobody else qualifies.
 */
export function selectVideoStageFocus(input: VideoStageFocusInput): VideoStageFocus {
  const { participants, layout, autoSpotlightSpeaker = false } = input
  if (layout === 'grid' || participants.length === 0) return GRID

  const pinnedId = resolveVideoStageId(input.pinnedId, participants)
  if (pinnedId) return { mode: 'spotlight', focusId: pinnedId, reason: 'pinned' }

  const share = participants.find((p) => p.screenShare)
  if (share) return { mode: 'spotlight', focusId: share.id, reason: 'screen-share' }

  const speakerId = resolveVideoStageId(input.activeSpeakerId, participants)
  if (speakerId && (autoSpotlightSpeaker || layout === 'spotlight')) {
    return { mode: 'spotlight', focusId: speakerId, reason: 'active-speaker' }
  }

  if (layout === 'spotlight') {
    const fallback = participants.find((p) => !p.local) ?? participants[0]
    return { mode: 'spotlight', focusId: fallback.id, reason: 'layout' }
  }
  return GRID
}

export interface VideoStageScrollMetrics {
  /** Thumb offset along the track, as a percentage. */
  offsetPct: number
  /** Thumb length, as a percentage of the track (at least `VIDEO_STAGE_SCROLL_THUMB_MIN_PCT`). */
  sizePct: number
  /** Whether there is content before the visible part. */
  canScrollBack: boolean
  /** Whether there is content after the visible part. */
  canScrollForward: boolean
}

/**
 * Scroll thumb geometry along one axis of a scroll container. Pass
 * `scrollLeft`/`clientWidth`/`scrollWidth` for a horizontal scroller, or the
 * `Top`/`Height` trio for a vertical one. Content that fits gives a full
 * thumb and no scrolling.
 */
export function getVideoStageScrollMetrics(
  scrollPosition: number,
  clientSize: number,
  scrollSize: number,
): VideoStageScrollMetrics {
  if (clientSize <= 0 || scrollSize <= clientSize + 1) {
    return { offsetPct: 0, sizePct: 100, canScrollBack: false, canScrollForward: false }
  }
  const sizePct = Math.max(VIDEO_STAGE_SCROLL_THUMB_MIN_PCT, (clientSize / scrollSize) * 100)
  const maxScroll = scrollSize - clientSize
  const position = Math.min(Math.max(scrollPosition, 0), maxScroll)
  return {
    offsetPct: (position / maxScroll) * (100 - sizePct),
    sizePct,
    canScrollBack: position > 1,
    canScrollForward: position < maxScroll - 1,
  }
}

/** Visible and announced text. Functions receive the participant's name. */
export interface VideoStageLabels {
  /** Accessible name of the stage. */
  stage: string
  /** Tile options trigger. */
  tileOptions: (name: string) => string
  /** Pin a participant to the stage. */
  spotlight: (name: string) => string
  /** Unpin the pinned participant. */
  unpin: (name: string) => string
  /** Fill the whole stage with one participant. */
  maximize: (name: string) => string
  /** Leave the maximized view — the exit button's visible text. */
  minimize: string
  /** Scroll back through the grid pages or rail. */
  previous: string
  /** Scroll on through the grid pages or rail. */
  next: string
  /** The scroll control group. */
  scroller: string
}

export const videoStageDefaultLabels: VideoStageLabels = {
  stage: 'Call stage',
  tileOptions: (name) => `Options for ${name}`,
  spotlight: (name) => `Spotlight ${name}`,
  unpin: (name) => `Unpin ${name}`,
  maximize: (name) => `Maximize ${name}`,
  minimize: 'Minimize',
  previous: 'Previous participants',
  next: 'More participants',
  scroller: 'Scroll participants',
}

export interface VideoStageState {
  mode: VideoStageMode
  size?: VideoStageSize
  focusReason?: VideoStageFocusReason | null
  zoomed?: boolean
}

export interface VideoStageAPI {
  /** Data attributes for styling hooks — spread onto the stage root. */
  dataAttributes: {
    'data-mode': VideoStageMode
    'data-orientation': VideoStageOrientation
    'data-narrow': 'true' | 'false'
    'data-zoomed': 'true' | 'false'
    'data-focus-reason'?: VideoStageFocusReason
  }
  /** ARIA props — spread onto the stage root. */
  ariaProps: {
    role: 'group'
  }
}

/** Framework-agnostic attributes for the stage root. */
export function createVideoStage(state: VideoStageState): VideoStageAPI {
  const dataAttributes: VideoStageAPI['dataAttributes'] = {
    'data-mode': state.mode,
    'data-orientation': getVideoStageOrientation(state.size),
    'data-narrow': isVideoStageNarrow(state.size) ? 'true' : 'false',
    'data-zoomed': state.zoomed ? 'true' : 'false',
  }
  if (state.focusReason) dataAttributes['data-focus-reason'] = state.focusReason
  return { dataAttributes, ariaProps: { role: 'group' } }
}
