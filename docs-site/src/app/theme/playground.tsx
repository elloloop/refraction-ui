'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@refraction-ui/react-button'
import { Badge } from '@refraction-ui/react-badge'
import { Input } from '@refraction-ui/react-input'
import { ThemeToggle } from '@refraction-ui/react-theme'

// ---------------------------------------------------------------------------
// Theme definitions (mirrors ThemeDefinition from @refraction-ui/tailwind-config)
// ---------------------------------------------------------------------------

interface PlaygroundTheme {
  displayName: string
  description: string
  colors: Record<string, string>
  fonts: { sans: string; heading: string; mono: string }
  radius: string
  shadows: { sm: string; md: string; lg: string; xl: string }
  transition: string
}

const refractionDefaults: PlaygroundTheme = {
  displayName: 'Refraction',
  description: 'Modern, crisp, slightly warm. The default look.',
  colors: {
    '--background': '0 0% 100%',
    '--foreground': '222 47% 11%',
    '--primary': '252 85% 60%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '240 5% 96%',
    '--secondary-foreground': '240 4% 43%',
    '--muted': '240 5% 96%',
    '--muted-foreground': '240 4% 43%',
    '--accent': '252 30% 95%',
    '--accent-foreground': '252 50% 45%',
    '--destructive': '0 84% 50%',
    '--destructive-foreground': '0 0% 100%',
    '--border': '240 6% 90%',
    '--input': '240 6% 90%',
    '--ring': '252 85% 60%',
  },
  fonts: {
    sans: "'Inter', system-ui, sans-serif",
    heading: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  radius: '0.5rem',
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
}

const presets: Record<string, PlaygroundTheme> = {
  refraction: refractionDefaults,
  luxe: {
    displayName: 'Luxe',
    description: 'Rich, elegant, premium. Deep gold with refined typography.',
    colors: {
      ...refractionDefaults.colors,
      '--background': '30 20% 99%',
      '--foreground': '20 15% 10%',
      '--primary': '35 92% 33%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '30 10% 95%',
      '--secondary-foreground': '20 10% 40%',
      '--muted': '30 10% 95%',
      '--muted-foreground': '20 10% 40%',
      '--accent': '35 30% 93%',
      '--accent-foreground': '35 60% 30%',
      '--border': '30 10% 89%',
      '--input': '30 10% 89%',
      '--ring': '35 92% 33%',
    },
    fonts: {
      sans: "'Inter', system-ui, sans-serif",
      heading: "'Playfair Display', Georgia, serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    radius: '0.25rem',
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      md: '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      lg: '0 6px 10px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      xl: '0 12px 18px -4px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
    },
    transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  warm: {
    displayName: 'Warm',
    description: 'Inviting, hospitable, soft. Terracotta with friendly rounding.',
    colors: {
      ...refractionDefaults.colors,
      '--background': '30 50% 99%',
      '--foreground': '15 30% 12%',
      '--primary': '15 85% 42%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '25 20% 95%',
      '--secondary-foreground': '15 15% 40%',
      '--muted': '25 20% 95%',
      '--muted-foreground': '15 15% 40%',
      '--accent': '15 35% 94%',
      '--accent-foreground': '15 55% 35%',
      '--border': '25 15% 89%',
      '--input': '25 15% 89%',
      '--ring': '15 85% 42%',
    },
    fonts: {
      sans: "'DM Sans', system-ui, sans-serif",
      heading: "'DM Sans', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    radius: '0.75rem',
    shadows: {
      sm: '0 1px 3px 0 rgb(120 80 40 / 0.06)',
      md: '0 4px 6px -1px rgb(120 80 40 / 0.08), 0 2px 4px -2px rgb(120 80 40 / 0.06)',
      lg: '0 10px 15px -3px rgb(120 80 40 / 0.08), 0 4px 6px -4px rgb(120 80 40 / 0.06)',
      xl: '0 20px 25px -5px rgb(120 80 40 / 0.1), 0 8px 10px -6px rgb(120 80 40 / 0.08)',
    },
    transition: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  signal: {
    displayName: 'Signal',
    description: 'Focused, balanced, functional. Teal for productivity.',
    colors: {
      ...refractionDefaults.colors,
      '--background': '0 0% 100%',
      '--foreground': '210 20% 10%',
      '--primary': '175 85% 28%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '175 10% 95%',
      '--secondary-foreground': '175 15% 35%',
      '--muted': '175 10% 95%',
      '--muted-foreground': '175 10% 40%',
      '--accent': '175 25% 93%',
      '--accent-foreground': '175 60% 25%',
      '--border': '210 10% 90%',
      '--input': '210 10% 90%',
      '--ring': '175 85% 28%',
    },
    fonts: {
      sans: "'IBM Plex Sans', system-ui, sans-serif",
      heading: "'IBM Plex Sans', system-ui, sans-serif",
      mono: "'IBM Plex Mono', ui-monospace, monospace",
    },
    radius: '0.375rem',
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
    },
    transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  pulse: {
    displayName: 'Pulse',
    description: 'Energetic, bold, youthful. Hot pink with dramatic shadows.',
    colors: {
      ...refractionDefaults.colors,
      '--background': '0 0% 100%',
      '--foreground': '330 15% 10%',
      '--primary': '330 85% 45%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '330 10% 95%',
      '--secondary-foreground': '330 15% 38%',
      '--muted': '330 10% 95%',
      '--muted-foreground': '330 10% 40%',
      '--accent': '330 30% 94%',
      '--accent-foreground': '330 55% 38%',
      '--border': '330 8% 90%',
      '--input': '330 8% 90%',
      '--ring': '330 85% 45%',
    },
    fonts: {
      sans: "'Outfit', system-ui, sans-serif",
      heading: "'Outfit', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    radius: '1rem',
    shadows: {
      sm: '0 2px 4px 0 rgb(0 0 0 / 0.08)',
      md: '0 6px 10px -2px rgb(0 0 0 / 0.12), 0 3px 5px -2px rgb(0 0 0 / 0.08)',
      lg: '0 14px 20px -4px rgb(0 0 0 / 0.14), 0 6px 8px -4px rgb(0 0 0 / 0.1)',
      xl: '0 24px 32px -6px rgb(0 0 0 / 0.16), 0 10px 12px -6px rgb(0 0 0 / 0.1)',
    },
    transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  mono: {
    displayName: 'Mono',
    description: 'Stark, Swiss-style, typographic. Black, white, nothing else.',
    colors: {
      ...refractionDefaults.colors,
      '--background': '0 0% 100%',
      '--foreground': '0 0% 4%',
      '--primary': '0 0% 9%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '0 0% 96%',
      '--secondary-foreground': '0 0% 35%',
      '--muted': '0 0% 96%',
      '--muted-foreground': '0 0% 40%',
      '--accent': '0 0% 94%',
      '--accent-foreground': '0 0% 15%',
      '--border': '0 0% 89%',
      '--input': '0 0% 89%',
      '--ring': '0 0% 9%',
    },
    fonts: {
      sans: "'JetBrains Mono', ui-monospace, monospace",
      heading: "'JetBrains Mono', ui-monospace, monospace",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
    radius: '0rem',
    shadows: {
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
    },
    transition: '100ms linear',
  },
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ThemePlayground() {
  const [colorVars, setColorVars] = useState<Record<string, string>>({ ...refractionDefaults.colors })
  const [activePreset, setActivePreset] = useState('refraction')
  const [currentTheme, setCurrentTheme] = useState<PlaygroundTheme>(refractionDefaults)
  const [exported, setExported] = useState(false)

  // Apply ALL theme variables to document root for live preview
  useEffect(() => {
    const root = document.documentElement

    // Apply color variables
    for (const [key, value] of Object.entries(colorVars)) {
      root.style.setProperty(key, value)
    }

    // Apply non-color variables
    root.style.setProperty('--font-sans', currentTheme.fonts.sans)
    root.style.setProperty('--font-heading', currentTheme.fonts.heading)
    root.style.setProperty('--font-mono', currentTheme.fonts.mono)
    root.style.setProperty('--radius', currentTheme.radius)
    root.style.setProperty('--shadow-sm', currentTheme.shadows.sm)
    root.style.setProperty('--shadow-md', currentTheme.shadows.md)
    root.style.setProperty('--shadow-lg', currentTheme.shadows.lg)
    root.style.setProperty('--shadow-xl', currentTheme.shadows.xl)
    root.style.setProperty('--transition', currentTheme.transition)

    return () => {
      for (const key of Object.keys(colorVars)) {
        root.style.removeProperty(key)
      }
      root.style.removeProperty('--font-sans')
      root.style.removeProperty('--font-heading')
      root.style.removeProperty('--font-mono')
      root.style.removeProperty('--radius')
      root.style.removeProperty('--shadow-sm')
      root.style.removeProperty('--shadow-md')
      root.style.removeProperty('--shadow-lg')
      root.style.removeProperty('--shadow-xl')
      root.style.removeProperty('--transition')
    }
  }, [colorVars, currentTheme])

  const handleColorChange = useCallback((varName: string, hex: string) => {
    const hsl = hexToHsl(hex)
    setColorVars((prev) => ({ ...prev, [varName]: hsl }))
    setActivePreset('')
  }, [])

  const handleHslChange = useCallback((varName: string, hsl: string) => {
    setColorVars((prev) => ({ ...prev, [varName]: hsl }))
    setActivePreset('')
  }, [])

  const handlePresetChange = useCallback((preset: string) => {
    if (presets[preset]) {
      const theme = presets[preset]
      setColorVars({ ...theme.colors })
      setCurrentTheme(theme)
      setActivePreset(preset)
    }
  }, [])

  const generateCSS = useCallback(() => {
    const colorLines = Object.entries(colorVars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')
    const fontLines = [
      `  --font-sans: ${currentTheme.fonts.sans};`,
      `  --font-heading: ${currentTheme.fonts.heading};`,
      `  --font-mono: ${currentTheme.fonts.mono};`,
    ].join('\n')
    const layoutLines = [
      `  --radius: ${currentTheme.radius};`,
    ].join('\n')
    const shadowLines = [
      `  --shadow-sm: ${currentTheme.shadows.sm};`,
      `  --shadow-md: ${currentTheme.shadows.md};`,
      `  --shadow-lg: ${currentTheme.shadows.lg};`,
      `  --shadow-xl: ${currentTheme.shadows.xl};`,
    ].join('\n')
    const transitionLine = `  --transition: ${currentTheme.transition};`

    return `:root {\n  /* Colors */\n${colorLines}\n\n  /* Typography */\n${fontLines}\n\n  /* Layout */\n${layoutLines}\n\n  /* Shadows */\n${shadowLines}\n\n  /* Transitions */\n${transitionLine}\n}\n`
  }, [colorVars, currentTheme])

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
            <option value="refraction">Refraction (Default)</option>
            <option value="luxe">Luxe</option>
            <option value="warm">Warm</option>
            <option value="signal">Signal</option>
            <option value="pulse">Pulse</option>
            <option value="mono">Mono</option>
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

      {/* Active theme description */}
      {activePreset && presets[activePreset] && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{presets[activePreset].displayName}</span>
          {' '}&mdash; {presets[activePreset].description}
        </p>
      )}

      {/* Non-color theme properties */}
      {activePreset && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Font</span>
            <p className="text-sm font-mono text-foreground truncate">{currentTheme.fonts.sans.split(',')[0].replace(/'/g, '')}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Radius</span>
            <p className="text-sm font-mono text-foreground">{currentTheme.radius}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Shadow</span>
            <p className="text-sm font-mono text-foreground truncate">{currentTheme.shadows.sm === 'none' ? 'None' : 'Defined'}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Transition</span>
            <p className="text-sm font-mono text-foreground">{currentTheme.transition.split(' ')[0]}</p>
          </div>
        </div>
      )}

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
                      value={hslToHex(colorVars[key] || '0 0% 0%')}
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
                      value={colorVars[key] || ''}
                      onChange={(e) => handleHslChange(key, e.target.value)}
                      className="w-full rounded border border-border bg-background px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="H S% L%"
                    />
                  </div>
                  <div
                    className="h-8 w-12 rounded border border-border shrink-0"
                    style={{ backgroundColor: `hsl(${colorVars[key]})` }}
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
                  This card uses the current theme variables for background, border, text, radius, and shadows.
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
