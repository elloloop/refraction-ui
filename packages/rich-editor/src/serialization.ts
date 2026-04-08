/**
 * Serialization — convert documents to/from Markdown, HTML, and plain text.
 */

import type {
  Document,
  Block,
  InlineContent,
  TextSegment,
  Mark,
  MarkType,
  BlockType,
} from './model.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  createMentionSegment,
  createEmojiSegment,
  normalizeContent,
} from './model.js'
import { EMOJI_MAP } from './emoji.js'

// ---------------------------------------------------------------------------
// To Markdown
// ---------------------------------------------------------------------------

function marksToMarkdown(text: string, marks: Mark[]): string {
  let result = text

  // Sort marks so that wrapping is consistent: link outermost, then bold, italic, etc.
  const sorted = [...marks].sort((a, b) => {
    const order: MarkType[] = ['link', 'bold', 'italic', 'strikethrough', 'code', 'underline']
    return order.indexOf(a.type) - order.indexOf(b.type)
  })

  for (const mark of sorted) {
    switch (mark.type) {
      case 'bold':
        result = `**${result}**`
        break
      case 'italic':
        result = `*${result}*`
        break
      case 'strikethrough':
        result = `~~${result}~~`
        break
      case 'code':
        result = `\`${result}\``
        break
      case 'underline':
        // No standard markdown for underline; use HTML
        result = `<u>${result}</u>`
        break
      case 'link':
        result = `[${result}](${mark.attrs?.href ?? ''})`
        break
    }
  }

  return result
}

function inlineContentToMarkdown(content: InlineContent[]): string {
  return content
    .map((seg) => {
      if (seg.type === 'text') {
        if (seg.text === '' && seg.marks.length === 0) return ''
        return marksToMarkdown(seg.text, seg.marks)
      }
      if (seg.type === 'mention') {
        return seg.label
      }
      if (seg.type === 'emoji') {
        return seg.shortcode
      }
      return ''
    })
    .join('')
}

function blockToMarkdown(block: Block): string {
  const content = inlineContentToMarkdown(block.content)

  switch (block.type) {
    case 'paragraph':
      return content
    case 'heading': {
      const level = (block.meta?.level as number) ?? 1
      const prefix = '#'.repeat(level)
      return `${prefix} ${content}`
    }
    case 'blockquote':
      return `> ${content}`
    case 'code-block': {
      const lang = (block.meta?.language as string) ?? ''
      return `\`\`\`${lang}\n${content}\n\`\`\``
    }
    case 'list-item': {
      const listType = block.meta?.listType as string
      const indent = '  '.repeat(block.indent ?? 0)
      if (listType === 'ordered') {
        return `${indent}1. ${content}`
      }
      return `${indent}- ${content}`
    }
    case 'divider':
      return '---'
    case 'image': {
      const src = (block.meta?.src as string) ?? ''
      const alt = (block.meta?.alt as string) ?? ''
      return `![${alt}](${src})`
    }
    default:
      return content
  }
}

export function toMarkdown(doc: Document): string {
  return doc.blocks.map(blockToMarkdown).join('\n\n')
}

// ---------------------------------------------------------------------------
// From Markdown
// ---------------------------------------------------------------------------

