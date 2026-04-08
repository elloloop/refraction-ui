/**
 * Editor operations — pure functions that take (doc, selection) and return new state.
 * Every operation is immutable: documents and selections are never mutated in-place.
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
  cloneDocument,
  createBlock,
  createTextSegment,
  findBlockById,
  findBlockIndex,
  getBlockText,
  getBlockTextLength,
  normalizeContent,
} from './model.js'
import type { Selection, Position } from './selection.js'
import {
  createCollapsedSelection,
  createPosition,
  createSelection,
  getSelectionEnd,
  getSelectionStart,
  isCollapsed,
  isForward,
} from './selection.js'

// ---------------------------------------------------------------------------
// Editor state
// ---------------------------------------------------------------------------
export interface EditorState {
  doc: Document
  selection: Selection
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Split a block's inline content at a character offset, returning [before, after].
 */
function splitContentAt(
  content: InlineContent[],
  offset: number,
): [InlineContent[], InlineContent[]] {
  const before: InlineContent[] = []
  const after: InlineContent[] = []
  let pos = 0

  for (const seg of content) {
    const segLen = seg.type === 'text' ? seg.text.length : seg.type === 'mention' ? seg.label.length : seg.type === 'emoji' ? seg.unicode.length : 0

    if (pos + segLen <= offset) {
      before.push(structuredClone(seg))
      pos += segLen
    } else if (pos >= offset) {
      after.push(structuredClone(seg))
      pos += segLen
    } else {
      // Split within this segment
      const splitAt = offset - pos
      if (seg.type === 'text') {
        before.push(createTextSegment(seg.text.slice(0, splitAt), [...seg.marks]))
        after.push(createTextSegment(seg.text.slice(splitAt), [...seg.marks]))
      } else {
        // Mention/emoji can't really be split; put whole segment in before
        before.push(structuredClone(seg))
      }
      pos += segLen
    }
  }

  return [
    before.length > 0 ? normalizeContent(before) : [createTextSegment('')],
    after.length > 0 ? normalizeContent(after) : [createTextSegment('')],
  ]
}

/**
 * Delete a range of characters from content, returning new content.
 */
function deleteContentRange(
  content: InlineContent[],
  start: number,
  end: number,
): InlineContent[] {
  const [beforeAll] = splitContentAt(content, start)
  const [, afterAll] = splitContentAt(content, end)
  return normalizeContent([...beforeAll, ...afterAll])
}

/**
 * Insert text into content at a given offset, with given marks.
 */
function insertTextIntoContent(
  content: InlineContent[],
  offset: number,
  text: string,
  marks: Mark[] = [],
): InlineContent[] {
  const [before, after] = splitContentAt(content, offset)
  const newSeg = createTextSegment(text, marks)
  return normalizeContent([...before, newSeg, ...after])
}

/**
 * Insert an inline content segment at a given offset.
 */
function insertSegmentIntoContent(
  content: InlineContent[],
  offset: number,
  segment: InlineContent,
): InlineContent[] {
  const [before, after] = splitContentAt(content, offset)
  return normalizeContent([...before, segment, ...after])
}

/**
 * Get the marks at a specific offset within content.
 */
function getMarksAtOffset(content: InlineContent[], offset: number): Mark[] {
  let pos = 0
  for (const seg of content) {
    const segLen = seg.type === 'text' ? seg.text.length : seg.type === 'mention' ? seg.label.length : seg.type === 'emoji' ? seg.unicode.length : 0
    if (seg.type === 'text' && pos <= offset && offset <= pos + segLen) {
      return [...seg.marks]
    }
    pos += segLen
  }
  return []
}

// ---------------------------------------------------------------------------
// Text operations
// ---------------------------------------------------------------------------

/** Insert text at the current selection. If selection is expanded, delete first. */
export function insertText(doc: Document, sel: Selection, text: string): EditorState {
  let d = cloneDocument(doc)
  let s = sel

  // If there's a selection range, delete it first
  if (!isCollapsed(s)) {
    const result = deleteSelection(d, s)
    d = result.doc
    s = result.selection
  }

  const block = findBlockById(d, s.anchor.blockId)
  if (!block) return { doc: d, selection: s }

  const marks = getMarksAtOffset(block.content, s.anchor.offset)
  block.content = insertTextIntoContent(block.content, s.anchor.offset, text, marks)
  const newOffset = s.anchor.offset + text.length
  const newSel = createCollapsedSelection(block.id, newOffset)

  return { doc: d, selection: newSel }
}

