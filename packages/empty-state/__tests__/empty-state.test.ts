import { describe, it, expect } from 'vitest'
import { createEmptyState } from '../src/empty-state.js'
import {
  emptyStateVariants,
  emptyStateIconChipVariants,
} from '../src/empty-state.styles.js'

describe('createEmptyState', () => {
  it('defaults data-tone to neutral', () => {
    expect(createEmptyState().dataAttributes['data-tone']).toBe('neutral')
  })

  it('sets data-tone to the selected tone', () => {
    expect(createEmptyState({ tone: 'danger' }).dataAttributes['data-tone']).toBe(
      'danger',
    )
  })
})

describe('emptyStateIconChipVariants', () => {
  it.each([
    ['neutral', 'bg-muted'],
    ['success', 'bg-green-500/10'],
    ['warning', 'bg-yellow-500/10'],
    ['danger', 'bg-destructive/10'],
  ] as const)('applies %s tone chip class', (tone, klass) => {
    expect(emptyStateIconChipVariants({ tone })).toContain(klass)
  })
})

describe('emptyStateVariants', () => {
  it('adds border classes when bordered', () => {
    const classes = emptyStateVariants({ bordered: 'true' })
    expect(classes).toContain('border-border')
    expect(classes).toContain('rounded-xl')
  })

  it('omits border classes by default', () => {
    expect(emptyStateVariants()).not.toContain('border-border')
  })
})
