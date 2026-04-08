import * as React from 'react'
import { useTheme } from './theme-provider.js'
import type { ThemeMode } from '@refraction-ui/theme'

const modes: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'system', label: 'System', icon: 'monitor' },
]

// Inline SVG icons — no external icon library dependency
const icons: Record<string, React.ReactNode> = {
  sun: React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    React.createElement('circle', { cx: 12, cy: 12, r: 5 }),
    React.createElement('path', { d: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' }),
  ),
  moon: React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    React.createElement('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }),
  ),
  monitor: React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  },
    React.createElement('rect', { x: 2, y: 3, width: 20, height: 14, rx: 2, ry: 2 }),
    React.createElement('line', { x1: 8, y1: 21, x2: 16, y2: 21 }),
    React.createElement('line', { x1: 12, y1: 17, x2: 12, y2: 21 }),
  ),
}

export interface ThemeToggleProps {
  className?: string
  /** 'dropdown' shows a menu, 'segmented' shows inline buttons */
  variant?: 'dropdown' | 'segmented'
}

export function ThemeToggle({ className, variant = 'segmented' }: ThemeToggleProps) {
  const { mode, setMode } = useTheme()

  if (variant === 'segmented') {
    return React.createElement('div', {
      className: `inline-flex items-center gap-1 rounded-lg border p-1 ${className ?? ''}`,
      role: 'radiogroup',
      'aria-label': 'Theme',
    },
      modes.map(({ value, label, icon }) =>
        React.createElement('button', {
          key: value,
          type: 'button',
          role: 'radio',
          'aria-checked': mode === value,
          'aria-label': label,
          className: `inline-flex items-center justify-center rounded-md p-1.5 text-sm transition-colors ${
            mode === value
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`,
          onClick: () => setMode(value),
        }, icons[icon]),
      ),
    )
  }

  // Dropdown variant — simplified, no external dropdown dependency
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentIcon = modes.find((m) => m.value === mode)?.icon ?? 'monitor'

  return React.createElement('div', { ref, className: `relative ${className ?? ''}` },
    React.createElement('button', {
      type: 'button',
      'aria-label': 'Toggle theme',
      'aria-expanded': open,
      className: 'inline-flex items-center justify-center rounded-md p-2 text-sm transition-colors hover:bg-muted',
      onClick: () => setOpen(!open),
    }, icons[currentIcon]),
    open && React.createElement('div', {
      className: 'absolute right-0 top-full mt-1 z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md',
      role: 'menu',
    },
      modes.map(({ value, label, icon }) =>
        React.createElement('button', {
          key: value,
          type: 'button',
          role: 'menuitem',
          className: `flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent ${
            mode === value ? 'bg-accent' : ''
          }`,
          onClick: () => { setMode(value); setOpen(false) },
        }, icons[icon], label),
      ),
    ),
  )
}
