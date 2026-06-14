/** A single day chip shown in the day-selector row. */
export type SlotDay = {
  /** Unique identifier for the day (e.g. "2024-06-14"). */
  id: string
  /** Short weekday label (e.g. "Fri"). */
  weekday: string
  /** Day-of-month label (e.g. "14" or 14). */
  dayNum: string | number
}

/** The currently-selected day + time slot pair. */
export type SlotSelection = {
  /** The `id` of the selected day. */
  dayId: string
  /** The selected time slot string (e.g. "10:00 AM"). */
  slot: string
}

/**
 * Return the list of available time slots for a given day.
 * Returns an empty array when `dayId` has no entry in `slotsByDay`.
 */
export function slotsForDay(
  slotsByDay: Record<string, string[]>,
  dayId: string,
): string[] {
  return slotsByDay[dayId] ?? []
}

/**
 * Check whether a specific slot in a specific day is currently selected.
 */
export function isSlotSelected(
  value: SlotSelection | undefined,
  dayId: string,
  slot: string,
): boolean {
  return value?.dayId === dayId && value?.slot === slot
}

export interface SlotPickerAPI {
  /** ARIA attributes to spread on the root group element. */
  ariaProps: { role: 'group'; 'aria-label': string }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic root props for a slot picker.
 *
 * Returns `role="group"` with an accessible label and data attributes.
 * Adapters spread these onto their container element.
 */
export function createSlotPicker(): SlotPickerAPI {
  return {
    ariaProps: {
      role: 'group',
      'aria-label': 'Pick a time',
    },
    dataAttributes: {
      'data-component': 'slot-picker',
    },
  }
}
