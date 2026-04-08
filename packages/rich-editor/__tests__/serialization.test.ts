import { describe, it, expect, beforeEach } from 'vitest'
import {
  toMarkdown,
  fromMarkdown,
  toHTML,
  fromHTML,
  toPlainText,
} from '../src/serialization.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  createMentionSegment,
  createEmojiSegment,
  resetBlockIdCounter,
  getBlockText,
} from '../src/model.js'
import type { Document } from '../src/model.js'

beforeEach(() => {
  resetBlockIdCounter()
})

describe('serialization', () => {
  // =========================================================================
  // toMarkdown
  // =========================================================================
  describe('toMarkdown', () => {
    it('converts paragraph', () => {
      const doc = createDocument([createBlock('paragraph', [createTextSegment('Hello')])])
      expect(toMarkdown(doc)).toBe('Hello')
    })

    it('converts heading 1', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Title')], { level: 1 }),
      ])
      expect(toMarkdown(doc)).toBe('# Title')
    })

    it('converts heading 2', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Subtitle')], { level: 2 }),
      ])
      expect(toMarkdown(doc)).toBe('## Subtitle')
    })

    it('converts heading 3', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Section')], { level: 3 }),
      ])
      expect(toMarkdown(doc)).toBe('### Section')
    })

    it('converts blockquote', () => {
      const doc = createDocument([
        createBlock('blockquote', [createTextSegment('Quoted text')]),
      ])
      expect(toMarkdown(doc)).toBe('> Quoted text')
    })

    it('converts code block', () => {
      const doc = createDocument([
        createBlock('code-block', [createTextSegment('const x = 1')], { language: 'typescript' }),
      ])
      expect(toMarkdown(doc)).toBe('```typescript\nconst x = 1\n```')
    })

    it('converts code block without language', () => {
      const doc = createDocument([
        createBlock('code-block', [createTextSegment('code')]),
      ])
      expect(toMarkdown(doc)).toBe('```\ncode\n```')
    })

    it('converts bullet list item', () => {
      const doc = createDocument([
        createBlock('list-item', [createTextSegment('Item')], { listType: 'bullet' }),
      ])
      expect(toMarkdown(doc)).toBe('- Item')
    })

    it('converts ordered list item', () => {
      const doc = createDocument([
        createBlock('list-item', [createTextSegment('Item')], { listType: 'ordered' }),
      ])
      expect(toMarkdown(doc)).toBe('1. Item')
    })

    it('converts indented list item', () => {
      const block = createBlock('list-item', [createTextSegment('Nested')], { listType: 'bullet' })
      block.indent = 1
      const doc = createDocument([block])
      expect(toMarkdown(doc)).toBe('  - Nested')
    })

    it('converts divider', () => {
      const doc = createDocument([createBlock('divider')])
      expect(toMarkdown(doc)).toBe('---')
    })

    it('converts image', () => {
      const doc = createDocument([
        createBlock('image', [createTextSegment('')], { src: 'test.png', alt: 'Test' }),
      ])
      expect(toMarkdown(doc)).toBe('![Test](test.png)')
    })

    it('converts bold text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('bold', [{ type: 'bold' }])]),
      ])
      expect(toMarkdown(doc)).toBe('**bold**')
    })

    it('converts italic text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('italic', [{ type: 'italic' }])]),
      ])
      expect(toMarkdown(doc)).toBe('*italic*')
    })

    it('converts strikethrough text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('strike', [{ type: 'strikethrough' }])]),
      ])
      expect(toMarkdown(doc)).toBe('~~strike~~')
    })

    it('converts inline code', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('code', [{ type: 'code' }])]),
      ])
      expect(toMarkdown(doc)).toBe('`code`')
    })

    it('converts underline (as HTML)', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('underline', [{ type: 'underline' }])]),
      ])
      expect(toMarkdown(doc)).toBe('<u>underline</u>')
    })

    it('converts link', () => {
      const doc = createDocument([
        createBlock('paragraph', [
          createTextSegment('click', [{ type: 'link', attrs: { href: 'https://example.com' } }]),
        ]),
      ])
      expect(toMarkdown(doc)).toBe('[click](https://example.com)')
    })

    it('converts mention', () => {
      const doc = createDocument([
        createBlock('paragraph', [createMentionSegment('u1', '@alice')]),
      ])
      expect(toMarkdown(doc)).toBe('@alice')
    })

    it('converts emoji shortcode', () => {
      const doc = createDocument([
        createBlock('paragraph', [createEmojiSegment(':fire:', '\u{1F525}')]),
      ])
      expect(toMarkdown(doc)).toBe(':fire:')
    })

    it('converts mixed inline content', () => {
      const doc = createDocument([
        createBlock('paragraph', [
          createTextSegment('Hello '),
          createTextSegment('bold', [{ type: 'bold' }]),
          createTextSegment(' world'),
        ]),
      ])
      expect(toMarkdown(doc)).toBe('Hello **bold** world')
    })

    it('converts multiple blocks', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Title')], { level: 1 }),
        createBlock('paragraph', [createTextSegment('Content')]),
      ])
      expect(toMarkdown(doc)).toBe('# Title\n\nContent')
    })

    it('handles empty document', () => {
      const doc = createDocument()
      expect(toMarkdown(doc)).toBe('')
    })
  })

  // =========================================================================
  // fromMarkdown
  // =========================================================================
  describe('fromMarkdown', () => {
    it('parses paragraph', () => {
      const doc = fromMarkdown('Hello world')
      expect(doc.blocks[0].type).toBe('paragraph')
      expect(getBlockText(doc.blocks[0])).toBe('Hello world')
    })

    it('parses heading 1', () => {
      const doc = fromMarkdown('# Title')
      expect(doc.blocks[0].type).toBe('heading')
      expect(doc.blocks[0].meta?.level).toBe(1)
    })

    it('parses heading 2', () => {
      const doc = fromMarkdown('## Subtitle')
      expect(doc.blocks[0].type).toBe('heading')
      expect(doc.blocks[0].meta?.level).toBe(2)
    })

    it('parses heading 3', () => {
      const doc = fromMarkdown('### Section')
      expect(doc.blocks[0].type).toBe('heading')
      expect(doc.blocks[0].meta?.level).toBe(3)
    })

    it('parses blockquote', () => {
      const doc = fromMarkdown('> Quote')
      expect(doc.blocks[0].type).toBe('blockquote')
    })

    it('parses code block', () => {
      const doc = fromMarkdown('```typescript\nconst x = 1\n```')
      expect(doc.blocks[0].type).toBe('code-block')
      expect(doc.blocks[0].meta?.language).toBe('typescript')
      expect(getBlockText(doc.blocks[0])).toBe('const x = 1')
    })

    it('parses code block without language', () => {
      const doc = fromMarkdown('```\ncode here\n```')
      expect(doc.blocks[0].type).toBe('code-block')
    })

    it('parses bullet list', () => {
      const doc = fromMarkdown('- Item one\n- Item two')
      expect(doc.blocks).toHaveLength(2)
      expect(doc.blocks[0].type).toBe('list-item')
      expect(doc.blocks[0].meta?.listType).toBe('bullet')
    })

    it('parses ordered list', () => {
      const doc = fromMarkdown('1. First\n2. Second')
      expect(doc.blocks[0].type).toBe('list-item')
      expect(doc.blocks[0].meta?.listType).toBe('ordered')
    })

    it('parses divider', () => {
      const doc = fromMarkdown('---')
      expect(doc.blocks[0].type).toBe('divider')
    })

    it('parses image', () => {
      const doc = fromMarkdown('![Alt text](image.png)')
      expect(doc.blocks[0].type).toBe('image')
      expect(doc.blocks[0].meta?.alt).toBe('Alt text')
      expect(doc.blocks[0].meta?.src).toBe('image.png')
    })

    it('parses bold inline', () => {
      const doc = fromMarkdown('**bold text**')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('parses italic inline', () => {
      const doc = fromMarkdown('*italic text*')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'italic')).toBe(true)
      }
    })

    it('parses strikethrough inline', () => {
      const doc = fromMarkdown('~~strike~~')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'strikethrough')).toBe(true)
      }
    })

    it('parses inline code', () => {
      const doc = fromMarkdown('`code`')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'code')).toBe(true)
      }
    })

    it('parses link', () => {
      const doc = fromMarkdown('[click](https://example.com)')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'link')).toBe(true)
        const linkMark = seg.marks.find((m) => m.type === 'link')
        expect(linkMark?.attrs?.href).toBe('https://example.com')
      }
    })

    it('parses mention', () => {
      const doc = fromMarkdown('@alice')
      const seg = doc.blocks[0].content[0]
      expect(seg.type).toBe('mention')
      if (seg.type === 'mention') {
        expect(seg.label).toBe('@alice')
      }
    })

    it('parses emoji shortcode', () => {
      const doc = fromMarkdown(':fire:')
      const seg = doc.blocks[0].content[0]
      expect(seg.type).toBe('emoji')
    })

    it('parses empty string to default document', () => {
      const doc = fromMarkdown('')
      expect(doc.blocks).toHaveLength(1)
    })

    it('parses multiple blocks', () => {
      const doc = fromMarkdown('# Title\n\nParagraph text\n\n- List item')
      expect(doc.blocks.length).toBeGreaterThanOrEqual(3)
    })
  })

  // =========================================================================
  // Roundtrip: markdown -> doc -> markdown
  // =========================================================================
  describe('markdown roundtrip', () => {
    const cases = [
      'Hello world',
      '# Heading 1',
      '## Heading 2',
      '### Heading 3',
      '> Blockquote',
      '---',
      '- Bullet item',
      '1. Ordered item',
    ]

    cases.forEach((md) => {
      it(`roundtrips: ${md}`, () => {
        const doc = fromMarkdown(md)
        const result = toMarkdown(doc)
        expect(result).toBe(md)
      })
    })

    it('roundtrips bold text', () => {
      const doc = fromMarkdown('**bold**')
      const result = toMarkdown(doc)
      expect(result).toBe('**bold**')
    })

    it('roundtrips italic text', () => {
      const doc = fromMarkdown('*italic*')
      const result = toMarkdown(doc)
      expect(result).toBe('*italic*')
    })

    it('roundtrips code block with language', () => {
      const md = '```typescript\nconst x = 1\n```'
      const doc = fromMarkdown(md)
      const result = toMarkdown(doc)
      expect(result).toBe(md)
    })
  })

  // =========================================================================
  // toHTML
  // =========================================================================
  describe('toHTML', () => {
    it('converts paragraph', () => {
      const doc = createDocument([createBlock('paragraph', [createTextSegment('Hello')])])
      expect(toHTML(doc)).toBe('<p>Hello</p>')
    })

    it('converts heading', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Title')], { level: 1 }),
      ])
      expect(toHTML(doc)).toBe('<h1>Title</h1>')
    })

    it('converts heading 2', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Sub')], { level: 2 }),
      ])
      expect(toHTML(doc)).toBe('<h2>Sub</h2>')
    })

    it('converts blockquote', () => {
      const doc = createDocument([
        createBlock('blockquote', [createTextSegment('Quote')]),
      ])
      expect(toHTML(doc)).toBe('<blockquote>Quote</blockquote>')
    })

    it('converts code block', () => {
      const doc = createDocument([
        createBlock('code-block', [createTextSegment('code')]),
      ])
      expect(toHTML(doc)).toBe('<pre><code>code</code></pre>')
    })

    it('converts code block with language', () => {
      const doc = createDocument([
        createBlock('code-block', [createTextSegment('code')], { language: 'js' }),
      ])
      expect(toHTML(doc)).toBe('<pre><code class="language-js">code</code></pre>')
    })

    it('converts bullet list items into ul', () => {
      const doc = createDocument([
        createBlock('list-item', [createTextSegment('A')], { listType: 'bullet' }),
        createBlock('list-item', [createTextSegment('B')], { listType: 'bullet' }),
      ])
      expect(toHTML(doc)).toBe('<ul><li>A</li><li>B</li></ul>')
    })

    it('converts ordered list items into ol', () => {
      const doc = createDocument([
        createBlock('list-item', [createTextSegment('A')], { listType: 'ordered' }),
        createBlock('list-item', [createTextSegment('B')], { listType: 'ordered' }),
      ])
      expect(toHTML(doc)).toBe('<ol><li>A</li><li>B</li></ol>')
    })

    it('converts divider', () => {
      const doc = createDocument([createBlock('divider')])
      expect(toHTML(doc)).toBe('<hr>')
    })

    it('converts image', () => {
      const doc = createDocument([
        createBlock('image', [createTextSegment('')], { src: 'test.png', alt: 'Test' }),
      ])
      expect(toHTML(doc)).toBe('<img src="test.png" alt="Test">')
    })

    it('converts bold text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('bold', [{ type: 'bold' }])]),
      ])
      expect(toHTML(doc)).toBe('<p><strong>bold</strong></p>')
    })

    it('converts italic text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('italic', [{ type: 'italic' }])]),
      ])
      expect(toHTML(doc)).toBe('<p><em>italic</em></p>')
    })

    it('converts strikethrough text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('strike', [{ type: 'strikethrough' }])]),
      ])
      expect(toHTML(doc)).toBe('<p><del>strike</del></p>')
    })

    it('converts code mark', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('code', [{ type: 'code' }])]),
      ])
      expect(toHTML(doc)).toBe('<p><code>code</code></p>')
    })

    it('converts underline', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('under', [{ type: 'underline' }])]),
      ])
      expect(toHTML(doc)).toBe('<p><u>under</u></p>')
    })

    it('converts link', () => {
      const doc = createDocument([
        createBlock('paragraph', [
          createTextSegment('click', [{ type: 'link', attrs: { href: 'https://example.com' } }]),
        ]),
      ])
      expect(toHTML(doc)).toBe('<p><a href="https://example.com">click</a></p>')
    })

    it('converts mention to span', () => {
      const doc = createDocument([
        createBlock('paragraph', [createMentionSegment('u1', '@alice')]),
      ])
      expect(toHTML(doc)).toContain('class="mention"')
      expect(toHTML(doc)).toContain('@alice')
    })

    it('converts emoji to span', () => {
      const doc = createDocument([
        createBlock('paragraph', [createEmojiSegment(':fire:', '\u{1F525}')]),
      ])
      expect(toHTML(doc)).toContain('class="emoji"')
      expect(toHTML(doc)).toContain('\u{1F525}')
    })

    it('escapes HTML in text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('<script>alert("xss")</script>')]),
      ])
      const html = toHTML(doc)
      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })

    it('converts multiple blocks', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Title')], { level: 1 }),
        createBlock('paragraph', [createTextSegment('Content')]),
      ])
      expect(toHTML(doc)).toBe('<h1>Title</h1><p>Content</p>')
    })
  })

  // =========================================================================
  // fromHTML
  // =========================================================================
  describe('fromHTML', () => {
    it('parses paragraph', () => {
      const doc = fromHTML('<p>Hello</p>')
      expect(doc.blocks[0].type).toBe('paragraph')
      expect(getBlockText(doc.blocks[0])).toBe('Hello')
    })

    it('parses heading', () => {
      const doc = fromHTML('<h1>Title</h1>')
      expect(doc.blocks[0].type).toBe('heading')
      expect(doc.blocks[0].meta?.level).toBe(1)
    })

    it('parses h2', () => {
      const doc = fromHTML('<h2>Sub</h2>')
      expect(doc.blocks[0].meta?.level).toBe(2)
    })

    it('parses h3', () => {
      const doc = fromHTML('<h3>Section</h3>')
      expect(doc.blocks[0].meta?.level).toBe(3)
    })

    it('parses blockquote', () => {
      const doc = fromHTML('<blockquote>Quote</blockquote>')
      expect(doc.blocks[0].type).toBe('blockquote')
    })

    it('parses code block', () => {
      const doc = fromHTML('<pre><code>code</code></pre>')
      expect(doc.blocks[0].type).toBe('code-block')
    })

    it('parses code block with language', () => {
      const doc = fromHTML('<pre><code class="language-js">code</code></pre>')
      expect(doc.blocks[0].meta?.language).toBe('js')
    })

    it('parses unordered list', () => {
      const doc = fromHTML('<ul><li>A</li><li>B</li></ul>')
      expect(doc.blocks).toHaveLength(2)
      expect(doc.blocks[0].type).toBe('list-item')
      expect(doc.blocks[0].meta?.listType).toBe('bullet')
    })

    it('parses ordered list', () => {
      const doc = fromHTML('<ol><li>A</li><li>B</li></ol>')
      expect(doc.blocks[0].meta?.listType).toBe('ordered')
    })

    it('parses hr', () => {
      const doc = fromHTML('<hr>')
      expect(doc.blocks[0].type).toBe('divider')
    })

    it('parses img', () => {
      const doc = fromHTML('<img src="test.png" alt="Test">')
      expect(doc.blocks[0].type).toBe('image')
      expect(doc.blocks[0].meta?.src).toBe('test.png')
    })

    it('parses bold', () => {
      const doc = fromHTML('<p><strong>bold</strong></p>')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('parses italic', () => {
      const doc = fromHTML('<p><em>italic</em></p>')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'italic')).toBe(true)
      }
    })

    it('parses link', () => {
      const doc = fromHTML('<p><a href="https://example.com">click</a></p>')
      const seg = doc.blocks[0].content[0]
      if (seg.type === 'text') {
        const linkMark = seg.marks.find((m) => m.type === 'link')
        expect(linkMark?.attrs?.href).toBe('https://example.com')
      }
    })

    it('parses empty string to default document', () => {
      const doc = fromHTML('')
      expect(doc.blocks).toHaveLength(1)
    })
  })

  // =========================================================================
  // HTML roundtrip
  // =========================================================================
  describe('HTML roundtrip', () => {
    it('roundtrips paragraph', () => {
      const doc = createDocument([createBlock('paragraph', [createTextSegment('Hello')])])
      const html = toHTML(doc)
      const parsed = fromHTML(html)
      expect(getBlockText(parsed.blocks[0])).toBe('Hello')
    })

    it('roundtrips heading', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Title')], { level: 1 }),
      ])
      const html = toHTML(doc)
      const parsed = fromHTML(html)
      expect(parsed.blocks[0].type).toBe('heading')
      expect(parsed.blocks[0].meta?.level).toBe(1)
    })

    it('roundtrips bold text', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('bold', [{ type: 'bold' }])]),
      ])
      const html = toHTML(doc)
      const parsed = fromHTML(html)
      const seg = parsed.blocks[0].content[0]
      if (seg.type === 'text') {
        expect(seg.marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })
  })

  // =========================================================================
  // toPlainText
  // =========================================================================
  describe('toPlainText', () => {
    it('strips formatting from paragraph', () => {
      const doc = createDocument([
        createBlock('paragraph', [
          createTextSegment('Hello ', [{ type: 'bold' }]),
          createTextSegment('World'),
        ]),
      ])
      expect(toPlainText(doc)).toBe('Hello World')
    })

    it('converts heading to plain text', () => {
      const doc = createDocument([
        createBlock('heading', [createTextSegment('Title')], { level: 1 }),
      ])
      expect(toPlainText(doc)).toBe('Title')
    })

    it('converts list items with prefix', () => {
      const doc = createDocument([
        createBlock('list-item', [createTextSegment('Item')], { listType: 'bullet' }),
      ])
      expect(toPlainText(doc)).toBe('- Item')
    })

    it('converts ordered list items with prefix', () => {
      const doc = createDocument([
        createBlock('list-item', [createTextSegment('Item')], { listType: 'ordered' }),
      ])
      expect(toPlainText(doc)).toBe('1. Item')
    })

    it('converts divider', () => {
      const doc = createDocument([createBlock('divider')])
      expect(toPlainText(doc)).toBe('---')
    })

    it('includes mention labels', () => {
      const doc = createDocument([
        createBlock('paragraph', [
          createTextSegment('Hi '),
          createMentionSegment('u1', '@alice'),
        ]),
      ])
      expect(toPlainText(doc)).toBe('Hi @alice')
    })

    it('includes emoji unicode', () => {
      const doc = createDocument([
        createBlock('paragraph', [createEmojiSegment(':fire:', '\u{1F525}')]),
      ])
      expect(toPlainText(doc)).toBe('\u{1F525}')
    })

    it('joins multiple blocks with newlines', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('First')]),
        createBlock('paragraph', [createTextSegment('Second')]),
      ])
      expect(toPlainText(doc)).toBe('First\nSecond')
    })

    it('handles empty document', () => {
      const doc = createDocument()
      expect(toPlainText(doc)).toBe('')
    })

    it('handles only whitespace', () => {
      const doc = createDocument([createBlock('paragraph', [createTextSegment('   ')])])
      expect(toPlainText(doc)).toBe('   ')
    })
  })

  // =========================================================================
  // Edge cases
  // =========================================================================
  describe('edge cases', () => {
    it('handles special characters in markdown', () => {
      const doc = createDocument([createBlock('paragraph', [createTextSegment('a & b < c')])])
      const html = toHTML(doc)
      expect(html).toContain('&amp;')
      expect(html).toContain('&lt;')
    })

    it('handles special characters in HTML parsing', () => {
      const doc = fromHTML('<p>a &amp; b &lt; c</p>')
      expect(getBlockText(doc.blocks[0])).toBe('a & b < c')
    })

    it('handles multi-line code block', () => {
      const md = '```\nline1\nline2\nline3\n```'
      const doc = fromMarkdown(md)
      expect(getBlockText(doc.blocks[0])).toBe('line1\nline2\nline3')
    })

    it('handles indented list in markdown', () => {
      const doc = fromMarkdown('  - Nested item')
      expect(doc.blocks[0].type).toBe('list-item')
      expect(doc.blocks[0].indent).toBe(1)
    })
  })
})
