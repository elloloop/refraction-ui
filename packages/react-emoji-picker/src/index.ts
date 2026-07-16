export {
  EmojiPicker,
  type EmojiPickerProps,
  type EmojiRenderer,
  type StickerRenderer,
  nativeEmojiRenderer,
  twemojiRenderer,
  createTwemojiRenderer,
  defaultStickerRenderer,
} from './emoji-picker.js'

// Re-export headless types + shared dataset/seams so consumers can build custom
// pickers or renderers against the single source of truth.
export {
  type EmojiPickerProps as CoreEmojiPickerProps,
  type EmojiPickerAPI,
  type EmojiPickerState,
  type EmojiCategory,
  type EmojiEntry,
  type StickerItem,
  type StickerSet,
  type StickerKind,
  EMOJI_DATA,
  EMOJI_CATEGORIES,
  CATEGORY_LABELS,
  EMOJI_COUNT_TOTAL,
  SHORTCODE_ALIASES,
  getAllEmojis,
  resolveShortcode,
  buildShortcodeMap,
  searchEmojis,
  twemojiFilename,
  twemojiAssetUrl,
  DEFAULT_TWEMOJI_BASE_URL,
  STARTER_STICKER_SET,
  emojiPickerContainerStyles,
  emojiPickerGridStyles,
  emojiPickerEmojiButtonStyles,
} from '@refraction-ui/emoji-picker'
