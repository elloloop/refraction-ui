import Component from './SlideViewer.astro'

const meta = {
  title: 'Astro/SlideViewer',
  component: Component,
  argTypes: {
    slides: { control: 'text' },
    initialSlide: { control: 'number' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    slides: '',
    initialSlide: 0,
    size: 'default',
    default: '<span>default content</span>',
  }
}
