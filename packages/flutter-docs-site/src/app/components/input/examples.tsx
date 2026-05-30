'use client'

import { Input } from '@refraction-ui/react-input'

interface InputExamplesProps {
  section: 'sizes' | 'types' | 'states'
}

export function InputExamples({ section }: InputExamplesProps) {
  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Small</label>
            <Input size="sm" placeholder="Small input" />
            <p className="text-xs text-muted-foreground">Compact size for dense layouts and inline forms.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Default</label>
            <Input size="default" placeholder="Default input" />
            <p className="text-xs text-muted-foreground">Standard size for most form contexts.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Large</label>
            <Input size="lg" placeholder="Large input" />
            <p className="text-xs text-muted-foreground">Larger touch target for primary actions or hero inputs.</p>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'types') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid gap-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Text</label>
            <Input type="text" placeholder="Enter text" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input type="email" placeholder="name@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input type="password" placeholder="Enter password" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Number</label>
            <Input type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Search</label>
            <Input type="search" placeholder="Search..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">URL</label>
            <Input type="url" placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Phone</label>
            <Input type="tel" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Disabled</label>
            <Input disabled placeholder="Cannot edit this field" />
            <p className="text-xs text-muted-foreground">Prevents user interaction entirely.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Read-only</label>
            <Input readOnly value="Read-only value" />
            <p className="text-xs text-muted-foreground">Visible and selectable but not editable.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Required</label>
            <Input required placeholder="This field is required" />
            <p className="text-xs text-muted-foreground">Browser enforces completion on form submit.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-destructive">Invalid</label>
            <Input aria-invalid={true} placeholder="Invalid input" />
            <p className="text-xs text-destructive/80">This field has a validation error.</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
