import { describe, it, expect } from 'vitest'
import { createAnimatedText, createTypewriter } from '../src/animated-text.js'
import {
  animatedTextVariants,
  typewriterVariants,
} from '../src/animated-text.styles.js'

describe('createAnimatedText', () => {
  it('returns the first word initially', () => {
    const api = createAnimatedText({ words: ['Hello', 'World', 'Foo'] })
    expect(api.getCurrentWord()).toBe('Hello')
  })

  it('starts at index 0', () => {
    const api = createAnimatedText({ words: ['A', 'B', 'C'] })
    expect(api.state.currentIndex).toBe(0)
  })

  it('getNextIndex returns 1 initially', () => {
    const api = createAnimatedText({ words: ['A', 'B', 'C'] })
    expect(api.getNextIndex()).toBe(1)
  })

  it('getNextIndex wraps around at the end', () => {
    const api = createAnimatedText({ words: ['A', 'B'] })
    api.state.currentIndex = 1
    expect(api.getNextIndex()).toBe(0)
  })

  it('handles word cycling via state mutation', () => {
    const api = createAnimatedText({ words: ['A', 'B', 'C'] })
    expect(api.getCurrentWord()).toBe('A')
    api.state.currentIndex = 1
    expect(api.getCurrentWord()).toBe('B')
    api.state.currentIndex = 2
    expect(api.getCurrentWord()).toBe('C')
  })

  it('handles empty words array', () => {
    const api = createAnimatedText({ words: [] })
    expect(api.getCurrentWord()).toBe('')
    expect(api.getNextIndex()).toBe(0)
  })

  it('handles single word', () => {
    const api = createAnimatedText({ words: ['Only'] })
    expect(api.getCurrentWord()).toBe('Only')
    expect(api.getNextIndex()).toBe(0)
  })
})

describe('createTypewriter', () => {
  it('starts with empty visible text', () => {
    const api = createTypewriter({ text: 'Hello World' })
    expect(api.getVisibleText()).toBe('')
  })

  it('starts as not complete', () => {
    const api = createTypewriter({ text: 'Hi' })
    expect(api.isComplete()).toBe(false)
  })

  it('reveals characters as currentIndex advances', () => {
    const api = createTypewriter({ text: 'Hello' })
    api.state.currentIndex = 3
    expect(api.getVisibleText()).toBe('Hel')
  })

  it('is complete when currentIndex reaches text length', () => {
    const api = createTypewriter({ text: 'Hi' })
    api.state.currentIndex = 2
    expect(api.isComplete()).toBe(true)
    expect(api.getVisibleText()).toBe('Hi')
  })

  it('handles empty text', () => {
    const api = createTypewriter({ text: '' })
    expect(api.getVisibleText()).toBe('')
    expect(api.isComplete()).toBe(true)
  })

  it('state starts with currentIndex 0', () => {
    const api = createTypewriter({ text: 'Test' })
    expect(api.state.currentIndex).toBe(0)
  })
})

describe('animated-text styles', () => {
  it('animatedTextVariants returns base classes', () => {
    const classes = animatedTextVariants()
    expect(classes).toContain('inline-block')
    expect(classes).toContain('transition-opacity')
  })

  it('animatedTextVariants entering state', () => {
    const classes = animatedTextVariants({ state: 'entering' })
    expect(classes).toContain('opacity-100')
  })

  it('animatedTextVariants exiting state', () => {
    const classes = animatedTextVariants({ state: 'exiting' })
    expect(classes).toContain('opacity-0')
  })

  it('typewriterVariants returns base classes', () => {
    const classes = typewriterVariants()
    expect(classes).toContain('inline')
  })

  it('typewriterVariants with blinking cursor', () => {
    const classes = typewriterVariants({ cursor: 'blinking' })
    expect(classes).toContain('after:animate-blink')
  })
})
