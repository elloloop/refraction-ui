export {
  createEmojiPicker,
  type EmojiPickerProps,
  type EmojiPickerState,
  type EmojiPickerAPI,
} from './emoji-picker.js'

export {
  EMOJI_DATA,
  EMOJI_CATEGORIES,
  CATEGORY_LABELS,
  EMOJI_COUNT_TOTAL,
  SHORTCODE_ALIASES,
  getAllEmojis,
  resolveShortcode,
  buildShortcodeMap,
  searchEmojis,
  type EmojiCategory,
  type EmojiEntry,
} from './emoji-data.js'

export {
  twemojiFilename,
  twemojiAssetUrl,
  DEFAULT_TWEMOJI_BASE_URL,
} from './twemoji.js'

export {
  STARTER_STICKER_SET,
  type StickerItem,
  type StickerSet,
  type StickerKind,
} from './stickers.js'

export {
  emojiPickerContainerStyles,
  emojiPickerSearchStyles,
  emojiPickerCategoryBarStyles,
  emojiPickerCategoryTabVariants,
  emojiPickerGridStyles,
  emojiPickerEmojiButtonStyles,
  emojiPickerSectionLabelStyles,
  emojiPickerPanelStyles,
  emojiPickerStickerButtonStyles,
} from './emoji-picker.styles.js'
