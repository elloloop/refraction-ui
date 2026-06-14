import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@refraction-ui/react-accordion'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    collapsible: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  args: {
    type: 'single',
    collapsible: true,
  },
  render: (args) => (
    <div className="w-full max-w-lg mx-auto">
      <Accordion {...args} className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern for an accordion component.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components&apos; aesthetic.
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
  )
}
