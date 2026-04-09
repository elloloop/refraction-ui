import * as React from 'react'
import {
  createEmojiPicker,
  EMOJI_DATA,
  EMOJI_CATEGORIES,
  CATEGORY_LABELS,
  emojiPickerContainerStyles,
  emojiPickerSearchStyles,
  emojiPickerCategoryBarStyles,
  emojiPickerCategoryTabVariants,
  emojiPickerGridStyles,
  emojiPickerEmojiButtonStyles,
  emojiPickerSectionLabelStyles,
  type EmojiCategory,
  type EmojiEntry,
} from '@elloloop/emoji-picker'
import { cn } from '@elloloop/shared'

export interface EmojiPickerProps {
  onSelect?: (emoji: EmojiEntry) => void
  recentEmojis?: EmojiEntry[]
  className?: string
}

export function EmojiPicker({ onSelect, recentEmojis: initialRecent = [], className }: EmojiPickerProps) {
  const [search, setSearch] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<EmojiCategory>('smileys')
  const [recentEmojis, setRecentEmojis] = React.useState<EmojiEntry[]>(initialRecent)

  const api = React.useMemo(
    () =>
      createEmojiPicker({
        onSelect: undefined,
        search,
        recentEmojis,
      }),
    [search, recentEmojis],
  )

  const filteredEmojis = React.useMemo(() => {
    if (search.trim()) {
      const query = search.toLowerCase().trim()
      const allEmojis = EMOJI_CATEGORIES.flatMap((cat) => EMOJI_DATA[cat])
      return allEmojis.filter(
        (entry) =>
          entry.name.toLowerCase().includes(query) ||
          entry.keywords.some((kw) => kw.toLowerCase().includes(query)),
      )
    }
    return EMOJI_DATA[activeCategory]
  }, [search, activeCategory])

  const handleSelect = (emoji: EmojiEntry) => {
    setRecentEmojis((prev) =>
      [emoji, ...prev.filter((e) => e.emoji !== emoji.emoji)].slice(0, 20),
    )
    onSelect?.(emoji)
  }

  const handleCategoryClick = (cat: EmojiCategory) => {
    setActiveCategory(cat)
    setSearch('')
  }

  return React.createElement(
    'div',
    { className: cn(emojiPickerContainerStyles, className), ...api.ariaProps },
    // Search input
    React.createElement('input', {
      ...api.searchInputProps,
      className: emojiPickerSearchStyles,
      value: search,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    }),
    // Category tabs
    !search &&
      React.createElement(
        'div',
        { className: emojiPickerCategoryBarStyles },
        api.categoryTabs.map((tab) =>
          React.createElement(
            'button',
            {
              key: tab.category,
              type: 'button',
              className: emojiPickerCategoryTabVariants({
                state: tab.category === activeCategory ? 'active' : 'inactive',
              }),
              onClick: () => handleCategoryClick(tab.category),
              title: tab.label,
              'aria-label': tab.label,
            },
            tab.emoji,
          ),
        ),
      ),
    // Recent emojis section
    !search &&
      recentEmojis.length > 0 &&
      React.createElement(
        'div',
        null,
        React.createElement('div', { className: emojiPickerSectionLabelStyles }, 'Recent'),
        React.createElement(
          'div',
          { className: emojiPickerGridStyles },
          recentEmojis.map((emoji, i) =>
            React.createElement(
              'button',
              {
                key: `recent-${emoji.emoji}-${i}`,
                type: 'button',
                className: emojiPickerEmojiButtonStyles,
                onClick: () => handleSelect(emoji),
                ...api.getEmojiAriaProps(emoji),
              },
              emoji.emoji,
            ),
          ),
        ),
      ),
    // Emoji grid
    React.createElement(
      'div',
      null,
      !search &&
        React.createElement(
          'div',
          { className: emojiPickerSectionLabelStyles },
          CATEGORY_LABELS[activeCategory],
        ),
      React.createElement(
        'div',
        { className: emojiPickerGridStyles },
        filteredEmojis.map((emoji, i) =>
          React.createElement(
            'button',
            {
              key: `${emoji.emoji}-${i}`,
              type: 'button',
              className: emojiPickerEmojiButtonStyles,
              onClick: () => handleSelect(emoji),
              ...api.getEmojiAriaProps(emoji),
            },
            emoji.emoji,
          ),
        ),
        filteredEmojis.length === 0 &&
          React.createElement(
            'div',
            { className: 'col-span-8 text-center text-sm text-muted-foreground py-4' },
            'No emojis found',
          ),
      ),
    ),
  )
}

EmojiPicker.displayName = 'EmojiPicker'
