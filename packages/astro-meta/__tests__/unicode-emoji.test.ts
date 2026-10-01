import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'

describe('Astro Unicode artwork, published meta shape', () => {
  it('renders complete supported sequences and native unsupported text', async () => {
    const { default: EmojiText } = await import('../dist/astro-emoji-picker/EmojiText.astro')
    const container = await AstroContainer.create()
    const html = await container.renderToString(EmojiText, {
      props: { text: 'Hello 🔥 ❤️‍🔥 🇬🇧 1️⃣ 👍🏽 ✈︎', twemojiBaseUrl: '/emoji/' },
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
    const html = await container.renderToString(EmojiPicker, { props: { category: 'flags', twemojiBaseUrl: '/emoji/' } })
    expect(html).toContain('/emoji/1f1ec-1f1e7.svg')
    expect(html).toContain('data-rfr-emoji-base-url="/emoji/"')
  })
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
