'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@refraction-ui/react-button'
import { Badge } from '@refraction-ui/react-badge'
import { Input } from '@refraction-ui/react-input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@refraction-ui/react-card'
import { Avatar, AvatarFallback } from '@refraction-ui/react-avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@refraction-ui/react-tabs'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@refraction-ui/react-dialog'
import { useToast, Toaster } from '@refraction-ui/react-toast'
import { COMPLETE_THEME_TEMPLATE } from '../complete-template'

// ---------------------------------------------------------------------------
// Parser utilities
// ---------------------------------------------------------------------------

function parseThemeCSS(css: string): Record<string, string> {
  const vars: Record<string, string> = {}
  const regex = /--([\w-]+)\s*:\s*([^;]+)/g
  let match
  while ((match = regex.exec(css)) !== null) {
    vars[`--${match[1]}`] = match[2].trim()
  }
  return vars
}

function applyParsedTheme(vars: Record<string, string>) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

function clearAppliedTheme(vars: Record<string, string>) {
  const root = document.documentElement
  for (const key of Object.keys(vars)) {
    root.style.removeProperty(key)
  }
}

// ---------------------------------------------------------------------------
// Default CSS placeholder — uses the complete 95-variable template
// ---------------------------------------------------------------------------

const placeholderCSS = COMPLETE_THEME_TEMPLATE

// ---------------------------------------------------------------------------
// Live Preview component
// ---------------------------------------------------------------------------

