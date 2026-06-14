import Component from './Payment.astro'

const meta = {
  title: 'Astro/Payment',
  component: Component,
  argTypes: {
    stripeKey: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    stripeKey: '',
  },
}
