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

const categories: Category[] = [
  {
    title: 'Colors -- Surface & Text',
    description: 'Background and foreground colors for the page, cards, and popovers. All color values use HSL format without the hsl() wrapper: "hue saturation% lightness%".',
    vars: [
      { name: '--background', controls: 'Page/app background color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 99%' },
      { name: '--foreground', controls: 'Default body text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--card', controls: 'Card component background', accepts: 'HSL: H S% L%', defaultValue: '0 0% 99%' },
      { name: '--card-foreground', controls: 'Card component text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--popover', controls: 'Popover/dropdown background', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--popover-foreground', controls: 'Popover/dropdown text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
    ],
  },
  {
    title: 'Colors -- Brand',
    description: 'Primary, secondary, and accent colors that define your brand identity. Each has a foreground pair for text on that color.',
    vars: [
      { name: '--primary', controls: 'Primary brand color (buttons, links, active states)', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--primary-foreground', controls: 'Text on primary color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--secondary', controls: 'Secondary actions and subdued surfaces', accepts: 'HSL: H S% L%', defaultValue: '240 5% 96%' },
      { name: '--secondary-foreground', controls: 'Text on secondary color', accepts: 'HSL: H S% L%', defaultValue: '240 4% 44%' },
      { name: '--accent', controls: 'Highlighted/hover backgrounds', accepts: 'HSL: H S% L%', defaultValue: '250 30% 95%' },
      { name: '--accent-foreground', controls: 'Text on accent color', accepts: 'HSL: H S% L%', defaultValue: '250 50% 40%' },
    ],
  },
  {
    title: 'Colors -- Semantic',
    description: 'Colors that convey meaning: muted content, destructive actions, success, and warnings.',
    vars: [
      { name: '--muted', controls: 'Subdued backgrounds (disabled states, secondary surfaces)', accepts: 'HSL: H S% L%', defaultValue: '240 5% 96%' },
      { name: '--muted-foreground', controls: 'Subdued text (placeholders, secondary labels)', accepts: 'HSL: H S% L%', defaultValue: '240 4% 44%' },
      { name: '--destructive', controls: 'Error and danger actions', accepts: 'HSL: H S% L%', defaultValue: '0 84% 50%' },
      { name: '--destructive-foreground', controls: 'Text on destructive color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--success', controls: 'Success indicators and confirmations', accepts: 'HSL: H S% L%', defaultValue: '142 71% 35%' },
      { name: '--success-foreground', controls: 'Text on success color', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--warning', controls: 'Warning indicators', accepts: 'HSL: H S% L%', defaultValue: '38 92% 50%' },
      { name: '--warning-foreground', controls: 'Text on warning color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
    ],
  },
  {
    title: 'Colors -- Borders & Input',
    description: 'Colors for borders, input outlines, and the focus ring.',
    vars: [
      { name: '--border', controls: 'Default border color for cards, dividers', accepts: 'HSL: H S% L%', defaultValue: '240 6% 92%' },
      { name: '--input', controls: 'Input field border color', accepts: 'HSL: H S% L%', defaultValue: '240 6% 92%' },
      { name: '--ring', controls: 'Focus ring color', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
    ],
  },
  {
    title: 'Colors -- Sidebar',
    description: 'Dedicated color tokens for sidebar navigation. Allows the sidebar to have an entirely different color scheme (e.g. dark sidebar with light content).',
    vars: [
      { name: '--sidebar-background', controls: 'Sidebar background', accepts: 'HSL: H S% L%', defaultValue: '0 0% 98%' },
      { name: '--sidebar-foreground', controls: 'Sidebar text color', accepts: 'HSL: H S% L%', defaultValue: '240 10% 10%' },
      { name: '--sidebar-primary', controls: 'Sidebar active item highlight', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--sidebar-primary-foreground', controls: 'Text on sidebar active item', accepts: 'HSL: H S% L%', defaultValue: '0 0% 100%' },
      { name: '--sidebar-accent', controls: 'Sidebar hover/subtle highlight', accepts: 'HSL: H S% L%', defaultValue: '250 30% 95%' },
      { name: '--sidebar-accent-foreground', controls: 'Text on sidebar accent', accepts: 'HSL: H S% L%', defaultValue: '250 50% 40%' },
      { name: '--sidebar-border', controls: 'Sidebar border color', accepts: 'HSL: H S% L%', defaultValue: '240 6% 92%' },
      { name: '--sidebar-ring', controls: 'Sidebar focus ring', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
    ],
  },
  {
    title: 'Colors -- Charts',
    description: 'A 5-color palette for data visualizations and charts. Should be chosen for colorblind accessibility.',
    vars: [
      { name: '--chart-1', controls: 'Primary chart color', accepts: 'HSL: H S% L%', defaultValue: '250 50% 50%' },
      { name: '--chart-2', controls: 'Second chart color', accepts: 'HSL: H S% L%', defaultValue: '173 80% 36%' },
      { name: '--chart-3', controls: 'Third chart color', accepts: 'HSL: H S% L%', defaultValue: '38 92% 50%' },
      { name: '--chart-4', controls: 'Fourth chart color', accepts: 'HSL: H S% L%', defaultValue: '330 65% 50%' },
      { name: '--chart-5', controls: 'Fifth chart color', accepts: 'HSL: H S% L%', defaultValue: '201 96% 42%' },
    ],
  },
  {
    title: 'Typography -- Font Families',
    description: 'CSS font-family stacks for body text, headings, and monospace code.',
    vars: [
      { name: '--font-sans', controls: 'Body/UI text font stack', accepts: 'CSS font-family string', defaultValue: "'Inter', system-ui, sans-serif" },
      { name: '--font-heading', controls: 'Heading font stack (can differ from body for personality)', accepts: 'CSS font-family string', defaultValue: "'Inter', system-ui, sans-serif" },
      { name: '--font-mono', controls: 'Code and monospace font stack', accepts: 'CSS font-family string', defaultValue: "'JetBrains Mono', ui-monospace, monospace" },
    ],
  },
  {
    title: 'Typography -- Size Scale',
    description: 'A 9-step type scale from extra-small to 5xl. Used across all components for consistent sizing.',
    vars: [
      { name: '--font-size-xs', controls: 'Extra small text (labels, captions)', accepts: 'rem/px value', defaultValue: '0.75rem' },
      { name: '--font-size-sm', controls: 'Small text (secondary text, badges)', accepts: 'rem/px value', defaultValue: '0.875rem' },
      { name: '--font-size-base', controls: 'Base body text size', accepts: 'rem/px value', defaultValue: '1rem' },
      { name: '--font-size-lg', controls: 'Large text (emphasized content)', accepts: 'rem/px value', defaultValue: '1.125rem' },
      { name: '--font-size-xl', controls: 'Extra large text (section headers)', accepts: 'rem/px value', defaultValue: '1.25rem' },
      { name: '--font-size-2xl', controls: '2XL text (page headings)', accepts: 'rem/px value', defaultValue: '1.5rem' },
      { name: '--font-size-3xl', controls: '3XL text (hero subheadings)', accepts: 'rem/px value', defaultValue: '1.875rem' },
      { name: '--font-size-4xl', controls: '4XL text (hero headings)', accepts: 'rem/px value', defaultValue: '2.25rem' },
      { name: '--font-size-5xl', controls: '5XL text (display text)', accepts: 'rem/px value', defaultValue: '3rem' },
    ],
  },
  {
    title: 'Typography -- Weights',
    description: 'Font weight tokens used across components. Adjust the entire weight range to match your chosen typeface.',
    vars: [
      { name: '--font-weight-normal', controls: 'Normal body text weight', accepts: '100-900', defaultValue: '400' },
      { name: '--font-weight-medium', controls: 'Medium weight (labels, table headers)', accepts: '100-900', defaultValue: '500' },
      { name: '--font-weight-semibold', controls: 'Semibold weight (buttons, section titles)', accepts: '100-900', defaultValue: '600' },
      { name: '--font-weight-bold', controls: 'Bold weight (headings, emphasis)', accepts: '100-900', defaultValue: '700' },
    ],
  },
  {
    title: 'Typography -- Heading Treatment',
    description: 'Controls the visual treatment of all heading elements.',
    vars: [
      { name: '--heading-weight', controls: 'Font weight for headings', accepts: '100-900', defaultValue: '600' },
      { name: '--heading-letter-spacing', controls: 'Letter spacing for headings (negative = tighter)', accepts: 'em value', defaultValue: '-0.02em' },
      { name: '--heading-line-height', controls: 'Line height for headings', accepts: 'unitless ratio', defaultValue: '1.2' },
    ],
  },
  {
    title: 'Typography -- Letter Spacing Scale',
    description: 'A 5-step letter spacing scale from very tight to wide. Used for labels, headings, and body text.',
    vars: [
      { name: '--letter-spacing-tighter', controls: 'Tightest tracking (display text)', accepts: 'em value', defaultValue: '-0.04em' },
      { name: '--letter-spacing-tight', controls: 'Tight tracking (headings)', accepts: 'em value', defaultValue: '-0.02em' },
      { name: '--letter-spacing-normal', controls: 'Normal tracking (body text)', accepts: 'em value', defaultValue: '0' },
      { name: '--letter-spacing-wide', controls: 'Wide tracking (small labels, badges)', accepts: 'em value', defaultValue: '0.02em' },
      { name: '--letter-spacing-wider', controls: 'Widest tracking (uppercase labels)', accepts: 'em value', defaultValue: '0.05em' },
    ],
  },
  {
    title: 'Typography -- Line Height Scale',
    description: 'Three line height steps for different content density needs.',
    vars: [
      { name: '--line-height-tight', controls: 'Tight line height (headings, compact UI)', accepts: 'unitless ratio', defaultValue: '1.3' },
      { name: '--line-height-normal', controls: 'Normal line height (body text)', accepts: 'unitless ratio', defaultValue: '1.5' },
      { name: '--line-height-relaxed', controls: 'Relaxed line height (long-form reading)', accepts: 'unitless ratio', defaultValue: '1.7' },
    ],
  },
  {
    title: 'Shape -- Radius Scale',
    description: 'An 8-step border-radius scale from none to fully round, plus a base --radius token.',
    vars: [
      { name: '--radius', controls: 'Base radius (used as the default across components)', accepts: 'rem/px value', defaultValue: '0.375rem' },
      { name: '--radius-none', controls: 'No rounding (sharp corners)', accepts: '0', defaultValue: '0' },
      { name: '--radius-sm', controls: 'Small radius (tags, small inputs)', accepts: 'rem/px value', defaultValue: '0.25rem' },
      { name: '--radius-md', controls: 'Medium radius (buttons, inputs)', accepts: 'rem/px value', defaultValue: '0.375rem' },
      { name: '--radius-lg', controls: 'Large radius (cards, dialogs)', accepts: 'rem/px value', defaultValue: '0.5rem' },
      { name: '--radius-xl', controls: 'Extra large radius (hero cards)', accepts: 'rem/px value', defaultValue: '0.75rem' },
      { name: '--radius-2xl', controls: '2XL radius (large containers)', accepts: 'rem/px value', defaultValue: '1rem' },
      { name: '--radius-full', controls: 'Full/pill radius (avatars, pills)', accepts: '9999px', defaultValue: '9999px' },
    ],
  },
  {
    title: 'Shape -- Per-Component Radius',
    description: 'Override the border-radius for individual component types. Set avatar-radius to a square value for a different avatar style, or make buttons sharp while cards stay rounded.',
    vars: [
      { name: '--avatar-radius', controls: 'Avatar border radius', accepts: 'rem/px/9999px', defaultValue: '9999px' },
      { name: '--badge-radius', controls: 'Badge border radius', accepts: 'rem/px/9999px', defaultValue: '9999px' },
      { name: '--button-radius', controls: 'Button border radius', accepts: 'rem/px value', defaultValue: '0.375rem' },
      { name: '--input-radius', controls: 'Input field border radius', accepts: 'rem/px value', defaultValue: '0.375rem' },
      { name: '--card-radius', controls: 'Card border radius', accepts: 'rem/px value', defaultValue: '0.5rem' },
      { name: '--tooltip-radius', controls: 'Tooltip border radius', accepts: 'rem/px value', defaultValue: '0.375rem' },
    ],
  },
  {
    title: 'Depth -- Shadows',
    description: 'A 5-step shadow scale from none to extra-large. Controls the depth/elevation appearance.',
    vars: [
      { name: '--shadow-none', controls: 'No shadow', accepts: 'none', defaultValue: 'none' },
      { name: '--shadow-sm', controls: 'Small shadow (subtle elevation)', accepts: 'CSS box-shadow', defaultValue: '0 1px 2px 0 rgb(0 0 0 / 0.03)' },
      { name: '--shadow-md', controls: 'Medium shadow (cards, dropdowns)', accepts: 'CSS box-shadow', defaultValue: '0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)' },
      { name: '--shadow-lg', controls: 'Large shadow (modals, popovers)', accepts: 'CSS box-shadow', defaultValue: '0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)' },
      { name: '--shadow-xl', controls: 'Extra large shadow (dialogs, overlays)', accepts: 'CSS box-shadow', defaultValue: '0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03)' },
    ],
  },
  {
    title: 'Depth -- Per-Component Shadows',
    description: 'Override the shadow for individual component types. For example, give cards a subtle shadow while dialogs get a dramatic one.',
    vars: [
      { name: '--card-shadow', controls: 'Card component shadow', accepts: 'CSS box-shadow or none', defaultValue: '0 1px 2px 0 rgb(0 0 0 / 0.03)' },
      { name: '--dropdown-shadow', controls: 'Dropdown/popover shadow', accepts: 'CSS box-shadow', defaultValue: '0 6px 10px -2px rgb(0 0 0 / 0.1)' },
      { name: '--dialog-shadow', controls: 'Dialog/modal shadow', accepts: 'CSS box-shadow', defaultValue: '0 12px 20px -4px rgb(0 0 0 / 0.1)' },
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
      { name: '--glass-border', controls: 'Glass effect border color', accepts: 'rgba() value', defaultValue: 'rgba(255, 255, 255, 0.15)' },
    ],
  },
  {
    title: 'Spacing & Density',
    description: 'Controls how compact or spacious the UI feels. Lower spacing-scale = denser, higher = more breathing room.',
    vars: [
      { name: '--spacing-scale', controls: 'Global spacing multiplier (affects all spacing)', accepts: '0.85-1.2', defaultValue: '1' },
      { name: '--card-padding', controls: 'Internal padding of card components', accepts: 'rem value', defaultValue: '1.5rem' },
      { name: '--input-height', controls: 'Height of input fields', accepts: 'rem value', defaultValue: '2.5rem' },
      { name: '--button-height', controls: 'Height of buttons', accepts: 'rem value', defaultValue: '2.5rem' },
      { name: '--section-gap', controls: 'Vertical gap between major page sections', accepts: 'rem value', defaultValue: '3rem' },
      { name: '--container-max-width', controls: 'Max width of the main content container', accepts: 'px value', defaultValue: '1280px' },
      { name: '--container-padding', controls: 'Horizontal padding of the content container', accepts: 'rem value', defaultValue: '2rem' },
    ],
  },
  {
    title: 'Borders & Dividers',
    description: 'Controls for border width, style, and divider appearance.',
    vars: [
      { name: '--border-width', controls: 'Default border width for all bordered elements', accepts: 'px value', defaultValue: '1px' },
      { name: '--border-style', controls: 'Border style (solid, dashed, etc.)', accepts: 'CSS border-style', defaultValue: 'solid' },
      { name: '--divider-style', controls: 'Horizontal divider/rule style', accepts: 'CSS border-style', defaultValue: 'solid' },
      { name: '--divider-opacity', controls: 'Divider transparency', accepts: '0-1', defaultValue: '0.15' },
    ],
  },
  {
    title: 'Component Styles -- Inputs',
    description: 'Behavioral keywords that control how input fields look and behave.',
    vars: [
      { name: '--input-style', controls: 'Input visual style', accepts: 'bordered | filled | underline', defaultValue: 'bordered' },
      { name: '--input-border-on-focus', controls: 'Whether the border appears only on focus', accepts: 'true | false', defaultValue: 'false' },
      { name: '--placeholder-opacity', controls: 'Opacity of placeholder text', accepts: '0-1', defaultValue: '0.5' },
    ],
  },
  {
    title: 'Component Styles -- Buttons',
    description: 'Controls for button appearance and interaction behavior.',
    vars: [
      { name: '--button-style', controls: 'Default button visual style', accepts: 'filled | outline | ghost-default', defaultValue: 'filled' },
      { name: '--button-weight', controls: 'Button text font weight', accepts: '100-900', defaultValue: '500' },
      { name: '--hover-effect', controls: 'What happens on hover', accepts: 'darken | lighten | shadow-lift | scale', defaultValue: 'darken' },
      { name: '--active-effect', controls: 'What happens on click/press', accepts: 'scale-down | darken | none', defaultValue: 'scale-down' },
      { name: '--disabled-opacity', controls: 'Opacity of disabled elements', accepts: '0-1', defaultValue: '0.5' },
    ],
  },
  {
    title: 'Component Styles -- Links',
    description: 'Controls for link appearance.',
    vars: [
      { name: '--link-style', controls: 'How links are visually distinguished', accepts: 'color-only | underline | underline-on-hover', defaultValue: 'color-only' },
      { name: '--link-weight', controls: 'Font weight for links', accepts: 'inherit | 400-700', defaultValue: 'inherit' },
    ],
  },
  {
    title: 'Focus',
    description: 'Controls for the focus indicator that appears when users navigate with keyboard.',
    vars: [
      { name: '--focus-ring-width', controls: 'Width of the focus ring', accepts: 'px value', defaultValue: '2px' },
      { name: '--focus-ring-offset', controls: 'Gap between element and focus ring', accepts: 'px value', defaultValue: '2px' },
      { name: '--focus-ring-style', controls: 'Focus indicator style', accepts: 'ring | outline | shadow', defaultValue: 'ring' },
    ],
  },
  {
    title: 'Icons',
    description: 'Controls for icon rendering style.',
    vars: [
      { name: '--icon-style', controls: 'Icon set style', accepts: 'outlined | filled | duotone', defaultValue: 'outlined' },
      { name: '--icon-stroke-width', controls: 'Stroke width for outlined icons', accepts: 'number (1-3)', defaultValue: '1.5' },
      { name: '--icon-size', controls: 'Default icon size', accepts: 'rem/px value', defaultValue: '1rem' },
    ],
  },
  {
    title: 'Scrollbar',
    description: 'Controls for custom scrollbar appearance.',
    vars: [
      { name: '--scrollbar-style', controls: 'Scrollbar visibility and width', accepts: 'thin | hidden | default', defaultValue: 'thin' },
      { name: '--scrollbar-track', controls: 'Scrollbar track color', accepts: 'CSS color or transparent', defaultValue: 'transparent' },
      { name: '--scrollbar-thumb', controls: 'Scrollbar thumb color', accepts: 'CSS color (rgba recommended)', defaultValue: 'rgba(0, 0, 0, 0.1)' },
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
  {
    title: 'Tooltips, Tables & Loading',
    description: 'Behavioral keywords for tooltips, data tables, and loading indicators.',
    vars: [
      { name: '--tooltip-style', controls: 'Tooltip color scheme', accepts: 'dark | light | primary', defaultValue: 'dark' },
      { name: '--table-style', controls: 'Table row treatment', accepts: 'clean | striped | bordered', defaultValue: 'clean' },
      { name: '--table-header-weight', controls: 'Font weight for table headers', accepts: '100-900', defaultValue: '600' },
      { name: '--spinner-style', controls: 'Loading spinner style', accepts: 'circle | dots | pulse', defaultValue: 'circle' },
    ],
  },
  {
    title: 'Motion & Animation',
    description: 'Controls for transition durations, easings, and animation speed. Affects how responsive and lively the UI feels.',
    vars: [
      { name: '--transition-duration', controls: 'Default transition duration', accepts: 'ms value (100-300)', defaultValue: '150ms' },
      { name: '--transition-easing', controls: 'Default easing curve', accepts: 'CSS timing function', defaultValue: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      { name: '--animation-speed', controls: 'Global animation speed modifier', accepts: 'fast | normal | slow', defaultValue: 'normal' },
      { name: '--hover-transition', controls: 'Transition for hover states', accepts: 'CSS shorthand (duration easing)', defaultValue: '150ms ease' },
      { name: '--enter-transition', controls: 'Transition for elements entering (modals, dropdowns)', accepts: 'CSS shorthand', defaultValue: '200ms cubic-bezier(0.4, 0, 0.2, 1)' },
      { name: '--exit-transition', controls: 'Transition for elements exiting', accepts: 'CSS shorthand', defaultValue: '150ms cubic-bezier(0.4, 0, 1, 1)' },
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
// Page
// ---------------------------------------------------------------------------

export default function ThemeReferencePage() {
  const totalVars = categories.reduce((acc, cat) => acc + cat.vars.length, 0)

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Theme Variable Reference</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete documentation for all {totalVars} CSS custom properties that control the Refraction UI visual identity.
          Organized into {categories.length} categories.
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
        <h2 className="text-base font-semibold text-foreground mb-3">Categories</h2>
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <a
              key={i}
              href={`#cat-${i}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
            >
              {cat.title} <span className="text-xs text-muted-foreground/60">({cat.vars.length})</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Category sections */}
      {categories.map((cat, catIndex) => (
        <section key={catIndex} id={`cat-${catIndex}`} className="scroll-mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">{cat.title}</h2>
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
      ))}

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
            <strong className="text-foreground">Component radius overrides:</strong> Per-component radius values override the base <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--radius</code>. Set <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--avatar-radius: 0.5rem</code> for square avatars while keeping pill badges.
          </li>
          <li>
            <strong className="text-foreground">Density:</strong> The <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--spacing-scale</code> acts as a global multiplier. Values below 1 make the UI denser, above 1 make it more spacious.
          </li>
          <li>
            <strong className="text-foreground">Motion:</strong> Set <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">--animation-speed: fast</code> for snappy UIs or <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">slow</code> for more elegant transitions.
          </li>
        </ul>
      </section>
    </div>
  )
}
