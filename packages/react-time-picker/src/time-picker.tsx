import * as React from 'react'
import {
  createTimePicker,
  formatTime,
  resolveHourCycle,
  stepTime,
  suggestTimes,
  findNearestTimeOptionIndex,
  resolveTimeInput,
  getTimePickerInvalidMessage,
  getTimePickerKeyAction,
  getNextTimeOptionIndex,
  timePickerRootClass,
  timePickerInputVariants,
  timePickerListboxClass,
  timePickerOptionVariants,
  timePickerOptionCheckClass,
  timePickerOptionDurationClass,
  timePickerMessageClass,
  TIME_PICKER_DEFAULT_STEP,
  TIME_PICKER_DEFAULT_MERIDIEM_LABELS,
  TIME_PICKER_DEFAULT_LOCALE,
  type MinutesSinceMidnight,
  type TimePickerHourCycle,
  type TimePickerMeridiemLabels,
  type TimePickerInvalidReason,
  type TimePickerDurationFormatter,
  type TimePickerKeyAction,
} from '@refraction-ui/time-picker'
import { cn } from '@refraction-ui/shared'

export type {
  MinutesSinceMidnight,
  TimePickerHourCycle,
  TimePickerMeridiemLabels,
  TimePickerInvalidReason,
  TimePickerDurationFormatter,
}

const DEFAULT_LIST_LABEL = 'Suggested times'
/** The HH:mm form submitted with `name`, independent of the display clock. */
const FORM_VALUE_HOUR_CYCLE: TimePickerHourCycle = 24

/** The runtime locale never changes during a session, so there is nothing to subscribe to. */
function subscribeToNothing(): () => void {
  return () => {}
}

function runtimeHourCycle(): TimePickerHourCycle {
  return resolveHourCycle()
}

function serverHourCycle(): TimePickerHourCycle {
  return resolveHourCycle(TIME_PICKER_DEFAULT_LOCALE)
}

/**
 * The forced hour cycle, else the given locale's, else the runtime locale's.
 * Without `locale` the runtime one cannot be known on the server, so SSR and
 * hydration use {@link TIME_PICKER_DEFAULT_LOCALE}'s clock and the runtime's
 * takes over right after hydration. Pass `locale` or `hourCycle` to skip that.
 */
function useHourCycle(locale?: string, forced?: TimePickerHourCycle): TimePickerHourCycle {
  const detected = React.useSyncExternalStore(subscribeToNothing, runtimeHourCycle, serverHourCycle)
  const localeHourCycle = React.useMemo(
    () => (locale === undefined ? undefined : resolveHourCycle(locale)),
    [locale],
  )
  return forced ?? localeHourCycle ?? detected
}

export interface TimePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'role' | 'size'
  > {
  /** Controlled value in minutes since midnight; `null` is empty. */
  value?: MinutesSinceMidnight | null
  /** Initial value for uncontrolled usage. */
  defaultValue?: MinutesSinceMidnight | null
  /** Called with the newly committed value (`null` when cleared). */
  onValueChange?: (value: MinutesSinceMidnight | null) => void
  /** Minutes between suggestions and arrow-key steps. Default `15`. */
  step?: number
  /** Earliest allowed time. Default `0` (00:00). */
  min?: MinutesSinceMidnight
  /** Latest allowed time. Default `1439` (23:59). */
  max?: MinutesSinceMidnight
  /** Reference start (e.g. a meeting's start): suggestions follow it with durations. */
  start?: MinutesSinceMidnight
  /**
   * BCP 47 locale used to pick the 12- or 24-hour clock. Default: the runtime
   * locale, after hydration (`en-US`'s clock on the server and while hydrating).
   */
  locale?: string
  /** Force a 12- or 24-hour clock instead of the locale's. */
  hourCycle?: TimePickerHourCycle
  /** Day-period labels for the 12-hour clock. Default `AM`/`PM`. */
  meridiemLabels?: TimePickerMeridiemLabels
  /** Duration label formatter for suggestions after `start`. Default `1 h 30 min`. */
  formatDuration?: TimePickerDurationFormatter
  /** Message shown for a rejected entry. Default: an English hint naming the format or range. */
  invalidMessage?: string | ((reason: TimePickerInvalidReason) => string)
  /** Accessible name of the suggestion list. Default `Suggested times`. */
  listLabel?: string
}

