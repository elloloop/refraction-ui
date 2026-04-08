import { describe, it, expect, beforeEach } from 'vitest'
import {
  insertText,
  deleteBackward,
  deleteForward,
  deleteSelection,
  insertBlock,
  splitBlock,
  mergeBlockBackward,
  mergeBlockForward,
  changeBlockType,
  indentBlock,
  outdentBlock,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  moveToStartOfBlock,
  moveToEndOfBlock,
  moveToStartOfDocument,
  moveToEndOfDocument,
  expandSelectionWord,
  insertInlineContent,
} from '../src/operations.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  createMentionSegment,
  createEmojiSegment,
  resetBlockIdCounter,
  getBlockText,
  getBlockTextLength,
} from '../src/model.js'
import {
  createCollapsedSelection,
  createSelection,
  createPosition,
  isCollapsed,
} from '../src/selection.js'
import type { Document, Block } from '../src/model.js'
import type { Selection } from '../src/selection.js'

let b1: Block, b2: Block, b3: Block
let doc: Document

beforeEach(() => {
  resetBlockIdCounter()
  b1 = createBlock('paragraph', [createTextSegment('Hello World')])
  b2 = createBlock('paragraph', [createTextSegment('Second line')])
  b3 = createBlock('paragraph', [createTextSegment('Third line')])
  doc = createDocument([b1, b2, b3])
})

