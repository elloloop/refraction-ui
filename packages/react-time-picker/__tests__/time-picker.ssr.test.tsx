import { describe, it, expect, afterEach, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { TimePicker, type TimePickerProps } from '../src/index.js'
import { stubRuntimeLocale } from './stub-runtime-locale.js'

const render = (props: TimePickerProps = {}) =>
  renderToString(<TimePicker aria-label="Start time" {...props} />)

const t = (h: number, m = 0) => h * 60 + m

describe('TimePicker (SSR)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a closed combobox input wired to a hidden listbox', () => {
    const html = render({ hourCycle: 24 })
    expect(html).toContain('role="combobox"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('aria-haspopup="listbox"')
    expect(html).toContain('aria-label="Start time"')
    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1]
    expect(controls).toBeTruthy()
    expect(html).toMatch(new RegExp(`<ul id="${controls}" role="listbox" aria-label="Suggested times" hidden`))
    expect(html).not.toContain('aria-activedescendant')
    expect(html).not.toContain('aria-invalid')
  })

  it('renders one option per step (96 for the default 15 minutes)', () => {
    const html = render({ hourCycle: 24 })
    expect((html.match(/role="option"/g) ?? []).length).toBe(96)
  })

  it('honours step, min and max', () => {
    const html = render({ hourCycle: 24, step: 30, min: t(9), max: t(11) })
    expect((html.match(/role="option"/g) ?? []).length).toBe(5)
    expect(html).toContain('>09:00<')
    expect(html).toContain('>11:00<')
  })

  it('formats the value on the chosen hour cycle', () => {
    expect(render({ value: t(21, 30), hourCycle: 24 })).toContain('value="21:30"')
    expect(render({ value: t(21, 30), hourCycle: 12 })).toContain('value="9:30 PM"')
    expect(render({ defaultValue: t(9), hourCycle: 12 })).toContain('value="9:00 AM"')
  })

  it('takes the hour cycle from the locale when not forced', () => {
    expect(render({ value: t(21, 30), locale: 'en-US' })).toContain('value="9:30 PM"')
    expect(render({ value: t(21, 30), locale: 'en-GB' })).toContain('value="21:30"')
  })

  it.each(['en-GB', 'de-DE', 'en-US'])(
    'renders the default (en-US) clock without a locale, whatever the server locale (%s)',
    (serverLocale) => {
      stubRuntimeLocale(serverLocale)
      const html = render({ value: t(21, 30), step: 60 })
      expect(html).toContain('value="9:30 PM"')
      expect(html).toContain('>12:00 AM<')
      expect(html).not.toContain('>00:00<')
    },
  )

  it('an explicit locale wins over the server locale', () => {
    stubRuntimeLocale('en-US')
    expect(render({ value: t(21, 30), locale: 'en-GB' })).toContain('value="21:30"')
  })

  it('uses custom day-period labels', () => {
    const html = render({ value: t(21), hourCycle: 12, meridiemLabels: { am: 'a. m.', pm: 'p. m.' } })
    expect(html).toContain('value="9:00 p. m."')
  })

  it('renders an empty field for a null value', () => {
    expect(render({ value: null })).toContain('value=""')
  })

  it('marks the committed option selected with a check, not colour alone', () => {
    const html = render({ value: t(10), hourCycle: 24, step: 60, min: t(9), max: t(11) })
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1)
    expect(html).toMatch(/aria-selected="true" data-state="checked"[^>]*font-medium[^>]*><span[^>]*aria-hidden="true"><svg/)
  })

  it('shows durations after a start time as one contiguous label', () => {
    const html = render({ hourCycle: 24, start: t(10), step: 30, max: t(11, 30) })
    expect(html).toContain('>10:30<')
    expect(html).toContain('(30 min)')
    expect(html).toContain('(1 h 30 min)')
    expect(html).not.toContain('>10:00<')
  })

  it('forwards native input props to the input and className to the root', () => {
    const html = render({ id: 'start', placeholder: 'e.g. 9:30', className: 'w-48', disabled: true })
    expect(html).toContain('id="start"')
    expect(html).toContain('placeholder="e.g. 9:30"')
    expect(html).toContain('disabled=""')
    expect(html).toMatch(/<div class="relative w-full w-48" data-state="closed">/)
  })

  it('submits a 24-hour HH:mm value through a hidden input when named', () => {
    const html = render({ name: 'start', value: t(21, 30), hourCycle: 12 })
    expect(html).toContain('type="hidden" name="start" value="21:30"')
    expect(render({ value: t(9) })).not.toContain('type="hidden"')
  })

  it('applies the focus-visible ring and rem-based text', () => {
    const html = render()
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('focus-visible:ring-ring')
    expect(html).toContain('text-sm')
  })

  it('keeps a polite live region for validation messages', () => {
    expect(render()).toMatch(/<p id="[^"]+" aria-live="polite"><\/p>/)
  })
})
