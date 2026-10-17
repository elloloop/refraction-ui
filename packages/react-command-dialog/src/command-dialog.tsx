import * as React from 'react'
import {
  COMMAND_DIALOG_ALL_FILTER,
  buildCommandDialogSections,
  commandDialogContentClass,
  commandDialogEmptyClass,
  commandDialogFilterChipVariants,
  commandDialogFiltersClass,
  commandDialogInputClass,
  commandDialogInputRowClass,
  commandDialogItemDescriptionClass,
  commandDialogItemIconClass,
  commandDialogItemTextClass,
  commandDialogListClass,
  commandDialogLoadingClass,
  commandDialogSpinnerClass,
  DEFAULT_COMMAND_DIALOG_PLATFORM,
  detectCommandDialogPlatform,
  expandCommandDialogShortcut,
  getCommandDialogFilterKeyTarget,
  getCommandDialogFilterOptions,
  isCommandDialogQueryBlank,
  joinCommandDialogShortcut,
  mergeCommandDialogRecents,
  resolveCommandDialogActiveFilter,
  type CommandDialogFilter,
  type CommandDialogGroup,
  type CommandDialogItem,
  type CommandDialogPlatform,
} from '@refraction-ui/command-dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@refraction-ui/react-command'
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@refraction-ui/react-dialog'
import { HighlightText, splitHighlightQuery } from '@refraction-ui/react-highlight-text'
import { useShortcut } from '@refraction-ui/react-keyboard-shortcut'
import { cn } from '@refraction-ui/shared'

/** A result row: the headless item plus an optional leading icon/avatar. */
export interface CommandDialogItemData extends CommandDialogItem {
  icon?: React.ReactNode
}

/** A group of result rows. */
export type CommandDialogGroupData = CommandDialogGroup<CommandDialogItemData>

export interface CommandDialogProps {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Called whenever the dialog opens or closes (shortcut, Escape, overlay, selection). */
  onOpenChange?: (open: boolean) => void
  /**
   * Toggle shortcut. `Mod` is ⌘ on Apple platforms and Ctrl elsewhere (only
   * one of them is bound); explicit `Ctrl`/`Meta` bind exactly that. `false` disables it.
   */
  shortcut?: string | false
  /**
   * Which keyboard `Mod` targets. Detected from `navigator` after mount when
   * omitted (Ctrl until then, including SSR); pass it to pin the behaviour.
   */
  platform?: CommandDialogPlatform
  /** Result groups for the current query — the caller searches, sync or async. */
  groups?: readonly CommandDialogGroupData[]
  /** Group ids in display order, so streamed results do not reshuffle. */
  groupOrder?: readonly string[]
  /** Results are being fetched; shows a status row and marks the list busy. */
  loading?: boolean
  /** Called with the raw input text on every change, and with `''` on close. */
  onQueryChange?: (query: string) => void
  /** Filter chips. An "All" chip is added first automatically. */
  filters?: readonly CommandDialogFilter[]
  /** Controlled active chip id. */
  activeFilter?: string
  /** Initial active chip id when uncontrolled. */
  defaultActiveFilter?: string
  /** Called with the chip id the user picked. */
  onActiveFilterChange?: (filterId: string) => void
  /** Label of the implicit "All" chip. */
  allFilterLabel?: string
  /** Accessible name of the chip group. */
  filtersLabel?: string
  /** Controlled recent items, most recent first. */
  recentItems?: readonly CommandDialogItemData[]
  /** Initial recent items when uncontrolled. */
  defaultRecentItems?: readonly CommandDialogItemData[]
  /** Called with the updated recents after a selection. */
  onRecentItemsChange?: (items: CommandDialogItemData[]) => void
  /** How many recents to keep and show. */
  maxRecentItems?: number
  /** Heading of the recent-items section. */
  recentHeading?: string
  /** Called with the chosen item (scope resolved); the dialog then closes. */
  onSelect?: (item: CommandDialogItemData) => void
  /** Accessible name of the dialog and the search input. */
  title?: string
  /** Input placeholder. */
  placeholder?: string
  /** Shown when there is nothing to list and nothing loading. */
  emptyLabel?: string
  /** Status text while `loading`. */
  loadingLabel?: string
  /** Screen-reader announcement of the result count once a query has results or none. */
  formatResultCount?: (count: number) => string
  /** Extra classes for the dialog panel. */
  className?: string
}

