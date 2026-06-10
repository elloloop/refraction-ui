'use client'

import {
  Callout,
  CalloutIcon,
  CalloutContent,
  CalloutTitle,
  CalloutDescription,
} from '@refraction-ui/react-callout'

interface CalloutExamplesProps {
  section: 'variants' | 'composition'
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export function CalloutExamples({ section }: CalloutExamplesProps) {
  if (section === 'variants') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-4">
          <Callout variant="default" className="rounded-lg border border-border p-4">
            A neutral note to draw attention to supporting information.
          </Callout>
          <Callout variant="info" className="rounded-lg border border-border p-4">
            Heads up — this feature is in beta and behavior may change.
          </Callout>
          <Callout variant="success" className="rounded-lg border border-border p-4">
            Your changes were saved successfully.
          </Callout>
          <Callout variant="warning" className="rounded-lg border border-border p-4">
            This action will overwrite your existing configuration.
          </Callout>
          <Callout variant="destructive" className="rounded-lg border border-border p-4">
            Deleting this project is permanent and cannot be undone.
          </Callout>
        </div>
      </div>
    )
  }

  // composition — icon + title + description sub-components
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Callout variant="info" className="flex gap-3 rounded-lg border border-border p-4">
        <CalloutIcon>
          <InfoIcon />
        </CalloutIcon>
        <CalloutContent>
          <CalloutTitle>Scheduled maintenance</CalloutTitle>
          <CalloutDescription>
            The dashboard will be unavailable on Sunday from 02:00 to 04:00 UTC while we
            upgrade our infrastructure.
          </CalloutDescription>
        </CalloutContent>
      </Callout>
    </div>
  )
}
