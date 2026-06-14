import { cva } from '@refraction-ui/shared'

/**
 * Container variant that controls the alignment of the whole cluster.
 * Center: auto-margins + text-center + constrained max-width for comfortable
 * line length. Left: no margin constraint, flush left.
 */
export const sectionHeadVariants = cva({
  base: 'flex flex-col',
  variants: {
    align: {
      center: 'mx-auto text-center max-w-2xl',
      left: 'text-left',
    },
  },
  defaultVariants: {
    align: 'center',
  },
})

/** Small-caps eyebrow label above the title. */
export const sectionHeadKickerClass =
  'text-[11px] uppercase tracking-widest text-primary font-semibold'

/** Primary h2 heading. */
export const sectionHeadTitleClass =
  'text-3xl sm:text-4xl font-bold tracking-tight text-foreground'

/** Optional lede paragraph below the title. */
export const sectionHeadLedeClass = 'mt-3 text-muted-foreground leading-relaxed'
