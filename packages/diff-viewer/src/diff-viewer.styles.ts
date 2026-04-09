import { cva } from '@refraction-ui/shared'
import type { TokenContract } from '@refraction-ui/shared'

export const diffViewerTokens: TokenContract = {
  name: 'diff-viewer',
  tokens: {
    bg: { variable: '--rfr-diff-bg', fallback: 'hsl(var(--background))' },
    fg: { variable: '--rfr-diff-fg', fallback: 'hsl(var(--foreground))' },
    sidebarBg: { variable: '--rfr-diff-sidebar-bg', fallback: 'hsl(var(--muted))' },
    headerBg: { variable: '--rfr-diff-header-bg', fallback: 'hsl(var(--muted))' },
    border: { variable: '--rfr-diff-border', fallback: 'hsl(var(--border))' },
    addBg: { variable: '--rfr-diff-add-bg', fallback: 'rgba(46, 160, 67, 0.15)' },
    delBg: { variable: '--rfr-diff-del-bg', fallback: 'rgba(248, 81, 73, 0.15)' },
    addFg: { variable: '--rfr-diff-add-fg', fallback: '#3fb950' },
    delFg: { variable: '--rfr-diff-del-fg', fallback: '#f85149' },
    statusbar: { variable: '--rfr-diff-statusbar', fallback: 'hsl(var(--primary))' },
    statusbarFg: { variable: '--rfr-diff-statusbar-fg', fallback: 'hsl(var(--primary-foreground))' },
  },
}

export const diffViewerVariants = cva({
  base: 'flex flex-col overflow-hidden font-sans text-sm',
  variants: {
    theme: {
      light: 'bg-white text-gray-900',
      dark: 'bg-gray-950 text-gray-100',
    },
    fullscreen: {
      'true': 'h-screen',
      'false': '',
    },
  },
  defaultVariants: {
    theme: 'dark',
    fullscreen: 'true',
  },
})

export const sidebarVariants = cva({
  base: 'border-r overflow-auto flex-shrink-0',
  variants: {
    theme: {
      light: 'bg-gray-50 border-gray-200',
      dark: 'bg-gray-900 border-gray-800',
    },
  },
  defaultVariants: {
    theme: 'dark',
  },
})

export const sidebarItemVariants = cva({
  base: 'px-2.5 py-1 cursor-pointer text-xs font-mono transition-colors',
  variants: {
    active: {
      'true': 'border-l-2 border-blue-500',
      'false': 'border-l-2 border-transparent',
    },
    theme: {
      light: '',
      dark: '',
    },
  },
  compoundVariants: [
    { active: 'true', theme: 'dark', class: 'bg-gray-800 text-gray-100' },
    { active: 'false', theme: 'dark', class: 'text-gray-400 hover:bg-gray-800/50' },
    { active: 'true', theme: 'light', class: 'bg-blue-50 text-gray-900' },
    { active: 'false', theme: 'light', class: 'text-gray-600 hover:bg-gray-100' },
  ],
  defaultVariants: {
    active: 'false',
    theme: 'dark',
  },
})

export const tabBarVariants = cva({
  base: 'flex items-center border-b overflow-auto flex-shrink-0',
  variants: {
    theme: {
      light: 'bg-gray-50 border-gray-200',
      dark: 'bg-gray-900 border-gray-800',
    },
  },
  defaultVariants: {
    theme: 'dark',
  },
})

export const tabVariants = cva({
  base: 'px-3 h-[35px] flex items-center gap-1 cursor-pointer text-xs font-mono border-r shrink-0',
  variants: {
    active: {
      'true': '',
      'false': '',
    },
    theme: {
      light: 'border-gray-200',
      dark: 'border-gray-800',
    },
  },
  compoundVariants: [
    { active: 'true', theme: 'dark', class: 'bg-gray-950 text-gray-100 border-b-gray-950 -mb-px' },
    { active: 'false', theme: 'dark', class: 'text-gray-400' },
    { active: 'true', theme: 'light', class: 'bg-white text-gray-900 border-b-white -mb-px' },
    { active: 'false', theme: 'light', class: 'text-gray-500' },
  ],
  defaultVariants: {
    active: 'false',
    theme: 'dark',
  },
})

export const statusBarVariants = cva({
  base: 'h-[22px] flex items-center px-2.5 gap-3 text-[11px] font-mono flex-shrink-0',
  variants: {
    theme: {
      light: 'bg-blue-600 text-white',
      dark: 'bg-blue-700 text-white',
    },
  },
  defaultVariants: {
    theme: 'dark',
  },
})
