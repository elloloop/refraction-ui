import { SkipToContentExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const skipToContentProps = [
  {
    name: 'targetId',
    type: 'string',
    default: "'main-content'",
    description: 'The id of the element to skip to (without the leading #).',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    default: "'Skip to content'",
    description: 'The visible label shown when the link receives focus.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { SkipToContent } from '@refraction-ui/react'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipToContent targetId="main-content" />
      <nav>{/* ... */}</nav>
      <main id="main-content">{children}</main>
    </>
  )
}`

export default function SkipToContentPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Skip to Content</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An accessible &ldquo;skip link&rdquo; that lets keyboard and screen-reader users jump
          past navigation straight to the main content. Visually hidden until focused.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Default</h2>
        <p className="text-sm text-muted-foreground">
          Renders an anchor to <code className="text-xs bg-muted px-1 rounded">#main-content</code>{' '}
          that becomes visible on keyboard focus.
        </p>
        <SkipToContentExamples section="default" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-skip-to-content" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom target &amp; label</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 rounded">targetId</code> and custom children
          to point at any region of the page.
        </p>
        <SkipToContentExamples section="custom-target" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <p className="text-sm text-muted-foreground">
          Accepts all native <code className="text-xs bg-muted px-1 rounded">&lt;a&gt;</code> attributes in addition to the props below.
        </p>
        <PropsTable props={skipToContentProps} />
      </section>
    </div>
  )
}
