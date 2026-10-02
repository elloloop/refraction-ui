'use client'
import { useEffect, useRef, useState } from 'react'
import { enhanceUnicodeEmojiDisplay } from '@refraction-ui/react-emoji-picker'
import { MarkdownRenderer } from '@refraction-ui/react-markdown-renderer'
interface MarkdownRendererExamplesProps { section: 'basic' | 'unicode' }
const sampleMarkdown = `# Hello World

This is a **markdown** renderer with *italic* and \`inline code\`.

## Features
- Headings
- Lists
- Code blocks
- Bold and italic text

\`\`\`js
const greeting = "Hello!"
console.log(greeting)
\`\`\`
`
export function MarkdownRendererExamples({ section }: MarkdownRendererExamplesProps) {
  const [updated, setUpdated] = useState(false)
  const [artwork, setArtwork] = useState(true)
  if (section === 'unicode') {
    const content = updated ? 'Updated 👩‍💻 🇯🇵 2️⃣ · `code 🔥`' : 'Message **🔥 ❤️‍🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣** · fallback 👍🏽 ✈︎\n\n[Link 🔥](https://example.com/path?emoji=🔥) and `code 🔥`\n\n```txt\nraw 🔥 👨‍👩‍👧‍👦\n```'
    return <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <button onClick={() => setUpdated(true)}>Update Unicode message</button>
      <button onClick={() => setArtwork(value => !value)}>Toggle message artwork</button>
      <SharedDisplayExample />
      <div data-testid="unicode-message-before"><MarkdownRenderer content={content} emojiArtwork={false} /></div>
      <div data-testid="unicode-message-after"><MarkdownRenderer content={content} emojiArtwork={artwork} twemojiBaseUrl="/emoji" /></div>
    </div>
  }
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-lg">
          <MarkdownRenderer content={sampleMarkdown} />
        </div>
      </div>
    )
  }
  return null
}


function SharedDisplayExample() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    enhanceUnicodeEmojiDisplay(ref.current, '/emoji')
    enhanceUnicodeEmojiDisplay(ref.current, '/emoji')
  }, [])
  return <div ref={ref} data-testid="unicode-shared-display">
    <p>Message 🔥 👨‍👩‍👧‍👦 🇬🇧 1️⃣ 👍🏽 ✈︎</p>
    <a href="https://example.com/🔥">Link 🔥</a>
    <code>code 🔥</code><pre>raw 🔥</pre>
    <div contentEditable suppressContentEditableWarning>edit 🔥</div>
    <textarea defaultValue="draft 🔥" /><svg width="80" height="24"><text y="18">SVG 🔥</text></svg>
  </div>
}
