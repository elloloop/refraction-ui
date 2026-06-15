import Component from './DeviceFrame.astro'

const meta = {
  title: 'Astro/DeviceFrame',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    device: 'iphone',
    orientation: 'portrait'
  }
}
