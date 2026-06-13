/**
 * Headless core for floating emoji reactions.
 *
 * An emoji burst overlay where reactions animate upward and fade — distinct
 * from the static reaction-bar (which shows counts). This module is JSX-free
 * and framework-agnostic; adapters consume it and manage timing with
 * REACTION_LIFETIME_MS.
 */

/** A single transient reaction displayed in the overlay. */
export interface FloatingReaction {
  /** Stable unique id assigned by the adapter (used as React key / tracker). */
  id: string
  /** The emoji character(s) to display, e.g. '👋' or '❤️'. */
  emoji: string
  /**
   * Horizontal offset bucket (0-indexed). Adapters use laneOffsetPercent() to
   * convert this into a CSS left % so multiple reactions spread across the
   * overlay rather than stacking.
   */
  lane?: number
}

/**
 * How long (ms) a floating reaction should live before the adapter removes it.
 * Use this constant in adapters to drive setTimeout-based auto-expiry so the
 * value stays in sync with the CSS animation duration.
 */
export const REACTION_LIFETIME_MS = 3000

/**
 * Compute the horizontal left-offset percentage for a given lane bucket.
 *
 * Pure and deterministic — safe to call in tests and SSR.
 *
 * @param lane  Zero-indexed lane number (clamped to [0, lanes-1]).
 * @param lanes Total number of lanes (default 5).
 * @returns A percentage value in [0, 100].
 *
 * @example
 * laneOffsetPercent(0, 5) // 10
 * laneOffsetPercent(2, 5) // 50
 * laneOffsetPercent(4, 5) // 90
 */
export function laneOffsetPercent(lane = 0, lanes = 5): number {
  if (lanes <= 0) return 50
  const clamped = Math.max(0, Math.min(lane, lanes - 1))
  // Divide [0,100] into `lanes` equal buckets and return the centre of each.
  const step = 100 / lanes
  return step * clamped + step / 2
}

export interface FloatingReactionsAriaProps {
  role: string
  'aria-live': 'polite' | 'assertive' | 'off'
  'aria-label': string
}

export interface FloatingReactionsAPI {
  /** ARIA attributes to spread on the overlay container. */
  ariaProps: FloatingReactionsAriaProps
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic accessibility and data props for the overlay
 * container.
 *
 * The overlay is a `role="status"` live region so screen readers announce
 * incoming reactions without interrupting the user (polite).
 */
export function createFloatingReactions(): FloatingReactionsAPI {
  const ariaProps: FloatingReactionsAriaProps = {
    role: 'status',
    'aria-live': 'polite',
    'aria-label': 'Reactions',
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'floating-reactions',
  }

  return { ariaProps, dataAttributes }
}
