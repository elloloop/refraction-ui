export { ColorChip, type ColorChipProps } from './color-chip.js'

// Headless helpers consumers need alongside the component (`colorFor` picks a
// stable category for a speaker/tag id).
export {
  colorFor,
  hashColorChipKey,
  isColorChipCategory,
  COLOR_CHIP_CATEGORY_COUNT,
  COLOR_CHIP_CATEGORIES,
  colorChipVariants,
  colorChipWashClasses,
  colorChipDotClasses,
  type ColorChipCategory,
} from '@refraction-ui/color-chip'
