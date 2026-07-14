import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ComposerCandidate, ComposerTrigger } from '../src/index.js'
import { makeComposer, mentionTrigger, typeText, PEOPLE } from './helpers.js'

describe('D. Suggestion menu', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('D1: debounce 0 with a local resolver fires synchronously', () => {
    const resolve = vi.fn(() => PEOPLE)
    const c = makeComposer({ triggers: [mentionTrigger({ resolve })] })
    typeText(c, '@')
    expect(resolve).toHaveBeenCalledWith('')
    expect(c.getState().suggestion.items).toHaveLength(PEOPLE.length)
  })

  it('D1: debounce 150 coalesces keystrokes into one resolve with the latest query', async () => {
    const resolve = vi.fn((q: string) => Promise.resolve(PEOPLE.filter((p) => p.display.startsWith(q))))
    const c = makeComposer({ triggers: [mentionTrigger({ resolve, debounceMs: 150 })] })
    typeText(c, '@Jor')
    expect(resolve).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(150)
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(resolve).toHaveBeenCalledWith('Jor')
    expect(c.getState().suggestion.items.map((i) => i.id)).toEqual(['u_jordan'])
  })

  it('D2: an older slow response arriving after a newer fast one is discarded', async () => {
    const pending: Array<(items: ComposerCandidate[]) => void> = []
    const resolve = vi.fn(() => new Promise<ComposerCandidate[]>((res) => pending.push(res)))
    const c = makeComposer({ triggers: [mentionTrigger({ resolve })] })
    typeText(c, '@a') // request 1 and 2 ('' then 'a')
    expect(pending).toHaveLength(2)
    pending[1]([{ id: 'new', display: 'Newer' }]) // newer settles first
    await vi.advanceTimersByTimeAsync(0)
    expect(c.getState().suggestion.items.map((i) => i.id)).toEqual(['new'])
    pending[0]([{ id: 'old', display: 'Older' }]) // stale response lands late
    await vi.advanceTimersByTimeAsync(0)
    expect(c.getState().suggestion.items.map((i) => i.id)).toEqual(['new'])
  })

  it('D3: loading appears only when the resolver is pending for more than 120ms', async () => {
    let settle: (items: ComposerCandidate[]) => void = () => undefined
    const c = makeComposer({
      triggers: [mentionTrigger({ resolve: () => new Promise((res) => (settle = res)) })],
    })
    typeText(c, '@')
    expect(c.getState().suggestion.loading).toBe(false)
    await vi.advanceTimersByTimeAsync(119)
    expect(c.getState().suggestion.loading).toBe(false)
    await vi.advanceTimersByTimeAsync(2)
    expect(c.getState().suggestion.loading).toBe(true)
    settle(PEOPLE)
    await vi.advanceTimersByTimeAsync(0)
    expect(c.getState().suggestion.loading).toBe(false)
    expect(c.getState().suggestion.items).toHaveLength(PEOPLE.length)
  })

  it('D3: a fast resolver never shows loading', async () => {
    const c = makeComposer({
      triggers: [mentionTrigger({ resolve: () => Promise.resolve(PEOPLE) })],
    })
    const loadingSeen: boolean[] = []
    c.subscribe((s) => loadingSeen.push(s.suggestion.loading))
    typeText(c, '@')
    await vi.advanceTimersByTimeAsync(200)
    expect(loadingSeen).not.toContain(true)
  })

  it('D4: an empty result is an empty state — distinct from closed and from error', () => {
    const c = makeComposer({ triggers: [mentionTrigger({ resolve: () => [] })] })
    typeText(c, '@zzz')
    const s = c.getState().suggestion
    expect(s.isOpen).toBe(true)
    expect(s.items).toEqual([])
    expect(s.error).toBeNull()
    expect(s.loading).toBe(false)
  })

  it('D5: a resolver throw becomes an error state; retry re-resolves', () => {
    let shouldThrow = true
    const c = makeComposer({
      triggers: [
        mentionTrigger({
          resolve: () => {
            if (shouldThrow) throw new Error('network down')
            return PEOPLE
          },
        }),
      ],
    })
    typeText(c, '@') // a single failure — the breaker needs two in a row
    expect(c.getState().suggestion.error).toBe('network down')
    expect(c.getState().suggestion.isOpen).toBe(true)
    shouldThrow = false
    c.retrySuggestions()
    expect(c.getState().suggestion.error).toBeNull()
    expect(c.getState().suggestion.items).toHaveLength(PEOPLE.length)
  })

  it('D6: two consecutive throws trip the circuit breaker — menu closes silently, no further calls', () => {
    const resolve = vi.fn((): ComposerCandidate[] => {
      throw new Error('boom')
    })
    const c = makeComposer({ triggers: [mentionTrigger({ resolve })] })
    typeText(c, '@') // failure 1 → error state
    expect(c.getState().suggestion.error).toBe('boom')
    typeText(c, 'j') // failure 2 → breaker trips
    expect(c.getState().suggestion.isOpen).toBe(false)
    expect(resolve).toHaveBeenCalledTimes(2)
    typeText(c, 'o') // session fallback: no further remote calls
    expect(resolve).toHaveBeenCalledTimes(2)
    expect(c.getState().suggestion.isOpen).toBe(false)
  })

  it('D7: moveNext/movePrevious wrap when wrapNavigation, clamp when not', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@')
    expect(c.getState().suggestion.activeIndex).toBe(0)
    c.moveSuggestionPrevious()
    expect(c.getState().suggestion.activeIndex).toBe(PEOPLE.length - 1) // wraps
    c.moveSuggestionNext()
    expect(c.getState().suggestion.activeIndex).toBe(0)

    const clamped = makeComposer({ triggers: [mentionTrigger({ wrapNavigation: false })] })
    typeText(clamped, '@')
    clamped.moveSuggestionPrevious()
    expect(clamped.getState().suggestion.activeIndex).toBe(0) // clamped at start
    clamped.moveSuggestionNext()
    clamped.moveSuggestionNext()
    clamped.moveSuggestionNext()
    clamped.moveSuggestionNext()
    expect(clamped.getState().suggestion.activeIndex).toBe(PEOPLE.length - 1)
  })

  it('D8: applySuggestion commits the active/indexed item, closes the menu, clears the trigger', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi @')
    c.moveSuggestionNext() // active = Alice
    c.applySuggestion()
    let s = c.getState()
    expect(s.value).toBe('hi @Alice')
    expect(s.tokens[0]?.id).toBe('u_alice')
    expect(s.suggestion.isOpen).toBe(false)
    expect(s.activeTrigger).toBeNull()

    const c2 = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c2, '@')
    c2.applySuggestion(2) // explicit index wins over activeIndex
    s = c2.getState()
    expect(s.tokens[0]?.id).toBe('u_bob')
  })

  it('D9: pointer hover sets active; keyboard continues from the hovered row (last-input-wins)', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@')
    c.setSuggestionActiveIndex(2)
    expect(c.getState().suggestion.activeIndex).toBe(2)
    c.moveSuggestionPrevious()
    expect(c.getState().suggestion.activeIndex).toBe(1)
    c.setSuggestionActiveIndex(99) // clamped to the list
    expect(c.getState().suggestion.activeIndex).toBe(PEOPLE.length - 1)
  })

  it('D10: maxVisibleResults yields a visible slice while the overflow list stays intact', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ id: `u${i}`, display: `User ${i}` }))
    const c = makeComposer({
      triggers: [mentionTrigger({ resolve: () => many, maxVisibleResults: 6 })],
    })
    typeText(c, '@')
    const s = c.getState().suggestion
    expect(s.items).toHaveLength(10)
    expect(s.visibleItems).toHaveLength(6)
    expect(s.visibleItems[0].id).toBe('u0')
  })

  it('D11: Enter/Tab while open commit and NEVER submit (applyEnter precedence)', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'ship it @jord')
    expect(c.getState().suggestion.isOpen).toBe(true)
    const result = c.applyEnter({ shiftPressed: false })
    expect(result).toBe('committed-suggestion')
    const s = c.getState()
    expect(s.value).toBe('ship it @Jordan Lee') // not cleared — no submit happened
    expect(s.tokens).toHaveLength(1)
    // A second Enter (menu now closed) submits.
    expect(c.applyEnter({ shiftPressed: false })).toBe('submitted')
    expect(c.getState().value).toBe('')
  })

  it('D11: Enter while open with no matches is a noop, never a submit', () => {
    const c = makeComposer({ triggers: [mentionTrigger({ resolve: () => [] })] })
    typeText(c, 'hello @zzz')
    expect(c.getState().suggestion.isOpen).toBe(true)
    expect(c.applyEnter({ shiftPressed: false })).toBe('noop')
    expect(c.getState().value).toBe('hello @zzz')
  })

  it('D12: deferred dismissal waits the grace period so a click can land', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@jord')
    c.dismissSuggestionDeferred() // blur
    c.applySuggestion(0) // pointer click lands inside the grace window
    vi.advanceTimersByTime(200)
    const s = c.getState()
    expect(s.value).toBe('@Jordan Lee')
    expect(s.tokens).toHaveLength(1)
    expect(s.suggestion.isOpen).toBe(false)
  })

  it('D13: results arriving after the trigger was canceled are ignored', async () => {
    let settle: (items: ComposerCandidate[]) => void = () => undefined
    const c = makeComposer({
      triggers: [mentionTrigger({ resolve: () => new Promise((res) => (settle = res)) })],
    })
    typeText(c, '@jo')
    typeText(c, ' ') // space cancels the trigger
    expect(c.getState().activeTrigger).toBeNull()
    settle(PEOPLE)
    await vi.advanceTimersByTimeAsync(0)
    const s = c.getState().suggestion
    expect(s.isOpen).toBe(false)
    expect(s.items).toEqual([])
  })

  it('D: a tripped trigger does not block other triggers', () => {
    const bad: ComposerTrigger = {
      id: 'bad',
      symbol: '#',
      resolve: () => {
        throw new Error('always')
      },
    }
    const c = makeComposer({ triggers: [bad, mentionTrigger()] })
    typeText(c, '#a')
    typeText(c, 'b') // second throw → tripped
    c.setValue('', { start: 0, end: 0 })
    typeText(c, '@jo')
    expect(c.getState().suggestion.isOpen).toBe(true)
    expect(c.getState().suggestion.items.map((i) => i.id)).toEqual(['u_jordan'])
  })
})
