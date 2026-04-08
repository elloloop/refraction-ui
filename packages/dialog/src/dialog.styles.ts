import { cva } from '@refraction-ui/shared'

export const overlayStyles =
  'fixed inset-0 z-50 bg-black/80'

export const dialogContentVariants = cva({
  base: 'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
})
