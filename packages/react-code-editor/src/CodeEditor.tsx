import * as React from 'react'
import {
  createCodeEditor,
  codeEditorVariants,
  type CodeEditorTheme,
} from '@elloloop/code-editor'
import { cn } from '@elloloop/shared'

export interface CodeEditorProps {
  value?: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  theme?: CodeEditorTheme
  className?: string
  placeholder?: string
  /** Optional action buttons rendered in the header bar */
  actions?: Array<{ label: string; onClick: () => void }>
}

/**
 * CodeEditor component — a styled textarea-based code editor.
 *
 * Uses the headless @elloloop/code-editor core for state and ARIA.
 * Renders a simple monospace textarea with a header bar showing the language
 * label and optional action buttons. Syntax highlighting is a future enhancement.
 */
export const CodeEditor = React.forwardRef<HTMLDivElement, CodeEditorProps>(
  (
    {
      value = '',
      onChange,
      language = 'plaintext',
      readOnly = false,
      theme = 'light',
      className,
      placeholder,
      actions,
    },
    ref,
  ) => {
    const api = createCodeEditor({ value, onChange, language, readOnly, theme })
    const containerClasses = cn(codeEditorVariants({ theme }), className)

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      api.setValue(e.target.value)
    }

    return (
      <div ref={ref} className={containerClasses} {...api.dataAttributes}>
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50 text-xs text-muted-foreground">
          <span>{api.getLanguageLabel()}</span>
          {actions && actions.length > 0 && (
            <div className="flex gap-1">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="px-2 py-1 rounded text-xs hover:bg-muted transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <textarea
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono min-h-[200px]"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          {...api.ariaProps}
        />
      </div>
    )
  },
)

CodeEditor.displayName = 'CodeEditor'
