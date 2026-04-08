/**
 * Custom Tailwind utility classes consolidated from all projects.
 * These are registered as a Tailwind plugin.
 */

import type { PluginCreator } from './plugin-types.js'

export const utilitiesPlugin: PluginCreator = ({ addUtilities }) => {
  addUtilities({
    '.scrollbar-hide': {
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    },
    '.safe-top': {
      'padding-top': 'env(safe-area-inset-top)',
    },
    '.safe-bottom': {
      'padding-bottom': 'env(safe-area-inset-bottom)',
    },
    '.snap-lane': {
      'scroll-snap-type': 'x mandatory',
      '& > *': { 'scroll-snap-align': 'start' },
    },
    '.momentum-scroll': {
      '-webkit-overflow-scrolling': 'touch',
    },
    '.press-scale': {
      '&:active': { transform: 'scale(0.97)' },
    },
    '.drag-handle': {
      width: '36px',
      height: '4px',
      'border-radius': '2px',
      'background-color': 'hsl(var(--muted-foreground) / 0.3)',
      margin: '8px auto',
    },
    '.text-gradient': {
      'background-image': 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      'background-clip': 'text',
    },
    '.glass': {
      background: 'hsl(var(--background) / 0.8)',
      '-webkit-backdrop-filter': 'blur(12px)',
      'backdrop-filter': 'blur(12px)',
    },
    '.motion-safe': {
      '@media (prefers-reduced-motion: no-preference)': {
        'animation-duration': 'var(--animation-duration, inherit)',
      },
    },
    '.motion-reduce': {
      '@media (prefers-reduced-motion: reduce)': {
        'animation-duration': '0.01ms !important',
        'animation-iteration-count': '1 !important',
        'transition-duration': '0.01ms !important',
      },
    },
  })
}
