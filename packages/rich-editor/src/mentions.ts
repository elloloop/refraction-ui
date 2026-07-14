/**
 * Mention system — trigger on "@" to show a searchable menu of users/channels/teams.
 */

import type { Document } from './model.js'
import type { Selection } from './selection.js'
import type { MentionSegment } from './model.js'
import { findBlockById, getBlockText, createMentionSegment } from './model.js'
import { detectTriggerInText } from './trigger.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MentionOption {
  id: string
  label: string
  avatar?: string
  type: 'user' | 'channel' | 'team'
}

export interface MentionMenu {
  isOpen: boolean
  query: string
  filteredOptions: MentionOption[]
  selectedIndex: number
  open(): void
  close(): void
  search(query: string): void
  selectNext(): void
  selectPrevious(): void
  select(option: MentionOption): { mention: MentionSegment }
}

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (q === '') return true
  if (t.includes(q)) return true

  // Simple fuzzy: all characters of query appear in order in text
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

function matchScore(option: MentionOption, query: string): number {
  const q = query.toLowerCase()
  const label = option.label.toLowerCase()

  if (label === q) return 100
  if (label.startsWith(q)) return 90
  if (label.includes(q)) return 80
  // Fuzzy match gets lower score
  return 50
}

// ---------------------------------------------------------------------------
// Menu factory
// ---------------------------------------------------------------------------

export function createMentionMenu(options: MentionOption[]): MentionMenu {
  const state = {
    isOpen: false,
    query: '',
    filteredOptions: [] as MentionOption[],
    selectedIndex: 0,
  }

  function updateFiltered() {
    if (state.query === '') {
      state.filteredOptions = [...options]
    } else {
      state.filteredOptions = options
        .filter((opt) => fuzzyMatch(opt.label, state.query) || fuzzyMatch(opt.id, state.query))
        .sort((a, b) => matchScore(b, state.query) - matchScore(a, state.query))
    }
    if (state.selectedIndex >= state.filteredOptions.length) {
      state.selectedIndex = Math.max(0, state.filteredOptions.length - 1)
    }
  }

  const menu: MentionMenu = {
    get isOpen() { return state.isOpen },
    get query() { return state.query },
    get filteredOptions() { return state.filteredOptions },
    get selectedIndex() { return state.selectedIndex },

    open() {
      state.isOpen = true
      state.query = ''
      state.selectedIndex = 0
      updateFiltered()
    },

    close() {
      state.isOpen = false
      state.query = ''
      state.filteredOptions = []
      state.selectedIndex = 0
    },

    search(query: string) {
      state.query = query
      updateFiltered()
    },

    selectNext() {
      if (state.filteredOptions.length === 0) return
      state.selectedIndex = (state.selectedIndex + 1) % state.filteredOptions.length
    },

    selectPrevious() {
      if (state.filteredOptions.length === 0) return
      state.selectedIndex =
        (state.selectedIndex - 1 + state.filteredOptions.length) % state.filteredOptions.length
    },

    select(option: MentionOption): { mention: MentionSegment } {
      menu.close()
      return {
        mention: createMentionSegment(option.id, `@${option.label}`),
      }
    },
  }

  return menu
}

/**
 * Detect whether the user has typed "@" that should trigger the mention menu.
 */
export function detectMentionTrigger(
  doc: Document,
  sel: Selection,
): { triggered: boolean; query: string } {
  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return { triggered: false, query: '' }

  const hit = detectTriggerInText(getBlockText(block), sel.anchor.offset, '@')
  return hit ? { triggered: true, query: hit.query } : { triggered: false, query: '' }
}
