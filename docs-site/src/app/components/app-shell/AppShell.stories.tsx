import type { Meta, StoryObj } from '@storybook/react'
import { AppShell } from '@refraction-ui/react-app-shell'

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
}
export default meta
type Story = StoryObj<typeof AppShell>

export const Default: Story = {
  render: (args) => {
    const navItems = ['Dashboard', 'Projects', 'Team', 'Settings']
    return (
      <div className="h-[420px] overflow-hidden rounded-lg border border-border relative">
        <AppShell {...args} className="h-full">
          <AppShell.Sidebar className="w-56 p-4">
            <div className="mb-4 text-sm font-semibold text-foreground">Acme Inc.</div>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a key={item} href="#" onClick={(e) => e.preventDefault()} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                  {item}
                </a>
              ))}
            </nav>
          </AppShell.Sidebar>
          <AppShell.Main>
            <AppShell.Header>
              <span className="text-sm font-medium text-foreground">Dashboard</span>
            </AppShell.Header>
            <AppShell.Content>
              <h3 className="text-base font-semibold text-foreground">Welcome back</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                This is the scrollable main content region. On narrow viewports the sidebar
                becomes an off-canvas drawer toggled by the header hamburger button.
              </p>
            </AppShell.Content>
          </AppShell.Main>
          <AppShell.Overlay />
        </AppShell>
      </div>
    )
  }
}
