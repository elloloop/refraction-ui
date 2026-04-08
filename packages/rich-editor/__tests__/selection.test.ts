import { describe, it, expect, beforeEach } from 'vitest'
import {
  createPosition,
  createSelection,
  createCollapsedSelection,
  isCollapsed,
  isForward,
  getSelectionStart,
  getSelectionEnd,
  getSelectedText,
  getSelectedBlocks,
  clampSelection,
  selectionAtDocStart,
  selectionAtDocEnd,
  selectAll,
} from '../src/selection.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  createMentionSegment,
  createEmojiSegment,
  resetBlockIdCounter,
} from '../src/model.js'
import type { Document, Block } from '../src/model.js'

let b1: Block, b2: Block, b3: Block
let doc: Document

beforeEach(() => {
  resetBlockIdCounter()
  b1 = createBlock('paragraph', [createTextSegment('Hello World')])
  b2 = createBlock('paragraph', [createTextSegment('Second block')])
  b3 = createBlock('paragraph', [createTextSegment('Third block')])
  doc = createDocument([b1, b2, b3])
})

describe('selection', () => {
  // -------------------------------------------------------------------------
  // Creation
  // -------------------------------------------------------------------------
  describe('createPosition', () => {
    it('creates a position', () => {
      const pos = createPosition('block-1', 5)
      expect(pos.blockId).toBe('block-1')
      expect(pos.offset).toBe(5)
    })
  })

  describe('createSelection', () => {
    it('creates a selection with anchor and focus', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      expect(sel.anchor.blockId).toBe(b1.id)
      expect(sel.focus.offset).toBe(5)
    })
  })

  describe('createCollapsedSelection', () => {
    it('creates a collapsed selection (cursor)', () => {
      const sel = createCollapsedSelection(b1.id, 3)
      expect(sel.anchor.blockId).toBe(b1.id)
      expect(sel.anchor.offset).toBe(3)
      expect(sel.focus.blockId).toBe(b1.id)
      expect(sel.focus.offset).toBe(3)
    })
  })

  // -------------------------------------------------------------------------
  // isCollapsed
  // -------------------------------------------------------------------------
  describe('isCollapsed', () => {
    it('returns true for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      expect(isCollapsed(sel)).toBe(true)
    })

    it('returns false for expanded selection in same block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      expect(isCollapsed(sel)).toBe(false)
    })

    it('returns false for cross-block selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b2.id, 0),
      )
      expect(isCollapsed(sel)).toBe(false)
    })

    it('returns true when anchor and focus are the same position', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b1.id, 5),
      )
      expect(isCollapsed(sel)).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // isForward
  // -------------------------------------------------------------------------
  describe('isForward', () => {
    it('returns true when anchor is before focus in same block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      expect(isForward(doc, sel)).toBe(true)
    })

    it('returns false when anchor is after focus in same block', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b1.id, 0),
      )
      expect(isForward(doc, sel)).toBe(false)
    })

    it('returns true when anchor block comes before focus block', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b2.id, 3),
      )
      expect(isForward(doc, sel)).toBe(true)
    })

    it('returns false when anchor block comes after focus block', () => {
      const sel = createSelection(
        createPosition(b2.id, 3),
        createPosition(b1.id, 5),
      )
      expect(isForward(doc, sel)).toBe(false)
    })

    it('returns true for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 3)
      expect(isForward(doc, sel)).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // getSelectionStart / getSelectionEnd
  // -------------------------------------------------------------------------
  describe('getSelectionStart', () => {
    it('returns anchor for forward selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const start = getSelectionStart(doc, sel)
      expect(start.offset).toBe(2)
    })

    it('returns focus for backward selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 8),
        createPosition(b1.id, 2),
      )
      const start = getSelectionStart(doc, sel)
      expect(start.offset).toBe(2)
    })
  })

  describe('getSelectionEnd', () => {
    it('returns focus for forward selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const end = getSelectionEnd(doc, sel)
      expect(end.offset).toBe(8)
    })

    it('returns anchor for backward selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 8),
        createPosition(b1.id, 2),
      )
      const end = getSelectionEnd(doc, sel)
      expect(end.offset).toBe(8)
    })
  })

  // -------------------------------------------------------------------------
  // getSelectedText
  // -------------------------------------------------------------------------
  describe('getSelectedText', () => {
    it('returns empty string for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      expect(getSelectedText(doc, sel)).toBe('')
    })

    it('returns selected text within a single block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      expect(getSelectedText(doc, sel)).toBe('Hello')
    })

    it('returns selected text in the middle of a block', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b1.id, 11),
      )
      expect(getSelectedText(doc, sel)).toBe('World')
    })

    it('returns text across multiple blocks', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b2.id, 6),
      )
      expect(getSelectedText(doc, sel)).toBe('World\nSecond')
    })

    it('returns text across all three blocks', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b3.id, 5),
      )
      expect(getSelectedText(doc, sel)).toBe('World\nSecond block\nThird')
    })

    it('returns empty string when block not found', () => {
      const sel = createSelection(
        createPosition('nonexistent', 0),
        createPosition('nonexistent', 5),
      )
      expect(getSelectedText(doc, sel)).toBe('')
    })

    it('works with backward selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b1.id, 0),
      )
      expect(getSelectedText(doc, sel)).toBe('Hello')
    })

    it('handles block with mentions', () => {
      const mentionBlock = createBlock('paragraph', [
        createTextSegment('Hi '),
        createMentionSegment('u1', '@alice'),
        createTextSegment(' there'),
      ])
      const mentionDoc = createDocument([mentionBlock])
      const sel = createSelection(
        createPosition(mentionBlock.id, 0),
        createPosition(mentionBlock.id, 15),
      )
      expect(getSelectedText(mentionDoc, sel)).toBe('Hi @alice there')
    })

    it('handles block with emojis', () => {
      const emojiBlock = createBlock('paragraph', [
        createTextSegment('Nice '),
        createEmojiSegment(':fire:', '\u{1F525}'),
      ])
      const emojiDoc = createDocument([emojiBlock])
      const sel = createSelection(
        createPosition(emojiBlock.id, 0),
        createPosition(emojiBlock.id, 5 + '\u{1F525}'.length),
      )
      expect(getSelectedText(emojiDoc, sel)).toBe('Nice \u{1F525}')
    })
  })

  // -------------------------------------------------------------------------
  // getSelectedBlocks
  // -------------------------------------------------------------------------
  describe('getSelectedBlocks', () => {
    it('returns single block for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 3)
      const blocks = getSelectedBlocks(doc, sel)
      expect(blocks).toHaveLength(1)
      expect(blocks[0].id).toBe(b1.id)
    })

    it('returns single block for selection within one block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const blocks = getSelectedBlocks(doc, sel)
      expect(blocks).toHaveLength(1)
    })

    it('returns multiple blocks for cross-block selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b3.id, 3),
      )
      const blocks = getSelectedBlocks(doc, sel)
      expect(blocks).toHaveLength(3)
    })

    it('returns two blocks for adjacent block selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b2.id, 3),
      )
      const blocks = getSelectedBlocks(doc, sel)
      expect(blocks).toHaveLength(2)
    })

    it('returns empty array for nonexistent block', () => {
      const sel = createCollapsedSelection('nonexistent', 0)
      const blocks = getSelectedBlocks(doc, sel)
      expect(blocks).toHaveLength(0)
    })

    it('works with backward selection', () => {
      const sel = createSelection(
        createPosition(b2.id, 3),
        createPosition(b1.id, 5),
      )
      const blocks = getSelectedBlocks(doc, sel)
      expect(blocks).toHaveLength(2)
    })
  })

  // -------------------------------------------------------------------------
  // clampSelection
  // -------------------------------------------------------------------------
  describe('clampSelection', () => {
    it('clamps offset to block length', () => {
      const sel = createCollapsedSelection(b1.id, 999)
      const clamped = clampSelection(doc, sel)
      expect(clamped.anchor.offset).toBe(11) // "Hello World".length
    })

    it('clamps negative offset to 0', () => {
      const sel = createCollapsedSelection(b1.id, -5)
      const clamped = clampSelection(doc, sel)
      expect(clamped.anchor.offset).toBe(0)
    })

    it('falls back to first block for nonexistent blockId', () => {
      const sel = createCollapsedSelection('nonexistent', 5)
      const clamped = clampSelection(doc, sel)
      expect(clamped.anchor.blockId).toBe(b1.id)
      expect(clamped.anchor.offset).toBe(0)
    })

    it('preserves valid selection', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const clamped = clampSelection(doc, sel)
      expect(clamped.anchor.blockId).toBe(b1.id)
      expect(clamped.anchor.offset).toBe(5)
    })
  })

  // -------------------------------------------------------------------------
  // Document-level selections
  // -------------------------------------------------------------------------
  describe('selectionAtDocStart', () => {
    it('creates selection at start of document', () => {
      const sel = selectionAtDocStart(doc)
      expect(sel.anchor.blockId).toBe(b1.id)
      expect(sel.anchor.offset).toBe(0)
      expect(isCollapsed(sel)).toBe(true)
    })
  })

  describe('selectionAtDocEnd', () => {
    it('creates selection at end of document', () => {
      const sel = selectionAtDocEnd(doc)
      expect(sel.anchor.blockId).toBe(b3.id)
      expect(sel.anchor.offset).toBe(11) // "Third block".length
      expect(isCollapsed(sel)).toBe(true)
    })
  })

  describe('selectAll', () => {
    it('selects the entire document', () => {
      const sel = selectAll(doc)
      expect(sel.anchor.blockId).toBe(b1.id)
      expect(sel.anchor.offset).toBe(0)
      expect(sel.focus.blockId).toBe(b3.id)
      expect(sel.focus.offset).toBe(11)
      expect(isCollapsed(sel)).toBe(false)
    })

    it('for single-block doc, selects from start to end', () => {
      const singleDoc = createDocument([createBlock('paragraph', [createTextSegment('Test')])])
      const sel = selectAll(singleDoc)
      expect(sel.anchor.offset).toBe(0)
      expect(sel.focus.offset).toBe(4)
    })
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles empty document selection', () => {
      const emptyDoc = createDocument()
      const sel = selectionAtDocStart(emptyDoc)
      expect(sel.anchor.offset).toBe(0)
      expect(isCollapsed(sel)).toBe(true)
    })

    it('handles selection at exact block boundary', () => {
      const sel = createCollapsedSelection(b1.id, 11) // end of "Hello World"
      expect(isCollapsed(sel)).toBe(true)
    })

    it('handles selection spanning empty blocks', () => {
      const empty = createBlock('paragraph', [createTextSegment('')])
      const testDoc = createDocument([b1, empty, b3])
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b3.id, 5),
      )
      const text = getSelectedText(testDoc, sel)
      expect(text).toBe('World\n\nThird')
    })

    it('handles cross-block selection with backward direction', () => {
      const sel = createSelection(
        createPosition(b3.id, 5),
        createPosition(b1.id, 6),
      )
      const start = getSelectionStart(doc, sel)
      const end = getSelectionEnd(doc, sel)
      expect(start.blockId).toBe(b1.id)
      expect(end.blockId).toBe(b3.id)
    })
  })
})
