/**
 * Lightweight class name utility — our own implementation.
 * Handles conditional classes, arrays, and falsy values.
 * No external dependencies (no clsx, no tailwind-merge).
 *
 * For Tailwind class conflict resolution (e.g., 'p-2 p-4' → 'p-4'),
 * consumers can use @elloloop/tailwind-config which provides
 * a tw-merge-aware variant of this function.
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
