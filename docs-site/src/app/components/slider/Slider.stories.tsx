import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@refraction-ui/react-slider';

const meta: Meta<typeof Slider> = {
  title: 'Inputs/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    // Add default args here
  },
};

export const Variants: Story = {
  args: {
    // Add variants here
  },
};
