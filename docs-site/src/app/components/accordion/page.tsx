import { AccordionExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
import { FrameworkTabs } from '@/components/framework-tabs'

const accordionProps = [
  {
    name: 'type',
    type: "'single' | 'multiple'",
    default: "'single'",
    description: 'Determines whether one or multiple items can be open at the same time.',
  },
  {
    name: 'defaultValue',
    type: 'string | string[]',
    description: 'The value of the item(s) to expand by default.',
  },
  {
    name: 'collapsible',
    type: 'boolean',
    default: 'false',
    description: 'When type is "single", allows closing content when clicking trigger for an open item.',
  },
]

export default function AccordionPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Accordion</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A vertically stacked set of interactive headings that each reveal a section of content.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/accordion</code> core.
        </p>
      </div>

      <FrameworkTabs />

      {/* Live Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Preview</h2>
        <AccordionExamples />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand basePackage="accordion" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock
          frameworks={{
            react: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@refraction-ui/react-accordion'

export function MyComponent() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it unstyled?</AccordionTrigger>
        <AccordionContent>Yes. It comes with default theme variables you can override.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`,
            astro: `---
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@refraction-ui/astro-accordion'
---

<Accordion type="single" collapsible client:load>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>`
          }}
        />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={accordionProps} />
      </section>
    </div>
  )
}
