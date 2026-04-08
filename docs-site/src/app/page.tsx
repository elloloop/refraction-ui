import Link from 'next/link'
import { CopyInstallCommand } from './copy-install-command'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient bg-gradient-to-r from-primary via-primary/80 to-primary/60">
              Refraction UI
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Per-component headless UI library for React, Angular, and Astro.
            Ship accessible, themeable interfaces with zero lock-in.
          </p>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            89 packages
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-sm font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            2,691 tests passing
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-sm font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            WCAG AA compliant
          </span>
        </div>

        {/* Install command */}
        <CopyInstallCommand />
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/components"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-4.179 2.25m0 0L12 17.25l-5.571-3m11.142 0 4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Component Catalog
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Browse all components with live examples, variants, and props documentation.
          </p>
        </Link>

        <Link
          href="/theme"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
        >
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            Theme Playground
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Customize colors, preview components live, and export your CSS theme variables.
          </p>
        </Link>
      </div>

      {/* Architecture overview */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Architecture</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A layered approach that separates logic from presentation.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Headless Core</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Framework-agnostic state machines, ARIA, and keyboard handling. No DOM, no CSS.
            </p>
          </div>
          <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">React Bindings</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Thin React wrappers that connect headless cores to JSX with Tailwind styling.
            </p>
          </div>
          <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Theme System</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              CSS custom properties with dark mode, presets, and WCAG contrast validation.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Quick Start</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get up and running in under a minute.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400/40" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/40" />
              <div className="h-3 w-3 rounded-full bg-green-400/40" />
            </div>
            <span className="text-xs font-mono text-muted-foreground ml-2">Terminal</span>
          </div>
          <pre className="overflow-x-auto p-5">
            <code className="text-sm font-mono text-foreground leading-relaxed">{`# Install the meta package (all components)
pnpm add @refraction-ui/react

# Or install individual components
pnpm add @refraction-ui/react-button @refraction-ui/react-dialog

# Add the Tailwind preset
pnpm add -D @refraction-ui/tailwind-config`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
