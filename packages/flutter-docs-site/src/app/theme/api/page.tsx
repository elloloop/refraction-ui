import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const themeProviderProps = [
  {
    name: 'defaultMode',
    type: "'light' | 'dark' | 'system'",
    default: "'system'",
    description: 'Theme applied when nothing is stored. Mirror this in <ThemeScript> for SSR.',
  },
  {
    name: 'storageKey',
    type: 'string',
    default: "'rfr-theme'",
    description: 'localStorage key used to persist the user choice.',
  },
  {
    name: 'attribute',
    type: "'class' | 'data-theme'",
    default: "'class'",
    description: "How the theme is applied to <html>. 'class' toggles `light` / `dark` classes.",
  },
  {
    name: 'enableSystem',
    type: 'boolean',
    default: 'true',
    description:
      "When false, the provider never falls through to `prefers-color-scheme` — `defaultMode` wins on first visit.",
  },
]

const themeScriptProps = [
  {
    name: 'defaultMode',
    type: "'light' | 'dark' | 'system'",
    default: "'system'",
    description:
      'Theme to apply when nothing is stored. Match your <ThemeProvider defaultMode> so the pre-paint script and provider agree on the no-storage path (issue #317).',
  },
  {
    name: 'enableSystem',
    type: 'boolean',
    default: 'true',
    description:
      'When false, the inline script never reads `prefers-color-scheme`. Combined with `defaultMode="light"`, this is the fix for the dark-flash → brand-light flicker on first visit.',
  },
  {
    name: 'storageKey',
    type: 'string',
    default: "'rfr-theme'",
    description: 'Must match the ThemeProvider value.',
  },
  {
    name: 'attribute',
    type: "'class' | 'data-theme'",
    default: "'class'",
    description: 'Must match the ThemeProvider value.',
  },
]

const useThemeReturn = [
  { name: 'mode', type: "'light' | 'dark' | 'system'", description: 'The current user selection.' },
  { name: 'resolvedTheme', type: "'light' | 'dark'", description: 'What is actually applied (system resolved).' },
  { name: 'setMode', type: '(mode) => void', description: 'Persist a new selection.' },
  { name: 'toggle', type: '() => void', description: 'Convenience flip light ↔ dark.' },
]

const layoutSample = `// app/layout.tsx — Next.js App Router
import { ThemeProvider, ThemeScript } from '@refraction-ui/react/theme'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Mirror these props in ThemeProvider below */}
        <ThemeScript defaultMode="light" storageKey="app_theme" />
      </head>
      <body>
        <ThemeProvider defaultMode="light" storageKey="app_theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}`

const useThemeSample = `'use client'
import { useTheme } from '@refraction-ui/react/theme'

export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label="Toggle theme">
      {resolvedTheme === 'dark' ? '☀︎' : '☾'}
    </button>
  )
}`

export default function ThemeApiPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            API Reference
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Theme API</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          The three React exports of{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">
            @refraction-ui/react/theme
          </code>{' '}
          — <code className="text-sm font-mono">ThemeProvider</code>,{' '}
          <code className="text-sm font-mono">ThemeScript</code>, and{' '}
          <code className="text-sm font-mono">useTheme</code>.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Full setup (SSR-safe)</h2>
        <p className="text-sm text-muted-foreground">
          Always pair <code className="text-xs bg-muted px-1 rounded">&lt;ThemeScript&gt;</code> in{' '}
          <code className="text-xs bg-muted px-1 rounded">&lt;head&gt;</code> with{' '}
          <code className="text-xs bg-muted px-1 rounded">&lt;ThemeProvider&gt;</code> in{' '}
          <code className="text-xs bg-muted px-1 rounded">&lt;body&gt;</code>, and keep their
          props in lockstep.
        </p>
        <CodeBlock frameworks={{ react: layoutSample, astro: '<!-- See @refraction-ui/astro/theme — same props, Astro component -->' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          <code className="text-base">ThemeProvider</code> props
        </h2>
        <PropsTable props={themeProviderProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          <code className="text-base">ThemeScript</code> props
        </h2>
        <p className="text-sm text-muted-foreground">
          Inline <code className="text-xs bg-muted px-1 rounded">&lt;script&gt;</code> placed in{' '}
          <code className="text-xs bg-muted px-1 rounded">&lt;head&gt;</code> to prevent the
          dark-flash on first paint.{' '}
          <strong>Issue #317:</strong>{' '}
          <code className="text-xs bg-muted px-1 rounded">defaultMode</code> +{' '}
          <code className="text-xs bg-muted px-1 rounded">enableSystem</code> are now honoured,
          so the script no longer silently falls through to{' '}
          <code className="text-xs bg-muted px-1 rounded">prefers-color-scheme</code> when the
          provider says otherwise.
        </p>
        <PropsTable props={themeScriptProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          <code className="text-base">useTheme</code>
        </h2>
        <CodeBlock frameworks={{ react: useThemeSample, astro: '<!-- Astro uses its own ThemeToggle component -->' }} />
        <PropsTable props={useThemeReturn} />
      </section>
    </div>
  )
}
