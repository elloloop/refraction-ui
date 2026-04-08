export {
  createTheme,
  type ThemeMode,
  type ResolvedTheme,
  type ThemeState,
  type ThemeConfig,
  type ThemeAPI,
  type StorageAdapter,
  type MediaQueryAdapter,
} from './theme-machine.js'

export { getThemeScript } from './theme-script.js'

export {
  createLocalStorageAdapter,
  createMediaQueryAdapter,
  applyThemeToDOM,
} from './dom-adapters.js'
