import { cva } from '@refraction-ui/shared'

/** Container — full-height flex column so footers align across a row. */
export const audienceFeatureCardVariants = cva({
  base: 'flex h-full flex-col rounded-xl border border-border bg-card p-5',
  variants: {},
  defaultVariants: {},
})

/** Kicker text above the title. */
export const audienceFeatureCardKickerClass =
  'text-[10px] uppercase tracking-widest text-primary font-semibold'

/** Main title. */
export const audienceFeatureCardTitleClass =
  'mt-2 text-lg font-bold text-foreground'

/** Body copy. */
export const audienceFeatureCardBodyClass =
  'mt-1 text-sm text-muted-foreground leading-relaxed'

/** Footer area — pushed to bottom via mt-auto. */
export const audienceFeatureCardFooterClass = 'mt-auto pt-4 text-xs'
