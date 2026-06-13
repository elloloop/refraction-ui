'use client'

import * as React from 'react'
import { RatingScale } from '@refraction-ui/react-rating-scale'

interface RatingScaleExamplesProps {
  section: 'basic' | 'labeled' | 'controlled'
}

export function RatingScaleExamples({ section }: RatingScaleExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RatingScale count={5} aria-label="Rate 1 to 5" defaultValue={3} />
      </div>
    )
  }

  if (section === 'labeled') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RatingScale
          count={5}
          defaultValue={2}
          minLabel="Never seen this"
          maxLabel="Could write it from memory"
          aria-label="Confidence"
        />
      </div>
    )
  }

  if (section === 'controlled') {
    return <ControlledExample />
  }

  return null
}

function ControlledExample() {
  const [value, setValue] = React.useState<number>(4)
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <RatingScale
        value={value}
        onValueChange={setValue}
        points={[
          { value: 1, label: 'Strongly disagree' },
          { value: 2, label: 'Disagree' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Agree' },
          { value: 5, label: 'Strongly agree' },
        ]}
        aria-label="Agreement"
      />
      <p className="text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  )
}
