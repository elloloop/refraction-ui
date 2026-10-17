export interface ShortcutProps {
  /** Key combination (e.g., ['Ctrl', 'K'] or ['Meta', 'Shift', 'P']) */
  keys: string[]
  /** Callback when the shortcut is triggered */
  onTrigger: () => void
  /** Whether the shortcut is enabled */
  enabled?: boolean
  /** Prevent default browser behavior */
  preventDefault?: boolean
}

export interface KeyboardShortcutAPI {
  /** Handle a keyboard event (returns true if it matched) */
  handler(event: KeyboardEvent): boolean
  /** Human-readable display of the shortcut */
  display: string
  /** Platform-aware display (uses command symbol on Mac) */
  platformDisplay: string
  /** Whether the shortcut is currently enabled */
  enabled: boolean
  /** The key combination */
  keys: string[]
  /** ARIA props for a visual shortcut badge */
  badgeAriaProps: Record<string, unknown>
}

const MODIFIER_KEYS = new Set(['Ctrl', 'Control', 'Alt', 'Shift', 'Meta', 'Cmd', 'Command'])

/** Non-Apple key legends (words such as `Ctrl`/`Alt`, a few glyphs). Exported for Keycap reuse. */
export const KEY_DISPLAY: Readonly<Record<string, string>> = {
  'Ctrl': 'Ctrl',
  'Control': 'Ctrl',
  'Alt': 'Alt',
  'Shift': 'Shift',
  'Meta': 'Meta',
  'Cmd': 'Cmd',
  'Command': 'Cmd',
  'Enter': '\u21B5',
  'Backspace': '\u232B',
  'Delete': 'Del',
  'Escape': 'Esc',
  'ArrowUp': '\u2191',
  'ArrowDown': '\u2193',
  'ArrowLeft': '\u2190',
  'ArrowRight': '\u2192',
  'Tab': 'Tab',
  ' ': 'Space',
}

/** macOS key glyphs (⌘ ⌥ ⌃ ⇧ …). Exported for Keycap reuse. */
export const MAC_KEY_DISPLAY: Readonly<Record<string, string>> = {
  'Ctrl': '\u2303',
  'Control': '\u2303',
  'Alt': '\u2325',
  'Shift': '\u21E7',
  'Meta': '\u2318',
  'Cmd': '\u2318',
  'Command': '\u2318',
  'Enter': '\u21B5',
  'Backspace': '\u232B',
  'Delete': '\u2326',
  'Escape': '\u238B',
  'ArrowUp': '\u2191',
  'ArrowDown': '\u2193',
  'ArrowLeft': '\u2190',
  'ArrowRight': '\u2192',
  'Tab': '\u21E5',
  ' ': '\u2423',
}

function normalizeKey(key: string): string {
  // Normalize modifier variants
  if (key === 'Command' || key === 'Cmd') return 'Meta'
  if (key === 'Control') return 'Ctrl'
  return key
}

/** Best-effort Apple-platform detection from `navigator`; `false` when there is no navigator (SSR). */
export function isMac(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.platform?.includes('Mac') || navigator.userAgent?.includes('Mac')
  }
  return false
}

export function formatShortcut(keys: string[], mac?: boolean): string {
  const displayMap = mac ? MAC_KEY_DISPLAY : KEY_DISPLAY
  return keys.map((key) => displayMap[key] ?? key.toUpperCase()).join(mac ? '' : '+')
}

export function createKeyboardShortcut(props: ShortcutProps): KeyboardShortcutAPI {
  const {
    keys,
    onTrigger,
    enabled: enabledProp = true,
    preventDefault: preventDefaultProp = true,
  } = props

  const normalizedKeys = keys.map(normalizeKey)
  const modifiers = normalizedKeys.filter((k) => MODIFIER_KEYS.has(k))
  const regularKeys = normalizedKeys.filter((k) => !MODIFIER_KEYS.has(k))

  function handler(event: KeyboardEvent): boolean {
    if (!enabledProp) return false

    // Check modifiers
    const ctrlRequired = modifiers.includes('Ctrl')
    const altRequired = modifiers.includes('Alt')
    const shiftRequired = modifiers.includes('Shift')
    const metaRequired = modifiers.includes('Meta')

    if (ctrlRequired !== (event.ctrlKey || event.metaKey && !metaRequired)) {
      // For Ctrl, also accept Meta on Mac
    }

    const ctrlMatch = ctrlRequired ? event.ctrlKey : !event.ctrlKey
    const altMatch = altRequired ? event.altKey : !event.altKey
    const shiftMatch = shiftRequired ? event.shiftKey : !event.shiftKey
    const metaMatch = metaRequired ? event.metaKey : !event.metaKey

    if (!ctrlMatch || !altMatch || !shiftMatch || !metaMatch) return false

    // Check regular key
    if (regularKeys.length > 0) {
      const eventKey = event.key.length === 1 ? event.key.toUpperCase() : event.key
      const targetKey = regularKeys[0].length === 1 ? regularKeys[0].toUpperCase() : regularKeys[0]
      if (eventKey !== targetKey) return false
    }

    if (preventDefaultProp) {
      event.preventDefault()
    }
    onTrigger()
    return true
  }

  const mac = isMac()
  const display = formatShortcut(keys, false)
  const platformDisplay = formatShortcut(keys, mac)

  const badgeAriaProps: Record<string, unknown> = {
    'aria-hidden': true,
    role: 'presentation',
  }

  return {
    handler,
    display,
    platformDisplay,
    enabled: enabledProp,
    keys,
    badgeAriaProps,
  }
}