/** Delete one character backward from the cursor (Backspace). */
export function deleteBackward(doc: Document, sel: Selection): EditorState {
  if (!isCollapsed(sel)) {
    return deleteSelection(doc, sel)
  }

  const d = cloneDocument(doc)
  const block = findBlockById(d, sel.anchor.blockId)
  if (!block) return { doc: d, selection: sel }

  if (sel.anchor.offset > 0) {
    // Delete one character within the block
    block.content = deleteContentRange(block.content, sel.anchor.offset - 1, sel.anchor.offset)
    return {
      doc: d,
      selection: createCollapsedSelection(block.id, sel.anchor.offset - 1),
    }
  }

  // At start of block — merge with previous block
  return mergeBlockBackward(d, sel)
}

/** Delete one character forward from the cursor (Delete key). */
export function deleteForward(doc: Document, sel: Selection): EditorState {
  if (!isCollapsed(sel)) {
    return deleteSelection(doc, sel)
  }

  const d = cloneDocument(doc)
  const block = findBlockById(d, sel.anchor.blockId)
  if (!block) return { doc: d, selection: sel }

  const textLen = getBlockTextLength(block)
  if (sel.anchor.offset < textLen) {
    // Delete one character forward within the block
    block.content = deleteContentRange(block.content, sel.anchor.offset, sel.anchor.offset + 1)
    return { doc: d, selection: createCollapsedSelection(block.id, sel.anchor.offset) }
  }

  // At end of block — merge next block into this one
  return mergeBlockForward(d, sel)
}

/** Delete the currently selected content. */
export function deleteSelection(doc: Document, sel: Selection): EditorState {
  if (isCollapsed(sel)) return { doc: cloneDocument(doc), selection: sel }

  const d = cloneDocument(doc)
  const start = getSelectionStart(d, sel)
  const end = getSelectionEnd(d, sel)

  if (start.blockId === end.blockId) {
    // Single block deletion
    const block = findBlockById(d, start.blockId)!
    block.content = deleteContentRange(block.content, start.offset, end.offset)
    return { doc: d, selection: createCollapsedSelection(block.id, start.offset) }
  }

  // Multi-block deletion
  const startIdx = findBlockIndex(d, start.blockId)
  const endIdx = findBlockIndex(d, end.blockId)

  const startBlock = d.blocks[startIdx]
  const endBlock = d.blocks[endIdx]

  // Keep content before start and after end, merge into start block
  const [beforeContent] = splitContentAt(startBlock.content, start.offset)
  const [, afterContent] = splitContentAt(endBlock.content, end.offset)

  startBlock.content = normalizeContent([...beforeContent, ...afterContent])

  // Remove all blocks between start and end (inclusive of end)
  d.blocks.splice(startIdx + 1, endIdx - startIdx)

  return { doc: d, selection: createCollapsedSelection(startBlock.id, start.offset) }
}

// ---------------------------------------------------------------------------
// Block operations
// ---------------------------------------------------------------------------

/** Insert a new block of the given type after the current block. */
export function insertBlock(doc: Document, sel: Selection, type: BlockType, meta?: Record<string, unknown>): EditorState {
  const d = cloneDocument(doc)
  const idx = findBlockIndex(d, sel.anchor.blockId)
  if (idx === -1) return { doc: d, selection: sel }

  const newBlock = createBlock(type, [], meta)
  d.blocks.splice(idx + 1, 0, newBlock)

  return { doc: d, selection: createCollapsedSelection(newBlock.id, 0) }
}

