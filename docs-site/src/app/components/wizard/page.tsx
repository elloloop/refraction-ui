import { WizardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const wizardProps = [
  {
    name: 'steps',
    type: 'WizardStep[]',
    description:
      'Step definitions for the rail. Each step has `id`, `label`, and an optional `optional` flag.',
  },
  {
    name: 'step',
    type: 'number',
    description: 'Controlled current step index (0-based).',
  },
  {
    name: 'defaultStep',
    type: 'number',
    default: '0',
    description: 'Initial step index for uncontrolled usage.',
  },
  {
    name: 'onStepChange',
    type: '(index: number) => void',
    description: 'Called when the current step changes via Back or Next.',
  },
  {
    name: 'onComplete',
    type: '() => void',
    description: 'Called when the user activates the action on the final step.',
  },
  {
    name: 'orientation',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Orientation of the step rail.',
  },
  {
    name: 'nextLabel',
    type: 'React.ReactNode',
    default: "'Next'",
    description: 'Label for the Next button.',
  },
  {
    name: 'backLabel',
    type: 'React.ReactNode',
    default: "'Back'",
    description: 'Label for the Back button.',
  },
  {
    name: 'completeLabel',
    type: 'React.ReactNode',
    default: "'Complete'",
    description: 'Label for the primary action on the final step.',
  },
  {
    name: 'skipLabel',
    type: 'React.ReactNode',
    default: "'Skip'",
    description: 'Label for the Skip button, shown only on optional steps.',
  },
  {
    name: 'children',
    type: 'React.ReactNode | ((currentIndex: number) => React.ReactNode)',
    description:
      'Step content. Pass a render prop `(index) => …` to render different content per step.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the root element.',
  },
]

const usageCode = `import { Wizard } from '@refraction-ui/react'
import type { WizardStep } from '@refraction-ui/react'

const steps: WizardStep[] = [
  { id: 'goal',         label: 'Goal' },
  { id: 'region',       label: 'Region' },
  { id: 'expectations', label: 'Expectations' },
  { id: 'placement',    label: 'Placement', optional: true },
  { id: 'account',      label: 'Account' },
]

export function OnboardingWizard() {
  const [step, setStep] = React.useState(0)

  return (
    <Wizard
      steps={steps}
      step={step}
      onStepChange={setStep}
      onComplete={() => console.log('done!')}
    >
      {(index) => <StepContent stepIndex={index} />}
    </Wizard>
  )
}`

export default function WizardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Wizard</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A multi-step flow orchestration component with a visual step rail,
          controlled navigation, and optional-step skip support — designed for
          onboarding flows, setup screens, and multi-page forms.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic vertical</h2>
        <p className="text-sm text-muted-foreground">
          Default orientation with a vertical step rail on the left. Use
          Back and Next to move between steps; optional steps show a Skip
          button.
        </p>
        <WizardExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Horizontal</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">orientation="horizontal"</code>{' '}
          to render the step rail across the top with the content below.
        </p>
        <WizardExamples section="horizontal" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">step</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">onStepChange</code> to
          manage the current step externally, and{' '}
          <code className="text-xs bg-muted px-1 rounded">onComplete</code> to
          react to the final action.
        </p>
        <WizardExamples section="controlled" />
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
        <PropsTable props={wizardProps} />
      </section>
    </div>
  )
}
