import * as React from 'react'
import {
  createCommand,
  commandVariants,
  commandInputVariants,
  commandItemVariants,
  commandGroupVariants,
  type CommandProps as CoreCommandProps,
  type CommandItemData,
} from '@refraction-ui/command'
import { cn, createKeyboardHandler, Keys, devWarn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/** What a mounted CommandItem tells the root about itself. */
interface RegisteredItem {
  domId: string
  disabled: boolean
  select: () => void
}

interface CommandContextValue {
  search: string
  onSearch: (query: string) => void
  selectedIndex: number
  onSelect: (index: number) => void
  items: CommandItemData[]
  filteredItems: CommandItemData[]
  /** Whether a value passes the current search. */
  matches: (value: string) => boolean
  registerItem: (value: string, item: RegisteredItem) => void
  unregisterItem: (value: string) => void
  /** DOM id of the highlighted item, for aria-activedescendant. */
  activeDescendant: string | undefined
  listId: string
  inputId: string
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommandContext(): CommandContextValue {
  const ctx = React.useContext(CommandContext)
  if (!ctx) {
    devWarn(
      'react-command/context-outside-provider',
      'Command compound components (CommandInput/CommandList/CommandItem/CommandGroup/etc.) must be rendered inside a <Command>. The missing CommandContext makes this throw.',
    )
    throw new Error('Command compound components must be used within <Command>')
  }
  return ctx
}

/** An item's searchable value: its `value` prop, else its text children. */
function itemValueOf(value: string | undefined, children: React.ReactNode): string {
  if (value !== undefined) return value
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  return ''
}

/**
 * Collect the CommandItems present in the element tree, in order, so the
 * root knows its items on the first (and server) render. Items inside custom
 * components are not visible here; they are added when they mount.
 */
function collectItems(node: React.ReactNode, into: CommandItemData[]): CommandItemData[] {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement<{ value?: string; disabled?: boolean; children?: React.ReactNode }>(child)) return
    if (child.type === CommandItem) {
      const value = itemValueOf(child.props.value, child.props.children)
      into.push({ id: value, value, label: value, disabled: child.props.disabled })
      return
    }
    collectItems(child.props.children, into)
  })
  return into
}

const defaultFilter = (value: string, search: string) =>
  value.toLowerCase().includes(search.toLowerCase())

// ---------------------------------------------------------------------------
// Command (root provider)
// ---------------------------------------------------------------------------

export interface CommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Custom filter — receives an item value and the search, returns true to keep it. */
  filter?: (value: string, search: string) => boolean
  className?: string
  children?: React.ReactNode
}

export function Command({
  open,
  onOpenChange,
  filter = defaultFilter,
  className,
  children,
}: CommandProps) {
  const [registered, setRegistered] = React.useState<ReadonlyMap<string, RegisteredItem>>(() => new Map())
  const [search, setSearch] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Stable across renders and SSR-safe; keeps the rfr-cmd-* prefixes.
  const uid = React.useId().replace(/:/g, '')
  const listId = `rfr-cmd-list-${uid}`
  const inputId = `rfr-cmd-input-${uid}`
  const api = React.useMemo(() => createCommand({ open, onOpenChange, filter }), [open, onOpenChange, filter])

  const items = React.useMemo(() => {
    const all = collectItems(children, [])
    const known = new Set(all.map((i) => i.value))
    for (const [value, item] of registered) {
      if (!known.has(value)) all.push({ id: value, value, label: value, disabled: item.disabled })
    }
    return all
  }, [children, registered])

  const matches = React.useCallback((value: string) => !search || filter(value, search), [filter, search])
  const filteredItems = React.useMemo(() => items.filter((i) => matches(i.value)), [items, matches])
  const highlighted = filteredItems[selectedIndex]

  const handleSearch = React.useCallback((query: string) => {
    setSearch(query)
    setSelectedIndex(0)
  }, [])

  const handleSelect = React.useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const registerItem = React.useCallback((value: string, item: RegisteredItem) => {
    setRegistered((prev) => {
      const current = prev.get(value)
      if (current && current.domId === item.domId && current.disabled === item.disabled) return prev
      const next = new Map(prev)
      next.set(value, item)
      return next
    })
  }, [])

  const unregisterItem = React.useCallback((value: string) => {
    setRegistered((prev) => {
      if (!prev.has(value)) return prev
      const next = new Map(prev)
      next.delete(value)
      return next
    })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const count = filteredItems.length
    const handler = createKeyboardHandler({
      [Keys.ArrowDown]: (ev) => {
        ev.preventDefault()
        if (count > 0) setSelectedIndex((prev) => (prev + 1) % count)
      },
      [Keys.ArrowUp]: (ev) => {
        ev.preventDefault()
        if (count > 0) setSelectedIndex((prev) => (prev - 1 + count) % count)
      },
      [Keys.Enter]: (ev) => {
        ev.preventDefault()
        if (highlighted && !highlighted.disabled) registered.get(highlighted.value)?.select()
      },
      [Keys.Escape]: (ev) => {
        ev.preventDefault()
        onOpenChange?.(false)
      },
    })
    handler(e.nativeEvent)
  }

  const ctx: CommandContextValue = {
    search,
    onSearch: handleSearch,
    selectedIndex,
    onSelect: handleSelect,
    items,
    filteredItems,
    matches,
    registerItem,
    unregisterItem,
    activeDescendant: highlighted ? registered.get(highlighted.value)?.domId : undefined,
    listId,
    inputId,
  }

  return React.createElement(
    CommandContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      {
        className: cn(commandVariants(), className),
        ...api.ariaProps,
        'aria-owns': listId,
        id: `rfr-cmd-${uid}`,
        onKeyDown: handleKeyDown,
      },
      children,
    ),
  )
}

