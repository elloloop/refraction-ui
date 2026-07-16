import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  EmojiPicker,
  nativeEmojiRenderer,
  twemojiRenderer,
} from '../src/index.js'

const render = (ui: React.ReactElement) => renderToString(ui)

describe('EmojiPicker render seam (SSR)', () => {
  it('renders uniform Twemoji <img> glyphs by default', () => {
    const html = render(<EmojiPicker />)
    expect(html).toContain('<img')
    expect(html).toContain('twemoji')
    expect(html).toContain('.svg')
    expect(html).toContain('loading="lazy"')
  })

  it('honours a custom self-hosted Twemoji base url', () => {
    const html = render(<EmojiPicker twemojiBaseUrl="https://assets.example.com/emoji" />)
    expect(html).toContain('https://assets.example.com/emoji/')
  })

  it('swaps to native glyphs via the emojiRenderer seam', () => {
    const html = render(<EmojiPicker emojiRenderer={nativeEmojiRenderer} />)
    // Native path paints the glyph as text, not an <img>.
    expect(html).not.toContain('<img')
  })

  it('exposes twemojiRenderer as a reusable seam function', () => {
    const node = twemojiRenderer({
      emoji: '\u{1F600}',
      name: 'grinning face',
      category: 'smileys',
      keywords: ['happy'],
      shortcode: 'grinning_face',
    })
    const html = renderToString(node as React.ReactElement)
    expect(html).toContain('1f600.svg')
  })
})

describe('EmojiPicker structure (SSR)', () => {
  it('renders a search box and category tablist', () => {
    const html = render(<EmojiPicker />)
    expect(html).toContain('role="searchbox"')
    expect(html).toContain('role="tablist"')
  })

  it('renders a sticker tab by default (starter pack)', () => {
    const html = render(<EmojiPicker />)
    expect(html).toContain('aria-label="Stickers"')
  })

  it('hides the sticker tab when stickerSets is empty', () => {
    const html = render(<EmojiPicker stickerSets={[]} />)
    expect(html).not.toContain('aria-label="Stickers"')
  })

  it('renders recents when provided', () => {
    const html = render(
      <EmojiPicker
        recentEmojis={[
          {
            emoji: '\u{1F525}',
            name: 'fire',
            category: 'symbols',
            keywords: ['fire'],
            shortcode: 'fire',
          },
        ]}
      />,
    )
    expect(html).toContain('Recent')
  })
})
