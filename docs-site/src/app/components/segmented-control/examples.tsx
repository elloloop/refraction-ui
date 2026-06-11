'use client'

import { useState } from 'react'
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@refraction-ui/react-segmented-control'

interface SegmentedControlExamplesProps {
  section: 'basic' | 'sizes' | 'icons'
}

export function SegmentedControlExamples({
  section,
}: SegmentedControlExamplesProps) {
  const [view, setView] = useState('week')

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col items-start gap-4">
          <SegmentedControl
            aria-label="View range"
            value={view}
            onValueChange={setView}
          >
            <SegmentedControlItem value="day">Day</SegmentedControlItem>
            <SegmentedControlItem value="week">Week</SegmentedControlItem>
            <SegmentedControlItem value="month">Month</SegmentedControlItem>
          </SegmentedControl>
          <span className="text-xs text-muted-foreground font-medium">
            Selected: {view}
          </span>
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex flex-col items-start gap-2.5">
            <SegmentedControl aria-label="Size sm" defaultValue="a" size="sm">
              <SegmentedControlItem value="a">Left</SegmentedControlItem>
              <SegmentedControlItem value="b">Center</SegmentedControlItem>
              <SegmentedControlItem value="c">Right</SegmentedControlItem>
            </SegmentedControl>
            <span className="text-xs text-muted-foreground font-medium">sm</span>
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <SegmentedControl aria-label="Size md" defaultValue="a" size="md">
              <SegmentedControlItem value="a">Left</SegmentedControlItem>
              <SegmentedControlItem value="b">Center</SegmentedControlItem>
              <SegmentedControlItem value="c">Right</SegmentedControlItem>
            </SegmentedControl>
            <span className="text-xs text-muted-foreground font-medium">
              md (default)
            </span>
          </div>
        </div>
      </div>
    )
  }

  // section === 'icons'
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <SegmentedControl aria-label="Layout" defaultValue="grid">
        <SegmentedControlItem value="list">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          List
        </SegmentedControlItem>
        <SegmentedControlItem value="grid">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Grid
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}
