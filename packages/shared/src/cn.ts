/**
 * Lightweight class name utility — our own implementation.
 * Handles conditional classes, arrays, and falsy values.
 * No external dependencies (no clsx, no tailwind-merge).
 *
 * It does NOT resolve Tailwind conflicts: `cn('p-2', 'p-4')` keeps both and
 * the stylesheet order decides. Components therefore keep size-owned
 * utilities (height, text size, padding) out of their cva `base` and only in
 * the matching variant, so a variant prop always wins; a consumer `className`
 * that must beat a component utility can use Tailwind's `!` important
 * modifier (e.g. `!h-7`).
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[]
type ClassRecord = Record<string, boolean | undefined | null>

export function cn(...inputs: Array<ClassValue | ClassRecord>): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue

    if (typeof input === 'string') {
      classes.push(input)
    } else if (typeof input === 'number') {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      const nested = cn(...input)
      if (nested) classes.push(nested)
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}
