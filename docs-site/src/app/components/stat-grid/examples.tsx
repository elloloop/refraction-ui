'use client'

import * as React from 'react'
import { StatGrid } from '@refraction-ui/react-stat-grid'

interface StatGridExamplesProps {
  section: 'three-stats' | 'two-stats' | 'custom-columns'
}

export function StatGridExamples({ section }: StatGridExamplesProps) {
  if (section === 'three-stats') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <StatGrid
          items={[
            { value: '10k+', label: 'Active users worldwide' },
            { value: '$4.2M', label: 'Revenue generated for customers' },
            { value: '99.9%', label: 'Uptime SLA across all regions' },
          ]}
        />
      </div>
    )
  }

  if (section === 'two-stats') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <StatGrid
          items={[
            { value: '50+', label: 'Integrations available' },
            { value: '24/7', label: 'Customer support coverage' },
          ]}
        />
      </div>
    )
  }

  if (section === 'custom-columns') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <StatGrid
          columns={2}
          items={[
            { value: '1B+', label: 'API requests per month' },
            { value: '<50ms', label: 'Median response time' },
            { value: '150+', label: 'Countries served' },
            { value: '99.99%', label: 'Error-free requests' },
          ]}
        />
      </div>
    )
  }

  return null
}