function parseInlineMarkdown(text: string): InlineContent[] {
  const segments: InlineContent[] = []
  let remaining = text

  // Process inline patterns
  // We use a priority-based approach: longer/more complex patterns first
  while (remaining.length > 0) {
    let matched = false

    // Bold: **text** or __text__
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/) || remaining.match(/^__(.+?)__/)
    if (boldMatch) {
      segments.push(createTextSegment(boldMatch[1], [{ type: 'bold' }]))
      remaining = remaining.slice(boldMatch[0].length)
      matched = true
      continue
    }

    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch) {
      segments.push(createTextSegment(strikeMatch[1], [{ type: 'strikethrough' }]))
      remaining = remaining.slice(strikeMatch[0].length)
      matched = true
      continue
    }

    // Italic: *text* or _text_
    const italicMatch = remaining.match(/^\*(.+?)\*/) || remaining.match(/^_(.+?)_/)
    if (italicMatch) {
      segments.push(createTextSegment(italicMatch[1], [{ type: 'italic' }]))
      remaining = remaining.slice(italicMatch[0].length)
      matched = true
      continue
    }

    // Inline code: `text`
    const codeMatch = remaining.match(/^`(.+?)`/)
    if (codeMatch) {
      segments.push(createTextSegment(codeMatch[1], [{ type: 'code' }]))
      remaining = remaining.slice(codeMatch[0].length)
      matched = true
      continue
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      segments.push(
        createTextSegment(linkMatch[1], [{ type: 'link', attrs: { href: linkMatch[2] } }]),
      )
      remaining = remaining.slice(linkMatch[0].length)
      matched = true
      continue
    }

    // Mention: @username (word characters after @)
    const mentionMatch = remaining.match(/^@(\w+)/)
    if (mentionMatch) {
      segments.push(createMentionSegment(mentionMatch[1], `@${mentionMatch[1]}`))
      remaining = remaining.slice(mentionMatch[0].length)
      matched = true
      continue
    }

    // Emoji shortcode: :name:
    const emojiMatch = remaining.match(/^:([a-z0-9_]+):/)
    if (emojiMatch) {
      const shortcode = `:${emojiMatch[1]}:`
      const unicode = EMOJI_MAP[shortcode]
      if (unicode) {
        segments.push(createEmojiSegment(shortcode, unicode))
        remaining = remaining.slice(emojiMatch[0].length)
        matched = true
        continue
      }
    }

    // Underline (HTML): <u>text</u>
    const underlineMatch = remaining.match(/^<u>(.+?)<\/u>/)
    if (underlineMatch) {
      segments.push(createTextSegment(underlineMatch[1], [{ type: 'underline' }]))
      remaining = remaining.slice(underlineMatch[0].length)
      matched = true
      continue
    }

    if (!matched) {
      // Consume one character as plain text
      // Aggregate consecutive plain characters
      let endIdx = 1
      while (endIdx < remaining.length) {
        const ch = remaining[endIdx]
        if (ch === '*' || ch === '~' || ch === '`' || ch === '[' || ch === '@' || ch === ':' || ch === '_' || ch === '<') break
        endIdx++
      }
      segments.push(createTextSegment(remaining.slice(0, endIdx)))
      remaining = remaining.slice(endIdx)
    }
  }

  return segments.length > 0 ? normalizeContent(segments) : [createTextSegment('')]
}

function parseMarkdownLine(line: string, isInCodeBlock: boolean): Block | null {
  if (isInCodeBlock) return null // handled by caller

  // Heading
  const headingMatch = line.match(/^(#{1,3}) (.*)/)
  if (headingMatch) {
    const level = headingMatch[1].length as 1 | 2 | 3
    return createBlock('heading', parseInlineMarkdown(headingMatch[2]), { level })
  }

  // Blockquote
  const quoteMatch = line.match(/^> (.*)/)
  if (quoteMatch) {
    return createBlock('blockquote', parseInlineMarkdown(quoteMatch[1]))
  }

  // Divider
  if (/^---+$/.test(line.trim())) {
    return createBlock('divider')
  }

  // Ordered list
  const orderedMatch = line.match(/^(\s*)(\d+)\. (.*)/)
  if (orderedMatch) {
    const indent = Math.floor(orderedMatch[1].length / 2)
    const block = createBlock('list-item', parseInlineMarkdown(orderedMatch[3]), { listType: 'ordered' })
    if (indent > 0) block.indent = indent
    return block
  }

  // Unordered list
  const unorderedMatch = line.match(/^(\s*)[-*] (.*)/)
  if (unorderedMatch) {
    const indent = Math.floor(unorderedMatch[1].length / 2)
    const block = createBlock('list-item', parseInlineMarkdown(unorderedMatch[2]), { listType: 'bullet' })
    if (indent > 0) block.indent = indent
    return block
  }

  // Image
  const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
  if (imageMatch) {
    return createBlock('image', [createTextSegment('')], { alt: imageMatch[1], src: imageMatch[2] })
  }

  // Empty line
  if (line.trim() === '') {
    return null
  }

  // Paragraph (default)
  return createBlock('paragraph', parseInlineMarkdown(line))
}

export function fromMarkdown(markdown: string): Document {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push(
        createBlock('code-block', [createTextSegment(codeLines.join('\n'))], lang ? { language: lang } : undefined),
      )
      continue
    }

    const block = parseMarkdownLine(line, false)
    if (block) {
      blocks.push(block)
    }
    i++
  }

  return createDocument(blocks.length > 0 ? blocks : undefined)
}

