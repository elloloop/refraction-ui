import * as React from 'react'
import {
  createSlotPicker,
  slotsForDay,
  isSlotSelected,
  slotPickerVariants,
  slotPickerDayRowClass,
  slotPickerDayVariants,
  slotPickerGridClass,
  slotPickerSlotVariants,
  slotPickerSectionLabelClass,
  slotPickerTimezoneClass,
  type SlotDay,
  type SlotSelection,
} from '@refraction-ui/slot-picker'
import { cn } from '@refraction-ui/shared'

export type { SlotDay, SlotSelection }

export interface SlotPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'results' | 'color' | 'content' | 'defaultValue' | 'onChange'> {
  /** The list of days to show as chips. */
  days: SlotDay[]
  /** Map of dayId → available time slot strings. */
  slotsByDay: Record<string, string[]>
  /** Controlled selection value. */
  value?: SlotSelection
  /** Initial selection for uncontrolled usage. */
  defaultValue?: SlotSelection
  /** Called when the user picks a day + slot. */
  onChange?: (selection: SlotSelection) => void
  /** Label shown beside the "Pick a time" heading (e.g. "Eastern Time"). */
  timezoneLabel?: string
  /** Slot strings that should be rendered as disabled. */
  disabledSlots?: string[]
}

/**
 * SlotPicker — a Calendly-style day + time-slot booking picker.
 *
 * Renders a row of day chips (radiogroup) and a grid of time-slot buttons
 * (radiogroup) for the currently-selected day. Supports controlled (`value`)
 * and uncontrolled (`defaultValue`) usage. Selecting a day clears the slot
 * when the previously-chosen slot is not available on the new day.
 */
export const SlotPicker = React.forwardRef<HTMLDivElement, SlotPickerProps>(
  (
    {
      days,
      slotsByDay,
      value: valueProp,
      defaultValue,
      onChange,
      timezoneLabel,
      disabledSlots = [],
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = valueProp !== undefined
    const [internal, setInternal] = React.useState<SlotSelection | undefined>(
      defaultValue,
    )
    const value = isControlled ? valueProp : internal

    const selectedDayId = value?.dayId

    const handleDaySelect = React.useCallback(
      (dayId: string) => {
        const slots = slotsForDay(slotsByDay, dayId)
        // Keep the slot only if it's still available on the new day.
        const keepSlot =
          value?.slot && slots.includes(value.slot) ? value.slot : undefined
        const next: SlotSelection | undefined = keepSlot
          ? { dayId, slot: keepSlot }
          : undefined

        if (!isControlled) setInternal(next)
        if (next) onChange?.(next)
      },
      [isControlled, onChange, slotsByDay, value],
    )

    const handleSlotSelect = React.useCallback(
      (slot: string) => {
        if (!selectedDayId) return
        const next: SlotSelection = { dayId: selectedDayId, slot }
        if (!isControlled) setInternal(next)
        onChange?.(next)
      },
      [isControlled, onChange, selectedDayId],
    )

    const api = createSlotPicker()
    const currentSlots = selectedDayId ? slotsForDay(slotsByDay, selectedDayId) : []

    return (
      <div
        ref={ref}
        className={cn(slotPickerVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {/* Day row */}
        <div>
          <p className={slotPickerSectionLabelClass}>Pick a day</p>
          <div role="radiogroup" aria-label="Pick a day" className={cn(slotPickerDayRowClass, 'mt-2')}>
            {days.map((day) => {
              const isSelected = selectedDayId === day.id
              return (
                <button
                  key={day.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-state={isSelected ? 'checked' : 'unchecked'}
                  className={slotPickerDayVariants({
                    selected: isSelected ? 'true' : 'false',
                  })}
                  onClick={() => handleDaySelect(day.id)}
                >
                  <span className="text-xs">{day.weekday}</span>
                  <span className="text-base font-bold leading-none">{day.dayNum}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Slot grid */}
        {selectedDayId && (
          <div>
            <p className={slotPickerSectionLabelClass}>
              Pick a time
              {timezoneLabel && (
                <span className={slotPickerTimezoneClass}>{timezoneLabel}</span>
              )}
            </p>
            <div role="radiogroup" aria-label="Pick a time" className={cn(slotPickerGridClass, 'mt-2')}>
              {currentSlots.map((slot) => {
                const isSelected = isSlotSelected(value, selectedDayId, slot)
                const isDisabled = disabledSlots.includes(slot)
                return (
                  <button
                    key={slot}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-disabled={isDisabled || undefined}
                    data-state={isSelected ? 'checked' : 'unchecked'}
                    className={slotPickerSlotVariants({
                      selected: isSelected ? 'true' : 'false',
                      disabled: isDisabled ? 'true' : 'false',
                    })}
                    onClick={() => !isDisabled && handleSlotSelect(slot)}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  },
)

SlotPicker.displayName = 'SlotPicker'
