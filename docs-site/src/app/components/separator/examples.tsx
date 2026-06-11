'use client'

import { Separator } from '@refraction-ui/react-separator'

interface SeparatorExamplesProps {
  section: 'basic' | 'labeled' | 'vertical'
}

export function SeparatorExamples({ section }: SeparatorExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4">
          <p className="text-sm text-foreground">Content above the divider.</p>
          <Separator />
          <p className="text-sm text-foreground">Content below the divider.</p>
        </div>
      </div>
    )
  }

  if (section === 'labeled') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-6">
          <Separator label="or" />
          <Separator label="Continue with" />
        </div>
      </div>
    )
  }

  if (section === 'vertical') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex h-8 items-center gap-4">
          <span className="text-sm text-foreground">Home</span>
          <Separator orientation="vertical" />
          <span className="text-sm text-foreground">Docs</span>
          <Separator orientation="vertical" />
          <span className="text-sm text-foreground">Settings</span>
        </div>
      </div>
    )
  }

  return null
}