/** Split the current block at the cursor position (Enter key). */
export function splitBlock(doc: Document, sel: Selection): EditorState {
  let d = cloneDocument(doc)
  let s = sel

  if (!isCollapsed(s)) {
    const result = deleteSelection(d, s)
    d = result.doc
    s = result.selection
  }

  const idx = findBlockIndex(d, s.anchor.blockId)
  if (idx === -1) return { doc: d, selection: s }

  const block = d.blocks[idx]

  // For dividers, just insert a new paragraph after
  if (block.type === 'divider') {
    const newBlock = createBlock('paragraph')
    d.blocks.splice(idx + 1, 0, newBlock)
    return { doc: d, selection: createCollapsedSelection(newBlock.id, 0) }
  }

  const [beforeContent, afterContent] = splitContentAt(block.content, s.anchor.offset)

  block.content = beforeContent

  // New block inherits type for paragraphs and list items, otherwise becomes paragraph
  const newType: BlockType = block.type === 'list-item' ? 'list-item' : 'paragraph'
  const newBlock = createBlock(newType, afterContent)

  d.blocks.splice(idx + 1, 0, newBlock)

  return { doc: d, selection: createCollapsedSelection(newBlock.id, 0) }
}

/** Merge the current block backward into the previous block (Backspace at start). */
export function mergeBlockBackward(doc: Document, sel: Selection): EditorState {
  const d = cloneDocument(doc)
  const idx = findBlockIndex(d, sel.anchor.blockId)

  // If it's a non-paragraph block at start, convert to paragraph first
  if (idx <= 0) {
    const block = d.blocks[idx]
    if (block && block.type !== 'paragraph') {
      block.type = 'paragraph'
      delete block.meta
      return { doc: d, selection: createCollapsedSelection(block.id, 0) }
    }
    return { doc: d, selection: sel }
  }

  const prevBlock = d.blocks[idx - 1]
  const currBlock = d.blocks[idx]

  // If previous block is a divider, just remove it
  if (prevBlock.type === 'divider') {
    d.blocks.splice(idx - 1, 1)
    return { doc: d, selection: createCollapsedSelection(currBlock.id, 0) }
  }

  const prevLen = getBlockTextLength(prevBlock)
  prevBlock.content = normalizeContent([...prevBlock.content, ...currBlock.content])
  d.blocks.splice(idx, 1)

  return { doc: d, selection: createCollapsedSelection(prevBlock.id, prevLen) }
}

/** Merge the next block forward into the current block (Delete at end). */
export function mergeBlockForward(doc: Document, sel: Selection): EditorState {
  const d = cloneDocument(doc)
  const idx = findBlockIndex(d, sel.anchor.blockId)
  if (idx === -1 || idx >= d.blocks.length - 1) return { doc: d, selection: sel }

  const currBlock = d.blocks[idx]
  const nextBlock = d.blocks[idx + 1]

  // If next block is a divider, just remove it
  if (nextBlock.type === 'divider') {
    d.blocks.splice(idx + 1, 1)
    return { doc: d, selection: sel }
  }

  const currLen = getBlockTextLength(currBlock)
  currBlock.content = normalizeContent([...currBlock.content, ...nextBlock.content])
  d.blocks.splice(idx + 1, 1)

  return { doc: d, selection: createCollapsedSelection(currBlock.id, currLen) }
}

/** Change the type of the block at the cursor. */
export function changeBlockType(
  doc: Document,
  sel: Selection,
  type: BlockType,
  meta?: Record<string, unknown>,
): EditorState {
  const d = cloneDocument(doc)
  const block = findBlockById(d, sel.anchor.blockId)
  if (!block) return { doc: d, selection: sel }

  block.type = type
  if (meta) {
    block.meta = { ...block.meta, ...meta }
  } else if (type !== block.type) {
    // Clear meta when changing type without new meta, unless it's same type
  }

  // Dividers have no content
  if (type === 'divider') {
    block.content = [createTextSegment('')]
  }

  return { doc: d, selection: sel }
}

/** Indent a block (increase indent level). */
export function indentBlock(doc: Document, sel: Selection): EditorState {
  const d = cloneDocument(doc)
  const block = findBlockById(d, sel.anchor.blockId)
  if (!block) return { doc: d, selection: sel }

  const currentIndent = block.indent ?? 0
  if (currentIndent < 5) {
    block.indent = currentIndent + 1
  }

  return { doc: d, selection: sel }
}

/** Outdent a block (decrease indent level). */
export function outdentBlock(doc: Document, sel: Selection): EditorState {
  const d = cloneDocument(doc)
  const block = findBlockById(d, sel.anchor.blockId)
  if (!block) return { doc: d, selection: sel }

  const currentIndent = block.indent ?? 0
  if (currentIndent > 0) {
    block.indent = currentIndent - 1
  }

  return { doc: d, selection: sel }
}

