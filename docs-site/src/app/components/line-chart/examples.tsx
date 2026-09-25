'use client'

import * as React from 'react'
import { LineChart } from '@refraction-ui/react-line-chart'

interface LineChartExamplesProps {
  section: 'single' | 'multi' | 'formatted'
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const revenue = [12, 18, 15, 24, 28, 26, 31, 35, 33, 40, 44, 52]
const visitors = [30, 34, 29, 41, 45, 50, 48, 57, 61, 58, 66, 72]
const signups = [8, 9, 7, 12, 14, 15, 13, 18, 19, 17, 22, 25]

export function LineChartExamples({ section }: LineChartExamplesProps) {
  if (section === 'single') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <LineChart
          ariaLabel="Revenue by month"
          labels={months}
          series={[{ id: 'revenue', name: 'Revenue', data: revenue }]}
        />
      </div>
    )
  }

  if (section === 'multi') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <LineChart
          ariaLabel="Visitors and sign-ups by month (thousands)"
          labels={months}
          series={[
            { id: 'visitors', name: 'Visitors', data: visitors },
            { id: 'signups', name: 'Sign-ups', data: signups },
          ]}
        />
      </div>
    )
  }

  if (section === 'formatted') {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <LineChart
          ariaLabel="Revenue by month in thousands of dollars"
          labels={months}
          height={180}
          series={[{ id: 'revenue', name: 'Revenue', data: revenue }]}
          formatValue={(v) => `$${v.toFixed(1)}k`}
          formatTick={(v) => `$${Math.round(v)}k`}
          showLegend={false}
        />
      </div>
    )
  }

  return null
}
