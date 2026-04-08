import { describe, it, expect, beforeEach } from 'vitest'
import { createMentionMenu, detectMentionTrigger } from '../src/mentions.js'
import type { MentionOption } from '../src/mentions.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  resetBlockIdCounter,
} from '../src/model.js'
import { createCollapsedSelection } from '../src/selection.js'

const MOCK_OPTIONS: MentionOption[] = [
  { id: 'u1', label: 'Alice', type: 'user' },
  { id: 'u2', label: 'Bob', type: 'user' },
  { id: 'u3', label: 'Charlie', type: 'user' },
  { id: 'c1', label: 'general', type: 'channel' },
  { id: 'c2', label: 'random', type: 'channel' },
  { id: 't1', label: 'Engineering', type: 'team' },
  { id: 't2', label: 'Design', type: 'team' },
  { id: 'u4', label: 'Alicia', type: 'user' },
]

beforeEach(() => {
  resetBlockIdCounter()
})

describe('mentions', () => {
  // =========================================================================
  // Menu creation
  // =========================================================================
  describe('createMentionMenu', () => {
    it('creates a closed menu', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      expect(menu.isOpen).toBe(false)
    })

    it('opens the menu', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      expect(menu.isOpen).toBe(true)
    })

    it('shows all options when opened', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      expect(menu.filteredOptions).toHaveLength(MOCK_OPTIONS.length)
    })

    it('closes the menu', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.close()
      expect(menu.isOpen).toBe(false)
      expect(menu.query).toBe('')
      expect(menu.filteredOptions).toEqual([])
    })

    it('starts with selectedIndex 0', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      expect(menu.selectedIndex).toBe(0)
    })
  })

  // =========================================================================
  // Search / Filter
  // =========================================================================
  describe('search', () => {
    it('filters by label substring', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('Ali')
      expect(menu.filteredOptions.length).toBeGreaterThanOrEqual(2)
      expect(menu.filteredOptions.some((o) => o.label === 'Alice')).toBe(true)
      expect(menu.filteredOptions.some((o) => o.label === 'Alicia')).toBe(true)
    })

    it('filters by id', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('u1')
      expect(menu.filteredOptions.some((o) => o.id === 'u1')).toBe(true)
    })

    it('returns empty for no match', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('zzzznothing')
      expect(menu.filteredOptions).toHaveLength(0)
    })

    it('empty query returns all', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('Ali')
      menu.search('')
      expect(menu.filteredOptions).toHaveLength(MOCK_OPTIONS.length)
    })

    it('sorts by relevance — exact start match first', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('Alice')
      expect(menu.filteredOptions[0].label).toBe('Alice')
    })

    it('fuzzy matches characters in order', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('Chle') // C..h..l..e in "Charlie"
      expect(menu.filteredOptions.some((o) => o.label === 'Charlie')).toBe(true)
    })

    it('case insensitive search', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('alice')
      expect(menu.filteredOptions.some((o) => o.label === 'Alice')).toBe(true)
    })
  })

  // =========================================================================
  // Navigation
  // =========================================================================
  describe('navigation', () => {
    it('selectNext advances index', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.selectNext()
      expect(menu.selectedIndex).toBe(1)
    })

    it('selectNext wraps around', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      for (let i = 0; i < MOCK_OPTIONS.length; i++) menu.selectNext()
      expect(menu.selectedIndex).toBe(0)
    })

    it('selectPrevious goes back', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.selectNext()
      menu.selectNext()
      menu.selectPrevious()
      expect(menu.selectedIndex).toBe(1)
    })

    it('selectPrevious wraps to end', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.selectPrevious()
      expect(menu.selectedIndex).toBe(MOCK_OPTIONS.length - 1)
    })

    it('does nothing when no options', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('zzzznothing')
      menu.selectNext()
      expect(menu.selectedIndex).toBe(0)
    })

    it('clamps index when filtered list shrinks', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      for (let i = 0; i < 6; i++) menu.selectNext()
      menu.search('Alice')
      expect(menu.selectedIndex).toBeLessThanOrEqual(menu.filteredOptions.length - 1)
    })
  })

  // =========================================================================
  // Select (insert mention)
  // =========================================================================
  describe('select', () => {
    it('returns a mention segment', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      const result = menu.select(MOCK_OPTIONS[0])
      expect(result.mention.type).toBe('mention')
      expect(result.mention.id).toBe('u1')
      expect(result.mention.label).toBe('@Alice')
    })

    it('closes the menu after selection', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.select(MOCK_OPTIONS[0])
      expect(menu.isOpen).toBe(false)
    })

    it('returns mention for channel type', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      const channel = MOCK_OPTIONS.find((o) => o.type === 'channel')!
      const result = menu.select(channel)
      expect(result.mention.label).toBe(`@${channel.label}`)
    })

    it('returns mention for team type', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      const team = MOCK_OPTIONS.find((o) => o.type === 'team')!
      const result = menu.select(team)
      expect(result.mention.label).toBe(`@${team.label}`)
    })
  })

  // =========================================================================
  // Multiple mention types
  // =========================================================================
  describe('mention types', () => {
    it('filters users', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('Bob')
      expect(menu.filteredOptions.every((o) => o.label.toLowerCase().includes('bob') || o.id.includes('Bob'))).toBe(true)
    })

    it('filters channels', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('general')
      expect(menu.filteredOptions.some((o) => o.type === 'channel' && o.label === 'general')).toBe(true)
    })

    it('filters teams', () => {
      const menu = createMentionMenu(MOCK_OPTIONS)
      menu.open()
      menu.search('Engineering')
      expect(menu.filteredOptions.some((o) => o.type === 'team')).toBe(true)
    })
  })

  // =========================================================================
  // detectMentionTrigger
  // =========================================================================
  describe('detectMentionTrigger', () => {
    it('detects "@" at start of block', () => {
      const block = createBlock('paragraph', [createTextSegment('@')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 1)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(true)
      expect(result.query).toBe('')
    })

    it('detects "@" with query', () => {
      const block = createBlock('paragraph', [createTextSegment('@ali')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 4)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(true)
      expect(result.query).toBe('ali')
    })

    it('detects "@" after space', () => {
      const block = createBlock('paragraph', [createTextSegment('hey @bob')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 8)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(true)
      expect(result.query).toBe('bob')
    })

    it('does not trigger in middle of word', () => {
      const block = createBlock('paragraph', [createTextSegment('email@example')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 13)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })

    it('does not trigger when query has spaces', () => {
      const block = createBlock('paragraph', [createTextSegment('@hello world')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 12)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })

    it('returns false for no @', () => {
      const block = createBlock('paragraph', [createTextSegment('hello')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 5)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })

    it('returns false for nonexistent block', () => {
      const doc = createDocument()
      const sel = createCollapsedSelection('nonexistent', 0)
      const result = detectMentionTrigger(doc, sel)
      expect(result.triggered).toBe(false)
    })
  })
})
