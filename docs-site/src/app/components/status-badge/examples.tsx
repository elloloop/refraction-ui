'use client'

import * as React from 'react'
import { StatusBadge, type StatusBadgeVariant } from '@refraction-ui/react-status-badge'
import { LIVE_DOT_COLORS } from '@refraction-ui/react-live-dot'

export type StatusBadgeExampleSection =
  | 'basic'
  | 'dot-colors'
  | 'pulsing'
  | 'icons'
  | 'variants'
  | 'setup-screen'

interface StatusBadgeExamplesProps {
  section: StatusBadgeExampleSection
}

const frame = 'rounded-xl border border-border bg-card p-8'

const VARIANTS: StatusBadgeVariant[] = [
  'outline',
  'secondary',
  'default',
  'success',
  'warning',
  'destructive',
]

/** Simulated check time for the pulsing demo. */
const CHECK_DURATION_MS = 1500

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

export function StatusBadgeExamples({ section }: StatusBadgeExamplesProps) {
  if (section === 'basic') {
    return (
      <div className={`${frame} flex flex-wrap items-center gap-3`}>
        <StatusBadge label="Allowed" dotColor="success" />
        <StatusBadge label="Off" dotColor="muted" />
        <StatusBadge label="Checking…" pulsing />
        <StatusBadge label="Blocked" variant="destructive" icon={<CrossIcon />} />
      </div>
    )
  }

  if (section === 'dot-colors') {
    return (
      <div className={`${frame} flex flex-wrap gap-3`}>
        {LIVE_DOT_COLORS.map((color) => (
          <StatusBadge key={color} label={color} dotColor={color} />
        ))}
      </div>
    )
  }

  if (section === 'pulsing') return <PulsingExample />

  if (section === 'icons') {
    return (
      <div className={`${frame} flex flex-wrap items-center gap-3`}>
        <StatusBadge label="Allowed" variant="success" icon={<CheckIcon />} />
        <StatusBadge label="Denied" variant="destructive" icon={<CrossIcon />} />
        <StatusBadge label="Verified" variant="secondary" icon={<CheckIcon />} />
      </div>
    )
  }

  if (section === 'variants') {
    return (
      <div className={`${frame} flex flex-wrap items-center gap-3`}>
        {VARIANTS.map((variant) => (
          <StatusBadge key={variant} label={variant} variant={variant} />
        ))}
      </div>
    )
  }

  if (section === 'setup-screen') {
    return (
      <ul className={`${frame} flex flex-col divide-y divide-border p-0`}>
        <PermissionRow name="Camera" badge={<StatusBadge label="Allowed" dotColor="success" />} />
        <PermissionRow name="Microphone" badge={<StatusBadge label="Checking…" pulsing />} />
        <PermissionRow name="Notifications" badge={<StatusBadge label="Off" dotColor="muted" />} />
        <PermissionRow
          name="Screen recording"
          badge={<StatusBadge label="Blocked" variant="destructive" icon={<CrossIcon />} />}
        />
      </ul>
    )
  }

  return null
}

function PermissionRow({ name, badge }: { name: string; badge: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-4 px-6 py-4 text-sm text-foreground">
      <span>{name}</span>
      {badge}
    </li>
  )
}

/** A permission check that resolves after a moment; re-run it with the button. */
function PulsingExample() {
  const [checking, setChecking] = React.useState(false)

  React.useEffect(() => {
    if (!checking) return
    const timer = window.setTimeout(() => setChecking(false), CHECK_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [checking])

  return (
    <div className={`${frame} flex flex-wrap items-center gap-6`}>
      <span className="inline-flex items-center gap-3 text-sm text-foreground">
        Microphone
        <StatusBadge
          role="status"
          label={checking ? 'Checking…' : 'Allowed'}
          variant={checking ? 'outline' : 'success'}
          icon={<CheckIcon />}
          pulsing={checking}
        />
      </span>
      <button
        type="button"
        onClick={() => setChecking(true)}
        className="inline-flex min-h-11 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Check again
      </button>
    </div>
  )
}
