/**
 * Reduced motion utilities.
 * Respects user preferences for reduced motion.
 */

/** Check if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Get animation duration — returns '0ms' if reduced motion preferred */
export function getAnimationDuration(normalDuration: string): string {
  return prefersReducedMotion() ? '0ms' : normalDuration
}
