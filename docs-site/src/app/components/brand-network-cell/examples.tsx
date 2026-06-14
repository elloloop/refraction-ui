'use client'

import * as React from 'react'
import { BrandNetworkCell } from '@refraction-ui/react-brand-network-cell'

interface BrandNetworkCellExamplesProps {
  section: 'current' | 'neighbour' | 'pair'
}

export function BrandNetworkCellExamples({ section }: BrandNetworkCellExamplesProps) {
  if (section === 'current') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <BrandNetworkCell
            glyph="G"
            glyphBg="#6366f1"
            glyphColor="#ffffff"
            domain="glassa.ai"
            body="The AI-powered glass design studio for modern teams."
            href="https://glassa.ai"
            current
          />
        </div>
      </div>
    )
  }

  if (section === 'neighbour') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <BrandNetworkCell
            glyph="R"
            glyphBg="#f59e0b"
            glyphColor="#ffffff"
            domain="refraction.dev"
            body="Open-source UI components for the modern web."
            href="https://refraction.dev"
            linkLabel="Explore →"
          />
        </div>
      </div>
    )
  }

  if (section === 'pair') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <BrandNetworkCell
            glyph="G"
            glyphBg="#6366f1"
            glyphColor="#ffffff"
            domain="glassa.ai"
            body="The AI-powered glass design studio for modern teams."
            href="https://glassa.ai"
            current
          />
          <BrandNetworkCell
            glyph="R"
            glyphBg="#f59e0b"
            glyphColor="#ffffff"
            domain="refraction.dev"
            body="Open-source UI components for the modern web."
            href="https://refraction.dev"
            linkLabel="Explore →"
          />
        </div>
      </div>
    )
  }

  return null
}
