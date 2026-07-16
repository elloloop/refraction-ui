import { cva } from '@refraction-ui/shared'

export const emojiPickerContainerStyles =
  'w-80 rounded-lg border bg-popover text-popover-foreground shadow-md motion-safe:animate-fade-in-scale origin-top'

export const emojiPickerSearchStyles =
  'w-full border-b px-3 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground'

export const emojiPickerCategoryBarStyles =
  'flex border-b px-1'

export const emojiPickerCategoryTabVariants = cva({
  base: 'flex-1 py-1.5 text-center text-lg cursor-pointer hover:bg-accent rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  variants: {
    state: {
      active: 'bg-accent',
      inactive: '',
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
})

export const emojiPickerGridStyles =
  'grid grid-cols-8 gap-0.5 p-2 max-h-64 overflow-y-auto'

export const emojiPickerEmojiButtonStyles =
  'flex items-center justify-center h-8 w-8 rounded cursor-pointer text-lg transition-transform duration-100 ease-out hover:bg-accent hover:scale-125 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:scale-100'

export const emojiPickerSectionLabelStyles =
  'px-2 py-1 text-xs font-medium text-muted-foreground'

/** The swappable category/search/sticker panel; fades on category switch. */
export const emojiPickerPanelStyles =
  'motion-safe:animate-fade-in origin-top'

/** A single sticker cell in the sticker tab. */
export const emojiPickerStickerButtonStyles =
  'flex items-center justify-center rounded-lg p-1.5 aspect-square cursor-pointer transition-transform duration-100 ease-out hover:bg-accent hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:scale-100'
