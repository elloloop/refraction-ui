/**
 * @refraction-ui/react-theme is a headless provider/hook package — no standalone UI.
 * Stories below are documentation cards demonstrating the API surface.
 */
import * as React from 'react'

export default { title: 'Utilities/Theme' }

interface DocCardProps {
  title: string
  body: React.ReactNode
  code?: string
}

function DocCard({ title, body, code }: DocCardProps) {
  return (
    <div className="max-w-2xl rounded-lg border border-border bg-card p-6 text-sm space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="text-muted-foreground">{body}</div>
      {code && (
        <pre className="overflow-x-auto rounded bg-muted/60 p-3 text-xs leading-relaxed">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

export const Overview = {
  render: () => (
    <DocCard
      title="@refraction-ui/react-theme"
      body={
        <>
          Three exports: <code>ThemeProvider</code> (wraps your app),{' '}
          <code>useTheme</code> (hook), and <code>ThemeScript</code> (inline{' '}
          <code>&lt;script&gt;</code> for SSR flash-prevention). Headless — no UI.
        </>
      }
      code={`import { ThemeProvider, ThemeScript, useTheme } from '@refraction-ui/react/theme'`}
    />
  ),
}

// Issue #317 — defaultMode + enableSystem keep the pre-paint script aligned
// with ThemeProvider so first-time visitors don't see a dark→light flash.
export const ThemeScriptDefaultMode = {
  render: () => (
    <DocCard
      title="ThemeScript — defaultMode + enableSystem (issue #317)"
      body={
        <>
          The inline pre-paint script now mirrors <code>ThemeProvider</code>&apos;s
          no-storage path. Set <code>defaultMode=&quot;light&quot;</code> (or{' '}
          <code>enableSystem={'{false}'}</code>) and the script skips{' '}
          <code>prefers-color-scheme</code> entirely — no dark flash on first
          visit for brand-consistent apps.
        </>
      }
      code={`// layout.tsx — keep ThemeScript + ThemeProvider in lockstep
<head>
  <ThemeScript defaultMode="light" storageKey="app_theme" />
</head>
<body>
  <ThemeProvider defaultMode="light" storageKey="app_theme">
    {children}
  </ThemeProvider>
</body>`}
    />
  ),
}

export const ThemeScriptModes = {
  render: () => (
    <DocCard
      title="ThemeScript resolution order"
      body={
        <ol className="list-decimal list-inside space-y-1">
          <li>localStorage value (if any) wins.</li>
          <li>
            Else <code>defaultMode</code> (<code>&apos;light&apos;</code> /{' '}
            <code>&apos;dark&apos;</code>) is applied as-is.
          </li>
          <li>
            Else if <code>defaultMode === &apos;system&apos;</code> AND{' '}
            <code>enableSystem</code> is true →{' '}
            <code>prefers-color-scheme</code>.
          </li>
          <li>
            Else <code>&apos;light&apos;</code> floor.
          </li>
        </ol>
      }
      code={`<ThemeScript />                                  // legacy: stored → matchMedia → light
<ThemeScript defaultMode="light" />              // stored → light (no matchMedia)
<ThemeScript defaultMode="dark" />               // stored → dark (no matchMedia)
<ThemeScript defaultMode="system" enableSystem /> // stored → matchMedia → light
<ThemeScript defaultMode="system" enableSystem={false} /> // stored → light (no matchMedia)`}
    />
  ),
}
