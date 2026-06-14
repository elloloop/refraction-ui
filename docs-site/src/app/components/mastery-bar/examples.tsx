'use client'

import * as React from 'react'
import { MasteryBar } from '@refraction-ui/react-mastery-bar'

interface MasteryBarExamplesProps {
  section: 'basic' | 'labeled' | 'sizes'
}

export function MasteryBarExamples({ section }: MasteryBarExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-4">
        <MasteryBar value={0} aria-label="Beginner" />
        <MasteryBar value={40} aria-label="Intermediate" />
        <MasteryBar value={75} aria-label="Advanced" />
        <MasteryBar value={100} aria-label="Mastered" />
      </div>
    )
  }

  if (section === 'labeled') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-4">
        <MasteryBar value={30} leadingLabel="React" label="30%" />
        <MasteryBar value={65} leadingLabel="TypeScript" label="65%" />
        <MasteryBar value={90} leadingLabel="CSS" label="90%" />
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">sm</p>
          <MasteryBar value={60} size="sm" aria-label="Small" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">md (default)</p>
          <MasteryBar value={60} size="md" aria-label="Medium" />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">lg</p>
          <MasteryBar value={60} size="lg" aria-label="Large" />
        </div>
      </div>
    )
  }

  return null
}
