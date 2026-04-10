// AppShell compound components
export { default as AppShell } from './AppShell.astro'
export { default as AppShellSidebar } from './AppShellSidebar.astro'
export { default as AppShellHeader } from './AppShellHeader.astro'
export { default as AppShellMain } from './AppShellMain.astro'
export { default as AppShellContent } from './AppShellContent.astro'
export { default as AppShellMobileNav } from './AppShellMobileNav.astro'
export { default as AppShellOverlay } from './AppShellOverlay.astro'

// PageShell compound components
export { default as PageShell } from './PageShell.astro'
export { default as PageShellNav } from './PageShellNav.astro'
export { default as PageShellSection } from './PageShellSection.astro'
export { default as PageShellFooter } from './PageShellFooter.astro'

// AuthShell compound components
export { default as AuthShell } from './AuthShell.astro'
export { default as AuthShellCard } from './AuthShellCard.astro'

// Re-export core types
export { createAppShell, createPageShell, createAuthShell } from '@refraction-ui/app-shell'
