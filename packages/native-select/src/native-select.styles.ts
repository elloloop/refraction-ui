import { cva } from '@refraction-ui/shared'

/** Wrapper that positions the chevron over the select. */
export const nativeSelectWrapperClass = 'relative inline-flex min-w-0 items-center'

/**
 * The `<select>`: the platform's own listbox (mobile pickers, type-to-select,
 * form submission, `change` events) with the input look. Size-owned utilities
 * live only in the size variants so `size` always wins.
 */
export const nativeSelectVariants = cva({
  base:
    'w-full cursor-pointer appearance-none rounded-md border border-input bg-background text-foreground shadow-sm ' +
    'ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ' +
    'disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    size: {
      sm: 'h-8 pl-2.5 pr-8 text-xs',
      default: 'h-9 pl-3 pr-9 text-sm',
      lg: 'h-10 pl-3 pr-10 text-base',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

/** The chevron: decorative, and never eats the click meant for the select. */
export const nativeSelectIconClass =
  'pointer-events-none absolute right-2.5 h-4 w-4 shrink-0 text-muted-foreground'
