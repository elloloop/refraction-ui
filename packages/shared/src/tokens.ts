/** Defines the CSS custom properties a component reads */
export interface TokenContract {
  /** Component name */
  name: string
  /** Map of token name → CSS custom property info */
  tokens: Record<string, TokenDefinition>
}

export interface TokenDefinition {
  /** CSS custom property name (e.g., '--rfr-button-bg') */
  variable: string
  /** Fallback value when the variable is not set */
  fallback: string
  /** Description of what this token controls */
  description?: string
}
