import {
  createButton,
  resolveButtonVariant,
  type ButtonSize,
  type ButtonVariant,
} from '@refraction-ui/button'
import { resolveIconButtonTapTarget } from '@refraction-ui/icon-button'
import type { AccessibilityProps } from '@refraction-ui/shared'

/** Accessible name of the caret when the caller supplies none. */
export const SPLIT_BUTTON_DEFAULT_MENU_LABEL = 'More options'

/** A split button is usually the primary call to action of its row. */
export const SPLIT_BUTTON_DEFAULT_VARIANT: ButtonVariant = 'default'

export const SPLIT_BUTTON_DEFAULT_SIZE: ButtonSize = 'default'

/**
 * How the two parts are separated. Bordered variants share one border (the
 * caret overlaps the action's end border); every other variant gets a hairline
 * in a translucent tint of its own text colour, so the line follows the
 * variant's tokens instead of a fixed colour.
 */
export type SplitButtonDivider = 'shared-border' | 'hairline'

export type SplitButtonDirection = 'ltr' | 'rtl'

/**
 * Menu alignment in logical terms: `end` lines the menu's end edge up with the
 * caret's end edge, whichever side that is in the current writing direction.
 */
export type SplitButtonMenuAlign = 'start' | 'center' | 'end'

/** Menus open under the control and stay within its end edge by default. */
export const SPLIT_BUTTON_DEFAULT_MENU_ALIGN: SplitButtonMenuAlign = 'end'

/** What a key press on the caret should do, if anything beyond the native button. */
export type SplitButtonTriggerKeyIntent = 'open' | null

const VARIANTS_WITH_BORDER: ReadonlySet<ButtonVariant> = new Set<ButtonVariant>(['outline'])

/** A blank or missing label falls back to "More options", so the caret is never unnamed. */
export function resolveSplitButtonMenuLabel(label: string | undefined | null): string {
  if (typeof label === 'string' && label.trim().length > 0) return label
  return SPLIT_BUTTON_DEFAULT_MENU_LABEL
}

export function resolveSplitButtonDivider(variant: ButtonVariant): SplitButtonDivider {
  return VARIANTS_WITH_BORDER.has(variant) ? 'shared-border' : 'hairline'
}

/** A part is disabled when the whole group is, or when the part itself is. */
export function isSplitButtonPartDisabled(
  groupDisabled: boolean | undefined,
  partDisabled: boolean | undefined,
): boolean {
  return groupDisabled === true || partDisabled === true
}

/**
 * ArrowDown on a closed, enabled caret opens the menu (the WAI-ARIA menu
 * button pattern). Enter and Space need nothing here: the caret is a native
 * button, so they already click it, and a click toggles the menu.
 */
export function getSplitButtonTriggerKeyIntent(input: {
  key: string
  open: boolean
  disabled: boolean
}): SplitButtonTriggerKeyIntent {
  if (input.key === 'ArrowDown' && !input.open && !input.disabled) return 'open'
  return null
}

/** Anything other than an explicit `rtl` reads as left-to-right. */
export function resolveSplitButtonDirection(value: string | undefined | null): SplitButtonDirection {
  return value === 'rtl' ? 'rtl' : 'ltr'
}

/**
 * Translate a logical alignment into the physical one DropdownMenu takes,
 * where `start` means "line up with the trigger's left edge". In a
 * right-to-left layout the caret's end edge is its left edge, so `start` and
 * `end` swap.
 */
export function resolveSplitButtonMenuAlign(
  align: SplitButtonMenuAlign,
  direction: SplitButtonDirection,
): SplitButtonMenuAlign {
  if (direction === 'ltr' || align === 'center') return align
  return align === 'end' ? 'start' : 'end'
}

export interface SplitButtonOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Disables both parts and closes the menu. */
  disabled?: boolean
  /** Whether the menu is open. */
  open?: boolean
  /** Minimum hit area of each part in CSS pixels (both axes). */
  minTapTarget?: number
}

export interface SplitButtonAPI {
  /** The resolved Button variant (aliases such as `primary` canonicalised). */
  variant: ButtonVariant
  size: ButtonSize
  divider: SplitButtonDivider
  /** Attributes for the element that wraps both parts. */
  ariaProps: Record<string, string>
  /** Data attributes for CSS styling hooks on the wrapper. */
  dataAttributes: Record<string, string>
  /** Inline size of each part's invisible hit-area extender. */
  hitAreaStyle: { minWidth: string; minHeight: string }
}

export function createSplitButton(options: SplitButtonOptions = {}): SplitButtonAPI {
  const {
    variant = SPLIT_BUTTON_DEFAULT_VARIANT,
    size = SPLIT_BUTTON_DEFAULT_SIZE,
    disabled = false,
    open = false,
    minTapTarget,
  } = options

  const resolvedVariant = resolveButtonVariant(variant) ?? SPLIT_BUTTON_DEFAULT_VARIANT
  const dataAttributes: Record<string, string> = { 'data-state': open ? 'open' : 'closed' }
  if (disabled) dataAttributes['data-disabled'] = ''
  const tapTarget = `${resolveIconButtonTapTarget(minTapTarget)}px`

  return {
    variant: resolvedVariant,
    size,
    divider: resolveSplitButtonDivider(resolvedVariant),
    ariaProps: { role: 'group' },
    dataAttributes,
    hitAreaStyle: { minWidth: tapTarget, minHeight: tapTarget },
  }
}

export interface SplitButtonTriggerOptions {
  /** Accessible name; blank or missing falls back to "More options". */
  label?: string
  open: boolean
  disabled: boolean
}

export interface SplitButtonTriggerAPI {
  /** ARIA attributes to spread on the caret `<button>`. */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks on the caret. */
  dataAttributes: Record<string, string>
}

/**
 * The caret's name and state hooks. The menu-button attributes
 * (`aria-haspopup`, `aria-expanded`, `aria-controls`) come from DropdownMenu's
 * trigger, which the caret is.
 */
export function createSplitButtonTrigger(options: SplitButtonTriggerOptions): SplitButtonTriggerAPI {
  const button = createButton({ disabled: options.disabled })
  return {
    ariaProps: { ...button.ariaProps, 'aria-label': resolveSplitButtonMenuLabel(options.label) },
    dataAttributes: {
      ...button.dataAttributes,
      'data-state': options.open ? 'open' : 'closed',
    },
  }
}
