'use client'

import { SkipToContent } from '@refraction-ui/react-skip-to-content'

interface SkipToContentExamplesProps {
  section: 'default' | 'custom-target'
}

export function SkipToContentExamples({ section }: SkipToContentExamplesProps) {
  if (section === 'default') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          The link is visually hidden until focused. Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Tab</kbd>{' '}
          inside this card to reveal it.
        </p>
        <div className="relative rounded-lg border border-dashed border-border p-6">
          <SkipToContent />
          <div className="text-sm text-muted-foreground">Page chrome (nav, header, etc.)</div>
          <div id="main-content" className="mt-4 rounded-md bg-muted p-4 text-sm">
            <code className="text-xs">#main-content</code> — the focus target.
          </div>
        </div>
      </div>
    )
  }

  if (section === 'custom-target') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="mb-4 text-sm text-muted-foreground">
          Point at any element id with <code className="text-xs">targetId</code> and override the label.
        </p>
        <div className="relative rounded-lg border border-dashed border-border p-6">
          <SkipToContent targetId="article-body">Skip to article</SkipToContent>
          <div className="text-sm text-muted-foreground">Sidebar / table of contents</div>
          <div id="article-body" className="mt-4 rounded-md bg-muted p-4 text-sm">
            <code className="text-xs">#article-body</code>
          </div>
        </div>
      </div>
    )
  }

  return null
}
