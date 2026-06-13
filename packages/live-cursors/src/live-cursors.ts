/** Data for a single collaborator cursor. */
export type CursorData = {
  id: string
  name: string
  x: number
  y: number
  color?: string
}

/**
 * A fixed palette of 8 hex colors for distinguishing collaborator cursors.
 * Each color is vivid enough to be visible against both light and dark surfaces.
 */
export const CURSOR_COLORS: string[] = [
  '#E94560', // red
  '#F57C00', // orange
  '#F9C840', // yellow
  '#4CAF50', // green
  '#00ACC1', // cyan
  '#5C6BC0', // indigo
  '#AB47BC', // purple
  '#EC407A', // pink
]

/**
 * Assign a stable color to a cursor.
 *
 * When `index` is supplied the color is simply `CURSOR_COLORS[index % length]`
 * (deterministic for ordered participant lists). Otherwise a lightweight
 * djb2-style hash of the `id` string is used so the same id always maps to the
 * same color across renders without using Math.random or Date.now.
 */
export function assignCursorColor(id: string, index?: number): string {
  if (index !== undefined) {
    return CURSOR_COLORS[index % CURSOR_COLORS.length]
  }

  // djb2 hash — deterministic, no side-effects
  let hash = 5381
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash) ^ id.charCodeAt(i)
    hash = hash >>> 0 // keep unsigned 32-bit
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

export interface LiveCursorsAPI {
  /** ARIA attributes to spread on the overlay container. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic props for the live-cursors overlay.
 *
 * Cursors are purely decorative real-time presence indicators — aria-hidden
 * true keeps them out of the accessibility tree. The group role is present for
 * semantic correctness should a developer choose to un-hide it.
 */
export function createLiveCursors(): LiveCursorsAPI {
  const ariaProps: Record<string, string | number | boolean> = {
    role: 'group',
    'aria-label': 'Collaborators',
    'aria-hidden': true,
  }

  const dataAttributes: Record<string, string> = {
    'data-live-cursors': '',
  }

  return { ariaProps, dataAttributes }
}
