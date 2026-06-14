import type { Meta, StoryObj } from '@storybook/react'
import { FileUpload } from '@refraction-ui/react-file-upload'

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  args: {
    accept: 'image/*,.pdf',
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  },
  argTypes: {
    onFilesChange: { action: 'files changed' },
    accept: { control: 'text' },
    maxFiles: { control: 'number' },
    maxSize: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md w-full">
      <FileUpload {...args} />
    </div>
  ),
}
