import { FooterExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const footerProps = [
  { name: 'copyright', type: 'string', description: 'Custom copyright text.' },
  { name: 'columns', type: 'FooterColumn[]', description: 'Footer link columns with title and links.' },
  { name: 'socialLinks', type: 'SocialLink[]', description: 'Social media links with label and href.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Footer } from '@refraction-ui/react-footer'

export function MyComponent() {
  return (
    <Footer
      copyright="2024 My Company"
      columns={[
        { title: 'Product', links: [{ label: 'Features', href: '/features' }] },
      ]}
      socialLinks={[{ label: 'GitHub', href: 'https://github.com' }]}
    />
  )
}`

export default function FooterPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Footer</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A site footer with link columns, copyright text, and social links.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/footer</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Footer with link columns and social links.</p>
        <FooterExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={footerProps} />
      </section>
    </div>
  )
}
