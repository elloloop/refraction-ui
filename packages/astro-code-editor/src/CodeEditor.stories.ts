import Component from './CodeEditor.astro'

const meta = {
  title: 'Astro/CodeEditor',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: 'Example value',
    language: 'Example language',
    readOnly: false,
    theme: undefined,
    placeholder: 'Example placeholder',
    actions: 'Example actions'
  }
}
