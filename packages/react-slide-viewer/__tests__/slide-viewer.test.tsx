import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SlideViewer } from '../src/SlideViewer.js'
import type { SlideData } from '../src/SlideViewer.js'

const testSlides: SlideData[] = [
  { id: '1', type: 'intro', content: '<p>Welcome</p>' },
  { id: '2', type: 'lesson', content: '<p>Lesson content</p>' },
  { id: '3', type: 'quiz', content: '<p>Quiz question</p>' },
  { id: '4', type: 'exercise', content: '<p>Exercise prompt</p>' },
  { id: '5', type: 'summary', content: '<p>Summary</p>' },
]

describe('SlideViewer (React)', () => {
  it('renders slide content', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('Welcome')
  })

  it('renders progress bar', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    // Progress bar track
    expect(html).toContain('bg-primary')
  })

  it('renders slide type badge', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    // First slide is 'intro' type
    expect(html).toContain('intro')
  })

  it('renders navigation buttons', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('Previous')
    expect(html).toContain('Next')
  })

  it('renders slide counter', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    // React SSR inserts comment nodes between text nodes
    expect(html).toContain('1')
    expect(html).toContain('5')
    expect(html).toContain('Slide 1 of 5')
  })

  it('renders bookmark button', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('Bookmark')
    expect(html).toContain('aria-pressed="false"')
  })

  it('disables previous button on first slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('disabled')
  })

  it('renders slide ARIA attributes', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-live="polite"')
  })

  it('shows Complete on last slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 4 }),
    )
    expect(html).toContain('Complete')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(SlideViewer, {
        slides: testSlides,
        className: 'my-viewer',
      }),
    )
    expect(html).toContain('my-viewer')
  })

  it('applies size variant', () => {
    const html = renderToString(
      React.createElement(SlideViewer, {
        slides: testSlides,
        size: 'compact',
      }),
    )
    expect(html).toContain('max-w-2xl')
  })

  it('renders at specified initial slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 1 }),
    )
    expect(html).toContain('Lesson content')
    expect(html).toContain('Slide 2 of 5')
  })

  it('sets tabIndex for keyboard navigation', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('tabindex="0"')
  })
})
