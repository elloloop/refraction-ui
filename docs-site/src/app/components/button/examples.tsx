'use client'

import { Button } from '@refraction-ui/react-button'

interface ButtonExamplesProps {
  section: 'variants' | 'sizes' | 'states'
}

export function ButtonExamples({ section }: ButtonExamplesProps) {
  if (section === 'variants') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Star">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </Button>
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button loading>Loading...</Button>
          <Button disabled>Disabled</Button>
          <Button variant="destructive" loading>Deleting...</Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
      </div>
    )
  }

  return null
}
