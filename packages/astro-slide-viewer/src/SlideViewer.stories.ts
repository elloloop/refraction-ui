import Component from './SlideViewer.astro'

const meta = {
  title: 'Astro/SlideViewer',
  component: Component,
  argTypes: {
    slides: { control: 'object' },
    initialSlide: { control: 'number' },
    size: { control: 'select', options: ['compact', 'default', 'full'] },
  },
}

export default meta

// Slides must match the headless core's SlideData shape ({ id, type, content })
// with type in 'lesson' | 'quiz' | 'exercise' | 'intro' | 'summary' — see
// packages/slide-viewer/src/slide-viewer.ts. `content` is rendered as HTML.
export const Default = {
  args: {
    slides: [
      { id: '1', type: 'intro', content: '<h2>Welcome</h2><p>Introduction to the course.</p>' },
      { id: '2', type: 'lesson', content: '<h2>Core concepts</h2><p>Key lesson content.</p>' },
      { id: '3', type: 'quiz', content: '<h2>Checkpoint</h2><p>Test your understanding.</p>' },
      { id: '4', type: 'summary', content: '<h2>Summary</h2><p>Thanks for following along.</p>' },
    ],
    initialSlide: 0,
    size: 'default',
  }
}
