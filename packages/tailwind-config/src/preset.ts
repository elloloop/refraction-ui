/**
 * Refraction UI Tailwind preset — shared configuration for all projects.
 * Works with Tailwind v3 (via presets) and v4 (via @import).
 *
 * Usage (Tailwind v3):
 *   const { refractionPreset } = require('@refraction-ui/tailwind-config')
 *   module.exports = { presets: [refractionPreset] }
 *
 * Usage (Tailwind v4):
 *   @import '@refraction-ui/tailwind-config/css';
 */

import { colors } from './colors.js'
import { keyframes, animation } from './animations.js'

export const refractionPreset = {
  darkMode: 'class' as const,
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors,
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', '"Times New Roman"', 'serif'],
        heading: ['var(--font-heading)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      transitionDuration: {
        DEFAULT: 'var(--transition)',
      },
      keyframes,
      animation,
    },
  },
}
