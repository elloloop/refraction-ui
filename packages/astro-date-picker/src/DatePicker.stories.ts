import Component from './DatePicker.astro'

const meta = {
  title: 'Astro/DatePicker',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: 'Example value',
    minDate: 'Example minDate',
    maxDate: 'Example maxDate',
    showTime: false,
    format: 'Example format',
    placeholder: 'Example placeholder',
    disabled: false
  }
}
