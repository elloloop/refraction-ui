import type { Meta, StoryObj } from '@storybook/react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@refraction-ui/react-collapsible'

const meta: Meta<typeof Collapsible> = {
  title: 'Components/Collapsible',
  component: Collapsible,
  argTypes: {
    defaultOpen: { control: 'boolean' },
    open: { control: 'boolean' },
  },
  args: {},
}
export default meta

type Story = StoryObj<typeof Collapsible>

export const Basic: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6 max-w-md">
      <Collapsible {...args}>
        <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent">
          Click to expand
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-4 text-sm text-muted-foreground">
          This content is revealed when the trigger is clicked. It can contain any React nodes including text, images, or other components.
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
}

export const DefaultOpen: Story = {
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <div className="flex flex-col gap-6 max-w-md">
      <Collapsible {...args}>
        <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent">
          Default open section
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-4 text-sm text-muted-foreground">
          This section starts open by default using the defaultOpen prop.
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
}
