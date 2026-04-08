// Model
export type {
  BlockType,
  HeadingLevel,
  MarkType,
  Mark,
  TextSegment,
  MentionSegment,
  EmojiSegment,
  InlineContent,
  Block,
  Document,
} from './model.js'

export {
  generateBlockId,
  resetBlockIdCounter,
  createTextSegment,
  createMentionSegment,
  createEmojiSegment,
  createBlock,
  createDocument,
  getBlockTextLength,
  getBlockText,
  findBlockById,
  findBlockIndex,
  cloneDocument,
  cloneBlock,
  marksEqual,
  normalizeContent,
} from './model.js'

// Selection
export type { Position, Selection } from './selection.js'

export {
  createPosition,
  createSelection,
  createCollapsedSelection,
  isCollapsed,
  isForward,
  getSelectionStart,
  getSelectionEnd,
  getSelectedText,
  getSelectedBlocks,
  clampSelection,
  selectionAtDocStart,
  selectionAtDocEnd,
  selectAll,
} from './selection.js'

// Operations
export type { EditorState } from './operations.js'

export {
  insertText,
  deleteBackward,
  deleteForward,
  deleteSelection,
  insertBlock,
  splitBlock,
  mergeBlockBackward,
  mergeBlockForward,
  changeBlockType,
  indentBlock,
  outdentBlock,
  getActiveMarks,
  toggleMark,
  addMark,
  removeMark,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  moveToStartOfBlock,
  moveToEndOfBlock,
  moveToStartOfDocument,
  moveToEndOfDocument,
  expandSelectionWord,
  insertInlineContent,
} from './operations.js'

// Markdown shortcuts
export { processMarkdownShortcut } from './markdown-shortcuts.js'

// Slash commands
export type { SlashCommand, SlashCommandMenu } from './slash-commands.js'
export { BUILT_IN_COMMANDS, createSlashCommandMenu, detectSlashTrigger } from './slash-commands.js'

// Mentions
export type { MentionOption, MentionMenu } from './mentions.js'
export { createMentionMenu, detectMentionTrigger } from './mentions.js'

// Emoji
export { EMOJI_MAP, detectEmojiShortcode, searchEmoji } from './emoji.js'

// History
export type { HistoryManager } from './history.js'
export { createHistory } from './history.js'

// Serialization
export { toMarkdown, fromMarkdown, toHTML, fromHTML, toPlainText } from './serialization.js'

// Editor
export type { EditorConfig, EditorAPI } from './editor.js'
export { createEditor } from './editor.js'
