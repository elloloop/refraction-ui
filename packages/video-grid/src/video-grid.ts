/**
 * Layout mode for a VideoGrid.
 *
 * - 'auto'    — choose grid or speaker view based on participant count (≤1 forces speaker)
 * - 'grid'    — always render an even CSS grid of tiles
 * - 'speaker' — render one large spotlight tile + a filmstrip row for the rest
 */
export type VideoGridLayout = 'auto' | 'grid' | 'speaker'

/**
 * Bucket label that describes the rough meeting size.
 * Useful for analytics and adaptive UI decisions.
 */
export type VideoGridBucket =
  | 'solo'
  | 'pair'
  | 'small'
  | 'medium'
  | 'large'
  | 'townhall'

export interface VideoGridHeadlessProps {
  /** Desired layout mode. */
  layout?: VideoGridLayout
}

export interface VideoGridAPI {
  /** ARIA attributes to spread on the grid container. */
  ariaProps: {
    role: 'group'
  }
  /** Data attributes for CSS styling hooks. */
  dataAttributes: {
    'data-layout': VideoGridLayout
    'data-count'?: string
  }
}

/**
 * Compute the number of CSS grid columns for N participants.
 *
 * The responsive rule mirrors easyloops meeting layouts:
 *
 * | count | columns |
 * |-------|---------|
 * | 1     | 1       |
 * | 2     | 2       |
 * | 3–4   | 2       |
 * | 5–9   | 3       |
 * | 10–16 | 4       |
 * | 17–25 | 5       |
 * | 26+   | 6       |
 */
export function computeGridColumns(count: number): number {
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  if (count <= 16) return 4
  if (count <= 25) return 5
  return 6
}

/**
 * Label the meeting size as a human-readable bucket.
 *
 * Useful for analytics events and adaptive UI decisions without
 * coupling to the exact column math.
 */
export function bucketByCount(count: number): VideoGridBucket {
  if (count <= 1) return 'solo'
  if (count <= 2) return 'pair'
  if (count <= 9) return 'small'
  if (count <= 16) return 'medium'
  if (count <= 25) return 'large'
  return 'townhall'
}

/**
 * Build the framework-agnostic ARIA and data attributes for a VideoGrid
 * container.  Adapters spread these onto their host element.
 */
export function createVideoGrid(props: VideoGridHeadlessProps = {}): VideoGridAPI {
  const { layout = 'auto' } = props

  return {
    ariaProps: {
      role: 'group',
    },
    dataAttributes: {
      'data-layout': layout,
    },
  }
}