/**
 * TimePicker — a time-of-day text field with forgiving parsing and a list of
 * suggestions (ARIA 1.2 editable combobox).
 *
 * Type `930`, `9:30pm` or `21:30`; the entry is committed on Enter or blur and
 * reformatted on the locale's 12- or 24-hour clock. With the list closed ↑/↓
 * step the time; Alt+↓ (or typing, or a click) opens the suggestions, where
 * ↑/↓ move the active option and Enter picks it. Escape reverts. A rejected
 * entry sets `aria-invalid` and shows a message. Values are minutes since
 * midnight; the ref and native input props go to the `<input>`, `className`
 * to the root wrapper.
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  function TimePicker(
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      step = TIME_PICKER_DEFAULT_STEP,
      min,
      max,
      start,
      locale,
      hourCycle: hourCycleProp,
      meridiemLabels = TIME_PICKER_DEFAULT_MERIDIEM_LABELS,
      formatDuration,
      invalidMessage,
      listLabel = DEFAULT_LIST_LABEL,
      name,
      id: idProp,
      className,
      disabled,
      readOnly,
      onKeyDown,
      onBlur,
      onClick,
      'aria-describedby': describedByProp,
      ...props
    },
    ref,
  ) {
    const isControlled = valueProp !== undefined
    const [internal, setInternal] = React.useState<MinutesSinceMidnight | null>(defaultValue)
    const value = isControlled ? valueProp : internal

    const hourCycle = useHourCycle(locale, hourCycleProp)
    const { am, pm } = meridiemLabels
    // Primitive deps: a fresh `meridiemLabels` object each render must not
    // reset the text the user is typing.
    const display = React.useCallback(
      (v: MinutesSinceMidnight | null) =>
        v === null ? '' : formatTime(v, { hourCycle, labels: { am, pm } }),
      [hourCycle, am, pm],
    )

    const options = React.useMemo(
      () => suggestTimes({ step, min, max, start, hourCycle, labels: { am, pm }, formatDuration }),
      [step, min, max, start, hourCycle, am, pm, formatDuration],
    )

    const [text, setText] = React.useState(() => display(value))
    const [open, setOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const [invalidReason, setInvalidReason] = React.useState<TimePickerInvalidReason | null>(null)
    // An empty range has nothing to suggest, so the popup never shows.
    const expanded = open && options.length > 0

    // Re-show the committed value whenever it (or how it is displayed) changes.
    React.useEffect(() => {
      setText(display(value))
      setInvalidReason(null)
    }, [value, display])

    const baseId = React.useId()
    const inputId = idProp ?? `${baseId}-input`
    const listboxId = `${baseId}-listbox`
    const messageId = `${baseId}-message`
    const optionId = (v: MinutesSinceMidnight) => `${baseId}-option-${v}`
    const optionRefs = React.useRef(new Map<number, HTMLLIElement>())

    const close = () => {
      setOpen(false)
      setActiveIndex(-1)
    }

    const openList = () => {
      if (disabled || readOnly) return
      setOpen(true)
      setActiveIndex(options.findIndex((o) => o.value === value))
    }

    const commit = (next: MinutesSinceMidnight | null) => {
      if (!isControlled) setInternal(next)
      if (next !== value) onValueChange?.(next)
      setText(display(next))
      setInvalidReason(null)
    }

    const range = { min, max, labels: { am, pm } }

    /** Commit the typed text; returns false (and flags it) when rejected. */
    const commitText = (): boolean => {
      const result = resolveTimeInput(text, range)
      if (result.status === 'invalid') {
        setInvalidReason(result.reason)
        return false
      }
      commit(result.status === 'valid' ? result.value : null)
      return true
    }

    const stepBy = (direction: 1 | -1) => {
      const typed = resolveTimeInput(text, range)
      const from = typed.status === 'valid' ? typed.value : value
      commit(stepTime(from, direction, { step, min, max, start }))
    }

    const revert = () => {
      setText(display(value))
      setInvalidReason(null)
      close()
    }

    const runAction = (action: TimePickerKeyAction, event: React.KeyboardEvent) => {
      switch (action) {
        case 'step-up':
        case 'step-down':
          event.preventDefault()
          stepBy(action === 'step-up' ? 1 : -1)
          return
        case 'open':
          event.preventDefault()
          openList()
          return
        case 'close':
          event.preventDefault()
          close()
          return
        case 'next-option':
        case 'previous-option':
          event.preventDefault()
          setActiveIndex((i) => getNextTimeOptionIndex(i, action, options.length))
          return
        case 'commit': {
          const active = expanded ? options[activeIndex] : undefined
          // Enter that changes or rejects the value stays in the field; only an
          // Enter on an already-committed value submits the surrounding form.
          if (expanded || text !== display(value)) event.preventDefault()
          if (active) commit(active.value)
          else if (!commitText()) event.preventDefault()
          close()
          return
        }
        case 'revert':
          if (expanded || invalidReason !== null || text !== display(value)) event.preventDefault()
          revert()
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || disabled || readOnly) return
      const action = getTimePickerKeyAction(event.key, { open: expanded, altKey: event.altKey })
      if (action) runAction(action, event)
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value
      setText(next)
      setInvalidReason(null)
      setOpen(true)
      // Highlight a suggestion only on an exact match, so Enter after typing
      // "10:07" commits 10:07 rather than a neighbouring suggestion.
      const typed = resolveTimeInput(next, range)
      setActiveIndex(typed.status === 'valid' ? options.findIndex((o) => o.value === typed.value) : -1)
    }

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event)
      if (!readOnly && !disabled) commitText()
      close()
    }

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
      onClick?.(event)
      if (!expanded) openList()
    }

    const pickOption = (v: MinutesSinceMidnight) => {
      commit(v)
      close()
    }

    // Keep the active option — or, on opening, the one nearest the value —
    // scrolled into view. `nearest` never animates, so no motion concern.
    const scrollTarget = activeIndex >= 0 ? activeIndex : findNearestTimeOptionIndex(options, value)
    const scrollValue = expanded ? options[scrollTarget]?.value : undefined
    React.useEffect(() => {
      if (scrollValue === undefined) return
      optionRefs.current.get(scrollValue)?.scrollIntoView?.({ block: 'nearest' })
    }, [scrollValue])

    const activeOption = expanded ? options[activeIndex] : undefined
    const invalid = invalidReason !== null
    const api = createTimePicker({
      open: expanded,
      invalid,
      listboxId,
      activeOptionId: activeOption ? optionId(activeOption.value) : undefined,
      messageId,
    })
    const describedBy = [describedByProp, api.inputAriaProps['aria-describedby']]
      .filter(Boolean)
      .join(' ')

    const message =
      invalidReason === null
        ? null
        : typeof invalidMessage === 'function'
          ? invalidMessage(invalidReason)
          : (invalidMessage ??
            getTimePickerInvalidMessage(invalidReason, { min, max, hourCycle, labels: { am, pm } }))

    return (
      <div className={cn(timePickerRootClass, className)} {...api.dataAttributes}>
        <input
          ref={ref}
          id={inputId}
          type="text"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={readOnly}
          className={timePickerInputVariants({ invalid: invalid ? 'true' : 'false' })}
          {...props}
          {...api.inputAriaProps}
          aria-describedby={describedBy || undefined}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={handleClick}
        />
        {name !== undefined && (
          <input
            type="hidden"
            name={name}
            value={value === null ? '' : formatTime(value, { hourCycle: FORM_VALUE_HOUR_CYCLE })}
          />
        )}
        <ul
          id={listboxId}
          {...api.listboxAriaProps}
          aria-label={listLabel}
          hidden={!expanded}
          className={timePickerListboxClass}
          // Keep focus in the input so a click picks rather than blurs.
          onMouseDown={(event) => event.preventDefault()}
        >
          {options.map((option, index) => {
            const selected = option.value === value
            const active = expanded && index === activeIndex
            return (
              <li
                key={option.value}
                id={optionId(option.value)}
                ref={(node) => {
                  if (node) optionRefs.current.set(option.value, node)
                  else optionRefs.current.delete(option.value)
                }}
                role="option"
                aria-selected={selected}
                data-highlighted={active ? '' : undefined}
                data-state={selected ? 'checked' : 'unchecked'}
                className={timePickerOptionVariants({ selected: selected ? 'true' : 'false' })}
                onClick={() => pickOption(option.value)}
                onMouseMove={() => {
                  if (!active) setActiveIndex(index)
                }}
              >
                <span className={timePickerOptionCheckClass} aria-hidden="true">
                  {selected && <CheckIcon />}
                </span>
                <span>{option.timeLabel}</span>
                {option.durationLabel !== null && (
                  <span className={timePickerOptionDurationClass}>{`(${option.durationLabel})`}</span>
                )}
              </li>
            )
          })}
        </ul>
        <p id={messageId} aria-live="polite" className={message ? timePickerMessageClass : undefined}>
          {message}
        </p>
      </div>
    )
  },
)

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
