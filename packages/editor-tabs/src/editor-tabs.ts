import type { AccessibilityProps } from '@refraction-ui/shared'

/** A single tab entry in the editor tab bar. */
export interface EditorTabData {
  /** Unique identifier for the tab. */
  id: string
  /** Display label (e.g. "solution.py"). */
  label: string
  /** Optional icon — a short string like an emoji or a ligature glyph. */
  icon?: string
  /** Whether the tab has unsaved changes (shows a dirty dot). */
  dirty?: boolean
  /** Whether the tab shows a close button. */
  closable?: boolean
}

export interface EditorTabsProps {
  /** The id of the currently active tab. */
  activeId?: string
}

export interface EditorTabsAPI {
  /** ARIA attributes to spread on the tab list container. */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic container props for an IDE-style editor tab bar.
 *
 * Returns `role="tablist"` plus data attributes. Each individual tab is
 * `role="tab"` with `aria-selected`; adapters spread ariaProps on the container
 * and render the tabs themselves.
 */
export function createEditorTabs(props: EditorTabsProps = {}): EditorTabsAPI {
  const { activeId } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'tablist',
  }

  const dataAttributes: Record<string, string> = {}
  if (activeId !== undefined) {
    dataAttributes['data-active-id'] = activeId
  }

  return { ariaProps, dataAttributes }
}

/**
 * Roving keyboard navigation for the editor tab bar.
 *
 * Unlike a rating scale, tabs **wrap** at the ends so you can cycle through
 * them continuously — matching standard tab-bar behaviour (similar to
 * segmented-control). Home/End jump to the first/last tab.
 *
 * - ArrowRight → next (wraps to first after last)
 * - ArrowLeft  → previous (wraps to last before first)
 * - Home       → first
 * - End        → last
 */
export function getNextTabIndex(
  currentIndex: number,
  key: string,
  count: number,
): number {
  if (count <= 0) return currentIndex

  switch (key) {
    case 'ArrowRight':
      return (currentIndex + 1) % count
    case 'ArrowLeft':
      return (currentIndex - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return currentIndex
  }
}
