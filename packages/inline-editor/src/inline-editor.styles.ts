import { cva } from '@refraction-ui/shared'

export const editorVariants = cva({
  base: 'w-full rounded-md border bg-background',
  variants: {
    state: {
      viewing: 'cursor-pointer hover:bg-muted/50 p-3',
      editing: 'p-0',
    },
  },
  defaultVariants: {
    state: 'viewing',
  },
})

export const toolbarVariants = cva({
  base: 'flex items-center gap-1 border-b px-2 py-1',
  variants: {
    size: {
      sm: 'gap-0.5 px-1 py-0.5',
      md: 'gap-1 px-2 py-1',
      lg: 'gap-2 px-3 py-2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const previewVariants = cva({
  base: 'prose prose-sm max-w-none p-3',
  variants: {
    size: {
      sm: 'prose-xs p-2',
      md: 'prose-sm p-3',
      lg: 'prose-base p-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})
