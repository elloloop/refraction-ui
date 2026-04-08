'use client'
import { StatusIndicator } from '@refraction-ui/react-status-indicator'
interface StatusIndicatorExamplesProps { section: 'basic' }
export function StatusIndicatorExamples({ section }: StatusIndicatorExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <StatusIndicator status="success" label="Operational" pulse />
          <StatusIndicator status="warning" label="Degraded" pulse />
          <StatusIndicator status="error" label="Outage" pulse />
          <StatusIndicator status="info" label="Maintenance" />
          <StatusIndicator status="neutral" label="Unknown" />
        </div>
      </div>
    )
  }
  return null
}
