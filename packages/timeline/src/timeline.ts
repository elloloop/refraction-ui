import type { AccessibilityProps } from '@refraction-ui/shared'

/** Layout orientation of the timeline. */
export type TimelineOrientation = 'vertical' | 'horizontal'

/** Visual status of a single timeline item. */
export type TimelineItemStatus = 'done' | 'current' | 'upcoming' | 'default'

/** Data describing a single event in the timeline. */
export interface TimelineItemData {
  /** Unique identifier for the item. */
  id: string
  /** Primary label shown beside the marker. */
  title: string
  /** Optional timestamp / date string shown near the marker. */
  time?: string
  /** Additional detail text rendered below the title. */
  description?: string
  /** Visual status of this item. Defaults to `'default'` when omitted. */
  status?: TimelineItemStatus
}

export interface TimelineProps {
  /** Ordered list of events to display. */
  items: TimelineItemData[]
  /** Layout direction. */
  orientation?: TimelineOrientation
}

export interface TimelineAPI {
  /** ARIA attributes to spread on the list container (`role="list"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic container props for a timeline.
 *
 * Returns `role="list"` (the items carry `role="listitem"`) plus a
 * `data-orientation` attribute. The function is JSX-free so it can run in
 * any environment including server-side Node and Astro SSR.
 */
export function createTimeline(
  props: Pick<TimelineProps, 'orientation'> = {},
): TimelineAPI {
  const { orientation = 'vertical' } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'list',
  }

  const dataAttributes: Record<string, string> = {
    'data-orientation': orientation,
  }

  return { ariaProps, dataAttributes }
}

/**
 * Accessibility props for a single timeline item.
 *
 * Every item gets `role="listitem"` regardless of status so screen readers
 * announce the full list correctly.
 */
export function getTimelineItemAria(): Partial<AccessibilityProps> {
  return { role: 'listitem' }
}

/**
 * Normalise a raw list of timeline items so every entry has an explicit
 * `status`. Items without a status receive `'default'`.
 *
 * This is the single source of truth shared by every adapter — call it once
 * at render time and iterate over the result.
 */
export function resolveTimelineItems(
  items: TimelineItemData[],
): Required<TimelineItemData>[] {
  return items.map((item) => ({
    ...item,
    status: item.status ?? 'default',
    time: item.time ?? '',
    description: item.description ?? '',
  }))
}