// ---------------------------------------------------------------------------
// To HTML
// ---------------------------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function marksToHtml(text: string, marks: Mark[]): string {
  let result = escapeHtml(text)

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        result = `<strong>${result}</strong>`
        break
      case 'italic':
        result = `<em>${result}</em>`
        break
      case 'strikethrough':
        result = `<del>${result}</del>`
        break
      case 'code':
        result = `<code>${result}</code>`
        break
      case 'underline':
        result = `<u>${result}</u>`
        break
      case 'link':
        result = `<a href="${escapeHtml(mark.attrs?.href ?? '')}">${result}</a>`
        break
    }
  }

  return result
}

function inlineContentToHtml(content: InlineContent[]): string {
  return content
    .map((seg) => {
      if (seg.type === 'text') {
        return marksToHtml(seg.text, seg.marks)
      }
      if (seg.type === 'mention') {
        return `<span class="mention" data-mention-id="${escapeHtml(seg.id)}">${escapeHtml(seg.label)}</span>`
      }
      if (seg.type === 'emoji') {
        return `<span class="emoji" data-shortcode="${escapeHtml(seg.shortcode)}">${seg.unicode}</span>`
      }
      return ''
    })
    .join('')
}

function blockToHtml(block: Block): string {
  const content = inlineContentToHtml(block.content)

  switch (block.type) {
    case 'paragraph':
      return `<p>${content}</p>`
    case 'heading': {
      const level = (block.meta?.level as number) ?? 1
      return `<h${level}>${content}</h${level}>`
    }
    case 'blockquote':
      return `<blockquote>${content}</blockquote>`
    case 'code-block': {
      const lang = block.meta?.language as string
      const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : ''
      return `<pre><code${langAttr}>${content}</code></pre>`
    }
    case 'list-item':
      return `<li>${content}</li>`
    case 'divider':
      return '<hr>'
    case 'image': {
      const src = (block.meta?.src as string) ?? ''
      const alt = (block.meta?.alt as string) ?? ''
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`
    }
    default:
      return `<p>${content}</p>`
  }
}

export function toHTML(doc: Document): string {
  // Group list items into <ul> or <ol>
  const parts: string[] = []
  let i = 0

  while (i < doc.blocks.length) {
    const block = doc.blocks[i]

    if (block.type === 'list-item') {
      const listType = block.meta?.listType === 'ordered' ? 'ol' : 'ul'
      const items: string[] = []
      while (i < doc.blocks.length && doc.blocks[i].type === 'list-item') {
        items.push(blockToHtml(doc.blocks[i]))
        i++
      }
      parts.push(`<${listType}>${items.join('')}</${listType}>`)
    } else {
      parts.push(blockToHtml(block))
      i++
    }
  }

  return parts.join('')
}

// ---------------------------------------------------------------------------
// From HTML (basic)
// ---------------------------------------------------------------------------

function parseHtmlInlineContent(html: string): InlineContent[] {
  const segments: InlineContent[] = []
  let remaining = html

  while (remaining.length > 0) {
    let matched = false

    // <strong>text</strong>
    const boldMatch = remaining.match(/^<strong>(.*?)<\/strong>/)
    if (boldMatch) {
      segments.push(createTextSegment(unescapeHtml(boldMatch[1]), [{ type: 'bold' }]))
      remaining = remaining.slice(boldMatch[0].length)
      matched = true
      continue
    }

    // <em>text</em>
    const emMatch = remaining.match(/^<em>(.*?)<\/em>/)
    if (emMatch) {
      segments.push(createTextSegment(unescapeHtml(emMatch[1]), [{ type: 'italic' }]))
      remaining = remaining.slice(emMatch[0].length)
      matched = true
      continue
    }

    // <del>text</del>
    const delMatch = remaining.match(/^<del>(.*?)<\/del>/)
    if (delMatch) {
      segments.push(createTextSegment(unescapeHtml(delMatch[1]), [{ type: 'strikethrough' }]))
      remaining = remaining.slice(delMatch[0].length)
      matched = true
      continue
    }

    // <code>text</code>
    const codeMatch = remaining.match(/^<code>(.*?)<\/code>/)
    if (codeMatch) {
      segments.push(createTextSegment(unescapeHtml(codeMatch[1]), [{ type: 'code' }]))
      remaining = remaining.slice(codeMatch[0].length)
      matched = true
      continue
    }

    // <u>text</u>
    const uMatch = remaining.match(/^<u>(.*?)<\/u>/)
    if (uMatch) {
      segments.push(createTextSegment(unescapeHtml(uMatch[1]), [{ type: 'underline' }]))
      remaining = remaining.slice(uMatch[0].length)
      matched = true
      continue
    }

    // <a href="url">text</a>
    const linkMatch = remaining.match(/^<a href="([^"]*)">(.*?)<\/a>/)
    if (linkMatch) {
      segments.push(
        createTextSegment(unescapeHtml(linkMatch[2]), [{ type: 'link', attrs: { href: unescapeHtml(linkMatch[1]) } }]),
      )
      remaining = remaining.slice(linkMatch[0].length)
      matched = true
      continue
    }

    // <span class="mention" data-mention-id="id">label</span>
    const mentionMatch = remaining.match(
      /^<span class="mention" data-mention-id="([^"]*)">(.*?)<\/span>/,
    )
    if (mentionMatch) {
      segments.push(createMentionSegment(unescapeHtml(mentionMatch[1]), unescapeHtml(mentionMatch[2])))
      remaining = remaining.slice(mentionMatch[0].length)
      matched = true
      continue
    }

    // <span class="emoji" data-shortcode=":name:">unicode</span>
    const emojiMatch = remaining.match(
      /^<span class="emoji" data-shortcode="([^"]*)">(.*?)<\/span>/,
    )
    if (emojiMatch) {
      segments.push(createEmojiSegment(unescapeHtml(emojiMatch[1]), emojiMatch[2]))
      remaining = remaining.slice(emojiMatch[0].length)
      matched = true
      continue
    }

    if (!matched) {
      // Plain text until next tag
      const nextTagIdx = remaining.indexOf('<', 1)
      if (nextTagIdx === -1) {
        segments.push(createTextSegment(unescapeHtml(remaining)))
        break
      }
      // Check if the first char is '<' (unknown tag)
      if (remaining[0] === '<') {
        // Skip unknown tag
        const closeIdx = remaining.indexOf('>')
        if (closeIdx !== -1) {
          remaining = remaining.slice(closeIdx + 1)
        } else {
          remaining = remaining.slice(1)
        }
      } else {
        segments.push(createTextSegment(unescapeHtml(remaining.slice(0, nextTagIdx))))
        remaining = remaining.slice(nextTagIdx)
      }
    }
  }

  return segments.length > 0 ? normalizeContent(segments) : [createTextSegment('')]
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
}

export function fromHTML(html: string): Document {
  const blocks: Block[] = []
  let remaining = html

  while (remaining.length > 0) {
    let matched = false

    // <h1>...</h1>, <h2>...</h2>, <h3>...</h3>
    const headingMatch = remaining.match(/^<h([123])>(.*?)<\/h\1>/)
    if (headingMatch) {
      const level = parseInt(headingMatch[1]) as 1 | 2 | 3
      blocks.push(createBlock('heading', parseHtmlInlineContent(headingMatch[2]), { level }))
      remaining = remaining.slice(headingMatch[0].length)
      matched = true
      continue
    }

    // <p>...</p>
    const pMatch = remaining.match(/^<p>(.*?)<\/p>/)
    if (pMatch) {
      blocks.push(createBlock('paragraph', parseHtmlInlineContent(pMatch[1])))
      remaining = remaining.slice(pMatch[0].length)
      matched = true
      continue
    }

    // <blockquote>...</blockquote>
    const bqMatch = remaining.match(/^<blockquote>(.*?)<\/blockquote>/)
    if (bqMatch) {
      blocks.push(createBlock('blockquote', parseHtmlInlineContent(bqMatch[1])))
      remaining = remaining.slice(bqMatch[0].length)
      matched = true
      continue
    }

    // <pre><code...>...</code></pre>
    const preMatch = remaining.match(/^<pre><code(?: class="language-([^"]*)")?>(.*?)<\/code><\/pre>/)
    if (preMatch) {
      const lang = preMatch[1]
      blocks.push(
        createBlock('code-block', [createTextSegment(unescapeHtml(preMatch[2]))], lang ? { language: lang } : undefined),
      )
      remaining = remaining.slice(preMatch[0].length)
      matched = true
      continue
    }

    // <ul>...</ul>
    const ulMatch = remaining.match(/^<ul>(.*?)<\/ul>/)
    if (ulMatch) {
      const liMatches = ulMatch[1].matchAll(/<li>(.*?)<\/li>/g)
      for (const li of liMatches) {
        blocks.push(createBlock('list-item', parseHtmlInlineContent(li[1]), { listType: 'bullet' }))
      }
      remaining = remaining.slice(ulMatch[0].length)
      matched = true
      continue
    }

    // <ol>...</ol>
    const olMatch = remaining.match(/^<ol>(.*?)<\/ol>/)
    if (olMatch) {
      const liMatches = olMatch[1].matchAll(/<li>(.*?)<\/li>/g)
      for (const li of liMatches) {
        blocks.push(createBlock('list-item', parseHtmlInlineContent(li[1]), { listType: 'ordered' }))
      }
      remaining = remaining.slice(olMatch[0].length)
      matched = true
      continue
    }

    // <hr> or <hr/>
    const hrMatch = remaining.match(/^<hr\s*\/?>/)
    if (hrMatch) {
      blocks.push(createBlock('divider'))
      remaining = remaining.slice(hrMatch[0].length)
      matched = true
      continue
    }

    // <img src="..." alt="...">
    const imgMatch = remaining.match(/^<img src="([^"]*)" alt="([^"]*)"\s*\/?>/)
    if (imgMatch) {
      blocks.push(createBlock('image', [createTextSegment('')], { src: unescapeHtml(imgMatch[1]), alt: unescapeHtml(imgMatch[2]) }))
      remaining = remaining.slice(imgMatch[0].length)
      matched = true
      continue
    }

    if (!matched) {
      // Skip whitespace or unknown content
      const nextTagIdx = remaining.indexOf('<', 1)
      if (nextTagIdx === -1) {
        // Remaining text as paragraph
        const trimmed = remaining.trim()
        if (trimmed) {
          blocks.push(createBlock('paragraph', [createTextSegment(trimmed)]))
        }
        break
      }
      if (remaining[0] !== '<') {
        const text = remaining.slice(0, nextTagIdx).trim()
        if (text) {
          blocks.push(createBlock('paragraph', [createTextSegment(text)]))
        }
        remaining = remaining.slice(nextTagIdx)
      } else {
        // Unknown tag, skip
        const closeIdx = remaining.indexOf('>')
        if (closeIdx !== -1) {
          remaining = remaining.slice(closeIdx + 1)
        } else {
          break
        }
      }
    }
  }

  return createDocument(blocks.length > 0 ? blocks : undefined)
}

// ---------------------------------------------------------------------------
// To Plain Text
// ---------------------------------------------------------------------------

function blockToPlainText(block: Block): string {
  const content = block.content
    .map((seg) => {
      if (seg.type === 'text') return seg.text
      if (seg.type === 'mention') return seg.label
      if (seg.type === 'emoji') return seg.unicode
      return ''
    })
    .join('')

  switch (block.type) {
    case 'heading':
      return content
    case 'blockquote':
      return content
    case 'list-item': {
      const indent = '  '.repeat(block.indent ?? 0)
      const listType = block.meta?.listType
      const prefix = listType === 'ordered' ? '1. ' : '- '
      return `${indent}${prefix}${content}`
    }
    case 'divider':
      return '---'
    default:
      return content
  }
}

export function toPlainText(doc: Document): string {
  return doc.blocks.map(blockToPlainText).join('\n')
}
