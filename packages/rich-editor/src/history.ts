/**
 * Undo/Redo history manager.
 * Stores snapshots of editor state for undo/redo operations.
 */

import type { EditorState } from './operations.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HistoryManager {
  push(state: EditorState): void
  undo(): EditorState | null
  redo(): EditorState | null
  canUndo(): boolean
  canRedo(): boolean
  clear(): void
  size(): number
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const DEFAULT_MAX_SIZE = 100

export function createHistory(maxSize: number = DEFAULT_MAX_SIZE): HistoryManager {
  let undoStack: EditorState[] = []
  let redoStack: EditorState[] = []

  return {
    push(state: EditorState): void {
      // Deep clone to prevent mutation
      const snapshot = JSON.parse(JSON.stringify(state)) as EditorState
      undoStack.push(snapshot)

      // Enforce max size
      if (undoStack.length > maxSize) {
        undoStack = undoStack.slice(undoStack.length - maxSize)
      }

      // New edit clears the redo stack
      redoStack = []
    },

    undo(): EditorState | null {
      if (undoStack.length === 0) return null
      const state = undoStack.pop()!
      redoStack.push(state)
      if (undoStack.length === 0) return state
      return JSON.parse(JSON.stringify(undoStack[undoStack.length - 1])) as EditorState
    },

    redo(): EditorState | null {
      if (redoStack.length === 0) return null
      const state = redoStack.pop()!
      undoStack.push(state)
      return JSON.parse(JSON.stringify(state)) as EditorState
    },

    canUndo(): boolean {
      return undoStack.length > 0
    },

    canRedo(): boolean {
      return redoStack.length > 0
    },

    clear(): void {
      undoStack = []
      redoStack = []
    },

    size(): number {
      return undoStack.length
    },
  }
}
