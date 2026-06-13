'use client'

import * as React from 'react'
import { Wizard } from '@refraction-ui/react-wizard'
import type { WizardStep } from '@refraction-ui/react-wizard'

interface WizardExamplesProps {
  section: 'basic' | 'horizontal' | 'controlled'
}

const onboardingSteps: WizardStep[] = [
  { id: 'goal', label: 'Goal' },
  { id: 'region', label: 'Region' },
  { id: 'expectations', label: 'Expectations' },
  { id: 'placement', label: 'Placement', optional: true },
  { id: 'account', label: 'Account' },
]

export function WizardExamples({ section }: WizardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Wizard steps={onboardingSteps} defaultStep={1}>
          {(index) => (
            <div className="rounded-lg border border-border bg-background p-6">
              <h3 className="text-base font-semibold text-foreground">
                {onboardingSteps[index]?.label ?? 'Step'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Content for step {index + 1} goes here.
              </p>
            </div>
          )}
        </Wizard>
      </div>
    )
  }

  if (section === 'horizontal') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Wizard
          steps={onboardingSteps.slice(0, 3)}
          defaultStep={0}
          orientation="horizontal"
        >
          {(index) => (
            <div className="rounded-lg border border-border bg-background p-6">
              <h3 className="text-base font-semibold text-foreground">
                {onboardingSteps[index]?.label ?? 'Step'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Horizontal layout — rail runs across the top.
              </p>
            </div>
          )}
        </Wizard>
      </div>
    )
  }

  if (section === 'controlled') {
    return <ControlledExample />
  }

  return null
}

function ControlledExample() {
  const [step, setStep] = React.useState(0)
  const [done, setDone] = React.useState(false)

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-4">
        <p className="text-sm font-medium text-foreground">Flow complete!</p>
        <button
          type="button"
          className="text-sm text-primary underline underline-offset-2"
          onClick={() => { setStep(0); setDone(false) }}
        >
          Reset
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <Wizard
        steps={onboardingSteps}
        step={step}
        onStepChange={setStep}
        onComplete={() => setDone(true)}
        nextLabel="Continue"
        backLabel="Go Back"
        completeLabel="Finish"
      >
        {(index) => (
          <div className="rounded-lg border border-border bg-background p-6">
            <h3 className="text-base font-semibold text-foreground">
              {onboardingSteps[index]?.label}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Controlled mode — step {index + 1} of {onboardingSteps.length}.
            </p>
          </div>
        )}
      </Wizard>
    </div>
  )
}
