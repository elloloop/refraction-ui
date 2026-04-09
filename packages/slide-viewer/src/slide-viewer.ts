import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { Keys } from '@refraction-ui/shared'

export type SlideType = 'lesson' | 'quiz' | 'exercise' | 'intro' | 'summary'

export type BookmarkType = 'important' | 'difficult' | 'to-revise'

export interface SlideData {
  id: string
  type: SlideType
  content: string
}

export interface SlideViewerProps {
  slides: SlideData[]
  initialSlide?: number
  onSlideChange?: (index: number) => void
  onComplete?: () => void
}

export interface SlideViewerState {
  currentSlide: number
  totalSlides: number
  bookmarks: Map<number, BookmarkType>
}

export interface SlideViewerAPI {
  /** Current viewer state */
  state: SlideViewerState
  /** Navigate to the next slide */
  next: () => void
  /** Navigate to the previous slide */
  prev: () => void
  /** Navigate to a specific slide index */
  goTo: (index: number) => void
  /** Toggle a bookmark on the current slide */
  toggleBookmark: (type: BookmarkType) => void
  /** Get all bookmarks as an array of entries */
  getBookmarks: () => Array<{ slide: number; type: BookmarkType }>
  /** Current progress as a number between 0 and 1 */
  progress: number
  /** Keyboard handlers for slide navigation */
  keyboardHandlers: KeyboardHandlerMap
  /** ARIA props for the current slide */
  getSlideAriaProps: () => Partial<AccessibilityProps> & { 'aria-roledescription'?: string }
}

/**
 * Create a headless slide viewer.
 *
 * Manages slide navigation state, bookmarks, progress tracking,
 * and keyboard navigation. Framework wrappers handle rendering.
 */
export function createSlideViewer(props: SlideViewerProps): SlideViewerAPI {
  const { slides, initialSlide = 0, onSlideChange, onComplete } = props

  const totalSlides = slides.length
  const bookmarks = new Map<number, BookmarkType>()

  const state: SlideViewerState = {
    currentSlide: Math.max(0, Math.min(initialSlide, totalSlides - 1)),
    totalSlides,
    bookmarks,
  }

  function updateProgress(): number {
    if (totalSlides <= 1) return 1
    return state.currentSlide / (totalSlides - 1)
  }

  function next() {
    if (state.currentSlide < totalSlides - 1) {
      state.currentSlide++
      api.progress = updateProgress()
      onSlideChange?.(state.currentSlide)
    } else {
      // Already on the last slide — trigger complete
      onComplete?.()
    }
  }

  function prev() {
    if (state.currentSlide > 0) {
      state.currentSlide--
      api.progress = updateProgress()
      onSlideChange?.(state.currentSlide)
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < totalSlides) {
      state.currentSlide = index
      api.progress = updateProgress()
      onSlideChange?.(state.currentSlide)
    }
  }

  function toggleBookmark(type: BookmarkType) {
    const current = state.currentSlide
    if (bookmarks.has(current) && bookmarks.get(current) === type) {
      bookmarks.delete(current)
    } else {
      bookmarks.set(current, type)
    }
  }

  function getBookmarks(): Array<{ slide: number; type: BookmarkType }> {
    const result: Array<{ slide: number; type: BookmarkType }> = []
    for (const [slide, type] of bookmarks.entries()) {
      result.push({ slide, type })
    }
    return result.sort((a, b) => a.slide - b.slide)
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.ArrowRight]: (e) => {
      e.preventDefault()
      next()
    },
    [Keys.ArrowLeft]: (e) => {
      e.preventDefault()
      prev()
    },
    [Keys.Escape]: (e) => {
      e.preventDefault()
    },
  }

  function getSlideAriaProps(): Partial<AccessibilityProps> & { 'aria-roledescription'?: string } {
    const slide = slides[state.currentSlide]
    return {
      role: 'region',
      'aria-roledescription': 'slide',
      'aria-label': `Slide ${state.currentSlide + 1} of ${totalSlides}: ${slide?.type ?? 'unknown'} slide`,
      'aria-live': 'polite',
    }
  }

  const api: SlideViewerAPI = {
    state,
    next,
    prev,
    goTo,
    toggleBookmark,
    getBookmarks,
    progress: updateProgress(),
    keyboardHandlers,
    getSlideAriaProps,
  }

  return api
}
