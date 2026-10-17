import * as React from 'react'
import {
  getEventCalendarDayRange,
  getEventCalendarSlotRange,
  type EventCalendarCreateRange,
  type EventCalendarDate,
  type EventCalendarTimeGrid,
} from '@refraction-ui/event-calendar'

/** An in-progress click / drag create. */
export type EventCalendarDrag =
  | { kind: 'slot'; date: EventCalendarDate; anchor: number; current: number }
  | { kind: 'day'; anchor: EventCalendarDate; current: EventCalendarDate }

/** The range a drag would create (both snapped through the core). */
export function getEventCalendarDragRange(
  drag: EventCalendarDrag,
  grid: EventCalendarTimeGrid,
): EventCalendarCreateRange {
  return drag.kind === 'slot'
    ? getEventCalendarSlotRange(drag.date, drag.anchor, drag.current, grid)
    : getEventCalendarDayRange(drag.anchor, drag.current)
}

export interface EventCalendarDragApi {
  drag: EventCalendarDrag | null
  /** Start a drag; it commits on the next `pointerup` anywhere and aborts on `pointercancel` / Escape. */
  begin: (drag: EventCalendarDrag) => void
  /** Move the live end of the drag (ignored when the kind does not match). */
  moveSlot: (minutes: number) => void
  moveDay: (date: EventCalendarDate) => void
}

/**
 * Click / drag create state. A click is a drag that never moved, so both go
 * through one path and produce the same snapped range. Listening on `window`
 * means releasing outside the grid still commits the drag the user sees.
 */
export function useEventCalendarDrag(
  grid: EventCalendarTimeGrid,
  onCreate: ((range: EventCalendarCreateRange) => void) | undefined,
): EventCalendarDragApi {
  const [drag, setDrag] = React.useState<EventCalendarDrag | null>(null)
  // The window listeners need the latest values without re-subscribing per move.
  const latest = React.useRef({ drag, grid, onCreate })
  latest.current = { drag, grid, onCreate }

  const active = drag !== null
  React.useEffect(() => {
    if (!active) return
    const commit = () => {
      const { drag: current, grid: currentGrid, onCreate: create } = latest.current
      setDrag(null)
      if (current) create?.(getEventCalendarDragRange(current, currentGrid))
    }
    const cancel = () => setDrag(null)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel()
    }
    window.addEventListener('pointerup', commit)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerup', commit)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('keydown', onKey)
    }
  }, [active])

  const begin = React.useCallback((next: EventCalendarDrag) => setDrag(next), [])
  const moveSlot = React.useCallback((minutes: number) => {
    setDrag((current) =>
      current?.kind === 'slot' && current.current !== minutes ? { ...current, current: minutes } : current,
    )
  }, [])
  const moveDay = React.useCallback((date: EventCalendarDate) => {
    setDrag((current) =>
      current?.kind === 'day' && current.current !== date ? { ...current, current: date } : current,
    )
  }, [])

  return { drag, begin, moveSlot, moveDay }
}

/** Whether a pointer event started on an event or another control (not an empty slot). */
export function isEventCalendarControlTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('button, [data-event-key]') !== null
}

/** Primary-button pointer presses only (no right-click / middle-click create). */
export function isEventCalendarPrimaryPress(event: React.PointerEvent): boolean {
  const PRIMARY_BUTTON = 0
  return event.button === PRIMARY_BUTTON
}
