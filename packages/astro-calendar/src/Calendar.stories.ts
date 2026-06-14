import Component from './Calendar.astro'

const meta = {
  title: 'Astro/Calendar',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: 'Example value',
    minDate: 'Example minDate',
    maxDate: 'Example maxDate',
    disabledDates: ['Item 1', 'Item 2']
  }
}
