/**
 * Root: text cluster on the leading edge, actions on the trailing edge; wraps
 * on narrow screens. Carries no outer margin — the page layout spaces it.
 */
export const pageHeaderClass = 'flex flex-wrap items-start justify-between gap-4'

/** Text cluster (kicker, title, description). */
export const pageHeaderTextClass = 'flex min-w-0 flex-1 flex-col gap-1'

/** Small uppercase eyebrow above the title. */
export const pageHeaderKickerClass =
  'break-words text-[11px] uppercase tracking-wider text-muted-foreground'

/** Title — app-sized, not a marketing display size. */
export const pageHeaderTitleClass = 'break-words text-xl font-semibold text-foreground'

/** Supporting copy under the title, capped at a readable measure. */
export const pageHeaderDescriptionClass = 'max-w-prose text-sm text-muted-foreground'

/** Trailing actions row. */
export const pageHeaderActionsClass = 'flex flex-none flex-wrap items-center gap-2'
