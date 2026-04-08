/**
 * Main editor factory — ties together all subsystems into a unified API.
 */

import type {
  Document,
  Mark,
  MarkType,
  BlockType,
} from './model.js'
import {
  createDocument,
  getBlockTextLength,
} from './model.js'
import type { Selection } from './selection.js'
import {
  selectionAtDocStart,
} from './selection.js'
import type { EditorState } from './operations.js'
import {
  insertText as opInsertText,
  deleteBackward as opDeleteBackward,
  deleteForward as opDeleteForward,
  splitBlock as opSplitBlock,
  changeBlockType as opChangeBlockType,
  indentBlock as opIndentBlock,
  outdentBlock as opOutdentBlock,
  toggleMark as opToggleMark,
  getActiveMarks as opGetActiveMarks,
} from './operations.js'
import { processMarkdownShortcut } from './markdown-shortcuts.js'
import type { SlashCommand, SlashCommandMenu } from './slash-commands.js'
import { createSlashCommandMenu } from './slash-commands.js'
import type { MentionOption, MentionMenu } from './mentions.js'
import { createMentionMenu } from './mentions.js'
import { toMarkdown, fromMarkdown, toHTML, toPlainText } from './serialization.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorConfig {
  initialContent?: Document | string
  placeholder?: string
  readOnly?: boolean
  maxLength?: number
  slashCommands?: SlashCommand[]
  mentionOptions?: MentionOption[]
  onUpdate?: (state: EditorState) => void
}

export interface EditorAPI {
  // State
  getState(): EditorState
  getDoc(): Document
  getSelection(): Selection

  // Content
  insertText(text: string): void
  deleteBackward(): void
  deleteForward(): void
  toggleMark(mark: MarkType): void
  changeBlockType(type: BlockType, meta?: Record<string, unknown>): void
  splitBlock(): void
  indentBlock(): void
  outdentBlock(): void

  // Markdown
  getMarkdown(): string
  getHTML(): string
  getPlainText(): string
  setContent(markdown: string): void

  // Menus
  slashMenu: SlashCommandMenu
  mentionMenu: MentionMenu

  // History
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean

  // Marks
  getActiveMarks(): Mark[]
  isMarkActive(type: MarkType): boolean

  // State queries
  isEmpty(): boolean
  getCharCount(): number
  getWordCount(): number

