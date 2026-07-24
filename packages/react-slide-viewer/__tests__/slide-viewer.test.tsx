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

// ---------------------------------------------------------------
// Additional SSR coverage (structure/ARIA only — see
// slide-viewer.interaction.test.tsx for click/keyboard behavior)
// ---------------------------------------------------------------

describe('SlideViewer – slide ARIA (React)', () => {
  it('slide region has roledescription and a positional aria-label', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('aria-roledescription="slide"')
    expect(html).toContain('aria-label="Slide 1 of 5: intro slide"')
  })

  it('aria-label reflects the initial slide and its type', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 2 }),
    )
    expect(html).toContain('aria-label="Slide 3 of 5: quiz slide"')
  })
})

describe('SlideViewer – progress bar (React)', () => {
  it('starts at 0% width on the first slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('width:0%')
  })

  it('reflects the initial slide position', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 2 }),
    )
    // Slide 3 of 5 → 2 / (5 - 1) = 50%
    expect(html).toContain('width:50%')
  })

  it('is 100% for a single-slide deck', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: [testSlides[0]] }),
    )
    expect(html).toContain('width:100%')
  })
})

describe('SlideViewer – navigation button labels (React)', () => {
  it('labels prev/next buttons for assistive tech', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('aria-label="Previous slide"')
    expect(html).toContain('aria-label="Next slide"')
  })

  it('labels the next button "Complete" on the last slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 4 }),
    )
    expect(html).toContain('aria-label="Complete"')
    expect(html).not.toContain('aria-label="Next slide"')
  })

  it('previous button is enabled past the first slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 1 }),
    )
    const prevMatch = html.match(/<button[^>]*aria-label="Previous slide"[^>]*>/)
    expect(prevMatch).toBeTruthy()
    // No disabled *attribute* (the class list carries disabled: variants).
    expect(prevMatch![0]).not.toContain('disabled=""')
  })
})

describe('SlideViewer – type badge variants (React)', () => {
  it.each([
    [0, 'bg-gray-100 text-gray-800'],
    [1, 'bg-blue-100 text-blue-800'],
    [2, 'bg-purple-100 text-purple-800'],
    [3, 'bg-green-100 text-green-800'],
    [4, 'bg-orange-100 text-orange-800'],
  ] as const)('slide %i badge uses %s', (index, classes) => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: index }),
    )
    expect(html).toContain(classes)
  })
})

describe('SlideViewer – sizes and clamping (React)', () => {
  it('applies the default size', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides }),
    )
    expect(html).toContain('max-w-4xl')
  })

  it('applies the full size', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, size: 'full' }),
    )
    expect(html).toContain('max-w-none')
  })

  it('clamps an out-of-range initial slide to the last slide', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 99 }),
    )
    expect(html).toContain('Summary')
    expect(html).toContain('aria-label="Slide 5 of 5: summary slide"')
  })

  it('shows Complete immediately for a single-slide deck', () => {
    const html = renderToString(
      React.createElement(SlideViewer, { slides: [testSlides[0]] }),
    )
    expect(html).toContain('Complete')
  })
})
