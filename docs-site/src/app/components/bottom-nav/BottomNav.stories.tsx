import type { Meta, StoryObj } from '@storybook/react'
import { BottomNav } from '@refraction-ui/react-bottom-nav'

const meta: Meta<typeof BottomNav> = {
  title: 'Navigation/BottomNav',
  component: BottomNav,
  argTypes: {
    currentPath: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof BottomNav>

export const Default: Story = {
  args: {
    currentPath: '/',
    tabs: [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
      { label: 'Profile', href: '/profile' },
      { label: 'Settings', href: '/settings' },
    ],
  },
  render: (args) => (
    <div className="max-w-sm mx-auto rounded-lg border overflow-hidden relative">
      <div className="h-32 flex items-center justify-center text-sm text-muted-foreground bg-card">
        Page Content
      </div>
      <BottomNav {...args} className="relative" />
    </div>
  )
}
