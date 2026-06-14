import type { Meta, StoryObj } from '@storybook/react'
import { DeviceFrame } from '@refraction-ui/react-device-frame'

const meta: Meta<typeof DeviceFrame> = {
  title: 'Components/DeviceFrame',
  component: DeviceFrame,
  argTypes: {
    device: {
      control: 'select',
      options: ['iphone', 'ipad', 'macbook'],
    },
  },
  args: {
    device: 'iphone',
  },
}

export default meta

type Story = StoryObj<typeof DeviceFrame>

export const IPhone: Story = {
  args: {
    device: 'iphone',
    className: 'w-48',
  },
  render: (args) => (
    <DeviceFrame {...args}>
      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs h-full flex items-center justify-center">
        App Preview
      </div>
    </DeviceFrame>
  ),
}

export const IPad: Story = {
  args: {
    device: 'ipad',
    className: 'w-64',
  },
  render: (args) => (
    <DeviceFrame {...args}>
      <div className="p-4 bg-gradient-to-br from-green-500 to-teal-500 text-white text-xs h-full flex items-center justify-center">
        Tablet Preview
      </div>
    </DeviceFrame>
  ),
}
