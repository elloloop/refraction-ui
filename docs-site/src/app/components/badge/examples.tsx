'use client'

import { Badge } from '@refraction-ui/react-badge'

interface BadgeExamplesProps {
  section: 'variants' | 'sizes'
}

export function BadgeExamples({ section }: BadgeExamplesProps) {
  if (section === 'variants') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm" variant="primary">Small</Badge>
          <Badge size="md" variant="primary">Medium (default)</Badge>
        </div>
      </div>
    )
  }

  return null
}
