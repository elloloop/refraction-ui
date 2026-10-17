import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DATE_CHANGE_EVENT, initDatePickers } from '../src/date-picker-client.js'

// The browser half of the Astro DatePicker: presets resolve against the
// reader's date when the page loads and again when one is chosen.

interface PresetMarkup {
  id: string
  label: string
  days?: number
  weekday?: number
}

const DEFAULTS: PresetMarkup[] = [
  { id: 'today', label: 'Today', days: 0 },
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: 'next-week', label: 'Next week', weekday: 1 },
]

/** The markup DatePicker.astro renders, with only the attributes the script reads. */
function picker(
  inputId: string,
  {
    type = 'date',
    attrs = '',
    presets = DEFAULTS,
  }: { type?: 'date' | 'datetime-local'; attrs?: string; presets?: PresetMarkup[] } = {},
): string {
  const buttons = presets
    .map((preset) => {
      const days = preset.days === undefined ? '' : ` data-rfr-datepicker-preset-days="${preset.days}"`
      const weekday = preset.weekday === undefined ? '' : ` data-rfr-datepicker-preset-weekday="${preset.weekday}"`
      return `<button type="button" data-rfr-datepicker-preset="${preset.id}"${days}${weekday} aria-controls="${inputId}">
        ${preset.label}
      </button>`
    })
    .join('')
  return `<input id="${inputId}" type="${type}" data-rfr-datepicker ${attrs} />
    <div role="group" aria-label="Date shortcuts" data-rfr-datepicker-presets>${buttons}</div>`
}

function mount(html: string): void {
  document.body.innerHTML = html
  initDatePickers()
}

function input(id = 'due'): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement
}

function preset(id: string, inputId = 'due'): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>(
    `[data-rfr-datepicker-preset="${id}"][aria-controls="${inputId}"]`,
  )!
}

/**
 * Every event the input dispatches, in the order this listener sees them. The
 * script's own change listener was added first, so its rfr-date-change lands
 * inside the change event, before this listener hears the change itself.
 */