describe('operations', () => {
  // =========================================================================
  // insertText
  // =========================================================================
  describe('insertText', () => {
    it('inserts text at the beginning of a block', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertText(doc, sel, 'X')
      expect(getBlockText(result.doc.blocks[0])).toBe('XHello World')
      expect(result.selection.anchor.offset).toBe(1)
    })

    it('inserts text in the middle of a block', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = insertText(doc, sel, '-')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello- World')
    })

    it('inserts text at the end of a block', () => {
      const sel = createCollapsedSelection(b1.id, 11)
      const result = insertText(doc, sel, '!')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World!')
      expect(result.selection.anchor.offset).toBe(12)
    })

    it('inserts multiple characters', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = insertText(doc, sel, ' Beautiful')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello Beautiful World')
    })

    it('replaces selected text when selection is expanded', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = insertText(doc, sel, 'Hi')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hi World')
    })

    it('inserts text into an empty block', () => {
      const emptyBlock = createBlock()
      const emptyDoc = createDocument([emptyBlock])
      const sel = createCollapsedSelection(emptyBlock.id, 0)
      const result = insertText(emptyDoc, sel, 'New text')
      expect(getBlockText(result.doc.blocks[0])).toBe('New text')
    })

    it('inserts into second block without affecting first', () => {
      const sel = createCollapsedSelection(b2.id, 0)
      const result = insertText(doc, sel, 'X')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
      expect(getBlockText(result.doc.blocks[1])).toBe('XSecond line')
    })

    it('replaces cross-block selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b2.id, 7),
      )
      const result = insertText(doc, sel, 'new')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello newline')
      expect(result.doc.blocks).toHaveLength(2) // b1 merged with b2, b3 remains
    })

    it('does not mutate the original document', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      insertText(doc, sel, 'X')
      expect(getBlockText(doc.blocks[0])).toBe('Hello World')
    })

    it('cursor advances by the length of inserted text', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertText(doc, sel, 'ABC')
      expect(result.selection.anchor.offset).toBe(3)
      expect(result.selection.focus.offset).toBe(3)
    })

    it('handles inserting into block with mention segments', () => {
      const mentionBlock = createBlock('paragraph', [
        createTextSegment('Hi '),
        createMentionSegment('u1', '@alice'),
        createTextSegment(' there'),
      ])
      const mentionDoc = createDocument([mentionBlock])
      const sel = createCollapsedSelection(mentionBlock.id, 2)
      const result = insertText(mentionDoc, sel, 'X')
      expect(getBlockText(result.doc.blocks[0])).toBe('HiX @alice there')
    })
  })

  // =========================================================================
  // deleteBackward
  // =========================================================================
  describe('deleteBackward', () => {
    it('deletes one character backward', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = deleteBackward(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hell World')
      expect(result.selection.anchor.offset).toBe(4)
    })

    it('does nothing at start of first block (paragraph)', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = deleteBackward(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
    })

    it('merges with previous block at start of block', () => {
      const sel = createCollapsedSelection(b2.id, 0)
      const result = deleteBackward(doc, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello WorldSecond line')
      expect(result.selection.anchor.offset).toBe(11) // cursor at merge point
    })

    it('deletes selection if expanded', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = deleteBackward(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe(' World')
    })

    it('deletes the last character in a block', () => {
      const singleChar = createBlock('paragraph', [createTextSegment('A')])
      const d = createDocument([singleChar])
      const sel = createCollapsedSelection(singleChar.id, 1)
      const result = deleteBackward(d, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('')
    })

    it('does not mutate the original', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      deleteBackward(doc, sel)
      expect(getBlockText(doc.blocks[0])).toBe('Hello World')
    })

    it('converts heading to paragraph when deleting at start', () => {
      const heading = createBlock('heading', [createTextSegment('Title')], { level: 1 })
      const hDoc = createDocument([heading])
      const sel = createCollapsedSelection(heading.id, 0)
      const result = deleteBackward(hDoc, sel)
      expect(result.doc.blocks[0].type).toBe('paragraph')
    })

    it('removes divider when merging backward into it', () => {
      const divider = createBlock('divider')
      const para = createBlock('paragraph', [createTextSegment('After')])
      const d = createDocument([divider, para])
      const sel = createCollapsedSelection(para.id, 0)
      const result = deleteBackward(d, sel)
      expect(result.doc.blocks).toHaveLength(1)
      expect(getBlockText(result.doc.blocks[0])).toBe('After')
    })

    it('merges block with formatted content', () => {
      const bold = createBlock('paragraph', [createTextSegment('Bold', [{ type: 'bold' }])])
      const plain = createBlock('paragraph', [createTextSegment(' text')])
      const d = createDocument([bold, plain])
      const sel = createCollapsedSelection(plain.id, 0)
      const result = deleteBackward(d, sel)
      expect(result.doc.blocks).toHaveLength(1)
    })
  })

  // =========================================================================
  // deleteForward
  // =========================================================================
  describe('deleteForward', () => {
    it('deletes one character forward', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = deleteForward(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('ello World')
    })

    it('merges with next block at end of block', () => {
      const sel = createCollapsedSelection(b1.id, 11)
      const result = deleteForward(doc, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello WorldSecond line')
    })

    it('does nothing at end of last block', () => {
      const sel = createCollapsedSelection(b3.id, 10)
      const result = deleteForward(doc, sel)
      expect(getBlockText(result.doc.blocks[2])).toBe('Third line')
    })

    it('deletes selection if expanded', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b1.id, 11),
      )
      const result = deleteForward(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello')
    })

    it('removes divider when merging forward over it', () => {
      const para = createBlock('paragraph', [createTextSegment('Before')])
      const divider = createBlock('divider')
      const d = createDocument([para, divider])
      const sel = createCollapsedSelection(para.id, 6)
      const result = deleteForward(d, sel)
      expect(result.doc.blocks).toHaveLength(1)
    })

    it('deletes in the middle of a word', () => {
      const sel = createCollapsedSelection(b1.id, 2)
      const result = deleteForward(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('Helo World')
    })
  })

  // =========================================================================
  // deleteSelection
  // =========================================================================
  describe('deleteSelection', () => {
    it('returns unchanged for collapsed selection', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = deleteSelection(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
    })

    it('deletes within a single block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = deleteSelection(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe(' World')
      expect(result.selection.anchor.offset).toBe(0)
    })

    it('deletes across multiple blocks', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b3.id, 5),
      )
      const result = deleteSelection(doc, sel)
      expect(result.doc.blocks).toHaveLength(1)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello line')
    })

    it('deletes across two blocks', () => {
      const sel = createSelection(
        createPosition(b1.id, 6),
        createPosition(b2.id, 7),
      )
      const result = deleteSelection(doc, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello line')
    })

    it('handles backward selection', () => {
      const sel = createSelection(
        createPosition(b1.id, 5),
        createPosition(b1.id, 0),
      )
      const result = deleteSelection(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe(' World')
    })

    it('deletes entire block content', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 11),
      )
      const result = deleteSelection(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('')
    })

    it('select all and delete leaves one empty block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b3.id, 10),
      )
      const result = deleteSelection(doc, sel)
      expect(result.doc.blocks).toHaveLength(1)
      expect(getBlockText(result.doc.blocks[0])).toBe('')
    })
  })

  // =========================================================================
  // splitBlock
  // =========================================================================
  describe('splitBlock', () => {
    it('splits a block at the cursor in the middle', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = splitBlock(doc, sel)
      expect(result.doc.blocks).toHaveLength(4)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello')
      expect(getBlockText(result.doc.blocks[1])).toBe(' World')
    })

    it('splits at the beginning creates empty block before', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = splitBlock(doc, sel)
      expect(result.doc.blocks).toHaveLength(4)
      expect(getBlockText(result.doc.blocks[0])).toBe('')
      expect(getBlockText(result.doc.blocks[1])).toBe('Hello World')
    })

    it('splits at the end creates empty block after', () => {
      const sel = createCollapsedSelection(b1.id, 11)
      const result = splitBlock(doc, sel)
      expect(result.doc.blocks).toHaveLength(4)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
      expect(getBlockText(result.doc.blocks[1])).toBe('')
    })

    it('moves cursor to start of new block', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = splitBlock(doc, sel)
      expect(result.selection.anchor.blockId).toBe(result.doc.blocks[1].id)
      expect(result.selection.anchor.offset).toBe(0)
    })

    it('deletes selection before splitting', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 6),
      )
      const result = splitBlock(doc, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('')
      expect(getBlockText(result.doc.blocks[1])).toBe('World')
    })

    it('list item split creates another list item', () => {
      const li = createBlock('list-item', [createTextSegment('Item one')], { listType: 'bullet' })
      const d = createDocument([li])
      const sel = createCollapsedSelection(li.id, 4)
      const result = splitBlock(d, sel)
      expect(result.doc.blocks[1].type).toBe('list-item')
    })

    it('heading split creates paragraph', () => {
      const h = createBlock('heading', [createTextSegment('Title')], { level: 1 })
      const d = createDocument([h])
      const sel = createCollapsedSelection(h.id, 5)
      const result = splitBlock(d, sel)
      expect(result.doc.blocks[1].type).toBe('paragraph')
    })

    it('split on divider creates paragraph after', () => {
      const div = createBlock('divider')
      const d = createDocument([div])
      const sel = createCollapsedSelection(div.id, 0)
      const result = splitBlock(d, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(result.doc.blocks[1].type).toBe('paragraph')
    })
  })

  // =========================================================================
  // mergeBlockBackward
  // =========================================================================
  describe('mergeBlockBackward', () => {
    it('merges current block into previous', () => {
      const sel = createCollapsedSelection(b2.id, 0)
      const result = mergeBlockBackward(doc, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello WorldSecond line')
    })

    it('cursor is placed at the merge point', () => {
      const sel = createCollapsedSelection(b2.id, 0)
      const result = mergeBlockBackward(doc, sel)
      expect(result.selection.anchor.offset).toBe(11)
    })

    it('does nothing for the first block (paragraph)', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = mergeBlockBackward(doc, sel)
      expect(result.doc.blocks).toHaveLength(3)
    })

    it('converts non-paragraph first block to paragraph', () => {
      const h = createBlock('heading', [createTextSegment('Title')], { level: 1 })
      const d = createDocument([h])
      const sel = createCollapsedSelection(h.id, 0)
      const result = mergeBlockBackward(d, sel)
      expect(result.doc.blocks[0].type).toBe('paragraph')
    })
  })

  // =========================================================================
  // mergeBlockForward
  // =========================================================================
  describe('mergeBlockForward', () => {
    it('merges next block into current', () => {
      const sel = createCollapsedSelection(b1.id, 11)
      const result = mergeBlockForward(doc, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello WorldSecond line')
    })

    it('does nothing for the last block', () => {
      const sel = createCollapsedSelection(b3.id, 10)
      const result = mergeBlockForward(doc, sel)
      expect(result.doc.blocks).toHaveLength(3)
    })
  })

  // =========================================================================
  // changeBlockType
  // =========================================================================
  describe('changeBlockType', () => {
    it('changes paragraph to heading', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'heading', { level: 1 })
      expect(result.doc.blocks[0].type).toBe('heading')
      expect(result.doc.blocks[0].meta?.level).toBe(1)
    })

    it('changes paragraph to blockquote', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'blockquote')
      expect(result.doc.blocks[0].type).toBe('blockquote')
    })

    it('changes paragraph to code block', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'code-block')
      expect(result.doc.blocks[0].type).toBe('code-block')
    })

    it('changes paragraph to list item', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'list-item', { listType: 'bullet' })
      expect(result.doc.blocks[0].type).toBe('list-item')
    })

    it('changes to divider clears content', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'divider')
      expect(result.doc.blocks[0].type).toBe('divider')
      expect(getBlockText(result.doc.blocks[0])).toBe('')
    })

    it('preserves content when changing between text types', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'heading', { level: 2 })
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
    })

    it('preserves selection', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = changeBlockType(doc, sel, 'blockquote')
      expect(result.selection.anchor.offset).toBe(5)
    })

    it('changes to image type', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = changeBlockType(doc, sel, 'image')
      expect(result.doc.blocks[0].type).toBe('image')
    })
  })

  // =========================================================================
  // insertBlock
  // =========================================================================
  describe('insertBlock', () => {
    it('inserts a new block after the current one', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertBlock(doc, sel, 'paragraph')
      expect(result.doc.blocks).toHaveLength(4)
    })

    it('moves cursor to the new block', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertBlock(doc, sel, 'paragraph')
      expect(result.selection.anchor.blockId).toBe(result.doc.blocks[1].id)
    })

    it('inserts block with meta', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertBlock(doc, sel, 'heading', { level: 2 })
      expect(result.doc.blocks[1].type).toBe('heading')
      expect(result.doc.blocks[1].meta?.level).toBe(2)
    })
  })

  // =========================================================================
  // indentBlock / outdentBlock
  // =========================================================================
  describe('indentBlock', () => {
    it('increases indent by 1', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = indentBlock(doc, sel)
      expect(result.doc.blocks[0].indent).toBe(1)
    })

    it('does not exceed max indent of 5', () => {
      const block = createBlock('list-item', [createTextSegment('Item')])
      block.indent = 5
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)
      const result = indentBlock(d, sel)
      expect(result.doc.blocks[0].indent).toBe(5)
    })

    it('increments from existing indent', () => {
      const block = createBlock('list-item', [createTextSegment('Item')])
      block.indent = 2
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)
      const result = indentBlock(d, sel)
      expect(result.doc.blocks[0].indent).toBe(3)
    })
  })

  describe('outdentBlock', () => {
    it('decreases indent by 1', () => {
      const block = createBlock('list-item', [createTextSegment('Item')])
      block.indent = 2
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 0)
      const result = outdentBlock(d, sel)
      expect(result.doc.blocks[0].indent).toBe(1)
    })

    it('does not go below 0', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = outdentBlock(doc, sel)
      expect(result.doc.blocks[0].indent ?? 0).toBe(0)
    })
  })

  // =========================================================================
  // Selection movement
  // =========================================================================
  describe('moveLeft', () => {
    it('moves cursor one position left', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = moveLeft(doc, sel)
      expect(result.anchor.offset).toBe(4)
    })

    it('moves to end of previous block at start of block', () => {
      const sel = createCollapsedSelection(b2.id, 0)
      const result = moveLeft(doc, sel)
      expect(result.anchor.blockId).toBe(b1.id)
      expect(result.anchor.offset).toBe(11)
    })

    it('stays at start of first block', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = moveLeft(doc, sel)
      expect(result.anchor.offset).toBe(0)
      expect(result.anchor.blockId).toBe(b1.id)
    })

    it('collapses expanded selection to start', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const result = moveLeft(doc, sel)
      expect(result.anchor.offset).toBe(2)
      expect(isCollapsed(result)).toBe(true)
    })
  })

  describe('moveRight', () => {
    it('moves cursor one position right', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = moveRight(doc, sel)
      expect(result.anchor.offset).toBe(6)
    })

    it('moves to start of next block at end of block', () => {
      const sel = createCollapsedSelection(b1.id, 11)
      const result = moveRight(doc, sel)
      expect(result.anchor.blockId).toBe(b2.id)
      expect(result.anchor.offset).toBe(0)
    })

    it('stays at end of last block', () => {
      const sel = createCollapsedSelection(b3.id, 10)
      const result = moveRight(doc, sel)
      expect(result.anchor.offset).toBe(10)
    })

    it('collapses expanded selection to end', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const result = moveRight(doc, sel)
      expect(result.anchor.offset).toBe(8)
      expect(isCollapsed(result)).toBe(true)
    })
  })

  describe('moveUp', () => {
    it('moves to previous block preserving offset', () => {
      const sel = createCollapsedSelection(b2.id, 5)
      const result = moveUp(doc, sel)
      expect(result.anchor.blockId).toBe(b1.id)
      expect(result.anchor.offset).toBe(5)
    })

    it('clamps offset to previous block length', () => {
      const short = createBlock('paragraph', [createTextSegment('Hi')])
      const long = createBlock('paragraph', [createTextSegment('Hello World')])
      const d = createDocument([short, long])
      const sel = createCollapsedSelection(long.id, 10)
      const result = moveUp(d, sel)
      expect(result.anchor.offset).toBe(2)
    })

    it('moves to start of first block when already on first', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = moveUp(doc, sel)
      expect(result.anchor.offset).toBe(0)
    })
  })

  describe('moveDown', () => {
    it('moves to next block preserving offset', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = moveDown(doc, sel)
      expect(result.anchor.blockId).toBe(b2.id)
      expect(result.anchor.offset).toBe(5)
    })

    it('moves to end of last block when already on last', () => {
      const sel = createCollapsedSelection(b3.id, 3)
      const result = moveDown(doc, sel)
      expect(result.anchor.offset).toBe(10)
    })
  })

  describe('moveToStartOfBlock', () => {
    it('moves cursor to start of current block', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = moveToStartOfBlock(doc, sel)
      expect(result.anchor.offset).toBe(0)
      expect(result.anchor.blockId).toBe(b1.id)
    })
  })

  describe('moveToEndOfBlock', () => {
    it('moves cursor to end of current block', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = moveToEndOfBlock(doc, sel)
      expect(result.anchor.offset).toBe(11)
    })
  })

  describe('moveToStartOfDocument', () => {
    it('moves cursor to start of document', () => {
      const result = moveToStartOfDocument(doc)
      expect(result.anchor.blockId).toBe(b1.id)
      expect(result.anchor.offset).toBe(0)
    })
  })

  describe('moveToEndOfDocument', () => {
    it('moves cursor to end of document', () => {
      const result = moveToEndOfDocument(doc)
      expect(result.anchor.blockId).toBe(b3.id)
      expect(result.anchor.offset).toBe(10)
    })
  })

  describe('expandSelectionWord', () => {
    it('expands selection to word boundaries', () => {
      const sel = createCollapsedSelection(b1.id, 7) // inside "World"
      const result = expandSelectionWord(doc, sel)
      expect(result.anchor.offset).toBe(6)
      expect(result.focus.offset).toBe(11)
    })

    it('expands at start of word', () => {
      const sel = createCollapsedSelection(b1.id, 6)
      const result = expandSelectionWord(doc, sel)
      expect(result.anchor.offset).toBe(6)
      expect(result.focus.offset).toBe(11)
    })

    it('handles cursor at start of document', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = expandSelectionWord(doc, sel)
      expect(result.anchor.offset).toBe(0)
      expect(result.focus.offset).toBe(5) // "Hello"
    })

    it('handles cursor between words (on space)', () => {
      const sel = createCollapsedSelection(b1.id, 5) // on space
      const result = expandSelectionWord(doc, sel)
      expect(result.anchor.offset).toBe(0) // "Hello" starts at 0
      expect(result.focus.offset).toBe(5) // "Hello" ends at 5
    })
  })

  // =========================================================================
  // insertInlineContent
  // =========================================================================
  describe('insertInlineContent', () => {
    it('inserts a mention segment', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const mention = createMentionSegment('u1', '@alice')
      const result = insertInlineContent(doc, sel, mention)
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello@alice World')
    })

    it('inserts an emoji segment', () => {
      const sel = createCollapsedSelection(b1.id, 11)
      const emoji = createEmojiSegment(':fire:', '\u{1F525}')
      const result = insertInlineContent(doc, sel, emoji)
      expect(getBlockText(result.doc.blocks[0])).toContain('\u{1F525}')
    })

    it('deletes selection before inserting', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const mention = createMentionSegment('u1', '@bob')
      const result = insertInlineContent(doc, sel, mention)
      expect(getBlockText(result.doc.blocks[0])).toBe('@bob World')
    })
  })

  // =========================================================================
  // Document invariants
  // =========================================================================
  describe('document invariants', () => {
    it('every operation returns at least one block', () => {
      const emptyBlock = createBlock()
      const d = createDocument([emptyBlock])
      const sel = createCollapsedSelection(emptyBlock.id, 0)

      const r1 = deleteBackward(d, sel)
      expect(r1.doc.blocks.length).toBeGreaterThanOrEqual(1)

      const r2 = splitBlock(d, sel)
      expect(r2.doc.blocks.length).toBeGreaterThanOrEqual(1)
    })

    it('insert then delete returns to original text', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const after = insertText(doc, sel, 'X')
      const back = deleteBackward(after.doc, after.selection)
      expect(getBlockText(back.doc.blocks[0])).toBe('Hello World')
    })

    it('split then merge returns to original', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const split = splitBlock(doc, sel)
      const merged = mergeBlockBackward(split.doc, split.selection)
      expect(getBlockText(merged.doc.blocks[0])).toBe('Hello World')
    })

    it('deleteSelection preserves blocks outside range', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 11),
      )
      const result = deleteSelection(doc, sel)
      expect(result.doc.blocks).toHaveLength(3)
      expect(getBlockText(result.doc.blocks[1])).toBe('Second line')
    })

    it('insertText preserves block count', () => {
      const sel = createCollapsedSelection(b2.id, 3)
      const result = insertText(doc, sel, 'X')
      expect(result.doc.blocks).toHaveLength(3)
    })

    it('selection is always collapsed after insertText', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertText(doc, sel, 'Hello')
      expect(isCollapsed(result.selection)).toBe(true)
    })

    it('selection is always collapsed after deleteBackward', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = deleteBackward(doc, sel)
      expect(isCollapsed(result.selection)).toBe(true)
    })

    it('selection is always collapsed after deleteForward', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b1.id, 5),
      )
      const result = deleteForward(doc, sel)
      expect(isCollapsed(result.selection)).toBe(true)
    })

    it('selection is always collapsed after deleteSelection', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const result = deleteSelection(doc, sel)
      expect(isCollapsed(result.selection)).toBe(true)
    })

    it('selection is always collapsed after splitBlock', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = splitBlock(doc, sel)
      expect(isCollapsed(result.selection)).toBe(true)
    })
  })

  // =========================================================================
  // Additional edge cases
  // =========================================================================
  describe('additional edge cases', () => {
    it('insert empty string is a no-op', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = insertText(doc, sel, '')
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
      expect(result.selection.anchor.offset).toBe(5)
    })

    it('insert newline character does not split block (raw insert)', () => {
      const sel = createCollapsedSelection(b1.id, 5)
      const result = insertText(doc, sel, '\n')
      expect(result.doc.blocks).toHaveLength(3) // still 3 blocks
      expect(getBlockText(result.doc.blocks[0])).toBe('Hello\n World')
    })

    it('deleteBackward at offset 1 leaves empty text', () => {
      const singleChar = createBlock('paragraph', [createTextSegment('A')])
      const d = createDocument([singleChar])
      const sel = createCollapsedSelection(singleChar.id, 1)
      const result = deleteBackward(d, sel)
      expect(getBlockTextLength(result.doc.blocks[0])).toBe(0)
    })

    it('deleteForward in middle of multi-segment content', () => {
      const block = createBlock('paragraph', [
        createTextSegment('Hel'),
        createTextSegment('lo', [{ type: 'bold' }]),
      ])
      const d = createDocument([block])
      const sel = createCollapsedSelection(block.id, 2)
      const result = deleteForward(d, sel)
      expect(getBlockText(result.doc.blocks[0])).toBe('Helo')
    })

    it('mergeBlockBackward with formatted blocks preserves formatting', () => {
      const b1 = createBlock('paragraph', [createTextSegment('Hello', [{ type: 'bold' }])])
      const b2 = createBlock('paragraph', [createTextSegment(' World', [{ type: 'italic' }])])
      const d = createDocument([b1, b2])
      const sel = createCollapsedSelection(b2.id, 0)
      const result = mergeBlockBackward(d, sel)
      expect(result.doc.blocks).toHaveLength(1)
      // Should have both bold and italic segments
      const content = result.doc.blocks[0].content
      expect(content.some((s) => s.type === 'text' && s.marks.some((m) => m.type === 'bold'))).toBe(true)
      expect(content.some((s) => s.type === 'text' && s.marks.some((m) => m.type === 'italic'))).toBe(true)
    })

    it('changeBlockType preserves content text', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const types: Array<{ type: any; name: string }> = [
        { type: 'heading', name: 'heading' },
        { type: 'blockquote', name: 'blockquote' },
        { type: 'code-block', name: 'code-block' },
        { type: 'list-item', name: 'list-item' },
      ]
      for (const { type } of types) {
        const result = changeBlockType(doc, sel, type)
        expect(getBlockText(result.doc.blocks[0])).toBe('Hello World')
      }
    })

    it('multiple indents stack up', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      let result = indentBlock(doc, sel)
      result = indentBlock(result.doc, sel)
      result = indentBlock(result.doc, sel)
      expect(result.doc.blocks[0].indent).toBe(3)
    })

    it('outdent below 0 stays at 0', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = outdentBlock(doc, sel)
      expect(result.doc.blocks[0].indent ?? 0).toBe(0)
      const result2 = outdentBlock(result.doc, sel)
      expect(result2.doc.blocks[0].indent ?? 0).toBe(0)
    })

    it('moveLeft from expanded backward selection collapses to start', () => {
      const sel = createSelection(
        createPosition(b1.id, 8),
        createPosition(b1.id, 2),
      )
      const result = moveLeft(doc, sel)
      expect(result.anchor.offset).toBe(2)
      expect(isCollapsed(result)).toBe(true)
    })

    it('moveRight from expanded backward selection collapses to end', () => {
      const sel = createSelection(
        createPosition(b1.id, 8),
        createPosition(b1.id, 2),
      )
      const result = moveRight(doc, sel)
      expect(result.anchor.offset).toBe(8)
    })

    it('moveDown from expanded selection collapses first', () => {
      const sel = createSelection(
        createPosition(b1.id, 2),
        createPosition(b1.id, 8),
      )
      const result = moveDown(doc, sel)
      expect(result.anchor.blockId).toBe(b2.id)
    })

    it('insertBlock with divider type', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertBlock(doc, sel, 'divider')
      expect(result.doc.blocks[1].type).toBe('divider')
    })

    it('splitBlock on empty block creates two empty blocks', () => {
      const empty = createBlock('paragraph')
      const d = createDocument([empty])
      const sel = createCollapsedSelection(empty.id, 0)
      const result = splitBlock(d, sel)
      expect(result.doc.blocks).toHaveLength(2)
      expect(getBlockTextLength(result.doc.blocks[0])).toBe(0)
      expect(getBlockTextLength(result.doc.blocks[1])).toBe(0)
    })

    it('deleteSelection across all blocks leaves one empty block', () => {
      const sel = createSelection(
        createPosition(b1.id, 0),
        createPosition(b3.id, getBlockTextLength(b3)),
      )
      const result = deleteSelection(doc, sel)
      expect(result.doc.blocks).toHaveLength(1)
      expect(getBlockTextLength(result.doc.blocks[0])).toBe(0)
    })

    it('insertText with multi-byte characters', () => {
      const sel = createCollapsedSelection(b1.id, 0)
      const result = insertText(doc, sel, '\u{1F600}')
      expect(getBlockText(result.doc.blocks[0])).toContain('\u{1F600}')
    })
  })
})
