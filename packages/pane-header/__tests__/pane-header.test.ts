import { describe, it, expect } from 'vitest'
import {
  createPaneHeader,
  resolvePaneHeaderHeight,
  resolvePaneHeaderHeadingLevel,
  paneHeaderHeightStyle,
  getPaneHeaderIds,
  PANE_HEADER_HEIGHT_VAR,
  PANE_HEADER_DEFAULT_HEIGHT,
  PANE_HEADER_DEFAULT_HEADING_LEVEL,
  paneHeaderTitleBlockVariants,
  paneHeaderActionsClass,
  paneHeaderTitleClass,
  paneHeaderTextClass,
} from '../src/index.js'

describe('resolvePaneHeaderHeight', () => {
  it('returns undefined when no height is given', () => {
    expect(resolvePaneHeaderHeight(undefined)).toBeUndefined()
  })

  it('treats numbers as CSS pixels', () => {
    expect(resolvePaneHeaderHeight(64)).toBe('64px')
    expect(resolvePaneHeaderHeight(56.5)).toBe('56.5px')
  })

  it('rejects zero, negative and non-finite numbers', () => {
    expect(resolvePaneHeaderHeight(0)).toBeUndefined()
    expect(resolvePaneHeaderHeight(-10)).toBeUndefined()
    expect(resolvePaneHeaderHeight(Number.NaN)).toBeUndefined()
    expect(resolvePaneHeaderHeight(Number.POSITIVE_INFINITY)).toBeUndefined()
  })

  it('passes CSS length strings through, trimmed', () => {
    expect(resolvePaneHeaderHeight('4rem')).toBe('4rem')
    expect(resolvePaneHeaderHeight('  3rem ')).toBe('3rem')
    expect(resolvePaneHeaderHeight('var(--toolbar-h)')).toBe('var(--toolbar-h)')
  })

  it('rejects empty strings and values that would escape the declaration', () => {
    expect(resolvePaneHeaderHeight('')).toBeUndefined()
    expect(resolvePaneHeaderHeight('   ')).toBeUndefined()
    expect(resolvePaneHeaderHeight('4rem; color: red')).toBeUndefined()
    expect(resolvePaneHeaderHeight('4rem}')).toBeUndefined()
    expect(resolvePaneHeaderHeight('<script>')).toBeUndefined()
  })
})

describe('resolvePaneHeaderHeadingLevel', () => {
  it('defaults to level 2', () => {
    expect(PANE_HEADER_DEFAULT_HEADING_LEVEL).toBe(2)
    expect(resolvePaneHeaderHeadingLevel(undefined)).toBe(2)
  })

  it('keeps valid levels', () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      expect(resolvePaneHeaderHeadingLevel(level)).toBe(level)
    }
  })

  it('clamps out-of-range levels to 1–6', () => {
    expect(resolvePaneHeaderHeadingLevel(0)).toBe(1)
    expect(resolvePaneHeaderHeadingLevel(-3)).toBe(1)
    expect(resolvePaneHeaderHeadingLevel(7)).toBe(6)
    expect(resolvePaneHeaderHeadingLevel(99)).toBe(6)
  })

  it('rounds fractional levels and falls back on non-finite input', () => {
    expect(resolvePaneHeaderHeadingLevel(2.4)).toBe(2)
    expect(resolvePaneHeaderHeadingLevel(3.6)).toBe(4)
    expect(resolvePaneHeaderHeadingLevel(Number.NaN)).toBe(2)
    expect(resolvePaneHeaderHeadingLevel(Number.POSITIVE_INFINITY)).toBe(2)
  })
})

describe('paneHeaderHeightStyle', () => {
  it('sets the shared custom property', () => {
    expect(PANE_HEADER_HEIGHT_VAR).toBe('--pane-header-height')
    expect(paneHeaderHeightStyle('4rem')).toEqual({ '--pane-header-height': '4rem' })
    expect(paneHeaderHeightStyle(48)).toEqual({ '--pane-header-height': '48px' })
  })

  it('is empty for a missing or unusable height so the default applies', () => {
    expect(paneHeaderHeightStyle(undefined)).toEqual({})
    expect(paneHeaderHeightStyle(-1)).toEqual({})
    expect(paneHeaderHeightStyle('')).toEqual({})
  })
})

