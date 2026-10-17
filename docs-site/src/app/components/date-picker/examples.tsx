'use client'
import { useId, useState } from 'react'
import { DatePicker, createDefaultDatePresets, type DatePreset } from '@refraction-ui/react-date-picker'

interface DatePickerExamplesProps { section: 'basic' | 'presets' }

const defaultPresets = createDefaultDatePresets()

const ownPresets: DatePreset[] = [
  ...defaultPresets,
  { id: 'next-friday', label: 'Next Friday', weekday: 5 },
  { id: 'in-two-weeks', label: 'In two weeks', days: 14 },
]

// Labels come from the caller's translations; weeks start on Monday in Spain.
const spanishPresets = createDefaultDatePresets({
  labels: { today: 'Hoy', tomorrow: 'Mañana', nextWeek: 'La próxima semana' },
  weekStartsOn: 1,
})

const dayFormat: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }

function PresetExample({ title, presets, presetsLabel, locale, testId }: {
  title: string
  presets: readonly DatePreset[]
  presetsLabel?: string
  locale?: string
  testId: string
}) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const inputId = useId()
  return (
    <div className="space-y-2" lang={locale} data-testid={testId}>
      <label htmlFor={inputId} className="block text-xs text-muted-foreground font-medium">{title}</label>
      <DatePicker
        id={inputId}
        value={date}
        onChange={setDate}
        presets={presets}
        presetsLabel={presetsLabel}
      />
      {date && (
        <p className="text-sm text-muted-foreground" data-testid={`${testId}-selected`}>
          {date.toLocaleDateString(locale, dayFormat)}
        </p>
      )}
    </div>
  )
}

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
  if (section === 'presets') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-8">
        <PresetExample title="Due date" presets={defaultPresets} testId="date-picker-presets-default" />
        <PresetExample title="Follow-up date" presets={ownPresets} testId="date-picker-presets-own" />
        <PresetExample
          title="Fecha de entrega"
          presets={spanishPresets}
          presetsLabel="Atajos de fecha"
          locale="es"
          testId="date-picker-presets-es"
        />
      </div>
    )
  }
  return null
}
