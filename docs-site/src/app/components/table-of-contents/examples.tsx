'use client'

import * as React from 'react'
import { TableOfContents } from '@refraction-ui/react-table-of-contents'

interface TableOfContentsExamplesProps {
  section: 'default'
}

export function TableOfContentsExamples({ section }: TableOfContentsExamplesProps) {
  const containerRef = React.useRef<HTMLElement | null>(null)

  if (section === 'default') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid grid-cols-[1fr_180px] gap-8">
          <article
            ref={containerRef as React.RefObject<HTMLDivElement>}
            className="prose-sm max-h-72 space-y-3 overflow-y-auto"
          >
            <h2 id="introduction" className="text-lg font-semibold text-foreground">
              Introduction
            </h2>
            <p className="text-sm text-muted-foreground">
              The table of contents derives its entries from the headings inside the container.
            </p>
            <h2 id="getting-started" className="text-lg font-semibold text-foreground">
              Getting started
            </h2>
            <p className="text-sm text-muted-foreground">Install the package and render headings.</p>
            <h3 id="installation" className="text-base font-semibold text-foreground">
              Installation
            </h3>
            <p className="text-sm text-muted-foreground">Add it to your dependencies.</p>
            <h3 id="configuration" className="text-base font-semibold text-foreground">
              Configuration
            </h3>
            <p className="text-sm text-muted-foreground">Tune the selectors to match your markup.</p>
            <h2 id="api-reference" className="text-lg font-semibold text-foreground">
              API reference
            </h2>
            <p className="text-sm text-muted-foreground">Every prop, documented.</p>
          </article>

          <TableOfContents containerRef={containerRef} className="sticky top-0 self-start" />
        </div>
      </div>
    )
  }

  return null
}
