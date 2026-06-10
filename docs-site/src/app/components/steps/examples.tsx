'use client'

import {
  Steps,
  Step,
  StepIndicator,
  StepContent,
  StepTitle,
  StepDescription,
} from '@refraction-ui/react-steps'

const checkoutSteps = [
  {
    status: 'completed' as const,
    indicator: '✓',
    title: 'Account',
    description: 'Sign in or create an account to get started.',
  },
  {
    status: 'active' as const,
    indicator: '2',
    title: 'Shipping',
    description: 'Where should we deliver your order?',
  },
  {
    status: 'upcoming' as const,
    indicator: '3',
    title: 'Payment',
    description: 'Review your order and pay securely.',
  },
]

interface StepsExamplesProps {
  section: 'vertical' | 'horizontal'
}

export function StepsExamples({ section }: StepsExamplesProps) {
  if (section === 'vertical') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Steps orientation="vertical">
          {checkoutSteps.map((step) => (
            <Step key={step.title} status={step.status}>
              <StepIndicator status={step.status}>{step.indicator}</StepIndicator>
              <StepContent>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </StepContent>
            </Step>
          ))}
        </Steps>
      </div>
    )
  }

  if (section === 'horizontal') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Steps orientation="horizontal" className="gap-8">
          {checkoutSteps.map((step) => (
            <Step key={step.title} status={step.status} className="flex-col items-center text-center">
              <StepIndicator status={step.status}>{step.indicator}</StepIndicator>
              <StepContent className="pb-0">
                <StepTitle>{step.title}</StepTitle>
              </StepContent>
            </Step>
          ))}
        </Steps>
      </div>
    )
  }

  return null
}
