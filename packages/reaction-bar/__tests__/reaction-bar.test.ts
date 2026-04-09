import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createReactionBar, type Reaction } from '../src/reaction-bar.js'
import {
  reactionBarStyles,
  reactionPillVariants,
  reactionAddButtonStyles,
  reactionEmojiStyles,
  reactionCountStyles,
} from '../src/reaction-bar.styles.js'

beforeEach(() => {
  resetIdCounter()
})

const reactions: Reaction[] = [
  { emoji: '\u{1F44D}', count: 3, userReacted: true },
  { emoji: '\u2764', count: 1, userReacted: false },
  { emoji: '\u{1F602}', count: 5, userReacted: true },
]

describe('createReactionBar - basic', () => {
  it('passes reactions through', () => {
    const api = createReactionBar({ reactions })
    expect(api.reactions).toHaveLength(3)
  })

  it('preserves reaction data', () => {
    const api = createReactionBar({ reactions })
    expect(api.reactions[0].emoji).toBe('\u{1F44D}')
    expect(api.reactions[0].count).toBe(3)
    expect(api.reactions[0].userReacted).toBe(true)
  })

  it('handles empty reactions', () => {
    const api = createReactionBar({ reactions: [] })
    expect(api.reactions).toHaveLength(0)
  })
})

describe('toggle', () => {
  it('calls onToggle with emoji', () => {
    const onToggle = vi.fn()
    const api = createReactionBar({ reactions, onToggle })
    api.toggle('\u{1F44D}')
    expect(onToggle).toHaveBeenCalledWith('\u{1F44D}')
  })

  it('does not throw when onToggle is not provided', () => {
    const api = createReactionBar({ reactions })
    expect(() => api.toggle('\u{1F44D}')).not.toThrow()
  })

  it('passes the exact emoji string', () => {
    const onToggle = vi.fn()
    const api = createReactionBar({ reactions, onToggle })
    api.toggle('\u2764')
    expect(onToggle).toHaveBeenCalledWith('\u2764')
  })
})

describe('add', () => {
  it('calls onAdd with emoji', () => {
    const onAdd = vi.fn()
    const api = createReactionBar({ reactions, onAdd })
    api.add('\u{1F389}')
    expect(onAdd).toHaveBeenCalledWith('\u{1F389}')
  })

  it('does not throw when onAdd is not provided', () => {
    const api = createReactionBar({ reactions })
    expect(() => api.add('\u{1F389}')).not.toThrow()
  })
})

describe('ARIA props', () => {
  it('container has role=group', () => {
    const api = createReactionBar({ reactions })
    expect(api.ariaProps.role).toBe('group')
  })

  it('container has aria-label', () => {
    const api = createReactionBar({ reactions })
    expect(api.ariaProps['aria-label']).toBe('Reactions')
  })

  it('reaction has role=button', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[0])
    expect(props.role).toBe('button')
  })

  it('reaction has aria-pressed when user reacted', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[0])
    expect(props['aria-pressed']).toBe(true)
  })

  it('reaction has aria-pressed=false when not reacted', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[1])
    expect(props['aria-pressed']).toBe(false)
  })

  it('reaction aria-label includes emoji and count', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[0])
    expect(props['aria-label']).toContain('\u{1F44D}')
    expect(props['aria-label']).toContain('3')
  })

  it('reaction aria-label includes "you reacted" when active', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[0])
    expect(props['aria-label']).toContain('you reacted')
  })

  it('reaction aria-label says "reactions" for plural', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[0])
    expect(props['aria-label']).toContain('reactions')
  })

  it('reaction aria-label says "reaction" for singular', () => {
    const api = createReactionBar({ reactions })
    const props = api.getReactionAriaProps(reactions[1])
    expect(props['aria-label']).toContain('1 reaction')
  })

  it('add button has role=button', () => {
    const api = createReactionBar({ reactions })
    expect(api.addButtonAriaProps.role).toBe('button')
  })

  it('add button has aria-label', () => {
    const api = createReactionBar({ reactions })
    expect(api.addButtonAriaProps['aria-label']).toBe('Add reaction')
  })
})

describe('IDs', () => {
  it('generates unique IDs', () => {
    const api1 = createReactionBar({ reactions })
    const api2 = createReactionBar({ reactions })
    expect(api1.ids.container).not.toBe(api2.ids.container)
  })

  it('has all required ID fields', () => {
    const api = createReactionBar({ reactions })
    expect(api.ids.container).toBeDefined()
    expect(api.ids.label).toBeDefined()
  })
})

describe('styles', () => {
  it('exports bar styles', () => {
    expect(reactionBarStyles).toContain('flex')
  })

  it('exports active pill variant', () => {
    const classes = reactionPillVariants({ state: 'active' })
    expect(classes).toContain('border-primary')
  })

  it('exports inactive pill variant', () => {
    const classes = reactionPillVariants({ state: 'inactive' })
    expect(classes).toContain('border-border')
  })

  it('exports add button styles', () => {
    expect(reactionAddButtonStyles).toContain('rounded-full')
  })

  it('exports emoji styles', () => {
    expect(reactionEmojiStyles).toContain('text-sm')
  })

  it('exports count styles', () => {
    expect(reactionCountStyles).toContain('text-xs')
  })
})
