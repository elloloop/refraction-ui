import { AppShellExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const appShellProps = [
  {
    name: 'config',
    type: 'AppShellConfig',
    description:
      'Headless configuration — breakpoints, sidebar position/width, and mobile-nav position. Drives responsive behavior and the emitted CSS variables.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root flex container.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Compose the layout from the sub-components below.',
  },
]

const subComponentProps = [
  {
    name: 'AppShell.Sidebar',
    type: 'aside',
    description: 'Off-canvas drawer on mobile, static rail on desktop. Reads width from CSS variables.',
  },
  {
    name: 'AppShell.Main',
    type: 'div',
    description: 'Flex column holding the header and content beside the sidebar.',
  },
  {
    name: 'AppShell.Header',
    type: 'header',
    description: 'Sticky top bar. Renders a hamburger toggle automatically on mobile.',
  },
  {
    name: 'AppShell.Content',
    type: 'main',
    description: 'Scrollable content region. Accepts an optional `maxWidth` (e.g. "6xl").',
  },
  {
    name: 'AppShell.MobileNav',
    type: 'nav',
    description: 'Fixed bottom navigation bar, shown only on mobile when configured.',
  },
  {
    name: 'AppShell.Overlay',
    type: 'div',
    description: 'Scrim shown behind the open mobile drawer; clicking it closes the sidebar.',
  },
]

const usageCode = `import { AppShell } from '@refraction-ui/react'

export function MyApp() {
  return (
    <AppShell className="h-screen">
      <AppShell.Sidebar className="w-56 p-4">
        <nav>{/* nav links */}</nav>
      </AppShell.Sidebar>

      <AppShell.Main>
        <AppShell.Header>
          <span>Dashboard</span>
        </AppShell.Header>
        <AppShell.Content maxWidth="6xl">
          {/* page content */}
        </AppShell.Content>
      </AppShell.Main>

      <AppShell.Overlay />
    </AppShell>
  )
}`

export default function AppShellPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">App Shell</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A responsive application layout with a collapsible sidebar, sticky header, and
          scrollable content. Built on the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/app-shell</code> core,
          with state exposed via <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">useAppShell()</code>.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Layout</h2>
        <p className="text-sm text-muted-foreground">
          A typical dashboard shell. The preview is constrained to a fixed-height region;
          in your app you would size the root to the viewport.
        </p>
        <AppShellExamples section="layout" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-app-shell" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={appShellProps} />
        <p className="text-sm text-muted-foreground">
          Compound sub-components — compose these inside <code className="text-xs bg-muted px-1 rounded">&lt;AppShell&gt;</code>.
        </p>
        <PropsTable props={subComponentProps} />
      </section>
    </div>
  )
}
