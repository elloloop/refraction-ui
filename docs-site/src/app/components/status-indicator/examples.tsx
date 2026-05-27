'use client'
import { StatusIndicator } from '@refraction-ui/react-status-indicator'

interface StatusIndicatorExamplesProps {
  section: 'basic' | 'children' | 'show-label'
}

export function StatusIndicatorExamples({ section }: StatusIndicatorExamplesProps) {
  if (section === 'basic') {
    // Prop is `type`, not `status`. Six values: success | error | warning |
    // info | pending | neutral. `pulse` defaults on for `pending`.
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <StatusIndicator type="success" label="Operational" pulse />
          <StatusIndicator type="warning" label="Degraded" pulse />
          <StatusIndicator type="error" label="Outage" pulse />
          <StatusIndicator type="info" label="Maintenance" />
          <StatusIndicator type="pending" label="Reconnecting" />
          <StatusIndicator type="neutral" label="Unknown" />
        </div>
      </div>
    )
  }

  // Children-as-label fallback (issue #200). When `label` is omitted, children
  // become the visible label and — if string — the aria-label too. Matches the
  // composition pattern of Card / Dialog / Callout / Badge.
  if (section === 'children') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-3">
          <StatusIndicator type="success">Microphone · Built-in · ready</StatusIndicator>
          <StatusIndicator type="error">API pipeline · Missing keys</StatusIndicator>
          <StatusIndicator type="warning">
            <strong>Network</strong> · degraded throughput
          </StatusIndicator>
          <StatusIndicator type="pending">Reconnecting to host…</StatusIndicator>
        </div>
      </div>
    )
  }

  if (section === 'show-label') {
    // showLabel=false keeps the aria-label so screen readers still announce
    // status, but renders only the colored dot — handy in dense tables.
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-4">
          <StatusIndicator type="success" label="Service A healthy" showLabel={false} />
          <StatusIndicator type="warning" label="Service B degraded" showLabel={false} />
          <StatusIndicator type="error" label="Service C offline" showLabel={false} />
          <StatusIndicator type="pending" label="Service D reconnecting" showLabel={false} />
          <span className="text-xs text-muted-foreground">
            Dot only — screen reader still announces each status
          </span>
        </div>
      </div>
    )
  }

  return null
}