function LivePreview() {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-8">
      {/* Buttons */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Inputs</h3>
        <div className="space-y-2 max-w-sm">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
        </div>
      </div>

      {/* Card */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Card</h3>
        <Card>
          <CardHeader>
            <CardTitle>Project Dashboard</CardTitle>
            <CardDescription>Overview of your project metrics and recent activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">128</p>
                <p className="text-xs text-muted-foreground">Components</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">94%</p>
                <p className="text-xs text-muted-foreground">Coverage</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">2.1k</p>
                <p className="text-xs text-muted-foreground">Downloads</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">View Details</Button>
            <Button size="sm">Deploy</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Avatars */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avatars</h3>
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tabs</h3>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-sm text-muted-foreground py-4">
              This is the overview tab content. It adapts to your theme colors and typography settings.
            </p>
          </TabsContent>
          <TabsContent value="analytics">
            <p className="text-sm text-muted-foreground py-4">
              Analytics data would go here, styled with your custom theme variables.
            </p>
          </TabsContent>
          <TabsContent value="settings">
            <p className="text-sm text-muted-foreground py-4">
              Settings panel with controls for your project configuration.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dialog</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>
                This dialog uses your custom theme variables for colors, typography, and border radius.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
                Cancel
              </DialogClose>
              <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toast triggers */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Toasts</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Theme applied successfully', { variant: 'default' })}
          >
            Default Toast
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Operation completed', { variant: 'success' })}
          >
            Success Toast
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast('Something went wrong', { variant: 'error' })}
          >
            Error Toast
          </Button>
        </div>
      </div>

      {/* Mini data table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Table</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Component</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Version</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-2 text-foreground">Button</td>
                <td className="px-4 py-2"><Badge variant="success">Stable</Badge></td>
                <td className="px-4 py-2 text-right text-muted-foreground">1.0.0</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-2 text-foreground">Dialog</td>
                <td className="px-4 py-2"><Badge variant="warning">Beta</Badge></td>
                <td className="px-4 py-2 text-right text-muted-foreground">0.9.2</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-foreground">Data Table</td>
                <td className="px-4 py-2"><Badge variant="primary">Alpha</Badge></td>
                <td className="px-4 py-2 text-right text-muted-foreground">0.5.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Editor Page
// ---------------------------------------------------------------------------

export default function ConfigEditorPage() {
  const [cssText, setCssText] = useState('')
  const [appliedVars, setAppliedVars] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Clean up applied styles on unmount
  useEffect(() => {
    return () => {
      clearAppliedTheme(appliedVars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApply = useCallback(() => {
    const vars = parseThemeCSS(cssText)
    // Clear previously applied vars
    clearAppliedTheme(appliedVars)
    applyParsedTheme(vars)
    setAppliedVars(vars)
  }, [cssText, appliedVars])

  const handleReset = useCallback(() => {
    clearAppliedTheme(appliedVars)
    setAppliedVars({})
    setCssText('')
  }, [appliedVars])

  const handleCopy = useCallback(() => {
    const text = cssText || placeholderCSS
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [cssText])

  const handleLoadExample = useCallback(() => {
    setCssText(placeholderCSS)
  }, [])

  const varCount = Object.keys(appliedVars).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Config Editor</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Paste AI-generated CSS custom properties and instantly see your brand applied to every component.
          Use the{' '}
          <Link href="/theme/generate" className="text-primary underline underline-offset-4 hover:text-primary/80">
            LLM Prompt Generator
          </Link>{' '}
          to create a config, then paste it here.
        </p>
      </div>

      {/* Collapsible Variable Reference */}
      <details className="rounded-lg border border-border bg-card">
        <summary className="cursor-pointer select-none px-6 py-4 text-base font-semibold text-foreground hover:bg-accent/30 transition-colors">
          Variable Reference (95 variables across 20 categories)
        </summary>
        <div className="border-t border-border px-6 py-4 overflow-x-auto">
          <p className="text-sm text-muted-foreground mb-4">
            Every CSS custom property that controls the visual identity. All values go inside a <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">:root {'{ ... }'}</code> block.
          </p>

          {/* Colors — Surface & Text */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Colors &mdash; Surface &amp; Text</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--background</td><td className="py-1 pr-4 font-sans">Page background color</td><td className="py-1">0 0% 99%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--foreground</td><td className="py-1 pr-4 font-sans">Default text color</td><td className="py-1">240 10% 10%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--card / --card-foreground</td><td className="py-1 pr-4 font-sans">Card surface and text</td><td className="py-1">0 0% 99%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--popover / --popover-foreground</td><td className="py-1 pr-4 font-sans">Popover/dropdown surface and text</td><td className="py-1">0 0% 100%</td></tr>
            </tbody>
          </table>

          {/* Colors — Brand */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Colors &mdash; Brand</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--primary / --primary-foreground</td><td className="py-1 pr-4 font-sans">Primary brand color and its text</td><td className="py-1">250 50% 50%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--secondary / --secondary-foreground</td><td className="py-1 pr-4 font-sans">Secondary actions</td><td className="py-1">240 5% 96%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--accent / --accent-foreground</td><td className="py-1 pr-4 font-sans">Highlighted/active states</td><td className="py-1">250 30% 95%</td></tr>
            </tbody>
          </table>

          {/* Colors — Semantic */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Colors &mdash; Semantic</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--muted / --muted-foreground</td><td className="py-1 pr-4 font-sans">Subdued backgrounds and text</td><td className="py-1">240 5% 96%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--destructive / --destructive-foreground</td><td className="py-1 pr-4 font-sans">Error/danger actions</td><td className="py-1">0 84% 50%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--success / --success-foreground</td><td className="py-1 pr-4 font-sans">Success states</td><td className="py-1">142 71% 35%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--warning / --warning-foreground</td><td className="py-1 pr-4 font-sans">Warning states</td><td className="py-1">38 92% 50%</td></tr>
            </tbody>
          </table>

          {/* Colors — Borders, Sidebar, Charts */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Colors &mdash; Borders, Sidebar &amp; Charts</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--border / --input / --ring</td><td className="py-1 pr-4 font-sans">Border, input border, focus ring colors</td><td className="py-1">240 6% 92%</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--sidebar-*</td><td className="py-1 pr-4 font-sans">8 sidebar color tokens (background, foreground, primary, accent, border, ring)</td><td className="py-1">HSL values</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--chart-1 through --chart-5</td><td className="py-1 pr-4 font-sans">Chart/data visualization palette</td><td className="py-1">250 50% 50%</td></tr>
            </tbody>
          </table>

          {/* Typography */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Typography</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--font-sans / --font-heading / --font-mono</td><td className="py-1 pr-4 font-sans">Font family stacks</td><td className="py-1">{`'Inter', system-ui, sans-serif`}</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--font-size-xs through --font-size-5xl</td><td className="py-1 pr-4 font-sans">9-step type scale</td><td className="py-1">0.75rem ... 3rem</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--font-weight-normal/medium/semibold/bold</td><td className="py-1 pr-4 font-sans">Weight scale</td><td className="py-1">400, 500, 600, 700</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--heading-weight / --heading-letter-spacing / --heading-line-height</td><td className="py-1 pr-4 font-sans">Heading treatment</td><td className="py-1">600, -0.02em, 1.2</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--letter-spacing-tighter through --letter-spacing-wider</td><td className="py-1 pr-4 font-sans">5-step letter spacing scale</td><td className="py-1">-0.04em ... 0.05em</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--line-height-tight / --line-height-normal / --line-height-relaxed</td><td className="py-1 pr-4 font-sans">Line height scale</td><td className="py-1">1.3, 1.5, 1.7</td></tr>
            </tbody>
          </table>

          {/* Shape */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Shape &mdash; Radius</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--radius</td><td className="py-1 pr-4 font-sans">Base border-radius</td><td className="py-1">0.375rem</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--radius-none through --radius-full</td><td className="py-1 pr-4 font-sans">8-step radius scale</td><td className="py-1">0 ... 9999px</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--avatar/badge/button/input/card/tooltip-radius</td><td className="py-1 pr-4 font-sans">Per-component radius overrides</td><td className="py-1">9999px, 0.375rem, etc.</td></tr>
            </tbody>
          </table>

          {/* Depth, Transparency, Spacing, Borders, Component Styles, Motion */}
          <h4 className="text-sm font-bold text-foreground mt-4 mb-2">Depth, Spacing, Borders &amp; Motion</h4>
          <table className="w-full text-xs mb-4">
            <thead><tr className="border-b border-border"><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Variable</th><th className="text-left py-1 pr-4 font-semibold text-muted-foreground">Controls</th><th className="text-left py-1 font-semibold text-muted-foreground">Example</th></tr></thead>
            <tbody className="font-mono">
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--shadow-none/sm/md/lg/xl</td><td className="py-1 pr-4 font-sans">5-step shadow scale</td><td className="py-1">CSS shadow values</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--card/dropdown/dialog/button-shadow</td><td className="py-1 pr-4 font-sans">Per-component shadows</td><td className="py-1">CSS shadow or none</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--overlay-opacity / --backdrop-blur / --glass-bg / --glass-border</td><td className="py-1 pr-4 font-sans">Glass/transparency effects</td><td className="py-1">0.5, 8px, rgba()</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--spacing-scale / --card-padding / --input-height / --button-height / --section-gap / --container-*</td><td className="py-1 pr-4 font-sans">Layout density</td><td className="py-1">1, 1.5rem, 2.5rem</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--border-width / --border-style / --divider-style / --divider-opacity</td><td className="py-1 pr-4 font-sans">Border treatment</td><td className="py-1">1px, solid, 0.15</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--input-style / --button-style / --hover-effect / --active-effect / --link-style</td><td className="py-1 pr-4 font-sans">Component behavior keywords</td><td className="py-1">bordered, filled, darken, scale-down, color-only</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--focus-ring-width / --focus-ring-offset / --focus-ring-style</td><td className="py-1 pr-4 font-sans">Focus indicator</td><td className="py-1">2px, 2px, ring</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--icon-style / --icon-stroke-width / --icon-size</td><td className="py-1 pr-4 font-sans">Icon treatment</td><td className="py-1">outlined, 1.5, 1rem</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--scrollbar-style / --scrollbar-track / --scrollbar-thumb</td><td className="py-1 pr-4 font-sans">Scrollbar appearance</td><td className="py-1">thin, transparent, rgba()</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--selection-background / --selection-foreground</td><td className="py-1 pr-4 font-sans">Text selection highlight</td><td className="py-1">HSL values</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--tooltip-style / --table-style / --table-header-weight / --spinner-style</td><td className="py-1 pr-4 font-sans">Miscellaneous component styles</td><td className="py-1">dark, clean, 600, circle</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--transition-duration / --transition-easing / --animation-speed / --hover/enter/exit-transition</td><td className="py-1 pr-4 font-sans">Motion and animation</td><td className="py-1">150ms, cubic-bezier(...), normal</td></tr>
              <tr className="border-b border-border/50"><td className="py-1 pr-4">--disabled-opacity / --placeholder-opacity / --button-weight / --link-weight</td><td className="py-1 pr-4 font-sans">Misc component tokens</td><td className="py-1">0.5, 500, inherit</td></tr>
            </tbody>
          </table>

          <p className="text-xs text-muted-foreground mt-2">
            See the full <a href="/theme/reference" className="text-primary underline underline-offset-2 hover:text-primary/80">Theme Reference</a> page for detailed documentation on every variable.
          </p>
        </div>
      </details>

      {/* Two-panel layout */}
      <div className="grid gap-8 xl:grid-cols-2">
        {/* Left panel: Config textarea */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">CSS Config</h2>
            {varCount > 0 && (
              <Badge variant="success">{varCount} variables applied</Badge>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={cssText}
            onChange={(e) => setCssText(e.target.value)}
            placeholder={placeholderCSS}
            className="w-full h-[700px] rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            spellCheck={false}
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleApply}>
              Apply
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy Config'}
            </Button>
            <Button variant="ghost" onClick={handleLoadExample}>
              Load Example
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Paste a complete <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">:root {'{ ... }'}</code> block
            with CSS custom properties. Click &quot;Apply&quot; to see changes live in the preview panel.
          </p>
        </div>

        {/* Right panel: Live preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
          <div className="rounded-lg border border-border bg-card p-6 overflow-y-auto max-h-[750px]">
            <LivePreview />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
