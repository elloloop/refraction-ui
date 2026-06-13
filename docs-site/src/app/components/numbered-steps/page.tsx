import { NumberedStepsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const numberedStepsProps = [
  {
    name: 'items',
    type: 'NumberedStepItem[]',
    description:
      'The step items to display. Each item has a `title` and `body` string.',
  },
  {
    name: 'columns',
    type: 'number',
    description:
      'Override the number of grid columns. Defaults to clamping the item count to 2–5.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the grid container.',
  },
]

const usageCode = `import { NumberedSteps } from '@refraction-ui/react'

const steps = [
  { title: 'Create an account', body: 'Sign up with your email address.' },
  { title: 'Configure settings', body: 'Choose your preferences.' },
  { title: 'Invite your team', body: 'Add teammates to your workspace.' },
  { title: 'Start building', body: 'Use our API to ship your first feature.' },
]

export function HowItWorks() {
  return <NumberedSteps items={steps} />
}`

export default function NumberedStepsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Numbered Steps</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A static how-it-works step grid with zero-padded ordinal badges,
          titles, and body copy — ideal for onboarding flows and feature
          overviews. Not a stateful stepper; use the{' '}
          <code className="text-xs bg-muted px-1 rounded">Steps</code> component
          for that.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Four steps</h2>
        <p className="text-sm text-muted-foreground">
          The default layout with four items automatically uses a four-column
          grid.
        </p>
        <NumberedStepsExamples section="four-steps" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Three steps</h2>
        <p className="text-sm text-muted-foreground">
          Three items produce a three-column grid by default.
        </p>
        <NumberedStepsExamples section="three-steps" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom columns</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">columns</code>{' '}
          to override the automatic column count — useful for responsive layouts
          or condensed sidebars.
        </p>
        <NumberedStepsExamples section="custom-columns" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation available via @refraction-ui/astro-numbered-steps -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={numberedStepsProps} />
      </section>
    </div>
  )
}
