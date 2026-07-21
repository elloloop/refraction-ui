// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { SlideViewer, type SlideData } from '../src/SlideViewer.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const testSlides: SlideData[] = [
  { id: '1', type: 'intro', content: '<p>Welcome</p>' },
  { id: '2', type: 'lesson', content: '<p>Lesson content</p>' },
  { id: '3', type: 'quiz', content: '<p>Quiz question</p>' },
  { id: '4', type: 'exercise', content: '<p>Exercise prompt</p>' },
  { id: '5', type: 'summary', content: '<p>Summary</p>' },
]

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function viewer(): HTMLElement {
  const el = container.querySelector('[tabindex="0"]')
  if (!el) throw new Error('viewer container not rendered')
  return el as HTMLElement
}

function button(label: string): HTMLButtonElement {
  const el = container.querySelector(`button[aria-label="${label}"]`)
  if (!el) throw new Error(`button "${label}" not rendered`)
  return el as HTMLButtonElement
}

function click(el: HTMLElement) {
  act(() => {
    el.click()
  })
}

function keyDown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function progressFill(): HTMLElement {
  const el = container.querySelector('[style*="width"]')
  if (!el) throw new Error('progress fill not rendered')
  return el as HTMLElement
}

describe('SlideViewer interaction – next/prev buttons', () => {
  it('Next advances the slide and fires onSlideChange', () => {
    const onSlideChange = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onSlideChange }),
    )

    click(button('Next slide'))

    expect(onSlideChange).toHaveBeenCalledWith(1)
    expect(container.textContent).toContain('2 / 5')
    expect(container.textContent).toContain('Lesson content')
  })

  it('Previous returns to the earlier slide', () => {
    const onSlideChange = vi.fn()
    render(
      React.createElement(SlideViewer, {
        slides: testSlides,
        initialSlide: 1,
        onSlideChange,
      }),
    )

    click(button('Previous slide'))

    expect(onSlideChange).toHaveBeenCalledWith(0)
    expect(container.textContent).toContain('1 / 5')
    expect(container.textContent).toContain('Welcome')
  })

  it('disables Previous on the first slide and enables it after advancing', () => {
    render(React.createElement(SlideViewer, { slides: testSlides }))

    expect(button('Previous slide').disabled).toBe(true)

    click(button('Next slide'))

    expect(button('Previous slide').disabled).toBe(false)
  })

  it('stays on the first slide when Previous is clicked at the start', () => {
    const onSlideChange = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onSlideChange }),
    )

    // Disabled buttons swallow .click() in jsdom, matching browser behavior.
    button('Previous slide').click()

    expect(onSlideChange).not.toHaveBeenCalled()
    expect(container.textContent).toContain('1 / 5')
  })

  it('updates the progress bar as slides advance', () => {
    render(React.createElement(SlideViewer, { slides: testSlides }))

    expect(progressFill().style.width).toBe('0%')

    click(button('Next slide'))

    expect(progressFill().style.width).toBe('25%')
  })
})

describe('SlideViewer interaction – completion', () => {
  it('turns the next button into Complete on the last slide', () => {
    const onComplete = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onComplete }),
    )

    for (let i = 0; i < 4; i += 1) click(button('Next slide'))

    expect(container.textContent).toContain('5 / 5')
    click(button('Complete'))
    expect(onComplete).toHaveBeenCalledTimes(1)
    // Stays on the last slide after completion.
    expect(container.textContent).toContain('5 / 5')
  })

  it('does not fire onComplete before the last slide', () => {
    const onComplete = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onComplete }),
    )

    click(button('Next slide'))

    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe('SlideViewer interaction – arrow keys', () => {
  it('ArrowRight advances and re-renders the viewer', () => {
    const onSlideChange = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onSlideChange }),
    )

    const event = keyDown(viewer(), 'ArrowRight')

    expect(event.defaultPrevented).toBe(true)
    expect(onSlideChange).toHaveBeenCalledWith(1)
    expect(container.textContent).toContain('2 / 5')
    expect(container.textContent).toContain('Lesson content')
  })

  it('ArrowLeft goes back', () => {
    render(
      React.createElement(SlideViewer, { slides: testSlides, initialSlide: 2 }),
    )

    keyDown(viewer(), 'ArrowLeft')

    expect(container.textContent).toContain('2 / 5')
    expect(container.textContent).toContain('Lesson content')
  })

  it('ArrowLeft on the first slide stays put', () => {
    const onSlideChange = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onSlideChange }),
    )

    keyDown(viewer(), 'ArrowLeft')

    expect(onSlideChange).not.toHaveBeenCalled()
    expect(container.textContent).toContain('1 / 5')
  })

  it('ignores unrelated keys', () => {
    const onSlideChange = vi.fn()
    render(
      React.createElement(SlideViewer, { slides: testSlides, onSlideChange }),
    )

    const event = keyDown(viewer(), 'a')

    expect(event.defaultPrevented).toBe(false)
    expect(onSlideChange).not.toHaveBeenCalled()
    expect(container.textContent).toContain('1 / 5')
  })
})

describe('SlideViewer interaction – bookmark toggle', () => {
  it('toggles the bookmark on the current slide', () => {
    render(React.createElement(SlideViewer, { slides: testSlides }))

    const bookmark = button('Toggle bookmark')
    expect(bookmark.getAttribute('aria-pressed')).toBe('false')
    expect(bookmark.textContent).toBe('Bookmark')

    click(bookmark)

    expect(bookmark.getAttribute('aria-pressed')).toBe('true')
    expect(bookmark.textContent).toBe('Bookmarked')

    click(bookmark)

    expect(bookmark.getAttribute('aria-pressed')).toBe('false')
    expect(bookmark.textContent).toBe('Bookmark')
  })
})
