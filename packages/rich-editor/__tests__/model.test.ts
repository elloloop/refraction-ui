import { describe, it, expect, beforeEach } from 'vitest'
import {
  createDocument,
  createBlock,
  createTextSegment,
  createMentionSegment,
  createEmojiSegment,
  generateBlockId,
  resetBlockIdCounter,
  getBlockText,
  getBlockTextLength,
  findBlockById,
  findBlockIndex,
  cloneDocument,
  cloneBlock,
  marksEqual,
  normalizeContent,
} from '../src/model.js'
import type { Block, Document, Mark, InlineContent } from '../src/model.js'

beforeEach(() => {
  resetBlockIdCounter()
})

describe('model', () => {
  // -------------------------------------------------------------------------
  // Document creation
  // -------------------------------------------------------------------------
  describe('createDocument', () => {
    it('creates an empty document with one paragraph', () => {
      const doc = createDocument()
      expect(doc.blocks).toHaveLength(1)
      expect(doc.blocks[0].type).toBe('paragraph')
      expect(doc.version).toBe(1)
    })

    it('creates a document with provided blocks', () => {
      const blocks = [createBlock('heading', [createTextSegment('Title')], { level: 1 })]
      const doc = createDocument(blocks)
      expect(doc.blocks).toHaveLength(1)
      expect(doc.blocks[0].type).toBe('heading')
    })

    it('defaults to paragraph when given empty block array', () => {
      const doc = createDocument([])
      expect(doc.blocks).toHaveLength(1)
      expect(doc.blocks[0].type).toBe('paragraph')
    })

    it('has version 1', () => {
      const doc = createDocument()
      expect(doc.version).toBe(1)
    })
  })

  // -------------------------------------------------------------------------
  // Block creation
  // -------------------------------------------------------------------------
  describe('createBlock', () => {
    it('creates a paragraph block by default', () => {
      const block = createBlock()
      expect(block.type).toBe('paragraph')
      expect(block.content).toHaveLength(1)
      expect(block.content[0]).toEqual({ type: 'text', text: '', marks: [] })
    })

    it('creates a heading block', () => {
      const block = createBlock('heading', [createTextSegment('Hello')], { level: 1 })
      expect(block.type).toBe('heading')
      expect(block.meta).toEqual({ level: 1 })
    })

    it('creates a blockquote', () => {
      const block = createBlock('blockquote', [createTextSegment('Quote text')])
      expect(block.type).toBe('blockquote')
    })

    it('creates a code block', () => {
      const block = createBlock('code-block', [createTextSegment('const x = 1')], { language: 'typescript' })
      expect(block.type).toBe('code-block')
      expect(block.meta?.language).toBe('typescript')
    })

    it('creates a list item', () => {
      const block = createBlock('list-item', [createTextSegment('Item')], { listType: 'bullet' })
      expect(block.type).toBe('list-item')
    })

    it('creates a divider', () => {
      const block = createBlock('divider')
      expect(block.type).toBe('divider')
    })

    it('creates an image block', () => {
      const block = createBlock('image', [createTextSegment('')], { src: 'test.png', alt: 'Test' })
      expect(block.type).toBe('image')
      expect(block.meta?.src).toBe('test.png')
    })

    it('assigns unique IDs', () => {
      const b1 = createBlock()
      const b2 = createBlock()
      expect(b1.id).not.toBe(b2.id)
    })

    it('creates block with empty text segment when no content provided', () => {
      const block = createBlock('paragraph')
      expect(block.content).toHaveLength(1)
      expect(block.content[0].type).toBe('text')
      expect((block.content[0] as any).text).toBe('')
    })
  })

  // -------------------------------------------------------------------------
  // TextSegment
  // -------------------------------------------------------------------------
  describe('createTextSegment', () => {
    it('creates a plain text segment', () => {
      const seg = createTextSegment('Hello')
      expect(seg.type).toBe('text')
      expect(seg.text).toBe('Hello')
      expect(seg.marks).toEqual([])
    })

    it('creates a text segment with marks', () => {
      const seg = createTextSegment('Bold', [{ type: 'bold' }])
      expect(seg.marks).toEqual([{ type: 'bold' }])
    })

    it('creates a text segment with multiple marks', () => {
      const seg = createTextSegment('Both', [{ type: 'bold' }, { type: 'italic' }])
      expect(seg.marks).toHaveLength(2)
    })

    it('creates a text segment with link mark', () => {
      const seg = createTextSegment('Link', [{ type: 'link', attrs: { href: 'https://example.com' } }])
      expect(seg.marks[0].attrs?.href).toBe('https://example.com')
    })
  })

  // -------------------------------------------------------------------------
  // MentionSegment
  // -------------------------------------------------------------------------
  describe('createMentionSegment', () => {
    it('creates a mention segment', () => {
      const seg = createMentionSegment('user-1', '@alice')
      expect(seg.type).toBe('mention')
      expect(seg.id).toBe('user-1')
      expect(seg.label).toBe('@alice')
    })
  })

  // -------------------------------------------------------------------------
  // EmojiSegment
  // -------------------------------------------------------------------------
  describe('createEmojiSegment', () => {
    it('creates an emoji segment', () => {
      const seg = createEmojiSegment(':smile:', '\u{1F604}')
      expect(seg.type).toBe('emoji')
      expect(seg.shortcode).toBe(':smile:')
      expect(seg.unicode).toBe('\u{1F604}')
    })
  })

  // -------------------------------------------------------------------------
  // Block text helpers
  // -------------------------------------------------------------------------
  describe('getBlockText', () => {
    it('returns text from a single text segment', () => {
      const block = createBlock('paragraph', [createTextSegment('Hello')])
      expect(getBlockText(block)).toBe('Hello')
    })

    it('concatenates multiple text segments', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello '),
        createTextSegment('World'),
      ])
      expect(getBlockText(block)).toBe('Hello World')
    })

    it('includes mention labels', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hey '),
        createMentionSegment('u1', '@alice'),
        createTextSegment('!'),
      ])
      expect(getBlockText(block)).toBe('Hey @alice!')
    })

    it('includes emoji unicode', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Nice '),
        createEmojiSegment(':fire:', '\u{1F525}'),
      ])
      expect(getBlockText(block)).toBe('Nice \u{1F525}')
    })

    it('returns empty string for empty block', () => {
      const block = createBlock()
      expect(getBlockText(block)).toBe('')
    })
  })

  describe('getBlockTextLength', () => {
    it('returns length of text content', () => {
      const block = createBlock('paragraph', [createTextSegment('Hello')])
      expect(getBlockTextLength(block)).toBe(5)
    })

    it('returns 0 for empty block', () => {
      const block = createBlock()
      expect(getBlockTextLength(block)).toBe(0)
    })

    it('counts mention label length', () => {
      const block = createBlock('paragraph', [createMentionSegment('u1', '@alice')])
      expect(getBlockTextLength(block)).toBe(6) // "@alice"
    })

    it('counts emoji unicode length', () => {
      const block = createBlock('paragraph', [createEmojiSegment(':fire:', '\u{1F525}')])
      expect(getBlockTextLength(block)).toBe('\u{1F525}'.length)
    })
  })

  // -------------------------------------------------------------------------
  // Finding blocks
  // -------------------------------------------------------------------------
  describe('findBlockById', () => {
    it('finds a block by id', () => {
      const block = createBlock('paragraph', [createTextSegment('Found me')])
      const doc = createDocument([block])
      expect(findBlockById(doc, block.id)).toBe(block)
    })

    it('returns undefined for non-existent id', () => {
      const doc = createDocument()
      expect(findBlockById(doc, 'nonexistent')).toBeUndefined()
    })

    it('finds nested children', () => {
      const child = createBlock('list-item', [createTextSegment('Child')])
      const parent = createBlock('list-item', [createTextSegment('Parent')])
      parent.children = [child]
      const doc = createDocument([parent])
      expect(findBlockById(doc, child.id)).toBe(child)
    })
  })

  describe('findBlockIndex', () => {
    it('returns the index of a block', () => {
      const b1 = createBlock()
      const b2 = createBlock()
      const doc = createDocument([b1, b2])
      expect(findBlockIndex(doc, b2.id)).toBe(1)
    })

    it('returns -1 for non-existent block', () => {
      const doc = createDocument()
      expect(findBlockIndex(doc, 'nonexistent')).toBe(-1)
    })
  })

  // -------------------------------------------------------------------------
  // Cloning
  // -------------------------------------------------------------------------
  describe('cloneDocument', () => {
    it('creates a deep copy', () => {
      const doc = createDocument([createBlock('paragraph', [createTextSegment('Hello')])])
      const clone = cloneDocument(doc)
      expect(clone).toEqual(doc)
      expect(clone).not.toBe(doc)
      expect(clone.blocks[0]).not.toBe(doc.blocks[0])
    })
  })

  describe('cloneBlock', () => {
    it('creates a deep copy of a block', () => {
      const block = createBlock('paragraph', [createTextSegment('Hello', [{ type: 'bold' }])])
      const clone = cloneBlock(block)
      expect(clone).toEqual(block)
      expect(clone).not.toBe(block)
    })
  })

  // -------------------------------------------------------------------------
  // Marks comparison
  // -------------------------------------------------------------------------
  describe('marksEqual', () => {
    it('returns true for identical marks', () => {
      const a: Mark[] = [{ type: 'bold' }]
      const b: Mark[] = [{ type: 'bold' }]
      expect(marksEqual(a, b)).toBe(true)
    })

    it('returns false for different marks', () => {
      const a: Mark[] = [{ type: 'bold' }]
      const b: Mark[] = [{ type: 'italic' }]
      expect(marksEqual(a, b)).toBe(false)
    })

    it('returns false for different lengths', () => {
      const a: Mark[] = [{ type: 'bold' }, { type: 'italic' }]
      const b: Mark[] = [{ type: 'bold' }]
      expect(marksEqual(a, b)).toBe(false)
    })

    it('returns true for empty arrays', () => {
      expect(marksEqual([], [])).toBe(true)
    })

    it('is order-insensitive', () => {
      const a: Mark[] = [{ type: 'bold' }, { type: 'italic' }]
      const b: Mark[] = [{ type: 'italic' }, { type: 'bold' }]
      expect(marksEqual(a, b)).toBe(true)
    })

    it('compares attrs for link marks', () => {
      const a: Mark[] = [{ type: 'link', attrs: { href: 'a.com' } }]
      const b: Mark[] = [{ type: 'link', attrs: { href: 'b.com' } }]
      expect(marksEqual(a, b)).toBe(false)
    })

    it('treats link marks with same href as equal', () => {
      const a: Mark[] = [{ type: 'link', attrs: { href: 'a.com' } }]
      const b: Mark[] = [{ type: 'link', attrs: { href: 'a.com' } }]
      expect(marksEqual(a, b)).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // Content normalization
  // -------------------------------------------------------------------------
  describe('normalizeContent', () => {
    it('merges adjacent text segments with same marks', () => {
      const content: InlineContent[] = [
        createTextSegment('Hello '),
        createTextSegment('World'),
      ]
      const result = normalizeContent(content)
      expect(result).toHaveLength(1)
      expect((result[0] as any).text).toBe('Hello World')
    })

    it('does not merge text segments with different marks', () => {
      const content: InlineContent[] = [
        createTextSegment('Hello ', [{ type: 'bold' }]),
        createTextSegment('World'),
      ]
      const result = normalizeContent(content)
      expect(result).toHaveLength(2)
    })

    it('removes empty text segments when there are others', () => {
      const content: InlineContent[] = [
        createTextSegment(''),
        createTextSegment('Hello'),
      ]
      const result = normalizeContent(content)
      expect(result).toHaveLength(1)
      expect((result[0] as any).text).toBe('Hello')
    })

    it('keeps single empty text segment', () => {
      const content: InlineContent[] = []
      const result = normalizeContent(content)
      expect(result).toHaveLength(1)
      expect((result[0] as any).text).toBe('')
    })

    it('preserves mention segments', () => {
      const content: InlineContent[] = [
        createTextSegment('Hi '),
        createMentionSegment('u1', '@alice'),
        createTextSegment(' there'),
      ]
      const result = normalizeContent(content)
      expect(result).toHaveLength(3)
      expect(result[1].type).toBe('mention')
    })

    it('preserves emoji segments', () => {
      const content: InlineContent[] = [
        createTextSegment('Hi '),
        createEmojiSegment(':fire:', '\u{1F525}'),
      ]
      const result = normalizeContent(content)
      expect(result).toHaveLength(2)
      expect(result[1].type).toBe('emoji')
    })
  })

  // -------------------------------------------------------------------------
  // Block ID generation
  // -------------------------------------------------------------------------
  describe('generateBlockId', () => {
    it('generates sequential IDs', () => {
      const id1 = generateBlockId()
      const id2 = generateBlockId()
      expect(id1).toBe('block-1')
      expect(id2).toBe('block-2')
    })

    it('resets counter', () => {
      generateBlockId()
      resetBlockIdCounter()
      const id = generateBlockId()
      expect(id).toBe('block-1')
    })
  })

  // -------------------------------------------------------------------------
  // Block types
  // -------------------------------------------------------------------------
  describe('block types', () => {
    const types: Array<{ type: any; name: string }> = [
      { type: 'paragraph', name: 'paragraph' },
      { type: 'heading', name: 'heading' },
      { type: 'blockquote', name: 'blockquote' },
      { type: 'code-block', name: 'code-block' },
      { type: 'list-item', name: 'list-item' },
      { type: 'divider', name: 'divider' },
      { type: 'image', name: 'image' },
    ]

    types.forEach(({ type, name }) => {
      it(`creates a ${name} block`, () => {
        const block = createBlock(type)
        expect(block.type).toBe(type)
      })
    })
  })

  // -------------------------------------------------------------------------
  // Nested blocks
  // -------------------------------------------------------------------------
  describe('nested blocks', () => {
    it('supports children array on blocks', () => {
      const child1 = createBlock('list-item', [createTextSegment('Child 1')])
      const child2 = createBlock('list-item', [createTextSegment('Child 2')])
      const parent = createBlock('list-item', [createTextSegment('Parent')])
      parent.children = [child1, child2]

      expect(parent.children).toHaveLength(2)
      expect(getBlockText(parent.children![0])).toBe('Child 1')
    })

    it('allows indent on blocks', () => {
      const block = createBlock('list-item', [createTextSegment('Indented')])
      block.indent = 2
      expect(block.indent).toBe(2)
    })
  })
})
