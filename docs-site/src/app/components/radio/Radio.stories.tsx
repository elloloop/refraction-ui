import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioItem } from '@refraction-ui/react-radio';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/Radio',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    defaultValue: 'option-1',
    name: 'default-radio'
  },
  render: (args) => (
    <RadioGroup {...args} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <RadioItem value="option-1" id="option-1" />
        <label htmlFor="option-1">Option 1</label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="option-2" id="option-2" />
        <label htmlFor="option-2">Option 2</label>
      </div>
    </RadioGroup>
  )
};

export const Variants: Story = {
  args: {
    defaultValue: 'option-1',
    name: 'variants-radio'
  },
  render: (args) => (
    <RadioGroup {...args} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <RadioItem value="option-1" id="v-option-1" variant="default" />
        <label htmlFor="v-option-1">Default Variant</label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="option-2" id="v-option-2" disabled />
        <label htmlFor="v-option-2">Disabled</label>
      </div>
    </RadioGroup>
  )
};
