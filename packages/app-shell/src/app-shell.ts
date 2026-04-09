import { generateId } from '@elloloop/shared'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BreakpointName = 'mobile' | 'tablet' | 'desktop'

export interface AppShellConfig {
  /** Sidebar width when expanded (default '16rem') */
  sidebarWidth?: string
  /** Sidebar width when collapsed to icon-only (default '4rem') */
  sidebarCollapsedWidth?: string
  /** Header height (default '3.5rem') */
  headerHeight?: string
  /** Breakpoint below which layout is mobile (default 768) */
  mobileBreakpoint?: number
  /** Breakpoint below which layout is tablet (default 1024) */
  tabletBreakpoint?: number
  /** Sidebar position (default 'left') */
  sidebarPosition?: 'left' | 'right'
  /** Whether sidebar can be collapsed on desktop (default true) */
  sidebarCollapsible?: boolean
  /** Whether sidebar starts collapsed on desktop (default false) */
  sidebarDefaultCollapsed?: boolean
  /** Mobile nav position (default 'bottom') */
  mobileNavPosition?: 'bottom' | 'none'
}

export interface AppShellState {
  /** On mobile: drawer open/closed */
  sidebarOpen: boolean
  /** On desktop: full/icon-only */
  sidebarCollapsed: boolean
  /** Current responsive breakpoint */
  breakpoint: BreakpointName
  /** Convenience: breakpoint === 'mobile' */
  isMobile: boolean
  /** Convenience: breakpoint === 'tablet' */
  isTablet: boolean
  /** Convenience: breakpoint === 'desktop' */
  isDesktop: boolean
}

export type AppShellSubscriber = (state: AppShellState) => void

export interface AppShellAPI {
  /** Current state (snapshot — will not mutate) */
  state: AppShellState
  /** Resolved config with all defaults applied */
  config: Required<AppShellConfig>

  /** Mobile: open/close drawer. Desktop: collapse/expand sidebar. */
  toggleSidebar(): void
  /** Open sidebar (mobile drawer) */
  openSidebar(): void
  /** Close sidebar (mobile drawer) */
  closeSidebar(): void
  /** Collapse sidebar to icon-only (desktop) */
  collapseSidebar(): void
  /** Expand sidebar from icon-only (desktop) */
  expandSidebar(): void
  /** Update the current breakpoint */
  setBreakpoint(bp: BreakpointName): void

  /** CSS custom property map for layout dimensions */
  getCSSVariables(): Record<string, string>

  /** ARIA attributes for sidebar region */
  sidebarAriaProps: Record<string, string>
  /** ARIA attributes for main region */
  mainAriaProps: Record<string, string>
  /** ARIA attributes for header region */
  headerAriaProps: Record<string, string>
  /** ARIA attributes for mobile bottom nav */
  mobileNavAriaProps: Record<string, string>
  /** ARIA attributes for mobile sidebar overlay/backdrop */
  overlayAriaProps: Record<string, string>

  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe(fn: AppShellSubscriber): () => void
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS: Required<AppShellConfig> = {
  sidebarWidth: '16rem',
  sidebarCollapsedWidth: '4rem',
  headerHeight: '3.5rem',
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  sidebarPosition: 'left',
  sidebarCollapsible: true,
  sidebarDefaultCollapsed: false,
  mobileNavPosition: 'bottom',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveBreakpoint(
  width: number,
  mobileBp: number,
  tabletBp: number,
): BreakpointName {
  if (width < mobileBp) return 'mobile'
  if (width < tabletBp) return 'tablet'
  return 'desktop'
}

function makeState(
  sidebarOpen: boolean,
  sidebarCollapsed: boolean,
  breakpoint: BreakpointName,
): AppShellState {
  return {
    sidebarOpen,
    sidebarCollapsed,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAppShell(config?: AppShellConfig): AppShellAPI {
  const resolved: Required<AppShellConfig> = { ...DEFAULTS, ...config }

  // Internal mutable state
  let sidebarOpen = false
  let sidebarCollapsed = resolved.sidebarDefaultCollapsed
  let breakpoint: BreakpointName = 'desktop' // SSR default

  const subscribers = new Set<AppShellSubscriber>()

  const sidebarId = generateId('rfr-shell-sidebar')

  function getState(): AppShellState {
    return makeState(sidebarOpen, sidebarCollapsed, breakpoint)
  }

  function notify(): void {
    const s = getState()
    for (const fn of subscribers) {
      fn(s)
    }
  }

  function toggleSidebar(): void {
    if (breakpoint === 'mobile') {
      sidebarOpen = !sidebarOpen
    } else if (resolved.sidebarCollapsible) {
      sidebarCollapsed = !sidebarCollapsed
    }
    notify()
  }

  function openSidebar(): void {
    sidebarOpen = true
    notify()
  }

  function closeSidebar(): void {
    sidebarOpen = false
    notify()
  }

  function collapseSidebar(): void {
    sidebarCollapsed = true
    notify()
  }

  function expandSidebar(): void {
    sidebarCollapsed = false
    notify()
  }

  function setBreakpoint(bp: BreakpointName): void {
    if (bp === breakpoint) return
    breakpoint = bp
    // Auto-close mobile drawer when moving to desktop
    if (bp !== 'mobile') {
      sidebarOpen = false
    }
    notify()
  }

  function getCSSVariables(): Record<string, string> {
    const currentWidth = sidebarCollapsed
      ? resolved.sidebarCollapsedWidth
      : resolved.sidebarWidth
    return {
      '--shell-sidebar-width': currentWidth,
      '--shell-sidebar-full-width': resolved.sidebarWidth,
      '--shell-sidebar-collapsed-width': resolved.sidebarCollapsedWidth,
      '--shell-header-height': resolved.headerHeight,
    }
  }

  function subscribe(fn: AppShellSubscriber): () => void {
    subscribers.add(fn)
    return () => {
      subscribers.delete(fn)
    }
  }

  return {
    get state() {
      return getState()
    },
    config: resolved,

    toggleSidebar,
    openSidebar,
    closeSidebar,
    collapseSidebar,
    expandSidebar,
    setBreakpoint,

    getCSSVariables,

    sidebarAriaProps: {
      role: 'navigation',
      'aria-label': 'Sidebar',
      id: sidebarId,
    },
    mainAriaProps: {
      role: 'main',
    },
    headerAriaProps: {
      role: 'banner',
    },
    mobileNavAriaProps: {
      role: 'navigation',
      'aria-label': 'Mobile navigation',
    },
    overlayAriaProps: {
      'aria-hidden': 'true',
    },

    subscribe,
  }
}

export { resolveBreakpoint }
