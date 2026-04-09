export { EmojiPicker, type EmojiPickerProps } from './emoji-picker.js'

// Re-export headless types
export {
  type EmojiPickerProps as CoreEmojiPickerProps,
  type EmojiPickerAPI,
  type EmojiPickerState,
  type EmojiCategory,
  type EmojiEntry,
  EMOJI_DATA,
  EMOJI_CATEGORIES,
  CATEGORY_LABELS,
  emojiPickerContainerStyles,
  emojiPickerGridStyles,
  emojiPickerEmojiButtonStyles,
} from '@elloloop/emoji-picker'
