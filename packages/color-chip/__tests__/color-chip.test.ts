import { describe, it, expect } from 'vitest'
import { CATEGORY_COUNT } from '@refraction-ui/tailwind-config'
import {
  COLOR_CHIP_CATEGORIES,
  COLOR_CHIP_CATEGORY_COUNT,
  colorChipDotClasses,
  colorChipEditLabelIncludesLabel,
  colorChipVariants,
  colorChipWashClasses,
  colorFor,
  createColorChip,
  defaultColorChipEditLabel,
  hashColorChipKey,
  isColorChipCategory,
} from '../src/index.js'

describe('palette size', () => {
  it('matches the categorical tokens tailwind-config defines', () => {
    expect(COLOR_CHIP_CATEGORY_COUNT).toBe(CATEGORY_COUNT)
    expect(COLOR_CHIP_CATEGORIES).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('has a literal wash and dot class for every category', () => {
    for (const c of COLOR_CHIP_CATEGORIES) {
      expect(colorChipWashClasses[c]).toBe(`bg-category-${c}-wash text-category-${c}-foreground`)
      expect(colorChipDotClasses[c]).toBe(`bg-category-${c}`)
    }
  })
})

describe('hashColorChipKey (32-bit FNV-1a)', () => {
  it('matches the published FNV-1a test vectors', () => {
    expect(hashColorChipKey('')).toBe(0x811c9dc5)
    expect(hashColorChipKey('a')).toBe(0xe40c292c)
    expect(hashColorChipKey('foobar')).toBe(0xbf9cf968)
  })

  it('is unsigned', () => {
    expect(hashColorChipKey('Ada')).toBe(2596513115)
    expect(hashColorChipKey('Ada')).toBeGreaterThan(0)
  })
})

describe('colorFor', () => {
  // Fixed expectations: these must never change, or every speaker in every
  // saved transcript would swap colour. Ports (Flutter) must match them.
  it.each([
    ['', 6],
    ['a', 5],
    ['Ada', 4],
    ['ada', 4],
    ['Grace Hopper', 4],
    ['speaker-1', 5],
    ['speaker-2', 6],
    ['speaker-3', 3],
    ['user_42', 2],
    ['#design', 5],
    ['from the calendar', 1],
    ['Zoë', 8],
    ['日本語', 7],
    ['😀', 1],
  ] as const)('colorFor(%j) === %i', (key, expected) => {
    expect(colorFor(key)).toBe(expected)
  })

  it('is stable across calls', () => {
    const first = colorFor('speaker-abc')
    for (let i = 0; i < 10; i++) expect(colorFor('speaker-abc')).toBe(first)
  })

  it('uses the key verbatim (no trimming)', () => {
    expect(hashColorChipKey(' Ada')).not.toBe(hashColorChipKey('Ada'))
  })

  it('always returns a valid category and spreads keys evenly', () => {
    const counts = new Map<number, number>()
    const samples = 8000
    for (let i = 0; i < samples; i++) {
      const c = colorFor(`user-${i}`)
      expect(isColorChipCategory(c)).toBe(true)
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    expect(counts.size).toBe(COLOR_CHIP_CATEGORY_COUNT)
    const expected = samples / COLOR_CHIP_CATEGORY_COUNT
    for (const n of counts.values()) {
      expect(Math.abs(n - expected) / expected).toBeLessThan(0.05)
    }
  })
})

describe('isColorChipCategory', () => {
  it('accepts 1..8 integers only', () => {
    expect(isColorChipCategory(1)).toBe(true)
    expect(isColorChipCategory(8)).toBe(true)
    for (const bad of [0, 9, -1, 1.5, NaN, Infinity, '1', null, undefined]) {
      expect(isColorChipCategory(bad)).toBe(false)
    }
  })
})

describe('edit label helpers', () => {
  it('defaults to "Edit <label>"', () => {
    expect(defaultColorChipEditLabel('Ada')).toBe('Edit Ada')
  })

  it('checks label-in-name case-insensitively', () => {
    expect(colorChipEditLabelIncludesLabel('Rename speaker ada', 'Ada')).toBe(true)
    expect(colorChipEditLabelIncludesLabel('Rename speaker', 'Ada')).toBe(false)
    expect(colorChipEditLabelIncludesLabel('Anything', '   ')).toBe(true)
  })
})

describe('createColorChip — colours', () => {
  it('derives the dot from the label and the wash from the dot', () => {
    const api = createColorChip({ label: 'Ada' })
    expect(api.dot).toBe(4)
    expect(api.wash).toBe(4)
    expect(api.dataAttributes).toMatchObject({ 'data-dot': '4', 'data-wash': '4' })
  })

  it('honours explicit dot and wash independently', () => {
    const api = createColorChip({ label: 'Ada', dot: 2, wash: 7 })
    expect(api.dot).toBe(2)
    expect(api.wash).toBe(7)
  })

  it('wash follows an explicit dot', () => {
    expect(createColorChip({ label: 'Ada', dot: 6 }).wash).toBe(6)
  })

  it('falls back when given an out-of-range category', () => {
    const api = createColorChip({ label: 'Ada', dot: 12 as never, wash: 0 as never })
    expect(api.dot).toBe(colorFor('Ada'))
    expect(api.wash).toBe(api.dot)
  })
})

describe('createColorChip — read-only', () => {
  it('has no edit name, tooltip or ARIA', () => {
    const api = createColorChip({ label: 'Ada', hint: 'from the calendar', editLabel: 'x' })
    expect(api.editable).toBe(false)
    expect(api.editLabel).toBeUndefined()
    expect(api.tooltip).toBeUndefined()
    expect(api.ariaProps).toEqual({})
    expect(api.hint).toBe('from the calendar')
    expect(api.dataAttributes['data-editable']).toBe('false')
  })

  it('drops a whitespace-only hint', () => {
    expect(createColorChip({ label: 'Ada', hint: '  ' }).hint).toBeUndefined()
  })
})

describe('createColorChip — editable', () => {
  it('names the button "Edit <label>" and uses that as the tooltip by default', () => {
    const api = createColorChip({ label: 'Ada', editable: true })
    expect(api.editLabel).toBe('Edit Ada')
    expect(api.tooltip).toBe('Edit Ada')
    expect(api.describeTooltip).toBe(false)
    expect(api.ariaProps).toEqual({ 'aria-label': 'Edit Ada' })
    expect(api.dataAttributes['data-editable']).toBe('true')
  })

  it('uses a custom editLabel and falls back from a blank one', () => {
    expect(createColorChip({ label: 'Ada', editable: true, editLabel: 'Rename Ada' }).editLabel).toBe(
      'Rename Ada',
    )
    expect(createColorChip({ label: 'Ada', editable: true, editLabel: ' ' }).editLabel).toBe('Edit Ada')
  })

  it('describes the hint, since aria-label hides the button text', () => {
    const api = createColorChip({
      label: 'Ada',
      hint: 'from the calendar',
      editable: true,
      hintId: 'h1',
      tooltipDescriptionId: 't1',
    })
    expect(api.ariaProps['aria-describedby']).toBe('h1')
  })

  it('describes a tooltip that adds information, after the hint', () => {
    const api = createColorChip({
      label: 'Ada',
      hint: 'from the calendar',
      editable: true,
      editTooltip: 'Change speaker name or colour',
      hintId: 'h1',
      tooltipDescriptionId: 't1',
    })
    expect(api.describeTooltip).toBe(true)
    expect(api.ariaProps['aria-describedby']).toBe('h1 t1')
  })

  it('does not describe a tooltip that repeats the name', () => {
    const api = createColorChip({
      label: 'Ada',
      editable: true,
      editLabel: 'Rename Ada',
      editTooltip: 'Rename Ada',
      tooltipDescriptionId: 't1',
    })
    expect(api.describeTooltip).toBe(false)
    expect(api.ariaProps['aria-describedby']).toBeUndefined()
  })

  it('an empty editTooltip turns the tooltip off', () => {
    const api = createColorChip({ label: 'Ada', editable: true, editTooltip: '' })
    expect(api.tooltip).toBeUndefined()
    expect(api.describeTooltip).toBe(false)
  })

  it('omits ids that were not supplied', () => {
    const api = createColorChip({
      label: 'Ada',
      hint: 'from the calendar',
      editable: true,
      editTooltip: 'More',
    })
    expect(api.ariaProps['aria-describedby']).toBeUndefined()
  })
})

describe('colorChipVariants', () => {
  it('adds the button affordances and focus ring only when editable', () => {
    const editable = colorChipVariants({ editable: 'true' })
    expect(editable).toContain('focus-visible:ring-2')
    expect(editable).toContain('focus-visible:ring-ring')
    expect(editable).toContain('motion-reduce:transition-none')
    expect(editable).toContain('relative')
    const readOnly = colorChipVariants()
    expect(readOnly).not.toContain('focus-visible')
    expect(readOnly).not.toContain('cursor-pointer')
    expect(readOnly).toContain('text-xs')
  })
})
