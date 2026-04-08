'use client'

import { useState } from 'react'
import { Calendar } from '@refraction-ui/react-calendar'

interface CalendarExamplesProps {
  section: 'basic'
}

export function CalendarExamples({ section }: CalendarExamplesProps) {
  const [selected, setSelected] = useState<Date | undefined>(undefined)

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-8">
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Date Selection</span>
            <Calendar value={selected} onSelect={setSelected} />
            {selected && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selected.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
