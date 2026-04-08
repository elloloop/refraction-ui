export { refractionPreset } from './preset.js'
export { colors } from './colors.js'
export { keyframes, animation } from './animations.js'
export { utilitiesPlugin } from './utilities.js'

// Default theme (glassa.ai-inspired) — the ONE place to configure the look
export { glassaTheme, generateThemeCSS, getThemeVariableNames } from './themes/glassa.js'

// Accessibility: WCAG contrast ratio validation
export {
  parseHSL,
  hslToLuminance,
  contrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  validateThemeContrast,
} from './contrast.js'
