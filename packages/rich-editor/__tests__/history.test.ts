import { describe, it, expect, beforeEach } from 'vitest'
import { createHistory } from '../src/history.js'
import type { HistoryManager } from '../src/history.js'
import type { EditorState } from '../src/operations.js'
import {
  createDocument,
  createBlock,
  createTextSegment,
  resetBlockIdCounter,
  getBlockText,
} from '../src/model.js'
import { createCollapsedSelection } from '../src/selection.js'

function makeState(text: string): EditorState {
  const block = createBlock('paragraph', [createTextSegment(text)])
  const doc = createDocument([block])
  return {
    doc,
    selection: createCollapsedSelection(block.id, text.length),
  }
}

beforeEach(() => {
  resetBlockIdCounter()
})

describe('history', () => {
  // =========================================================================
  // Basic operations
  // =========================================================================
  describe('basic', () => {
    it('creates empty history', () => {
      const h = createHistory()
      expect(h.canUndo()).toBe(false)
      expect(h.canRedo()).toBe(false)
    })

    it('push adds to undo stack', () => {
      const h = createHistory()
      h.push(makeState('hello'))
      expect(h.canUndo()).toBe(true)
    })

    it('undo returns the previous state', () => {
      const h = createHistory()
      const s1 = makeState('first')
      const s2 = makeState('second')
      h.push(s1)
      h.push(s2)
      const result = h.undo()
      expect(result).not.toBeNull()
      // After undoing s2, we should get s1
      if (result) {
        expect(getBlockText(result.doc.blocks[0])).toBe('first')
      }
    })

    it('redo returns the undone state', () => {
      const h = createHistory()
      const s1 = makeState('first')
      const s2 = makeState('second')
      h.push(s1)
      h.push(s2)
      h.undo()
      const result = h.redo()
      expect(result).not.toBeNull()
      if (result) {
        expect(getBlockText(result.doc.blocks[0])).toBe('second')
      }
    })

    it('undo returns null when stack is empty', () => {
      const h = createHistory()
      expect(h.undo()).toBeNull()
    })

    it('redo returns null when stack is empty', () => {
      const h = createHistory()
      expect(h.redo()).toBeNull()
    })
  })

  // =========================================================================
  // Undo/Redo stack behavior
  // =========================================================================
  describe('stack behavior', () => {
    it('multiple undos traverse the stack', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.push(makeState('c'))

      const r1 = h.undo() // undo c, get b
      expect(r1).not.toBeNull()
      if (r1) expect(getBlockText(r1.doc.blocks[0])).toBe('b')

      const r2 = h.undo() // undo b, get a
      expect(r2).not.toBeNull()
      if (r2) expect(getBlockText(r2.doc.blocks[0])).toBe('a')
    })

    it('redo after multiple undos goes forward', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.push(makeState('c'))

      h.undo() // c -> b
      h.undo() // b -> a

      const r1 = h.redo() // a -> b
      expect(r1).not.toBeNull()
      if (r1) expect(getBlockText(r1.doc.blocks[0])).toBe('b')

      const r2 = h.redo() // b -> c
      expect(r2).not.toBeNull()
      if (r2) expect(getBlockText(r2.doc.blocks[0])).toBe('c')
    })

    it('new edit after undo clears redo stack', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.push(makeState('c'))

      h.undo() // c -> b
      h.push(makeState('d')) // new edit

      expect(h.canRedo()).toBe(false)
    })

    it('canUndo reflects stack state', () => {
      const h = createHistory()
      expect(h.canUndo()).toBe(false)
      h.push(makeState('a'))
      expect(h.canUndo()).toBe(true)
    })

    it('canRedo reflects stack state', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      expect(h.canRedo()).toBe(false)
      h.undo()
      expect(h.canRedo()).toBe(true)
    })

    it('undo then redo then undo', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))

      h.undo()
      h.redo()
      const result = h.undo()
      expect(result).not.toBeNull()
    })
  })

  // =========================================================================
  // Max size
  // =========================================================================
  describe('max size', () => {
    it('enforces max history size', () => {
      const h = createHistory(3)
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.push(makeState('c'))
      h.push(makeState('d'))

      expect(h.size()).toBe(3)
    })

    it('oldest entries are dropped when max is exceeded', () => {
      const h = createHistory(2)
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.push(makeState('c'))

      // Only b and c remain
      const r1 = h.undo() // c -> b
      expect(r1).not.toBeNull()
      if (r1) expect(getBlockText(r1.doc.blocks[0])).toBe('b')

      const r2 = h.undo() // b -> (itself, since it's the only one left)
      // At this point undo returns the last item
      expect(r2).not.toBeNull()
    })

    it('default max size is 100', () => {
      const h = createHistory()
      for (let i = 0; i < 150; i++) {
        h.push(makeState(`state-${i}`))
      }
      expect(h.size()).toBe(100)
    })
  })

  // =========================================================================
  // Clear
  // =========================================================================
  describe('clear', () => {
    it('clears all history', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.clear()
      expect(h.canUndo()).toBe(false)
      expect(h.canRedo()).toBe(false)
      expect(h.size()).toBe(0)
    })

    it('clears both undo and redo stacks', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.undo()
      expect(h.canRedo()).toBe(true)
      h.clear()
      expect(h.canRedo()).toBe(false)
      expect(h.canUndo()).toBe(false)
    })
  })

  // =========================================================================
  // Immutability
  // =========================================================================
  describe('immutability', () => {
    it('push creates a deep copy', () => {
      const h = createHistory()
      const state = makeState('hello')
      h.push(state)

      // Mutate the original
      state.doc.blocks[0].content = [createTextSegment('mutated')]

      const undone = h.undo()
      expect(undone).not.toBeNull()
      if (undone) {
        expect(getBlockText(undone.doc.blocks[0])).toBe('hello')
      }
    })

    it('undo returns a deep copy', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      const r1 = h.undo()
      const r2 = h.redo()
      // They should be separate objects
      if (r1 && r2) {
        expect(r1.doc).not.toBe(r2.doc)
      }
    })
  })

  // =========================================================================
  // Size
  // =========================================================================
  describe('size', () => {
    it('returns 0 for empty history', () => {
      expect(createHistory().size()).toBe(0)
    })

    it('returns correct size after pushes', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      expect(h.size()).toBe(2)
    })

    it('size decreases on undo', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.undo()
      expect(h.size()).toBe(1)
    })

    it('size increases on redo', () => {
      const h = createHistory()
      h.push(makeState('a'))
      h.push(makeState('b'))
      h.undo()
      h.redo()
      expect(h.size()).toBe(2)
    })
  })
})
