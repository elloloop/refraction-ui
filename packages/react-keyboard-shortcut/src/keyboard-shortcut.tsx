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
  SANE_DEFAULT_SHORTCUT_INFO,
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
  /**
   * What the shortcut does, listed by help screens such as ShortcutsDialog.
   * Defaults to the SANE_DEFAULTS action's description when `action` is set.
   */
  description?: string;
  /** Section the shortcut is listed under. Defaults to the action's group when `action` is set. */
  group?: string;
}

export function useShortcut({
  shortcut,
  action,
  onTrigger,
  enabled = true,
  preventDefault = true,
  description,
  group,
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

  const actionInfo = action ? SANE_DEFAULT_SHORTCUT_INFO[action] : undefined;
  const listedDescription = description ?? actionInfo?.description;
  const listedGroup = group ?? actionInfo?.group;

  const apiRef = React.useRef(
    createKeyboardShortcut({ keys, onTrigger, enabled, preventDefault })
  );

  React.useEffect(() => {
    apiRef.current = createKeyboardShortcut({ keys, onTrigger, enabled, preventDefault });
  }, [keys, onTrigger, enabled, preventDefault]);

  React.useEffect(() => {
    if (!enabled || keys.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      apiRef.current.handler(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, keys]);

  // Registered separately so a new description re-lists the shortcut without
  // re-attaching its keydown listener.
  React.useEffect(() => {
    if (!enabled || keys.length === 0) return;

    const handler = () => { apiRef.current.handler(new KeyboardEvent('keydown')); };
    globalShortcutRegistry.register(keys, handler, {
      description: listedDescription,
      group: listedGroup,
    });
    return () => {
      globalShortcutRegistry.unregister(keys, handler);
    };
  }, [enabled, keys, listedDescription, listedGroup]);

  return { keys, showHints };
}

export interface ShortcutHintProps extends Omit<ShortcutBadgeProps, 'keys'> {
  shortcut?: string;
  action?: string;
}

export const ShortcutHint = React.forwardRef<HTMLDivElement, ShortcutHintProps>(
  function ShortcutHint({ shortcut, action, className, platform = true, ...props }, ref) {
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
    <div ref={ref} className={cn("absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10", className)}>
      <ShortcutBadge keys={keys} platform={platform} {...props} />
    </div>
  );
  },
)

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
