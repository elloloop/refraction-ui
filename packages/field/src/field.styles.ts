import { cva } from '@refraction-ui/shared'

/**
 * Field root. `stacked` puts the label above the control; `inline` is a
 * two-column grid — control, then label — so a hint lines up under the label
 * of a checkbox or switch rather than trailing beside it.
 */
export const fieldVariants = cva({
  base: 'min-w-0',
  variants: {
    layout: {
      stacked: 'flex flex-col gap-1.5',
      inline: 'inline-grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1',
    },
    grow: {
      true: 'flex-1 basis-56',
      false: '',
    },
  },
  defaultVariants: {
    layout: 'stacked',
    grow: 'false',
  },
})

/**
 * Field label. `default` matches the library's form labels; `eyebrow` is the
 * compact uppercase caption used in dense toolbars and filter rows.
 */
export const fieldLabelVariants = cva({
  variants: {
    layout: {
      stacked: '',
      inline: '',
    },
    tone: {
      default: '',
      eyebrow: 'text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground',
    },
  },
  compoundVariants: [
    {
      layout: 'stacked',
      tone: 'default',
      class: 'text-sm font-medium leading-none text-foreground',
    },
    {
      layout: 'inline',
      tone: 'default',
      class: 'text-sm text-foreground',
    },
  ],
  defaultVariants: {
    layout: 'stacked',
    tone: 'default',
  },
})

/** Helper copy under the control (under the label, in the inline layout). */
export const fieldHintVariants = cva({
  base: 'text-xs text-muted-foreground',
  variants: {
    layout: {
      stacked: '',
      inline: 'col-start-2',
    },
  },
  defaultVariants: {
    layout: 'stacked',
  },
})
