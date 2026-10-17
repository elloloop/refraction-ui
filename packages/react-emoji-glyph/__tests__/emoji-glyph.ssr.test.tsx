import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EmojiGlyph, EMOJI_GLYPH_ANIMATED_BASE_URL } from '../src/index.js'

const THUMBS_UP = '\u{1F44D}'
const UK_FLAG = '\u{1F1EC}\u{1F1E7}'
const HEART_TEXT = '❤︎'

function html(ui: React.ReactElement): string {
  return renderToString(ui)
}

describe('EmojiGlyph (SSR)', () => {
  it('is decorative: aria-hidden on the root, empty alt on the still', () => {
    const out = html(<EmojiGlyph emoji={THUMBS_UP} />)
    expect(out).toMatch(/^<span aria-hidden="true"/)
    expect(out).toContain('alt=""')
    expect(out).not.toContain('role=')
  })

  it('keeps aria-hidden even when the caller tries to unhide it', () => {
    const out = html(<EmojiGlyph emoji={THUMBS_UP} aria-hidden={false} />)
    expect(out).toContain('aria-hidden="true"')
    expect(out).not.toContain('aria-hidden="false"')
  })

  it('server-renders the native glyph visibly, with art layers hidden until loaded', () => {
    const out = html(<EmojiGlyph emoji={THUMBS_UP} />)
    expect(out).toContain('data-emoji-glyph-source="native"')
    expect(out).toMatch(/data-emoji-glyph-layer="native" class="[^"]*opacity-100[^"]*">\u{1F44D}<\/span>/u)
    expect(out).toMatch(/data-emoji-glyph-layer="twemoji"[^>]*class="[^"]*opacity-0/)
    expect(out).toMatch(/data-emoji-glyph-layer="animated" class="[^"]*opacity-0/)
  })

  it('points the still at the Twemoji SVG without a referrer', () => {
    const out = html(<EmojiGlyph emoji={THUMBS_UP} twemojiBaseUrl="/emoji" />)
    expect(out).toContain('src="/emoji/1f44d.svg"')
    expect(out).toContain('referrerPolicy="no-referrer"')
    expect(out).toContain('draggable="false"')
  })

  it('never ships animation markup or player code from the server', () => {
    const loadAnimation = vi.fn()
    const out = html(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loadAnimation} />)
    expect(loadAnimation).not.toHaveBeenCalled()
    expect(out).not.toContain('<svg')
    expect(out).not.toContain(EMOJI_GLYPH_ANIMATED_BASE_URL)
  })

  it('omits the animation layer when animate is false', () => {
    const out = html(<EmojiGlyph emoji={THUMBS_UP} animate={false} />)
    expect(out).not.toContain('data-emoji-glyph-layer="animated"')
    expect(out).toContain('data-emoji-glyph-layer="twemoji"')
  })

  it('omits the animation layer for an emoji with no animated art', () => {
    const out = html(<EmojiGlyph emoji={UK_FLAG} />)
    expect(out).not.toContain('data-emoji-glyph-layer="animated"')
    expect(out).toContain('1f1ec-1f1e7.svg')
  })

  it('draws text presentation natively, with no art layers', () => {
    const out = html(<EmojiGlyph emoji={HEART_TEXT} />)
    expect(out).not.toContain('<img')
    expect(out).not.toContain('data-emoji-glyph-layer="animated"')
    expect(out).toContain(HEART_TEXT)
  })

  it('sizes the box in rem from logical pixels, and passes CSS lengths through', () => {
    expect(html(<EmojiGlyph emoji={THUMBS_UP} size={24} />)).toContain('width:1.5rem;height:1.5rem;font-size:1.5rem')
    expect(html(<EmojiGlyph emoji={THUMBS_UP} size="2em" />)).toContain('width:2em;height:2em;font-size:2em')
    expect(html(<EmojiGlyph emoji={THUMBS_UP} />)).toContain('width:1em;height:1em;font-size:1em')
  })

  it('merges className and passes DOM props through', () => {
    const out = html(<EmojiGlyph emoji={THUMBS_UP} className="custom-glyph" data-testid="glyph" id="g1" />)
    expect(out).toContain('custom-glyph')
    expect(out).toContain('inline-flex')
    expect(out).toContain('data-testid="glyph"')
    expect(out).toContain('id="g1"')
  })

  it('stops the cross-fade under reduced motion (motion-reduce variant)', () => {
    expect(html(<EmojiGlyph emoji={THUMBS_UP} />)).toContain('motion-reduce:transition-none')
  })
})

describe('initial bundle', () => {
  const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
  const sources = readdirSync(srcDir).map((file) => readFileSync(join(srcDir, file), 'utf8'))

  it('reaches lottie-web only through a dynamic import', () => {
    const all = sources.join('\n')
    expect(all).not.toMatch(/^\s*import[^(]*['"]lottie-web/m)
    expect(all).not.toMatch(/^\s*export[^(]*from\s*['"]lottie-web/m)
    expect(all).toContain("import('lottie-web/build/player/lottie_light')")
  })
})
