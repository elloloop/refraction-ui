'use client'

import * as React from 'react'
import { NumberedSteps } from '@refraction-ui/react-numbered-steps'

interface NumberedStepsExamplesProps {
  section: 'four-steps' | 'three-steps' | 'custom-columns'
}

const FOUR_STEPS = [
  {
    title: 'Create an account',
    body: 'Sign up with your email address to get started in seconds.',
  },
  {
    title: 'Configure settings',
    body: 'Choose your preferences and connect the tools you already use.',
  },
  {
    title: 'Invite your team',
    body: 'Add teammates to your workspace and assign roles.',
  },
  {
    title: 'Start building',
    body: 'Use our API and components to ship your first feature.',
  },
]

const THREE_STEPS = [
  {
    title: 'Install the package',
    body: 'Add @refraction-ui/react to your project with your package manager.',
  },
  {
    title: 'Import components',
    body: 'Import the components you need directly from the package.',
  },
  {
    title: 'Ship it',
    body: 'Build accessible, themeable UIs with zero configuration.',
  },
]

export function NumberedStepsExamples({ section }: NumberedStepsExamplesProps) {
  if (section === 'four-steps') {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8">
        <NumberedSteps items={FOUR_STEPS} />
      </div>
    )
  }

  if (section === 'three-steps') {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8">
        <NumberedSteps items={THREE_STEPS} />
      </div>
    )
  }

  if (section === 'custom-columns') {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8">
        <NumberedSteps items={THREE_STEPS} columns={2} />
      </div>
    )
  }

  return null
}
