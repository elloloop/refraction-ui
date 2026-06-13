import * as React from 'react'
import {
  createTerminal,
  terminalVariants,
  terminalLineVariants,
  terminalPromptClass,
  type TerminalLine,
} from '@refraction-ui/terminal'
import { cn } from '@refraction-ui/shared'

export type { TerminalLine, TerminalLineKind } from '@refraction-ui/terminal'

/** Height cap for the scrollable terminal surface. */
export type TerminalMaxHeight = 'sm' | 'md' | 'lg' | 'none'

export interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lines to render in order. Each line's `kind` determines its styling. */
  lines: TerminalLine[]
  /**
   * Prompt symbol prepended to `command` lines.
   * @default '$'
   */
  promptSymbol?: string
  /**
   * Maximum height of the scroll region before it becomes scrollable.
   * @default 'md'
   */
  maxHeight?: TerminalMaxHeight
  /** Accessible label for the live region (e.g. `'Run output'`). */
  'aria-label'?: string
}

/**
 * Terminal — a read-only output console panel.
 *
 * Renders a monospaced scroll region (`role="log"`, `aria-live="polite"`) with
 * each line styled by its semantic kind:
 * - `command` — foreground bold, prefixed with the prompt symbol
 * - `stdout`  — foreground
 * - `stderr`  — destructive (error token)
 * - `info`    — muted-foreground
 * - `success` — emerald / success token
 *
 * This is a presentational component — it has no internal state and does not
 * handle keyboard input (v1). Pass new lines from the parent to stream output.
 */
export const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  (
    {
      lines,
      promptSymbol = '$',
      maxHeight = 'md',
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const api = createTerminal({ label: ariaLabel })

    return (
      <div
        ref={ref}
        className={cn(terminalVariants({ maxHeight }), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {lines.map((line, index) => {
          const key = line.id ?? index
          return (
            <span key={key} className={terminalLineVariants({ kind: line.kind })}>
              {line.kind === 'command' ? (
                <>
                  <span className={terminalPromptClass}>{promptSymbol}</span>
                  {line.text}
                </>
              ) : (
                line.text
              )}
            </span>
          )
        })}
      </div>
    )
  },
)

Terminal.displayName = 'Terminal'
