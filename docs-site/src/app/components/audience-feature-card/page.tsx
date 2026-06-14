import { AudienceFeatureCardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const audienceFeatureCardProps = [
  {
    name: 'title',
    type: 'React.ReactNode',
    description: 'Main title — required.',
  },
  {
    name: 'body',
    type: 'React.ReactNode',
    description: 'Body copy.',
  },
  {
    name: 'kicker',
    type: 'React.ReactNode',
    description: 'Small label displayed above the title (e.g. "For teams").',
  },
  {
    name: 'footer',
    type: 'React.ReactNode',
    description: 'Footer slot — pushed to the bottom of the card via mt-auto.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { AudienceFeatureCard } from '@refraction-ui/react'

export function MyPage() {
  return (
    <AudienceFeatureCard
      kicker="For teams"
      title="Collaborate in real time"
      body="Invite your whole team, share workspaces, and ship together."
      footer={<a href="/pricing">See team plans →</a>}
    />
  )
}`

export default function AudienceFeatureCardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Audience Feature Card</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A marketing card for showcasing features by audience segment.
          Full-height flex-col layout ensures footers align across a row of
          cards — ideal for pricing tiers, persona callouts, and feature grids.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Title and body are required. The card fills its container height so a
          row of cards stays flush at the bottom.
        </p>
        <AudienceFeatureCardExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With footer badge</h2>
        <p className="text-sm text-muted-foreground">
          Pass a{' '}
          <code className="text-xs bg-muted px-1 rounded">footer</code> node
          to anchor an action or label at the bottom — a link, badge, or price
          tag all work here.
        </p>
        <AudienceFeatureCardExamples section="footer" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Three-card row</h2>
        <p className="text-sm text-muted-foreground">
          Cards are full-height by default, so footers naturally align in a
          CSS grid or flex row — no extra height wrangling needed.
        </p>
        <AudienceFeatureCardExamples section="row" />
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
        <PropsTable props={audienceFeatureCardProps} />
      </section>
    </div>
  )
}
