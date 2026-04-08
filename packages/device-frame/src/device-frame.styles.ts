import { cva } from '@refraction-ui/shared'

export const deviceFrameVariants = cva({
  base: 'relative overflow-hidden bg-black border-4 border-gray-800 shadow-xl',
  variants: {
    device: {
      iphone: 'rounded-[44px] border-[6px]',
      ipad: 'rounded-[18px] border-[6px]',
      'android-phone': 'rounded-[24px] border-4',
      'android-tablet': 'rounded-[16px] border-4',
    },
    orientation: {
      portrait: '',
      landscape: '',
    },
  },
  defaultVariants: {
    device: 'iphone',
    orientation: 'portrait',
  },
})