function recordEvents(target: HTMLInputElement): string[] {
  const seen: string[] = []
  for (const type of ['input', 'change', DATE_CHANGE_EVENT]) {
    target.addEventListener(type, () => seen.push(type))
  }
  return seen
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  // Saturday 17 October 2026, mid-afternoon.
  vi.setSystemTime(new Date(2026, 9, 17, 15, 0))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

describe('choosing a preset', () => {
  it('fills the input with that day and reports the change once', () => {
    mount(picker('due'))
    const events = recordEvents(input())
    const changes: CustomEvent[] = []
    document.addEventListener(DATE_CHANGE_EVENT, (event) => changes.push(event as CustomEvent))

    preset('tomorrow').click()
    expect(input().value).toBe('2026-10-18')
    expect(events).toEqual(['input', DATE_CHANGE_EVENT, 'change'])

    preset('next-week').click()
    expect(input().value).toBe('2026-10-19')
    expect(changes.map((event) => event.detail.iso)).toEqual([
      new Date('2026-10-18').toISOString(),
      new Date('2026-10-19').toISOString(),
    ])
  })

  it('keeps the time already chosen in a date-and-time input', () => {
    mount(picker('due', { type: 'datetime-local', attrs: 'value="2026-10-01T14:30"' }))
    preset('next-week').click()
    expect(input().value).toBe('2026-10-19T14:30')
  })

  it('starts a date-and-time input at midnight when it has no time yet', () => {
    mount(picker('due', { type: 'datetime-local' }))
    preset('today').click()
    expect(input().value).toBe('2026-10-17T00:00')
  })

  it('resolves caller-defined presets from their data attributes', () => {
    mount(
      picker('due', {
        presets: [
          { id: 'in-two-weeks', label: 'In two weeks', days: 14 },
          { id: 'friday-after-next', label: 'Friday after next', weekday: 5, days: 7 },
        ],
      }),
    )
    preset('in-two-weeks').click()
    expect(input().value).toBe('2026-10-31')
    preset('friday-after-next').click()
    expect(input().value).toBe('2026-10-30')
  })

  it('fills only its own input when a page has two pickers', () => {
    mount(picker('start') + picker('end'))
    preset('tomorrow', 'end').click()
    expect(input('start').value).toBe('')
    expect(input('end').value).toBe('2026-10-18')
  })

  it('resolves against the date when chosen, not when the page loaded', () => {
    vi.setSystemTime(new Date(2026, 9, 17, 23, 59))
    mount(picker('due'))
    // The page stays open past midnight.
    vi.setSystemTime(new Date(2026, 9, 18, 0, 1))
    preset('today').click()
    expect(input().value).toBe('2026-10-18')
  })
})

describe('presets that cannot be chosen', () => {
  it('are disabled on load when outside min and max', () => {
    mount(picker('due', { attrs: 'min="2026-10-18" max="2026-10-18"' }))
    expect([preset('today').disabled, preset('tomorrow').disabled, preset('next-week').disabled]).toEqual([
      true,
      false,
      true,
    ])
  })

  it('compare whole days against a date-and-time range', () => {
    mount(picker('due', { type: 'datetime-local', attrs: 'min="2026-10-17T18:00" max="2026-10-18T06:00"' }))
    expect([preset('today').disabled, preset('tomorrow').disabled, preset('next-week').disabled]).toEqual([
      false,
      false,
      true,
    ])
  })

  it('are all disabled when the input is disabled or read-only', () => {
    for (const attrs of ['disabled', 'readonly']) {
      mount(picker('due', { attrs }))
      expect(DEFAULTS.every(({ id }) => preset(id).disabled)).toBe(true)
    }
  })

  it('do nothing, and become disabled, once the day has left the range since the page loaded', () => {
    vi.setSystemTime(new Date(2026, 9, 17, 23, 59))
    mount(picker('due', { attrs: 'max="2026-10-17"' }))
    expect(preset('today').disabled).toBe(false)
    const events = recordEvents(input())
    vi.setSystemTime(new Date(2026, 9, 18, 0, 1))
    // A click on a button that is still enabled, as a reader would make it.
    preset('today').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(input().value).toBe('')
    expect(events).toEqual([])
    expect(preset('today').disabled).toBe(true)
  })

  it('are disabled with a warning when their input is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(picker('due').replace('<input id="due"', '<input id="elsewhere"'))
    expect(preset('today').disabled).toBe(true)
    expect(warn).toHaveBeenCalledWith('[refraction-ui] Date preset "today" has no input to fill.')
  })
})

describe('the input', () => {
  it('reports a date the reader typed or picked, and nothing when it is cleared', () => {
    mount(picker('due'))
    const changes: CustomEvent[] = []
    input().addEventListener(DATE_CHANGE_EVENT, (event) => changes.push(event as CustomEvent))
    input().value = '2026-12-24'
    input().dispatchEvent(new Event('change', { bubbles: true }))
    input().value = ''
    input().dispatchEvent(new Event('change', { bubbles: true }))
    expect(changes).toHaveLength(1)
    expect(changes[0].detail.date).toEqual(new Date('2026-12-24'))
    expect(changes[0].detail.iso).toBe(new Date('2026-12-24').toISOString())
  })

  it('is wired once however often the script runs, as after a view transition', () => {
    mount(picker('due'))
    initDatePickers()
    initDatePickers(document.body)
    const events = recordEvents(input())
    preset('tomorrow').click()
    expect(events).toEqual(['input', DATE_CHANGE_EVENT, 'change'])
  })

  it('puts the presets after the input in the tab order', () => {
    mount(picker('due'))
    const focusable = Array.from(document.querySelectorAll<HTMLElement>('input, button'))
    expect(focusable.map((element) => element.dataset.rfrDatepickerPreset ?? element.tagName)).toEqual([
      'INPUT',
      'today',
      'tomorrow',
      'next-week',
    ])
    expect(focusable.every((element) => element.tabIndex === 0)).toBe(true)
  })
})
