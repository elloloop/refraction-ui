import * as React from 'react'
import {
  createCommand,
  commandVariants,
  commandInputVariants,
  commandItemVariants,
  commandGroupVariants,
  type CommandProps as CoreCommandProps,
  type CommandItemData,
} from '@elloloop/command'
import { cn, createKeyboardHandler, Keys } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CommandContextValue {
  search: string
  onSearch: (query: string) => void
  selectedIndex: number
  onSelect: (index: number) => void
  items: CommandItemData[]
  filteredItems: CommandItemData[]
  registerItem: (item: CommandItemData) => void
  unregisterItem: (id: string) => void
  listId: string
  inputId: string
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommandContext(): CommandContextValue {
  const ctx = React.useContext(CommandContext)
  if (!ctx) {
    throw new Error('Command compound components must be used within <Command>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Command (root provider)
// ---------------------------------------------------------------------------

export interface CommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  filter?: (value: string, search: string) => boolean
  className?: string
  children?: React.ReactNode
}

export function Command({
  open,
  onOpenChange,
  filter,
  className,
  children,
}: CommandProps) {
  const [items, setItems] = React.useState<CommandItemData[]>([])
  const [search, setSearch] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  const apiRef = React.useRef<ReturnType<typeof createCommand> | null>(null)

  // Recompute the API when items or search change
  const api = React.useMemo(() => {
    const instance = createCommand({ open, onOpenChange, filter }, items)
    if (search) {
      instance.search(search)
    }
    apiRef.current = instance
    return instance
  }, [open, onOpenChange, filter, items, search])

  const filteredItems = api.state.filteredItems

  const handleSearch = React.useCallback((query: string) => {
    setSearch(query)
    setSelectedIndex(0)
  }, [])

  const handleSelect = React.useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const registerItem = React.useCallback((item: CommandItemData) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const unregisterItem = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const handler = createKeyboardHandler({
        [Keys.ArrowDown]: (ev) => {
          ev.preventDefault()
          if (filteredItems.length > 0) {
            setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
          }
        },
        [Keys.ArrowUp]: (ev) => {
          ev.preventDefault()
          if (filteredItems.length > 0) {
            setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
          }
        },
        [Keys.Enter]: (ev) => {
          ev.preventDefault()
        },
        [Keys.Escape]: (ev) => {
          ev.preventDefault()
          onOpenChange?.(false)
        },
      })
      handler(e.nativeEvent)
    },
    [filteredItems.length, onOpenChange],
  )

  const ctx = React.useMemo<CommandContextValue>(
    () => ({
      search,
      onSearch: handleSearch,
      selectedIndex,
      onSelect: handleSelect,
      items,
      filteredItems,
      registerItem,
      unregisterItem,
      listId: api.ids.list,
      inputId: api.ids.input,
    }),
    [search, handleSearch, selectedIndex, handleSelect, items, filteredItems, registerItem, unregisterItem, api.ids.list, api.ids.input],
  )

  return React.createElement(
    CommandContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      {
        className: cn(commandVariants(), className),
        ...api.ariaProps,
        onKeyDown: handleKeyDown,
      },
      children,
    ),
  )
}

Command.displayName = 'Command'

// ---------------------------------------------------------------------------
// CommandInput
// ---------------------------------------------------------------------------

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onChange, ...props }, ref) => {
    const { search, onSearch, inputId, listId } = useCommandContext()

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
      value: search,
      onChange: handleChange,
      className: cn(commandInputVariants(), className),
      ...props,
    })
  },
)

CommandInput.displayName = 'CommandInput'

// ---------------------------------------------------------------------------
// CommandList
// ---------------------------------------------------------------------------

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...props }, ref) => {
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

CommandList.displayName = 'CommandList'

// ---------------------------------------------------------------------------
// CommandEmpty
// ---------------------------------------------------------------------------

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children, ...props }, ref) => {
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

CommandEmpty.displayName = 'CommandEmpty'

// ---------------------------------------------------------------------------
// CommandGroup
// ---------------------------------------------------------------------------

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string
}

export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => {
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

CommandGroup.displayName = 'CommandGroup'

// ---------------------------------------------------------------------------
// CommandItem
// ---------------------------------------------------------------------------

export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  disabled?: boolean
  onSelect?: () => void
}

export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, value, disabled, onSelect: onItemSelect, children, ...props }, ref) => {
    const state = disabled ? 'disabled' : 'default'

    return React.createElement(
      'div',
      {
        ref,
        role: 'option',
        'aria-selected': false,
        'aria-disabled': disabled ?? false,
        'data-value': value,
        className: cn(commandItemVariants({ state }), className),
        onClick: () => {
          if (!disabled) {
            onItemSelect?.()
          }
        },
        ...props,
      },
      children,
    )
  },
)

CommandItem.displayName = 'CommandItem'

// ---------------------------------------------------------------------------
// CommandSeparator
// ---------------------------------------------------------------------------

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => {
    return React.createElement('div', {
      ref,
      role: 'separator',
      className: cn('-mx-1 h-px bg-border', className),
      ...props,
    })
  },
)

CommandSeparator.displayName = 'CommandSeparator'
