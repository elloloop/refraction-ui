import { cva } from '@elloloop/shared'

export const tabsListVariants = cva({
  base: 'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
})

export const tabsTriggerVariants = cva({
  base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
})
