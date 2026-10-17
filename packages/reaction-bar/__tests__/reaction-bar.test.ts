import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  createReactionBar,
  defaultReactionBarStrings,
  formatReactorNames,
  getReactorsTooltipAlign,
  REACTORS_TOOLTIP_VIEWPORT_MARGIN,
  type Reaction,
} from '../src/reaction-bar.js'
import {
  reactionBarStyles,
  reactionPillVariants,
  reactionAddButtonStyles,
  reactionOverflowButtonStyles,
  reactionTooltipStyles,
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

describe('styles - keyboard and motion', () => {
  const focusRing = [
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
  ]

  it('every button in the bar shows a focus-visible ring', () => {
    for (const classes of [
      reactionPillVariants({ state: 'active' }),
      reactionPillVariants({ state: 'inactive' }),
      reactionAddButtonStyles,
      reactionOverflowButtonStyles,
    ]) {
      for (const ring of focusRing) expect(classes).toContain(ring)
    }
  })

  it('colour transitions stop under reduced motion', () => {
    for (const classes of [
      reactionPillVariants({ state: 'inactive' }),
      reactionAddButtonStyles,
      reactionOverflowButtonStyles,
    ]) {
      expect(classes).toContain('transition-colors')
      expect(classes).toContain('motion-reduce:transition-none')
    }
  })

  it('the tooltip sits above its pill with a hover bridge', () => {
    expect(reactionTooltipStyles).toContain('bottom-full')
    expect(reactionTooltipStyles).toContain('pb-1')
  })

  it('the tooltip lines up with the start edge, or the end edge when flipped', () => {
    expect(reactionTooltipStyles).toContain('start-0')
    expect(reactionTooltipStyles).toContain('data-[align=end]:start-auto')
    expect(reactionTooltipStyles).toContain('data-[align=end]:end-0')
  })
})

describe('getReactorsTooltipAlign', () => {
  const pill = (left: number) => ({ left, right: left + 40 })

  it('keeps the start edge when the tooltip fits', () => {
    expect(getReactorsTooltipAlign({ anchor: pill(20), tooltipWidth: 200, viewportWidth: 800 })).toBe('start')
  })

  it('flips to the end edge near the far side of the viewport', () => {
    // Start-aligned it would span 700..900 on an 800px viewport.
    expect(getReactorsTooltipAlign({ anchor: pill(700), tooltipWidth: 200, viewportWidth: 800 })).toBe('end')
  })

  it('keeps the margin from the edge', () => {
    const fits = 800 - REACTORS_TOOLTIP_VIEWPORT_MARGIN - 200
    expect(getReactorsTooltipAlign({ anchor: pill(fits), tooltipWidth: 200, viewportWidth: 800 })).toBe('start')
    expect(getReactorsTooltipAlign({ anchor: pill(fits + 1), tooltipWidth: 200, viewportWidth: 800 })).toBe('end')
    expect(
      getReactorsTooltipAlign({ anchor: pill(fits + 1), tooltipWidth: 200, viewportWidth: 800, margin: 0 }),
    ).toBe('start')
  })

  it('does not flip when the end edge would be worse', () => {
    // A tooltip wider than the space on either side of a pill in a narrow
    // viewport: start-aligned crosses the right edge by less than end-aligned
    // would cross the left.
    expect(getReactorsTooltipAlign({ anchor: pill(60), tooltipWidth: 300, viewportWidth: 320 })).toBe('start')
  })

  it('mirrors for right-to-left text, where start is the right edge', () => {
    // Start-aligned in RTL it would span -140..100.
    expect(
      getReactorsTooltipAlign({ anchor: pill(60), tooltipWidth: 240, viewportWidth: 800, direction: 'rtl' }),
    ).toBe('end')
    expect(
      getReactorsTooltipAlign({ anchor: pill(500), tooltipWidth: 240, viewportWidth: 800, direction: 'rtl' }),
    ).toBe('start')
  })
})

describe('formatReactorNames', () => {
  it('names one, two and three people', () => {
    expect(formatReactorNames(['Ana'])).toBe('Ana')
    expect(formatReactorNames(['Ana', 'Dev'])).toBe('Ana and Dev')
    expect(formatReactorNames(['Ana', 'Dev', 'Sam'])).toBe('Ana, Dev and Sam')
  })

  it('folds everyone past three into "N others"', () => {
    expect(formatReactorNames(['Ana', 'Dev', 'Sam', 'Lee'])).toBe('Ana, Dev, Sam and 1 other')
    expect(formatReactorNames(['Ana', 'Dev', 'Sam', 'Lee', 'Kim'])).toBe(
      'Ana, Dev, Sam and 2 others',
    )
  })

  it('counts people the names list leaves out', () => {
    expect(formatReactorNames(['You', 'Dev Patel'], { total: 5 })).toBe(
      'You, Dev Patel and 3 others',
    )
    expect(formatReactorNames(['Ana'], { total: 2 })).toBe('Ana and 1 other')
  })

  it('never reports fewer people than it names', () => {
    expect(formatReactorNames(['Ana', 'Dev'], { total: 1 })).toBe('Ana and Dev')
  })

  it('lists up to maxNamed people', () => {
    const names = Array.from({ length: 30 }, (_, i) => `P${i + 1}`)
    const sentence = formatReactorNames(names, { maxNamed: 25 })
    expect(sentence.startsWith('P1, P2,')).toBe(true)
    expect(sentence).toContain('P25 and 5 others')
    expect(sentence).not.toContain('P26')
  })

  it('ignores a non-finite or sub-one maxNamed and total', () => {
    expect(formatReactorNames(['Ana', 'Dev', 'Sam', 'Lee'], { maxNamed: Number.NaN })).toBe(
      'Ana, Dev, Sam and 1 other',
    )
    expect(formatReactorNames(['Ana', 'Dev'], { maxNamed: 0 })).toBe('Ana and 1 other')
    expect(formatReactorNames(['Ana'], { total: Number.POSITIVE_INFINITY })).toBe('Ana')
  })

  it('returns an empty string for nobody', () => {
    expect(formatReactorNames([])).toBe('')
  })
})

describe('default strings', () => {
  it('phrase the who-reacted tooltip from names, label and total', () => {
    expect(defaultReactionBarStrings.reactorsTooltip(['Ana'], 'eyes', 1)).toBe(
      'Ana reacted with eyes',
    )
    expect(
      defaultReactionBarStrings.reactorsTooltip(['Ana', 'Dev', 'Sam', 'Lee', 'Kim'], 'Agree', 5),
    ).toBe('Ana, Dev, Sam and 2 others reacted with Agree')
  })

  it('label the overflow button for one and many', () => {
    expect(defaultReactionBarStrings.showMore(2)).toBe('+2')
    expect(defaultReactionBarStrings.showMoreLabel(1)).toBe('Show 1 more reaction')
    expect(defaultReactionBarStrings.showMoreLabel(4)).toBe('Show 4 more reactions')
    expect(defaultReactionBarStrings.showLess).toBe('Show less')
  })
})

describe('labels and who reacted', () => {
  const agree: Reaction = {
    emoji: '\u{1F44D}',
    label: 'Agree',
    count: 5,
    userReacted: true,
    reactors: ['You', 'Dev Patel'],
  }

  it('a label replaces the emoji in the accessible name', () => {
    const api = createReactionBar({ reactions: [agree] })
    expect(api.getReactionAriaProps(agree)['aria-label']).toBe('Agree 5 reactions, you reacted')
  })

  it('a reaction with reactors gets a tooltip it is described by', () => {
    const api = createReactionBar({ reactions: [agree], idPrefix: 'bar' })
    const tooltip = api.getReactorsTooltip(agree)
    expect(tooltip).toEqual({
      id: 'bar-reactors-0',
      role: 'tooltip',
      text: 'You, Dev Patel and 3 others reacted with Agree',
    })
    expect(api.getReactionAriaProps(agree)['aria-describedby']).toBe('bar-reactors-0')
  })

  it('the tooltip falls back to the emoji when there is no label', () => {
    const party: Reaction = { emoji: '\u{1F389}', count: 1, userReacted: false, reactors: ['Ana'] }
    const api = createReactionBar({ reactions: [party] })
    expect(api.getReactorsTooltip(party)?.text).toBe('Ana reacted with \u{1F389}')
  })

  it('no reactors, no tooltip and no description', () => {
    const api = createReactionBar({ reactions })
    expect(api.getReactorsTooltip(reactions[0])).toBeNull()
    expect(api.getReactionAriaProps(reactions[0])).not.toHaveProperty('aria-describedby')
    const empty: Reaction = { ...reactions[1], reactors: [] }
    expect(createReactionBar({ reactions: [empty] }).getReactorsTooltip(empty)).toBeNull()
  })

  it('tooltip ids are unique per reaction', () => {
    const many: Reaction[] = [
      { ...agree, emoji: '\u{1F44D}' },
      { ...agree, emoji: '\u{1F389}' },
    ]
    const api = createReactionBar({ reactions: many, idPrefix: 'bar' })
    expect(api.getReactorsTooltip(many[0])?.id).toBe('bar-reactors-0')
    expect(api.getReactorsTooltip(many[1])?.id).toBe('bar-reactors-1')
  })

  it('an idPrefix names the container', () => {
    const api = createReactionBar({ reactions, idPrefix: 'thread-42' })
    expect(api.ariaProps.id).toBe('thread-42')
    expect(api.ids.container).toBe('thread-42')
  })
})

describe('overflow', () => {
  const four: Reaction[] = [
    { emoji: 'a', count: 1, userReacted: false },
    { emoji: 'b', count: 1, userReacted: false },
    { emoji: 'c', count: 1, userReacted: false },
    { emoji: 'd', count: 1, userReacted: false },
  ]

  it('shows everything without maxVisible', () => {
    const api = createReactionBar({ reactions: four })
    expect(api.visibleReactions).toHaveLength(4)
    expect(api.overflowing).toBe(false)
    expect(api.hiddenCount).toBe(0)
    expect(api.overflowButtonAriaProps).toBeNull()
    expect(api.overflowButtonText).toBeNull()
  })

  it('collapses past maxVisible into a "+N" button', () => {
    const api = createReactionBar({ reactions: four, maxVisible: 2, idPrefix: 'bar' })
    expect(api.visibleReactions.map((r) => r.emoji)).toEqual(['a', 'b'])
    expect(api.overflowing).toBe(true)
    expect(api.hiddenCount).toBe(2)
    expect(api.overflowButtonText).toBe('+2')
    expect(api.overflowButtonAriaProps).toEqual({
      'aria-expanded': false,
      'aria-controls': 'bar',
      'aria-label': 'Show 2 more reactions',
    })
  })

  it('an expanded bar shows everything and offers "Show less"', () => {
    const api = createReactionBar({ reactions: four, maxVisible: 2, expanded: true })
    expect(api.visibleReactions).toHaveLength(4)
    expect(api.hiddenCount).toBe(0)
    expect(api.overflowButtonText).toBe('Show less')
    expect(api.overflowButtonAriaProps?.['aria-expanded']).toBe(true)
    expect(api.overflowButtonAriaProps?.['aria-label']).toBe('Show less')
  })

  it('does not overflow at exactly maxVisible', () => {
    const api = createReactionBar({ reactions: four, maxVisible: 4 })
    expect(api.overflowing).toBe(false)
    expect(api.visibleReactions).toHaveLength(4)
  })

  it('clamps a negative maxVisible to zero and ignores a non-finite one', () => {
    expect(createReactionBar({ reactions: four, maxVisible: -3 }).visibleReactions).toHaveLength(0)
    expect(createReactionBar({ reactions: four, maxVisible: Number.NaN }).overflowing).toBe(false)
    expect(createReactionBar({ reactions: four, maxVisible: 2.9 }).visibleReactions).toHaveLength(2)
  })
})

describe('strings', () => {
  it('overrides replace the defaults one by one', () => {
    const api = createReactionBar({
      reactions: [{ emoji: '\u{1F44D}', label: 'thumbs up', count: 3, userReacted: true }],
      maxVisible: 0,
      strings: {
        groupLabel: 'Réactions',
        addReaction: 'Ajouter une réaction',
        reactionSemantics: (label, count, mine) =>
          `${label}: ${count} reactions${mine ? ', including you' : ''}`,
      },
    })
    expect(api.ariaProps['aria-label']).toBe('Réactions')
    expect(api.addButtonAriaProps['aria-label']).toBe('Ajouter une réaction')
    expect(api.getReactionAriaProps(api.reactions[0])['aria-label']).toBe(
      'thumbs up: 3 reactions, including you',
    )
    // Untouched strings keep their defaults.
    expect(api.overflowButtonText).toBe('+1')
    expect(api.strings.showLess).toBe('Show less')
  })
})
