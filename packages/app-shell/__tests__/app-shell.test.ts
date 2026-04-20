import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createAppShell, resolveBreakpoint } from '../src/app-shell.js'

beforeEach(() => {
  resetIdCounter()
})

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

describe('createAppShell — default config', () => {
  it('returns resolved config with all defaults', () => {
    const api = createAppShell()
    expect(api.config.sidebarWidth).toBe('16rem')
    expect(api.config.sidebarCollapsedWidth).toBe('4rem')
    expect(api.config.headerHeight).toBe('3.5rem')
    expect(api.config.mobileBreakpoint).toBe(768)
    expect(api.config.tabletBreakpoint).toBe(1024)
    expect(api.config.sidebarPosition).toBe('left')
    expect(api.config.sidebarCollapsible).toBe(true)
    expect(api.config.sidebarDefaultCollapsed).toBe(false)
    expect(api.config.mobileNavPosition).toBe('bottom')
  })

  it('respects partial config overrides', () => {
    const api = createAppShell({ sidebarWidth: '20rem', headerHeight: '4rem' })
    expect(api.config.sidebarWidth).toBe('20rem')
    expect(api.config.headerHeight).toBe('4rem')
    // Rest are defaults
    expect(api.config.sidebarCollapsedWidth).toBe('4rem')
  })

  it('drops undefined config values so they do not overwrite defaults', () => {
    const api = createAppShell({ sidebarWidth: undefined })
    expect(api.config.sidebarWidth).toBe('16rem')
  })
})

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('createAppShell — initial state', () => {
  it('defaults to desktop breakpoint', () => {
    const api = createAppShell()
    expect(api.state.breakpoint).toBe('desktop')
    expect(api.state.isDesktop).toBe(true)
    expect(api.state.isMobile).toBe(false)
    expect(api.state.isTablet).toBe(false)
  })

  it('sidebar starts closed (not open as drawer)', () => {
    const api = createAppShell()
    expect(api.state.sidebarOpen).toBe(false)
  })

  it('sidebar starts not collapsed by default', () => {
    const api = createAppShell()
    expect(api.state.sidebarCollapsed).toBe(false)
  })

  it('sidebar starts collapsed when configured', () => {
    const api = createAppShell({ sidebarDefaultCollapsed: true })
    expect(api.state.sidebarCollapsed).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Sidebar open/close (mobile drawer)
// ---------------------------------------------------------------------------

describe('createAppShell — sidebar open/close', () => {
  it('openSidebar sets sidebarOpen to true', () => {
    const api = createAppShell()
    api.openSidebar()
    expect(api.state.sidebarOpen).toBe(true)
  })

  it('closeSidebar sets sidebarOpen to false', () => {
    const api = createAppShell()
    api.openSidebar()
    api.closeSidebar()
    expect(api.state.sidebarOpen).toBe(false)
  })

  it('toggleSidebar on mobile toggles sidebarOpen', () => {
    const api = createAppShell()
    api.setBreakpoint('mobile')
    expect(api.state.sidebarOpen).toBe(false)
    api.toggleSidebar()
    expect(api.state.sidebarOpen).toBe(true)
    api.toggleSidebar()
    expect(api.state.sidebarOpen).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Sidebar collapse/expand (desktop)
// ---------------------------------------------------------------------------

describe('createAppShell — sidebar collapse/expand', () => {
  it('collapseSidebar sets sidebarCollapsed to true', () => {
    const api = createAppShell()
    api.collapseSidebar()
    expect(api.state.sidebarCollapsed).toBe(true)
  })

  it('expandSidebar sets sidebarCollapsed to false', () => {
    const api = createAppShell()
    api.collapseSidebar()
    api.expandSidebar()
    expect(api.state.sidebarCollapsed).toBe(false)
  })

  it('toggleSidebar on desktop toggles collapse', () => {
    const api = createAppShell()
    expect(api.state.sidebarCollapsed).toBe(false)
    api.toggleSidebar()
    expect(api.state.sidebarCollapsed).toBe(true)
    api.toggleSidebar()
    expect(api.state.sidebarCollapsed).toBe(false)
  })

  it('toggleSidebar does nothing on desktop if sidebarCollapsible is false', () => {
    const api = createAppShell({ sidebarCollapsible: false })
    expect(api.state.sidebarCollapsed).toBe(false)
    api.toggleSidebar()
    expect(api.state.sidebarCollapsed).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Breakpoint detection
// ---------------------------------------------------------------------------

describe('createAppShell — breakpoint', () => {
  it('setBreakpoint changes to mobile', () => {
    const api = createAppShell()
    api.setBreakpoint('mobile')
    expect(api.state.breakpoint).toBe('mobile')
    expect(api.state.isMobile).toBe(true)
    expect(api.state.isDesktop).toBe(false)
    expect(api.state.isTablet).toBe(false)
  })

  it('setBreakpoint changes to tablet', () => {
    const api = createAppShell()
    api.setBreakpoint('tablet')
    expect(api.state.breakpoint).toBe('tablet')
    expect(api.state.isTablet).toBe(true)
    expect(api.state.isMobile).toBe(false)
    expect(api.state.isDesktop).toBe(false)
  })

  it('auto-closes mobile drawer when moving to desktop', () => {
    const api = createAppShell()
    api.setBreakpoint('mobile')
    api.openSidebar()
    expect(api.state.sidebarOpen).toBe(true)
    api.setBreakpoint('desktop')
    expect(api.state.sidebarOpen).toBe(false)
  })

  it('auto-closes mobile drawer when moving to tablet', () => {
    const api = createAppShell()
    api.setBreakpoint('mobile')
    api.openSidebar()
    api.setBreakpoint('tablet')
    expect(api.state.sidebarOpen).toBe(false)
  })

  it('does not notify when breakpoint does not change', () => {
    const api = createAppShell()
    const fn = vi.fn()
    api.subscribe(fn)
    api.setBreakpoint('desktop') // already desktop
    expect(fn).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// resolveBreakpoint helper
// ---------------------------------------------------------------------------

describe('resolveBreakpoint', () => {
  it('returns mobile for width < mobileBreakpoint', () => {
    expect(resolveBreakpoint(400, 768, 1024)).toBe('mobile')
  })

  it('returns tablet for width >= mobile and < tablet', () => {
    expect(resolveBreakpoint(800, 768, 1024)).toBe('tablet')
  })

  it('returns desktop for width >= tabletBreakpoint', () => {
    expect(resolveBreakpoint(1200, 768, 1024)).toBe('desktop')
  })

  it('returns mobile at 0', () => {
    expect(resolveBreakpoint(0, 768, 1024)).toBe('mobile')
  })

  it('returns tablet at exact mobile breakpoint', () => {
    expect(resolveBreakpoint(768, 768, 1024)).toBe('tablet')
  })

  it('returns desktop at exact tablet breakpoint', () => {
    expect(resolveBreakpoint(1024, 768, 1024)).toBe('desktop')
  })
})

// ---------------------------------------------------------------------------
// CSS variables
// ---------------------------------------------------------------------------

describe('createAppShell — CSS variables', () => {
  it('returns all CSS variables', () => {
    const api = createAppShell()
    const vars = api.getCSSVariables()
    expect(vars['--shell-sidebar-width']).toBe('16rem')
    expect(vars['--shell-sidebar-full-width']).toBe('16rem')
    expect(vars['--shell-sidebar-collapsed-width']).toBe('4rem')
    expect(vars['--shell-header-height']).toBe('3.5rem')
  })

  it('sidebar-width reflects collapsed state', () => {
    const api = createAppShell()
    api.collapseSidebar()
    const vars = api.getCSSVariables()
    expect(vars['--shell-sidebar-width']).toBe('4rem')
    expect(vars['--shell-sidebar-full-width']).toBe('16rem')
  })

  it('uses custom sidebar widths', () => {
    const api = createAppShell({ sidebarWidth: '20rem', sidebarCollapsedWidth: '5rem' })
    const vars = api.getCSSVariables()
    expect(vars['--shell-sidebar-width']).toBe('20rem')
    expect(vars['--shell-sidebar-collapsed-width']).toBe('5rem')
  })

  it('uses custom header height', () => {
    const api = createAppShell({ headerHeight: '4rem' })
    const vars = api.getCSSVariables()
    expect(vars['--shell-header-height']).toBe('4rem')
  })
})

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

describe('createAppShell — ARIA', () => {
  it('sidebarAriaProps has navigation role', () => {
    const api = createAppShell()
    expect(api.sidebarAriaProps.role).toBe('navigation')
    expect(api.sidebarAriaProps['aria-label']).toBe('Sidebar')
    expect(api.sidebarAriaProps.id).toMatch(/^rfr-shell-sidebar-/)
  })

  it('mainAriaProps has main role', () => {
    const api = createAppShell()
    expect(api.mainAriaProps.role).toBe('main')
  })

  it('headerAriaProps has banner role', () => {
    const api = createAppShell()
    expect(api.headerAriaProps.role).toBe('banner')
  })

  it('mobileNavAriaProps has navigation role', () => {
    const api = createAppShell()
    expect(api.mobileNavAriaProps.role).toBe('navigation')
    expect(api.mobileNavAriaProps['aria-label']).toBe('Mobile navigation')
  })

  it('overlayAriaProps has aria-hidden', () => {
    const api = createAppShell()
    expect(api.overlayAriaProps['aria-hidden']).toBe('true')
  })

  it('multiple instances generate unique sidebar IDs', () => {
    const api1 = createAppShell()
    const api2 = createAppShell()
    expect(api1.sidebarAriaProps.id).not.toBe(api2.sidebarAriaProps.id)
  })
})

// ---------------------------------------------------------------------------
// Subscribe
// ---------------------------------------------------------------------------

describe('createAppShell — subscribe', () => {
  it('notifies subscribers on state change', () => {
    const api = createAppShell()
    const fn = vi.fn()
    api.subscribe(fn)
    api.openSidebar()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ sidebarOpen: true }),
    )
  })

  it('unsubscribe stops notifications', () => {
    const api = createAppShell()
    const fn = vi.fn()
    const unsub = api.subscribe(fn)
    unsub()
    api.openSidebar()
    expect(fn).not.toHaveBeenCalled()
  })

  it('multiple subscribers all get notified', () => {
    const api = createAppShell()
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    api.subscribe(fn1)
    api.subscribe(fn2)
    api.collapseSidebar()
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
  })

  it('subscriber receives correct state after breakpoint change', () => {
    const api = createAppShell()
    const fn = vi.fn()
    api.subscribe(fn)
    api.setBreakpoint('mobile')
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ breakpoint: 'mobile', isMobile: true }),
    )
  })

  it('subscriber receives correct state after toggleSidebar', () => {
    const api = createAppShell()
    const fn = vi.fn()
    api.subscribe(fn)
    api.toggleSidebar() // desktop: collapses
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ sidebarCollapsed: true }),
    )
  })
})

// ---------------------------------------------------------------------------
// Config: sidebarPosition
// ---------------------------------------------------------------------------

describe('createAppShell — sidebarPosition', () => {
  it('defaults to left', () => {
    const api = createAppShell()
    expect(api.config.sidebarPosition).toBe('left')
  })

  it('can be set to right', () => {
    const api = createAppShell({ sidebarPosition: 'right' })
    expect(api.config.sidebarPosition).toBe('right')
  })
})

// ---------------------------------------------------------------------------
// Config: mobileNavPosition
// ---------------------------------------------------------------------------

describe('createAppShell — mobileNavPosition', () => {
  it('defaults to bottom', () => {
    const api = createAppShell()
    expect(api.config.mobileNavPosition).toBe('bottom')
  })

  it('can be set to none', () => {
    const api = createAppShell({ mobileNavPosition: 'none' })
    expect(api.config.mobileNavPosition).toBe('none')
  })
})
