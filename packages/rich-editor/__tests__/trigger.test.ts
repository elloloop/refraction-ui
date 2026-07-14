import { describe, it, expect } from 'vitest'
import { detectTriggerInText } from '../src/trigger.js'

describe('detectTriggerInText', () => {
  it('detects a trigger at start-of-text with the query up to the caret', () => {
    expect(detectTriggerInText('@jo', 3, '@')).toEqual({ triggered: true, query: 'jo', start: 0 })
  })

  it('detects a trigger preceded by whitespace', () => {
    expect(detectTriggerInText('hi @jo', 6, '@')).toEqual({ triggered: true, query: 'jo', start: 3 })
    expect(detectTriggerInText('hi\n/po', 6, '/')).toEqual({ triggered: true, query: 'po', start: 3 })
  })

  it('never triggers mid-word (alice@example.com, and/or)', () => {
    expect(detectTriggerInText('alice@example.com', 17, '@')).toBeNull()
    expect(detectTriggerInText('and/or', 6, '/')).toBeNull()
  })

  it('returns null once the query spans whitespace', () => {
    expect(detectTriggerInText('@jo hn', 6, '@')).toBeNull()
  })

  it('only scans text before the caret', () => {
    expect(detectTriggerInText('ab @cd', 2, '@')).toBeNull()
    expect(detectTriggerInText('@ab cd', 3, '@')).toEqual({ triggered: true, query: 'ab', start: 0 })
  })

  it('uses the nearest occurrence before the caret', () => {
    expect(detectTriggerInText('@a @b', 5, '@')).toEqual({ triggered: true, query: 'b', start: 3 })
  })

  it('supports multi-character symbols with the boundary checked before the first char', () => {
    expect(detectTriggerInText('!!omw', 5, '!!')).toEqual({ triggered: true, query: 'omw', start: 0 })
    expect(detectTriggerInText('a!!x', 4, '!!')).toBeNull()
  })

  it('returns null for an empty trigger or no occurrence', () => {
    expect(detectTriggerInText('hello', 5, '')).toBeNull()
    expect(detectTriggerInText('hello', 5, '@')).toBeNull()
  })
})
