export { refractionPreset } from './preset.js'
export { colors } from './colors.js'
export { keyframes, animation } from './animations.js'
export { utilitiesPlugin } from './utilities.js'

// Theme system
export {
  // Types
  type ThemeDefinition,
  // Individual themes
  refractionTheme,
  luxeTheme,
  warmTheme,
  signalTheme,
  pulseTheme,
  monoTheme,
  // Registry
  THEMES,
  DEFAULT_THEME,
  // Backward compat
  glassaTheme,
  // Utilities
  generateThemeCSS,
  getThemeVariableNames,
} from './themes/glassa.js'

// Accessibility: WCAG contrast ratio validation
export {
  parseHSL,
  hslToLuminance,
  contrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  validateThemeContrast,
} from './contrast.js'
