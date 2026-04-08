'use client'

import { Button } from '@refraction-ui/react-button'

interface ButtonExamplesProps {
  section: 'variants' | 'sizes' | 'states'
}

export function ButtonExamples({ section }: ButtonExamplesProps) {
  if (section === 'variants') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="default">Default</Button>
            <span className="text-xs text-muted-foreground font-medium">Default</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="destructive">Destructive</Button>
            <span className="text-xs text-muted-foreground font-medium">Destructive</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="outline">Outline</Button>
            <span className="text-xs text-muted-foreground font-medium">Outline</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="secondary">Secondary</Button>
            <span className="text-xs text-muted-foreground font-medium">Secondary</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="ghost">Ghost</Button>
            <span className="text-xs text-muted-foreground font-medium">Ghost</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="link">Link</Button>
            <span className="text-xs text-muted-foreground font-medium">Link</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Button size="xs">Extra Small</Button>
            <span className="text-xs text-muted-foreground font-medium">xs</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button size="sm">Small</Button>
            <span className="text-xs text-muted-foreground font-medium">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button size="default">Default</Button>
            <span className="text-xs text-muted-foreground font-medium">default</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button size="lg">Large</Button>
            <span className="text-xs text-muted-foreground font-medium">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button size="icon" aria-label="Star">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </Button>
            <span className="text-xs text-muted-foreground font-medium">icon</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col items-center gap-2.5">
            <Button loading>Loading...</Button>
            <span className="text-xs text-muted-foreground font-medium">Loading</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button disabled>Disabled</Button>
            <span className="text-xs text-muted-foreground font-medium">Disabled</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="destructive" loading>Deleting...</Button>
            <span className="text-xs text-muted-foreground font-medium">Destructive + Loading</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Button variant="outline" disabled>Disabled Outline</Button>
            <span className="text-xs text-muted-foreground font-medium">Outline + Disabled</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
