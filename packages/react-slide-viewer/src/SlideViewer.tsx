import * as React from 'react'
import {
  createSlideViewer,
  slideViewerVariants,
  progressBarVariants,
  slideTypeBadgeVariants,
  type SlideData,
  type BookmarkType,
  type SlideType,
} from '@refraction-ui/slide-viewer'
import { cn, createKeyboardHandler } from '@refraction-ui/shared'

export type { SlideData, BookmarkType, SlideType }

export interface SlideViewerProps {
  slides: SlideData[]
  initialSlide?: number
  onSlideChange?: (index: number) => void
  onComplete?: () => void
  className?: string
  size?: 'compact' | 'default' | 'full'
  /** Render function for custom slide content */
  renderSlide?: (slide: SlideData, index: number) => React.ReactNode
}

/**
 * SlideViewer component — slide-based content viewer with navigation,
 * progress bar, type badges, and bookmark support.
 *
 * Uses the headless @refraction-ui/slide-viewer core for state and navigation.
 */
export const SlideViewer = React.forwardRef<HTMLDivElement, SlideViewerProps>(
  (
    {
      slides,
      initialSlide,
      onSlideChange,
      onComplete,
      className,
      size,
      renderSlide,
    },
    ref,
  ) => {
    const [, setTick] = React.useState(0)
    const rerender = () => setTick((t) => t + 1)

    const apiRef = React.useRef(
      createSlideViewer({ slides, initialSlide, onSlideChange, onComplete }),
    )
    const api = apiRef.current

    const containerClasses = cn(slideViewerVariants({ size }), className)
    const currentSlide = slides[api.state.currentSlide]
    const slideAriaProps = api.getSlideAriaProps()
    const handleKeyDown = createKeyboardHandler(api.keyboardHandlers)

    function handlePrev() {
      api.prev()
      rerender()
    }

    function handleNext() {
      api.next()
      rerender()
    }

    function handleBookmark(type: BookmarkType) {
      api.toggleBookmark(type)
      rerender()
    }

    const isBookmarked = api.state.bookmarks.has(api.state.currentSlide)

    return (
      <div
        ref={ref}
        className={containerClasses}
        onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler}
        tabIndex={0}
      >
        {/* Progress bar */}
        <div className={progressBarVariants({ position: 'top' })}>
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${api.progress * 100}%` }}
          />
        </div>

        {/* Header with type badge and bookmark */}
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            {currentSlide && (
              <span className={slideTypeBadgeVariants({ type: currentSlide.type })}>
                {currentSlide.type}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {api.state.currentSlide + 1} / {api.state.totalSlides}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleBookmark('important')}
            className={cn(
              'px-2 py-1 rounded text-xs transition-colors',
              isBookmarked
                ? 'bg-yellow-100 text-yellow-800'
                : 'hover:bg-muted text-muted-foreground',
            )}
            aria-pressed={isBookmarked}
            aria-label="Toggle bookmark"
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 overflow-auto p-6" {...slideAriaProps}>
          {currentSlide &&
            (renderSlide
              ? renderSlide(currentSlide, api.state.currentSlide)
              : <div dangerouslySetInnerHTML={{ __html: currentSlide.content }} />)}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            type="button"
            onClick={handlePrev}
            disabled={api.state.currentSlide === 0}
            className="px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            aria-label="Previous slide"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label={
              api.state.currentSlide === api.state.totalSlides - 1
                ? 'Complete'
                : 'Next slide'
            }
          >
            {api.state.currentSlide === api.state.totalSlides - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    )
  },
)

SlideViewer.displayName = 'SlideViewer'
