/**
 * Scroll container. `overflow-anchor: none` turns off the browser's own
 * scroll anchoring, which would otherwise fight the core's anchor
 * compensation and double-correct on prepend. The focus ring matters: the
 * scroller is a tab stop so keyboard users can scroll it.
 */
export const virtualListScrollerClass = [
  'relative overflow-y-auto overscroll-contain [overflow-anchor:none]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ')

/** Full-height element that gives the scroller its scrollable size. */
export const virtualListSizerClass = 'relative w-full'

/**
 * One positioned item. `flow-root` contains child margins so the measured
 * height is the height the item really occupies.
 */
export const virtualListItemClass = 'absolute inset-x-0 flow-root'
