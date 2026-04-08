export interface InlineEditorProps {
  /** Current value */
  value: string
  /** Callback when saving */
  onSave?: (value: string) => void
  /** Callback when cancelling */
  onCancel?: () => void
}

export interface ToolbarAction {
  name: string
  syntax: string
}

export interface InlineEditorState {
  isEditing: boolean
  value: string
  preview: string
}

export interface InlineEditorAPI {
  /** Current editor state */
  state: InlineEditorState
  /** Enter editing mode */
  startEditing(): void
  /** Cancel editing, revert to original value */
  cancel(): void
  /** Save the current value */
  save(): void
  /** Update the editing value */
  updateValue(value: string): void
  /** Insert syntax at cursor position */
  insertAtCursor(syntax: string): void
  /** Available toolbar actions */
  toolbarActions: ToolbarAction[]
}

export function createInlineEditor(props: InlineEditorProps): InlineEditorAPI {
  const { value: initialValue, onSave, onCancel } = props

  let isEditing = false
  let currentValue = initialValue

  const toolbarActions: ToolbarAction[] = [
    { name: 'bold', syntax: '**' },
    { name: 'heading', syntax: '# ' },
    { name: 'list', syntax: '- ' },
    { name: 'link', syntax: '[text](url)' },
  ]

  function startEditing(): void {
    isEditing = true
    currentValue = initialValue
  }

  function cancel(): void {
    isEditing = false
    currentValue = initialValue
    onCancel?.()
  }

  function save(): void {
    isEditing = false
    onSave?.(currentValue)
  }

  function updateValue(value: string): void {
    currentValue = value
  }

  function insertAtCursor(syntax: string): void {
    currentValue = currentValue + syntax
  }

  return {
    get state(): InlineEditorState {
      return {
        get isEditing() {
          return isEditing
        },
        get value() {
          return currentValue
        },
        get preview() {
          return currentValue
        },
      }
    },
    startEditing,
    cancel,
    save,
    updateValue,
    insertAtCursor,
    toolbarActions,
  }
}
