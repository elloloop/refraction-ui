import type { AnalyticsProperties } from './types.js'

/**
 * PII redaction.
 *
 * A built-in deny-list of well-known PII key names (email/phone/name and
 * common variants) plus any caller-supplied `redactKeys`. Matching is
 * case-insensitive and substring-based so `userEmail`, `email_address`,
 * `phoneNumber`, `fullName`, etc. are all caught. Redaction recurses into
 * nested objects and arrays so PII cannot hide one level down.
 */

/**
 * Built-in PII deny-list (substring, case-insensitive, separator-insensitive).
 * These match anywhere in a key, so `userEmail`, `email_address`,
 * `phoneNumber`, `firstName`, etc. are all caught.
 */
export const PII_DENY_LIST: readonly string[] = [
  'email',
  'phone',
  'mobile',
  'firstname',
  'lastname',
  'fullname',
  'givenname',
  'surname',
  'password',
  'passwd',
  'ssn',
  'creditcard',
  'cardnumber',
  'cvv',
  'dob',
  'dateofbirth',
  'address',
]

/**
 * Keys that are PII only as an *exact* (normalised) match. `name` belongs
 * here so genuine name fields redact while `username`, `eventName`,
 * `fileName`, `firstName`-style compounds (handled by the deny-list) do not
 * over-redact every key that merely contains "name".
 */
export const PII_EXACT_KEYS: readonly string[] = ['name']

/** Replacement token written in place of a redacted value. */
export const REDACTED = '[REDACTED]'

function normalize(key: string): string {
  return key.toLowerCase().replace(/[_\-\s]/g, '')
}

/**
 * Build a key matcher from the deny-list + extra keys. `extra` entries match
 * exactly (case-insensitive, normalised); deny-list entries match as
 * substrings.
 */
export function createRedactor(extraKeys: string[] = []) {
  const exact = new Set([
    ...extraKeys.map(normalize),
    ...PII_EXACT_KEYS.map(normalize),
  ])
  const deny = PII_DENY_LIST.map(normalize)

  const shouldRedact = (key: string): boolean => {
    const n = normalize(key)
    if (exact.has(n)) return true
    return deny.some((d) => n.includes(d))
  }

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(walk)
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = shouldRedact(k) ? REDACTED : walk(v)
      }
      return out
    }
    return value
  }

  return {
    shouldRedact,
    /** Redact a properties/traits bag (returns a new object). */
    redact(props?: AnalyticsProperties): AnalyticsProperties | undefined {
      if (!props) return props
      return walk(props) as AnalyticsProperties
    },
  }
}

export type Redactor = ReturnType<typeof createRedactor>
