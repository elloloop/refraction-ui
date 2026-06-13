import { cva } from '@refraction-ui/shared'

/** Outer frame wrapping the chrome bar and content. */
export const browserChromeMockVariants = cva({
  base: 'rounded-xl border border-border overflow-hidden bg-card',
  variants: {},
  defaultVariants: {},
})

/** The chrome toolbar row containing dots, URL bar, and optional badge. */
export const chromeBarClass =
  'flex items-center gap-2 bg-muted/40 border-b border-border px-3 py-2'

/** A single traffic-light dot. */
export const trafficDotClass = 'size-2.5 rounded-full border border-border'

/** Centered URL bar. */
export const urlBarClass = 'flex-1 text-center font-mono text-[11px] text-muted-foreground'

/** Bold domain segment inside the URL bar. */
export const urlDomainClass = 'font-semibold text-foreground'

/**
 * Status badge shown in the chrome bar.
 *
 * live  → emerald tint (approved exception to semantic tokens)
 * rec   → destructive tint with a pulsing dot
 */
export const statusBadgeVariants = cva({
  base: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
  variants: {
    status: {
      live: 'text-emerald-500 bg-emerald-500/10',
      rec: 'text-destructive bg-destructive/10',
    },
  },
  defaultVariants: {
    status: 'live',
  },
})

/** Inner content area that receives slotted/children content. */
export const contentAreaClass = 'p-0'
