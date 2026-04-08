'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@refraction-ui/react-button'
import { Badge } from '@refraction-ui/react-badge'
import { Input } from '@refraction-ui/react-input'
import { ThemeToggle } from '@refraction-ui/react-theme'

// ---- Glassa default values (HSL without wrapper) ----

const glassaDefaults: Record<string, string> = {
  '--background': '0 0% 100%',
  '--foreground': '224 71% 4%',
  '--primary': '221 83% 45%',
  '--primary-foreground': '210 40% 98%',
  '--secondary': '220 14% 96%',
  '--secondary-foreground': '220 9% 40%',
  '--muted': '220 14% 96%',
  '--muted-foreground': '220 9% 40%',
  '--accent': '220 14% 96%',
  '--accent-foreground': '220 9% 40%',
  '--destructive': '0 72% 45%',
  '--destructive-foreground': '210 40% 98%',
  '--border': '220 13% 91%',
  '--input': '220 13% 91%',
  '--ring': '221 83% 45%',
  '--radius': '0.625rem',
}

// Editable color variables (subset for the playground)
const editableVars = [
  { key: '--primary', label: 'Primary' },
  { key: '--primary-foreground', label: 'Primary Foreground' },
  { key: '--secondary', label: 'Secondary' },
  { key: '--secondary-foreground', label: 'Secondary Foreground' },
  { key: '--background', label: 'Background' },
  { key: '--foreground', label: 'Foreground' },
  { key: '--muted', label: 'Muted' },
  { key: '--muted-foreground', label: 'Muted Foreground' },
  { key: '--accent', label: 'Accent' },
  { key: '--accent-foreground', label: 'Accent Foreground' },
  { key: '--destructive', label: 'Destructive' },
  { key: '--destructive-foreground', label: 'Destructive Foreground' },
  { key: '--border', label: 'Border' },
  { key: '--ring', label: 'Ring' },
]

// Convert HSL string "h s% l%" to hex for color picker
function hslToHex(hslStr: string): string {
  const parts = hslStr.trim().split(/\s+/)
  if (parts.length < 3) return '#000000'
  const h = parseFloat(parts[0]) || 0
  const s = (parseFloat(parts[1]) || 0) / 100
  const l = (parseFloat(parts[2]) || 0) / 100

  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Convert hex to HSL string "h s% l%"
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0 0% 0%'

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return `0 0% ${Math.round(l * 100)}%`
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// ---- Presets ----

const presets: Record<string, Record<string, string>> = {
  glassa: { ...glassaDefaults },
  ocean: {
    ...glassaDefaults,
    '--primary': '199 89% 48%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '199 19% 93%',
    '--secondary-foreground': '199 15% 30%',
    '--accent': '199 19% 93%',
    '--accent-foreground': '199 15% 30%',
    '--ring': '199 89% 48%',
  },
  emerald: {
    ...glassaDefaults,
    '--primary': '160 84% 39%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '160 14% 93%',
    '--secondary-foreground': '160 15% 30%',
    '--accent': '160 14% 93%',
    '--accent-foreground': '160 15% 30%',
    '--ring': '160 84% 39%',
  },
  violet: {
    ...glassaDefaults,
    '--primary': '263 70% 50%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '263 14% 93%',
    '--secondary-foreground': '263 15% 30%',
    '--accent': '263 14% 93%',
    '--accent-foreground': '263 15% 30%',
    '--ring': '263 70% 50%',
  },
}

export function ThemePlayground() {
  const [vars, setVars] = useState<Record<string, string>>({ ...glassaDefaults })
  const [activePreset, setActivePreset] = useState('glassa')
  const [exported, setExported] = useState(false)

  // Apply variables to document root for live preview
  useEffect(() => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }
    return () => {
      // Cleanup: remove inline styles so stylesheet takes over
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key)
      }
    }
  }, [vars])

  const handleColorChange = useCallback((varName: string, hex: string) => {
    const hsl = hexToHsl(hex)
    setVars((prev) => ({ ...prev, [varName]: hsl }))
    setActivePreset('')
  }, [])

  const handleHslChange = useCallback((varName: string, hsl: string) => {
    setVars((prev) => ({ ...prev, [varName]: hsl }))
    setActivePreset('')
  }, [])

  const handlePresetChange = useCallback((preset: string) => {
    if (presets[preset]) {
      setVars({ ...presets[preset] })
      setActivePreset(preset)
    }
  }, [])

  const generateCSS = useCallback(() => {
    const lines = Object.entries(vars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')
    return `:root {\n${lines}\n}\n`
  }, [vars])

  const handleExport = useCallback(() => {
    const css = generateCSS()
    navigator.clipboard.writeText(css).then(() => {
      setExported(true)
      setTimeout(() => setExported(false), 2000)
    })
  }, [generateCSS])

  return (
    <div className="space-y-8">
      {/* Preset selector + Export */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Theme Preset</label>
          <select
            value={activePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="block rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="glassa">Glassa (Default)</option>
            <option value="ocean">Ocean</option>
            <option value="emerald">Emerald</option>
            <option value="violet">Violet</option>
            {activePreset === '' && <option value="">Custom</option>}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Mode</label>
          <div>
            <ThemeToggle variant="segmented" />
          </div>
        </div>

        <div className="ml-auto">
          <Button onClick={handleExport} variant={exported ? 'secondary' : 'default'}>
            {exported ? 'Copied!' : 'Export CSS'}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Color Editor */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">CSS Variables</h2>
          <div className="space-y-3">
            {editableVars.map(({ key, label }) => {
              const isRadius = key === '--radius'
              return (
                <div key={key} className="flex items-center gap-3">
                  {!isRadius && (
                    <input
                      type="color"
                      value={hslToHex(vars[key] || '0 0% 0%')}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border border-border bg-transparent"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-medium text-muted-foreground block">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={vars[key] || ''}
                      onChange={(e) => handleHslChange(key, e.target.value)}
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="H S% L%"
                    />
                  </div>
                  <div
                    className="h-8 w-12 rounded border border-border shrink-0"
                    style={{ backgroundColor: `hsl(${vars[key]})` }}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Preview</h2>
          <div className="rounded-lg border border-border bg-card p-6 space-y-6">
            {/* Buttons */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Badges</h3>
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Inputs</h3>
              <div className="space-y-2 max-w-sm">
                <Input placeholder="Default input" />
                <Input disabled placeholder="Disabled input" />
              </div>
            </div>

            {/* Card preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Card</h3>
              <div className="rounded-lg border border-border bg-background p-4">
                <h4 className="font-semibold text-foreground">Sample Card</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  This card uses the current theme variables for background, border, and text colors.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Action</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Generated CSS</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-mono text-muted-foreground">css</span>
            <Button size="xs" variant="ghost" onClick={handleExport}>
              {exported ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="overflow-x-auto p-4">
            <code className="text-sm font-mono text-foreground leading-relaxed whitespace-pre">
              {generateCSS()}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}
