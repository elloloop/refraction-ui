/** The semantic kind of a terminal output line. */
export type TerminalLineKind = 'command' | 'stdout' | 'stderr' | 'info' | 'success'

/** A single line displayed in the terminal output panel. */
export interface TerminalLine {
  /** Optional stable key for list rendering. */
  id?: string
  /** Semantic kind — drives styling and screen-reader announcements. */
  kind: TerminalLineKind
  /** Text content of the line. */
  text: string
}

export interface TerminalAPI {
  /**
   * ARIA attributes to spread on the terminal container element.
   * - `role="log"` semantics: assistive technologies announce appended content.
   * - `aria-live="polite"` so new output does not interrupt the user mid-action.
   */
  ariaProps: {
    role: 'log'
    'aria-live': 'polite'
    'aria-label'?: string
  }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the prompt string shown before a command line.
 *
 * @param promptSymbol - The shell prompt character(s), e.g. `'$'` or `'❯'`.
 * @param command - The command text that follows the prompt.
 * @returns The formatted prompt string, e.g. `'$ python solution.py'`.
 */
export function formatPrompt(promptSymbol: string, command: string): string {
  return `${promptSymbol} ${command}`
}

/**
 * Build the framework-agnostic ARIA and data props for a terminal output panel.
 *
 * Returns `role="log"` (live region semantics for streaming output) plus data
 * attributes; adapters spread these onto their scroll container.
 */
export function createTerminal(options: { label?: string } = {}): TerminalAPI {
  const ariaProps: TerminalAPI['ariaProps'] = {
    role: 'log',
    'aria-live': 'polite',
  }
  if (options.label) {
    ariaProps['aria-label'] = options.label
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'terminal',
  }

  return { ariaProps, dataAttributes }
}
