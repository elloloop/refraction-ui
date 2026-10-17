import { cva } from '@refraction-ui/shared'

/**
 * Stage root. It fills its parent, which sets the stage's size; the layouts
 * below scroll inside it instead of growing the page.
 */
export const videoStageRootClass =
  'relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden'

/** The layout under the zoom overlay; made inert while a tile is maximized. */
export const videoStageLayoutClass = 'flex min-h-0 min-w-0 flex-1'

/** Native scrollbars are hidden where the stage draws its own scroll control. */
const hiddenScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/**
 * A scrolling region and its scroll control: the control sits below a
 * horizontal scroller and beside a vertical one.
 */
export const videoStageScrollAreaVariants = cva({
  base: 'flex min-h-0 min-w-0',
  variants: {
    axis: {
      none: 'flex-1',
      horizontal: 'flex-1 flex-col gap-1.5',
      vertical: 'flex-1 flex-row gap-1',
    },
  },
  defaultVariants: {
    axis: 'none',
  },
})

/**
 * Grid of tiles. Up to four fill the stage; from five the grid pages, two
 * tiles per row or column (each a half of the visible area less the gap), and
 * scroll-snaps so a page lands whole.
 */
export const videoStageGridVariants = cva({
  base: 'grid min-h-0 min-w-0 flex-1 gap-2',
  variants: {
    shape: {
      single: 'grid-cols-1 grid-rows-1',
      'pair-stacked': 'grid-cols-1 grid-rows-2',
      'pair-side': 'grid-cols-2 grid-rows-1',
      quad: 'grid-cols-2 grid-rows-2',
      'paged-vertical': `grid-cols-2 auto-rows-[calc((100%_-_0.5rem)/2)] snap-y snap-mandatory overflow-y-auto overflow-x-hidden ${hiddenScrollbar}`,
      'paged-horizontal': `grid-flow-col grid-rows-2 auto-cols-[calc((100%_-_0.5rem)/2)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden ${hiddenScrollbar}`,
      'paged-strip': `grid-flow-col grid-rows-1 auto-cols-[calc((100%_-_0.5rem)/2)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden ${hiddenScrollbar}`,
    },
  },
  defaultVariants: {
    shape: 'single',
  },
})

/** One grid cell; the tile inside fills it. */
export const videoStageCellClass = 'relative min-h-0 min-w-0 snap-start'

/**
 * Presentation layout: the stage beside the rail on a wide landscape stage,
 * above it otherwise.
 */
export const videoStageSpotlightVariants = cva({
  base: 'flex min-h-0 min-w-0 flex-1 gap-2',
  variants: {
    placement: {
      side: 'flex-row',
      bottom: 'flex-col',
    },
  },
  defaultVariants: {
    placement: 'side',
  },
})

/** The stage frame — the focused tile fills it. */
export const videoStageFrameClass = 'relative flex min-h-0 min-w-0 flex-1'

/** Rail of the other participants plus its scroll control. */
export const videoStageRailSectionVariants = cva({
  base: 'flex min-h-0 min-w-0 shrink-0',
  variants: {
    placement: {
      side: 'flex-row gap-1',
      bottom: 'flex-col gap-1.5',
    },
  },
  defaultVariants: {
    placement: 'side',
  },
})

/**
 * The participant rail: a column of 16:9 tiles beside the stage, or a row of
 * them below it (shorter on a narrow stage).
 */
export const videoStageRailVariants = cva({
  base: `flex min-h-0 min-w-0 gap-2 ${hiddenScrollbar}`,
  variants: {
    placement: {
      side: 'w-48 flex-col snap-y snap-mandatory overflow-y-auto overflow-x-hidden',
      bottom: 'flex-row snap-x snap-mandatory overflow-x-auto overflow-y-hidden',
    },
    density: {
      compact: '',
      regular: '',
    },
  },
  compoundVariants: [
    { placement: 'bottom', density: 'compact', class: 'h-20' },
    { placement: 'bottom', density: 'regular', class: 'h-24' },
  ],
  defaultVariants: {
    placement: 'side',
    density: 'regular',
  },
})

/** A rail tile: full rail width in a column, full rail height in a row. */
export const videoStageRailTileVariants = cva({
  base: 'relative aspect-video shrink-0 snap-start',
  variants: {
    placement: {
      side: 'w-full',
      bottom: 'h-full',
    },
  },
  defaultVariants: {
    placement: 'side',
  },
})

/** Focus ring shared by every stage control. */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * Scroll control: previous and next buttons around a thin track whose thumb
 * shows the visible part.
 */
export const videoStageScrollerVariants = cva({
  base: 'flex shrink-0 items-center',
  variants: {
    axis: {
      horizontal: 'flex-row gap-2 px-1',
      vertical: 'flex-col gap-1.5 py-0.5',
    },
  },
  defaultVariants: {
    axis: 'horizontal',
  },
})

export const videoStageScrollButtonClass = `grid size-6 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none ${focusRing}`

export const videoStageScrollTrackVariants = cva({
  base: 'relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-full bg-border',
  variants: {
    axis: {
      horizontal: 'h-0.5',
      vertical: 'w-0.5',
    },
  },
  defaultVariants: {
    axis: 'horizontal',
  },
})

/** Thumb; its offset and length along the axis are set inline from the scroll metrics. */
export const videoStageScrollThumbVariants = cva({
  base: 'absolute rounded-full bg-muted-foreground transition-[left,top,width,height] duration-75 ease-out motion-reduce:transition-none',
  variants: {
    axis: {
      horizontal: 'inset-y-0',
      vertical: 'inset-x-0',
    },
  },
  defaultVariants: {
    axis: 'horizontal',
  },
})

/**
 * Tile options: the trigger stays at the tile's corner and the actions open
 * inline to its left. The trigger comes first in the DOM (laid out in
 * reverse), so Tab moves from it straight into the actions.
 */
export const videoStageTileOptionsClass = 'flex min-w-0 flex-row-reverse items-start gap-1'

/** The opened actions, nearest the trigger first; they wrap downward on a small tile. */
export const videoStageTileActionsClass =
  'flex min-w-0 flex-row-reverse flex-wrap items-center gap-1'

/** Round icon button for the options trigger and each action. */
export const videoStageTileButtonClass = `grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground motion-reduce:transition-none ${focusRing}`

/** Maximized tile: covers the whole stage, above the layout. */
export const videoStageZoomClass = 'absolute inset-0 z-30 flex bg-background'

/** Minimize button over the maximized tile. */
export const videoStageZoomExitClass = `absolute bottom-3 right-3 z-40 inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background/85 px-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground motion-reduce:transition-none ${focusRing}`
