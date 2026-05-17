'use client'

import { useState } from 'react'
import { Checkbox } from '@refraction-ui/react-checkbox'
import type { CheckedState } from '@refraction-ui/react-checkbox'

interface CheckboxExamplesProps {
  section: 'states' | 'sizes'
}

export function CheckboxExamples({ section }: CheckboxExamplesProps) {
  const [checked1, setChecked1] = useState<CheckedState>(false)
  const [checked2, setChecked2] = useState<CheckedState>(true)
  const [checked3, setChecked3] = useState<CheckedState>('indeterminate')

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox checked={checked1} onCheckedChange={setChecked1} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Unchecked</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox checked={checked2} onCheckedChange={setChecked2} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Checked</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox checked={checked3} onCheckedChange={setChecked3} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Indeterminate</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox disabled checked={false} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Disabled</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox disabled checked={true} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Disabled Checked</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox size="sm" checked={true} onCheckedChange={() => {}} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox size="default" checked={true} onCheckedChange={() => {}} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Default</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Checkbox size="lg" checked={true} onCheckedChange={() => {}} />
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Large</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
