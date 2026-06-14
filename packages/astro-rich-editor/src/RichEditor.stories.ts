import Component from './RichEditor.astro'

const meta = {
  title: 'Astro/RichEditor',
  component: Component,
  argTypes: {
    content: { control: 'text' },
    placeholder: { control: 'text' },
    readOnly: { control: 'boolean' },
    maxLength: { control: 'number' },
    showToolbar: { control: 'boolean' },
    showCount: { control: 'boolean' },
    name: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    content: '',
    placeholder: '',
    readOnly: false,
    maxLength: 0,
    showToolbar: false,
    showCount: false,
    name: '',
  },
}
