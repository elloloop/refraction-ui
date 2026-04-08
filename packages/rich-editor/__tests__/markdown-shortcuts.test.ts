import { describe, it, expect, beforeEach } from 'vitest'
import { processMarkdownShortcut } from '../src/markdown-shortcuts.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  resetBlockIdCounter,
  getBlockText,
} from '../src/model.js'
import { createCollapsedSelection, createSelection, createPosition } from '../src/selection.js'
import type { Document, Block } from '../src/model.js'
import { insertText } from '../src/operations.js'

function setupBlock(text: string): { doc: Document; block: Block } {
  const block = createBlock('paragraph', [createTextSegment(text)])
  const doc = createDocument([block])
  return { doc, block }
}

/** Simulate typing a string character by character, processing shortcuts. */
function typeString(text: string): { doc: Document; block: Block } {
  let block = createBlock('paragraph', [createTextSegment('')])
  let doc = createDocument([block])
  let offset = 0

  for (const char of text) {
    const sel = createCollapsedSelection(block.id, offset)
    const result = processMarkdownShortcut(doc, sel, char)
    if (result.consumed) {
      doc = result.doc
      block = doc.blocks.find((b) => b.id === block.id) ?? doc.blocks[0]
      offset = result.sel.anchor.offset
    } else {
      // Just insert the character
      const insertResult = insertText(doc, sel, char)
      doc = insertResult.doc
      block = doc.blocks.find((b) => b.id === block.id) ?? doc.blocks[0]
      offset = insertResult.selection.anchor.offset
    }
  }

  return { doc, block }
}

beforeEach(() => {
  resetBlockIdCounter()
})

