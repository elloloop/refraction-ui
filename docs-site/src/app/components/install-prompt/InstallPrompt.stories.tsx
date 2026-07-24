import type { Meta, StoryObj } from '@storybook/react'
import { InstallPrompt } from '@refraction-ui/react-install-prompt'

const meta: Meta<typeof InstallPrompt> = {
  title: 'Feedback/InstallPrompt',
  component: InstallPrompt,
  args: {
    appName: 'My App',
    description: 'Install this app for the best experience.',
  },
  argTypes: {
    appName: { control: 'text' },
    description: { control: 'text' },
    onInstall: { action: 'installed' },
    onDismiss: { action: 'dismissed' },
  },
}
export default meta

type Story = StoryObj<typeof InstallPrompt>

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md w-full">
      <InstallPrompt {...args} />
    </div>
  ),
}