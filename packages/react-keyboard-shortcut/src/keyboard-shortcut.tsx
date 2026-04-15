import * as React from 'react'
import {
  createKeyboardShortcut,
  formatShortcut,
  shortcutBadgeStyles,
  shortcutKeyStyles,
  shortcutSeparatorStyles,
  altHintState,
  globalShortcutRegistry,
  SANE_DEFAULTS,
} from '@refraction-ui/keyboard-shortcut'
import { cn } from '@refraction-ui/shared'

export const ShortcutContext = React.createContext<boolean>(false)

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
  const [showHints, setShowHints] = React.useState(altHintState.snapshot)

  React.useEffect(() => {
    altHintState.init()
    return altHintState.subscribe(setShowHints)
  }, [])

  return (
    <ShortcutContext.Provider value={showHints}>
      {children}
    </ShortcutContext.Provider>
  )
}

export interface UseShortcutOptions {
  shortcut?: string;
  action?: string;
  onTrigger: () => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useShortcut({
  shortcut,
  action,
  onTrigger,
  enabled = true,
  preventDefault = true,
}: UseShortcutOptions) {
  const showHints = React.useContext(ShortcutContext);

  const keys = React.useMemo(() => {
    if (shortcut) {
      return shortcut.split('+').map((s) => s.trim());
    }
    if (action && SANE_DEFAULTS[action]) {
      return SANE_DEFAULTS[action];
    }
    return [];
  }, [shortcut, action]);

  const apiRef = React.useRef(
    createKeyboardShortcut({ keys, onTrigger, enabled, preventDefault })
  );

  React.useEffect(() => {
    apiRef.current = createKeyboardShortcut({ keys, onTrigger, enabled, preventDefault });
  }, [keys, onTrigger, enabled, preventDefault]);

  React.useEffect(() => {
    if (!enabled || keys.length === 0) return;

    const handler = () => { apiRef.current.handler(new KeyboardEvent('keydown')); };
    globalShortcutRegistry.register(keys, handler);

    const handleKeyDown = (e: KeyboardEvent) => {
      apiRef.current.handler(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      globalShortcutRegistry.unregister(keys);
    };
  }, [enabled, keys]);

  return { keys, showHints };
}

export interface ShortcutHintProps extends Omit<ShortcutBadgeProps, 'keys'> {
  shortcut?: string;
  action?: string;
}

export function ShortcutHint({ shortcut, action, className, platform = true, ...props }: ShortcutHintProps) {
  const showHints = React.useContext(ShortcutContext);

  const keys = React.useMemo(() => {
    if (shortcut) {
      return shortcut.split('+').map((s) => s.trim());
    }
    if (action && SANE_DEFAULTS[action]) {
      return SANE_DEFAULTS[action];
    }
    return [];
  }, [shortcut, action]);

  if (!showHints || keys.length === 0) return null;

  return (
    <div className={cn("absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10", className)}>
      <ShortcutBadge keys={keys} platform={platform} {...props} />
    </div>
  );
}

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
