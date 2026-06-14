import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from '@refraction-ui/react-checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: { control: 'radio', options: [true, false, 'indeterminate'] },
    disabled: { control: 'boolean' },
    size: { control: 'radio', options: ['sm', 'default', 'lg'] },
  },
  args: {
    checked: false,
    disabled: false,
    size: 'default',
  },
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <span className="text-sm font-medium">Accept terms and conditions</span>
    </div>
  ),
}

export const States: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex flex-col items-center gap-2.5">
        <Checkbox {...args} checked={false} />
        <span className="text-xs text-muted-foreground font-medium">Unchecked</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Checkbox {...args} checked={true} />
        <span className="text-xs text-muted-foreground font-medium">Checked</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Checkbox {...args} checked="indeterminate" />
        <span className="text-xs text-muted-foreground font-medium">Indeterminate</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Checkbox {...args} disabled checked={false} />
        <span className="text-xs text-muted-foreground font-medium">Disabled</span>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <Checkbox {...args} disabled checked={true} />
        <span className="text-xs text-muted-foreground font-medium">Disabled Checked</span>
      </div>
    </div>
  ),
}
