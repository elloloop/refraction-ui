import { cva } from '@refraction-ui/shared'

export const fileUploadDropZoneVariants = cva({
  base: 'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
  variants: {
    state: {
      idle: 'border-muted-foreground/25 hover:border-muted-foreground/50',
      dragging: 'border-primary bg-primary/5',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },
  defaultVariants: {
    state: 'idle',
  },
})

export const fileUploadFileListStyles =
  'mt-4 space-y-2'

export const fileUploadFileItemStyles =
  'flex items-center gap-3 rounded-md border p-3 text-sm'

export const fileUploadProgressStyles =
  'h-1.5 w-full rounded-full bg-secondary overflow-hidden'

export const fileUploadProgressBarStyles =
  'h-full rounded-full bg-primary transition-all duration-300'

export const fileUploadRemoveButtonStyles =
  'ml-auto text-muted-foreground hover:text-foreground cursor-pointer'
