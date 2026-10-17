import {
  fieldHintVariants,
  fieldLabelVariants,
  fieldVariants,
} from './field.styles.js'

/**
 * Field — headless core.
 *
 * One labelled form control: a label above the control (or beside a checkbox
 * or switch) and an optional hint. The label names the control by id and the
 * hint describes it. Unlike a form-library-bound label, it needs no form
 * state, so it works around any input, select or custom control.
 *
 * JSX-free: class lists, data attributes and the id rule, so every adapter
 * renders the same markup.
 */

/** `stacked`: label above the control. `inline`: control, then label. */
export type FieldLayout = 'stacked' | 'inline'

/** `default`: a regular form label. `eyebrow`: a small uppercase caption. */
export type FieldLabelTone = 'default' | 'eyebrow'

export interface FieldOptions {
  /** Where the label sits relative to the control. */
  layout?: FieldLayout
  /** Whether the field grows to fill spare room in a wrapping row. */
  grow?: boolean
  /** Label typography: a regular form label or an eyebrow, as Table's `headTone`. */
  labelTone?: FieldLabelTone
}

export interface FieldAPI {
  /** Styling hooks for the root element. */
  dataAttributes: Record<string, string>
  /** Classes for the root element. */
  rootClass: string
  /** Classes for the `<label>`. */
  labelClass: string
  /** Classes for the hint. */
  hintClass: string
}

export function createField(options: FieldOptions = {}): FieldAPI {
  const layout = options.layout ?? 'stacked'
  const tone = options.labelTone ?? 'default'
  return {
    dataAttributes: { 'data-slot': 'field', 'data-layout': layout },
    rootClass: fieldVariants({ layout, grow: options.grow ? 'true' : 'false' }),
    labelClass: fieldLabelVariants({ layout, tone }),
    hintClass: fieldHintVariants({ layout }),
  }
}

/**
 * The id a field's hint carries: the control's id plus `-hint`. Every adapter
 * uses this rule, so markup that wires the control by hand (an Astro field, a
 * control nested inside a wrapper) can point `aria-describedby` at it.
 */
export function fieldHintId(controlId: string): string {
  return `${controlId}-hint`
}

/**
 * Join `aria-describedby` id lists: splits on whitespace, drops empty and
 * duplicate ids, and returns `undefined` when nothing is left so the
 * attribute is omitted rather than rendered empty.
 */
export function mergeDescribedBy(
  ...lists: Array<string | false | null | undefined>
): string | undefined {
  const ids: string[] = []
  for (const list of lists) {
    if (!list) continue
    for (const id of list.split(/\s+/)) {
      if (id && !ids.includes(id)) ids.push(id)
    }
  }
  return ids.length > 0 ? ids.join(' ') : undefined
}
