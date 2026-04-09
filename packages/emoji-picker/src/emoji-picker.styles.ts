import { cva } from '@elloloop/shared'

export const emojiPickerContainerStyles =
  'w-80 rounded-lg border bg-popover text-popover-foreground shadow-md'

export const emojiPickerSearchStyles =
  'w-full border-b px-3 py-2 text-sm bg-transparent outline-none placeholder:text-muted-foreground'

export const emojiPickerCategoryBarStyles =
  'flex border-b px-1'

export const emojiPickerCategoryTabVariants = cva({
  base: 'flex-1 py-1.5 text-center text-lg cursor-pointer hover:bg-accent rounded-md transition-colors',
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
  'flex items-center justify-center h-8 w-8 rounded cursor-pointer text-lg hover:bg-accent transition-colors'

export const emojiPickerSectionLabelStyles =
  'px-2 py-1 text-xs font-medium text-muted-foreground'
