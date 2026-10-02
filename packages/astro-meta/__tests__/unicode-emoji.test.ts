import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

describe('Astro Unicode artwork, published meta shape', () => {
  it('renders complete supported sequences and native unsupported text', async () => {
    const { default: EmojiText } = await import('../dist/astro-emoji-picker/EmojiText.astro')
    const container = await AstroContainer.create()
    const html = await container.renderToString(EmojiText, {
      props: { text: 'Hello 🔥 ❤️‍🔥 🇬🇧 1️⃣ 👍🏽 ✈︎', emojiArtwork: true, twemojiBaseUrl: '/emoji/' },
    })
    expect(html).toContain('/emoji/2764-fe0f-200d-1f525.svg')
    expect(html).toContain('/emoji/1f1ec-1f1e7.svg')
    expect(html).toContain('data-rfr-emoji-text>🔥</span>')
    expect(html).toContain('👍🏽')
    expect(html).not.toContain('1f44d.svg')
    expect(html).not.toContain('2708.svg')
  })
  it('picker SSR uses the same artwork as its client search path', async () => {
    const { default: EmojiPicker } = await import('../dist/astro-emoji-picker/EmojiPicker.astro')
    const container = await AstroContainer.create()
    const html = await container.renderToString(EmojiPicker, { props: { category: 'flags', emojiArtwork: true, twemojiBaseUrl: '/emoji/' } })
    expect(html).toContain('/emoji/1f1ec-1f1e7.svg')
    expect(html).toContain('data-rfr-emoji-base-url="/emoji/"')
  })
})


it('Astro composer remains read-only while rendering a canonical Unicode draft', async () => {
  const { default: Composer } = await import('../dist/astro-composer/Composer.astro')
  const container = await AstroContainer.create()
  const html = await container.renderToString(Composer, { props: { value: 'Draft 🔥 👍🏽', emojiArtwork: true, twemojiBaseUrl: '/emoji' } })
  expect(html).toContain('/emoji/1f525.svg')
  expect(html).toContain('👍🏽')
  expect(html).not.toContain('<textarea')
  expect(html).toMatch(/<button[^>]*disabled/)
})

it('Astro composer renders private Unicode natively by default', async () => {
  const { default: Composer } = await import('../dist/astro-composer/Composer.astro')
  const container = await AstroContainer.create()
  const html = await container.renderToString(Composer, { props: { value: 'Private 🔥' } })
  expect(html).toContain('Private 🔥')
  expect(html).not.toContain('<img')
})

it('Astro native-only display escapes text and picker SSR emits no artwork requests', async () => {
  const { default: EmojiText } = await import('../dist/astro-emoji-picker/EmojiText.astro')
  const { default: EmojiPicker } = await import('../dist/astro-emoji-picker/EmojiPicker.astro')
  const container = await AstroContainer.create()
  const text = await container.renderToString(EmojiText, { props: { text: '<script>🔥</script>', emojiArtwork: false } })
  expect(text).toContain('&lt;script&gt;🔥&lt;/script&gt;')
  expect(text).not.toContain('<img')
  const picker = await container.renderToString(EmojiPicker, { props: { category: 'flags', emojiArtwork: false } })
  expect(picker).toContain('data-rfr-emoji-native-only="true"')
  expect(picker).not.toContain('<img')
})
