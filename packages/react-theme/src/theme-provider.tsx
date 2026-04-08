import * as React from 'react'
import {
  createTheme,
  createLocalStorageAdapter,
  createMediaQueryAdapter,
  applyThemeToDOM,
  type ThemeMode,
  type ResolvedTheme,
  type ThemeConfig,
  type ThemeAPI,
} from '@refraction-ui/theme'

export interface ThemeContextValue {
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps extends ThemeConfig {
  children: React.ReactNode
}

export function ThemeProvider({
  children,
  defaultMode = 'system',
  storageKey = 'rfr-theme',
  attribute = 'class',
}: ThemeProviderProps) {
  const themeRef = React.useRef<ThemeAPI | null>(null)

  // Initialize theme machine once (client-side only for adapters)
  if (!themeRef.current) {
    const isBrowser = typeof window !== 'undefined'
    themeRef.current = createTheme(
      { defaultMode, storageKey, attribute },
      isBrowser ? createLocalStorageAdapter() : undefined,
      isBrowser ? createMediaQueryAdapter() : undefined,
    )
  }

  const [state, setState] = React.useState(() => themeRef.current!.getState())

  React.useEffect(() => {
    const theme = themeRef.current!
    // Apply initial theme to DOM
    applyThemeToDOM(theme.getState().resolved, attribute)

    // Subscribe to changes
    const unsub = theme.subscribe((newState) => {
      setState(newState)
      applyThemeToDOM(newState.resolved, attribute)
    })

    return () => {
      unsub()
      theme.destroy()
    }
  }, [attribute])

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      mode: state.mode,
      resolved: state.resolved,
      setMode: (mode: ThemeMode) => themeRef.current?.setMode(mode),
    }),
    [state.mode, state.resolved],
  )

  return React.createElement(ThemeContext.Provider, { value: contextValue }, children)
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>')
  }
  return context
}
