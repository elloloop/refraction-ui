/**
 * Core data model for the rich text editor.
 * Document is a tree of blocks, each containing inline content segments.
 */

// ---------------------------------------------------------------------------
// Block types
// ---------------------------------------------------------------------------
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'blockquote'
  | 'code-block'
  | 'list-item'
  | 'divider'
  | 'image'

export type HeadingLevel = 1 | 2 | 3

// ---------------------------------------------------------------------------
// Inline content
// ---------------------------------------------------------------------------
export type MarkType = 'bold' | 'italic' | 'strikethrough' | 'code' | 'underline' | 'link'

export interface Mark {
  type: MarkType
  attrs?: Record<string, string>
}

export interface TextSegment {
  type: 'text'
  text: string
  marks: Mark[]
}

export interface MentionSegment {
  type: 'mention'
  id: string
  label: string
}

export interface EmojiSegment {
  type: 'emoji'
  shortcode: string
  unicode: string
}

export type InlineContent = TextSegment | MentionSegment | EmojiSegment

// ---------------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------------
export interface Block {
  id: string
  type: BlockType
  content: InlineContent[]
  meta?: Record<string, unknown>
  indent?: number
  children?: Block[]
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------
export interface Document {
  blocks: Block[]
  version: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let _idCounter = 0

export function generateBlockId(): string {
  _idCounter++
  return `block-${_idCounter}`
}

export function resetBlockIdCounter(): void {
  _idCounter = 0
}

export function createTextSegment(text: string, marks: Mark[] = []): TextSegment {
  return { type: 'text', text, marks }
}

export function createMentionSegment(id: string, label: string): MentionSegment {
  return { type: 'mention', id, label }
}

export function createEmojiSegment(shortcode: string, unicode: string): EmojiSegment {
  return { type: 'emoji', shortcode, unicode }
}

export function createBlock(
  type: BlockType = 'paragraph',
  content: InlineContent[] = [],
  meta?: Record<string, unknown>,
): Block {
  return {
    id: generateBlockId(),
    type,
    content: content.length === 0 ? [createTextSegment('')] : content,
    ...(meta ? { meta } : {}),
  }
}

export function createDocument(blocks?: Block[]): Document {
  return {
    blocks: blocks && blocks.length > 0 ? blocks : [createBlock('paragraph')],
    version: 1,
  }
}

/** Get the full plain text length of a block's inline content. */
export function getBlockTextLength(block: Block): number {
  let len = 0
  for (const seg of block.content) {
    if (seg.type === 'text') {
      len += seg.text.length
    } else if (seg.type === 'mention') {
      len += seg.label.length
    } else if (seg.type === 'emoji') {
      len += seg.unicode.length
    }
  }
  return len
}

/** Get the full plain text of a block's inline content. */
export function getBlockText(block: Block): string {
  let text = ''
  for (const seg of block.content) {
    if (seg.type === 'text') {
      text += seg.text
    } else if (seg.type === 'mention') {
      text += seg.label
    } else if (seg.type === 'emoji') {
      text += seg.unicode
    }
  }
  return text
}

/** Find a block by its id. */
export function findBlockById(doc: Document, blockId: string): Block | undefined {
  for (const block of doc.blocks) {
    if (block.id === blockId) return block
    if (block.children) {
      for (const child of block.children) {
        if (child.id === blockId) return child
      }
    }
  }
  return undefined
}

/** Find the index of a block by its id. Returns -1 if not found at top level. */
export function findBlockIndex(doc: Document, blockId: string): number {
  return doc.blocks.findIndex((b) => b.id === blockId)
}

/** Deep clone a document. */
export function cloneDocument(doc: Document): Document {
  return JSON.parse(JSON.stringify(doc)) as Document
}

/** Deep clone a block. */
export function cloneBlock(block: Block): Block {
  return JSON.parse(JSON.stringify(block)) as Block
}

/** Check that marks are equal (order-insensitive). */
export function marksEqual(a: Mark[], b: Mark[]): boolean {
  if (a.length !== b.length) return false
  for (const markA of a) {
    const found = b.find(
      (markB) =>
        markB.type === markA.type &&
        JSON.stringify(markB.attrs ?? {}) === JSON.stringify(markA.attrs ?? {}),
    )
    if (!found) return false
  }
  return true
}

/** Normalize a block's inline content — merge adjacent text segments with identical marks. */
export function normalizeContent(content: InlineContent[]): InlineContent[] {
  const result: InlineContent[] = []
  for (const seg of content) {
    if (seg.type === 'text' && seg.text === '' && content.length > 1) {
      continue // skip empty text segments unless it's the only one
    }
    const last = result[result.length - 1]
    if (seg.type === 'text' && last && last.type === 'text' && marksEqual(last.marks, seg.marks)) {
      last.text += seg.text
    } else {
      result.push({ ...seg, ...(seg.type === 'text' ? { marks: [...seg.marks] } : {}) })
    }
  }
  if (result.length === 0) {
    return [createTextSegment('')]
  }
  return result
}
