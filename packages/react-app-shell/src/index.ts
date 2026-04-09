export {
  AppShell,
  useAppShell,
  type AppShellProps,
  type AppShellSidebarProps,
  type AppShellMainProps,
  type AppShellHeaderProps,
  type AppShellContentProps,
  type AppShellMobileNavProps,
  type AppShellOverlayProps,
  type AppShellConfig,
  type AppShellState,
  type AppShellAPI,
} from './app-shell.js'

export {
  PageShell,
  type PageShellProps,
  type PageShellNavProps,
  type PageShellSectionProps,
  type PageShellFooterProps,
  type PageShellConfig,
  type SectionConfig,
  type PageShellAPI,
} from './page-shell.js'

export {
  AuthShell,
  type AuthShellProps,
  type AuthShellCardProps,
  type AuthShellConfig,
  type AuthShellAPI,
} from './auth-shell.js'

// Re-export headless core types for convenience
export {
  type BreakpointName,
  type AppShellSubscriber,
  resolveBreakpoint,
  createAppShell,
  createPageShell,
  createAuthShell,
} from '@elloloop/app-shell'
