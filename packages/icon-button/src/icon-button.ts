import { resolveButtonVariant, type ButtonSize, type ButtonVariant } from '@refraction-ui/button'

/**
 * Minimum hit area for an icon-only control, in CSS pixels. 44 × 44 matches
 * WCAG 2.5.5 (Target Size, enhanced) and Apple's HIG; it is also the Flutter
 * `RefractionIconButton.minTapTarget` default so the two read the same.
 */
export const ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX = 44

/** Icon buttons are usually quiet chrome (toolbars, message actions). */
export const ICON_BUTTON_DEFAULT_VARIANT: ButtonVariant = 'ghost'

/** Wait before showing the tooltip so a pointer sweeping past doesn't flash it. */
export const ICON_BUTTON_TOOLTIP_DELAY_MS = 300

/** Gap between the button and its tooltip. */
export const ICON_BUTTON_TOOLTIP_OFFSET_PX = 6

/** Closest the tooltip may sit to a viewport edge. */
export const ICON_BUTTON_TOOLTIP_VIEWPORT_MARGIN_PX = 8

/** Browser default root font size; used to express icon sizes in rem. */
const ROOT_FONT_SIZE_PX = 16

/**
 * Visual sizes. Each maps onto one of Button's square `icon*` sizes, so the
 * visual box comes from `buttonVariants` rather than a second size table.
 */
export type IconButtonSize = 'xs' | 'sm' | 'default'

export const ICON_BUTTON_SIZE_TO_BUTTON_SIZE: Record<IconButtonSize, ButtonSize> = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  default: 'icon',
}

/** Default glyph size for each visual size, in CSS pixels. */
export const ICON_BUTTON_DEFAULT_ICON_SIZE_PX: Record<IconButtonSize, number> = {
  xs: 14,
  sm: 16,
  default: 16,
}

export type IconButtonTooltipSide = 'top' | 'bottom'

export interface IconButtonOptions {
  /** Accessible name; also the tooltip text. */
  label: string
  variant?: ButtonVariant
  size?: IconButtonSize
  /** Glyph size in CSS pixels. Defaults per `size`. */
  iconSize?: number
  /** Minimum hit area in CSS pixels (both axes). */
  minTapTarget?: number
  /** Toggle state. `undefined` renders a plain (non-toggle) button. */
  pressed?: boolean
  disabled?: boolean
  showTooltip?: boolean
}

export interface IconButtonAPI {
  /** ARIA attributes to spread on the `<button>`. */
  ariaProps: Record<string, string | boolean>
  /** Data attributes for CSS styling hooks. */
  dataAttributes: Record<string, string>
  /** The resolved Button variant (aliases such as `primary` canonicalised). */
  variant: ButtonVariant
  /** The Button size that renders the visual box. */
  buttonSize: ButtonSize
  /** `iconButtonVariants` input: whether the built-in ghost pressed fill applies. */
  pressedGhost: 'true' | 'false'
  /** Inline size of the invisible hit-area extender. */
  hitAreaStyle: { minWidth: string; minHeight: string }
  /** Inline size of the icon wrapper (rem, so it follows the root font size). */
  iconStyle: { width: string; height: string }
  /** Whether hover/focus should show the tooltip. */
  tooltipEnabled: boolean
}

/** True when `label` gives the control a usable accessible name. */
export function isIconButtonLabelValid(label: string | undefined | null): boolean {
  return typeof label === 'string' && label.trim().length > 0
}

/** A non-finite or negative target falls back to the default. */
export function resolveIconButtonTapTarget(minTapTarget: number | undefined): number {
  if (minTapTarget === undefined || !Number.isFinite(minTapTarget) || minTapTarget < 0) {
    return ICON_BUTTON_DEFAULT_MIN_TAP_TARGET_PX
  }
  return minTapTarget
}

/** An explicit positive finite `iconSize` wins; otherwise the size's default. */
export function resolveIconButtonIconSize(
  size: IconButtonSize,
  iconSize: number | undefined,
): number {
  if (iconSize !== undefined && Number.isFinite(iconSize) && iconSize > 0) {
    return iconSize
  }
  return ICON_BUTTON_DEFAULT_ICON_SIZE_PX[size]
}

/** Convert CSS pixels to a rem string relative to the browser default root size. */
export function iconButtonPxToRem(px: number): string {
  return `${px / ROOT_FONT_SIZE_PX}rem`
}

export function createIconButton(options: IconButtonOptions): IconButtonAPI {
  const {
    label,
    variant = ICON_BUTTON_DEFAULT_VARIANT,
    size = 'default',
    iconSize,
    minTapTarget,
    pressed,
    disabled = false,
    showTooltip = true,
  } = options

  const ariaProps: Record<string, string | boolean> = { 'aria-label': label }
  const dataAttributes: Record<string, string> = {}
  if (pressed !== undefined) {
    ariaProps['aria-pressed'] = pressed
    dataAttributes['data-state'] = pressed ? 'on' : 'off'
  }

  const resolvedVariant = resolveButtonVariant(variant) ?? ICON_BUTTON_DEFAULT_VARIANT
  const tapTarget = `${resolveIconButtonTapTarget(minTapTarget)}px`
  const glyph = iconButtonPxToRem(resolveIconButtonIconSize(size, iconSize))

  return {
    ariaProps,
    dataAttributes,
    variant: resolvedVariant,
    buttonSize: ICON_BUTTON_SIZE_TO_BUTTON_SIZE[size],
    pressedGhost: pressed === true && resolvedVariant === 'ghost' ? 'true' : 'false',
    hitAreaStyle: { minWidth: tapTarget, minHeight: tapTarget },
    iconStyle: { width: glyph, height: glyph },
    // A disabled native button can't be focused or hovered, so a tooltip could
    // only ever appear by accident; keep it off.
    tooltipEnabled: showTooltip && !disabled && isIconButtonLabelValid(label),
  }
}

export interface IconButtonRect {
  top: number
  left: number
  width: number
  height: number
}

export interface IconButtonTooltipPositionInput {
  /** The button's viewport rect (`getBoundingClientRect()`). */
  trigger: IconButtonRect
  /** The rendered tooltip's size. */
  tooltip: { width: number; height: number }
  /** The viewport's size. */
  viewport: { width: number; height: number }
  offset?: number
  margin?: number
}

export interface IconButtonTooltipPosition {
  side: IconButtonTooltipSide
  /** Viewport coordinates of the tooltip's top-left corner (for `position: fixed`). */
  top: number
  left: number
}

function clamp(value: number, min: number, max: number): number {
  // When the tooltip is wider than the viewport, pin it to the start edge.
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

/**
 * Place the tooltip centred above the button, flipping below when there is no
 * room above (header toolbars sit at the very top of the viewport), and keep it
 * inside the viewport horizontally.
 */
export function computeIconButtonTooltipPosition(
  input: IconButtonTooltipPositionInput,
): IconButtonTooltipPosition {
  const {
    trigger,
    tooltip,
    viewport,
    offset = ICON_BUTTON_TOOLTIP_OFFSET_PX,
    margin = ICON_BUTTON_TOOLTIP_VIEWPORT_MARGIN_PX,
  } = input

  const topAbove = trigger.top - offset - tooltip.height
  const fitsAbove = topAbove >= margin
  const side: IconButtonTooltipSide = fitsAbove ? 'top' : 'bottom'
  const top = fitsAbove ? topAbove : trigger.top + trigger.height + offset

  const centredLeft = trigger.left + trigger.width / 2 - tooltip.width / 2
  const left = clamp(centredLeft, margin, viewport.width - margin - tooltip.width)

  return { side, top, left }
}
