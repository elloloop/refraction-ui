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
  },
  render: (args) => {
    const { default: slotContent, ...rest } = args;
    const propsStr = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => typeof v === 'boolean' ? (v ? k : '') : `${k}="${v}"`)
      .join(' ');
    return {
      components: { Component },
      template: `<Component ${propsStr}>${slotContent}</Component>`
    };
  }
}
