'use client'

import * as React from 'react'
import { AudienceFeatureCard } from '@refraction-ui/react-audience-feature-card'

interface AudienceFeatureCardExamplesProps {
  section: 'basic' | 'footer' | 'row'
}

export function AudienceFeatureCardExamples({
  section,
}: AudienceFeatureCardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <AudienceFeatureCard
          kicker="For individuals"
          title="Ship ideas faster"
          body="Everything you need to go from concept to production — in a single, cohesive toolkit."
        />
      </div>
    )
  }

  if (section === 'footer') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <AudienceFeatureCard
          kicker="For startups"
          title="Scale without limits"
          body="Built-in auth, analytics, and theming so your team can focus on the product, not the plumbing."
          footer={
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Free during beta
            </span>
          }
        />
      </div>
    )
  }

  if (section === 'row') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AudienceFeatureCard
          kicker="Individuals"
          title="Move fast"
          body="Prototype, iterate, and ship with a toolkit designed for solo builders."
          footer={<span className="text-muted-foreground">Free forever</span>}
        />
        <AudienceFeatureCard
          kicker="Teams"
          title="Collaborate"
          body="Share components and design tokens across your whole engineering org."
          footer={
            <a href="#" className="text-primary underline underline-offset-4">
              See team plans →
            </a>
          }
        />
        <AudienceFeatureCard
          kicker="Enterprise"
          title="Scale with confidence"
          body="SSO, audit logs, SLAs, and dedicated support for mission-critical apps."
          footer={
            <a href="#" className="text-primary underline underline-offset-4">
              Contact sales →
            </a>
          }
        />
      </div>
    )
  }

  return null
}
