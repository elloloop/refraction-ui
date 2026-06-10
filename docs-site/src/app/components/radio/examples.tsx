'use client'

import { useState } from 'react'
import { RadioGroup, RadioItem } from '@refraction-ui/react-radio'

interface RadioExamplesProps {
  section: 'basic' | 'horizontal' | 'controlled' | 'disabled'
}

export function RadioExamples({ section }: RadioExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RadioGroup defaultValue="standard" name="shipping">
          <RadioItem value="standard">Standard — 5-7 business days</RadioItem>
          <RadioItem value="express">Express — 2-3 business days</RadioItem>
          <RadioItem value="overnight">Overnight — next business day</RadioItem>
        </RadioGroup>
      </div>
    )
  }

  if (section === 'horizontal') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RadioGroup defaultValue="md" orientation="horizontal" name="size">
          <RadioItem value="sm">Small</RadioItem>
          <RadioItem value="md">Medium</RadioItem>
          <RadioItem value="lg">Large</RadioItem>
        </RadioGroup>
      </div>
    )
  }

  if (section === 'controlled') {
    return <ControlledExample />
  }

  if (section === 'disabled') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <RadioGroup defaultValue="card" name="payment">
          <RadioItem value="card">Credit card</RadioItem>
          <RadioItem value="paypal">PayPal</RadioItem>
          <RadioItem value="wire" disabled>
            Wire transfer (unavailable)
          </RadioItem>
        </RadioGroup>
      </div>
    )
  }

  return null
}

function ControlledExample() {
  const [value, setValue] = useState('weekly')
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <RadioGroup value={value} onValueChange={setValue} name="frequency">
        <RadioItem value="daily">Daily</RadioItem>
        <RadioItem value="weekly">Weekly</RadioItem>
        <RadioItem value="monthly">Monthly</RadioItem>
      </RadioGroup>
      <p className="text-sm text-muted-foreground">
        Selected: <code className="text-xs bg-muted px-1 rounded">{value}</code>
      </p>
    </div>
  )
}
