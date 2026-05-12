import { cva } from '@refraction-ui/shared'

export const waveformVariants = cva({
  base: 'relative block overflow-hidden',
  variants: {
    variant: {
      bars: '',
      line: '',
      rings: '',
    },
  },
  defaultVariants: {
    variant: 'bars',
  },
})

export const waveformCanvasVariants = cva({
  base: 'block h-full w-full',
})
