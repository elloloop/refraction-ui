'use client'

import * as React from 'react'
import { SectionHead } from '@refraction-ui/react-section-head'

interface SectionHeadExamplesProps {
  section: 'centered' | 'left' | 'with-lede'
}

export function SectionHeadExamples({ section }: SectionHeadExamplesProps) {
  if (section === 'centered') {
    return (
      <div className="rounded-xl border border-border bg-card p-12">
        <SectionHead
          kicker="Why refraction"
          title="Build beautiful UIs faster"
          align="center"
        />
      </div>
    )
  }

  if (section === 'left') {
    return (
      <div className="rounded-xl border border-border bg-card p-12">
        <SectionHead
          kicker="Features"
          title="Everything you need"
          align="left"
        />
      </div>
    )
  }

  if (section === 'with-lede') {
    return (
      <div className="rounded-xl border border-border bg-card p-12">
        <SectionHead
          kicker="Open source"
          title="Designed for teams"
          lede="A comprehensive component library that grows with your product. Accessible, themeable, and framework-agnostic by design."
          align="center"
        />
      </div>
    )
  }

  return null
}
