'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@refraction-ui/react-tabs'

export function TabsExample() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-medium text-foreground">Overview</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Refraction UI provides a per-component headless architecture. Each component
              has a framework-agnostic core that handles state, ARIA, and keyboard interactions.
              React bindings add JSX rendering with Tailwind classes.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="installation" className="mt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-medium text-foreground">Installation</h3>
            <pre className="mt-2 text-sm font-mono text-muted-foreground">
              pnpm add @refraction-ui/react
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="font-medium text-foreground">Usage</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Import components from the meta package or individual packages.
              Wrap your app in ThemeProvider for dark mode support.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
