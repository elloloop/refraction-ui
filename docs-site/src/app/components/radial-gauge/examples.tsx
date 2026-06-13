'use client'

import * as React from 'react'
import { RadialGauge } from '@refraction-ui/react-radial-gauge'

interface RadialGaugeExamplesProps {
  section: 'basic' | 'zones' | 'sizes'
}

export function RadialGaugeExamples({ section }: RadialGaugeExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex flex-wrap gap-8 items-center">
        <RadialGauge value={0} aria-label="0%" />
        <RadialGauge value={42} aria-label="42%" />
        <RadialGauge value={75} sublabel="Score" aria-label="75 out of 100" />
        <RadialGauge value={100} aria-label="Complete" />
      </div>
    )
  }

  if (section === 'zones') {
    return <ZonesExample />
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex flex-wrap gap-8 items-end">
        <RadialGauge value={68} size="sm" sublabel="sm" aria-label="68% small" />
        <RadialGauge value={68} size="md" sublabel="md" aria-label="68% medium" />
        <RadialGauge value={68} size="lg" sublabel="lg" aria-label="68% large" />
      </div>
    )
  }

  return null
}

function ZonesExample() {
  const [value, setValue] = React.useState(45)

  const zones = [
    { upTo: 33, tone: 'danger' as const },
    { upTo: 66, tone: 'warning' as const },
    { upTo: 100, tone: 'success' as const },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-6">
      <div className="flex flex-wrap gap-8 items-center">
        <RadialGauge
          value={20}
          zones={zones}
          sublabel="Danger"
          aria-label="20% — danger zone"
        />
        <RadialGauge
          value={50}
          zones={zones}
          sublabel="Warning"
          aria-label="50% — warning zone"
        />
        <RadialGauge
          value={85}
          zones={zones}
          sublabel="Success"
          aria-label="85% — success zone"
        />
        <RadialGauge
          value={value}
          zones={zones}
          label="Live"
          sublabel={`${value}%`}
          showValue={false}
          aria-label={`${value}% live`}
        />
      </div>
      <div className="flex items-center gap-4">
        <label htmlFor="gauge-range" className="text-sm text-muted-foreground whitespace-nowrap">
          Adjust value
        </label>
        <input
          id="gauge-range"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm tabular-nums text-foreground">{value}</span>
      </div>
    </div>
  )
}
