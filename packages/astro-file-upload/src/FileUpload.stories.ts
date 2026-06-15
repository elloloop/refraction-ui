import Component from './FileUpload.astro'

const meta = {
  title: 'Astro/FileUpload',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    accept: 'Example accept',
    maxSize: 42,
    maxFiles: 42,
    multiple: false
  }
}
