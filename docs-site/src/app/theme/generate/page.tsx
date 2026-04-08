'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@refraction-ui/react-button'
import { Input } from '@refraction-ui/react-input'
import { COMPLETE_THEME_TEMPLATE } from '../complete-template'

// ---------------------------------------------------------------------------
// Prompt template
// ---------------------------------------------------------------------------

const PROMPT_BEFORE_BRAND = `I need a complete CSS theme configuration for a UI component library called Refraction UI.

My brand is: `

const PROMPT_AFTER_BRAND = `

Generate CSS custom properties in this EXACT format. ALL 95 variables must be included — every category matters:

` + COMPLETE_THEME_TEMPLATE + `

Replace every value above with values that match my brand. Here is what each category controls:
- COLORS: HSL values (hue saturation% lightness%) for surfaces, brand, semantic, borders, sidebar, and charts
- TYPOGRAPHY: Font families, 9-step size scale, 4 weights, heading treatment, letter spacing, line heights
- SHAPE: Base radius, 8-step radius scale, per-component radius overrides
- DEPTH: 5-step shadow scale + per-component shadows
- TRANSPARENCY: Overlay opacity, backdrop blur, glass effects
- SPACING: Density scale, padding, heights, gaps, container sizing
- BORDERS: Width, style, divider opacity
- COMPONENT STYLES: Input/button/link/icon/scrollbar/tooltip/table/spinner behavior keywords
- FOCUS: Ring width, offset, style
- SELECTION: Text highlight colors
- MOTION: Transition durations, easings, animation speed, enter/exit transitions

Requirements:
1. All foreground/background color pairs must meet WCAG AA contrast ratio (4.5:1 minimum)
2. Colors should be beautiful and cohesive, not random
3. The overall feel should match my brand description
4. Choose typography, radius, shadows, density, and motion values that reinforce the brand personality
5. Output ONLY the CSS — no explanation needed`

const DEFAULT_BRAND = '[DESCRIBE YOUR BRAND HERE - e.g., "a luxury hotel booking platform with warm, inviting aesthetics"]'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function GenerateThemePage() {
  const [brandDescription, setBrandDescription] = useState('')
  const [copied, setCopied] = useState(false)

  const fullPrompt = useMemo(() => {
    const brand = brandDescription.trim() || DEFAULT_BRAND
    return PROMPT_BEFORE_BRAND + brand + PROMPT_AFTER_BRAND
  }, [brandDescription])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(fullPrompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [fullPrompt])

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Generate Your Brand Theme</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Use an LLM to generate a complete theme config for your brand. Follow the steps below, then paste the
          result into the{' '}
          <Link href="/theme/editor" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Config Editor
          </Link>{' '}
          to see it live.
        </p>
      </div>

      {/* Workflow steps */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { step: '1', title: 'Describe', desc: 'Type your brand description below' },
          { step: '2', title: 'Copy', desc: 'Copy the complete prompt' },
          { step: '3', title: 'Paste', desc: 'Paste into ChatGPT or Claude' },
          { step: '4', title: 'Get CSS', desc: 'The LLM returns complete CSS' },
          { step: '5', title: 'Apply', desc: 'Paste CSS into Config Editor' },
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-lg border border-border bg-card p-4 text-center space-y-1"
          >
            <div className="mx-auto h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">{item.step}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Brand description input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground" htmlFor="brand-input">
          Your Brand Description
        </label>
        <Input
          id="brand-input"
          value={brandDescription}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandDescription(e.target.value)}
          placeholder='e.g., "a luxury hotel booking platform with warm, inviting aesthetics"'
          className="max-w-2xl"
        />
        <p className="text-xs text-muted-foreground">
          Type your brand description here and it will be automatically inserted into the prompt below.
          Leave blank to use the placeholder text.
        </p>
      </div>

      {/* The copyable prompt */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Complete Prompt</h2>
          <Button onClick={handleCopy} variant={copied ? 'secondary' : 'default'}>
            {copied ? 'Copied!' : 'Copy Complete Prompt'}
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
            <span className="text-xs font-mono text-muted-foreground">prompt</span>
            <Button size="xs" variant="ghost" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="overflow-x-auto p-4 max-h-[700px] overflow-y-auto">
            <code className="text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap break-words">
              {fullPrompt}
            </code>
          </pre>
        </div>
      </div>

      {/* Next step CTA */}
      <div className="rounded-lg border border-border bg-accent/30 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Got your CSS back?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Head to the Config Editor, paste the CSS output from the LLM, and click &quot;Apply&quot; to see
            your brand theme come to life on every component.
          </p>
        </div>
        <Link href="/theme/editor">
          <Button>Open Config Editor</Button>
        </Link>
      </div>
    </div>
  )
}
