/**
 * Tests for @refraction-ui/react-rich-editor.
 *
 * The React adapter (`src/index.ts`) is currently an empty stub — the docs site
 * marks Rich Editor as "Coming Soon" and no component exports exist yet. The
 * suite below therefore covers the surface the package has today:
 *
 *   1. the adapter module itself (loads, exports nothing yet), and
 *   2. the headless core (`@refraction-ui/rich-editor`, a declared dependency
 *      of this package) whose API the React adapter will wrap — editor
 *      creation, mark toggling (toolbar-button semantics), markdown keyboard
 *      shortcuts, history, and serialization.
 *
 * When the React component lands, add SSR (`renderToString`) structure/ARIA
 * tests per the repo's adapter-test conventions.
 */
import { describe, it, expect, vi } from 'vitest'
import {
  createEditor,
  createSelection,
  createPosition,
  toggleMark,
  getActiveMarks,
  getBlockText,
  type EditorState,
} from '@refraction-ui/rich-editor'

/** Type text into the editor one character at a time (as a user would). */
function type(editor: ReturnType<typeof createEditor>, text: string) {
  for (const ch of text) editor.insertText(ch)
}

describe('react-rich-editor adapter module', () => {
  it('loads and currently exports no components (coming soon)', async () => {
    const mod = await import('../src/index.js')
    // The adapter is a structured stub; when the component lands this test
    // should be replaced with real adapter tests.
    expect(Object.keys(mod)).toHaveLength(0)
  })
})

