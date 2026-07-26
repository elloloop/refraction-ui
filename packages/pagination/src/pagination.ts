/**
 * @refraction-ui/pagination — headless pagination.
 *
 * Owns the *behavior* of page navigation: the windowed page range with
 * ellipses, current-page clamping, and prev/next edge semantics. It has NO UI
 * opinion — adapters render the controls and spread the ARIA objects.
 */

/** One entry of the computed page range: a page number or an ellipsis gap. */
export type PaginationItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; id: 'start' | 'end' }

/** Options for {@link createPagination}. */
export interface PaginationConfig {
  /** Current page (1-based). Clamped into `[1, totalPages]`. */
  page?: number
  /** Total number of pages. Values < 1 behave as 1. */
  totalPages?: number
  /** Pages shown on each side of the current page (default 1). */
  siblingCount?: number
  /** Accessible label for the nav landmark (default `'Pagination'`). */
  ariaLabel?: string
}

/** The computed view of a pagination control. */
export interface PaginationAPI {
  /** ARIA attributes for the root element (`role="navigation"`). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
  /** Current page after clamping (1-based). */
  page: number
  /** Total number of pages (>= 1). */
  totalPages: number
  /** Windowed range of pages and ellipses to render. */
  items: PaginationItem[]
  /** Whether "previous" navigation is possible. */
  canGoPrevious: boolean
  /** Whether "next" navigation is possible. */
  canGoNext: boolean
  /** Target page for the previous control (clamped). */
  previousPage: number
  /** Target page for the next control (clamped). */
  nextPage: number
  /** ARIA attributes for a numbered page button (`aria-current` on the current page). */
  getPageAria(page: number): Record<string, string | number | boolean>
  /** ARIA attributes for the previous control. */
  getPreviousAria(): Record<string, string | number | boolean>
  /** ARIA attributes for the next control. */
  getNextAria(): Record<string, string | number | boolean>
}

/** Clamp a 1-based page number into `[1, max(totalPages, 1)]`. */
export function clampPage(page: number, totalPages: number): number {
  const total = Math.max(1, Math.floor(totalPages))
  if (Number.isNaN(page)) return 1
  return Math.min(Math.max(1, Math.floor(page)), total)
}

function pageItem(page: number): PaginationItem {
  return { type: 'page', page }
}

function pageRange(start: number, end: number): PaginationItem[] {
  const items: PaginationItem[] = []
  for (let p = start; p <= end; p++) items.push(pageItem(p))
  return items
}

/**
 * Compute the windowed page range with ellipses.
 *
 * Always shows the first and last page plus `siblingCount` pages on each side
 * of the current page; gaps of more than one page collapse into an ellipsis.
 * Small totals render every page (no ellipses).
 */
export function getPaginationItems(
  current: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  const total = Math.max(0, Math.floor(totalPages))
  if (total === 0) return []

  // first + last + current + 2 siblings + 2 ellipses
  const maxVisibleWithoutEllipsis = siblingCount * 2 + 5
  if (total <= maxVisibleWithoutEllipsis) return pageRange(1, total)

  const currentPage = clampPage(current, total)
  const leftSibling = Math.max(currentPage - siblingCount, 1)
  const rightSibling = Math.min(currentPage + siblingCount, total)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount
    return [...pageRange(1, leftCount), { type: 'ellipsis', id: 'end' }, pageItem(total)]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblingCount
    return [
      pageItem(1),
      { type: 'ellipsis', id: 'start' },
      ...pageRange(total - rightCount + 1, total),
    ]
  }

  return [
    pageItem(1),
    { type: 'ellipsis', id: 'start' },
    ...pageRange(leftSibling, rightSibling),
    { type: 'ellipsis', id: 'end' },
    pageItem(total),
  ]
}

/**
 * createPagination — the framework-agnostic view of a pagination control:
 * ARIA objects for the nav landmark and controls, plus the clamped
 * current/total and prev/next edge semantics. Adapters own the page state
 * (controlled/uncontrolled) and call this per render.
 */
export function createPagination(config: PaginationConfig = {}): PaginationAPI {
  const totalPages = Math.max(1, Math.floor(config.totalPages ?? 1))
  const page = clampPage(config.page ?? 1, totalPages)
  const siblingCount = Math.max(0, Math.floor(config.siblingCount ?? 1))

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  return {
    ariaProps: {
      role: 'navigation',
      'aria-label': config.ariaLabel ?? 'Pagination',
    },
    dataAttributes: {
      'data-page': String(page),
      'data-total-pages': String(totalPages),
    },
    page,
    totalPages,
    items: getPaginationItems(page, totalPages, siblingCount),
    canGoPrevious,
    canGoNext,
    previousPage: canGoPrevious ? page - 1 : page,
    nextPage: canGoNext ? page + 1 : page,
    getPageAria(p): Record<string, string | number | boolean> {
      return p === page ? { 'aria-current': 'page' } : {}
    },
    getPreviousAria(): Record<string, string | number | boolean> {
      return { 'aria-label': 'Previous page' }
    },
    getNextAria(): Record<string, string | number | boolean> {
      return { 'aria-label': 'Next page' }
    },
  }
}
