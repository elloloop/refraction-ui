import type { Meta, StoryObj } from '@storybook/react';
import { Payment } from '@refraction-ui/react-payment';

const meta: Meta<typeof Payment> = {
  title: 'Components/Payment',
  component: Payment,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Payment>;

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
