import type { LogContext } from './types.js'

/**
 * Deep-strip any object key whose name (case-insensitive) is in `keys`.
 * Arrays are walked; cycles are guarded; non-matching values pass through
 * unchanged. Returns a new structure — the input is never mutated.
 */
export function redact(value: LogContext, keys: string[]): LogContext {
  if (keys.length === 0) return value
  const lookup = new Set(keys.map((k) => k.toLowerCase()))
  return walk(value, lookup, new WeakSet()) as LogContext
}

function walk(value: unknown, keys: Set<string>, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') return value

  if (seen.has(value as object)) return '[Circular]'
  seen.add(value as object)

  if (Array.isArray(value)) {
    return value.map((item) => walk(item, keys, seen))
  }

  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (keys.has(k.toLowerCase())) {
      out[k] = '[REDACTED]'
      continue
    }
    out[k] = walk(v, keys, seen)
  }
  return out
}