describe('getPaneHeaderIds', () => {
  it('derives deterministic ids from the base id', () => {
    expect(getPaneHeaderIds('chat')).toEqual({
      titleId: 'chat-title',
      subtitleId: 'chat-subtitle',
      hintId: 'chat-hint',
    })
  })
})

describe('createPaneHeader', () => {
  it('defaults to an h2 that reads the shared height with a rem fallback', () => {
    const api = createPaneHeader({ baseId: 'p' })
    expect(api.headingTag).toBe('h2')
    expect(PANE_HEADER_DEFAULT_HEIGHT).toBe('3.5rem')
    expect(api.style).toEqual({ height: 'var(--pane-header-height, 3.5rem)' })
    expect(api.dataAttributes).toEqual({ 'data-slot': 'pane-header', 'data-interactive': 'false' })
  })

  it('overrides the custom property on the root for a per-instance height', () => {
    const api = createPaneHeader({ baseId: 'p', height: '4rem' })
    expect(api.style).toEqual({
      height: 'var(--pane-header-height, 3.5rem)',
      '--pane-header-height': '4rem',
    })
  })

  it('ignores an unusable height instead of emitting a broken value', () => {
    const api = createPaneHeader({ baseId: 'p', height: 0 })
    expect(api.style).not.toHaveProperty('--pane-header-height')
  })

  it('uses the configured heading level, clamped', () => {
    expect(createPaneHeader({ baseId: 'p', headingLevel: 3 }).headingTag).toBe('h3')
    expect(createPaneHeader({ baseId: 'p', headingLevel: 9 }).headingTag).toBe('h6')
  })

  it('names the title button by the title only', () => {
    const api = createPaneHeader({ baseId: 'p', interactive: true })
    expect(api.titleButtonAriaProps).toEqual({ 'aria-labelledby': 'p-title' })
    expect(api.dataAttributes['data-interactive']).toBe('true')
  })

  it('describes the title button by the subtitle and hint', () => {
    const api = createPaneHeader({ baseId: 'p', interactive: true, hasSubtitle: true, hasHint: true })
    expect(api.titleButtonAriaProps).toEqual({
      'aria-labelledby': 'p-title',
      'aria-describedby': 'p-subtitle p-hint',
    })
  })

  it('only references the hint when the title is interactive', () => {
    const api = createPaneHeader({ baseId: 'p', hasSubtitle: true, hasHint: true })
    expect(api.titleButtonAriaProps['aria-describedby']).toBe('p-subtitle')
  })

  it('is deterministic for the same input', () => {
    const props = { baseId: 'same', interactive: true, hasSubtitle: true, height: 60 }
    expect(createPaneHeader(props)).toEqual(createPaneHeader(props))
  })
})

describe('styles', () => {
  it('lets the title block shrink while the actions never do', () => {
    expect(paneHeaderTitleBlockVariants()).toContain('min-w-0')
    expect(paneHeaderTitleBlockVariants()).toContain('flex-1')
    expect(paneHeaderTextClass).toContain('min-w-0')
    expect(paneHeaderTitleClass).toContain('truncate')
    expect(paneHeaderActionsClass).toContain('flex-none')
  })

  it('gives the interactive title block a 44px target and a focus ring', () => {
    const cls = paneHeaderTitleBlockVariants({ interactive: 'true' })
    expect(cls).toContain('min-h-11')
    expect(cls).toContain('focus-visible:ring-2')
    expect(cls).toContain('motion-reduce:transition-none')
    expect(paneHeaderTitleBlockVariants({ interactive: 'false' })).not.toContain('focus-visible')
  })
})
