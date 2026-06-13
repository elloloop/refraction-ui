import { SectionHeadExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const sectionHeadProps = [
  {
    name: 'title',
    type: 'React.ReactNode',
    description: 'Primary heading content (required).',
  },
  {
    name: 'kicker',
    type: 'React.ReactNode',
    description: 'Optional small-caps eyebrow rendered above the title.',
  },
  {
    name: 'lede',
    type: 'React.ReactNode',
    description: 'Optional lede paragraph rendered below the title.',
  },
  {
    name: 'align',
    type: "'center' | 'left'",
    default: "'center'",
    description: 'Horizontal alignment of the kicker, title, and lede.',
  },
  {
    name: 'as',
    type: "'h1' | 'h2' | 'h3'",
    default: "'h2'",
    description: 'Override the heading element rendered for the title.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the wrapper.',
  },
]

const usageCode = `import { SectionHead } from '@refraction-ui/react'

export function HeroSection() {
  return (
    <SectionHead
      kicker="Why refraction"
      title="Build beautiful UIs faster"
      lede="A comprehensive component library that grows with your product."
      align="center"
    />
  )
}`

export default function SectionHeadPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Section Head</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A marketing section heading cluster — small-caps kicker, h2 title, and
          optional lede paragraph — with center or left alignment. Drop it at the
          top of any landing page section.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Centered</h2>
        <p className="text-sm text-muted-foreground">
          The default alignment. Kicker, title, and container are centered and
          constrained to a readable max-width.
        </p>
        <SectionHeadExamples section="centered" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Left-aligned</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">align=&quot;left&quot;</code> for
          flush-left sections, common in feature lists and split layouts.
        </p>
        <SectionHeadExamples section="left" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With lede</h2>
        <p className="text-sm text-muted-foreground">
          Add a <code className="text-xs bg-muted px-1 rounded">lede</code> prop
          to render a supporting paragraph below the title.
        </p>
        <SectionHeadExamples section="with-lede" />
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
        <PropsTable props={sectionHeadProps} />
      </section>
    </div>
  )
}
