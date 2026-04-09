import { cva } from '@elloloop/shared'

export const menuContentVariants = cva({
  base: 'z-50 rounded-md border bg-popover shadow-md',
})

export const menuItemVariants = cva({
  base: 'relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
})
