import Component from './Slider.astro'

const meta = {
  title: 'Astro/Slider',
  component: Component,
  argTypes: {
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
  },
}
