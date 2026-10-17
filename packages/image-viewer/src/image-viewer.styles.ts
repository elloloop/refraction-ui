import { cva } from '@refraction-ui/shared'

/**
 * Overrides for the Dialog panel so the viewer fills the viewport. `cn` does
 * not resolve Tailwind conflicts and Dialog's `dialogContentVariants` base sets
 * a centred, padded `max-w-lg` card, so the conflicting utilities carry
 * Tailwind's `!` important modifier (the documented escape hatch in
 * `@refraction-ui/shared`'s `cn`).
 */
export const imageViewerContentClass = [
  'inset-0! translate-x-0! translate-y-0! h-full w-full max-w-none!',
  'gap-0! p-0! border-0! rounded-none! shadow-none! bg-background',
  'grid-rows-[minmax(0,1fr)] focus-visible:outline-none',
].join(' ')

/** The viewer layout: toolbar, image stage, caption. */
export const imageViewerBodyClass =
  'grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] text-foreground'

/** `gap-2` with 36 px buttons gives each 44 px hit area its own space. */
export const imageViewerToolbarClass =
  'flex items-center gap-2 border-b border-border bg-background px-2 py-1'

/** "Image 2 of 5" in the toolbar. */
export const imageViewerPositionClass = 'px-2 text-sm text-muted-foreground tabular-nums'

/** Visible zoom percentage between the zoom buttons. */
export const imageViewerZoomLabelClass =
  'min-w-12 text-center text-sm text-muted-foreground tabular-nums'

/** Trailing toolbar group. `gap-2` + 36 px buttons keeps the 44 px hit areas from overlapping. */
export const imageViewerActionsClass = 'ms-auto flex items-center gap-2'

/** `<figure>` holding the stage and the caption. */
export const imageViewerFigureClass = 'm-0 grid min-h-0 grid-rows-[minmax(0,1fr)_auto]'

/** Positioning context for the stage and the previous / next buttons. */
export const imageViewerFrameClass = 'relative min-h-0 overflow-hidden bg-muted'

/**
 * The gesture surface. `touch-none` hands pinch and drag to the viewer
 * instead of the browser's own page zoom and scroll.
 */
export const imageViewerStageVariants = cva({
  base: 'absolute inset-0 flex items-center justify-center overflow-hidden touch-none select-none',
  variants: {
    zoomed: {
      true: 'cursor-grab',
      false: 'cursor-zoom-in',
    },
    dragging: {
      true: 'cursor-grabbing',
      false: '',
    },
  },
  defaultVariants: {
    zoomed: 'false',
    dragging: 'false',
  },
})

/**
 * The image. Animated only for discrete zooms (buttons, keys, double-click);
 * wheel, drag and pinch follow the pointer directly. `motion-reduce:` stops
 * the transition under `prefers-reduced-motion`.
 */
export const imageViewerImageVariants = cva({
  base: 'block max-h-full max-w-full origin-center select-none will-change-transform',
  variants: {
    animate: {
      true: 'transition-transform duration-200 ease-out motion-reduce:transition-none',
      false: 'transition-none',
    },
  },
  defaultVariants: {
    animate: 'false',
  },
})

/** Wrapper that places a previous / next button over the stage edge. */
export const imageViewerNavVariants = cva({
  base: 'absolute top-1/2 z-10 -translate-y-1/2 rounded-md bg-background/80',
  variants: {
    side: {
      start: 'start-2',
      end: 'end-2',
    },
  },
  defaultVariants: {
    side: 'start',
  },
})

export const imageViewerCaptionClass =
  'border-t border-border bg-background px-4 py-3 text-sm text-foreground'

/** Visually hidden polite live region (zoom level, "Image 2 of 5"). */
export const imageViewerLiveRegionClass = 'sr-only'

/**
 * Controls at a limit (zoom 8×, first / last image) use `aria-disabled`
 * rather than `disabled`: a `disabled` button drops focus to `<body>` the
 * moment it disables, which would let focus escape the modal mid-zoom.
 */
export const imageViewerControlClass = 'aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
