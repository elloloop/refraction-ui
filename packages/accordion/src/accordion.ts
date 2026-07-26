/**
 * @refraction-ui/accordion — headless accordion (disclosure) state machine.
 *
 * Owns the *behavior* of an accordion: which item(s) are open, the single vs
 * multiple expansion modes, and the collapsible toggle rule. It has NO UI
 * opinion — React/Astro adapters subscribe to the store and render the parts.
 */

/** Expansion mode: one item open at a time, or any number. */
export type AccordionType = 'single' | 'multiple'

/** Open item id (`single`) or ids (`multiple`). */
export type AccordionValue = string | string[]

/** Options for {@link createAccordion}. */
export interface AccordionConfig {
  /** Expansion mode (default `'single'`). */
  type?: AccordionType
  /** When `type="single"`, allows the open item to be toggled fully closed. */
  collapsible?: boolean
  /** Controlled open item(s). Pair with `onValueChange`. */
  value?: AccordionValue
  /** Uncontrolled initial open item(s). */
  defaultValue?: AccordionValue
  /** Called whenever the open item(s) change. */
  onValueChange?: (value: AccordionValue) => void
}

/** Snapshot of the store. Returned by `getState()`; treat as immutable. */
export interface AccordionState {
  type: AccordionType
  collapsible: boolean
  /** Current open item id (`single`) or ids (`multiple`). */
  value: AccordionValue
}

/** The framework-agnostic store. React/Astro adapters wrap this. */
export interface AccordionAPI {
  /** Current immutable snapshot */
  getState(): AccordionState
  /** Subscribe to changes; returns an unsubscribe fn (suits useSyncExternalStore) */
  subscribe(listener: () => void): () => void
  /** Toggle an item open/closed per the type/collapsible rules */
  toggleItem(itemValue: string): void
  /** Whether an item is currently open */
  isOpen(itemValue: string): boolean
  /** Sync a controlled value into the store (adapters call when the prop changes) */
  setValue(value: AccordionValue): void
  /** Update options after creation (adapters keep props in sync) */
  setOptions(options: {
    type?: AccordionType
    collapsible?: boolean
    onValueChange?: (value: AccordionValue) => void
  }): void
}

/** Pure open-state check shared by every adapter. */
export function isItemOpen(state: AccordionState, itemValue: string): boolean {
  return state.type === 'single'
    ? state.value === itemValue
    : Array.isArray(state.value) && state.value.includes(itemValue)
}

/** Shallow value equality (arrays compared item-by-item, order-sensitive). */
function valueEquals(a: AccordionValue, b: AccordionValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i])
  }
  return a === b
}

/**
 * createAccordion — headless accordion store.
 *
 * Supports controlled (`value`) and uncontrolled (`defaultValue`) usage.
 * `single` mode holds one open item id (`''` when all closed); `multiple`
 * holds an array of open ids. In `single` mode, re-toggling the open item
 * closes it only when `collapsible` is set.
 */
export function createAccordion(config: AccordionConfig = {}): AccordionAPI {
  let type: AccordionType = config.type ?? 'single'
  let collapsible: boolean = config.collapsible ?? false
  let onValueChange = config.onValueChange

  let uncontrolledValue: AccordionValue =
    config.defaultValue ?? (type === 'multiple' ? [] : '')
  let controlledValue: AccordionValue | undefined = config.value

  const listeners = new Set<() => void>()
  let snapshot: AccordionState = buildSnapshot()

  function currentValue(): AccordionValue {
    return controlledValue !== undefined ? controlledValue : uncontrolledValue
  }

  function buildSnapshot(): AccordionState {
    return { type, collapsible, value: currentValue() }
  }

  function emit(): void {
    snapshot = buildSnapshot()
    for (const l of listeners) l()
  }

  const api: AccordionAPI = {
    getState() {
      return snapshot
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    toggleItem(itemValue) {
      const value = currentValue()
      let next: AccordionValue
      if (type === 'single') {
        next = value === itemValue && collapsible ? '' : itemValue
      } else {
        const arrValue = Array.isArray(value) ? value : []
        next = arrValue.includes(itemValue)
          ? arrValue.filter((v) => v !== itemValue)
          : [...arrValue, itemValue]
      }
      if (controlledValue === undefined) {
        if (valueEquals(uncontrolledValue, next)) return
        uncontrolledValue = next
      }
      onValueChange?.(next)
      emit()
    },

    isOpen(itemValue) {
      return isItemOpen(snapshot, itemValue)
    },

    setValue(value) {
      if (controlledValue !== undefined && valueEquals(controlledValue, value)) return
      controlledValue = value
      emit()
    },

    setOptions(options) {
      const prevType = type
      const prevCollapsible = collapsible
      if (options.type !== undefined) type = options.type
      if (options.collapsible !== undefined) collapsible = options.collapsible
      if (options.onValueChange !== undefined) onValueChange = options.onValueChange
      if (type !== prevType || collapsible !== prevCollapsible) emit()
    },
  }

  return api
}
