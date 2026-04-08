import * as React from 'react'
import {
  createInlineEditor,
  editorVariants,
  toolbarVariants,
  previewVariants,
  type InlineEditorProps as CoreProps,
} from '@refraction-ui/inline-editor'
import { cn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// InlineEditor
// ---------------------------------------------------------------------------

export interface InlineEditorProps {
  value: string
  onSave?: (value: string) => void
  onCancel?: () => void
  className?: string
}

export function InlineEditor({
  value: initialValue,
  onSave,
  onCancel,
  className,
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(initialValue)

  const apiRef = React.useRef<ReturnType<typeof createInlineEditor> | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createInlineEditor({ value: initialValue, onSave, onCancel })
  }
  const api = apiRef.current

  const handleStartEditing = React.useCallback(() => {
    setIsEditing(true)
    setEditValue(initialValue)
  }, [initialValue])

  const handleCancel = React.useCallback(() => {
    setIsEditing(false)
    setEditValue(initialValue)
    onCancel?.()
  }, [initialValue, onCancel])

  const handleSave = React.useCallback(() => {
    setIsEditing(false)
    onSave?.(editValue)
  }, [editValue, onSave])

  const handleInsert = React.useCallback(
    (syntax: string) => {
      setEditValue((prev) => prev + syntax)
    },
    [],
  )

  // View mode
  if (!isEditing) {
    return React.createElement(
      'div',
      {
        className: cn(editorVariants({ state: 'viewing' }), className),
        onClick: handleStartEditing,
        role: 'button',
        tabIndex: 0,
        'aria-label': 'Click to edit',
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleStartEditing()
          }
        },
      },
      React.createElement('div', { className: previewVariants() }, editValue || initialValue),
    )
  }

  // Edit mode
  return React.createElement(
    'div',
    {
      className: cn(editorVariants({ state: 'editing' }), className),
    },
    // Toolbar
    React.createElement(
      'div',
      { className: toolbarVariants(), role: 'toolbar', 'aria-label': 'Formatting toolbar' },
      ...api.toolbarActions.map((action) =>
        React.createElement(
          'button',
          {
            key: action.name,
            type: 'button',
            onClick: () => handleInsert(action.syntax),
            'aria-label': action.name,
            'data-action': action.name,
          },
          action.name,
        ),
      ),
    ),
    // Editor area: side-by-side textarea + preview
    React.createElement(
      'div',
      { className: 'flex gap-2 p-2' },
      React.createElement('textarea', {
        value: editValue,
        onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setEditValue(e.target.value),
        className: 'flex-1 min-h-[100px] resize-y border rounded p-2',
        'aria-label': 'Editor content',
      }),
      React.createElement(
        'div',
        {
          className: cn('flex-1', previewVariants()),
          'aria-label': 'Preview',
        },
        editValue,
      ),
    ),
    // Action buttons
    React.createElement(
      'div',
      { className: 'flex justify-end gap-2 p-2 border-t' },
      React.createElement(
        'button',
        { type: 'button', onClick: handleCancel },
        'Cancel',
      ),
      React.createElement(
        'button',
        { type: 'button', onClick: handleSave },
        'Save',
      ),
    ),
  )
}

InlineEditor.displayName = 'InlineEditor'
