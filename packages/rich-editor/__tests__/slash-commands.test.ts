import { describe, it, expect, beforeEach } from 'vitest'
import {
  createSlashCommandMenu,
  BUILT_IN_COMMANDS,
  detectSlashTrigger,
} from '../src/slash-commands.js'
import type { SlashCommand } from '../src/slash-commands.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  resetBlockIdCounter,
  getBlockText,
} from '../src/model.js'
import { createCollapsedSelection } from '../src/selection.js'
import type { Document, Block } from '../src/model.js'

beforeEach(() => {
  resetBlockIdCounter()
})

describe('slash-commands', () => {
  // =========================================================================
  // Menu creation
  // =========================================================================
  describe('createSlashCommandMenu', () => {
    it('creates a menu that starts closed', () => {
      const menu = createSlashCommandMenu()
      expect(menu.isOpen).toBe(false)
    })

    it('opens the menu', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      expect(menu.isOpen).toBe(true)
    })

    it('shows all commands when opened with no query', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      expect(menu.filteredCommands.length).toBe(BUILT_IN_COMMANDS.length)
    })

    it('opens with an initial query', () => {
      const menu = createSlashCommandMenu()
      menu.open('head')
      expect(menu.query).toBe('head')
      expect(menu.filteredCommands.length).toBeGreaterThan(0)
    })

    it('closes the menu', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.close()
      expect(menu.isOpen).toBe(false)
      expect(menu.query).toBe('')
      expect(menu.filteredCommands).toEqual([])
    })

    it('selectedIndex starts at 0', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      expect(menu.selectedIndex).toBe(0)
    })
  })

  // =========================================================================
  // Search / Filter
  // =========================================================================
  describe('search', () => {
    it('filters commands by name', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('heading')
      expect(menu.filteredCommands.length).toBeGreaterThan(0)
      expect(menu.filteredCommands.every((c) => c.name.includes('heading') || c.label.toLowerCase().includes('heading') || c.keywords.some((k) => k.includes('heading')))).toBe(true)
    })

    it('filters by label', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('Bullet')
      expect(menu.filteredCommands.length).toBeGreaterThan(0)
    })

    it('filters by keyword', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('h1')
      expect(menu.filteredCommands.length).toBeGreaterThan(0)
      expect(menu.filteredCommands[0].name).toBe('heading1')
    })

    it('returns empty for no match', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('zzzznothing')
      expect(menu.filteredCommands.length).toBe(0)
    })

    it('empty query shows all commands', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('head')
      menu.search('')
      expect(menu.filteredCommands.length).toBe(BUILT_IN_COMMANDS.length)
    })

    it('search is case-insensitive', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('HEADING')
      expect(menu.filteredCommands.length).toBeGreaterThan(0)
    })

    it('filters by description', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('horizontal')
      expect(menu.filteredCommands.some((c) => c.name === 'divider')).toBe(true)
    })
  })

  // =========================================================================
  // Navigation
  // =========================================================================
  describe('navigation', () => {
    it('selectNext advances the index', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.selectNext()
      expect(menu.selectedIndex).toBe(1)
    })

    it('selectNext wraps around', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      const total = menu.filteredCommands.length
      for (let i = 0; i < total; i++) menu.selectNext()
      expect(menu.selectedIndex).toBe(0)
    })

    it('selectPrevious goes backward', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.selectNext()
      menu.selectNext()
      menu.selectPrevious()
      expect(menu.selectedIndex).toBe(1)
    })

    it('selectPrevious wraps to end', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.selectPrevious()
      expect(menu.selectedIndex).toBe(menu.filteredCommands.length - 1)
    })

    it('selectNext does nothing when no commands', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('zzzznothing')
      menu.selectNext()
      expect(menu.selectedIndex).toBe(0)
    })

    it('clamps selectedIndex when filtered list shrinks', () => {
      const menu = createSlashCommandMenu()
      menu.open()
      // Select a high index
      for (let i = 0; i < 8; i++) menu.selectNext()
      // Now filter to fewer results
      menu.search('heading')
      expect(menu.selectedIndex).toBeLessThan(menu.filteredCommands.length)
    })
  })

  // =========================================================================
  // Execute
  // =========================================================================
  describe('execute', () => {
    it('executes the selected command', () => {
      const block = createBlock('paragraph', [createTextSegment('/heading')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 8)

      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('heading1')
      const result = menu.execute(doc, sel)
      expect(result).not.toBeNull()
      if (result) {
        expect(result.doc.blocks[0].type).toBe('heading')
      }
    })

    it('closes the menu after execution', () => {
      const block = createBlock('paragraph', [createTextSegment('/h')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 2)

      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('heading1')
      menu.execute(doc, sel)
      expect(menu.isOpen).toBe(false)
    })

    it('returns null when menu is closed', () => {
      const block = createBlock('paragraph', [createTextSegment('text')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)

      const menu = createSlashCommandMenu()
      const result = menu.execute(doc, sel)
      expect(result).toBeNull()
    })

    it('returns null when no commands match', () => {
      const block = createBlock('paragraph', [createTextSegment('/zzz')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 4)

      const menu = createSlashCommandMenu()
      menu.open()
      menu.search('zzzznothing')
      const result = menu.execute(doc, sel)
      expect(result).toBeNull()
    })

    it('removes slash text before executing command', () => {
      const block = createBlock('paragraph', [createTextSegment('/heading1')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 9)

      const menu = createSlashCommandMenu()
      menu.open('heading1')
      const result = menu.execute(doc, sel)
      expect(result).not.toBeNull()
      if (result) {
        // The slash and query text should be removed
        expect(getBlockText(result.doc.blocks[0])).toBe('')
      }
    })
  })

  // =========================================================================
  // Built-in commands
  // =========================================================================
  describe('built-in commands', () => {
    it('has heading1 command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'heading1')).toBeDefined()
    })

    it('has heading2 command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'heading2')).toBeDefined()
    })

    it('has heading3 command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'heading3')).toBeDefined()
    })

    it('has bullet-list command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'bullet-list')).toBeDefined()
    })

    it('has numbered-list command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'numbered-list')).toBeDefined()
    })

    it('has quote command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'quote')).toBeDefined()
    })

    it('has code command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'code')).toBeDefined()
    })

    it('has divider command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'divider')).toBeDefined()
    })

    it('has image command', () => {
      expect(BUILT_IN_COMMANDS.find((c) => c.name === 'image')).toBeDefined()
    })

    it('each command has name, label, description, keywords', () => {
      for (const cmd of BUILT_IN_COMMANDS) {
        expect(cmd.name).toBeTruthy()
        expect(cmd.label).toBeTruthy()
        expect(cmd.description).toBeTruthy()
        expect(cmd.keywords.length).toBeGreaterThan(0)
      }
    })

    it('heading1 action creates heading block', () => {
      const block = createBlock('paragraph', [createTextSegment('')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)
      const cmd = BUILT_IN_COMMANDS.find((c) => c.name === 'heading1')!
      const result = cmd.action(doc, sel)
      expect(result.doc.blocks[0].type).toBe('heading')
      expect(result.doc.blocks[0].meta?.level).toBe(1)
    })

    it('divider action creates divider block', () => {
      const block = createBlock('paragraph', [createTextSegment('')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)
      const cmd = BUILT_IN_COMMANDS.find((c) => c.name === 'divider')!
      const result = cmd.action(doc, sel)
      expect(result.doc.blocks[0].type).toBe('divider')
    })
  })

  // =========================================================================
  // Custom commands
  // =========================================================================
  describe('custom commands', () => {
    it('accepts custom commands', () => {
      const custom: SlashCommand = {
        name: 'custom',
        label: 'Custom',
        description: 'A custom command',
        keywords: ['test'],
        action: (doc, sel) => ({ doc, selection: sel }),
      }
      const menu = createSlashCommandMenu([custom])
      menu.open()
      expect(menu.filteredCommands).toHaveLength(1)
      expect(menu.filteredCommands[0].name).toBe('custom')
    })

    it('filters custom commands', () => {
      const commands: SlashCommand[] = [
        { name: 'a', label: 'Alpha', description: '', keywords: [], action: (d, s) => ({ doc: d, selection: s }) },
        { name: 'b', label: 'Beta', description: '', keywords: [], action: (d, s) => ({ doc: d, selection: s }) },
      ]
      const menu = createSlashCommandMenu(commands)
      menu.open()
      menu.search('alpha')
      expect(menu.filteredCommands).toHaveLength(1)
    })
  })

  // =========================================================================
  // detectSlashTrigger
  // =========================================================================
  describe('detectSlashTrigger', () => {
    it('detects "/" at start of block', () => {
      const block = createBlock('paragraph', [createTextSegment('/')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 1)
      const result = detectSlashTrigger(doc, sel)
      expect(result.triggered).toBe(true)
      expect(result.query).toBe('')
    })

    it('detects "/" with query', () => {
      const block = createBlock('paragraph', [createTextSegment('/head')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 5)
      const result = detectSlashTrigger(doc, sel)
      expect(result.triggered).toBe(true)
      expect(result.query).toBe('head')
    })

    it('detects "/" after space', () => {
      const block = createBlock('paragraph', [createTextSegment('text /cmd')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 9)
      const result = detectSlashTrigger(doc, sel)
      expect(result.triggered).toBe(true)
      expect(result.query).toBe('cmd')
    })

    it('does not trigger for "/" in the middle of a word', () => {
      const block = createBlock('paragraph', [createTextSegment('a/b')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 3)
      const result = detectSlashTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })

    it('does not trigger when query has spaces', () => {
      const block = createBlock('paragraph', [createTextSegment('/hello world')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 12)
      const result = detectSlashTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })

    it('returns false for no slash', () => {
      const block = createBlock('paragraph', [createTextSegment('hello')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 5)
      const result = detectSlashTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })
  })
})
