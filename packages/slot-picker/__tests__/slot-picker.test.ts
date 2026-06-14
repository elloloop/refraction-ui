import { describe, it, expect } from 'vitest'
import {
  slotsForDay,
  isSlotSelected,
  createSlotPicker,
} from '../src/index.js'

describe('slotsForDay', () => {
  const slotsByDay = {
    'day-1': ['9:00 AM', '10:00 AM', '2:00 PM'],
    'day-2': ['11:00 AM'],
  }

  it('returns the slots for a known day', () => {
    expect(slotsForDay(slotsByDay, 'day-1')).toEqual([
      '9:00 AM',
      '10:00 AM',
      '2:00 PM',
    ])
  })

  it('returns an empty array for an unknown day', () => {
    expect(slotsForDay(slotsByDay, 'day-99')).toEqual([])
  })

  it('returns an empty array when slotsByDay is empty', () => {
    expect(slotsForDay({}, 'day-1')).toEqual([])
  })
})

describe('isSlotSelected', () => {
  const value = { dayId: 'day-1', slot: '10:00 AM' }

  it('returns true for the matching day and slot', () => {
    expect(isSlotSelected(value, 'day-1', '10:00 AM')).toBe(true)
  })

  it('returns false when the day does not match', () => {
    expect(isSlotSelected(value, 'day-2', '10:00 AM')).toBe(false)
  })

  it('returns false when the slot does not match', () => {
    expect(isSlotSelected(value, 'day-1', '9:00 AM')).toBe(false)
  })

  it('returns false when value is undefined', () => {
    expect(isSlotSelected(undefined, 'day-1', '10:00 AM')).toBe(false)
  })
})

describe('createSlotPicker', () => {
  it('returns role="group" with accessible label', () => {
    const { ariaProps } = createSlotPicker()
    expect(ariaProps.role).toBe('group')
    expect(ariaProps['aria-label']).toBe('Pick a time')
  })

  it('returns a data-component attribute', () => {
    const { dataAttributes } = createSlotPicker()
    expect(dataAttributes['data-component']).toBe('slot-picker')
  })
})
