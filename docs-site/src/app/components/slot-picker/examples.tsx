'use client'

import * as React from 'react'
import { SlotPicker } from '@refraction-ui/react-slot-picker'
import type { SlotDay, SlotSelection } from '@refraction-ui/react-slot-picker'

const DAYS: SlotDay[] = [
  { id: '2024-06-10', weekday: 'Mon', dayNum: '10' },
  { id: '2024-06-11', weekday: 'Tue', dayNum: '11' },
  { id: '2024-06-12', weekday: 'Wed', dayNum: '12' },
  { id: '2024-06-13', weekday: 'Thu', dayNum: '13' },
]

const SLOTS_BY_DAY: Record<string, string[]> = {
  '2024-06-10': ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
  '2024-06-11': ['10:00 AM', '1:00 PM', '4:00 PM'],
  '2024-06-12': ['9:00 AM', '11:00 AM', '3:00 PM', '5:00 PM'],
  '2024-06-13': ['10:00 AM', '2:00 PM'],
}

interface SlotPickerExamplesProps {
  section: 'basic' | 'timezone' | 'disabled-slots'
}

export function SlotPickerExamples({ section }: SlotPickerExamplesProps) {
  if (section === 'basic') {
    return <BasicExample />
  }

  if (section === 'timezone') {
    return <TimezoneExample />
  }

  if (section === 'disabled-slots') {
    return <DisabledSlotsExample />
  }

  return null
}

function BasicExample() {
  const [selection, setSelection] = React.useState<SlotSelection | undefined>(
    undefined,
  )
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <SlotPicker
        days={DAYS}
        slotsByDay={SLOTS_BY_DAY}
        value={selection}
        onChange={setSelection}
        aria-label="Book a time slot"
      />
      {selection && (
        <p className="text-sm text-muted-foreground">
          Selected: {selection.dayId} at {selection.slot}
        </p>
      )}
    </div>
  )
}

function TimezoneExample() {
  const [selection, setSelection] = React.useState<SlotSelection | undefined>(
    { dayId: '2024-06-11', slot: '10:00 AM' },
  )
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <SlotPicker
        days={DAYS}
        slotsByDay={SLOTS_BY_DAY}
        value={selection}
        onChange={setSelection}
        timezoneLabel="Eastern Time (ET)"
        aria-label="Book a time slot"
      />
    </div>
  )
}

function DisabledSlotsExample() {
  const [selection, setSelection] = React.useState<SlotSelection | undefined>(
    { dayId: '2024-06-10', slot: '9:00 AM' },
  )
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <SlotPicker
        days={DAYS}
        slotsByDay={SLOTS_BY_DAY}
        value={selection}
        onChange={setSelection}
        disabledSlots={['10:00 AM', '2:00 PM']}
        timezoneLabel="Pacific Time (PT)"
        aria-label="Book a time slot"
      />
      <p className="text-sm text-muted-foreground">
        10:00 AM and 2:00 PM are disabled (already booked).
      </p>
    </div>
  )
}
