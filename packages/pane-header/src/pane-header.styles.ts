import { cva } from '@refraction-ui/shared'

/**
 * Root bar: one non-wrapping row with the rule underneath. Height comes from
 * the core's inline style (the shared custom property), not a class, so every
 * pane reads the same value. Border-box sizing keeps the rule inside that
 * height, which is what makes neighbouring rules meet.
 */
export const paneHeaderClass =
  'flex w-full min-w-0 shrink-0 items-center gap-2 border-b border-border bg-background px-2 text-foreground'

/** Leading slot (back control). Never shrinks, so the control stays tappable. */
export const paneHeaderLeadingClass = 'flex flex-none items-center'

/**
 * The title block: avatar + title + subtitle. `min-w-0 flex-1` lets it take the
 * free space and be the part that gives way, so the title truncates instead of
 * pushing the actions off the bar. `interactive` turns it into the title button
 * (44 px minimum target, hover + focus-visible ring, no motion when reduced).
 */
export const paneHeaderTitleBlockVariants = cva({
  base: 'flex min-w-0 flex-1 items-center gap-3',
  variants: {
    interactive: {
      true: [
        'min-h-11 rounded-md px-1 text-start transition-colors motion-reduce:transition-none',
        'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      ].join(' '),
      false: '',
    },
  },
  defaultVariants: {
    interactive: 'false',
  },
})

/**
 * Heading that wraps the title button when the title is tappable (a heading
 * cannot live inside a button). Resets heading typography so the title span
 * inside carries the text styles in both modes.
 */
export const paneHeaderHeadingClass = 'm-0 flex min-w-0 flex-1 text-base font-normal'

/** Avatar slot. Fixed size, never shrinks. */
export const paneHeaderAvatarClass = 'flex flex-none items-center'

/** Column holding title over subtitle; `min-w-0` is what allows truncation. */
export const paneHeaderTextClass = 'flex min-w-0 flex-1 flex-col'

/** Title text — truncates with an ellipsis on one line. */
export const paneHeaderTitleClass = 'm-0 block truncate text-sm font-semibold text-foreground'

/** Subtitle text — secondary, truncates with an ellipsis on one line. */
export const paneHeaderSubtitleClass = 'm-0 block truncate text-xs text-muted-foreground'

/** Visually hidden tap hint, read as part of the title button's description. */
export const paneHeaderHintClass = 'sr-only'

/** Trailing actions. `flex-none` so the actions never shrink or truncate. */
export const paneHeaderActionsClass = 'flex flex-none items-center gap-1'
