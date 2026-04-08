'use client'

import { Tooltip, TooltipTrigger, TooltipContent } from '@refraction-ui/react-tooltip'
import { Button } from '@refraction-ui/react-button'

interface TooltipExamplesProps {
  section: 'basic'
}

export function TooltipExamples({ section }: TooltipExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              This is a tooltip
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={0}>
            <TooltipTrigger>
              <Button variant="secondary">No delay</Button>
            </TooltipTrigger>
            <TooltipContent>
              Instant tooltip (no delay)
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={700}>
            <TooltipTrigger>
              <Button variant="ghost">Long delay</Button>
            </TooltipTrigger>
            <TooltipContent>
              700ms delay tooltip
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    )
  }

  return null
}
