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
