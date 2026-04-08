/** Merge multiple ARIA prop objects, later values override earlier ones */
export function mergeAriaProps(
  ...propSets: Array<Record<string, unknown>>
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const props of propSets) {
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined) {
        result[key] = value
      }
    }
  }
  return result
}

let idCounter = 0

/**
 * Generate a unique ID, safe for SSR (deterministic within a render pass).
 * In browsers, uses crypto.randomUUID when available.
 */
export function generateId(prefix = 'rfr'): string {
  idCounter++
  return `${prefix}-${idCounter}`
}

/** Reset the ID counter (useful for tests) */
export function resetIdCounter(): void {
  idCounter = 0
}
