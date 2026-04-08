import { describe, it, expect, vi } from 'vitest'
import {
  createInlineEditor,
  editorVariants,
  toolbarVariants,
  previewVariants,
} from '../src/index.js'

describe('createInlineEditor', () => {
  it('starts in non-editing state', () => {
    const api = createInlineEditor({ value: 'Hello' })
    expect(api.state.isEditing).toBe(false)
  })

  it('exposes the initial value', () => {
    const api = createInlineEditor({ value: 'Hello' })
    expect(api.state.value).toBe('Hello')
  })

  it('exposes preview matching value', () => {
    const api = createInlineEditor({ value: 'Hello' })
    expect(api.state.preview).toBe('Hello')
  })
})

describe('editing state', () => {
  it('enters editing mode via startEditing', () => {
    const api = createInlineEditor({ value: 'Hello' })
    api.startEditing()
    expect(api.state.isEditing).toBe(true)
  })

  it('resets value to initial on startEditing', () => {
    const api = createInlineEditor({ value: 'Hello' })
    api.updateValue('Changed')
    api.startEditing()
    expect(api.state.value).toBe('Hello')
  })
})

describe('toolbar actions', () => {
  it('provides four toolbar actions', () => {
    const api = createInlineEditor({ value: '' })
    expect(api.toolbarActions).toHaveLength(4)
  })

  it('has bold action with ** syntax', () => {
    const api = createInlineEditor({ value: '' })
    const bold = api.toolbarActions.find((a) => a.name === 'bold')
    expect(bold).toBeDefined()
    expect(bold!.syntax).toBe('**')
  })

  it('has heading action with # syntax', () => {
    const api = createInlineEditor({ value: '' })
    const heading = api.toolbarActions.find((a) => a.name === 'heading')
    expect(heading).toBeDefined()
    expect(heading!.syntax).toBe('# ')
  })

  it('has list action with - syntax', () => {
    const api = createInlineEditor({ value: '' })
    const list = api.toolbarActions.find((a) => a.name === 'list')
    expect(list).toBeDefined()
    expect(list!.syntax).toBe('- ')
  })

  it('has link action with [text](url) syntax', () => {
    const api = createInlineEditor({ value: '' })
    const link = api.toolbarActions.find((a) => a.name === 'link')
    expect(link).toBeDefined()
    expect(link!.syntax).toBe('[text](url)')
  })

  it('insertAtCursor appends syntax to current value', () => {
    const api = createInlineEditor({ value: 'Hello ' })
    api.insertAtCursor('**')
    expect(api.state.value).toBe('Hello **')
  })
})

describe('save and cancel', () => {
  it('save calls onSave with current value', () => {
    const onSave = vi.fn()
    const api = createInlineEditor({ value: 'Hello', onSave })
    api.startEditing()
    api.updateValue('Updated')
    api.save()
    expect(onSave).toHaveBeenCalledWith('Updated')
    expect(api.state.isEditing).toBe(false)
  })

  it('cancel reverts to initial value', () => {
    const onCancel = vi.fn()
    const api = createInlineEditor({ value: 'Hello', onCancel })
    api.startEditing()
    api.updateValue('Changed')
    api.cancel()
    expect(api.state.value).toBe('Hello')
    expect(api.state.isEditing).toBe(false)
    expect(onCancel).toHaveBeenCalled()
  })

  it('updateValue changes the current value', () => {
    const api = createInlineEditor({ value: 'Hello' })
    api.updateValue('World')
    expect(api.state.value).toBe('World')
    expect(api.state.preview).toBe('World')
  })
})

describe('inline editor styles', () => {
  it('exports editor variants', () => {
    const viewing = editorVariants({ state: 'viewing' })
    expect(viewing).toContain('cursor-pointer')
    const editing = editorVariants({ state: 'editing' })
    expect(editing).toContain('rounded-md')
  })

  it('exports toolbar variants', () => {
    const classes = toolbarVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('border-b')
  })

  it('exports preview variants', () => {
    const classes = previewVariants()
    expect(classes).toContain('prose')
  })
})

// ── Additional tests ──

