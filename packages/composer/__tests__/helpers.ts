import type {
  ComposerAPI,
  ComposerCandidate,
  ComposerConfig,
  ComposerTrigger,
} from '../src/index.js'
import { createComposer } from '../src/index.js'

export const PEOPLE: ComposerCandidate[] = [
  { id: 'u_jordan', display: 'Jordan Lee' },
  { id: 'u_alice', display: 'Alice' },
  { id: 'u_bob', display: 'Bob' },
]

/** Sync local mention resolver over the fixture roster. */
export function mentionTrigger(overrides: Partial<ComposerTrigger> = {}): ComposerTrigger {
  return {
    id: 'mention',
    symbol: '@',
    resolve: (query) =>
      PEOPLE.filter((p) => p.display.toLowerCase().startsWith(query.toLowerCase())),
    ...overrides,
  }
}

export function emojiTrigger(overrides: Partial<ComposerTrigger> = {}): ComposerTrigger {
  return {
    id: 'emoji',
    symbol: ':',
    toDisplay: (candidate) => candidate.display,
    resolve: () => [],
    ...overrides,
  }
}

export function makeComposer(config: ComposerConfig = {}): ComposerAPI {
  return createComposer(config)
}

/** Simulate the adapter's per-keystroke input path (one setValue per char). */
export function typeText(composer: ComposerAPI, text: string): void {
  for (const ch of text) {
    const s = composer.getState()
    const next = s.value.slice(0, s.selection.start) + ch + s.value.slice(s.selection.end)
    const caret = s.selection.start + ch.length
    composer.setValue(next, { start: caret, end: caret })
  }
}

/** Simulate a single backspace at the collapsed caret. */
export function backspace(composer: ComposerAPI): void {
  const s = composer.getState()
  if (s.selection.start !== s.selection.end) {
    const next = s.value.slice(0, s.selection.start) + s.value.slice(s.selection.end)
    composer.setValue(next, { start: s.selection.start, end: s.selection.start })
    return
  }
  const at = s.selection.start
  if (at === 0) return
  composer.setValue(s.value.slice(0, at - 1) + s.value.slice(at), { start: at - 1, end: at - 1 })
}

/** Simulate forward-delete at the collapsed caret. */
export function forwardDelete(composer: ComposerAPI): void {
  const s = composer.getState()
  const at = s.selection.start
  if (at >= s.value.length) return
  composer.setValue(s.value.slice(0, at) + s.value.slice(at + 1), { start: at, end: at })
}

/** Deterministic PRNG for property-style loops (no unseeded Math.random). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
