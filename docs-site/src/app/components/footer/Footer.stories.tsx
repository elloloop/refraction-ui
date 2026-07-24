import type { Meta, StoryObj } from '@storybook/react'
import { Footer } from '@refraction-ui/react-footer'

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    layout: 'centered',
  },
  args: {
    copyright: '2024 Refraction UI. All rights reserved.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Changelog', href: '/changelog' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Docs', href: '/docs' },
          { label: 'Blog', href: '/blog' },
          { label: 'Support', href: '/support' },
        ],
      },
    ],
    socialLinks: [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Twitter', href: 'https://twitter.com' },
    ],
  },
  argTypes: {
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="rounded-lg border overflow-hidden w-full min-w-[800px]">
      <Footer {...args} />
    </div>
  ),
}
