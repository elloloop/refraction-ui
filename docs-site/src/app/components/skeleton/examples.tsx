'use client'

import { Skeleton, SkeletonText } from '@refraction-ui/react-skeleton'

interface SkeletonExamplesProps {
  section: 'shapes' | 'compositions'
}

export function SkeletonExamples({ section }: SkeletonExamplesProps) {
  if (section === 'shapes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <Skeleton shape="rectangle" width={200} height={20} />
            <span className="text-xs text-muted-foreground font-medium">Rectangle</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Skeleton shape="circle" width={48} height={48} />
            <span className="text-xs text-muted-foreground font-medium">Circle</span>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <Skeleton shape="text" width={150} />
            <span className="text-xs text-muted-foreground font-medium">Text</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'compositions') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Text Block (3 lines)</span>
            <SkeletonText lines={3} />
          </div>
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Card Skeleton</span>
            <div className="flex items-center gap-4">
              <Skeleton shape="circle" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <Skeleton shape="text" width="60%" />
                <Skeleton shape="text" width="40%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
