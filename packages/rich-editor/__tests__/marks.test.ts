import { describe, it, expect, beforeEach } from 'vitest'
import {
  toggleMark,
  addMark,
  removeMark,
  getActiveMarks,
} from '../src/operations.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  resetBlockIdCounter,
  getBlockText,
} from '../src/model.js'
import {
  createCollapsedSelection,
  createSelection,
  createPosition,
} from '../src/selection.js'
import type { Document, Block, Mark, MarkType } from '../src/model.js'

let b1: Block
let doc: Document

beforeEach(() => {
  resetBlockIdCounter()
  b1 = createBlock('paragraph', [createTextSegment('Hello World')])
  doc = createDocument([b1])
})

describe('marks', () => {
  // =========================================================================
  // getActiveMarks
  // =========================================================================
  describe('getActiveMarks', () => {
    it('returns empty marks for plain text', () => {
      const sel = createCollapsedSelection(b1.id, 3)
      expect(getActiveMarks(doc, sel)).toEqual([])
    })

    it('returns marks at cursor position', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello ', [{ type: 'bold' }]),
        createTextSegment('World'),
      ])
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 3)
      const marks = getActiveMarks(d, sel)
      expect(marks).toHaveLength(1)
      expect(marks[0].type).toBe('bold')
    })

    it('returns marks for cursor at start of formatted text (uses previous char)', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }]),
        createTextSegment(' World'),
      ])
      const d = createDocument([block])
      // At offset 5, previous char is still in bold segment
      const sel = createCollapsedSelection(block.id, 5)
      const marks = getActiveMarks(d, sel)
      expect(marks.some((m) => m.type === 'bold')).toBe(true)
    })

    it('returns marks at offset 0', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'italic' }]),
      ])
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)
      const marks = getActiveMarks(d, sel)
      expect(marks.some((m) => m.type === 'italic')).toBe(true)
    })

    it('returns intersection of marks for range selection', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Bold and Italic', [{ type: 'bold' }, { type: 'italic' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 15),
      )
      const marks = getActiveMarks(d, sel)
      expect(marks.some((m) => m.type === 'bold')).toBe(true)
      expect(marks.some((m) => m.type === 'italic')).toBe(true)
    })

    it('returns common marks for partially formatted selection', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }]),
        createTextSegment(' World'),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 11),
      )
      const marks = getActiveMarks(d, sel)
      // Bold is not common to all segments
      expect(marks.some((m) => m.type === 'bold')).toBe(false)
    })

    it('returns empty for nonexistent block', () => {
      const sel = createCollapsedSelection('nonexistent', 0)
      expect(getActiveMarks(doc, sel)).toEqual([])
    })
  })

  // =========================================================================
  // toggleMark
  // =========================================================================
  describe('toggleMark', () => {
    it('applies bold to unformatted selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = toggleMark(doc, sel, 'bold')
      const content = result.doc.blocks[0].content
      // The first segment should have bold
      expect(content[0].type).toBe('text')
      if (content[0].type === 'text') {
        expect(content[0].marks.some((m) => m.type === 'bold')).toBe(true)
        expect(content[0].text).toBe('Hello')
      }
    })

    it('removes bold from fully bold selection', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello World', [{ type: 'bold' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 11),
      )
      const result = toggleMark(d, sel, 'bold')
      if (result.doc.blocks[0].content[0].type === 'text') {
        expect(result.doc.blocks[0].content[0].marks).toEqual([])
      }
    })

    it('applies italic to selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b1.id, 11),
      )
      const result = toggleMark(doc, sel, 'italic')
      // Check "World" is italic
      const content = result.doc.blocks[0].content
      const worldSeg = content.find(
        (s) => s.type === 'text' && s.text.includes('World'),
      )
      expect(worldSeg?.type).toBe('text')
      if (worldSeg?.type === 'text') {
        expect(worldSeg.marks.some((m) => m.type === 'italic')).toBe(true)
      }
    })

    it('applies strikethrough', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = toggleMark(doc, sel, 'strikethrough')
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'strikethrough')).toBe(true)
      }
    })

    it('applies code mark', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = toggleMark(doc, sel, 'code')
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'code')).toBe(true)
      }
    })

    it('applies underline mark', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = toggleMark(doc, sel, 'underline')
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'underline')).toBe(true)
      }
    })

    it('does nothing for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = toggleMark(doc, sel, 'bold')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
    })

    it('toggles off bold when applied twice', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const r1 = toggleMark(doc, sel, 'bold')
      const r2 = toggleMark(r1.doc, sel, 'bold')
      const first = r2.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'bold')).toBe(false)
      }
    })

    it('can have multiple marks on same text', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const r1 = toggleMark(doc, sel, 'bold')
      const r2 = toggleMark(r1.doc, sel, 'italic')
      const first = r2.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'bold')).toBe(true)
        expect(first.marks.some((m) => m.type === 'italic')).toBe(true)
      }
    })
  })

  // =========================================================================
  // addMark
  // =========================================================================
  describe('addMark', () => {
    it('adds a mark to a selection range', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = addMark(doc, sel, { type: 'bold' })
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('adds a link mark with attrs', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = addMark(doc, sel, { type: 'link', attrs: { href: 'https://example.com' } })
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        const linkMark = first.marks.find((m) => m.type === 'link')
        expect(linkMark?.attrs?.href).toBe('https://example.com')
      }
    })

    it('does nothing for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 3)
      const result = addMark(doc, sel, { type: 'bold' })
      expect(result.doc.blocks[0].content).toEqual(doc.blocks[0].content)
    })

    it('adds mark to partial segment', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const result = addMark(doc, sel, { type: 'bold' })
      // Should split into: "He" (plain), "llo Wo" (bold), "rld" (plain)
      const content = result.doc.blocks[0].content
      expect(content.length).toBeGreaterThanOrEqual(2)
    })

    it('does not duplicate existing mark', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 5),
      )
      const result = addMark(d, sel, { type: 'bold' })
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        const boldCount = first.marks.filter((m) => m.type === 'bold').length
        expect(boldCount).toBe(1)
      }
    })

    it('adds mark across multiple blocks', () => {
      const b2 = createBlock('paragraph', [createTextSegment('Second')])
      const d = createDocument([b1, b2])
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b2.id, 6),
      )
      const result = addMark(d, sel, { type: 'italic' })
      // Both blocks should have italic applied in the range
      const block1Content = result.doc.blocks[0].content
      const block2Content = result.doc.blocks[1].content
      const hasItalicB1 = block1Content.some(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'italic'),
      )
      const hasItalicB2 = block2Content.some(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'italic'),
      )
      expect(hasItalicB1).toBe(true)
      expect(hasItalicB2).toBe(true)
    })
  })

  // =========================================================================
  // removeMark
  // =========================================================================
  describe('removeMark', () => {
    it('removes a mark from fully marked text', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello World', [{ type: 'bold' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 11),
      )
      const result = removeMark(d, sel, 'bold')
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks).toEqual([])
      }
    })

    it('removes mark from partial range', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello World', [{ type: 'bold' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 5),
      )
      const result = removeMark(d, sel, 'bold')
      const content = result.doc.blocks[0].content
      // "Hello" should be plain, " World" should still be bold
      const helloPart = content.find((s) => s.type === 'text' && s.text.includes('Hello'))
      const worldPart = content.find((s) => s.type === 'text' && s.text.includes('World'))
      if (helloPart?.type === 'text') {
        expect(helloPart.marks.some((m) => m.type === 'bold')).toBe(false)
      }
      if (worldPart?.type === 'text') {
        expect(worldPart.marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('does nothing for collapsed selection', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }]),
      ])
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 3)
      const result = removeMark(d, sel, 'bold')
      if (result.doc.blocks[0].content[0].type === 'text') {
        expect(result.doc.blocks[0].content[0].marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('removes only specified mark, keeps others', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }, { type: 'italic' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 5),
      )
      const result = removeMark(d, sel, 'bold')
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'bold')).toBe(false)
        expect(first.marks.some((m) => m.type === 'italic')).toBe(true)
      }
    })

    it('removes mark across blocks', () => {
      const block1 = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }]),
      ])
      const block2 = createBlock('paragraph', [
        createTextSegment('World', [{ type: 'bold' }]),
      ])
      const d = createDocument([block1, block2])
      const sel = createSelection(
        createPosition(block1.id, 0),
        createPosition(block2.id, 5),
      )
      const result = removeMark(d, sel, 'bold')
      for (const block of result.doc.blocks) {
        for (const seg of block.content) {
          if (seg.type === 'text') {
            expect(seg.marks.some((m) => m.type === 'bold')).toBe(false)
          }
        }
      }
    })
  })

  // =========================================================================
  // Overlapping marks and edge cases
  // =========================================================================
  describe('overlapping marks', () => {
    it('handles bold within italic text', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'italic' }]),
        createTextSegment(' World', [{ type: 'italic' }]),
      ])
      const d = createDocument([block])
      // Apply bold to "llo W" (offset 2 to 7)
      const sel = createSelection(
        createPosition(block.id, 2),
        createPosition(block.id, 7),
      )
      const result = addMark(d, sel, { type: 'bold' })
      const content = result.doc.blocks[0].content
      // Find segment with both marks
      const bothMarks = content.find(
        (s) =>
          s.type === 'text' &&
          s.marks.some((m) => m.type === 'bold') &&
          s.marks.some((m) => m.type === 'italic'),
      )
      expect(bothMarks).toBeDefined()
    })

    it('split marks at exact boundaries', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = addMark(doc, sel, { type: 'bold' })
      const content = result.doc.blocks[0].content
      // Should have "Hello" (bold) and " World" (plain)
      expect(content.length).toBeGreaterThanOrEqual(2)
      if (content[0].type === 'text') {
        expect(content[0].text).toBe('Hello')
        expect(content[0].marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('handles mark on single character', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 1),
      )
      const result = addMark(doc, sel, { type: 'bold' })
      const content = result.doc.blocks[0].content
      const firstChar = content[0]
      if (firstChar.type === 'text') {
        expect(firstChar.text).toBe('H')
        expect(firstChar.marks.some((m) => m.type === 'bold')).toBe(true)
      }
    })

    it('applies link mark with href', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b1.id, 11),
      )
      const result = addMark(doc, sel, {
        type: 'link',
        attrs: { href: 'https://example.com' },
      })
      const content = result.doc.blocks[0].content
      const linkSeg = content.find(
        (s) => s.type === 'text' && s.marks.some((m) => m.type === 'link'),
      )
      expect(linkSeg).toBeDefined()
      if (linkSeg?.type === 'text') {
        const linkMark = linkSeg.marks.find((m) => m.type === 'link')
        expect(linkMark?.attrs?.href).toBe('https://example.com')
      }
    })

    it('remove link leaves text intact', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Click here', [{ type: 'link', attrs: { href: 'https://example.com' } }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 10),
      )
      const result = removeMark(d, sel, 'link')
      expect(getBlockText(result.doc.blocks[0])).toBe('Click here')
      if (result.doc.blocks[0].content[0].type === 'text') {
        expect(result.doc.blocks[0].content[0].marks).toEqual([])
      }
    })
  })

  // =========================================================================
  // All mark types
  // =========================================================================
  describe('all mark types', () => {
    const markTypes: MarkType[] = ['bold', 'italic', 'strikethrough', 'code', 'underline']

    markTypes.forEach((markType) => {
      it(`toggles ${markType} on and off`, () => {
        const sel = createSelection(
          createPosition(b1.id, 0),
          createPosition(b1.id, 5),
        )
        // Toggle on
        const r1 = toggleMark(doc, sel, markType)
        const marks1 = r1.doc.blocks[0].content[0]
        if (marks1.type === 'text') {
          expect(marks1.marks.some((m) => m.type === markType)).toBe(true)
        }

        // Toggle off
        const r2 = toggleMark(r1.doc, sel, markType)
        const marks2 = r2.doc.blocks[0].content[0]
        if (marks2.type === 'text') {
          expect(marks2.marks.some((m) => m.type === markType)).toBe(false)
        }
      })
    })

    markTypes.forEach((markType) => {
      it(`addMark ${markType} on middle of text`, () => {
        const sel = createSelection(
          createPosition(b1.id, 3),
          createPosition(b1.id, 8),
        )
        const result = addMark(doc, sel, { type: markType })
        const content = result.doc.blocks[0].content
        // Should have segments before, marked, and after
        expect(content.length).toBeGreaterThanOrEqual(2)
      })
    })

    markTypes.forEach((markType) => {
      it(`removeMark ${markType} does not affect text content`, () => {
        const block = createBlock('paragraph', [
          createTextSegment('Hello World', [{ type: markType }]),
        ])
        const d = createDocument([block])
        const sel = createSelection(
          createPosition(block.id, 0),
          createPosition(block.id, 11),
        )
        const result = removeMark(d, sel, markType)
        expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
      })
    })
  })

  // =========================================================================
  // Edge cases for marks
  // =========================================================================
  describe('mark edge cases', () => {
    it('addMark to entire block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 11),
      )
      const result = addMark(doc, sel, { type: 'bold' })
      const content = result.doc.blocks[0].content
      // All text should be bold
      for (const seg of content) {
        if (seg.type === 'text' && seg.text.length > 0) {
          expect(seg.marks.some((m) => m.type === 'bold')).toBe(true)
        }
      }
    })

    it('addMark twice does not duplicate', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const r1 = addMark(doc, sel, { type: 'bold' })
      const r2 = addMark(r1.doc, sel, { type: 'bold' })
      const first = r2.doc.blocks[0].content[0]
      if (first.type === 'text') {
        const boldCount = first.marks.filter((m) => m.type === 'bold').length
        expect(boldCount).toBe(1)
      }
    })

    it('toggleMark link with attrs', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = toggleMark(doc, sel, 'link', { href: 'http://test.com' })
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        const link = first.marks.find((m) => m.type === 'link')
        expect(link).toBeDefined()
      }
    })

    it('getActiveMarks returns multiple marks when text has them', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }]),
      ])
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 3)
      const marks = getActiveMarks(d, sel)
      expect(marks).toHaveLength(3)
    })

    it('getActiveMarks at boundary between different marks', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Bold', [{ type: 'bold' }]),
        createTextSegment('Italic', [{ type: 'italic' }]),
      ])
      const d = createDocument([block])
      // At offset 4 (boundary), should use previous char which is bold
      const sel = createCollapsedSelection(block.id, 4)
      const marks = getActiveMarks(d, sel)
      expect(marks.some((m) => m.type === 'bold')).toBe(true)
    })

    it('removeMark on text without that mark is a no-op', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = removeMark(doc, sel, 'bold')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
    })

    it('addMark preserves other existing marks', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hello', [{ type: 'italic' }]),
      ])
      const d = createDocument([block])
      const sel = createSelection(
        createPosition(block.id, 0),
        createPosition(block.id, 5),
      )
      const result = addMark(d, sel, { type: 'bold' })
      const first = result.doc.blocks[0].content[0]
      if (first.type === 'text') {
        expect(first.marks.some((m) => m.type === 'bold')).toBe(true)
        expect(first.marks.some((m) => m.type === 'italic')).toBe(true)
      }
    })
  })
})
