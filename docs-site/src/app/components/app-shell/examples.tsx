'use client'

import * as React from 'react'
import { AppShell } from '@refraction-ui/react-app-shell'

interface AppShellExamplesProps {
  section: 'basic' | 'collapsed' | 'right'
}

export function AppShellExamples({ section }: AppShellExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="h-[400px] w-full border border-border rounded-xl overflow-hidden relative bg-background">
        <AppShell>
          <AppShell.Sidebar className="bg-muted/50 p-4">
            <div className="font-bold mb-4">Sidebar</div>
            <nav className="space-y-2">
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-3/4 bg-border rounded" />
              <div className="h-4 w-1/2 bg-border rounded" />
            </nav>
          </AppShell.Sidebar>
          <AppShell.Main>
            <AppShell.Header className="justify-between">
              <div className="font-semibold">Header</div>
              <div className="h-8 w-8 bg-border rounded-full" />
            </AppShell.Header>
            <AppShell.Content>
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Main Content</h2>
                <p className="text-muted-foreground">This is the default layout with a left sidebar.</p>
                <div className="grid gap-4 grid-cols-2">
                  <div className="h-32 bg-muted rounded-lg" />
                  <div className="h-32 bg-muted rounded-lg" />
                </div>
              </div>
            </AppShell.Content>
          </AppShell.Main>
        </AppShell>
      </div>
    )
  }

  if (section === 'collapsed') {
    return (
      <div className="h-[400px] w-full border border-border rounded-xl overflow-hidden relative bg-background">
        <AppShell config={{ sidebarDefaultCollapsed: true }}>
          <AppShell.Sidebar className="bg-muted/50 p-4">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 bg-primary rounded-lg" />
              <div className="h-8 w-8 bg-border rounded-lg" />
              <div className="h-8 w-8 bg-border rounded-lg" />
            </div>
          </AppShell.Sidebar>
          <AppShell.Main>
            <AppShell.Header>
              <div className="font-semibold">Collapsed Sidebar</div>
            </AppShell.Header>
            <AppShell.Content>
              <p className="text-muted-foreground">The sidebar is collapsed to icon-only mode by default.</p>
            </AppShell.Content>
          </AppShell.Main>
        </AppShell>
      </div>
    )
  }

  if (section === 'right') {
    return (
      <div className="h-[400px] w-full border border-border rounded-xl overflow-hidden relative bg-background">
        <AppShell config={{ sidebarPosition: 'right' }}>
          <AppShell.Main>
            <AppShell.Header>
              <div className="font-semibold">Right Sidebar</div>
            </AppShell.Header>
            <AppShell.Content>
              <p className="text-muted-foreground">Layout with the sidebar on the right side.</p>
            </AppShell.Content>
          </AppShell.Main>
          <AppShell.Sidebar className="bg-muted/50 p-4">
            <div className="font-bold mb-4">Right Sidebar</div>
          </AppShell.Sidebar>
        </AppShell>
      </div>
    )
  }

  return null
}
