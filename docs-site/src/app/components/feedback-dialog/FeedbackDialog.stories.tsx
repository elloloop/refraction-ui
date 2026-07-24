import type { Meta, StoryObj } from '@storybook/react'
import { FeedbackDialog, FeedbackButton } from '@refraction-ui/react-feedback-dialog'

const meta: Meta<typeof FeedbackDialog> = {
  title: 'Feedback/FeedbackDialog',
  component: FeedbackDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultOpen: true
  },
  render: (args) => (
    <FeedbackDialog {...args}>
      <FeedbackButton className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Send Feedback
      </FeedbackButton>
    </FeedbackDialog>
  ),
}
