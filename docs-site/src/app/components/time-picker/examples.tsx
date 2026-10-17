'use client'

import * as React from 'react'
import { TimePicker, formatTime } from '@refraction-ui/react-time-picker'

export type TimePickerExampleSection = 'basic' | 'range' | 'meeting' | 'locale' | 'invalid'

interface TimePickerExamplesProps {
  section: TimePickerExampleSection
}

const MINUTES_PER_HOUR = 60
const at = (hours: number, minutes = 0) => hours * MINUTES_PER_HOUR + minutes

const frame = 'rounded-xl border border-border bg-card p-8'
const field = 'flex w-full max-w-[12rem] flex-col gap-1.5'
const labelClass = 'text-sm font-medium text-foreground'

export function TimePickerExamples({ section }: TimePickerExamplesProps) {
  switch (section) {
    case 'basic':
      return <BasicExample />
    case 'range':
      return <RangeExample />
    case 'meeting':
      return <MeetingExample />
    case 'locale':
      return <LocaleExample />
    case 'invalid':
      return <InvalidExample />
    default:
      return null
  }
}

function BasicExample() {
  const [value, setValue] = React.useState<number | null>(at(9, 30))
  return (
    <div className={`${frame} space-y-3`}>
      <div className={field}>
        <label htmlFor="tp-basic" className={labelClass}>
          Reminder
        </label>
        <TimePicker id="tp-basic" value={value} onValueChange={setValue} hourCycle={12} />
      </div>
      <p className="text-sm text-muted-foreground">
        {value === null ? 'No time set' : `Value: ${value} minutes since midnight`}
      </p>
    </div>
  )
}

function RangeExample() {
  return (
    <div className={frame}>
      <div className={field}>
        <label htmlFor="tp-range" className={labelClass}>
          Office hours (30-minute steps)
        </label>
        <TimePicker
          id="tp-range"
          defaultValue={at(9)}
          min={at(9)}
          max={at(17)}
          step={30}
          hourCycle={12}
        />
      </div>
    </div>
  )
}

function MeetingExample() {
  const [start, setStart] = React.useState<number | null>(at(10))
  const [end, setEnd] = React.useState<number | null>(at(10, 30))
  const handleStart = (next: number | null) => {
    setStart(next)
    // An end at or before the new start is no longer a valid end, so clear it.
    if (next !== null && end !== null && end <= next) setEnd(null)
  }
  return (
    <div className={`${frame} space-y-3`}>
      <div className="flex flex-wrap items-end gap-4">
        <div className={field}>
          <label htmlFor="tp-start" className={labelClass}>
            Starts
          </label>
          <TimePicker id="tp-start" value={start} onValueChange={handleStart} hourCycle={12} />
        </div>
        <div className={field}>
          <label htmlFor="tp-end" className={labelClass}>
            Ends
          </label>
          <TimePicker
            id="tp-end"
            value={end}
            onValueChange={setEnd}
            start={start ?? undefined}
            min={start === null ? undefined : start + 1}
            hourCycle={12}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {start !== null && end !== null
          ? `${formatTime(start, { hourCycle: 12 })} – ${formatTime(end, { hourCycle: 12 })}`
          : 'Pick a start and an end'}
      </p>
    </div>
  )
}

function LocaleExample() {
  return (
    <div className={`${frame} flex flex-wrap gap-4`}>
      {['en-US', 'en-GB', 'de-DE'].map((locale) => (
        <div key={locale} className={field}>
          <label htmlFor={`tp-${locale}`} className={labelClass}>
            {locale}
          </label>
          <TimePicker id={`tp-${locale}`} locale={locale} defaultValue={at(21, 30)} />
        </div>
      ))}
    </div>
  )
}

function InvalidExample() {
  return (
    <div className={frame}>
      <div className={field}>
        <label htmlFor="tp-invalid" className={labelClass}>
          Lunch
        </label>
        <TimePicker
          id="tp-invalid"
          min={at(11)}
          max={at(14)}
          hourCycle={12}
          placeholder="Try 9:75 or 4pm"
          invalidMessage={(reason) =>
            reason === 'out-of-range'
              ? 'Lunch is between 11:00 AM and 2:00 PM.'
              : 'That is not a time. Try 12:30 or 1pm.'
          }
        />
      </div>
    </div>
  )
}
