import type { Meta, StoryObj } from '@storybook/react'
import {
  Callout,
  CalloutIcon,
  CalloutContent,
  CalloutTitle,
  CalloutDescription,
} from '@refraction-ui/react-callout'

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'info', 'success', 'warning', 'destructive'],
    },
  },
  args: {
    variant: 'default',
  },
}
export default meta

type Story = StoryObj<typeof Callout>

export const Default: Story = {
  render: (args) => (
    <Callout {...args}>
      A neutral note to draw attention to supporting information.
    </Callout>
  ),
}

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

export const Composition: Story = {
  args: {
    variant: 'info',
  },
  render: (args) => (
    <Callout {...args} className="flex gap-3">
      <CalloutIcon>
        <InfoIcon />
      </CalloutIcon>
      <CalloutContent>
        <CalloutTitle>Scheduled maintenance</CalloutTitle>
        <CalloutDescription>
          The dashboard will be unavailable on Sunday from 02:00 to 04:00 UTC while we
          upgrade our infrastructure.
        </CalloutDescription>
      </CalloutContent>
    </Callout>
  ),
}
