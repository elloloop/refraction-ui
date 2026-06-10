import { CalloutExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const calloutProps = [
  {
    name: 'variant',
    type: "'default' | 'destructive' | 'success' | 'warning' | 'info'",
    default: "'default'",
    description:
      'Visual tone of the callout. `destructive` also sets `role="alert"` for assistive tech; the others use `role="region"`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the root element.',
  },
]

const subComponentProps = [
  {
    name: 'CalloutIcon',
    type: 'div',
    description: 'Wrapper for a leading icon. Adds flex-shrink and top alignment.',
  },
  {
    name: 'CalloutContent',
    type: 'div',
    description: 'Flex-1 wrapper grouping the title and description beside the icon.',
  },
  {
    name: 'CalloutTitle',
    type: 'h5',
    description: 'Styled heading for the callout.',
  },
  {
    name: 'CalloutDescription',
    type: 'div',
    description: 'Styled body text for the callout.',
  },
]

const usageCode = `import {
  Callout,
  CalloutIcon,
  CalloutContent,
  CalloutTitle,
  CalloutDescription,
} from '@refraction-ui/react'

export function MyComponent() {
  return (
    <Callout variant="info" className="flex gap-3 rounded-lg border p-4">
      <CalloutIcon>{/* your icon */}</CalloutIcon>
      <CalloutContent>
        <CalloutTitle>Scheduled maintenance</CalloutTitle>
        <CalloutDescription>
          The dashboard will be briefly unavailable on Sunday.
        </CalloutDescription>
      </CalloutContent>
    </Callout>
  )
}`

export default function CalloutPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Callout</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A bordered message block for surfacing contextual information, tips, and warnings.
          Uses the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/callout</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Variants</h2>
        <p className="text-sm text-muted-foreground">
          Five tones for different intents. The{' '}
          <code className="text-xs bg-muted px-1 rounded">destructive</code> variant is announced as an alert.
        </p>
        <CalloutExamples section="variants" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-callout" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Composition</h2>
        <p className="text-sm text-muted-foreground">
          Compose an icon, title, and description with the provided sub-components for a
          richer layout.
        </p>
        <CalloutExamples section="composition" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={calloutProps} />
        <p className="text-sm text-muted-foreground">
          Sub-components — each forwards all native props of the element noted below.
        </p>
        <PropsTable props={subComponentProps} />
      </section>
    </div>
  )
}
