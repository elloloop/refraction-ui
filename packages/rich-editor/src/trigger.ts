/**
 * Generalized trigger detection shared by mentions, slash commands, and any
 * symbol-prefixed autocomplete (e.g. the composer's trigger engine).
 *
 * One implementation exists so the boundary rules ("alice@example.com" never
 * triggers, a query never spans whitespace) cannot drift between features.
 */

export interface TriggerHit {
  triggered: boolean
  query: string
  /** Index of the trigger symbol's first character in `text`. */
  start: number
}

/**
 * Scan backward from `caret` for the nearest occurrence of `triggerChar` that
 * is preceded by start-of-text or whitespace and followed by a whitespace-free
 * query running up to the caret. Returns `null` when no live trigger exists.
 *
 * `triggerChar` may be longer than one character (e.g. `!!`); the boundary is
 * checked against the character before its first character.
 */
export function detectTriggerInText(
  text: string,
  caret: number,
  triggerChar: string,
): TriggerHit | null {
  if (triggerChar.length === 0) return null
  const before = text.slice(0, caret)
  const idx = before.lastIndexOf(triggerChar)
  if (idx === -1) return null
  // Boundary rule: only start-of-text or whitespace may precede the symbol,
  // so mid-word occurrences (emails, "and/or") never arm.
  if (idx > 0 && !/\s/.test(before[idx - 1])) return null
  const query = before.slice(idx + triggerChar.length)
  // A query never spans whitespace — a space closes the trigger.
  if (/\s/.test(query)) return null
  return { triggered: true, query, start: idx }
}
