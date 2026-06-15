import Component from './AppShell.astro'

const meta = {
  title: 'Astro/AppShell',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    sidebarWidth: 'Example sidebarWidth',
    sidebarCollapsedWidth: 'Example sidebarCollapsedWidth',
    headerHeight: 'Example headerHeight',
    mobileBreakpoint: 42,
    tabletBreakpoint: 42,
    sidebarPosition: undefined,
    sidebarCollapsible: false,
    sidebarDefaultCollapsed: false,
    mobileNavPosition: undefined
  }
}
