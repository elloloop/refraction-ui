'use client'

import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '@refraction-ui/react-popover'

interface PopoverExamplesProps {
  section: 'basic'
}

export function PopoverExamples({ section }: PopoverExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <Popover>
            <PopoverTrigger className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Open Popover
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Popover Title</h4>
                <p className="text-sm text-muted-foreground">This is a popover with some content. It can contain any elements.</p>
                <PopoverClose className="mt-2 inline-flex items-center rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80">
                  Close
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }

  return null
}
