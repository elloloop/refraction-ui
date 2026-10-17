import * as React from 'react'
import {
  buildMultiComboboxItems,
  createMultiCombobox,
  diffMultiComboboxSelection,
  formatMultiComboboxAnnouncement,
  getMultiComboboxKeyIntent,
  isMultiComboboxAtMax,
  moveMultiComboboxActiveIndex,
  multiComboboxReducer,
  resolveMultiComboboxActiveIndex,
  resolveMultiComboboxMessages,
  multiComboboxVariants,
  multiComboboxFieldVariants,
  multiComboboxChipListClass,
  multiComboboxChipClass,
  multiComboboxChipLabelClass,
  multiComboboxChipRemoveClass,
  multiComboboxInputClass,
  multiComboboxPopoverClass,
  multiComboboxListboxClass,
  multiComboboxOptionVariants,
  multiComboboxLeadingClass,
  multiComboboxOptionLabelClass,
  multiComboboxCheckClass,
  multiComboboxStatusClass,
  multiComboboxSpinnerClass,
  type MultiComboboxAction,
  type MultiComboboxFilter,
  type MultiComboboxItem,
  type MultiComboboxKeyIntent,
  type MultiComboboxMessages,
  type MultiComboboxMove,
  type MultiComboboxOption,
} from '@refraction-ui/multi-combobox'
import { cn } from '@refraction-ui/shared'

export type { MultiComboboxOption, MultiComboboxFilter, MultiComboboxMessages }

/** Visually hidden but read by screen readers (the polite live region). */
const VISUALLY_HIDDEN_CLASS = 'sr-only'

export interface MultiComboboxProps<T extends MultiComboboxOption = MultiComboboxOption>
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'
  > {
  /** Options to offer. For async search pass the caller's current results. */
  options: readonly T[]
  /** Controlled selection. */
  value?: readonly T[]
  /** Initial selection for uncontrolled usage. */
  defaultValue?: readonly T[]
  /** Called with the next selection. */
  onValueChange?: (value: T[]) => void
  /** Controlled query (the text typed in the field). */
  query?: string
  /** Called on every query change — the hook for loading async options. */
  onQueryChange?: (query: string) => void
  /**
   * Local filter applied to `options`. Pass `false` when `options` are
   * already filtered (e.g. server-side search results).
   */
  filter?: MultiComboboxFilter<T> | false
  /** Options are loading: shows a loading row and sets `aria-busy`. */
  loading?: boolean
  /**
   * Enables a "Create <query>" item. Return an option to add it to the
   * selection; return nothing to handle creation yourself (e.g. async).
   */
  onCreate?: (query: string) => T | void
  /** Maximum number of selected options. */
  max?: number
  /** Leading content for an option row, e.g. an avatar. */
  renderOptionLeading?: (option: T) => React.ReactNode
  /** Input placeholder. */
  placeholder?: string
  /** Disables the whole control. */
  disabled?: boolean
  /** Form field name; renders one hidden input per selected value. */
  name?: string
  /** Id for the text input, so a `<label htmlFor>` can name it. */
  inputId?: string
  /** Accessible name for the input and listbox. */
  'aria-label'?: string
  /** Id(s) of the element(s) naming the input and listbox. */
  'aria-labelledby'?: string
  /** Id(s) of the element(s) describing the input. */
  'aria-describedby'?: string
  /** Override user-facing strings (i18n). */
  messages?: Partial<MultiComboboxMessages>
}

