import Component from './Steps.astro'

const meta = {
  title: 'Astro/Steps',
  component: Component,
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
  },
}

export default meta

export const Default = {
  args: {
    default: '<div data-slot="step" data-state="completed"><strong>1. Account</strong></div><div data-slot="step" data-state="active"><strong>2. Profile</strong></div><div data-slot="step" data-state="upcoming"><strong>3. Review</strong></div>',
    orientation: 'vertical',
  }
}
