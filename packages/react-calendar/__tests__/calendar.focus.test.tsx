import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Calendar } from '../src/calendar.js'

const FOCUS_RING = ['focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring']

/** The class list of every `<button>` in the SSR markup, in document order. */
function buttonClasses(html: string): string[][] {
  return [...html.matchAll(/<button[^>]*class="([^"]*)"/g)].map((match) => match[1].split(/\s+/))
}

describe('Calendar focus rings (React SSR)', () => {
  const html = renderToString(
    React.createElement(Calendar, {
      month: new Date(2025, 5, 1),
      value: new Date(2025, 5, 10),
      disabledDates: [new Date(2025, 5, 15)],
    }),
  )

  it('renders both month buttons and all 42 days with a focus ring', () => {
    const buttons = buttonClasses(html)
    // Previous month, next month, then the six-week day grid.
    expect(buttons).toHaveLength(2 + 42)
    for (const classes of buttons) {
      expect(classes).toEqual(expect.arrayContaining(FOCUS_RING))
    }
  })

  it('keeps the focus ring on the selected day', () => {
    const selected = [...html.matchAll(/<button[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => tag.includes('aria-selected="true"'))
    expect(selected).toHaveLength(1)
    const classes = selected[0].match(/class="([^"]*)"/)![1].split(/\s+/)
    expect(classes).toEqual(expect.arrayContaining(['bg-primary', ...FOCUS_RING]))
  })
})