describe('insertAtCursor - toolbar actions', () => {
  it('insertAtCursor appends bold syntax', () => {
    const api = createInlineEditor({ value: 'text ' })
    api.insertAtCursor('**')
    expect(api.state.value).toBe('text **')
  })

  it('insertAtCursor appends heading syntax', () => {
    const api = createInlineEditor({ value: '' })
    api.insertAtCursor('# ')
    expect(api.state.value).toBe('# ')
  })

  it('insertAtCursor appends list syntax', () => {
    const api = createInlineEditor({ value: 'items:\n' })
    api.insertAtCursor('- ')
    expect(api.state.value).toBe('items:\n- ')
  })

  it('insertAtCursor appends link syntax', () => {
    const api = createInlineEditor({ value: 'See ' })
    api.insertAtCursor('[text](url)')
    expect(api.state.value).toBe('See [text](url)')
  })

  it('multiple insertAtCursor calls accumulate', () => {
    const api = createInlineEditor({ value: '' })
    api.insertAtCursor('# ')
    api.insertAtCursor('Title')
    expect(api.state.value).toBe('# Title')
  })

  it('insertAtCursor updates preview', () => {
    const api = createInlineEditor({ value: 'Hello' })
    api.insertAtCursor(' World')
    expect(api.state.preview).toBe('Hello World')
  })
})

describe('cancel restores original value', () => {
  it('cancel after updateValue restores initial value', () => {
    const api = createInlineEditor({ value: 'Original' })
    api.startEditing()
    api.updateValue('Modified')
    expect(api.state.value).toBe('Modified')
    api.cancel()
    expect(api.state.value).toBe('Original')
  })

  it('cancel after multiple updates restores initial value', () => {
    const api = createInlineEditor({ value: 'Start' })
    api.startEditing()
    api.updateValue('Change 1')
    api.updateValue('Change 2')
    api.updateValue('Change 3')
    api.cancel()
    expect(api.state.value).toBe('Start')
  })

  it('cancel sets isEditing to false', () => {
    const api = createInlineEditor({ value: 'Test' })
    api.startEditing()
    expect(api.state.isEditing).toBe(true)
    api.cancel()
    expect(api.state.isEditing).toBe(false)
  })

  it('cancel after insertAtCursor restores initial value', () => {
    const api = createInlineEditor({ value: 'Base' })
    api.startEditing()
    api.insertAtCursor(' extra')
    expect(api.state.value).toBe('Base extra')
    api.cancel()
    expect(api.state.value).toBe('Base')
  })
})

describe('save with empty value', () => {
  it('save with empty string calls onSave with empty string', () => {
    const onSave = vi.fn()
    const api = createInlineEditor({ value: 'Hello', onSave })
    api.startEditing()
    api.updateValue('')
    api.save()
    expect(onSave).toHaveBeenCalledWith('')
  })

  it('save with whitespace calls onSave with whitespace', () => {
    const onSave = vi.fn()
    const api = createInlineEditor({ value: 'Hello', onSave })
    api.startEditing()
    api.updateValue('   ')
    api.save()
    expect(onSave).toHaveBeenCalledWith('   ')
  })
})

describe('editing state toggle', () => {
  it('startEditing sets isEditing to true', () => {
    const api = createInlineEditor({ value: 'Test' })
    expect(api.state.isEditing).toBe(false)
    api.startEditing()
    expect(api.state.isEditing).toBe(true)
  })

  it('save sets isEditing to false', () => {
    const api = createInlineEditor({ value: 'Test', onSave: vi.fn() })
    api.startEditing()
    expect(api.state.isEditing).toBe(true)
    api.save()
    expect(api.state.isEditing).toBe(false)
  })

  it('startEditing resets value to initial each time', () => {
    const api = createInlineEditor({ value: 'Original' })
    api.startEditing()
    api.updateValue('Changed')
    api.save()
    // Start editing again - should reset to initial
    api.startEditing()
    expect(api.state.value).toBe('Original')
  })

  it('multiple start/cancel cycles preserve initial value', () => {
    const api = createInlineEditor({ value: 'Persistent' })
    for (let i = 0; i < 5; i++) {
      api.startEditing()
      api.updateValue(`Change ${i}`)
      api.cancel()
      expect(api.state.value).toBe('Persistent')
    }
  })
})

describe('onSave callback', () => {
  it('onSave receives the latest value after multiple updates', () => {
    const onSave = vi.fn()
    const api = createInlineEditor({ value: 'Init', onSave })
    api.startEditing()
    api.updateValue('Step 1')
    api.updateValue('Step 2')
    api.updateValue('Final')
    api.save()
    expect(onSave).toHaveBeenCalledWith('Final')
  })

  it('save without onSave does not throw', () => {
    const api = createInlineEditor({ value: 'Test' })
    api.startEditing()
    expect(() => api.save()).not.toThrow()
  })
})

describe('onCancel callback', () => {
  it('cancel without onCancel does not throw', () => {
    const api = createInlineEditor({ value: 'Test' })
    api.startEditing()
    expect(() => api.cancel()).not.toThrow()
  })
})
