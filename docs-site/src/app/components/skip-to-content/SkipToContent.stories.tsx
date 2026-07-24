import type { Meta, StoryObj } from '@storybook/react';
import { SkipToContent } from '@refraction-ui/react-skip-to-content';

const meta: Meta<typeof SkipToContent> = {
  title: 'Navigation/SkipToContent',
  component: SkipToContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SkipToContent>;

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
