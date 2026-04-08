import * as React from 'react'
import {
  createLanguageSelector,
  selectorVariants,
  optionVariants,
  type LanguageSelectorAPI,
  type LanguageOption,
} from '@refraction-ui/language-selector'
import { cn } from '@refraction-ui/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface LanguageSelectorContextValue {
  api: LanguageSelectorAPI
  isOpen: boolean
  setOpen: (value: boolean) => void
  toggle: (value: string) => void
  options: LanguageOption[]
  multiple: boolean
}

const LanguageSelectorContext = React.createContext<LanguageSelectorContextValue | null>(null)

function useLanguageSelectorContext(): LanguageSelectorContextValue {
  const ctx = React.useContext(LanguageSelectorContext)
  if (!ctx) {
    throw new Error('LanguageSelector compound components must be used within <LanguageSelector>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  LanguageSelector (root component)                                  */
/* ------------------------------------------------------------------ */

export interface LanguageSelectorProps {
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  options: LanguageOption[]
  multiple?: boolean
  placeholder?: string
  className?: string
}

export function LanguageSelector({
  value: controlledValue,
  onValueChange,
  options,
  multiple = false,
  placeholder = 'Select language...',
  className,
}: LanguageSelectorProps) {
  const initialValues = Array.isArray(controlledValue)
    ? controlledValue
    : controlledValue
      ? [controlledValue]
      : []

  const [selectedValues, setSelectedValues] = React.useState<string[]>(initialValues)
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleValueChange = React.useCallback(
    (val: string | string[]) => {
      const arr = Array.isArray(val) ? val : [val]
      setSelectedValues(arr)
      onValueChange?.(val)
    },
    [onValueChange],
  )

  const api = React.useMemo(
    () =>
      createLanguageSelector({
        value: multiple ? selectedValues : selectedValues[0],
        onValueChange: handleValueChange,
        options,
        multiple,
      }),
    [selectedValues, handleValueChange, options, multiple],
  )

  const handleToggle = React.useCallback(
    (val: string) => {
      if (multiple) {
        const index = selectedValues.indexOf(val)
        const next = index >= 0
          ? selectedValues.filter((v) => v !== val)
          : [...selectedValues, val]
        setSelectedValues(next)
        onValueChange?.(next)
      } else {
        setSelectedValues([val])
        onValueChange?.(val)
        setIsOpen(false)
      }
    },
    [multiple, selectedValues, onValueChange],
  )

  const handleTriggerClick = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!isOpen) {
          setIsOpen(true)
        }
      }
    },
    [isOpen],
  )

  // Click outside to close
  React.useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const ctx = React.useMemo<LanguageSelectorContextValue>(
    () => ({
      api,
      isOpen,
      setOpen: setIsOpen,
      toggle: handleToggle,
      options,
      multiple,
    }),
    [api, isOpen, handleToggle, options, multiple],
  )

  // Group options
  const grouped = React.useMemo(() => {
    const groups = new Map<string, LanguageOption[]>()
    const ungrouped: LanguageOption[] = []
    for (const opt of options) {
      if (opt.group) {
        const list = groups.get(opt.group) ?? []
        list.push(opt)
        groups.set(opt.group, list)
      } else {
        ungrouped.push(opt)
      }
    }
    return { groups, ungrouped }
  }, [options])

  const displayLabel = selectedValues.length > 0
    ? options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.label)
        .join(', ')
    : placeholder

  return React.createElement(
    LanguageSelectorContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      { ref: containerRef, className: cn('rfr-language-selector relative inline-block', className) },
      // Trigger
      React.createElement(
        'button',
        {
          type: 'button',
          role: api.triggerProps.role,
          'aria-expanded': isOpen,
          'aria-controls': api.triggerProps['aria-controls'],
          'aria-haspopup': api.triggerProps['aria-haspopup'],
          className: selectorVariants(),
          onClick: handleTriggerClick,
          onKeyDown: handleKeyDown,
        },
        React.createElement('span', null, displayLabel),
        React.createElement('span', { 'aria-hidden': 'true', className: 'ml-2' }, '\u25BE'),
      ),
      // Dropdown
      isOpen &&
        React.createElement(
          'ul',
          {
            role: api.contentProps.role,
            id: api.contentProps.id,
            ...(multiple ? { 'aria-multiselectable': true } : {}),
            className:
              'absolute top-full left-0 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-auto max-h-60',
          },
          // Render grouped options
          ...[...grouped.groups.entries()].map(([group, opts]) =>
            React.createElement(
              'li',
              { key: group, role: 'presentation' },
              React.createElement(
                'div',
                { className: 'px-3 py-1 text-xs font-semibold text-muted-foreground uppercase' },
                group,
              ),
              React.createElement(
                'ul',
                { role: 'group', 'aria-label': group },
                ...opts.map((opt) => {
                  const optProps = api.getOptionProps(opt.value)
                  const isSelected = selectedValues.includes(opt.value)
                  return React.createElement(
                    'li',
                    {
                      key: opt.value,
                      ...optProps,
                      className: optionVariants({ selected: isSelected ? 'true' : 'false' }),
                      onClick: () => handleToggle(opt.value),
                    },
                    isSelected && React.createElement('span', { 'aria-hidden': 'true' }, '\u2713'),
                    React.createElement('span', null, opt.label),
                  )
                }),
              ),
            ),
          ),
          // Ungrouped options
          ...grouped.ungrouped.map((opt) => {
            const optProps = api.getOptionProps(opt.value)
            const isSelected = selectedValues.includes(opt.value)
            return React.createElement(
              'li',
              {
                key: opt.value,
                ...optProps,
                className: optionVariants({ selected: isSelected ? 'true' : 'false' }),
                onClick: () => handleToggle(opt.value),
              },
              isSelected && React.createElement('span', { 'aria-hidden': 'true' }, '\u2713'),
              React.createElement('span', null, opt.label),
            )
          }),
        ),
    ),
  )
}

LanguageSelector.displayName = 'LanguageSelector'
