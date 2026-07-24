import type { Meta, StoryObj } from '@storybook/react'
import {
  Carousel,
  CarouselItem,
  CarouselTrigger,
  CarouselContent,
} from '@refraction-ui/react-carousel'

const meta: Meta<typeof Carousel> = {
  title: 'Data Display/Carousel',
  component: Carousel,
  argTypes: {
    type: { control: 'radio', options: ['single', 'multiple'] },
    collapsible: { control: 'boolean' },
  },
  args: {
    type: 'single',
    collapsible: true,
  },
}
export default meta

type Story = StoryObj<typeof Carousel>

const items = [
  {
    value: 'shipping',
    title: 'How long does shipping take?',
    body: 'Orders ship within one business day and arrive in 3–5 business days.',
  },
  {
    value: 'returns',
    title: 'What is your return policy?',
    body: 'Returns are accepted within 30 days of delivery for a full refund.',
  },
  {
    value: 'support',
    title: 'How do I contact support?',
    body: 'Reach our team any time at support@example.com — we reply within a day.',
  },
]

export const Default: Story = {
  args: {
    defaultValue: 'shipping',
  },
  render: (args) => (
    <Carousel {...args} className="w-full max-w-md">
      {items.map((item) => (
        <CarouselItem key={item.value} value={item.value}>
          <CarouselTrigger>{item.title}</CarouselTrigger>
          <CarouselContent>{item.body}</CarouselContent>
        </CarouselItem>
      ))}
    </Carousel>
  ),
}

export const Multiple: Story = {
  args: {
    type: 'multiple',
    defaultValue: ['shipping', 'support'],
  },
  render: (args) => (
    <Carousel {...args} className="w-full max-w-md">
      {items.map((item) => (
        <CarouselItem key={item.value} value={item.value}>
          <CarouselTrigger>{item.title}</CarouselTrigger>
          <CarouselContent>{item.body}</CarouselContent>
        </CarouselItem>
      ))}
    </Carousel>
  ),
}