export const SANE_DEFAULTS: Record<string, string[]> = {
  save: ['Meta', 's'],
  search: ['Meta', 'k'],
  close: ['Escape'],
  submit: ['Meta', 'Enter'],
  undo: ['Meta', 'z'],
  redo: ['Meta', 'Shift', 'z'],
  copy: ['Meta', 'c'],
  paste: ['Meta', 'v'],
  cut: ['Meta', 'x'],
  new: ['Meta', 'n'],
  print: ['Meta', 'p'],
  help: ['?'],
};

/** What a registered shortcut does, for help screens such as ShortcutsDialog. */
export interface ShortcutRegistrationInfo {
  /** What the shortcut does ("Save the document"). */
  description?: string
  /** Section the shortcut is listed under ("Editing"). */
  group?: string
}

/** Group names used by SANE_DEFAULT_SHORTCUT_INFO. */
const SANE_DEFAULT_GROUPS = {
  general: 'General',
  editing: 'Editing',
  clipboard: 'Clipboard',
} as const

/** Descriptions and groups for every SANE_DEFAULTS action, keyed by action name. */
export const SANE_DEFAULT_SHORTCUT_INFO: Readonly<Record<string, Required<ShortcutRegistrationInfo>>> = {
  save: { description: 'Save', group: SANE_DEFAULT_GROUPS.general },
  search: { description: 'Search', group: SANE_DEFAULT_GROUPS.general },
  close: { description: 'Close', group: SANE_DEFAULT_GROUPS.general },
  submit: { description: 'Submit', group: SANE_DEFAULT_GROUPS.general },
  new: { description: 'New', group: SANE_DEFAULT_GROUPS.general },
  print: { description: 'Print', group: SANE_DEFAULT_GROUPS.general },
  help: { description: 'Show keyboard shortcuts', group: SANE_DEFAULT_GROUPS.general },
  undo: { description: 'Undo', group: SANE_DEFAULT_GROUPS.editing },
  redo: { description: 'Redo', group: SANE_DEFAULT_GROUPS.editing },
  copy: { description: 'Copy', group: SANE_DEFAULT_GROUPS.clipboard },
  paste: { description: 'Paste', group: SANE_DEFAULT_GROUPS.clipboard },
  cut: { description: 'Cut', group: SANE_DEFAULT_GROUPS.clipboard },
};

/** A shortcut currently held by a ShortcutRegistry, as listed by `getSnapshot()`. */
export interface RegisteredShortcut extends ShortcutRegistrationInfo {
  /** Registry key: the lower-cased keys, sorted and joined with `+`. */
  id: string
  /** The keys as they were registered. */
  keys: readonly string[]
}

interface RegistryEntry {
  keys: readonly string[]
  handler: () => void
  info: ShortcutRegistrationInfo
}

const EMPTY_SNAPSHOT: readonly RegisteredShortcut[] = Object.freeze([])

function registryKey(keys: readonly string[]): string {
  return keys.map(k => k.toLowerCase()).sort().join('+');
}

export class ShortcutRegistry {
  private shortcuts: Map<string, RegistryEntry> = new Map();
  private listeners: Set<() => void> = new Set();
  private snapshot: readonly RegisteredShortcut[] = EMPTY_SNAPSHOT;

  register(keys: string[], handler: () => void, info: ShortcutRegistrationInfo = {}) {
    const keyStr = registryKey(keys);
    if (this.shortcuts.has(keyStr)) {
      console.warn(`Shortcut ${keyStr} is already registered.`);
    }
    this.shortcuts.set(keyStr, { keys: [...keys], handler, info: { ...info } });
    this.changed();
  }

  /**
   * Removes the shortcut for `keys`. When `handler` is given, the entry is only
   * removed if it is still that handler's — so a component unmounting cannot
   * drop a newer registration of the same keys made by another component.
   */
  unregister(keys: string[], handler?: () => void) {
    const keyStr = registryKey(keys);
    const entry = this.shortcuts.get(keyStr);
    if (!entry) return;
    if (handler && entry.handler !== handler) return;
    this.shortcuts.delete(keyStr);
    this.changed();
  }

  /** Calls `listener` whenever a shortcut is registered or unregistered. Returns an unsubscribe function. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * The registered shortcuts in registration order. The array is immutable and
   * keeps its identity until the registry changes (safe for useSyncExternalStore).
   */
  getSnapshot = (): readonly RegisteredShortcut[] => this.snapshot;

  private changed() {
    this.snapshot = Object.freeze(
      Array.from(this.shortcuts, ([id, entry]) => ({ id, keys: entry.keys, ...entry.info })),
    );
    this.listeners.forEach((listener) => listener());
  }
}

export const globalShortcutRegistry = new ShortcutRegistry();

export class AltHintState {
  private showHints = false;
  private listeners: Set<(show: boolean) => void> = new Set();
  private initialized = false;

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        this.setShowHints(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        this.setShowHints(false);
      }
    };

    const handleBlur = () => {
      this.setShowHints(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
  }

  private setShowHints(value: boolean) {
    if (this.showHints !== value) {
      this.showHints = value;
      this.listeners.forEach((listener) => listener(value));
    }
  }

  subscribe(listener: (show: boolean) => void) {
    this.listeners.add(listener);
    listener(this.showHints);
    return () => {
      this.listeners.delete(listener);
    };
  }

  get snapshot() {
    return this.showHints;
  }
}

export const altHintState = new AltHintState();

