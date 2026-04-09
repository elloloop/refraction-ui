import * as React from 'react'
import {
  createKeyboardShortcut,
  formatShortcut,
  shortcutBadgeStyles,
  shortcutKeyStyles,
  shortcutSeparatorStyles,
} from '@elloloop/keyboard-shortcut'
import { cn } from '@elloloop/shared'

export interface KeyboardShortcutProps {
  /** Key combination */
  keys: string[]
  /** Callback when triggered */
  onTrigger: () => void
  /** Whether enabled */
  enabled?: boolean
  /** Prevent default browser behavior */
  preventDefault?: boolean
}

/**
 * Invisible keyboard shortcut listener component.
 * Attaches a global keydown listener and calls onTrigger when the combo matches.
 */
export function KeyboardShortcut({
  keys,
  onTrigger,
  enabled = true,
  preventDefault = true,
}: KeyboardShortcutProps) {
  const apiRef = React.useRef(
    createKeyboardShortcut({ keys, onTrigger, enabled, preventDefault }),
  )

  // Keep handler in sync with latest props
  React.useEffect(() => {
    apiRef.current = createKeyboardShortcut({ keys, onTrigger, enabled, preventDefault })
  }, [keys, onTrigger, enabled, preventDefault])

  React.useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      apiRef.current.handler(e)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled])

  return null
}

KeyboardShortcut.displayName = 'KeyboardShortcut'

// ---------------------------------------------------------------------------
// ShortcutBadge — visual display of a keyboard shortcut (e.g., Ctrl+K)
// ---------------------------------------------------------------------------

export interface ShortcutBadgeProps {
  /** Key combination to display */
  keys: string[]
  /** Use platform-aware display (Mac symbols) */
  platform?: boolean
  className?: string
}

export function ShortcutBadge({ keys, platform = true, className }: ShortcutBadgeProps) {
  const api = createKeyboardShortcut({ keys, onTrigger: () => {}, enabled: false })

  const displayKeys = platform ? api.platformDisplay : api.display

  // Split display into individual keys for styling
  const isMacDisplay = platform && displayKeys !== api.display

  return React.createElement(
    'kbd',
    { ...api.badgeAriaProps, className: cn(shortcutBadgeStyles, className) },
    isMacDisplay
      ? React.createElement('span', null, displayKeys)
      : keys.map((key, i) =>
          React.createElement(
            React.Fragment,
            { key: i },
            i > 0 && React.createElement('span', { className: shortcutSeparatorStyles }, '+'),
            React.createElement(
              'span',
              { className: shortcutKeyStyles },
              formatShortcut([key], false),
            ),
          ),
        ),
  )
}

ShortcutBadge.displayName = 'ShortcutBadge'
