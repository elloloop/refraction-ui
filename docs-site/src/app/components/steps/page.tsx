import { StepsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const stepsProps = [
  {
    name: 'orientation',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Layout direction of the step list.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the container.',
  },
]

const stepProps = [
  {
    name: 'status',
    type: "'completed' | 'active' | 'upcoming'",
    default: "'upcoming'",
    description:
      'Drives the styling of the step and its indicator (completed fills the indicator, active outlines it, upcoming is muted).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import {
  Steps,
  Step,
  StepIndicator,
  StepContent,
  StepTitle,
  StepDescription,
} from '@refraction-ui/react'

export function Checkout() {
  return (
    <Steps orientation="vertical">
      <Step status="completed">
        <StepIndicator status="completed">✓</StepIndicator>
        <StepContent>
          <StepTitle>Account</StepTitle>
          <StepDescription>Sign in to get started.</StepDescription>
        </StepContent>
      </Step>
      <Step status="active">
        <StepIndicator status="active">2</StepIndicator>
        <StepContent>
          <StepTitle>Shipping</StepTitle>
          <StepDescription>Where should we deliver?</StepDescription>
        </StepContent>
      </Step>
      <Step status="upcoming">
        <StepIndicator status="upcoming">3</StepIndicator>
        <StepContent>
          <StepTitle>Payment</StepTitle>
        </StepContent>
      </Step>
    </Steps>
  )
}`

export default function StepsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Steps</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A composable step indicator for multi-stage flows like checkout, onboarding, or wizards.
          Built from <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Step</code>,{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">StepIndicator</code>, and content parts.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Vertical</h2>
        <p className="text-sm text-muted-foreground">
          The default orientation. Each step carries a <code className="text-xs bg-muted px-1 rounded">status</code>{' '}
          that styles its indicator.
        </p>
        <StepsExamples section="vertical" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-steps" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Horizontal</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">orientation=&quot;horizontal&quot;</code> to lay steps out in a row.
        </p>
        <StepsExamples section="horizontal" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Steps props</h2>
        <PropsTable props={stepsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Step props</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">Step</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">StepIndicator</code> share the same{' '}
          <code className="text-xs bg-muted px-1 rounded">status</code> prop.{' '}
          <code className="text-xs bg-muted px-1 rounded">StepContent</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">StepTitle</code>, and{' '}
          <code className="text-xs bg-muted px-1 rounded">StepDescription</code> accept standard HTML attributes.
        </p>
        <PropsTable props={stepProps} />
      </section>
    </div>
  )
}
