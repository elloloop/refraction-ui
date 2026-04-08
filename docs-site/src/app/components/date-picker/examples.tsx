'use client'
import { useState } from 'react'
import { DatePicker } from '@refraction-ui/react-date-picker'
interface DatePickerExamplesProps { section: 'basic' }
export function DatePickerExamples({ section }: DatePickerExamplesProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium">Calendar + Time</span>
          <DatePicker value={date} onChange={setDate} />
          {date && <p className="text-sm text-muted-foreground mt-2">Selected: {date.toLocaleString()}</p>}
        </div>
      </div>
    )
  }
  return null
}
