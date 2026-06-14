'use client'

import * as React from 'react'
import { PricingCard } from '@refraction-ui/react-pricing-card'

interface PricingCardExamplesProps {
  section: 'basic' | 'featured' | 'payperuse'
}

export function PricingCardExamples({ section }: PricingCardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <PricingCard
            name="Starter"
            price="Free"
            description="Perfect for side projects and personal use."
            features={['5 projects', 'Community support', '1 GB storage']}
            cta="Get started"
            ctaVariant="outline"
            ctaHref="/signup"
          />
        </div>
      </div>
    )
  }

  if (section === 'featured') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <PricingCard
            badge="Most popular"
            name="Pro"
            price="$29"
            period="/ month"
            description="Everything you need to grow your team."
            features={[
              'Unlimited projects',
              'Priority support',
              '100 GB storage',
              'Custom domains',
            ]}
            cta="Start free trial"
            featured
            ctaHref="/signup?plan=pro"
          />
        </div>
      </div>
    )
  }

  if (section === 'payperuse') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <PricingCard
            name="Pay-per-use"
            price="$0.001"
            period="/ request"
            description="Scale as you go — no upfront commitment."
            features={['No seat limits', 'Usage-based billing', 'SLA available']}
            cta="Contact sales"
            ctaVariant="outline"
            ctaHref="/contact"
          />
        </div>
      </div>
    )
  }

  return null
}