  // Events
  subscribe(fn: (state: EditorState) => void): () => void
  destroy(): void
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createEditor(config?: EditorConfig): EditorAPI {
  const {
    initialContent,
    placeholder,
    readOnly = false,
    maxLength,
    slashCommands,
    mentionOptions = [],
    onUpdate,
  } = config ?? {}

  // Initialize document
  let doc: Document = (() => {
    if (!initialContent) return createDocument()
    if (typeof initialContent === 'string') return fromMarkdown(initialContent)
    return JSON.parse(JSON.stringify(initialContent)) as Document
  })()

  let selection: Selection = selectionAtDocStart(doc)
  const slashMenu = createSlashCommandMenu(slashCommands)
  const mentionMenuInstance = createMentionMenu(mentionOptions)
  const subscribers: Set<(state: EditorState) => void> = new Set()

  // Internal undo/redo stacks (stores pre-edit snapshots)
  let undoStack: EditorState[] = []
  let redoStack: EditorState[] = []
  const MAX_HISTORY = 100

  function cloneState(): EditorState {
    return JSON.parse(JSON.stringify({ doc, selection })) as EditorState
  }

  function getState(): EditorState {
    return { doc, selection }
  }

  function notify(): void {
    const state = getState()
    for (const fn of subscribers) {
      fn(state)
    }
    onUpdate?.(state)
  }

  function pushHistory(): void {
    undoStack.push(cloneState())
    if (undoStack.length > MAX_HISTORY) {
      undoStack = undoStack.slice(undoStack.length - MAX_HISTORY)
    }
    // New edit clears redo
    redoStack = []
  }

  function getPlainTextContent(): string {
    return toPlainText(doc)
  }

  function checkMaxLength(text: string): boolean {
    if (maxLength === undefined) return true
    const currentLen = getPlainTextContent().length
    return currentLen + text.length <= maxLength
  }

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------

  const api: EditorAPI = {
    getState,
    getDoc: () => doc,
    getSelection: () => selection,

    insertText(text: string): void {
      if (readOnly) return
      if (!checkMaxLength(text)) return

      pushHistory()

      // Check markdown shortcuts for single character input
      if (text.length === 1) {
        const shortcutResult = processMarkdownShortcut(doc, selection, text)
        if (shortcutResult.consumed) {
          doc = shortcutResult.doc
          selection = shortcutResult.sel
          notify()
          return
        }
      }

      const result = opInsertText(doc, selection, text)
      doc = result.doc
      selection = result.selection
      notify()
    },

    deleteBackward(): void {
      if (readOnly) return
      pushHistory()
      const result = opDeleteBackward(doc, selection)
      doc = result.doc
      selection = result.selection
      notify()
    },

    deleteForward(): void {
      if (readOnly) return
      pushHistory()
      const result = opDeleteForward(doc, selection)
      doc = result.doc
      selection = result.selection
      notify()
    },

    toggleMark(mark: MarkType): void {
      if (readOnly) return
      pushHistory()
      const result = opToggleMark(doc, selection, mark)
      doc = result.doc
      selection = result.selection
      notify()
    },

    changeBlockType(type: BlockType, meta?: Record<string, unknown>): void {
      if (readOnly) return
      pushHistory()
      const result = opChangeBlockType(doc, selection, type, meta)
      doc = result.doc
      selection = result.selection
      notify()
    },

    splitBlock(): void {
      if (readOnly) return
      pushHistory()
      const result = opSplitBlock(doc, selection)
      doc = result.doc
      selection = result.selection
      notify()
    },

    indentBlock(): void {
      if (readOnly) return
      pushHistory()
      const result = opIndentBlock(doc, selection)
      doc = result.doc
      selection = result.selection
      notify()
    },

    outdentBlock(): void {
      if (readOnly) return
      pushHistory()
      const result = opOutdentBlock(doc, selection)
      doc = result.doc
      selection = result.selection
      notify()
    },

    getMarkdown: () => toMarkdown(doc),
    getHTML: () => toHTML(doc),
    getPlainText: () => toPlainText(doc),

    setContent(markdown: string): void {
      pushHistory()
      doc = fromMarkdown(markdown)
      selection = selectionAtDocStart(doc)
      notify()
    },

    slashMenu,
    mentionMenu: mentionMenuInstance,

    undo(): void {
      if (undoStack.length === 0) return
      // Save current state to redo stack
      redoStack.push(cloneState())
      // Restore from undo stack
      const state = undoStack.pop()!
      doc = state.doc
      selection = state.selection
      notify()
    },

    redo(): void {
      if (redoStack.length === 0) return
      // Save current state to undo stack
      undoStack.push(cloneState())
      // Restore from redo stack
      const state = redoStack.pop()!
      doc = state.doc
      selection = state.selection
      notify()
    },

    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,

    getActiveMarks(): Mark[] {
      return opGetActiveMarks(doc, selection)
    },

    isMarkActive(type: MarkType): boolean {
      return opGetActiveMarks(doc, selection).some((m) => m.type === type)
    },

    isEmpty(): boolean {
      if (doc.blocks.length === 0) return true
      if (doc.blocks.length > 1) return false
      const block = doc.blocks[0]
      return getBlockTextLength(block) === 0
    },

    getCharCount(): number {
      let count = 0
      for (const block of doc.blocks) {
        count += getBlockTextLength(block)
      }
      return count
    },

    getWordCount(): number {
      const text = toPlainText(doc)
      const trimmed = text.trim()
      if (trimmed === '') return 0
      return trimmed.split(/\s+/).length
    },

    subscribe(fn: (state: EditorState) => void): () => void {
      subscribers.add(fn)
      return () => { subscribers.delete(fn) }
    },

    destroy(): void {
      subscribers.clear()
      undoStack = []
      redoStack = []
    },
  }

  return api
}
