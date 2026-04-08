import type { AccessibilityProps } from '@refraction-ui/shared'
import { generateId } from '@refraction-ui/shared'
import {
  EMOJI_DATA,
  EMOJI_CATEGORIES,
  CATEGORY_LABELS,
  getAllEmojis,
  type EmojiCategory,
  type EmojiEntry,
} from './emoji-data.js'

export interface EmojiPickerProps {
  /** Callback when an emoji is selected */
  onSelect?: (emoji: EmojiEntry) => void
  /** Initial search query */
  search?: string
  /** List of recently used emojis */
  recentEmojis?: EmojiEntry[]
  /** Maximum recent emojis to show */
  maxRecent?: number
}

export interface EmojiPickerState {
  search: string
  activeCategory: EmojiCategory
  filteredEmojis: EmojiEntry[]
  recentEmojis: EmojiEntry[]
}

export interface EmojiPickerAPI {
  /** Current state */
  state: EmojiPickerState
  /** Set search query */
  setSearch(query: string): void
  /** Select an emoji */
  select(emoji: EmojiEntry): void
  /** Set active category tab */
  setCategory(category: EmojiCategory): void
  /** Category tabs with labels */
  categoryTabs: { category: EmojiCategory; label: string; emoji: string }[]
  /** ARIA props for the picker container */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA props for the search input */
  searchInputProps: Record<string, unknown>
  /** Get ARIA props for an emoji button */
  getEmojiAriaProps(emoji: EmojiEntry): Record<string, unknown>
  /** Generated IDs */
  ids: {
    container: string
    search: string
    grid: string
    label: string
  }
}

const CATEGORY_ICONS: Record<EmojiCategory, string> = {
  smileys: '\u{1F600}',
  people: '\u{1F44B}',
  nature: '\u{1F436}',
  food: '\u{1F34E}',
  travel: '\u{1F697}',
  activities: '\u26BD',
  objects: '\u{1F4BB}',
  symbols: '\u2764',
  flags: '\u{1F3C1}',
}

export function createEmojiPicker(props: EmojiPickerProps = {}): EmojiPickerAPI {
  const {
    onSelect,
    search: initialSearch = '',
    recentEmojis: initialRecent = [],
    maxRecent = 20,
  } = props

  let searchQuery = initialSearch
  let activeCategory: EmojiCategory = 'smileys'
  let recentEmojis = [...initialRecent].slice(0, maxRecent)

  const containerId = generateId('rfr-emoji-picker')
  const searchId = generateId('rfr-emoji-search')
  const gridId = generateId('rfr-emoji-grid')
  const labelId = generateId('rfr-emoji-label')

  function getFilteredEmojis(): EmojiEntry[] {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      return getAllEmojis().filter(
        (entry) =>
          entry.name.toLowerCase().includes(query) ||
          entry.keywords.some((kw) => kw.toLowerCase().includes(query)),
      )
    }
    return EMOJI_DATA[activeCategory]
  }

  function setSearch(query: string): void {
    searchQuery = query
  }

  function select(emoji: EmojiEntry): void {
    // Add to recent (deduplicate, prepend)
    recentEmojis = [
      emoji,
      ...recentEmojis.filter((e) => e.emoji !== emoji.emoji),
    ].slice(0, maxRecent)
    onSelect?.(emoji)
  }

  function setCategory(category: EmojiCategory): void {
    activeCategory = category
    searchQuery = ''
  }

  const categoryTabs = EMOJI_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    emoji: CATEGORY_ICONS[cat],
  }))

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'dialog',
    'aria-labelledby': labelId,
    id: containerId,
  }

  const searchInputProps: Record<string, unknown> = {
    type: 'search',
    role: 'searchbox',
    'aria-label': 'Search emojis',
    id: searchId,
    placeholder: 'Search emojis...',
    autoComplete: 'off',
  }

  function getEmojiAriaProps(emoji: EmojiEntry): Record<string, unknown> {
    return {
      role: 'button',
      'aria-label': `${emoji.name} ${emoji.emoji}`,
      title: emoji.name,
    }
  }

  return {
    state: {
      search: searchQuery,
      activeCategory,
      filteredEmojis: getFilteredEmojis(),
      recentEmojis,
    },
    setSearch,
    select,
    setCategory,
    categoryTabs,
    ariaProps,
    searchInputProps,
    getEmojiAriaProps,
    ids: {
      container: containerId,
      search: searchId,
      grid: gridId,
      label: labelId,
    },
  }
}
