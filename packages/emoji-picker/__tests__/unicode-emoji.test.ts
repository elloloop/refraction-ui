import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import { unicodeEmojiRuns, unicodeEmojiHtml } from '../src/unicode-emoji.js'
import { EMOJI_ARTWORK_KEYS } from '../src/emoji-artwork.generated.js'

describe('Unicode artwork matching', () => {
  it('matches complete supported clusters and original UTF-16 ranges', () => {
    const text = 'A🔥 ❤️ ❤️‍🔥 👩‍💻 👨‍👩‍👧‍👦 🇬🇧 1️⃣ 🏳️‍🌈 👍🏽 ✈︎ 🔥́ abc'
    const runs = unicodeEmojiRuns(text)
    expect(runs.map(run => run.emoji)).toEqual(['🔥', '❤️', '❤️‍🔥', '👩‍💻', '👨‍👩‍👧‍👦', '🇬🇧', '1️⃣', '🏳️‍🌈'])
    for (const run of runs) expect(text.slice(run.start, run.end)).toBe(run.emoji)
    expect(runs.find(run => run.emoji === '❤️‍🔥')?.url).toContain('2764-fe0f-200d-1f525.svg')
    expect(unicodeEmojiRuns('🔥‍🦄 👍🏽 ✈︎ abc 123')).toEqual([])
  })
  it('keeps all Unicode native without Intl.Segmenter', () => {
    const segmenter = Intl.Segmenter
    try {
      vi.stubGlobal('Intl', { ...Intl, Segmenter: undefined })
      expect(unicodeEmojiRuns('🔥 👨‍👩‍👧‍👦')).toEqual([])
    } finally {
      vi.unstubAllGlobals()
      expect(Intl.Segmenter).toBe(segmenter)
    }
  })
  it('escapes text and asset URLs while retaining selectable Unicode', () => {
    const html = unicodeEmojiHtml('<script>🔥</script> 👍🏽', '/emoji/" onclick="bad')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).toContain('data-rfr-emoji-text>🔥</span>')
    expect(html).toContain('👍🏽')
    expect(html).toContain('&quot;')
    expect(html).not.toContain(' onclick="bad')
    expect(unicodeEmojiHtml('🔥‍🦄 👍🏽')).toBe('🔥‍🦄 👍🏽')
  })
  it('uses exactly the SVGs bundled for Flutter; regeneration cannot drift', () => {
    const assets = fs.readdirSync(new URL('../../flutter/assets/twemoji/', import.meta.url))
      .filter(file => file.endsWith('.svg')).map(file => file.slice(0, -4)).sort()
    expect([...EMOJI_ARTWORK_KEYS]).toEqual(assets)
  })
})