describe('createEditor (headless core integration)', () => {
  it('creates an empty editor', () => {
    const editor = createEditor()
    expect(editor.isEmpty()).toBe(true)
    expect(editor.getCharCount()).toBe(0)
    expect(editor.getWordCount()).toBe(0)
    expect(editor.getPlainText()).toBe('')
  })

  it('accepts a placeholder config value', () => {
    // Placeholder is config-only in the core today — the React adapter will
    // render it. Assert the factory accepts it and still starts empty.
    const editor = createEditor({ placeholder: 'Start typing...' })
    expect(editor.isEmpty()).toBe(true)
  })

  it('accepts markdown initial content', () => {
    const editor = createEditor({ initialContent: 'Hello World' })
    expect(editor.getPlainText()).toBe('Hello World')
    expect(editor.getCharCount()).toBe(11)
    expect(editor.getWordCount()).toBe(2)
    expect(editor.isEmpty()).toBe(false)
  })

  it('insertText appends text and updates counts', () => {
    const editor = createEditor()
    type(editor, 'Hi there')
    expect(editor.getPlainText()).toBe('Hi there')
    expect(editor.getCharCount()).toBe(8)
    expect(editor.getWordCount()).toBe(2)
  })

  it('notifies subscribers and onUpdate on every edit', () => {
    const onUpdate = vi.fn()
    const editor = createEditor({ onUpdate })
    const seen: EditorState[] = []
    const unsubscribe = editor.subscribe((state) => seen.push(state))

    editor.insertText('a')
    expect(seen).toHaveLength(1)
    expect(onUpdate).toHaveBeenCalledTimes(1)

    unsubscribe()
    editor.insertText('b')
    expect(seen).toHaveLength(1)
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('readOnly ignores all edits', () => {
    const editor = createEditor({ readOnly: true })
    editor.insertText('nope')
    editor.toggleMark('bold')
    editor.deleteBackward()
    expect(editor.isEmpty()).toBe(true)
    expect(editor.getPlainText()).toBe('')
  })

  it('enforces maxLength', () => {
    const editor = createEditor({ maxLength: 3 })
    editor.insertText('ab')
    editor.insertText('cd')
    expect(editor.getPlainText()).toBe('ab')
  })
})

describe('mark toggling (toolbar-button semantics)', () => {
  /** Select the whole first block of the editor's document. */
  function selectAllOfFirstBlock(editor: ReturnType<typeof createEditor>) {
    const block = editor.getDoc().blocks[0]
    return createSelection(
      createPosition(block.id, 0),
      createPosition(block.id, getBlockText(block).length),
    )
  }

  it('toggleMark applies bold to a range selection', () => {
    const editor = createEditor({ initialContent: 'Hello World' })
    const sel = selectAllOfFirstBlock(editor)
    const result = toggleMark(editor.getDoc(), sel, 'bold')
    expect(getActiveMarks(result.doc, sel).some((m) => m.type === 'bold')).toBe(true)
  })

  it('toggleMark removes bold when applied twice', () => {
    const editor = createEditor({ initialContent: 'Hello World' })
    const sel = selectAllOfFirstBlock(editor)
    const once = toggleMark(editor.getDoc(), sel, 'bold')
    const twice = toggleMark(once.doc, sel, 'bold')
    expect(getActiveMarks(twice.doc, sel).some((m) => m.type === 'bold')).toBe(false)
    // Text content is never altered by mark toggling
    expect(getBlockText(twice.doc.blocks[0])).toBe('Hello World')
  })

  it('toggleMark applies italic to a range selection', () => {
    const editor = createEditor({ initialContent: 'Hello World' })
    const sel = selectAllOfFirstBlock(editor)
    const result = toggleMark(editor.getDoc(), sel, 'italic')
    expect(getActiveMarks(result.doc, sel).some((m) => m.type === 'italic')).toBe(true)
  })

  it('bold and italic stack on the same selection', () => {
    const editor = createEditor({ initialContent: 'Hello World' })
    const sel = selectAllOfFirstBlock(editor)
    const bold = toggleMark(editor.getDoc(), sel, 'bold')
    const both = toggleMark(bold.doc, sel, 'italic')
    const marks = getActiveMarks(both.doc, sel)
    expect(marks.some((m) => m.type === 'bold')).toBe(true)
    expect(marks.some((m) => m.type === 'italic')).toBe(true)
  })

  it('editor.toggleMark is a no-op with a collapsed selection', () => {
    // The caret starts collapsed at the document start; the adapter must pass
    // a real range selection for toolbar buttons to take effect.
    const editor = createEditor({ initialContent: 'Hello' })
    editor.toggleMark('bold')
    expect(editor.getPlainText()).toBe('Hello')
    expect(editor.isMarkActive('bold')).toBe(false)
  })

  it('isMarkActive reflects marks at the caret (button pressed-state)', () => {
    const editor = createEditor({ initialContent: '**Hello**' })
    // Caret is at offset 0 of bold text
    expect(editor.isMarkActive('bold')).toBe(true)
    expect(editor.isMarkActive('italic')).toBe(false)
  })
})

describe('keyboard shortcuts (markdown auto-format while typing)', () => {
  it('"# " converts the block to a level-1 heading', () => {
    const editor = createEditor()
    type(editor, '# ')
    const block = editor.getDoc().blocks[0]
    expect(block.type).toBe('heading')
    expect(block.meta?.level).toBe(1)
    // The shortcut text itself is consumed, not left in the block
    expect(getBlockText(block)).toBe('')
  })

  it('"- " converts the block to a bullet list item', () => {
    const editor = createEditor()
    type(editor, '- ')
    const block = editor.getDoc().blocks[0]
    expect(block.type).toBe('list-item')
    expect(block.meta?.listType).toBe('bullet')
  })

  it('typing **bold** applies a bold mark and consumes the markers', () => {
    const editor = createEditor()
    type(editor, '**bold**')
    expect(editor.getPlainText()).toBe('bold')
    expect(editor.isMarkActive('bold')).toBe(true)
    expect(editor.getMarkdown()).toBe('**bold**')
  })

  it('typing *it* applies an italic mark', () => {
    const editor = createEditor()
    type(editor, '*it*')
    expect(editor.getPlainText()).toBe('it')
    expect(editor.isMarkActive('italic')).toBe(true)
  })

  it('typing [label](url) applies a link mark', () => {
    const editor = createEditor()
    type(editor, '[site](https://example.com)')
    expect(editor.getPlainText()).toBe('site')
    const block = editor.getDoc().blocks[0]
    const linkSeg = block.content.find(
      (s) => s.type === 'text' && s.marks.some((m) => m.type === 'link'),
    )
    expect(linkSeg).toBeDefined()
    if (linkSeg?.type === 'text') {
      const link = linkSeg.marks.find((m) => m.type === 'link')
      expect(link?.attrs?.href).toBe('https://example.com')
    }
  })
})

describe('history (undo/redo shortcut semantics)', () => {
  it('undo reverts an edit and redo reapplies it', () => {
    const editor = createEditor()
    expect(editor.canUndo()).toBe(false)

    editor.insertText('Hi')
    expect(editor.canUndo()).toBe(true)

    editor.undo()
    expect(editor.getPlainText()).toBe('')
    expect(editor.canRedo()).toBe(true)

    editor.redo()
    expect(editor.getPlainText()).toBe('Hi')
  })

  it('a new edit clears the redo stack', () => {
    const editor = createEditor()
    editor.insertText('a')
    editor.undo()
    editor.insertText('b')
    expect(editor.canRedo()).toBe(false)
    expect(editor.getPlainText()).toBe('b')
  })
})

describe('serialization (content the adapter will render)', () => {
  it('getHTML renders bold and italic marks', () => {
    const editor = createEditor({ initialContent: '**bold** and *italic*' })
    const html = editor.getHTML()
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('markdown round-trips through setContent/getMarkdown', () => {
    const editor = createEditor()
    editor.setContent('**Hello** World')
    expect(editor.getMarkdown()).toBe('**Hello** World')
    expect(editor.getPlainText()).toBe('Hello World')
  })
})
