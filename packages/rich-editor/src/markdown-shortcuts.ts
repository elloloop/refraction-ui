/**
 * Markdown shortcuts — auto-convert markdown syntax as the user types.
 *
 * Block shortcuts trigger at the start of a block (e.g. "# " -> heading).
 * Inline shortcuts trigger when a closing marker completes a pair (e.g. "**text**" -> bold).
 */

import type { Document, Block, Mark, MarkType, BlockType } from './model.js'
import type { Selection } from './selection.js'
import type { EditorState } from './operations.js'
import {
  findBlockById,
  getBlockText,
  createTextSegment,
  normalizeContent,
  cloneDocument,
} from './model.js'
import { createCollapsedSelection, isCollapsed } from './selection.js'
import { changeBlockType } from './operations.js'

// ---------------------------------------------------------------------------
// Block shortcuts
// ---------------------------------------------------------------------------

interface BlockShortcut {
  pattern: RegExp
  type: BlockType
  meta?: Record<string, unknown>
}

const BLOCK_SHORTCUTS: BlockShortcut[] = [
  { pattern: /^### $/, type: 'heading', meta: { level: 3 } },
  { pattern: /^## $/, type: 'heading', meta: { level: 2 } },
  { pattern: /^# $/, type: 'heading', meta: { level: 1 } },
  { pattern: /^- $/, type: 'list-item', meta: { listType: 'bullet' } },
  { pattern: /^\* $/, type: 'list-item', meta: { listType: 'bullet' } },
  { pattern: /^1\. $/, type: 'list-item', meta: { listType: 'ordered' } },
  { pattern: /^> $/, type: 'blockquote' },
  { pattern: /^```$/, type: 'code-block' },
  { pattern: /^---$/, type: 'divider' },
]

function tryBlockShortcut(
  doc: Document,
  sel: Selection,
  char: string,
): { doc: Document; sel: Selection; consumed: boolean } | null {
  if (!isCollapsed(sel)) return null

  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block || block.type !== 'paragraph') return null

  const text = getBlockText(block)
  const textBeforeCursor = text.slice(0, sel.anchor.offset) + char

  for (const shortcut of BLOCK_SHORTCUTS) {
    if (shortcut.pattern.test(textBeforeCursor)) {
      const d = cloneDocument(doc)
      const b = d.blocks.find((bl) => bl.id === block.id)!

      // Clear the shortcut text
      b.content = [createTextSegment('')]

      // Special case for code-block — the ``` doesn't need the trailing space
      // and divider --- is also self-contained
      b.type = shortcut.type
      if (shortcut.meta) {
        b.meta = { ...shortcut.meta }
      }

      if (shortcut.type === 'divider') {
        b.content = [createTextSegment('')]
      }

      return {
        doc: d,
        sel: createCollapsedSelection(b.id, 0),
        consumed: true,
      }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Inline shortcuts
// ---------------------------------------------------------------------------

interface InlineShortcut {
  openMarker: string
  closeMarker: string
  markType: MarkType
}

const INLINE_SHORTCUTS: InlineShortcut[] = [
  { openMarker: '**', closeMarker: '**', markType: 'bold' },
  { openMarker: '__', closeMarker: '__', markType: 'bold' },
  { openMarker: '*', closeMarker: '*', markType: 'italic' },
  { openMarker: '_', closeMarker: '_', markType: 'italic' },
  { openMarker: '~~', closeMarker: '~~', markType: 'strikethrough' },
  { openMarker: '`', closeMarker: '`', markType: 'code' },
]

/**
 * Try to match an inline shortcut like **bold** or *italic*.
 * We look at the text before the cursor + the new char, and see if it
 * completes a matched pair of markers with content between them.
 */
function tryInlineShortcut(
  doc: Document,
  sel: Selection,
  char: string,
): { doc: Document; sel: Selection; consumed: boolean } | null {
  if (!isCollapsed(sel)) return null

  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return null

  const text = getBlockText(block)
  const textWithChar = text.slice(0, sel.anchor.offset) + char

  // Check each inline shortcut — longer markers first (already sorted)
  for (const shortcut of INLINE_SHORTCUTS) {
    const { openMarker, closeMarker, markType } = shortcut

    // Check if textWithChar ends with the close marker
    if (!textWithChar.endsWith(closeMarker)) continue

    // Find the matching open marker before the close marker
    const beforeClose = textWithChar.slice(0, textWithChar.length - closeMarker.length)

    // For single-char markers like * and _, we need to be careful not to
    // confuse with the double-char ** and __ markers.
    // The open marker should not be preceded by the same character (to avoid ** matching as two *).
    const openIdx = beforeClose.lastIndexOf(openMarker)
    if (openIdx === -1) continue

    // Make sure there's content between the markers
    const content = beforeClose.slice(openIdx + openMarker.length)
    if (content.length === 0) continue

    // For single-char markers, check that the char before the open marker isn't the same
    // (to avoid **text** being matched by the * shortcut on the inner *)
    if (openMarker.length === 1 && openIdx > 0 && beforeClose[openIdx - 1] === openMarker) continue

    // We have a valid match! Replace the markers with marked content.
    const d = cloneDocument(doc)
    const b = d.blocks.find((bl) => bl.id === block.id)!

    const beforeMarkerText = text.slice(0, openIdx)
    const afterCursorText = text.slice(sel.anchor.offset)

    const mark: Mark = { type: markType }
    const segments = [
      ...(beforeMarkerText ? [createTextSegment(beforeMarkerText)] : []),
      createTextSegment(content, [mark]),
      ...(afterCursorText ? [createTextSegment(afterCursorText)] : []),
    ]

    b.content = normalizeContent(segments)

    const newOffset = openIdx + content.length
    return {
      doc: d,
      sel: createCollapsedSelection(b.id, newOffset),
      consumed: true,
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Link shortcut: [text](url)
// ---------------------------------------------------------------------------
function tryLinkShortcut(
  doc: Document,
  sel: Selection,
  char: string,
): { doc: Document; sel: Selection; consumed: boolean } | null {
  if (!isCollapsed(sel) || char !== ')') return null

  const block = findBlockById(doc, sel.anchor.blockId)
  if (!block) return null

  const text = getBlockText(block)
  const textWithChar = text.slice(0, sel.anchor.offset) + char

  // Look for [text](url) pattern ending at cursor
  const match = textWithChar.match(/\[([^\]]+)\]\(([^)]+)\)$/)
  if (!match) return null

  const fullMatch = match[0]
  const linkText = match[1]
  const linkUrl = match[2]

  const d = cloneDocument(doc)
  const b = d.blocks.find((bl) => bl.id === block.id)!

  const matchStart = textWithChar.length - fullMatch.length
  const beforeText = text.slice(0, matchStart)
  const afterText = text.slice(sel.anchor.offset)

  const mark: Mark = { type: 'link', attrs: { href: linkUrl } }
  const segments = [
    ...(beforeText ? [createTextSegment(beforeText)] : []),
    createTextSegment(linkText, [mark]),
    ...(afterText ? [createTextSegment(afterText)] : []),
  ]

  b.content = normalizeContent(segments)

  const newOffset = matchStart + linkText.length
  return {
    doc: d,
    sel: createCollapsedSelection(b.id, newOffset),
    consumed: true,
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Process a character input and check if it triggers a markdown shortcut.
 * Returns { consumed: true } if a shortcut was applied, { consumed: false } otherwise.
 */
export function processMarkdownShortcut(
  doc: Document,
  sel: Selection,
  char: string,
): { doc: Document; sel: Selection; consumed: boolean } {
  // Try block shortcuts first (they require a space or specific ending)
  const blockResult = tryBlockShortcut(doc, sel, char)
  if (blockResult) return blockResult

  // Try link shortcut
  const linkResult = tryLinkShortcut(doc, sel, char)
  if (linkResult) return linkResult

  // Try inline shortcuts
  const inlineResult = tryInlineShortcut(doc, sel, char)
  if (inlineResult) return inlineResult

  return { doc, sel, consumed: false }
}