describe('markdown-shortcuts', () => {
  // =========================================================================
  // Block shortcuts
  // =========================================================================
  describe('heading shortcuts', () => {
    it('converts "# " to heading 1', () => {
      const { doc, block } = setupBlock('#')
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('heading')
      expect(result.doc.blocks[0].meta?.level).toBe(1)
    })

    it('converts "## " to heading 2', () => {
      const { doc, block } = setupBlock('##')
      const sel = createCollapsedSelection(block.id, 2)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].meta?.level).toBe(2)
    })

    it('converts "### " to heading 3', () => {
      const { doc, block } = setupBlock('###')
      const sel = createCollapsedSelection(block.id, 3)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].meta?.level).toBe(3)
    })

    it('clears the shortcut text from the block', () => {
      const { doc, block } = setupBlock('#')
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(getBlockText(result.doc.blocks[0])).toBe('')
    })
  })

  describe('list shortcuts', () => {
    it('converts "- " to bullet list item', () => {
      const { doc, block } = setupBlock('-')
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('list-item')
      expect(result.doc.blocks[0].meta?.listType).toBe('bullet')
    })

    it('converts "* " to bullet list item', () => {
      const { doc, block } = setupBlock('*')
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('list-item')
    })

    it('converts "1. " to ordered list item', () => {
      const { doc, block } = setupBlock('1.')
      const sel = createCollapsedSelection(block.id, 2)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('list-item')
      expect(result.doc.blocks[0].meta?.listType).toBe('ordered')
    })
  })

  describe('blockquote shortcut', () => {
    it('converts "> " to blockquote', () => {
      const { doc, block } = setupBlock('>')
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('blockquote')
    })
  })

  describe('code block shortcut', () => {
    it('converts "```" to code block (on backtick)', () => {
      const { doc, block } = setupBlock('``')
      const sel = createCollapsedSelection(block.id, 2)
      const result = processMarkdownShortcut(doc, sel, '`')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('code-block')
    })
  })

  describe('divider shortcut', () => {
    it('converts "---" to divider (on dash)', () => {
      const { doc, block } = setupBlock('--')
      const sel = createCollapsedSelection(block.id, 2)
      const result = processMarkdownShortcut(doc, sel, '-')
      expect(result.consumed).toBe(true)
      expect(result.doc.blocks[0].type).toBe('divider')
    })
  })

  describe('block shortcuts only on paragraphs', () => {
    it('does not trigger on heading blocks', () => {
      const block = createBlock('heading', [createTextSegment('#')], { level: 1 })
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(false)
    })

    it('does not trigger on code blocks', () => {
      const block = createBlock('code-block', [createTextSegment('#')])
      const doc = createDocument([block])
      const sel = createCollapsedSelection(block.id, 1)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(false)
    })
  })

  // =========================================================================
  // Inline shortcuts
  // =========================================================================
  describe('bold shortcut (**text**)', () => {
    it('converts **text** to bold', () => {
      const { doc, block } = setupBlock('**hello*')
      const sel = createCollapsedSelection(block.id, 8)
      const result = processMarkdownShortcut(doc, sel, '*')
      expect(result.consumed).toBe(true)
      // Check that "hello" has a bold mark
      const content = result.doc.blocks[0].content
      const boldSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'bold'),
      )
      expect(boldSeg).toBeDefined()
      if (boldSeg?.type === 'text') {
        expect(boldSeg.text).toBe('hello')
      }
    })

    it('does not trigger for empty content **|**', () => {
      const { doc, block } = setupBlock('***')
      const sel = createCollapsedSelection(block.id, 3)
      const result = processMarkdownShortcut(doc, sel, '*')
      // ** followed by ** with nothing between — depends on implementation
      // The open marker ** is at index 0, close marker ** would end at 4
      // Content between is * which is 1 char, so it should match for italic within bold
      // Actually, "***" + "*" = "****" = **|** empty bold — let's verify
      // Actually looking at the code: "****" ends with "**" (close), before close is "**" (open)
      // Content between is empty string, so it should NOT match
      expect(result.consumed).toBe(false)
    })
  })

  describe('italic shortcut (*text*)', () => {
    it('converts *text* to italic', () => {
      const { doc, block } = setupBlock('*hello')
      const sel = createCollapsedSelection(block.id, 6)
      const result = processMarkdownShortcut(doc, sel, '*')
      expect(result.consumed).toBe(true)
      const content = result.doc.blocks[0].content
      const italicSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'italic'),
      )
      expect(italicSeg).toBeDefined()
    })

    it('does not trigger when preceded by another *', () => {
      // **text should not match the single * shortcut on the second *
      const { doc, block } = setupBlock('**hello')
      const sel = createCollapsedSelection(block.id, 7)
      const result = processMarkdownShortcut(doc, sel, '*')
      // This should match as italic for the second * pair, but
      // the * at index 1 is preceded by *, so single * shortcut skips it
      // However ** shortcut should look for the closing **
      // "**hello*" doesn't end with ** yet, so no match
      expect(result.consumed).toBe(false)
    })
  })

  describe('strikethrough shortcut (~~text~~)', () => {
    it('converts ~~text~~ to strikethrough', () => {
      const { doc, block } = setupBlock('~~hello~')
      const sel = createCollapsedSelection(block.id, 8)
      const result = processMarkdownShortcut(doc, sel, '~')
      expect(result.consumed).toBe(true)
      const content = result.doc.blocks[0].content
      const strikeSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'strikethrough'),
      )
      expect(strikeSeg).toBeDefined()
    })
  })

  describe('inline code shortcut (`text`)', () => {
    it('converts `text` to code', () => {
      const { doc, block } = setupBlock('`hello')
      const sel = createCollapsedSelection(block.id, 6)
      const result = processMarkdownShortcut(doc, sel, '`')
      expect(result.consumed).toBe(true)
      const content = result.doc.blocks[0].content
      const codeSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'code'),
      )
      expect(codeSeg).toBeDefined()
    })
  })

  describe('link shortcut [text](url)', () => {
    it('converts [text](url) to link', () => {
      const { doc, block } = setupBlock('[click here](https://example.com')
      const sel = createCollapsedSelection(block.id, 32)
      const result = processMarkdownShortcut(doc, sel, ')')
      expect(result.consumed).toBe(true)
      const content = result.doc.blocks[0].content
      const linkSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'link'),
      )
      expect(linkSeg).toBeDefined()
      if (linkSeg?.type === 'text') {
        expect(linkSeg.text).toBe('click here')
        const linkMark = linkSeg.marks.find((m) => m.type === 'link')
        expect(linkMark?.attrs?.href).toBe('https://example.com')
      }
    })

    it('does not trigger for ) without matching []()', () => {
      const { doc, block } = setupBlock('hello world')
      const sel = createCollapsedSelection(block.id, 11)
      const result = processMarkdownShortcut(doc, sel, ')')
      expect(result.consumed).toBe(false)
    })
  })

  // =========================================================================
  // No false triggers
  // =========================================================================
  describe('non-matching cases', () => {
    it('does not trigger for normal text input', () => {
      const { doc, block } = setupBlock('Hello')
      const sel = createCollapsedSelection(block.id, 5)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(false)
    })

    it('does not trigger for # in the middle of text', () => {
      const { doc, block } = setupBlock('Hello #')
      const sel = createCollapsedSelection(block.id, 7)
      // The "# " pattern requires it to be at the start of the block
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(false)
    })

    it('does not trigger with non-collapsed selection', () => {
      const { doc, block } = setupBlock('#')
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 1),
      )
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(false)
    })

    it('does not trigger bold for single *', () => {
      const { doc, block } = setupBlock('hello')
      const sel = createCollapsedSelection(block.id, 5)
      const result = processMarkdownShortcut(doc, sel, '*')
      expect(result.consumed).toBe(false)
    })

    it('partial markdown that does not complete does not trigger', () => {
      const { doc, block } = setupBlock('**hello')
      const sel = createCollapsedSelection(block.id, 7)
      const result = processMarkdownShortcut(doc, sel, ' ')
      expect(result.consumed).toBe(false)
    })
  })

  // =========================================================================
  // Inline shortcuts with text before
  // =========================================================================
  describe('inline shortcuts with preceding text', () => {
    it('handles bold with text before it', () => {
      const { doc, block } = setupBlock('prefix **bold*')
      const sel = createCollapsedSelection(block.id, 14)
      const result = processMarkdownShortcut(doc, sel, '*')
      expect(result.consumed).toBe(true)
      const content = result.doc.blocks[0].content
      const boldSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'bold'),
      )
      expect(boldSeg).toBeDefined()
      if (boldSeg?.type === 'text') {
        expect(boldSeg.text).toBe('bold')
      }
    })

    it('preserves text before the shortcut', () => {
      const { doc, block } = setupBlock('prefix *italic')
      const sel = createCollapsedSelection(block.id, 14)
      const result = processMarkdownShortcut(doc, sel, '*')
      expect(result.consumed).toBe(true)
      const text = getBlockText(result.doc.blocks[0])
      expect(text).toContain('prefix')
    })
  })

  // =========================================================================
  // Simulated typing
  // =========================================================================
  describe('simulated typing', () => {
    it('typing "# " converts to heading', () => {
      const result = typeString('# ')
      expect(result.doc.blocks[0].type).toBe('heading')
      expect(result.doc.blocks[0].meta?.level).toBe(1)
    })

    it('typing "- " converts to list', () => {
      const result = typeString('- ')
      expect(result.doc.blocks[0].type).toBe('list-item')
    })

    it('typing "> " converts to blockquote', () => {
      const result = typeString('> ')
      expect(result.doc.blocks[0].type).toBe('blockquote')
    })

    it('typing "---" converts to divider', () => {
      const result = typeString('---')
      expect(result.doc.blocks[0].type).toBe('divider')
    })

    it('typing "```" converts to code block', () => {
      const result = typeString('```')
      expect(result.doc.blocks[0].type).toBe('code-block')
    })
  })
})
