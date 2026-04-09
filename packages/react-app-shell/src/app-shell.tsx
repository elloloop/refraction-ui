import * as React from 'react'
import {
  createAppShell,
  resolveBreakpoint,
  type AppShellConfig,
  type AppShellState,
  type AppShellAPI,
} from '@elloloop/app-shell'
import { cn } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppShellContextValue {
  api: AppShellAPI
  state: AppShellState
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null)

export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext)
  if (!ctx) {
    throw new Error('useAppShell must be used within <AppShell>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// AppShell (root provider)
// ---------------------------------------------------------------------------

export interface AppShellProps {
  config?: AppShellConfig
  children?: React.ReactNode
  className?: string
}

function AppShellRoot({ config, children, className }: AppShellProps) {
  // Create the headless API once
  const apiRef = React.useRef<AppShellAPI | null>(null)
  if (apiRef.current === null) {
    apiRef.current = createAppShell(config)
  }
  const api = apiRef.current

  // Track state reactively via subscribe
  const [state, setState] = React.useState<AppShellState>(() => api.state)

  React.useEffect(() => {
    // Sync initial state
    setState(api.state)
    return api.subscribe((s) => setState(s))
  }, [api])

  // Listen to matchMedia for responsive breakpoints
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const { mobileBreakpoint, tabletBreakpoint } = api.config

    const mobileQuery = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`)
    const tabletQuery = window.matchMedia(
      `(min-width: ${mobileBreakpoint}px) and (max-width: ${tabletBreakpoint - 1}px)`,
    )

    function update() {
      const width = window.innerWidth
      const bp = resolveBreakpoint(width, mobileBreakpoint, tabletBreakpoint)
      api.setBreakpoint(bp)
    }

    // Set initial breakpoint
    update()

    mobileQuery.addEventListener('change', update)
    tabletQuery.addEventListener('change', update)

    return () => {
      mobileQuery.removeEventListener('change', update)
      tabletQuery.removeEventListener('change', update)
    }
  }, [api])

  const cssVars = api.getCSSVariables()

  const ctxValue = React.useMemo<AppShellContextValue>(
    () => ({ api, state }),
    [api, state],
  )

  return React.createElement(
    AppShellContext.Provider,
    { value: ctxValue },
    React.createElement(
      'div',
      {
        className: cn('flex h-screen w-full overflow-hidden', className),
        style: cssVars as React.CSSProperties,
        'data-shell': '',
      },
      children,
    ),
  )
}

AppShellRoot.displayName = 'AppShell'

// ---------------------------------------------------------------------------
// AppShell.Sidebar
// ---------------------------------------------------------------------------

export interface AppShellSidebarProps {
  children?: React.ReactNode
  className?: string
}

function Sidebar({ children, className }: AppShellSidebarProps) {
  const { api, state } = useAppShell()
  const isRight = api.config.sidebarPosition === 'right'

  // On mobile: off-canvas drawer via transform
  // On desktop: static sidebar with variable width
  const baseClasses = [
    'flex flex-col shrink-0 overflow-y-auto overflow-x-hidden',
    'bg-background border-r',
    'transition-[width,transform] duration-200 ease-in-out',
    'h-full',
  ]

  if (isRight) {
    baseClasses[1] = 'flex flex-col shrink-0 overflow-y-auto overflow-x-hidden bg-background border-l'
  }

  const mobileClasses = state.isMobile
    ? [
        'fixed top-0 z-40',
        isRight ? 'right-0' : 'left-0',
        'w-[var(--shell-sidebar-full-width)]',
        state.sidebarOpen
          ? 'translate-x-0'
          : isRight
            ? 'translate-x-full'
            : '-translate-x-full',
      ]
    : ['relative', 'w-[var(--shell-sidebar-width)]']

  return React.createElement(
    'aside',
    {
      ...api.sidebarAriaProps,
      className: cn(baseClasses.join(' '), mobileClasses.join(' '), className),
      'data-collapsed': state.sidebarCollapsed ? '' : undefined,
      'data-open': state.sidebarOpen ? '' : undefined,
    },
    children,
  )
}

Sidebar.displayName = 'AppShell.Sidebar'

// ---------------------------------------------------------------------------
// AppShell.Main
// ---------------------------------------------------------------------------

export interface AppShellMainProps {
  children?: React.ReactNode
  className?: string
}

function Main({ children, className }: AppShellMainProps) {
  return React.createElement(
    'div',
    {
      className: cn('flex flex-1 flex-col min-w-0 h-full', className),
    },
    children,
  )
}

Main.displayName = 'AppShell.Main'

// ---------------------------------------------------------------------------
// AppShell.Header
// ---------------------------------------------------------------------------

export interface AppShellHeaderProps {
  children?: React.ReactNode
  className?: string
}

function Header({ children, className }: AppShellHeaderProps) {
  const { api, state } = useAppShell()

  const hamburger = state.isMobile
    ? React.createElement(
        'button',
        {
          type: 'button',
          'aria-label': 'Toggle sidebar',
          'aria-expanded': state.sidebarOpen,
          'aria-controls': api.sidebarAriaProps.id,
          onClick: () => api.toggleSidebar(),
          className: 'inline-flex items-center justify-center p-2 mr-2',
        },
        React.createElement(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: 24,
            height: 24,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            'aria-hidden': 'true',
          },
          React.createElement('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
          React.createElement('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
          React.createElement('line', { x1: 3, y1: 18, x2: 21, y2: 18 }),
        ),
      )
    : null

  return React.createElement(
    'header',
    {
      ...api.headerAriaProps,
      className: cn(
        'sticky top-0 z-30 flex items-center shrink-0',
        'h-[var(--shell-header-height)]',
        'border-b bg-background px-4',
        className,
      ),
    },
    hamburger,
    children,
  )
}

Header.displayName = 'AppShell.Header'

// ---------------------------------------------------------------------------
// AppShell.Content
// ---------------------------------------------------------------------------

export interface AppShellContentProps {
  children?: React.ReactNode
  className?: string
  /** Tailwind max-width class suffix, e.g. '6xl' -> max-w-6xl */
  maxWidth?: string
}

function Content({ children, className, maxWidth }: AppShellContentProps) {
  const { api } = useAppShell()
  const mwClass = maxWidth ? `max-w-${maxWidth}` : ''

  return React.createElement(
    'main',
    {
      ...api.mainAriaProps,
      className: cn(
        'flex-1 overflow-y-auto',
        mwClass ? `${mwClass} mx-auto w-full` : '',
        'px-4 sm:px-6 lg:px-8 py-6',
        className,
      ),
    },
    children,
  )
}

Content.displayName = 'AppShell.Content'

// ---------------------------------------------------------------------------
// AppShell.MobileNav
// ---------------------------------------------------------------------------

export interface AppShellMobileNavProps {
  children?: React.ReactNode
  className?: string
}

function MobileNav({ children, className }: AppShellMobileNavProps) {
  const { api, state } = useAppShell()

  if (!state.isMobile) return null
  if (api.config.mobileNavPosition === 'none') return null

  return React.createElement(
    'nav',
    {
      ...api.mobileNavAriaProps,
      className: cn(
        'fixed bottom-0 left-0 right-0 z-30',
        'flex items-center justify-around',
        'border-t bg-background',
        'h-14',
        className,
      ),
    },
    children,
  )
}

MobileNav.displayName = 'AppShell.MobileNav'

// ---------------------------------------------------------------------------
// AppShell.Overlay
// ---------------------------------------------------------------------------

export interface AppShellOverlayProps {
  className?: string
}

function Overlay({ className }: AppShellOverlayProps) {
  const { api, state } = useAppShell()

  if (!state.isMobile || !state.sidebarOpen) return null

  return React.createElement('div', {
    ...api.overlayAriaProps,
    className: cn(
      'fixed inset-0 z-30 bg-black/50 transition-opacity',
      className,
    ),
    onClick: () => api.closeSidebar(),
    'data-shell-overlay': '',
  })
}

Overlay.displayName = 'AppShell.Overlay'

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const AppShell = Object.assign(AppShellRoot, {
  Sidebar,
  Main,
  Header,
  Content,
  MobileNav,
  Overlay,
})

export type { AppShellConfig, AppShellState, AppShellAPI }
