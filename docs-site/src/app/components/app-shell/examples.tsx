'use client'

import { AppShell } from '@refraction-ui/react-app-shell'

interface AppShellExamplesProps {
  section: 'layout'
}

const navItems = ['Dashboard', 'Projects', 'Team', 'Settings']

export function AppShellExamples({ section }: AppShellExamplesProps) {
  if (section === 'layout') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        {/* Constrain the shell to a card-sized region for the docs preview */}
        <div className="h-[420px] overflow-hidden rounded-lg border border-border">
          <AppShell className="h-full">
            <AppShell.Sidebar className="w-56 p-4">
              <div className="mb-4 text-sm font-semibold text-foreground">Acme Inc.</div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
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
      </div>
    )
  }

  return null
}
