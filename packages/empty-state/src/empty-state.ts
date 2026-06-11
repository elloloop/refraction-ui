export type EmptyStateTone = 'neutral' | 'success' | 'warning' | 'danger'

export interface EmptyStateOptions {
  /** Tone that tints the icon chip. Defaults to `neutral`. */
  tone?: EmptyStateTone
}

export interface EmptyStateAPI {
  /** Data attributes for CSS styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Headless EmptyState core — JSX-free. Resolves the tone into the data
 * attributes that adapters spread onto the root element.
 */
export function createEmptyState(options: EmptyStateOptions = {}): EmptyStateAPI {
  const { tone = 'neutral' } = options

  const dataAttributes: Record<string, string> = {
    'data-tone': tone,
  }

  return {
    dataAttributes,
  }
}
