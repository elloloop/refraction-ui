/**
 * Selection model and utilities.
 * A selection has an anchor (start) and focus (end), each referencing
 * a block id and character offset within the block's text content.
 */

import type { Document, Block } from './model.js'
import { findBlockById, findBlockIndex, getBlockText, getBlockTextLength } from './model.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Position {
  blockId: string
  offset: number
}

export interface Selection {
  anchor: Position
  focus: Position
}

// ---------------------------------------------------------------------------
// Creation helpers
// ---------------------------------------------------------------------------
export function createPosition(blockId: string, offset: number): Position {
  return { blockId, offset }
}

export function createSelection(anchor: Position, focus: Position): Selection {
  return { anchor, focus }
}

export function createCollapsedSelection(blockId: string, offset: number): Selection {
  const pos = createPosition(blockId, offset)
  return { anchor: pos, focus: { ...pos } }
}

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------
export function isCollapsed(sel: Selection): boolean {
  return sel.anchor.blockId === sel.focus.blockId && sel.anchor.offset === sel.focus.offset
}

export function isForward(doc: Document, sel: Selection): boolean {
  if (sel.anchor.blockId === sel.focus.blockId) {
    return sel.anchor.offset <= sel.focus.offset
  }
  const anchorIdx = findBlockIndex(doc, sel.anchor.blockId)
  const focusIdx = findBlockIndex(doc, sel.focus.blockId)
  return anchorIdx <= focusIdx
}

// ---------------------------------------------------------------------------
// Selection queries
// ---------------------------------------------------------------------------

/** Get the start (earlier) position of a selection. */
export function getSelectionStart(doc: Document, sel: Selection): Position {
  return isForward(doc, sel) ? sel.anchor : sel.focus
}

/** Get the end (later) position of a selection. */
export function getSelectionEnd(doc: Document, sel: Selection): Position {
  return isForward(doc, sel) ? sel.focus : sel.anchor
}

/** Get the text content that is selected. */
export function getSelectedText(doc: Document, sel: Selection): string {
  if (isCollapsed(sel)) return ''

  const start = getSelectionStart(doc, sel)
  const end = getSelectionEnd(doc, sel)

  if (start.blockId === end.blockId) {
    const block = findBlockById(doc, start.blockId)
    if (!block) return ''
    const text = getBlockText(block)
    return text.slice(start.offset, end.offset)
  }

  // Multi-block selection
  const startIdx = findBlockIndex(doc, start.blockId)
  const endIdx = findBlockIndex(doc, end.blockId)
  const parts: string[] = []

  for (let i = startIdx; i <= endIdx; i++) {
    const block = doc.blocks[i]
    const text = getBlockText(block)
    if (i === startIdx) {
      parts.push(text.slice(start.offset))
    } else if (i === endIdx) {
      parts.push(text.slice(0, end.offset))
    } else {
      parts.push(text)
    }
  }

  return parts.join('\n')
}

/** Get all blocks that are (partially or fully) within the selection. */
export function getSelectedBlocks(doc: Document, sel: Selection): Block[] {
  if (isCollapsed(sel)) {
    const block = findBlockById(doc, sel.anchor.blockId)
    return block ? [block] : []
  }

  const start = getSelectionStart(doc, sel)
  const end = getSelectionEnd(doc, sel)
  const startIdx = findBlockIndex(doc, start.blockId)
  const endIdx = findBlockIndex(doc, end.blockId)

  if (startIdx === -1 || endIdx === -1) return []
  return doc.blocks.slice(startIdx, endIdx + 1)
}

/** Clamp a selection so its positions are valid within the document. */
export function clampSelection(doc: Document, sel: Selection): Selection {
  function clampPosition(pos: Position): Position {
    const block = findBlockById(doc, pos.blockId)
    if (!block) {
      // Fall back to first block
      const first = doc.blocks[0]
      return { blockId: first.id, offset: 0 }
    }
    const maxOffset = getBlockTextLength(block)
    return { blockId: pos.blockId, offset: Math.max(0, Math.min(pos.offset, maxOffset)) }
  }
  return {
    anchor: clampPosition(sel.anchor),
    focus: clampPosition(sel.focus),
  }
}

/** Create a selection at the very start of the document. */
export function selectionAtDocStart(doc: Document): Selection {
  const block = doc.blocks[0]
  return createCollapsedSelection(block.id, 0)
}

/** Create a selection at the very end of the document. */
export function selectionAtDocEnd(doc: Document): Selection {
  const block = doc.blocks[doc.blocks.length - 1]
  return createCollapsedSelection(block.id, getBlockTextLength(block))
}

/** Create a selection that spans the entire document. */
export function selectAll(doc: Document): Selection {
  const first = doc.blocks[0]
  const last = doc.blocks[doc.blocks.length - 1]
  return createSelection(
    createPosition(first.id, 0),
    createPosition(last.id, getBlockTextLength(last)),
  )
}
