/**
 * CSS custom property that carries the pane-header height.
 *
 * Side-by-side panes line up when every header reads the same value, so the
 * height lives in an inherited custom property rather than a per-instance
 * class: set it once on the split-view container and every PaneHeader inside
 * inherits it.
 */
export const PANE_HEADER_HEIGHT_VAR = '--pane-header-height'

/**
 * Default header height. Rem-based so the bar grows with the user's text size
 * (56 px at the browser default, matching the Flutter toolbar height).
 */
export const PANE_HEADER_DEFAULT_HEIGHT = '3.5rem'

/** Heading level used for the title when none is given. */
export const PANE_HEADER_DEFAULT_HEADING_LEVEL = 2

const MIN_HEADING_LEVEL = 1
const MAX_HEADING_LEVEL = 6

/** Valid HTML heading levels. */
export type PaneHeaderHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/** Heading element rendered for the title. */
export type PaneHeaderHeadingTag = `h${PaneHeaderHeadingLevel}`

/**
 * A header height: a CSS length string (`'4rem'`, `'64px'`,
 * `'var(--toolbar-h)'`) or a number of CSS pixels (the Flutter `height`
 * is in logical pixels, so a bare number keeps that meaning).
 */
export type PaneHeaderHeight = number | string

/** Characters that would break out of a single CSS declaration value. */
const UNSAFE_CSS_VALUE = /[;{}<>]/

/**
 * Normalise a `height` input into a CSS length, or `undefined` when the input
 * is missing or unusable (so the inherited / default height applies instead of
 * a broken value). Numbers must be finite and positive.
 */
export function resolvePaneHeaderHeight(height: PaneHeaderHeight | undefined): string | undefined {
  if (height === undefined) return undefined
  if (typeof height === 'number') {
    return Number.isFinite(height) && height > 0 ? `${height}px` : undefined
  }
  const trimmed = height.trim()
  if (trimmed === '' || UNSAFE_CSS_VALUE.test(trimmed)) return undefined
  return trimmed
}

/**
 * Clamp a heading level into 1–6 (rounding fractional input), falling back to
 * {@link PANE_HEADER_DEFAULT_HEADING_LEVEL} for missing or non-finite values.
 */
export function resolvePaneHeaderHeadingLevel(level: number | undefined): PaneHeaderHeadingLevel {
  if (level === undefined || !Number.isFinite(level)) return PANE_HEADER_DEFAULT_HEADING_LEVEL
  const rounded = Math.round(level)
  return Math.min(MAX_HEADING_LEVEL, Math.max(MIN_HEADING_LEVEL, rounded)) as PaneHeaderHeadingLevel
}

/**
 * Inline style that sets the shared height custom property. Spread it on the
 * split-view container (or any ancestor) so every PaneHeader inside matches:
 * `<div style={paneHeaderHeightStyle('4rem')}>`. Returns an empty object for
 * an unusable height so the default still applies.
 */
export function paneHeaderHeightStyle(height: PaneHeaderHeight | undefined): Record<string, string> {
  const resolved = resolvePaneHeaderHeight(height)
  return resolved === undefined ? {} : { [PANE_HEADER_HEIGHT_VAR]: resolved }
}

/** Element ids used to wire the title button's name and description. */
export interface PaneHeaderIds {
  /** The title text — the button's accessible name and a pane label target. */
  titleId: string
  /** The subtitle text — part of the button's description. */
  subtitleId: string
  /** The visually hidden tap hint — part of the button's description. */
  hintId: string
}

/** Derive the stable element ids for one header from a caller-supplied base id. */
export function getPaneHeaderIds(baseId: string): PaneHeaderIds {
  return {
    titleId: `${baseId}-title`,
    subtitleId: `${baseId}-subtitle`,
    hintId: `${baseId}-hint`,
  }
}

export interface PaneHeaderProps {
  /** Base id for the generated element ids (inject it — the core never invents one). */
  baseId: string
  /** Header height; omitted means "inherit the shared custom property". */
  height?: PaneHeaderHeight
  /** Heading level for the title (1–6). */
  headingLevel?: number
  /** Whether the title block is a button (the adapter passes `onTitleTap != null`). */
  interactive?: boolean
  /** Whether a subtitle is rendered. */
  hasSubtitle?: boolean
  /** Whether a tap hint is rendered for the title button. */
  hasHint?: boolean
}

export interface PaneHeaderAPI {
  /** Heading element for the title. */
  headingTag: PaneHeaderHeadingTag
  /** Element ids for the title, subtitle and hint. */
  ids: PaneHeaderIds
  /**
   * Inline style for the root: `height` reads the shared custom property (with
   * the default as fallback); a per-instance `height` overrides the property.
   */
  style: Record<string, string>
  /**
   * ARIA for the title button. The name comes from the title alone (so the
   * heading that wraps the button is named by the title too); the subtitle and
   * hint become the description.
   */
  titleButtonAriaProps: Record<string, string>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

function describedBy(ids: PaneHeaderIds, hasSubtitle: boolean, hasHint: boolean): string | undefined {
  const parts = [hasSubtitle ? ids.subtitleId : null, hasHint ? ids.hintId : null].filter(
    (part): part is string => part !== null,
  )
  return parts.length > 0 ? parts.join(' ') : undefined
}

/**
 * Build the framework-agnostic props for a PaneHeader — the fixed-height bar
 * across the top of one pane of a split view (back control, avatar, title,
 * subtitle and trailing actions). Unlike PageHeader (a wrapping page heading
 * cluster) it is a single non-wrapping row whose height is shared between
 * panes so the rule under them runs straight across.
 */
export function createPaneHeader(props: PaneHeaderProps): PaneHeaderAPI {
  const { baseId, height, headingLevel, interactive = false, hasSubtitle = false, hasHint = false } = props

  const ids = getPaneHeaderIds(baseId)
  const style: Record<string, string> = {
    height: `var(${PANE_HEADER_HEIGHT_VAR}, ${PANE_HEADER_DEFAULT_HEIGHT})`,
    ...paneHeaderHeightStyle(height),
  }

  const titleButtonAriaProps: Record<string, string> = { 'aria-labelledby': ids.titleId }
  const description = describedBy(ids, hasSubtitle, interactive && hasHint)
  if (description !== undefined) titleButtonAriaProps['aria-describedby'] = description

  return {
    headingTag: `h${resolvePaneHeaderHeadingLevel(headingLevel)}`,
    ids,
    style,
    titleButtonAriaProps,
    dataAttributes: {
      'data-slot': 'pane-header',
      'data-interactive': interactive ? 'true' : 'false',
    },
  }
}
