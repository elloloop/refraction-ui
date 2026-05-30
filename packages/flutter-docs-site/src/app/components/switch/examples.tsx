'use client'

import { useState } from 'react'
import { Switch } from '@refraction-ui/react-switch'

interface SwitchExamplesProps {
  section: 'sizes' | 'states'
}

export function SwitchExamples({ section }: SwitchExamplesProps) {
  const [checked1, setChecked1] = useState(false)
  const [checked2, setChecked2] = useState(true)
  const [checked3, setChecked3] = useState(false)

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <Switch size="sm" checked={checked1} onCheckedChange={setChecked1} />
            <span className="text-xs text-muted-foreground font-medium">Small</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Switch size="default" checked={checked2} onCheckedChange={setChecked2} />
            <span className="text-xs text-muted-foreground font-medium">Default</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Switch size="lg" checked={checked3} onCheckedChange={setChecked3} />
            <span className="text-xs text-muted-foreground font-medium">Large</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <Switch checked={false} onCheckedChange={() => {}} />
            <span className="text-xs text-muted-foreground font-medium">Off</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Switch checked={true} onCheckedChange={() => {}} />
            <span className="text-xs text-muted-foreground font-medium">On</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Switch disabled checked={false} />
            <span className="text-xs text-muted-foreground font-medium">Disabled Off</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Switch disabled checked={true} />
            <span className="text-xs text-muted-foreground font-medium">Disabled On</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
