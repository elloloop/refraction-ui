import type { Meta, StoryObj } from '@storybook/react';
import { ThreadView } from '@refraction-ui/react-thread-view';

const meta: Meta<typeof ThreadView> = {
  title: 'Components/ThreadView',
  component: ThreadView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ThreadView>;

export const Default: Story = {
  args: {
    messages: [
      {
        id: '1',
        content: 'Hello, this is a test message!',
        timestamp: new Date(),
        author: { id: 'u1', name: 'Alice' }
      }
    ]
  },
};

export const Variants: Story = {
  args: {
    messages: [
      {
        id: '2',
        content: 'This message has reactions and replies',
        timestamp: new Date(),
        author: { id: 'u2', name: 'Bob' },
        reactions: [{ emoji: '👍', count: 1, userReacted: false }],
        replies: ['reply1']
      }
    ]
  },
};
