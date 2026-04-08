import Link from 'next/link'
import { ThemeToggleSection } from './theme-toggle-section'

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Theme toggle in top-right */}
      <div className="flex justify-end">
        <ThemeToggleSection />
      </div>

      {/* Hero */}
      <div className="space-y-6">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Refraction UI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Per-component headless UI library for React, Angular, and Astro.
          Ship accessible, themeable interfaces with zero lock-in.
        </p>

        <div className="flex gap-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
            50+ packages
          </span>
          <span className="inline-flex items-center rounded-full bg-chart-3/10 px-3 py-1 text-sm font-medium text-foreground ring-1 ring-inset ring-chart-3/20">
            Fully tested
          </span>
          <span className="inline-flex items-center rounded-full bg-chart-2/10 px-3 py-1 text-sm font-medium text-foreground ring-1 ring-inset ring-chart-2/20">
            WCAG AA
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/components"
          className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/50"
        >
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Component Catalog
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse all components with live examples, variants, and props documentation.
          </p>
        </Link>

        <Link
          href="/theme"
          className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/50"
        >
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Theme Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Customize colors, preview components live, and export your CSS theme variables.
          </p>
        </Link>
      </div>

      {/* Architecture overview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Architecture</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-medium text-foreground">Headless Core</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Framework-agnostic state machines, ARIA, and keyboard handling. No DOM, no CSS.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-medium text-foreground">React Bindings</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thin React wrappers that connect headless cores to JSX with Tailwind styling.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-medium text-foreground">Theme System</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              CSS custom properties with dark mode, presets, and WCAG contrast validation.
            </p>
          </div>
        </div>
      </div>

      {/* Install */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Start</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-mono text-muted-foreground">bash</span>
          </div>
          <pre className="overflow-x-auto p-4">
            <code className="text-sm font-mono text-foreground">{`# Install the meta package (all components)
pnpm add @refraction-ui/react

# Or install individual components
pnpm add @refraction-ui/react-button @refraction-ui/react-dialog`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