// ---------------------------------------------------------------------------
// CommandInput
// ---------------------------------------------------------------------------

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  function CommandInput({ className, onChange, ...props }, ref) {
    const { search, onSearch, inputId, listId, activeDescendant } = useCommandContext()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.target.value)
      onChange?.(e)
    }

    return React.createElement('input', {
      ref,
      id: inputId,
      type: 'text',
      role: 'searchbox',
      'aria-autocomplete': 'list',
      'aria-controls': listId,
      'aria-activedescendant': activeDescendant,
      value: search,
      onChange: handleChange,
      className: cn(commandInputVariants(), className),
      ...props,
    })
  },
)

// ---------------------------------------------------------------------------
// CommandList
// ---------------------------------------------------------------------------

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  function CommandList({ className, children, ...props }, ref) {
    const { listId } = useCommandContext()

    return React.createElement(
      'div',
      {
        ref,
        id: listId,
        role: 'listbox',
        'aria-label': 'Command suggestions',
        className: cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className),
        ...props,
      },
      children,
    )
  },
)

// ---------------------------------------------------------------------------
// CommandEmpty
// ---------------------------------------------------------------------------

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  function CommandEmpty({ className, children, ...props }, ref) {
    const { filteredItems } = useCommandContext()

    if (filteredItems.length > 0) return null

    return React.createElement(
      'div',
      {
        ref,
        className: cn('py-6 text-center text-sm', className),
        role: 'presentation',
        ...props,
      },
      children,
    )
  },
)

// ---------------------------------------------------------------------------
// CommandGroup
// ---------------------------------------------------------------------------

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  function CommandGroup({ className, heading, children, ...props }, ref) {
    return React.createElement(
      'div',
      {
        ref,
        className: cn(commandGroupVariants(), className),
        role: 'group',
        'aria-label': heading,
        ...props,
      },
      heading
        ? React.createElement(
            'div',
            { className: 'px-2 py-1.5 text-xs font-medium text-muted-foreground' },
            heading,
          )
        : null,
      children,
    )
  },
)

// ---------------------------------------------------------------------------
// CommandItem
// ---------------------------------------------------------------------------

export interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value?: string
  disabled?: boolean
  onSelect?: () => void
}

export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  function CommandItem(
    { className, value, disabled = false, onSelect: onItemSelect, onClick, onMouseMove, children, ...props },
    ref,
  ) {
    const { matches, filteredItems, selectedIndex, onSelect, registerItem, unregisterItem } =
      useCommandContext()
    const itemValue = itemValueOf(value, children)
    const domId = `rfr-cmd-item-${React.useId().replace(/:/g, '')}`

    // Latest onSelect without re-registering on every render.
    const onSelectRef = React.useRef(onItemSelect)
    onSelectRef.current = onItemSelect

    React.useEffect(() => {
      registerItem(itemValue, { domId, disabled, select: () => onSelectRef.current?.() })
    }, [registerItem, itemValue, domId, disabled])
    React.useEffect(() => () => unregisterItem(itemValue), [unregisterItem, itemValue])

    if (!matches(itemValue)) return null

    const index = filteredItems.findIndex((i) => i.value === itemValue)
    const isSelected = index !== -1 && index === selectedIndex
    const state = disabled ? 'disabled' : isSelected ? 'selected' : 'default'

    return React.createElement(
      'div',
      {
        ref,
        id: domId,
        role: 'option',
        'aria-selected': isSelected,
        'aria-disabled': disabled,
        'data-value': itemValue,
        'data-selected': isSelected ? '' : undefined,
        className: cn(commandItemVariants({ state }), className),
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          onClick?.(e)
          if (!disabled && !e.defaultPrevented) onItemSelect?.()
        },
        onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
          onMouseMove?.(e)
          if (index !== -1 && index !== selectedIndex) onSelect(index)
        },
        ...props,
      },
      children,
    )
  },
)

// ---------------------------------------------------------------------------
// CommandSeparator
// ---------------------------------------------------------------------------

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  function CommandSeparator({ className, ...props }, ref) {
    return React.createElement('div', {
      ref,
      role: 'separator',
      className: cn('-mx-1 h-px bg-border', className),
      ...props,
    })
  },
)
