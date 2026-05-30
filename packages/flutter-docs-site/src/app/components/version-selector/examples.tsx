'use client'

import { useState } from 'react'
import { VersionSelector } from '@refraction-ui/react-version-selector'

interface VersionSelectorExamplesProps { section: 'basic' }

export function VersionSelectorExamples({ section }: VersionSelectorExamplesProps) {
  const [version, setVersion] = useState('3.0.0')
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-medium">With Latest Badge</span>
          <VersionSelector
            value={version}
            onValueChange={setVersion}
            versions={[
              { value: '3.0.0', label: 'v3.0.0', isLatest: true },
              { value: '2.5.0', label: 'v2.5.0' },
              { value: '2.0.0', label: 'v2.0.0' },
              { value: '1.0.0', label: 'v1.0.0' },
            ]}
          />
        </div>
      </div>
    )
  }
  return null
}
