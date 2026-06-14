import Component from './MarkdownRenderer.astro'

const meta = {
  title: 'Astro/MarkdownRenderer',
  component: Component,
}

export default meta

export const Default = {
  args: {
    content: 'Example content',
    components: 'Example components',
    linkResolver: 'Example linkResolver',
    size: 'default'
  }
}
