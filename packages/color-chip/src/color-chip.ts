/**
 * ColorChip — headless logic.
 *
 * A chip that tells one speaker / tag apart from its neighbours by a stable
 * categorical colour (a dot plus a pale wash) while always showing its label,
 * so nothing is conveyed by colour alone. When editable, the whole chip is one
 * button with its own accessible name (`editLabel`) and tooltip
 * (`editTooltip`).
 */

/**
 * Number of categorical colours. Must equal `CATEGORY_COUNT` in
 * `@refraction-ui/tailwind-config` (the test suite pins the two together),
 * because each index maps onto a `--category-N` token triple.
 */
export const COLOR_CHIP_CATEGORY_COUNT = 8

/** A categorical colour: `--category-1` … `--category-8`. */
export type ColorChipCategory = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** Every category, in palette order. */
export const COLOR_CHIP_CATEGORIES: readonly ColorChipCategory[] = [1, 2, 3, 4, 5, 6, 7, 8]

// 32-bit FNV-1a. Chosen because it is tiny, well distributed for short keys
// (names, ids) and trivially portable: it only needs 32-bit multiply/xor, so
// Dart, Swift or Kotlin can reproduce the exact same index from the same key.
const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

/**
 * Stable 32-bit FNV-1a hash of `key`'s UTF-16 code units (what JS
 * `charCodeAt` and Dart `codeUnitAt` both return), as an unsigned integer.
 */
export function hashColorChipKey(key: string): number {
  let hash = FNV_OFFSET_BASIS
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME)
  }
  return hash >>> 0
}

/**
 * Deterministic categorical colour for `key`: the same key always gets the
 * same category, across renders, sessions and platforms. Keys are used
 * verbatim (no case folding or trimming), so pass a stable id when you have
 * one rather than a display name that might be edited.
 */
export function colorFor(key: string): ColorChipCategory {
  return ((hashColorChipKey(key) % COLOR_CHIP_CATEGORY_COUNT) + 1) as ColorChipCategory
}

/** True for an integer in 1..COLOR_CHIP_CATEGORY_COUNT. */
export function isColorChipCategory(value: unknown): value is ColorChipCategory {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= COLOR_CHIP_CATEGORY_COUNT
  )
}

/** Accessible name used when `editLabel` is omitted. */
export function defaultColorChipEditLabel(label: string): string {
  return `Edit ${label}`
}

/**
 * WCAG 2.5.3 (Label in Name): speech-input users say what they see, so the
 * accessible name should contain the visible label. True when it does
 * (case-insensitive), or when there is no visible label to contain.
 */
export function colorChipEditLabelIncludesLabel(editLabel: string, label: string): boolean {
  const visible = label.trim().toLowerCase()
  if (visible.length === 0) return true
  return editLabel.toLowerCase().includes(visible)
}

/** True when `value` has visible characters (whitespace-only hints are dropped). */
function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export interface ColorChipOptions {
  /** Visible text. Always rendered, so the chip never relies on colour alone. */
  label: string
  /** Dot colour. Defaults to `colorFor(label)`. */
  dot?: ColorChipCategory
  /** Wash (background) colour; the label text follows it. Defaults to `dot`. */
  wash?: ColorChipCategory
  /** Secondary text after the label, e.g. "from the calendar". */
  hint?: string
  /** Whether the chip is an edit button (the adapter passes `onEdit !== undefined`). */
  editable?: boolean
  /** Accessible name of the edit button. Defaults to `Edit <label>`. */
  editLabel?: string
  /** Tooltip text of the edit button. Defaults to the resolved `editLabel`. */
  editTooltip?: string
  /** DOM id of the rendered hint (for `aria-describedby`). */
  hintId?: string
  /** DOM id of the screen-reader copy of the tooltip (for `aria-describedby`). */
  tooltipDescriptionId?: string
}

export interface ColorChipAPI {
  dot: ColorChipCategory
  wash: ColorChipCategory
  editable: boolean
  /** The hint to render, or `undefined` when there is none. */
  hint: string | undefined
  /** Resolved accessible name of the edit button (`undefined` when not editable). */
  editLabel: string | undefined
  /** Resolved tooltip text (`undefined` when not editable or empty). */
  tooltip: string | undefined
  /**
   * Whether the tooltip says something the name does not, so screen readers
   * need it as a description. When it repeats the name it stays silent.
   */
  describeTooltip: boolean
  /** ARIA attributes for the chip root. */
  ariaProps: Record<string, string>
  /** Styling/test hooks for the chip root. */
  dataAttributes: Record<string, string>
}

function resolveCategory(
  value: ColorChipCategory | undefined,
  fallback: ColorChipCategory,
): ColorChipCategory {
  return isColorChipCategory(value) ? value : fallback
}

export function createColorChip(options: ColorChipOptions): ColorChipAPI {
  const { label, editable = false, hintId, tooltipDescriptionId } = options

  const dot = resolveCategory(options.dot, colorFor(label))
  const wash = resolveCategory(options.wash, dot)
  const hint = hasText(options.hint) ? options.hint : undefined
  const dataAttributes: Record<string, string> = {
    'data-dot': String(dot),
    'data-wash': String(wash),
    'data-editable': editable ? 'true' : 'false',
  }

  if (!editable) {
    return {
      dot,
      wash,
      editable,
      hint,
      editLabel: undefined,
      tooltip: undefined,
      describeTooltip: false,
      ariaProps: {},
      dataAttributes,
    }
  }

  const editLabel = hasText(options.editLabel)
    ? options.editLabel
    : defaultColorChipEditLabel(label)
  const tooltip = options.editTooltip === undefined ? editLabel : options.editTooltip
  const resolvedTooltip = hasText(tooltip) ? tooltip : undefined
  const describeTooltip = resolvedTooltip !== undefined && resolvedTooltip !== editLabel

  // `aria-label` replaces the button's text content as its name, so the hint
  // (visible inside the button) must come back as a description.
  const describedBy = [
    hint !== undefined ? hintId : undefined,
    describeTooltip ? tooltipDescriptionId : undefined,
  ].filter((id): id is string => hasText(id))

  const ariaProps: Record<string, string> = { 'aria-label': editLabel }
  if (describedBy.length > 0) ariaProps['aria-describedby'] = describedBy.join(' ')

  return {
    dot,
    wash,
    editable,
    hint,
    editLabel,
    tooltip: resolvedTooltip,
    describeTooltip,
    ariaProps,
    dataAttributes,
  }
}
