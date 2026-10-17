import { describe, it, expect } from 'vitest'
import { calendarNavButtonStyles, dayVariants } from '../src/calendar.styles.js'

const FOCUS_RING = ['focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring']

const classesOf = (styles: string) => styles.split(/\s+/)

describe('Calendar focus styles', () => {
  it.each(['default', 'selected', 'today', 'disabled', 'outside'] as const)(
    'gives a %s day a focus ring',
    (state) => {
      expect(classesOf(dayVariants({ state }))).toEqual(expect.arrayContaining(FOCUS_RING))
    },
  )

  it('gives the month navigation buttons a focus ring', () => {
    expect(classesOf(calendarNavButtonStyles)).toEqual(expect.arrayContaining(FOCUS_RING))
  })
})
