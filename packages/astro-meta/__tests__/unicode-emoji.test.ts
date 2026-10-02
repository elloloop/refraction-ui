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


it('interactive Astro uses a separate artwork mirror and a canonical textarea', async () => {
  const { default: Composer } = await import('../dist/astro-composer/InteractiveComposer.astro')
  const container = await AstroContainer.create()
  const html = await container.renderToString(Composer, { props: { defaultValue: 'Draft 🔥 👍🏽', emojiArtwork: true, twemojiBaseUrl: '/emoji' } })
  expect(html).toContain('data-emoji-mirror')
  expect(html).toContain('data-emoji-base-url="/emoji"')
  expect(html).toMatch(/<textarea[^>]*>Draft 🔥 👍🏽<\/textarea>/)
  expect(html).not.toContain('native-emoji')
})

it('interactive Astro draft artwork is opt-in', async () => {
  const { default: Composer } = await import('../dist/astro-composer/InteractiveComposer.astro')
  const container = await AstroContainer.create()
  const html = await container.renderToString(Composer, { props: { defaultValue: 'Private 🔥' } })
  expect(html).toContain('native-emoji')
  expect(html).not.toContain('cdn.jsdelivr.net')
})

it('Astro markdown and conversation preserve canonical SSR text with display enhancement hooks', async () => {
  const { default: MarkdownRenderer } = await import('../dist/astro-markdown-renderer/MarkdownRenderer.astro')
  const { default: Chat } = await import('../dist/astro-conversation/Chat.astro')
  const container = await AstroContainer.create()
  const markdown = await container.renderToString(MarkdownRenderer, { props: { content: 'Hello **🔥** · `code 🔥`', emojiArtwork: true, twemojiBaseUrl: '/emoji' } })
  expect(markdown).toContain('data-rfr-emoji-markdown')
  expect(markdown).toContain('<strong>🔥</strong>')
  expect(markdown).toContain('<code>code 🔥</code>')
  const native = await container.renderToString(MarkdownRenderer, { props: { content: 'Hello 🔥' } })
  expect(native).not.toContain('data-rfr-emoji-markdown')
  const chat = await container.renderToString(Chat, { props: { config: {
    activeConversationId: 'c', messages: { c: [{ id: 'm', conversationId: 'c', role: 'user', author: { id: 'u', name: 'User' }, content: 'Message 🔥 · `code 🔥`', timestamp: new Date('2026-01-01'), status: 'sent' }] },
  } } })
  expect(chat).not.toContain('data-rfr-chat-emoji-artwork=')
  const enabled = await container.renderToString(Chat, { props: { emojiArtwork: true, twemojiBaseUrl: '/emoji' } })
  expect(enabled).toContain('data-rfr-chat-emoji-artwork="true"')
  expect(enabled).toContain('data-rfr-chat-emoji-base-url="/emoji"')
  expect(chat).toContain('data-rfr-chat-message-body')
  expect(chat).toContain('<code>code 🔥</code>')
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

it('Astro defaults escape private Unicode and emit no artwork requests', async () => {
  const { default: EmojiText } = await import('../dist/astro-emoji-picker/EmojiText.astro')
  const { default: EmojiPicker } = await import('../dist/astro-emoji-picker/EmojiPicker.astro')
  const container = await AstroContainer.create()
  const text = await container.renderToString(EmojiText, { props: { text: '<script>🔥</script>' } })
  expect(text).toContain('&lt;script&gt;🔥&lt;/script&gt;')
  expect(text).not.toContain('<img')
  const picker = await container.renderToString(EmojiPicker, { props: { category: 'flags' } })
  expect(picker).toContain('data-rfr-emoji-native-only="true"')
  expect(picker).not.toContain('<img')
})