const DEFAULT_TITLE = 'Search'
const DEFAULT_PLACEHOLDER = 'Search or jump to…'
const DEFAULT_EMPTY_LABEL = 'No results found.'
const DEFAULT_LOADING_LABEL = 'Searching…'
const DEFAULT_RECENT_HEADING = 'Recent'
const DEFAULT_ALL_FILTER_LABEL = 'All'
const DEFAULT_FILTERS_LABEL = 'Filter results'
const defaultFormatResultCount = (count: number) => (count === 1 ? '1 result' : `${count} results`)
const NO_ITEMS: readonly CommandDialogItemData[] = []
const NO_FILTERS: readonly CommandDialogFilter[] = []

/** Results are filtered by the caller (and the chips), never by Command's substring match. */
const keepEveryItem = () => true

/**
 * The platform `Mod` should target. `navigator` is read only in an effect,
 * so server and first client render agree and SSR never touches it.
 */
function useCommandDialogPlatform(override: CommandDialogPlatform | undefined): CommandDialogPlatform {
  const [detected, setDetected] = React.useState<CommandDialogPlatform>(DEFAULT_COMMAND_DIALOG_PLATFORM)
  React.useEffect(() => {
    if (override !== undefined) return
    setDetected(detectCommandDialogPlatform(navigator.platform, navigator.userAgent))
  }, [override])
  return override ?? detected
}

