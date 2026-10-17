import { cva } from '@refraction-ui/shared'

/**
 * The row. `active` (hovered or focus inside) gives a quiet background so the
 * reader can see which row the toolbar belongs to. The row is only focusable
 * when it has a tap action, so it carries the shared focus ring.
 */
export const messageRowVariants = cva({
  base: [
    'group relative flex gap-3 rounded-md px-4 py-1.5 text-sm text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  ].join(' '),
  variants: {
    active: {
      true: 'bg-muted/50',
      false: '',
    },
  },
  defaultVariants: {
    active: 'false',
  },
})

/**
 * Jump-target highlight, painted on an overlay behind the content so it never
 * fights the row's own background. The inset ring is a shape cue, so the
 * highlight is not carried by colour alone. Only `fading` transitions
 * (duration matches `MESSAGE_ROW_HIGHLIGHT_FADE_MS`); reduced motion never
 * reaches `fading`, and `motion-reduce:transition-none` backs that up.
 */
export const messageRowHighlightVariants = cva({
  base: 'pointer-events-none absolute inset-0 rounded-md bg-primary/10 ring-2 ring-inset ring-primary/60',
  variants: {
    phase: {
      on: 'opacity-100',
      fading: 'opacity-0 transition-opacity duration-1000 ease-out motion-reduce:transition-none',
      off: 'opacity-0',
    },
  },
  defaultVariants: {
    phase: 'off',
  },
})

/** Avatar column. Its width is set inline from `avatarSize`. */
export const messageRowGutterClass = 'relative flex shrink-0 justify-end'

/** Wrapper that sizes whatever avatar node the consumer passes. */
export const messageRowAvatarClass =
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full [&>*]:h-full [&>*]:w-full'

/**
 * Continuation rows show their time in the gutter on hover / focus only. It is
 * hidden with opacity (not `display`) so it stays in the accessibility tree
 * and keeps naming the row.
 */
export const messageRowGutterTimeVariants = cva({
  base: 'whitespace-nowrap pt-0.5 text-xs tabular-nums text-muted-foreground transition-opacity motion-reduce:transition-none',
  variants: {
    visible: {
      true: 'opacity-100',
      false: 'opacity-0',
    },
  },
  defaultVariants: {
    visible: 'false',
  },
})

export const messageRowContentClass = 'relative min-w-0 flex-1'

export const messageRowHeaderClass = 'flex flex-wrap items-baseline gap-x-2'

export const messageRowAuthorClass = 'font-semibold text-foreground'

export const messageRowTimeClass = 'text-xs tabular-nums text-muted-foreground'

/** "Forwarded · author", bot badge… */
export const messageRowLabelsClass = 'inline-flex flex-wrap items-center gap-1 text-xs text-muted-foreground'

/** Reply preview. The left rule is a shape cue that this is quoted, not new, text. */
export const messageRowQuoteClass = 'mb-1 border-l-2 border-border pl-2 text-sm text-muted-foreground'

/** Body plus its trailing edited marker and status. */
export const messageRowBodyLineClass = 'flex flex-wrap items-baseline gap-x-1.5'

/** `select-text` keeps the body selectable even inside a parent that disables selection. */
export const messageRowBodyClass = 'min-w-0 select-text whitespace-pre-wrap break-words'

export const messageRowEditedClass = 'text-xs text-muted-foreground'

export const messageRowStatusClass = 'inline-flex items-center text-xs text-muted-foreground'

/** Italic + the explicit text say "deleted"; colour only supports it. */
export const messageRowTombstoneClass = 'select-text italic text-muted-foreground'

export const messageRowFooterClass = 'mt-1'

/**
 * Floating toolbar: above the row at the trailing edge, so it sits in the gap
 * between rows rather than over this row's text. Hidden with opacity +
 * `pointer-events-none` (not `display`) so its buttons stay in the Tab order
 * and focusing one reveals it.
 */
export const messageRowToolbarVariants = cva({
  base: [
    'absolute -top-4 right-4 z-10 flex items-center gap-0.5 rounded-md border border-border',
    'bg-popover p-0.5 text-popover-foreground shadow-sm transition-opacity motion-reduce:transition-none',
  ].join(' '),
  variants: {
    visible: {
      true: 'opacity-100',
      false: 'pointer-events-none opacity-0',
    },
  },
  defaultVariants: {
    visible: 'false',
  },
})

/** Consumer quick-reaction slot inside the toolbar. */
export const messageRowToolbarLeadingClass = 'flex items-center gap-0.5'

/** Destructive inline action; the label (tooltip + name) says what it does. */
export const messageRowDestructiveActionClass = 'text-destructive hover:text-destructive'

export const messageRowMenuItemVariants = cva({
  base: 'gap-2',
  variants: {
    destructive: {
      true: 'text-destructive',
      false: '',
    },
  },
  defaultVariants: {
    destructive: 'false',
  },
})

/** Icon wrapper inside an overflow menu item. */
export const messageRowMenuIconClass =
  'inline-flex size-4 shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full'
