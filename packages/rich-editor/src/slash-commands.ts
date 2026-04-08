/**
 * Slash command system.
 * When user types "/" at the start of a block or after a space, a menu appears
 * with available commands that can be filtered by typing.
 */

import type { Document, BlockType } from './model.js'
import type { Selection } from './selection.js'
import type { EditorState } from './operations.js'
import { changeBlockType, insertBlock, deleteSelection } from './operations.js'
import { createCollapsedSelection, createSelection, createPosition } from './selection.js'
import { findBlockById, getBlockText, cloneDocument, createTextSegment } from './model.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlashCommand {
  name: string
  label: string
  description: string
  icon?: string
  keywords: string[]
  action: (doc: Document, sel: Selection) => EditorState
}

export interface SlashCommandMenu {
  isOpen: boolean
  query: string
  filteredCommands: SlashCommand[]
  selectedIndex: number
  open(query?: string): void
  close(): void
  search(query: string): void
  selectNext(): void
  selectPrevious(): void
  execute(doc: Document, sel: Selection): EditorState | null
}

// ---------------------------------------------------------------------------
// Built-in commands
// ---------------------------------------------------------------------------

function makeBlockCommand(
  name: string,
  label: string,
  description: string,
  keywords: string[],
  blockType: BlockType,
  meta?: Record<string, unknown>,
): SlashCommand {
  return {
    name,
    label,
    description,
    keywords,
    action: (doc: Document, sel: Selection): EditorState => {
      return changeBlockType(doc, sel, blockType, meta)
    },
  }
}

export const BUILT_IN_COMMANDS: SlashCommand[] = [
  makeBlockCommand('heading1', 'Heading 1', 'Large section heading', ['h1', 'title', 'heading'], 'heading', { level: 1 }),
  makeBlockCommand('heading2', 'Heading 2', 'Medium section heading', ['h2', 'subtitle', 'heading'], 'heading', { level: 2 }),
  makeBlockCommand('heading3', 'Heading 3', 'Small section heading', ['h3', 'heading'], 'heading', { level: 3 }),
  makeBlockCommand('bullet-list', 'Bullet List', 'Create a bulleted list', ['ul', 'unordered', 'bullet', 'list'], 'list-item', { listType: 'bullet' }),
  makeBlockCommand('numbered-list', 'Numbered List', 'Create a numbered list', ['ol', 'ordered', 'number', 'list'], 'list-item', { listType: 'ordered' }),
  makeBlockCommand('quote', 'Quote', 'Create a blockquote', ['blockquote', 'citation', 'quote'], 'blockquote'),
  makeBlockCommand('code', 'Code Block', 'Create a code block', ['code', 'pre', 'snippet', 'programming'], 'code-block'),
  makeBlockCommand('divider', 'Divider', 'Insert a horizontal divider', ['hr', 'horizontal', 'rule', 'separator', 'line'], 'divider'),
  {
    name: 'image',
    label: 'Image',
    description: 'Insert an image',
    keywords: ['img', 'picture', 'photo'],
    action: (doc: Document, sel: Selection): EditorState => {
      return changeBlockType(doc, sel, 'image')
    },
  },
]

// ---------------------------------------------------------------------------
// Fuzzy filter
// ---------------------------------------------------------------------------
function matchesQuery(command: SlashCommand, query: string): boolean {
  const q = query.toLowerCase()
  if (q === '') return true
  if (command.name.toLowerCase().includes(q)) return true
  if (command.label.toLowerCase().includes(q)) return true
  if (command.description.toLowerCase().includes(q)) return true
  return command.keywords.some((kw) => kw.toLowerCase().includes(q))
}

// ---------------------------------------------------------------------------
// Menu factory
// ---------------------------------------------------------------------------

export function createSlashCommandMenu(commands?: SlashCommand[]): SlashCommandMenu {
  const allCommands = commands ?? BUILT_IN_COMMANDS

  const state = {
    isOpen: false,
    query: '',
    filteredCommands: [] as SlashCommand[],
    selectedIndex: 0,
  }

  function updateFiltered() {
    state.filteredCommands = allCommands.filter((cmd) => matchesQuery(cmd, state.query))
    if (state.selectedIndex >= state.filteredCommands.length) {
      state.selectedIndex = Math.max(0, state.filteredCommands.length - 1)
    }
  }

  const menu: SlashCommandMenu = {
    get isOpen() { return state.isOpen },
    get query() { return state.query },
    get filteredCommands() { return state.filteredCommands },
    get selectedIndex() { return state.selectedIndex },

    open(query?: string) {
      state.isOpen = true
      state.query = query ?? ''
      state.selectedIndex = 0
      updateFiltered()
    },

    close() {
      state.isOpen = false
      state.query = ''
      state.filteredCommands = []
      state.selectedIndex = 0
    },

    search(query: string) {
      state.query = query
      updateFiltered()
    },

    selectNext() {
      if (state.filteredCommands.length === 0) return
      state.selectedIndex = (state.selectedIndex + 1) % state.filteredCommands.length
    },

    selectPrevious() {
      if (state.filteredCommands.length === 0) return
      state.selectedIndex =
        (state.selectedIndex - 1 + state.filteredCommands.length) % state.filteredCommands.length
    },

    execute(doc: Document, sel: Selection): EditorState | null {
      if (!state.isOpen || state.filteredCommands.length === 0) return null
      const command = state.filteredCommands[state.selectedIndex]
      if (!command) return null

      // Remove the slash and query text from the block before executing
      const block = findBlockById(doc, sel.anchor.blockId)
      if (block) {
        const text = getBlockText(block)
        // Find the "/" that started this command
        const slashIdx = text.lastIndexOf('/', sel.anchor.offset)
        if (slashIdx !== -1) {
          const d = cloneDocument(doc)
          const b = d.blocks.find((bl) => bl.id === block.id)!
          const beforeSlash = text.slice(0, slashIdx)
          const afterCursor = text.slice(sel.anchor.offset)
          b.content = [createTextSegment(beforeSlash + afterCursor)]
          const newSel = createCollapsedSelection(b.id, slashIdx)
          const result = command.action(d, newSel)
          menu.close()
          return result
        }
      }

      const result = command.action(doc, sel)
      menu.close()
      return result
    },
  }

  return menu
}

/**
 * Detect whether the user has typed a "/" that should trigger the slash command menu.
 */
export function detectSlashTrigger(
  doc: Document,
  sel: Selection,
): { triggered: boolean; query: string } {
  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return { triggered: false, query: '' }

  const text = getBlockText(block)
  const textBeforeCursor = text.slice(0, sel.anchor.offset)

  // Look for "/" preceded by start-of-text or a space
  const slashIdx = textBeforeCursor.lastIndexOf('/')
  if (slashIdx === -1) return { triggered: false, query: '' }

  // The slash must be at position 0 or preceded by a space
  if (slashIdx > 0 && textBeforeCursor[slashIdx - 1] !== ' ') {
    return { triggered: false, query: '' }
  }

  const query = textBeforeCursor.slice(slashIdx + 1)
  // If query contains spaces, the slash command is no longer active
  if (query.includes(' ')) return { triggered: false, query: '' }

  return { triggered: true, query }
}
