import Component from './Skeleton.astro'

const meta = {
  title: 'Astro/Skeleton',
  component: Component,
  argTypes: {
    shape: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
    animate: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    shape: '',
    width: 0,
    height: 0,
    animate: false,
  },
}
