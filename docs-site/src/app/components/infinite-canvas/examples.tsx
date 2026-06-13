'use client'

import * as React from 'react'
import { InfiniteCanvas } from '@refraction-ui/react-infinite-canvas'

interface InfiniteCanvasExamplesProps {
  section: 'basic' | 'controls' | 'fit'
}

export function InfiniteCanvasExamples({ section }: InfiniteCanvasExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: 320 }}>
        <InfiniteCanvas showGrid className="w-full h-full">
          <div className="absolute top-12 left-12 rounded-lg border border-border bg-card px-6 py-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Canvas node</p>
            <p className="text-xs text-muted-foreground mt-1">Scroll to zoom · Drag to pan</p>
          </div>
          <div className="absolute top-32 left-64 rounded-lg border border-border bg-card px-6 py-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Another node</p>
          </div>
        </InfiniteCanvas>
      </div>
    )
  }

  if (section === 'controls') {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: 320 }}>
        <InfiniteCanvas showGrid showControls className="w-full h-full">
          <div className="absolute top-16 left-16 rounded-lg border border-border bg-muted px-6 py-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Use +/− buttons</p>
            <p className="text-xs text-muted-foreground mt-1">or scroll to zoom</p>
          </div>
        </InfiniteCanvas>
      </div>
    )
  }

  if (section === 'fit') {
    return <FitExample />
  }

  return null
}

function FitExample() {
  const bounds = { minX: 0, minY: 0, maxX: 400, maxY: 200 }
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: 320 }}>
      <InfiniteCanvas
        showGrid
        showControls
        contentBounds={bounds}
        className="w-full h-full"
      >
        <div className="absolute top-8 left-8 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">Fit target A</p>
        </div>
        <div className="absolute top-8 left-64 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">Fit target B</p>
        </div>
        <div className="absolute top-24 left-36 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">Fit target C</p>
        </div>
        <p className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
          Press ⊞ to fit all nodes
        </p>
      </InfiniteCanvas>
    </div>
  )
}
