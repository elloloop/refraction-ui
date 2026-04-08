'use client'

import { Input } from '@refraction-ui/react-input'

interface InputExamplesProps {
  section: 'sizes' | 'types' | 'states'
}

export function InputExamples({ section }: InputExamplesProps) {
  if (section === 'sizes') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Small</label>
            <Input size="sm" placeholder="Small input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Default</label>
            <Input size="default" placeholder="Default input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Large</label>
            <Input size="lg" placeholder="Large input" />
          </div>
        </div>
      </div>
    )
  }

  if (section === 'types') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-3 max-w-md">
          <Input type="text" placeholder="Text input" />
          <Input type="email" placeholder="email@example.com" />
          <Input type="password" placeholder="Password" />
          <Input type="number" placeholder="42" />
          <Input type="search" placeholder="Search..." />
          <Input type="url" placeholder="https://example.com" />
          <Input type="tel" placeholder="+1 (555) 000-0000" />
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Disabled</label>
            <Input disabled placeholder="Disabled input" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Read-only</label>
            <Input readOnly value="Read-only value" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Required</label>
            <Input required placeholder="Required field" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-destructive">Invalid</label>
            <Input aria-invalid={true} placeholder="Invalid input" />
          </div>
        </div>
      </div>
    )
  }

  return null
}
