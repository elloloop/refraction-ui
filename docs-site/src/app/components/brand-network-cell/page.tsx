import { BrandNetworkCellExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const brandNetworkCellProps = [
  {
    name: 'glyph',
    type: 'string',
    description: 'Single character or short string used as the brand monogram.',
  },
  {
    name: 'glyphBg',
    type: 'string',
    description: 'CSS colour value for the glyph box background (brand tint). Applied via inline style.',
  },
  {
    name: 'glyphColor',
    type: 'string',
    description: 'CSS colour value for the glyph text (brand tint). Applied via inline style.',
  },
  {
    name: 'domain',
    type: 'string',
    description: 'Primary identifier shown below the glyph (product domain or name).',
  },
  {
    name: 'body',
    type: 'string',
    description: 'Supporting description text.',
  },
  {
    name: 'href',
    type: 'string',
    description: 'When provided, renders a link at the bottom of the card.',
  },
  {
    name: 'linkLabel',
    type: 'string',
    default: '"Visit →"',
    description: 'Label for the optional link.',
  },
  {
    name: 'current',
    type: 'boolean',
    default: 'false',
    description: 'Marks this cell as the active product in the network. Adds a primary ring and a "You are here" badge.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the card.',
  },
]

const usageCode = `import { BrandNetworkCell } from '@refraction-ui/react'

export function MyPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <BrandNetworkCell
        glyph="G"
        glyphBg="#6366f1"
        glyphColor="#ffffff"
        domain="glassa.ai"
        body="The AI-powered glass design studio for modern teams."
        href="https://glassa.ai"
        current
      />
      <BrandNetworkCell
        glyph="R"
        glyphBg="#f59e0b"
        glyphColor="#ffffff"
        domain="refraction.dev"
        body="Open-source UI components for the modern web."
        href="https://refraction.dev"
        linkLabel="Explore →"
      />
    </div>
  )
}`

export default function BrandNetworkCellPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Brand Network Cell</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A cross-product network card for surfacing related products or sister
          brands. Displays a glyph monogram with caller-provided brand tints, a
          domain name, a "You are here" badge when active, body copy, and an
          optional visit link.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Current cell</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">current</code> to
          mark the active product. A primary ring and "You are here" badge are
          added automatically.
        </p>
        <BrandNetworkCellExamples section="current" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Neighbour cell</h2>
        <p className="text-sm text-muted-foreground">
          A non-current neighbour in the network — no ring, no badge. Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">href</code> to render
          a visit link, and optionally{' '}
          <code className="text-xs bg-muted px-1 rounded">linkLabel</code> to
          customise its text.
        </p>
        <BrandNetworkCellExamples section="neighbour" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pair side-by-side</h2>
        <p className="text-sm text-muted-foreground">
          Typical usage: a two-column grid with the current product on the left
          and one or more neighbours on the right.
        </p>
        <BrandNetworkCellExamples section="pair" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={brandNetworkCellProps} />
      </section>
    </div>
  )
}
