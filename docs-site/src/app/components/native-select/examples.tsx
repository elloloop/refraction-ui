'use client'

import * as React from 'react'
import { NativeSelect } from '@refraction-ui/react-native-select'

interface NativeSelectExamplesProps {
  section: 'basic' | 'sizes'
}

export function NativeSelectExamples({ section }: NativeSelectExamplesProps) {
  const [status, setStatus] = React.useState('open')

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground w-56">
          Status
          <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </NativeSelect>
        </label>
        <p className="text-sm text-muted-foreground">Selected: {status}</p>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex flex-wrap items-center gap-4">
        {(['sm', 'default', 'lg'] as const).map((size) => (
          <NativeSelect key={size} size={size} aria-label={`Size ${size}`} defaultValue="b" containerClassName="w-40">
            <option value="a">Option A</option>
            <option value="b">{`Size ${size}`}</option>
          </NativeSelect>
        ))}
      </div>
    )
  }

  return null
}
