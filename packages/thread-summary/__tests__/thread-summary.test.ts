import { describe, it, expect } from 'vitest'
import {
  createThreadSummary,
  getThreadSummaryAccessibleName,
  getThreadSummaryVisibleAvatars,
  resolveThreadSummaryMaxAvatars,
  THREAD_SUMMARY_DEFAULT_MAX_AVATARS,
  threadSummaryClass,
  threadSummaryLabelClass,
} from '../src/index.js'

describe('getThreadSummaryAccessibleName', () => {
  it('joins label and detail so the name matches the visible text', () => {
    expect(
      getThreadSummaryAccessibleName({ label: '12 replies', detail: 'Last reply 2 h ago' }),
    ).toBe('12 replies, Last reply 2 h ago')
  })

  it('uses the label alone when there is no detail', () => {
    expect(getThreadSummaryAccessibleName({ label: '1 reply' })).toBe('1 reply')
  })

  it('prefers a semanticLabel override', () => {
    expect(
      getThreadSummaryAccessibleName({
        label: '12 replies',
        detail: '2 h ago',
        semanticLabel: 'Open thread, 12 replies',
      }),
    ).toBe('Open thread, 12 replies')
  })

  it('ignores a blank semanticLabel and falls back to label + detail', () => {
    expect(
      getThreadSummaryAccessibleName({ label: '3 replies', detail: 'today', semanticLabel: '   ' }),
    ).toBe('3 replies, today')
  })

  it('trims parts and drops blank ones (no dangling separator)', () => {
    expect(getThreadSummaryAccessibleName({ label: '  2 replies ', detail: '  ' })).toBe(
      '2 replies',
    )
    expect(getThreadSummaryAccessibleName({ label: '', detail: 'Last reply now' })).toBe(
      'Last reply now',
    )
    expect(getThreadSummaryAccessibleName({ label: '' })).toBe('')
  })
})

describe('resolveThreadSummaryMaxAvatars', () => {
  it('defaults when undefined or non-finite', () => {
    expect(resolveThreadSummaryMaxAvatars(undefined)).toBe(THREAD_SUMMARY_DEFAULT_MAX_AVATARS)
    expect(resolveThreadSummaryMaxAvatars(Number.NaN)).toBe(THREAD_SUMMARY_DEFAULT_MAX_AVATARS)
    expect(resolveThreadSummaryMaxAvatars(Number.POSITIVE_INFINITY)).toBe(
      THREAD_SUMMARY_DEFAULT_MAX_AVATARS,
    )
  })

  it('clamps negatives to 0 and floors fractions', () => {
    expect(resolveThreadSummaryMaxAvatars(-2)).toBe(0)
    expect(resolveThreadSummaryMaxAvatars(2.9)).toBe(2)
    expect(resolveThreadSummaryMaxAvatars(0)).toBe(0)
  })
})

describe('getThreadSummaryVisibleAvatars', () => {
  const people = ['a', 'b', 'c', 'd', 'e']

  it('caps to the default when no max is given', () => {
    expect(getThreadSummaryVisibleAvatars(people)).toEqual(['a', 'b', 'c'])
  })

  it('honours an explicit max, including 0', () => {
    expect(getThreadSummaryVisibleAvatars(people, 5)).toEqual(people)
    expect(getThreadSummaryVisibleAvatars(people, 10)).toEqual(people)
    expect(getThreadSummaryVisibleAvatars(people, 0)).toEqual([])
  })

  it('returns an empty list for missing avatars and never mutates input', () => {
    expect(getThreadSummaryVisibleAvatars(undefined)).toEqual([])
    const copy = [...people]
    getThreadSummaryVisibleAvatars(people, 1)
    expect(people).toEqual(copy)
  })
})

describe('createThreadSummary', () => {
  it('exposes the accessible name as aria-label', () => {
    const api = createThreadSummary({ label: '12 replies', detail: 'Last reply 2 h ago' })
    expect(api.accessibleName).toBe('12 replies, Last reply 2 h ago')
    expect(api.ariaProps['aria-label']).toBe('12 replies, Last reply 2 h ago')
  })

  it('omits aria-label rather than emitting an empty one', () => {
    expect(createThreadSummary({ label: '' }).ariaProps).not.toHaveProperty('aria-label')
  })

  it('emits styling hooks', () => {
    const withDetail = createThreadSummary({ label: '2 replies', detail: 'now', avatarCount: 2 })
    expect(withDetail.dataAttributes).toEqual({
      'data-slot': 'thread-summary',
      'data-has-detail': 'true',
      'data-avatar-count': '2',
    })
    const bare = createThreadSummary({ label: '2 replies', avatarCount: -1 })
    expect(bare.dataAttributes['data-has-detail']).toBe('false')
    expect(bare.dataAttributes['data-avatar-count']).toBe('0')
  })
})

describe('styles', () => {
  it('wraps instead of overflowing and shows a focus-visible ring', () => {
    expect(threadSummaryClass).toContain('flex-wrap')
    expect(threadSummaryClass).toContain('max-w-full')
    expect(threadSummaryClass).toContain('focus-visible:ring-2')
    expect(threadSummaryClass).toContain('motion-reduce:transition-none')
  })

  it('does not convey the link by colour alone', () => {
    expect(threadSummaryLabelClass).toContain('font-medium')
    expect(threadSummaryLabelClass).toContain('group-hover:underline')
  })
})
