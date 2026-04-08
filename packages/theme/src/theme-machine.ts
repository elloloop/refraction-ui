/**
 * Headless theme state machine — pure TypeScript, zero DOM dependencies.
 * Manages light/dark/system mode with system preference tracking.
 */

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeState {
  /** User's chosen mode */
  mode: ThemeMode
  /** Resolved theme after system preference detection */
  resolved: ResolvedTheme
}

export interface ThemeConfig {
  /** Initial mode. Default: 'system' */
  defaultMode?: ThemeMode
  /** localStorage key. Default: 'rfr-theme' */
  storageKey?: string
  /** HTML attribute to set. Default: 'class' */
  attribute?: 'class' | 'data-theme'
}

export interface StorageAdapter {
  get(key: string): string | null
  set(key: string, value: string): void
}

export interface MediaQueryAdapter {
  matches(query: string): boolean
  subscribe(query: string, callback: (matches: boolean) => void): () => void
}

export interface ThemeAPI {
  /** Get current state */
  getState(): ThemeState
  /** Set mode (light/dark/system) */
  setMode(mode: ThemeMode): void
  /** Subscribe to state changes */
  subscribe(fn: (state: ThemeState) => void): () => void
  /** Clean up subscriptions */
  destroy(): void
}

function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === 'system') {
    return systemPrefersDark ? 'dark' : 'light'
  }
  return mode
}

export function createTheme(
  config: ThemeConfig = {},
  storage?: StorageAdapter,
  mediaQuery?: MediaQueryAdapter,
): ThemeAPI {
  const {
    defaultMode = 'system',
    storageKey = 'rfr-theme',
  } = config

  const listeners = new Set<(state: ThemeState) => void>()
  let cleanupMediaQuery: (() => void) | null = null

  // Read persisted mode or use default
  const persisted = storage?.get(storageKey) as ThemeMode | null
  let mode: ThemeMode = persisted && ['light', 'dark', 'system'].includes(persisted)
    ? persisted
    : defaultMode

  // Detect system preference
  let systemPrefersDark = mediaQuery?.matches('(prefers-color-scheme: dark)') ?? false

  let state: ThemeState = {
    mode,
    resolved: resolveTheme(mode, systemPrefersDark),
  }

  function notify() {
    for (const fn of listeners) {
      fn(state)
    }
  }

  function updateState(newMode: ThemeMode) {
    mode = newMode
    state = { mode, resolved: resolveTheme(mode, systemPrefersDark) }
    storage?.set(storageKey, mode)
    notify()
  }

  // Listen for system preference changes
  if (mediaQuery) {
    cleanupMediaQuery = mediaQuery.subscribe(
      '(prefers-color-scheme: dark)',
      (matches) => {
        systemPrefersDark = matches
        if (mode === 'system') {
          state = { mode, resolved: resolveTheme(mode, systemPrefersDark) }
          notify()
        }
      },
    )
  }

  return {
    getState() {
      return state
    },

    setMode(newMode: ThemeMode) {
      if (newMode !== mode) {
        updateState(newMode)
      }
    },

    subscribe(fn: (state: ThemeState) => void) {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },

    destroy() {
      listeners.clear()
      cleanupMediaQuery?.()
    },
  }
}
