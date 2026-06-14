import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from '@refraction-ui/react-breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    pathname: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Breadcrumbs>

export const Default: Story = {
  args: {
    pathname: '/docs/components/button',
  },
  render: (args) => <Breadcrumbs {...args} />
}

export const CustomLabels: Story = {
  args: {
    pathname: '/docs/components/button',
    labels: { docs: 'Documentation', components: 'UI Components' },
  },
  render: (args) => <Breadcrumbs {...args} />
}

export const ManualItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widgets', href: '/products/widgets' },
      { label: 'Blue Widget' },
    ],
  },
  render: (args) => <Breadcrumbs {...args} />
}
