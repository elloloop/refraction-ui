import type { Meta, StoryObj } from '@storybook/react'
import { ContentProtection } from '@refraction-ui/react-content-protection'

const meta: Meta<typeof ContentProtection> = {
  title: 'Components/ContentProtection',
  component: ContentProtection,
  argTypes: {
    watermark: { control: 'object' },
  },
  args: {
    watermark: { text: 'CONFIDENTIAL', opacity: 0.1 },
  },
}

export default meta

type Story = StoryObj<typeof ContentProtection>

export const Default: Story = {
  render: (args) => (
    <ContentProtection {...args}>
      <div className="p-8 bg-white dark:bg-gray-900 rounded-lg min-h-[200px]">
        <h3 className="text-lg font-semibold mb-2">Protected Content</h3>
        <p className="text-sm text-muted-foreground">
          This content has a watermark overlay. Right-click and copy protection can also be enabled.
        </p>
      </div>
    </ContentProtection>
  ),
}
