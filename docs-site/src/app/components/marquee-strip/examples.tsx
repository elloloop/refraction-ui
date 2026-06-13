'use client'

import * as React from 'react'
import { MarqueeStrip } from '@refraction-ui/react-marquee-strip'

interface MarqueeStripExamplesProps {
  section: 'static' | 'scrolling' | 'concept-tags'
}

export function MarqueeStripExamples({ section }: MarqueeStripExamplesProps) {
  if (section === 'static') {
    return (
      <div className="rounded-xl border border-border bg-card py-8">
        <MarqueeStrip
          label="Built with"
          items={['React', 'TypeScript', 'Tailwind CSS', 'Turborepo', 'pnpm']}
        />
      </div>
    )
  }

  if (section === 'scrolling') {
    return (
      <div className="rounded-xl border border-border bg-card py-8">
        <MarqueeStrip
          scroll
          items={[
            'React',
            'TypeScript',
            'Tailwind CSS',
            'Turborepo',
            'pnpm',
            'Vitest',
            'Playwright',
            'Storybook',
          ]}
        />
      </div>
    )
  }

  if (section === 'concept-tags') {
    return (
      <div className="rounded-xl border border-border bg-card py-8">
        <MarqueeStrip
          label="Concepts"
          items={[
            'Design Systems',
            'Headless Architecture',
            'Accessibility First',
            'Framework Agnostic',
            'Zero Lock-in',
            'Tree Shakeable',
            'SSR Ready',
            'Type Safe',
            'Composable',
            'Themeable',
          ]}
        />
      </div>
    )
  }

  return null
}
