import type { Meta, StoryObj } from '@storybook/react';
import { ResizableLayout } from '@refraction-ui/react-resizable-layout';

const meta: Meta<typeof ResizableLayout> = {
  title: 'Layout/ResizableLayout',
  component: ResizableLayout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ResizableLayout>;

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
