import { createDefaultDatePresets } from '@refraction-ui/date-picker'
import Component from './DatePicker.astro'

const meta = {
  title: 'Astro/DatePicker',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: '2026-06-15T00:00:00.000Z',
    minDate: '2026-01-01T00:00:00.000Z',
    maxDate: '2026-12-31T00:00:00.000Z',
    showTime: false,
    format: 'YYYY-MM-DD',
    placeholder: 'Select a date',
    disabled: false
  }
}

export const WithPresets = {
  args: {
    presets: [...createDefaultDatePresets(), { id: 'in-two-weeks', label: 'In two weeks', days: 14 }],
    placeholder: 'Select a date',
  },
}

export const TranslatedPresets = {
  args: {
    presets: createDefaultDatePresets({
      labels: { today: 'Hoy', tomorrow: 'Mañana', nextWeek: 'La próxima semana' },
    }),
    presetsLabel: 'Atajos de fecha',
  },
}
