'use client'

import { useCookieConsent, CookieConsent } from '@refraction-ui/react-cookie-consent'

interface CookieConsentExamplesProps {
  section: 'basic'
}

export function CookieConsentExamples({ section }: CookieConsentExamplesProps) {
  const consent = useCookieConsent({ version: 'docs-demo' })
  if (section !== 'basic') return null
  return (
    <div className="relative min-h-[220px] rounded-xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        The consent banner renders fixed to the bottom of the viewport. Accept all / Reject all / Manage preferences
        dismiss it and persist the choice to localStorage.
      </p>
      <button
        type="button"
        className="mt-3 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        onClick={() => consent.reset()}
      >
        Reset &amp; show banner
      </button>
      <CookieConsent consent={consent} policyUrl="#" />
    </div>
  )
}
