import {
  formatDate,
  isDateOutOfRange,
  resolveDatePreset,
  withTimeOf,
  type DatePreset,
  type DatePickerWeekday,
} from '@refraction-ui/date-picker'

/** Dispatched from the input, bubbling, whenever it gets a new value. */
export const DATE_CHANGE_EVENT = 'rfr-date-change'

const INIT = 'data-rfr-datepicker-init'

/** The local calendar day of a native value, `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`. */
function parseLocalDay(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined
}

/** The local date and time of a `datetime-local` value. */
function parseLocalDateTime(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return undefined
  const [year, month, day, hours, minutes] = match.slice(1).map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

function nativeValue(date: Date, withTime: boolean): string {
  return withTime ? formatDate(date, 'YYYY-MM-DDTHH:mm', true) : formatDate(date, 'YYYY-MM-DD', false)
}

function optionalNumber(value: string | undefined): number | undefined {
  return value === undefined || value === '' ? undefined : Number(value)
}

/** Read a preset back from the data attributes it was server-rendered with. */
function readPreset(button: HTMLButtonElement): DatePreset {
  return {
    id: button.dataset.rfrDatepickerPreset ?? '',
    label: button.textContent?.trim() ?? '',
    days: optionalNumber(button.dataset.rfrDatepickerPresetDays),
    weekday: optionalNumber(button.dataset.rfrDatepickerPresetWeekday) as DatePickerWeekday | undefined,
  }
}

/**
 * The value a preset would give the input today, or undefined when it cannot
 * be chosen: the input is disabled or read-only, or the day is out of range.
 */
function presetValue(button: HTMLButtonElement, input: HTMLInputElement): string | undefined {
  if (input.disabled || input.readOnly) return undefined
  const day = resolveDatePreset(readPreset(button), new Date())
  if (isDateOutOfRange(day, parseLocalDay(input.min), parseLocalDay(input.max))) return undefined
  const withTime = input.type === 'datetime-local'
  return nativeValue(withTime ? withTimeOf(day, parseLocalDateTime(input.value)) : day, withTime)
}

function setUpInput(input: HTMLInputElement): void {
  input.addEventListener('change', () => {
    if (!input.value) return
    const date = new Date(input.value)
    input.dispatchEvent(
      new CustomEvent(DATE_CHANGE_EVENT, {
        detail: { date, iso: date.toISOString() },
        bubbles: true,
      }),
    )
  })
}

function setUpPreset(button: HTMLButtonElement): void {
  const inputId = button.getAttribute('aria-controls')
  const input = inputId ? button.ownerDocument.getElementById(inputId) : null
  if (!(input instanceof HTMLInputElement)) {
    console.warn(`[refraction-ui] Date preset "${button.dataset.rfrDatepickerPreset}" has no input to fill.`)
    button.disabled = true
    return
  }
  // The server cannot know the reader's date, so the range is checked here.
  button.disabled = presetValue(button, input) === undefined
  button.addEventListener('click', () => {
    // Resolve again when chosen: a page left open past midnight must not
    // pick yesterday's "Tomorrow".
    const value = presetValue(button, input)
    if (value === undefined) {
      button.disabled = true
      return
    }
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

/** Wire every date picker and preset under `root` that is not wired yet. */
export function initDatePickers(root: ParentNode = document): void {
  root.querySelectorAll<HTMLInputElement>('input[data-rfr-datepicker]').forEach((input) => {
    if (input.hasAttribute(INIT)) return
    input.setAttribute(INIT, '')
    setUpInput(input)
  })
  root.querySelectorAll<HTMLButtonElement>('button[data-rfr-datepicker-preset]').forEach((button) => {
    if (button.hasAttribute(INIT)) return
    button.setAttribute(INIT, '')
    setUpPreset(button)
  })
}
