import { LinkCardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const linkCardProps = [
  {
    name: 'href',
    type: 'string',
    description: 'Destination URL. Forwarded to the underlying anchor element.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the anchor.',
  },
  {
    name: '...props',
    type: 'React.AnchorHTMLAttributes<HTMLAnchorElement>',
    description:
      'All standard anchor attributes (target, rel, onClick, children, etc.) are forwarded to the rendered <a>.',
  },
]

const usageCode = `import { LinkCard } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <LinkCard
      href="/docs"
      className="block rounded-xl border border-border bg-background p-5 hover:border-primary/50"
    >
      <span className="block text-sm font-semibold">Documentation</span>
      <span className="mt-1 block text-sm text-muted-foreground">
        Guides and API references.
      </span>
    </LinkCard>
  )
}`

export default function LinkCardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Link Card</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An anchor that wraps an entire card so the whole surface is clickable. Uses the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/link-card</code> core
          and forwards every native anchor attribute.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Wrap any content; the full card becomes a single link.
        </p>
        <LinkCardExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-link-card" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Card grid</h2>
        <p className="text-sm text-muted-foreground">
          Link cards compose naturally into grids of navigable destinations.
        </p>
        <LinkCardExamples section="list" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={linkCardProps} />
      </section>
    </div>
  )
}
