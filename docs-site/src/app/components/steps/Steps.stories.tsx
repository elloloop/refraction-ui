import type { Meta, StoryObj } from '@storybook/react';
import { Steps } from '@refraction-ui/react-steps';

const meta: Meta<typeof Steps> = {
  title: 'Components/Steps',
  component: Steps,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Steps>;

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
