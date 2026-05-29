'use client'

import Link from 'next/link'

// ---------------------------------------------------------------------------
// Variable reference data
// ---------------------------------------------------------------------------

interface VarEntry {
  name: string
  controls: string
  accepts: string
  defaultValue: string
}

interface Category {
  title: string
  description: string
  vars: VarEntry[]
}

// ---------------------------------------------------------------------------
// Essential variables (~25) — the Simple mode set
// ---------------------------------------------------------------------------

const essentialCategories: Category[] = [
  {
    title: 'Brand Colors',
    description: 'Core colors that define your brand. All color values use HSL format without the hsl() wrapper: "hue saturation% lightness%".',
    vars: [
      { name: '--background', controls: 'Page/app background color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 99%' },
      { name: '--foreground', controls: 'Default body text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--primary', controls: 'Primary brand color (buttons, links, active states)', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--primary-foreground', controls: 'Text on primary color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--secondary', controls: 'Secondary actions and subdued surfaces', accepts: 'HSL: H S% L%', defaultValue: '240 5% 96%' },
      { name: '--secondary-foreground', controls: 'Text on secondary color', accepts: 'HSL: H S% L%', defaultValue: '240 4% 44%' },
      { name: '--muted', controls: 'Subdued backgrounds (disabled states, secondary surfaces)', accepts: 'HSL: H S% L%', defaultValue: '240 5% 96%' },
      { name: '--muted-foreground', controls: 'Subdued text (placeholders, secondary labels)', accepts: 'HSL: H S% L%', defaultValue: '240 4% 44%' },
      { name: '--accent', controls: 'Highlighted/hover backgrounds', accepts: 'HSL: H S% L%', defaultValue: '250 30% 95%' },
      { name: '--accent-foreground', controls: 'Text on accent color', accepts: 'HSL: H S% L%', defaultValue: '250 50% 40%' },
      { name: '--destructive', controls: 'Error and danger actions', accepts: 'HSL: H S% L%', defaultValue: '0 84% 50%' },
      { name: '--destructive-foreground', controls: 'Text on destructive color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--border', controls: 'Default border color for cards, dividers', accepts: 'HSL: H S% L%', defaultValue: '240 6% 92%' },
      { name: '--input', controls: 'Input field border color', accepts: 'HSL: H S% L%', defaultValue: '240 6% 92%' },
      { name: '--ring', controls: 'Focus ring color', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
    ],
  },
  {
    title: 'Fonts',
    description: 'CSS font-family stacks for body text, headings, and monospace code.',
    vars: [
      { name: '--font-sans', controls: 'Body/UI text font stack', accepts: 'CSS font-family string', defaultValue: "'Inter', system-ui, sans-serif" },
      { name: '--font-heading', controls: 'Heading font stack (can differ from body for personality)', accepts: 'CSS font-family string', defaultValue: "'Inter', system-ui, sans-serif" },
      { name: '--font-mono', controls: 'Code and monospace font stack', accepts: 'CSS font-family string', defaultValue: "'JetBrains Mono', ui-monospace, monospace" },
    ],
  },
  {
    title: 'Shape & Feel',
    description: 'The base border-radius that sets the overall shape language of your UI.',
    vars: [
      { name: '--radius', controls: 'Base radius (used as the default across components)', accepts: 'rem/px value', defaultValue: '0.375rem' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Advanced variables (~40 more) — the additional controls
// ---------------------------------------------------------------------------

const advancedCategories: Category[] = [
  {
    title: 'Extended Colors',
    description: 'Additional color tokens for cards, popovers, semantic states, sidebar, and data visualization.',
    vars: [
      { name: '--card', controls: 'Card component background', accepts: 'HSL: H S% L%', defaultValue: '0 0% 99%' },
      { name: '--card-foreground', controls: 'Card component text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--popover', controls: 'Popover/dropdown background', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--popover-foreground', controls: 'Popover/dropdown text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--success', controls: 'Success indicators and confirmations', accepts: 'HSL: H S% L%', defaultValue: '142 71% 35%' },
      { name: '--success-foreground', controls: 'Text on success color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--warning', controls: 'Warning indicators', accepts: 'HSL: H S% L%', defaultValue: '38 92% 50%' },
      { name: '--warning-foreground', controls: 'Text on warning color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--sidebar-background', controls: 'Sidebar background', accepts: 'HSL: H S% L%', defaultValue: '0 0% 98%' },
      { name: '--sidebar-foreground', controls: 'Sidebar text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--sidebar-primary', controls: 'Sidebar active item highlight', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--sidebar-primary-foreground', controls: 'Text on sidebar active item', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--sidebar-accent', controls: 'Sidebar hover/subtle highlight', accepts: 'HSL: H S% L%', defaultValue: '250 30% 95%' },
      { name: '--sidebar-accent-foreground', controls: 'Text on sidebar accent', accepts: 'HSL: H S% L%', defaultValue: '250 50% 40%' },
      { name: '--sidebar-border', controls: 'Sidebar border color', accepts: 'HSL: H S% L%', defaultValue: '240 6% 92%' },
      { name: '--sidebar-ring', controls: 'Sidebar focus ring', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--chart-1', controls: 'Primary chart color', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--chart-2', controls: 'Second chart color', accepts: 'HSL: H S% L%', defaultValue: '173 80% 36%' },
      { name: '--chart-3', controls: 'Third chart color', accepts: 'HSL: H S% L%', defaultValue: '38 92% 50%' },
      { name: '--chart-4', controls: 'Fourth chart color', accepts: 'HSL: H S% L%', defaultValue: '330 65% 50%' },
      { name: '--chart-5', controls: 'Fifth chart color', accepts: 'HSL: H S% L%', defaultValue: '201 96% 42%' },
    ],
  },
  {
    title: 'Typography Details',
    description: 'Controls the visual treatment of headings and base text size.',
    vars: [
      { name: '--heading-weight', controls: 'Font weight for headings', accepts: '100-900', defaultValue: '600' },
      { name: '--heading-letter-spacing', controls: 'Letter spacing for headings (negative = tighter)', accepts: 'em value', defaultValue: '-0.02em' },
      { name: '--heading-line-height', controls: 'Line height for headings', accepts: 'unitless ratio', defaultValue: '1.2' },
      { name: '--font-size-base', controls: 'Base body text size', accepts: 'rem/px value', defaultValue: '1rem' },
    ],
  },
  {
    title: 'Per-Component Radius',
    description: 'Override the border-radius for individual component types.',
    vars: [
      { name: '--avatar-radius', controls: 'Avatar border radius', accepts: 'rem/px/9999px', defaultValue: '9999px' },
      { name: '--badge-radius', controls: 'Badge border radius', accepts: 'rem/px/9999px', defaultValue: '9999px' },
      { name: '--button-radius', controls: 'Button border radius', accepts: 'rem/px value', defaultValue: '0.375rem' },
      { name: '--card-radius', controls: 'Card border radius', accepts: 'rem/px value', defaultValue: '0.5rem' },
    ],
  },
  {
    title: 'Depth -- Shadows',
    description: 'Shadow scale and per-component shadow overrides.',
    vars: [
      { name: '--shadow-sm', controls: 'Small shadow (subtle elevation)', accepts: 'CSS box-shadow', defaultValue: '0 1px 2px 0 rgb(0 0 0 / 0.03)' },
      { name: '--shadow-md', controls: 'Medium shadow (cards, dropdowns)', accepts: 'CSS box-shadow', defaultValue: '0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)' },
      { name: '--shadow-lg', controls: 'Large shadow (modals, popovers)', accepts: 'CSS box-shadow', defaultValue: '0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)' },
      { name: '--card-shadow', controls: 'Card component shadow', accepts: 'CSS box-shadow or none', defaultValue: '0 1px 2px 0 rgb(0 0 0 / 0.03)' },
      { name: '--button-shadow', controls: 'Button shadow (often none)', accepts: 'CSS box-shadow or none', defaultValue: 'none' },
    ],
  },
  {
    title: 'Transparency & Glass',
    description: 'Controls for overlay darkness, blur effects, and glassmorphism.',
    vars: [
      { name: '--overlay-opacity', controls: 'Backdrop overlay darkness (dialogs, drawers)', accepts: '0-1', defaultValue: '0.5' },
      { name: '--backdrop-blur', controls: 'Backdrop blur amount', accepts: 'px value', defaultValue: '8px' },
      { name: '--glass-bg', controls: 'Glass effect background color', accepts: 'rgba() value', defaultValue: 'rgba(252, 252, 253, 0.8)' },
    ],
  },
  {
    title: 'Density',
    description: 'Controls how compact or spacious the UI feels.',
    vars: [
      { name: '--spacing-scale', controls: 'Global spacing multiplier (affects all spacing)', accepts: '0.85-1.2', defaultValue: '1' },
      { name: '--card-padding', controls: 'Internal padding of card components', accepts: 'rem value', defaultValue: '1.5rem' },
      { name: '--input-height', controls: 'Height of input fields', accepts: 'rem value', defaultValue: '2.5rem' },
      { name: '--container-max-width', controls: 'Max width of the main content container', accepts: 'px value', defaultValue: '1280px' },
    ],
  },
  {
    title: 'Borders',
    description: 'Border width control.',
    vars: [
      { name: '--border-width', controls: 'Default border width for all bordered elements', accepts: 'px value', defaultValue: '1px' },
    ],
  },
  {
    title: 'Component Styles',
    description: 'Behavioral keywords that control component appearance.',
    vars: [
      { name: '--input-style', controls: 'Input visual style', accepts: 'bordered | filled | underline', defaultValue: 'bordered' },
      { name: '--button-style', controls: 'Default button visual style', accepts: 'filled | outline | ghost-default', defaultValue: 'filled' },
      { name: '--hover-effect', controls: 'What happens on hover', accepts: 'darken | lighten | shadow-lift | scale', defaultValue: 'darken' },
      { name: '--disabled-opacity', controls: 'Opacity of disabled elements', accepts: '0-1', defaultValue: '0.5' },
      { name: '--link-style', controls: 'How links are visually distinguished', accepts: 'color-only | underline | underline-on-hover', defaultValue: 'color-only' },
      { name: '--focus-ring-style', controls: 'Focus indicator style', accepts: 'ring | outline | shadow', defaultValue: 'ring' },
      { name: '--icon-style', controls: 'Icon set style', accepts: 'outlined | filled | duotone', defaultValue: 'outlined' },
      { name: '--icon-stroke-width', controls: 'Stroke width for outlined icons', accepts: 'number (1-3)', defaultValue: '1.5' },
      { name: '--tooltip-style', controls: 'Tooltip color scheme', accepts: 'dark | light | primary', defaultValue: 'dark' },
      { name: '--table-style', controls: 'Table row treatment', accepts: 'clean | striped | bordered', defaultValue: 'clean' },
      { name: '--scrollbar-style', controls: 'Scrollbar visibility and width', accepts: 'thin | hidden | default', defaultValue: 'thin' },
    ],
  },
  {
    title: 'Selection Highlight',
    description: 'Controls the color of text when selected with the cursor.',
    vars: [
      { name: '--selection-background', controls: 'Background color of selected text', accepts: 'HSL: H S% L%', defaultValue: '250 50% 90%' },
      { name: '--selection-foreground', controls: 'Text color of selected text', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Color swatch helper
// ---------------------------------------------------------------------------

function isHSLValue(value: string): boolean {
  return /^\d+\s+\d+%?\s+\d+%?$/.test(value.trim())
}

function ColorSwatch({ value }: { value: string }) {
  if (!isHSLValue(value)) return null
  return (
    <span
      className="inline-block h-4 w-4 rounded border border-border/50 shrink-0 align-middle mr-1.5"
      style={{ backgroundColor: `hsl(${value})` }}
    />
  )
}

// ---------------------------------------------------------------------------
// Category table component
// ---------------------------------------------------------------------------

function CategorySection({ cat, id }: { cat: Category; id: string }) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{cat.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-[30%]">Variable</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-[30%]">Controls</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-[20%]">Accepts</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground w-[20%]">Default</th>
            </tr>
          </thead>
          <tbody>
            {cat.vars.map((v, i) => (
              <tr key={i} className="border-b border-border/50 last:border-b-0">
                <td className="px-4 py-2 font-mono text-xs text-foreground">{v.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{v.controls}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{v.accepts}</td>
                <td className="px-4 py-2 font-mono text-xs text-foreground">
                  <ColorSwatch value={v.defaultValue} />
                  {v.defaultValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ThemeReferencePage() {
  const essentialVarCount = essentialCategories.reduce((acc, cat) => acc + cat.vars.length, 0)
  const advancedVarCount = advancedCategories.reduce((acc, cat) => acc + cat.vars.length, 0)
  const totalVars = essentialVarCount + advancedVarCount

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Theme Variable Reference</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete documentation for all {totalVars} CSS custom properties that control the Refraction UI visual identity.
          Split into <strong>Essential</strong> (~{essentialVarCount} variables, always needed) and <strong>Advanced</strong> (~{advancedVarCount} additional variables, optional).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/theme/editor" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80">
            Config Editor
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/theme/generate" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80">
            LLM Prompt Generator
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/theme" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80">
            Theme Playground
          </Link>
        </div>
      </div>

      {/* Table of contents */}
      <nav className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-3">Contents</h2>
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Essential (Simple mode)</h3>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {essentialCategories.map((cat, i) => (
                <a
                  key={`e-${i}`}
                  href={`#essential-${i}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  {cat.title} <span className="text-xs text-muted-foreground/60">({cat.vars.length})</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Advanced (additional controls)</h3>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {advancedCategories.map((cat, i) => (
                <a
                  key={`a-${i}`}
                  href={`#advanced-${i}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                >
                  {cat.title} <span className="text-xs text-muted-foreground/60">({cat.vars.length})</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Essential section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Essential</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{essentialVarCount} variables</span>
        </div>
        <p className="text-sm text-muted-foreground -mt-4">
          These are the only variables you need for Simple mode. Set your brand colors, pick your fonts, choose a radius.
        </p>

        {essentialCategories.map((cat, i) => (
          <CategorySection key={`e-${i}`} cat={cat} id={`essential-${i}`} />
        ))}
      </div>

      {/* Advanced section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Advanced</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">{advancedVarCount} additional variables</span>
        </div>
        <p className="text-sm text-muted-foreground -mt-4">
          Optional branding controls for designers who want to fine-tune every visual detail. These all have sensible defaults.
        </p>

        {advancedCategories.map((cat, i) => (
          <CategorySection key={`a-${i}`} cat={cat} id={`advanced-${i}`} />
        ))}
      </div>

      {/* Usage tips */}
      <section className="rounded-lg border border-border bg-accent/20 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Usage Tips</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">HSL format:</strong> Color values use raw HSL values without the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">hsl()</code> wrapper.
            Write <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">250 50% 50%</code> not <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">hsl(250, 50%, 50%)</code>.
          </li>
          <li>
            <strong className="text-foreground">Contrast:</strong> All foreground/background pairs should meet WCAG AA contrast (4.5:1 for text, 3:1 for large text).
          </li>
          <li>
            <strong className="text-foreground">Simple mode:</strong> Start with just the Essential variables. The Advanced controls all have good defaults and can be added later.
          </li>
          <li>
            <strong className="text-foreground">Density:</strong> The <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--spacing-scale</code> acts as a global multiplier. Values below 1 make the UI denser, above 1 make it more spacious.
          </li>
        </ul>
      </section>
    </div>
  )
}
