import { describe, it, expect } from 'vitest'
import {
  threadActionsStyles,
  threadReactionVariants,
  threadReplyButtonStyles,
} from '../src/thread-view.styles.js'

// The ring every focusable thread control must carry so keyboard focus is
// visible without a global `:focus-visible` rule in the host app.
const FOCUS_RING = ['focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring']

const classesOf = (styles: string) => styles.split(/\s+/)

describe('ThreadView focus styles', () => {
  it.each(['true', 'false'] as const)('gives a reaction pill (reacted=%s) a focus ring', (reacted) => {
    expect(classesOf(threadReactionVariants({ reacted }))).toEqual(expect.arrayContaining(FOCUS_RING))
  })

  it('keeps the reacted and not-reacted reaction colours', () => {
    expect(threadReactionVariants({ reacted: 'true' })).toContain('border-primary')
    expect(threadReactionVariants({ reacted: 'false' })).toContain('border-border')
    expect(threadReactionVariants()).toContain('border-border')
  })

  it('gives the reply button a focus ring', () => {
    expect(classesOf(threadReplyButtonStyles)).toEqual(expect.arrayContaining(FOCUS_RING))
  })

  it('reveals the hover-only actions while one of them has focus', () => {
    expect(classesOf(threadActionsStyles)).toEqual(
      expect.arrayContaining(['opacity-0', 'group-hover:opacity-100', 'focus-within:opacity-100']),
    )
  })
})