// ---------------------------------------------------------------------------
// Mark operations
// ---------------------------------------------------------------------------

/** Check if a mark of a given type is in the marks array. */
function hasMarkType(marks: Mark[], type: MarkType): boolean {
  return marks.some((m) => m.type === type)
}

/** Get the active marks at the current selection. */
export function getActiveMarks(doc: Document, sel: Selection): Mark[] {
  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return []

  if (isCollapsed(sel)) {
    // Return marks at the cursor position
    return getMarksAtOffset(block.content, sel.anchor.offset > 0 ? sel.anchor.offset - 1 : 0)
  }

  // For a range selection, return marks common to all characters in the range
  const start = getSelectionStart(doc, sel)
  const end = getSelectionEnd(doc, sel)

  if (start.blockId !== end.blockId) {
    // For simplicity across blocks, get marks from the start position
    return getMarksAtOffset(block.content, start.offset)
  }

  // Get all marks that apply to every character in the range
  const allMarks: Mark[][] = []
  let pos = 0
  for (const seg of block.content) {
    if (seg.type !== 'text') {
      pos += seg.type === 'mention' ? seg.label.length : seg.type === 'emoji' ? seg.unicode.length : 0
      continue
    }
    const segStart = pos
    const segEnd = pos + seg.text.length
    pos = segEnd

    // Check if this segment overlaps with the selection
    if (segEnd <= start.offset || segStart >= end.offset) continue
    allMarks.push([...seg.marks])
  }

  if (allMarks.length === 0) return []

  // Intersection of all mark arrays
  return allMarks[0].filter((mark) => allMarks.every((marks) => hasMarkType(marks, mark.type)))
}

/** Toggle a mark type on the selection. If fully applied, remove; otherwise add. */
export function toggleMark(doc: Document, sel: Selection, markType: MarkType, attrs?: Record<string, string>): EditorState {
  const active = getActiveMarks(doc, sel)
  const mark: Mark = { type: markType, ...(attrs ? { attrs } : {}) }
  if (hasMarkType(active, markType)) {
    return removeMark(doc, sel, markType)
  }
  return addMark(doc, sel, mark)
}

/** Add a mark to the selected range. */
export function addMark(doc: Document, sel: Selection, mark: Mark): EditorState {
  if (isCollapsed(sel)) {
    // For collapsed selections, we can't apply marks to nothing
    return { doc: cloneDocument(doc), selection: sel }
  }

  const d = cloneDocument(doc)
  const start = getSelectionStart(d, sel)
  const end = getSelectionEnd(d, sel)

  // Apply to each block in the selection
  const startIdx = findBlockIndex(d, start.blockId)
  const endIdx = findBlockIndex(d, end.blockId)

  for (let i = startIdx; i <= endIdx; i++) {
    const block = d.blocks[i]
    const blockStart = i === startIdx ? start.offset : 0
    const blockEnd = i === endIdx ? end.offset : getBlockTextLength(block)

    block.content = applyMarkToContent(block.content, blockStart, blockEnd, mark)
  }

  return { doc: d, selection: sel }
}

/** Remove a mark type from the selected range. */
export function removeMark(doc: Document, sel: Selection, markType: MarkType): EditorState {
  if (isCollapsed(sel)) {
    return { doc: cloneDocument(doc), selection: sel }
  }

  const d = cloneDocument(doc)
  const start = getSelectionStart(d, sel)
  const end = getSelectionEnd(d, sel)

  const startIdx = findBlockIndex(d, start.blockId)
  const endIdx = findBlockIndex(d, end.blockId)

  for (let i = startIdx; i <= endIdx; i++) {
    const block = d.blocks[i]
    const blockStart = i === startIdx ? start.offset : 0
    const blockEnd = i === endIdx ? end.offset : getBlockTextLength(block)

    block.content = removeMarkFromContent(block.content, blockStart, blockEnd, markType)
  }

  return { doc: d, selection: sel }
}

/**
 * Apply a mark to a range within inline content.
 * Splits segments as needed so the mark only applies to the specified range.
 */
