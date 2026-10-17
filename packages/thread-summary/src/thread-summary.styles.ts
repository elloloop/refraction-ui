/**
 * The whole replies line — one button. `flex-wrap` lets the detail drop onto a
 * second line on a narrow row instead of overflowing it; `max-w-full` keeps
 * the button inside its parent so wrapping actually kicks in.
 */
export const threadSummaryClass = [
  'group inline-flex max-w-full min-h-8 flex-wrap items-center gap-x-2 gap-y-0.5',
  'rounded-md px-1.5 py-1 text-left text-xs',
  'transition-colors motion-reduce:transition-none hover:bg-accent',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ')

/** Stack of overlapping replier avatars (decorative). */
export const threadSummaryAvatarsClass = 'inline-flex shrink-0 items-center -space-x-1.5'

/** One avatar in the stack; the ring separates overlapping faces. */
export const threadSummaryAvatarClass = 'ring-2 ring-background'

/**
 * Reply count. Matches the existing replies affordance in `Chat` /
 * `ThreadView` (primary, medium weight, underline on hover) so the line reads
 * as a link to the thread, by weight and underline as well as colour.
 */
export const threadSummaryLabelClass =
  'min-w-0 break-words font-medium text-primary group-hover:underline'

/** Secondary "last reply" text. */
export const threadSummaryDetailClass = 'min-w-0 break-words text-muted-foreground'
