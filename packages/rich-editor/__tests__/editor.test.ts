import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createEditor } from '../src/editor.js'
import type { EditorAPI } from '../src/editor.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  resetBlockIdCounter,
  getBlockText,
} from '../src/model.js'

beforeEach(() => {
  resetBlockIdCounter()
})

describe('editor', () => {
  // =========================================================================
  // Creation
  // =========================================================================
  describe('createEditor', () => {
    it('creates editor with default empty document', () => {
      const editor = createEditor()
      expect(editor.getDoc().blocks).toHaveLength(1)
      expect(editor.isEmpty()).toBe(true)
    })

    it('creates editor with initial markdown string', () => {
      const editor = createEditor({ initialContent: '# Hello' })
      expect(editor.getDoc().blocks[0].type).toBe('heading')
    })

    it('creates editor with initial Document object', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('Existing content')]),
      ])
      const editor = createEditor({ initialContent: doc })
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Existing content')
    })

    it('does not mutate the provided initial document', () => {
      const doc = createDocument([
        createBlock('paragraph', [createTextSegment('Original')]),
      ])
      const editor = createEditor({ initialContent: doc })
      editor.insertText('X')
      expect(getBlockText(doc.blocks[0])).toBe('Original')
    })

    it('starts with selection at document start', () => {
      const editor = createEditor()
      const sel = editor.getSelection()
      expect(sel.anchor.offset).toBe(0)
    })
  })

  // =========================================================================
  // Text operations
  // =========================================================================
  describe('insertText', () => {
    it('inserts text into the editor', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Hello')
    })

    it('inserts multiple texts sequentially', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      editor.insertText(' World')
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Hello World')
    })
  })

  describe('deleteBackward', () => {
    it('deletes a character', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      editor.deleteBackward()
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Hell')
    })

    it('does nothing on empty document', () => {
      const editor = createEditor()
      editor.deleteBackward()
      expect(editor.isEmpty()).toBe(true)
    })
  })

  describe('deleteForward', () => {
    it('does nothing when cursor is at end', () => {
      const editor = createEditor()
      editor.insertText('Hi')
      editor.deleteForward()
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Hi')
    })
  })

  // =========================================================================
  // Block operations
  // =========================================================================
  describe('splitBlock', () => {
    it('creates a new block on Enter', () => {
      const editor = createEditor()
      editor.insertText('Line 1')
      editor.splitBlock()
      editor.insertText('Line 2')
      expect(editor.getDoc().blocks).toHaveLength(2)
    })
  })

  describe('changeBlockType', () => {
    it('changes block to heading', () => {
      const editor = createEditor()
      editor.insertText('Title')
      editor.changeBlockType('heading', { level: 1 })
      expect(editor.getDoc().blocks[0].type).toBe('heading')
    })

    it('changes block to blockquote', () => {
      const editor = createEditor()
      editor.changeBlockType('blockquote')
      expect(editor.getDoc().blocks[0].type).toBe('blockquote')
    })
  })

  describe('indentBlock / outdentBlock', () => {
    it('indents a block', () => {
      const editor = createEditor()
      editor.indentBlock()
      expect(editor.getDoc().blocks[0].indent).toBe(1)
    })

    it('outdents a block', () => {
      const editor = createEditor()
      editor.indentBlock()
      editor.indentBlock()
      editor.outdentBlock()
      expect(editor.getDoc().blocks[0].indent).toBe(1)
    })
  })

  // =========================================================================
  // Marks
  // =========================================================================
  describe('toggleMark', () => {
    it('toggles bold (no-op on collapsed selection)', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      editor.toggleMark('bold')
      // With collapsed selection, toggle is a no-op for marks
      expect(editor.getDoc().blocks[0].content[0].type).toBe('text')
    })
  })

  describe('getActiveMarks', () => {
    it('returns empty for plain text', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      expect(editor.getActiveMarks()).toEqual([])
    })
  })

  describe('isMarkActive', () => {
    it('returns false for inactive mark', () => {
      const editor = createEditor()
      expect(editor.isMarkActive('bold')).toBe(false)
    })
  })

  // =========================================================================
  // Serialization
  // =========================================================================
  describe('getMarkdown', () => {
    it('returns markdown representation', () => {
      const editor = createEditor({ initialContent: '# Title' })
      expect(editor.getMarkdown()).toBe('# Title')
    })
  })

  describe('getHTML', () => {
    it('returns HTML representation', () => {
      const editor = createEditor({ initialContent: '# Title' })
      expect(editor.getHTML()).toBe('<h1>Title</h1>')
    })
  })

  describe('getPlainText', () => {
    it('returns plain text', () => {
      const editor = createEditor({ initialContent: '# Title' })
      expect(editor.getPlainText()).toBe('Title')
    })
  })

  describe('setContent', () => {
    it('replaces content with new markdown', () => {
      const editor = createEditor()
      editor.insertText('Old')
      editor.setContent('# New Content')
      expect(editor.getDoc().blocks[0].type).toBe('heading')
    })
  })

  // =========================================================================
  // State queries
  // =========================================================================
  describe('isEmpty', () => {
    it('returns true for empty editor', () => {
      const editor = createEditor()
      expect(editor.isEmpty()).toBe(true)
    })

    it('returns false after inserting text', () => {
      const editor = createEditor()
      editor.insertText('Hi')
      expect(editor.isEmpty()).toBe(false)
    })
  })

  describe('getCharCount', () => {
    it('returns 0 for empty editor', () => {
      const editor = createEditor()
      expect(editor.getCharCount()).toBe(0)
    })

    it('returns character count', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      expect(editor.getCharCount()).toBe(5)
    })

    it('counts across blocks', () => {
      const editor = createEditor({ initialContent: 'Hello\n\nWorld' })
      expect(editor.getCharCount()).toBe(10) // "Hello" + "World"
    })
  })

  describe('getWordCount', () => {
    it('returns 0 for empty editor', () => {
      const editor = createEditor()
      expect(editor.getWordCount()).toBe(0)
    })

    it('returns word count', () => {
      const editor = createEditor()
      editor.insertText('Hello World')
      expect(editor.getWordCount()).toBe(2)
    })
  })

  // =========================================================================
  // History
  // =========================================================================
  describe('undo / redo', () => {
    it('can undo after insert', () => {
      const editor = createEditor()
      editor.insertText('Hello')
      expect(editor.canUndo()).toBe(true)
    })

    it('cannot undo at start', () => {
      const editor = createEditor()
      expect(editor.canUndo()).toBe(false)
    })

    it('undo restores previous state', () => {
      const editor = createEditor()
      editor.insertText('A')
      editor.insertText('B')
      editor.undo()
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('A')
    })

    it('redo after undo', () => {
      const editor = createEditor()
      editor.insertText('A')
      editor.insertText('B')
      editor.undo()
      editor.redo()
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('AB')
    })

    it('canRedo after undo', () => {
      const editor = createEditor()
      editor.insertText('A')
      editor.undo()
      expect(editor.canRedo()).toBe(true)
    })

    it('canRedo is false after new edit', () => {
      const editor = createEditor()
      editor.insertText('A')
      editor.undo()
      editor.insertText('B')
      expect(editor.canRedo()).toBe(false)
    })
  })

  // =========================================================================
  // readOnly mode
  // =========================================================================
  describe('readOnly', () => {
    it('blocks insertText in readOnly mode', () => {
      const editor = createEditor({ readOnly: true })
      editor.insertText('Hello')
      expect(editor.isEmpty()).toBe(true)
    })

    it('blocks deleteBackward in readOnly mode', () => {
      const editor = createEditor({
        initialContent: 'Content',
        readOnly: true,
      })
      editor.deleteBackward()
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Content')
    })

    it('blocks splitBlock in readOnly mode', () => {
      const editor = createEditor({ readOnly: true })
      editor.splitBlock()
      expect(editor.getDoc().blocks).toHaveLength(1)
    })

    it('blocks changeBlockType in readOnly mode', () => {
      const editor = createEditor({
        initialContent: 'Text',
        readOnly: true,
      })
      editor.changeBlockType('heading')
      expect(editor.getDoc().blocks[0].type).toBe('paragraph')
    })

    it('blocks toggleMark in readOnly mode', () => {
      const editor = createEditor({ readOnly: true })
      editor.toggleMark('bold')
      // No crash
    })

    it('allows getMarkdown in readOnly mode', () => {
      const editor = createEditor({ initialContent: '# Title', readOnly: true })
      expect(editor.getMarkdown()).toBe('# Title')
    })
  })

  // =========================================================================
  // maxLength
  // =========================================================================
  describe('maxLength', () => {
    it('blocks insert when exceeding maxLength', () => {
      const editor = createEditor({ maxLength: 5 })
      editor.insertText('Hello')
      editor.insertText(' World')
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Hello')
    })

    it('allows insert within maxLength', () => {
      const editor = createEditor({ maxLength: 10 })
      editor.insertText('Hello')
      expect(getBlockText(editor.getDoc().blocks[0])).toBe('Hello')
    })
  })

  // =========================================================================
  // Events
  // =========================================================================
  describe('subscribe', () => {
    it('calls subscriber on change', () => {
      const editor = createEditor()
      const fn = vi.fn()
      editor.subscribe(fn)
      editor.insertText('Hi')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('unsubscribe stops notifications', () => {
      const editor = createEditor()
      const fn = vi.fn()
      const unsub = editor.subscribe(fn)
      unsub()
      editor.insertText('Hi')
      expect(fn).not.toHaveBeenCalled()
    })

    it('multiple subscribers all get called', () => {
      const editor = createEditor()
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      editor.subscribe(fn1)
      editor.subscribe(fn2)
      editor.insertText('Hi')
      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
    })
  })

  describe('onUpdate callback', () => {
    it('calls onUpdate on change', () => {
      const fn = vi.fn()
      const editor = createEditor({ onUpdate: fn })
      editor.insertText('Hi')
      expect(fn).toHaveBeenCalled()
    })
  })

  // =========================================================================
  // Menus
  // =========================================================================
  describe('slashMenu', () => {
    it('provides a slash menu', () => {
      const editor = createEditor()
      expect(editor.slashMenu).toBeDefined()
      expect(editor.slashMenu.isOpen).toBe(false)
    })
  })

  describe('mentionMenu', () => {
    it('provides a mention menu', () => {
      const editor = createEditor()
      expect(editor.mentionMenu).toBeDefined()
      expect(editor.mentionMenu.isOpen).toBe(false)
    })

    it('uses provided mention options', () => {
      const editor = createEditor({
        mentionOptions: [
          { id: 'u1', label: 'Alice', type: 'user' },
        ],
      })
      editor.mentionMenu.open()
      expect(editor.mentionMenu.filteredOptions).toHaveLength(1)
    })
  })

  // =========================================================================
  // Destroy
  // =========================================================================
  describe('destroy', () => {
    it('clears subscribers and history', () => {
      const editor = createEditor()
      const fn = vi.fn()
      editor.subscribe(fn)
      editor.insertText('Hi')
      editor.destroy()
      editor.insertText('After destroy') // This will still work but shouldn't notify
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================================================
  // getState
  // =========================================================================
  describe('getState', () => {
    it('returns doc and selection', () => {
      const editor = createEditor()
      const state = editor.getState()
      expect(state.doc).toBeDefined()
      expect(state.selection).toBeDefined()
    })
  })
})
