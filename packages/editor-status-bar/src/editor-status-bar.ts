import type { AccessibilityProps } from '@refraction-ui/shared'

/** Horizontal alignment of a segment within the bar. */
export type StatusSegmentAlign = 'left' | 'right'

/** Visual tone / emphasis of a segment. */
export type StatusSegmentTone = 'default' | 'muted' | 'accent'

/** A single labelled item rendered in the status bar. */
export interface StatusSegment {
  /** Unique identifier for the segment. */
  id: string
  /** Text displayed in the segment. */
  label: string
  /** Which side of the bar this segment lives on. Defaults to `'left'`. */
  align?: StatusSegmentAlign
  /** Visual tone. Defaults to `'default'`. */
  tone?: StatusSegmentTone
}

/** Return value of {@link createEditorStatusBar}. */
export interface EditorStatusBarAPI {
  /** ARIA attributes to spread on the bar element. */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Format a cursor position as the canonical IDE string "Ln {line}, Col {col}".
 *
 * @example
 * formatCursorPosition(17, 1) // → 'Ln 17, Col 1'
 */
export function formatCursorPosition(line: number, col: number): string {
  return `Ln ${line}, Col ${col}`
}

/**
 * Partition a flat list of segments into left- and right-aligned groups,
 * preserving insertion order within each group.
 */
export function partitionSegments(segments: StatusSegment[]): {
  left: StatusSegment[]
  right: StatusSegment[]
} {
  const left: StatusSegment[] = []
  const right: StatusSegment[] = []
  for (const seg of segments) {
    if (seg.align === 'right') {
      right.push(seg)
    } else {
      left.push(seg)
    }
  }
  return { left, right }
}

/**
 * Build the framework-agnostic ARIA and data attributes for the status bar
 * container.
 *
 * The bar uses `role="status"` with `aria-live="polite"` so screen readers
 * announce updates (e.g. cursor position changes) without interrupting the
 * user's current focus.
 */
export function createEditorStatusBar(): EditorStatusBarAPI {
  const ariaProps: Partial<AccessibilityProps> = {
    role: 'status',
    'aria-live': 'polite',
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'editor-status-bar',
  }

  return { ariaProps, dataAttributes }
}