/** Controlled-or-uncontrolled value, the same contract Dialog uses for `open`. */
function useControllable<T>(
  controlled: T | undefined,
  initial: T,
  onChange: ((value: T) => void) | undefined,
): [T, (next: T) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(initial)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [value, set]
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0 text-muted-foreground"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

interface FilterChipsProps {
  options: readonly CommandDialogFilter[]
  active: string
  label: string
  onChange: (filterId: string) => void
}

/**
 * Chips as a radiogroup: exactly one scope is active at a time ("All"
 * included), so radio semantics match; roving tabindex keeps the group to a
 * single Tab stop between the input and the results.
 */
function FilterChips({ options, active, label, onChange }: FilterChipsProps) {
  const chipRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const activeIndex = options.findIndex((option) => option.id === active)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Escape must still reach Command/Dialog so the palette closes.
    if (event.key === 'Escape') return
    // Otherwise keep keys away from Command's list navigation (Enter would select a result).
    event.stopPropagation()
    const target = getCommandDialogFilterKeyTarget(event.key, activeIndex, options.length)
    if (target === undefined) return
    event.preventDefault()
    onChange(options[target].id)
    chipRefs.current[target]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className={commandDialogFiltersClass} onKeyDown={handleKeyDown}>
      {options.map((option, index) => {
        const selected = option.id === active
        return (
          <button
            key={option.id}
            ref={(node) => {
              chipRefs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-filter={option.id}
            className={commandDialogFilterChipVariants({ selected: selected ? 'true' : 'false' })}
            onClick={() => onChange(option.id)}
          >
            {selected ? <CheckIcon /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * CommandDialog — a command palette (the existing Command) inside the
 * existing Dialog, opened by ⌘K on Apple platforms or Ctrl+K elsewhere, with
 * filter chips, recent items and caller-driven grouped results whose
 * matches are highlighted.
 */
export const CommandDialog = React.forwardRef<HTMLDivElement, CommandDialogProps>(function CommandDialog(
  {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    shortcut,
    platform: platformProp,
    groups,
    groupOrder,
    loading = false,
    onQueryChange,
    filters = NO_FILTERS,
    activeFilter: activeFilterProp,
    defaultActiveFilter,
    onActiveFilterChange,
    allFilterLabel = DEFAULT_ALL_FILTER_LABEL,
    filtersLabel = DEFAULT_FILTERS_LABEL,
    recentItems: recentItemsProp,
    defaultRecentItems = NO_ITEMS,
    onRecentItemsChange,
    maxRecentItems,
    recentHeading = DEFAULT_RECENT_HEADING,
    onSelect,
    title = DEFAULT_TITLE,
    placeholder = DEFAULT_PLACEHOLDER,
    emptyLabel = DEFAULT_EMPTY_LABEL,
    loadingLabel = DEFAULT_LOADING_LABEL,
    formatResultCount = defaultFormatResultCount,
    className,
  },
  ref,
) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [recents, setRecents] = useControllable<readonly CommandDialogItemData[]>(
    recentItemsProp,
    defaultRecentItems,
    // Reported from handleSelect, where the merged list is still mutable for the caller.
    undefined,
  )
  const [requestedFilter, setRequestedFilter] = useControllable(
    activeFilterProp,
    defaultActiveFilter ?? COMMAND_DIALOG_ALL_FILTER,
    onActiveFilterChange,
  )
  const [query, setQuery] = React.useState('')

  const filterOptions = React.useMemo(
    () => getCommandDialogFilterOptions(filters, allFilterLabel),
    [filters, allFilterLabel],
  )
  const activeFilter = resolveCommandDialogActiveFilter(filterOptions, requestedFilter)

  const sections = React.useMemo(
    () =>
      buildCommandDialogSections({
        groups,
        recentItems: recents,
        query,
        activeFilter,
        groupOrder,
        maxRecentItems,
        recentHeading,
      }),
    [groups, recents, query, activeFilter, groupOrder, maxRecentItems, recentHeading],
  )
  const resultCount = sections.reduce((total, section) => total + section.items.length, 0)
  // Highlight marks are not reliably announced, so the count is spoken instead.
  const statusText = loading
    ? loadingLabel
    : isCommandDialogQueryBlank(query)
      ? ''
      : formatResultCount(resultCount)
  const highlightTerms = React.useMemo(() => splitHighlightQuery(query), [query])

  // The shortcut toggles; a ref keeps the callback stable for useShortcut.
  const openRef = React.useRef(open)
  openRef.current = open
  const toggle = React.useCallback(() => setOpen(!openRef.current), [setOpen])
  // `Mod` resolves to a single modifier for this platform, so the other one stays free.
  const platform = useCommandDialogPlatform(platformProp)
  const shortcutKeys = React.useMemo(
    () => joinCommandDialogShortcut(expandCommandDialogShortcut(shortcut, platform)),
    [shortcut, platform],
  )
  useShortcut({ shortcut: shortcutKeys, onTrigger: toggle, enabled: shortcutKeys.length > 0 })

  // Command's own search resets when the closed panel unmounts; keep ours and the caller's in step.
  const queryRef = React.useRef(query)
  queryRef.current = query
  const onQueryChangeRef = React.useRef(onQueryChange)
  onQueryChangeRef.current = onQueryChange
  React.useEffect(() => {
    if (open || queryRef.current === '') return
    setQuery('')
    onQueryChangeRef.current?.('')
  }, [open])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    onQueryChange?.(event.target.value)
  }

  const handleSelect = (item: CommandDialogItemData) => {
    const nextRecents = mergeCommandDialogRecents(recents, item, maxRecentItems)
    setRecents(nextRecents)
    onRecentItemsChange?.(nextRecents)
    onSelect?.(item)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay />
      <DialogContent ref={ref} className={cn(commandDialogContentClass, className)}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Command onOpenChange={setOpen} filter={keepEveryItem}>
          <div className={commandDialogInputRowClass}>
            <SearchIcon />
            <CommandInput
              value={query}
              onChange={handleInputChange}
              aria-label={title}
              placeholder={placeholder}
              className={commandDialogInputClass}
            />
          </div>
          {filterOptions.length > 0 ? (
            <FilterChips
              options={filterOptions}
              active={activeFilter}
              label={filtersLabel}
              onChange={setRequestedFilter}
            />
          ) : null}
          <div role="status" aria-live="polite" className={loading ? commandDialogLoadingClass : 'sr-only'}>
            {loading ? <span aria-hidden="true" className={commandDialogSpinnerClass} /> : null}
            {statusText}
          </div>
          <CommandList aria-busy={loading} className={commandDialogListClass}>
            {loading ? null : <CommandEmpty className={commandDialogEmptyClass}>{emptyLabel}</CommandEmpty>}
            {sections.map((section) => (
              <CommandGroup key={section.id} heading={section.heading} data-section={section.kind}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    disabled={item.disabled}
                    onSelect={() => handleSelect(item)}
                  >
                    {item.icon ? (
                      <span aria-hidden="true" className={commandDialogItemIconClass}>
                        {item.icon}
                      </span>
                    ) : null}
                    <span className={commandDialogItemTextClass}>
                      <HighlightText text={item.label} query={highlightTerms} />
                      {item.description ? (
                        <HighlightText
                          text={item.description}
                          query={highlightTerms}
                          className={commandDialogItemDescriptionClass}
                        />
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
})