function applyMarkToContent(
  content: InlineContent[],
  start: number,
  end: number,
  mark: Mark,
): InlineContent[] {
  const result: InlineContent[] = []
  let pos = 0

  for (const seg of content) {
    const segLen = seg.type === 'text' ? seg.text.length : seg.type === 'mention' ? seg.label.length : seg.type === 'emoji' ? seg.unicode.length : 0
    const segStart = pos
    const segEnd = pos + segLen
    pos = segEnd

    if (seg.type !== 'text') {
      result.push(structuredClone(seg))
      continue
    }

    if (segEnd <= start || segStart >= end) {
      // Outside the range
      result.push(createTextSegment(seg.text, [...seg.marks]))
    } else if (segStart >= start && segEnd <= end) {
      // Fully inside the range
      const newMarks = hasMarkType(seg.marks, mark.type)
        ? seg.marks.map((m) => (m.type === mark.type ? { ...mark } : { ...m }))
        : [...seg.marks, { ...mark }]
      result.push(createTextSegment(seg.text, newMarks))
    } else {
      // Partially overlapping — split
      if (segStart < start) {
        result.push(createTextSegment(seg.text.slice(0, start - segStart), [...seg.marks]))
      }
      const overlapStart = Math.max(0, start - segStart)
      const overlapEnd = Math.min(segLen, end - segStart)
      const newMarks = hasMarkType(seg.marks, mark.type)
        ? seg.marks.map((m) => (m.type === mark.type ? { ...mark } : { ...m }))
        : [...seg.marks, { ...mark }]
      result.push(createTextSegment(seg.text.slice(overlapStart, overlapEnd), newMarks))
      if (segEnd > end) {
        result.push(createTextSegment(seg.text.slice(end - segStart), [...seg.marks]))
      }
    }
  }

  return normalizeContent(result)
}

/**
 * Remove a mark type from a range within inline content.
 */
function removeMarkFromContent(
  content: InlineContent[],
  start: number,
  end: number,
  markType: MarkType,
): InlineContent[] {
  const result: InlineContent[] = []
  let pos = 0

  for (const seg of content) {
    const segLen = seg.type === 'text' ? seg.text.length : seg.type === 'mention' ? seg.label.length : seg.type === 'emoji' ? seg.unicode.length : 0
    const segStart = pos
    const segEnd = pos + segLen
    pos = segEnd

    if (seg.type !== 'text') {
      result.push(structuredClone(seg))
      continue
    }

    if (segEnd <= start || segStart >= end) {
      result.push(createTextSegment(seg.text, [...seg.marks]))
    } else if (segStart >= start && segEnd <= end) {
      const newMarks = seg.marks.filter((m) => m.type !== markType)
      result.push(createTextSegment(seg.text, newMarks))
    } else {
      if (segStart < start) {
        result.push(createTextSegment(seg.text.slice(0, start - segStart), [...seg.marks]))
      }
      const overlapStart = Math.max(0, start - segStart)
      const overlapEnd = Math.min(segLen, end - segStart)
      const newMarks = seg.marks.filter((m) => m.type !== markType)
      result.push(createTextSegment(seg.text.slice(overlapStart, overlapEnd), newMarks))
      if (segEnd > end) {
        result.push(createTextSegment(seg.text.slice(end - segStart), [...seg.marks]))
      }
    }
  }

  return normalizeContent(result)
}

// ---------------------------------------------------------------------------
// Selection movement operations
// ---------------------------------------------------------------------------

/** Move cursor one position to the left. */
export function moveLeft(doc: Document, sel: Selection): Selection {
  if (!isCollapsed(sel)) {
    const start = getSelectionStart(doc, sel)
    return createCollapsedSelection(start.blockId, start.offset)
  }

  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return sel

  if (sel.anchor.offset > 0) {
    return createCollapsedSelection(block.id, sel.anchor.offset - 1)
  }

  // Move to end of previous block
  const idx = findBlockIndex(doc, block.id)
  if (idx > 0) {
    const prevBlock = doc.blocks[idx - 1]
    return createCollapsedSelection(prevBlock.id, getBlockTextLength(prevBlock))
  }

  return sel
}

