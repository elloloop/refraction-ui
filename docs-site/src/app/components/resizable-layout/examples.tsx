'use client'

import {
  ResizableLayout,
  ResizablePane,
  ResizableDivider,
} from '@refraction-ui/react-resizable-layout'

interface ResizableLayoutExamplesProps {
  section: 'horizontal' | 'vertical' | 'persisted'
}

function PaneBody({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-sm font-medium text-muted-foreground">
      {label}
    </div>
  )
}

export function ResizableLayoutExamples({ section }: ResizableLayoutExamplesProps) {
  if (section === 'horizontal') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ResizableLayout
          defaultSizes={[40, 60]}
          minSizes={[20, 20]}
          className="h-56 overflow-hidden rounded-lg border border-border"
        >
          <ResizablePane index={0} className="bg-muted/40">
            <PaneBody label="Sidebar (40%)" />
          </ResizablePane>
          <ResizableDivider index={0} className="w-1.5 cursor-col-resize bg-border hover:bg-primary/50" />
          <ResizablePane index={1}>
            <PaneBody label="Content (60%)" />
          </ResizablePane>
        </ResizableLayout>
      </div>
    )
  }

  if (section === 'vertical') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ResizableLayout
          orientation="vertical"
          defaultSizes={[50, 50]}
          className="h-72 overflow-hidden rounded-lg border border-border"
        >
          <ResizablePane index={0} className="bg-muted/40">
            <PaneBody label="Editor" />
          </ResizablePane>
          <ResizableDivider index={0} className="h-1.5 cursor-row-resize bg-border hover:bg-primary/50" />
          <ResizablePane index={1}>
            <PaneBody label="Terminal" />
          </ResizablePane>
        </ResizableLayout>
      </div>
    )
  }

  if (section === 'persisted') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ResizableLayout
          persistKey="docs-resizable-demo"
          defaultSizes={[33, 34, 33]}
          minSizes={[15, 15, 15]}
          className="h-56 overflow-hidden rounded-lg border border-border"
        >
          <ResizablePane index={0} className="bg-muted/40">
            <PaneBody label="One" />
          </ResizablePane>
          <ResizableDivider index={0} className="w-1.5 cursor-col-resize bg-border hover:bg-primary/50" />
          <ResizablePane index={1}>
            <PaneBody label="Two" />
          </ResizablePane>
          <ResizableDivider index={1} className="w-1.5 cursor-col-resize bg-border hover:bg-primary/50" />
          <ResizablePane index={2} className="bg-muted/40">
            <PaneBody label="Three" />
          </ResizablePane>
        </ResizableLayout>
      </div>
    )
  }

  return null
}
