import * as React from 'react'
import {
  createVersionSelector,
  versionSelectorVariants,
  optionVariants,
  latestBadgeVariants,
  type VersionSelectorAPI,
  type VersionOption,
} from '@refraction-ui/version-selector'
import { cn } from '@refraction-ui/shared'

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface VersionSelectorContextValue {
  api: VersionSelectorAPI
  isOpen: boolean
  setOpen: (value: boolean) => void
  select: (value: string) => void
  versions: VersionOption[]
}

const VersionSelectorContext = React.createContext<VersionSelectorContextValue | null>(null)

function useVersionSelectorContext(): VersionSelectorContextValue {
  const ctx = React.useContext(VersionSelectorContext)
  if (!ctx) {
    throw new Error('VersionSelector compound components must be used within <VersionSelector>')
  }
  return ctx
}

/* ------------------------------------------------------------------ */
/*  VersionSelector (root component)                                   */
/* ------------------------------------------------------------------ */

export interface VersionSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  versions: VersionOption[]
  placeholder?: string
  className?: string
}

export function VersionSelector({
  value: controlledValue,
  onValueChange,
  versions,
  placeholder = 'Select version...',
  className,
}: VersionSelectorProps) {
  const [selectedVersion, setSelectedVersion] = React.useState(controlledValue ?? '')
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleValueChange = React.useCallback(
    (val: string) => {
      setSelectedVersion(val)
      onValueChange?.(val)
    },
    [onValueChange],
  )

  const api = React.useMemo(
    () =>
      createVersionSelector({
        value: selectedVersion,
        onValueChange: handleValueChange,
        versions,
      }),
    [selectedVersion, handleValueChange, versions],
  )

  const handleSelect = React.useCallback(
    (val: string) => {
      setSelectedVersion(val)
      onValueChange?.(val)
      setIsOpen(false)
    },
    [onValueChange],
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

  const ctx = React.useMemo<VersionSelectorContextValue>(
    () => ({
      api,
      isOpen,
      setOpen: setIsOpen,
      select: handleSelect,
      versions,
    }),
    [api, isOpen, handleSelect, versions],
  )

  const selectedOpt = versions.find((v) => v.value === selectedVersion)
  const displayLabel = selectedOpt ? selectedOpt.label : placeholder

  return React.createElement(
    VersionSelectorContext.Provider,
    { value: ctx },
    React.createElement(
      'div',
      { ref: containerRef, className: cn('rfr-version-selector relative inline-block', className) },
      // Trigger
      React.createElement(
        'button',
        {
          type: 'button',
          role: api.triggerProps.role,
          'aria-expanded': isOpen,
          'aria-controls': api.triggerProps['aria-controls'],
          'aria-haspopup': api.triggerProps['aria-haspopup'],
          className: versionSelectorVariants(),
          onClick: handleTriggerClick,
          onKeyDown: handleKeyDown,
        },
        React.createElement('span', null, displayLabel),
        selectedOpt?.isLatest &&
          React.createElement(
            'span',
            { className: cn(latestBadgeVariants(), 'ml-2') },
            'Latest',
          ),
        React.createElement('span', { 'aria-hidden': 'true', className: 'ml-2' }, '\u25BE'),
      ),
      // Dropdown
      isOpen &&
        React.createElement(
          'ul',
          {
            role: api.contentProps.role,
            id: api.contentProps.id,
            className:
              'absolute top-full left-0 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md z-50 overflow-auto max-h-60',
          },
          ...versions.map((ver) => {
            const optProps = api.getOptionProps(ver.value)
            const isSelected = selectedVersion === ver.value
            return React.createElement(
              'li',
              {
                key: ver.value,
                ...optProps,
                className: optionVariants({ selected: isSelected ? 'true' : 'false' }),
                onClick: () => handleSelect(ver.value),
              },
              React.createElement('span', null, ver.label),
              ver.isLatest &&
                React.createElement(
                  'span',
                  { className: latestBadgeVariants() },
                  'Latest',
                ),
            )
          }),
        ),
    ),
  )
}

VersionSelector.displayName = 'VersionSelector'
