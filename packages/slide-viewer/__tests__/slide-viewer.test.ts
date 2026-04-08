import { describe, it, expect, vi } from 'vitest'
import { createSlideViewer, type SlideData } from '../src/slide-viewer.js'
import {
  slideViewerVariants,
  progressBarVariants,
  slideTypeBadgeVariants,
} from '../src/slide-viewer.styles.js'

function createTestSlides(count = 5): SlideData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `slide-${i}`,
    type: 'lesson' as const,
    content: `Slide ${i + 1} content`,
  }))
}

describe('createSlideViewer', () => {
  describe('navigation', () => {
    it('starts at first slide by default', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      expect(api.state.currentSlide).toBe(0)
    })

    it('starts at initialSlide', () => {
      const api = createSlideViewer({ slides: createTestSlides(), initialSlide: 2 })
      expect(api.state.currentSlide).toBe(2)
    })

    it('navigates to next slide', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.next()
      expect(api.state.currentSlide).toBe(1)
    })

    it('navigates to previous slide', () => {
      const api = createSlideViewer({ slides: createTestSlides(), initialSlide: 2 })
      api.prev()
      expect(api.state.currentSlide).toBe(1)
    })

    it('navigates to specific slide with goTo', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.goTo(3)
      expect(api.state.currentSlide).toBe(3)
    })

    it('calls onSlideChange on navigation', () => {
      const onSlideChange = vi.fn()
      const api = createSlideViewer({ slides: createTestSlides(), onSlideChange })
      api.next()
      expect(onSlideChange).toHaveBeenCalledWith(1)
      api.prev()
      expect(onSlideChange).toHaveBeenCalledWith(0)
      api.goTo(4)
      expect(onSlideChange).toHaveBeenCalledWith(4)
    })
  })

  describe('boundaries', () => {
    it('does not go below 0', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.prev()
      expect(api.state.currentSlide).toBe(0)
    })

    it('does not exceed last slide', () => {
      const api = createSlideViewer({ slides: createTestSlides(3), initialSlide: 2 })
      api.next()
      expect(api.state.currentSlide).toBe(2)
    })

    it('calls onComplete when next is called on last slide', () => {
      const onComplete = vi.fn()
      const api = createSlideViewer({
        slides: createTestSlides(3),
        initialSlide: 2,
        onComplete,
      })
      api.next()
      expect(onComplete).toHaveBeenCalled()
    })

    it('clamps initialSlide to valid range', () => {
      const api = createSlideViewer({ slides: createTestSlides(3), initialSlide: 10 })
      expect(api.state.currentSlide).toBe(2)
    })

    it('goTo ignores out-of-range indices', () => {
      const api = createSlideViewer({ slides: createTestSlides(3) })
      api.goTo(-1)
      expect(api.state.currentSlide).toBe(0)
      api.goTo(100)
      expect(api.state.currentSlide).toBe(0)
    })
  })

  describe('bookmarks', () => {
    it('toggles bookmark on current slide', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.toggleBookmark('important')
      expect(api.state.bookmarks.has(0)).toBe(true)
      expect(api.state.bookmarks.get(0)).toBe('important')
    })

    it('removes bookmark when toggled twice with same type', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.toggleBookmark('important')
      api.toggleBookmark('important')
      expect(api.state.bookmarks.has(0)).toBe(false)
    })

    it('replaces bookmark type when toggled with different type', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.toggleBookmark('important')
      api.toggleBookmark('difficult')
      expect(api.state.bookmarks.get(0)).toBe('difficult')
    })

    it('getBookmarks returns sorted array', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.goTo(3)
      api.toggleBookmark('difficult')
      api.goTo(1)
      api.toggleBookmark('important')
      const bookmarks = api.getBookmarks()
      expect(bookmarks).toHaveLength(2)
      expect(bookmarks[0].slide).toBe(1)
      expect(bookmarks[0].type).toBe('important')
      expect(bookmarks[1].slide).toBe(3)
      expect(bookmarks[1].type).toBe('difficult')
    })
  })

  describe('progress', () => {
    it('returns 0 at first slide of multi-slide deck', () => {
      const api = createSlideViewer({ slides: createTestSlides(5) })
      expect(api.progress).toBe(0)
    })

    it('returns 1 at last slide', () => {
      const api = createSlideViewer({ slides: createTestSlides(5), initialSlide: 4 })
      expect(api.progress).toBe(1)
    })

    it('returns 0.5 at middle slide', () => {
      const api = createSlideViewer({ slides: createTestSlides(5), initialSlide: 2 })
      expect(api.progress).toBe(0.5)
    })

    it('updates progress after navigation', () => {
      const api = createSlideViewer({ slides: createTestSlides(5) })
      api.next()
      expect(api.progress).toBe(0.25)
      api.next()
      expect(api.progress).toBe(0.5)
    })

    it('returns 1 for single-slide deck', () => {
      const api = createSlideViewer({ slides: createTestSlides(1) })
      expect(api.progress).toBe(1)
    })
  })

  describe('keyboard handlers', () => {
    it('has ArrowRight handler for next', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      expect(api.keyboardHandlers['ArrowRight']).toBeDefined()
    })

    it('has ArrowLeft handler for prev', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      expect(api.keyboardHandlers['ArrowLeft']).toBeDefined()
    })

    it('has Escape handler', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      expect(api.keyboardHandlers['Escape']).toBeDefined()
    })

    it('ArrowRight advances slide', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowRight']!(event)
      expect(api.state.currentSlide).toBe(1)
    })

    it('ArrowLeft goes back', () => {
      const api = createSlideViewer({ slides: createTestSlides(), initialSlide: 2 })
      const event = { key: 'ArrowLeft', preventDefault: vi.fn() } as unknown as KeyboardEvent
      api.keyboardHandlers['ArrowLeft']!(event)
      expect(api.state.currentSlide).toBe(1)
    })
  })

  describe('getSlideAriaProps', () => {
    it('returns region role with slide description', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      const ariaProps = api.getSlideAriaProps()
      expect(ariaProps.role).toBe('region')
      expect(ariaProps['aria-roledescription']).toBe('slide')
      expect(ariaProps['aria-label']).toContain('Slide 1 of 5')
      expect(ariaProps['aria-live']).toBe('polite')
    })

    it('updates aria-label after navigation', () => {
      const api = createSlideViewer({ slides: createTestSlides() })
      api.next()
      const ariaProps = api.getSlideAriaProps()
      expect(ariaProps['aria-label']).toContain('Slide 2 of 5')
    })
  })

  describe('totalSlides', () => {
    it('reflects number of slides', () => {
      const api = createSlideViewer({ slides: createTestSlides(7) })
      expect(api.state.totalSlides).toBe(7)
    })
  })
})

describe('slideViewerVariants', () => {
  it('returns default classes', () => {
    const classes = slideViewerVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('max-w-4xl')
  })

  it('returns compact size', () => {
    expect(slideViewerVariants({ size: 'compact' })).toContain('max-w-2xl')
  })

  it('returns full size', () => {
    expect(slideViewerVariants({ size: 'full' })).toContain('max-w-none')
  })
})

describe('progressBarVariants', () => {
  it('returns default classes', () => {
    const classes = progressBarVariants()
    expect(classes).toContain('h-1')
  })
})

describe('slideTypeBadgeVariants', () => {
  it('returns lesson badge classes', () => {
    const classes = slideTypeBadgeVariants({ type: 'lesson' })
    expect(classes).toContain('bg-blue-100')
  })

  it('returns quiz badge classes', () => {
    const classes = slideTypeBadgeVariants({ type: 'quiz' })
    expect(classes).toContain('bg-purple-100')
  })

  it('returns exercise badge classes', () => {
    const classes = slideTypeBadgeVariants({ type: 'exercise' })
    expect(classes).toContain('bg-green-100')
  })
})
