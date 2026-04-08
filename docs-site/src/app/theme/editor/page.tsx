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
// Default CSS placeholder
// ---------------------------------------------------------------------------

const placeholderCSS = `:root {
  /* Colors (HSL values: hue saturation% lightness%) */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 252 85% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 240 5% 96%;
  --secondary-foreground: 240 4% 43%;
  --accent: 252 30% 95%;
  --accent-foreground: 252 50% 45%;
  --muted: 240 5% 96%;
  --muted-foreground: 240 4% 43%;
  --destructive: 0 84% 50%;
  --destructive-foreground: 0 0% 100%;
  --border: 240 6% 90%;
  --input: 240 6% 90%;
  --ring: 252 85% 60%;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Shape */
  --radius: 0.5rem;
  --avatar-radius: 9999px;
  --badge-radius: 9999px;
  --button-radius: 0.375rem;
  --card-radius: 0.5rem;

  /* Depth */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --card-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.06);
  --button-shadow: none;

  /* Transparency */
  --overlay-opacity: 0.5;
  --backdrop-blur: 8px;
  --glass-bg: rgba(255, 255, 255, 0.8);

  /* Density */
  --spacing-scale: 1;
  --card-padding: 1.5rem;
  --input-height: 2.5rem;
  --button-height: 2.5rem;

  /* Typography details */
  --heading-weight: 600;
  --heading-letter-spacing: -0.025em;
  --letter-spacing-tight: -0.015em;
  --line-height-normal: 1.5;

  /* Component styles */
  --input-style: bordered;
  --button-style: filled;
  --hover-effect: darken;
  --link-style: underline-on-hover;
  --icon-style: outlined;
  --tooltip-style: dark;
  --table-style: clean;
  --scrollbar-style: thin;
  --focus-ring-style: ring;

  /* Motion */
  --transition-duration: 150ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Borders */
  --border-width: 1px;
  --disabled-opacity: 0.5;
  --placeholder-opacity: 0.5;
}`

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
            className="w-full h-[500px] rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring resize-y"
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
