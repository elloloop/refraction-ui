import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@refraction-ui/react-card'
import { Button } from '@refraction-ui/react-button'

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  args: {},
}
export default meta

type Story = StoryObj<typeof Card>

export const Basic: Story = {
  render: (args) => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>A brief description of the card content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the main content area. It can contain text, images, or any other React nodes.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
}

// Issue #485 — subtle surface + tinted second-accent tones.
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card variant="default" className="max-w-[14rem]">
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>Standard surface.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="subtle" className="max-w-[14rem]">
        <CardHeader>
          <CardTitle>Subtle</CardTitle>
          <CardDescription>Lower-emphasis surface.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="tertiary" className="max-w-[14rem]">
        <CardHeader>
          <CardTitle>Tertiary</CardTitle>
          <CardDescription>Tinted second accent.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
}

export const Notifications: Story = {
  render: (args) => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            New deployment started
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Build completed successfully
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Review requested
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">View All</Button>
      </CardFooter>
    </Card>
  )
}