/** Move cursor one position to the right. */
export function moveRight(doc: Document, sel: Selection): Selection {
  if (!isCollapsed(sel)) {
    const end = getSelectionEnd(doc, sel)
    return createCollapsedSelection(end.blockId, end.offset)
  }

  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return sel

  const textLen = getBlockTextLength(block)
  if (sel.anchor.offset < textLen) {
    return createCollapsedSelection(block.id, sel.anchor.offset + 1)
  }

  // Move to start of next block
  const idx = findBlockIndex(doc, block.id)
  if (idx < doc.blocks.length - 1) {
    const nextBlock = doc.blocks[idx + 1]
    return createCollapsedSelection(nextBlock.id, 0)
  }

  return sel
}

/** Move cursor up one block, trying to preserve offset. */
export function moveUp(doc: Document, sel: Selection): Selection {
  const pos = isCollapsed(sel) ? sel.anchor : getSelectionStart(doc, sel)
  const idx = findBlockIndex(doc, pos.blockId)
  if (idx <= 0) {
    return createCollapsedSelection(doc.blocks[0].id, 0)
  }
  const prevBlock = doc.blocks[idx - 1]
  const maxOffset = getBlockTextLength(prevBlock)
  return createCollapsedSelection(prevBlock.id, Math.min(pos.offset, maxOffset))
}

/** Move cursor down one block, trying to preserve offset. */
export function moveDown(doc: Document, sel: Selection): Selection {
  const pos = isCollapsed(sel) ? sel.anchor : getSelectionEnd(doc, sel)
  const idx = findBlockIndex(doc, pos.blockId)
  if (idx >= doc.blocks.length - 1) {
    const lastBlock = doc.blocks[doc.blocks.length - 1]
    return createCollapsedSelection(lastBlock.id, getBlockTextLength(lastBlock))
  }
  const nextBlock = doc.blocks[idx + 1]
  const maxOffset = getBlockTextLength(nextBlock)
  return createCollapsedSelection(nextBlock.id, Math.min(pos.offset, maxOffset))
}

/** Move cursor to the start of the current block. */
export function moveToStartOfBlock(doc: Document, sel: Selection): Selection {
  return createCollapsedSelection(sel.anchor.blockId, 0)
}

/** Move cursor to the end of the current block. */
export function moveToEndOfBlock(doc: Document, sel: Selection): Selection {
  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return sel
  return createCollapsedSelection(block.id, getBlockTextLength(block))
}

/** Move cursor to the start of the document. */
export function moveToStartOfDocument(doc: Document): Selection {
  return createCollapsedSelection(doc.blocks[0].id, 0)
}

/** Move cursor to the end of the document. */
export function moveToEndOfDocument(doc: Document): Selection {
  const last = doc.blocks[doc.blocks.length - 1]
  return createCollapsedSelection(last.id, getBlockTextLength(last))
}

/** Expand selection to the full word surrounding the cursor. */
export function expandSelectionWord(doc: Document, sel: Selection): Selection {
  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return sel

  const text = getBlockText(block)
  const offset = sel.anchor.offset

  // Find word boundaries
  let start = offset
  let end = offset

  const isWordChar = (ch: string) => /\w/.test(ch)

  while (start > 0 && isWordChar(text[start - 1])) start--
  while (end < text.length && isWordChar(text[end])) end++

  return createSelection(
    createPosition(block.id, start),
    createPosition(block.id, end),
  )
}

/** Insert an inline content segment (mention, emoji) at the current selection. */
export function insertInlineContent(
  doc: Document,
  sel: Selection,
  segment: InlineContent,
): EditorState {
  let d = cloneDocument(doc)
  let s = sel

  if (!isCollapsed(s)) {
    const result = deleteSelection(d, s)
    d = result.doc
    s = result.selection
  }

  const block = findBlockById(d, s.anchor.blockId)
  if (!block) return { doc: d, selection: s }

  block.content = insertSegmentIntoContent(block.content, s.anchor.offset, segment)

  const segLen = segment.type === 'text'
    ? segment.text.length
    : segment.type === 'mention'
    ? segment.label.length
    : segment.type === 'emoji'
    ? segment.unicode.length
    : 0

  return {
    doc: d,
    selection: createCollapsedSelection(block.id, s.anchor.offset + segLen),
  }
}
