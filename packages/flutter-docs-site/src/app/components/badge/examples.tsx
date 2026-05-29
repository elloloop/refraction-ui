'use client'

import { Badge } from '@refraction-ui/react-badge'

interface BadgeExamplesProps {
  section: 'variants' | 'sizes'
}

export function BadgeExamples({ section }: BadgeExamplesProps) {
  if (section === 'variants') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="default">Default</Badge>
            <span className="text-xs text-muted-foreground font-medium">default</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="primary">Primary</Badge>
            <span className="text-xs text-muted-foreground font-medium">primary</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="secondary">Secondary</Badge>
            <span className="text-xs text-muted-foreground font-medium">secondary</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="destructive">Destructive</Badge>
            <span className="text-xs text-muted-foreground font-medium">destructive</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="outline">Outline</Badge>
            <span className="text-xs text-muted-foreground font-medium">outline</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="success">Success</Badge>
            <span className="text-xs text-muted-foreground font-medium">success</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge variant="warning">Warning</Badge>
            <span className="text-xs text-muted-foreground font-medium">warning</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex flex-col items-center gap-2.5">
            <Badge size="sm" variant="primary">Small</Badge>
            <span className="text-xs text-muted-foreground font-medium">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Badge size="md" variant="primary">Medium</Badge>
            <span className="text-xs text-muted-foreground font-medium">md (default)</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
