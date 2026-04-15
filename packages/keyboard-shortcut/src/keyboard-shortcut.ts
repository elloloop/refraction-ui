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

const KEY_DISPLAY: Record<string, string> = {
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

const MAC_KEY_DISPLAY: Record<string, string> = {
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

function isMac(): boolean {
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

export class ShortcutRegistry {
  private shortcuts: Map<string, () => void> = new Map();

  register(keys: string[], handler: () => void) {
    const keyStr = keys.map(k => k.toLowerCase()).sort().join('+');
    if (this.shortcuts.has(keyStr)) {
      console.warn(`Shortcut ${keyStr} is already registered.`);
    }
    this.shortcuts.set(keyStr, handler);
  }

  unregister(keys: string[]) {
    const keyStr = keys.map(k => k.toLowerCase()).sort().join('+');
    this.shortcuts.delete(keyStr);
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

