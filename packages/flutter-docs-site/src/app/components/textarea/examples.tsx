'use client'

import { Textarea } from '@refraction-ui/react-textarea'

interface TextareaExamplesProps {
  section: 'sizes' | 'states'
}

export function TextareaExamples({ section }: TextareaExamplesProps) {
  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Small</span>
            <Textarea size="sm" placeholder="Small textarea..." />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Default</span>
            <Textarea size="default" placeholder="Default textarea..." />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Large</span>
            <Textarea size="lg" placeholder="Large textarea..." />
          </div>
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Placeholder</span>
            <Textarea placeholder="Enter your message here..." />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Disabled</span>
            <Textarea disabled placeholder="Cannot edit this..." />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Read Only</span>
            <Textarea readOnly defaultValue="This content is read only." />
          </div>
        </div>
      </div>
    )
  }

  return null
}
