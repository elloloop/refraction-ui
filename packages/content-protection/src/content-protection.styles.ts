import { cva } from '@refraction-ui/shared'

export const contentProtectionVariants = cva({
  base: 'relative select-none',
})

export const watermarkVariants = cva({
  base: 'pointer-events-none absolute inset-0 z-50 overflow-hidden',
})
