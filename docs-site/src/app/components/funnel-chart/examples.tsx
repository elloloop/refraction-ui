'use client'

import * as React from 'react'
import { FunnelChart } from '@refraction-ui/react-funnel-chart'

interface FunnelChartExamplesProps {
  section: 'basic' | 'custom-copy'
}

const steps = [
  { id: 'visit', label: 'Visitors', description: 'Landed on the site', value: 12400 },
  { id: 'signup', label: 'Sign-ups', description: 'Created an account', value: 3100 },
  { id: 'trial', label: 'Trials', description: 'Started a free trial', value: 1180 },
  { id: 'buy', label: 'Purchases', value: 420 },
]

export function FunnelChartExamples({ section }: FunnelChartExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <FunnelChart aria-label="Checkout funnel" steps={steps} />
      </div>
    )
  }

  if (section === 'custom-copy') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <FunnelChart
          aria-label="Checkout funnel"
          steps={steps}
          formatPercent={(p) => `${Math.round(p)}%`}
          shareLabel={(s) => `${s} of visitors`}
          conversionLabel={(p) => `${p} moved on`}
          droppedLabel={(n) => `${n} left`}
        />
      </div>
    )
  }

  return null
}
