import type { ConsentAPI, ConsentConfig } from './types.js'

/**
 * Consent gate.
 *
 * Holds the set of granted consent categories. The router asks the gate, per
 * sink, whether *all* of that sink's required categories are granted before
 * delivering. A sink with no declared categories is always allowed (it is the
 * sink author's responsibility to declare what it needs).
 */
export function createConsent(config?: ConsentConfig): ConsentAPI & {
  /** True when every required category is granted (empty list ⇒ allowed). */
  allows(required?: string[]): boolean
  /** True when at least one sink could receive (used by strict mode). */
  strict: boolean
} {
  const granted = new Set<string>(config?.granted ?? [])

  return {
    strict: config?.strict ?? false,
    grant(...categories: string[]): void {
      for (const c of categories) granted.add(c)
    },
    revoke(...categories: string[]): void {
      for (const c of categories) granted.delete(c)
    },
    granted(): string[] {
      return [...granted]
    },
    isGranted(category: string): boolean {
      return granted.has(category)
    },
    allows(required?: string[]): boolean {
      if (!required || required.length === 0) return true
      return required.every((c) => granted.has(c))
    },
  }
}

export type Consent = ReturnType<typeof createConsent>