function MultiComboboxInner<T extends MultiComboboxOption>(
  {
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    query: queryProp,
    onQueryChange,
    filter,
    loading = false,
    onCreate,
    max,
    renderOptionLeading,
    placeholder,
    disabled = false,
    name,
    inputId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    messages: messageOverrides,
    className,
    onBlur,
    ...props
  }: MultiComboboxProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const messages = React.useMemo(
    () => resolveMultiComboboxMessages(messageOverrides),
    [messageOverrides],
  )

  const isValueControlled = valueProp !== undefined
  const [internalValue, setInternalValue] = React.useState<readonly T[]>(defaultValue ?? [])
  const value = isValueControlled ? valueProp : internalValue

  const isQueryControlled = queryProp !== undefined
  const [internalQuery, setInternalQuery] = React.useState('')
  const query = isQueryControlled ? queryProp : internalQuery

  const [openState, setOpenState] = React.useState(false)
  const open = openState && !disabled
  const [activeKey, setActiveKey] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState('')

  const baseId = React.useId()
  const listboxId = `${baseId}-listbox`
  const resolvedInputId = inputId ?? `${baseId}-input`
  const optionId = (index: number) => `${baseId}-option-${index}`

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const optionRefs = React.useRef<(HTMLLIElement | null)[]>([])

  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const items = React.useMemo(
    () =>
      buildMultiComboboxItems<T>({
        options,
        selected: value,
        query,
        filter,
        creatable: onCreate !== undefined,
        max,
      }),
    [options, value, query, filter, onCreate, max],
  )
  const activeIndex = open ? resolveMultiComboboxActiveIndex(items, activeKey) : -1
  const full = isMultiComboboxAtMax(value, max)

  // Announce selection changes politely, however they happened (keyboard,
  // pointer, or a controlled parent update). Skips the initial render.
  const previousValueRef = React.useRef(value)
  React.useEffect(() => {
    const previous = previousValueRef.current
    previousValueRef.current = value
    if (previous === value) return
    const message = formatMultiComboboxAnnouncement(
      diffMultiComboboxSelection(previous, value),
      value.length,
      messages,
    )
    if (message) setAnnouncement(message)
  }, [value, messages])

  React.useEffect(() => {
    if (activeIndex < 0) return
    optionRefs.current[activeIndex]?.scrollIntoView?.({ block: 'nearest' })
  }, [activeIndex])

  const setQuery = (next: string) => {
    if (!isQueryControlled) setInternalQuery(next)
    onQueryChange?.(next)
  }

  const commitValue = (next: readonly T[]) => {
    if (!isValueControlled) setInternalValue(next)
    onValueChange?.([...next])
  }

  const applySelection = (action: MultiComboboxAction<T>) => {
    const next = multiComboboxReducer(value, action, { max })
    if (next !== value) commitValue(next)
  }

  const announceMax = () => {
    if (max !== undefined) setAnnouncement(messages.maxReached(max))
  }

  const activateItem = (item: MultiComboboxItem<T> | undefined) => {
    if (!item) return
    if (item.disabled) {
      if (full && !item.selected) announceMax()
      return
    }
    if (item.kind === 'option') {
      applySelection({ type: 'toggle', option: item.option })
    } else {
      const created = onCreate?.(item.query)
      if (created) applySelection({ type: 'add', option: created })
    }
    if (query) setQuery('')
  }

  const moveActive = (move: MultiComboboxMove) => {
    const next = moveMultiComboboxActiveIndex(items, activeIndex, move)
    setActiveKey(items[next]?.key ?? null)
  }

  const openPopup = (move: 'first' | 'last') => {
    setOpenState(true)
    const index = moveMultiComboboxActiveIndex(items, -1, move)
    setActiveKey(items[index]?.key ?? null)
  }

  const intentHandlers: Record<Exclude<MultiComboboxKeyIntent, 'none'>, () => void> = {
    'open-first': () => openPopup('first'),
    'open-last': () => openPopup('last'),
    next: () => moveActive('next'),
    prev: () => moveActive('prev'),
    first: () => moveActive('first'),
    last: () => moveActive('last'),
    commit: () => activateItem(items[activeIndex]),
    close: () => setOpenState(false),
    'clear-query': () => setQuery(''),
    'remove-last': () => applySelection({ type: 'removeLast' }),
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Keys pressed while an IME is composing belong to the IME.
    if (event.nativeEvent.isComposing) return
    const intent = getMultiComboboxKeyIntent(event.key, {
      open,
      query,
      hasActive: activeIndex >= 0,
      hasSelection: value.length > 0,
    })
    if (intent === 'none') return
    event.preventDefault()
    intentHandlers[intent]()
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setOpenState(true)
    setActiveKey(null)
  }

  const handleFieldClick = () => {
    if (disabled) return
    inputRef.current?.focus()
    setOpenState(true)
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (!next || !rootRef.current?.contains(next)) setOpenState(false)
    onBlur?.(event)
  }

  const removeChip = (event: React.MouseEvent<HTMLButtonElement>, option: T) => {
    // Keep the click from reaching the field, which would open the popup.
    event.stopPropagation()
    applySelection({ type: 'remove', value: option.value })
    inputRef.current?.focus()
  }

  const api = createMultiCombobox({
    open,
    listboxId,
    activeDescendantId: activeIndex >= 0 ? optionId(activeIndex) : undefined,
    disabled,
    loading,
  })

  const showEmpty = open && !loading && items.length === 0

  return (
    <div
      ref={setRootRef}
      className={cn(multiComboboxVariants(), className)}
      {...api.dataAttributes}
      {...props}
      onBlur={handleBlur}
    >
      <div
        className={multiComboboxFieldVariants({ disabled: disabled ? 'true' : 'false' })}
        onClick={handleFieldClick}
      >
        {value.length > 0 && (
          <ul className={multiComboboxChipListClass} aria-label={messages.selectedListLabel}>
            {value.map((option) => (
              <li key={option.value} className={multiComboboxChipClass} data-value={option.value}>
                <span className={multiComboboxChipLabelClass}>{option.label}</span>
                <button
                  type="button"
                  className={multiComboboxChipRemoveClass}
                  aria-label={messages.remove(option.label)}
                  disabled={disabled}
                  onClick={(event) => removeChip(event, option)}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          id={resolvedInputId}
          type="text"
          autoComplete="off"
          spellCheck={false}
          className={multiComboboxInputClass}
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          {...api.inputAriaProps}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={multiComboboxPopoverClass} hidden={!open}>
        {open && full && max !== undefined && (
          <div className={multiComboboxStatusClass}>{messages.maxReached(max)}</div>
        )}
        <ul
          className={multiComboboxListboxClass}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          {...api.listboxAriaProps}
        >
          {open &&
            items.map((item, index) => {
              const active = index === activeIndex
              return (
                <li
                  key={item.key}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  id={optionId(index)}
                  role="option"
                  aria-selected={item.selected}
                  aria-disabled={item.disabled || undefined}
                  data-active={active ? '' : undefined}
                  data-kind={item.kind}
                  className={multiComboboxOptionVariants({
                    active: active ? 'true' : 'false',
                    disabled: item.disabled ? 'true' : 'false',
                  })}
                  // Keep focus in the input so typing and arrows keep working.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => {
                    if (!item.disabled && !active) setActiveKey(item.key)
                  }}
                  onClick={() => activateItem(item)}
                >
                  {item.kind === 'option' ? (
                    <>
                      {renderOptionLeading && (
                        <span className={multiComboboxLeadingClass} aria-hidden="true">
                          {renderOptionLeading(item.option)}
                        </span>
                      )}
                      <span className={multiComboboxOptionLabelClass}>{item.option.label}</span>
                      {item.selected && <CheckIcon />}
                    </>
                  ) : (
                    <>
                      <span className={multiComboboxLeadingClass} aria-hidden="true">
                        <PlusIcon />
                      </span>
                      <span className={multiComboboxOptionLabelClass}>{messages.create(item.query)}</span>
                    </>
                  )}
                </li>
              )
            })}
        </ul>
        {open && loading && (
          <div className={multiComboboxStatusClass}>
            <SpinnerIcon />
            {messages.loading}
          </div>
        )}
        {showEmpty && <div className={multiComboboxStatusClass}>{messages.empty}</div>}
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className={VISUALLY_HIDDEN_CLASS}>
        {announcement}
      </div>

      {name !== undefined &&
        value.map((option) => (
          <input key={option.value} type="hidden" name={name} value={option.value} />
        ))}
    </div>
  )
}

/**
 * MultiCombobox — pick several options from a searchable list.
 *
 * Selected options render as removable chips inside the field; Backspace on
 * an empty query removes the last one. The input is an ARIA 1.2 combobox
 * controlling an `aria-multiselectable` listbox navigated with
 * `aria-activedescendant` (arrows, Home/End, Enter toggles, Esc closes).
 * Async search is caller-driven: listen to `onQueryChange`, then pass the
 * results as `options` with `loading` and `filter={false}`. Selection
 * changes are announced politely. Logic lives in `@refraction-ui/multi-combobox`.
 */
export const MultiCombobox = React.forwardRef(MultiComboboxInner) as <
  T extends MultiComboboxOption = MultiComboboxOption,
>(
  props: MultiComboboxProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null

/* ─── Icons (decorative; the controls carry the accessible names) ── */

function CloseIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className={multiComboboxCheckClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg
      className={multiComboboxSpinnerClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
    </svg>
  )
}
