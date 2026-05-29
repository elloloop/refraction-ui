'use client'

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@refraction-ui/react-accordion'

export function AccordionExamples() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 flex items-center justify-center min-h-[200px] w-full">
          <div className="w-full max-w-lg mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern for an accordion component.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that matches the other components&apos; aesthetic, controlled by CSS variables.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It has CSS transitions out of the box to smoothly expand and collapse the content area.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}
