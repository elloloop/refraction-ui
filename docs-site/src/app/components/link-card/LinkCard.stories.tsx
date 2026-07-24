import type { Meta, StoryObj } from '@storybook/react'
import { LinkCard } from '@refraction-ui/react-link-card'

const meta: Meta<typeof LinkCard> = {
  title: 'Data Display/LinkCard',
  component: LinkCard,
  args: {
    href: 'https://refraction-ui.dev/docs',
    className: 'block max-w-sm rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50 hover:bg-muted/40',
  },
  argTypes: {
    href: { control: 'text' },
    className: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof LinkCard>

export const Default: Story = {
  render: (args) => (
    <LinkCard {...args}>
      <span className="block text-sm font-semibold text-foreground">Documentation</span>
      <span className="mt-1 block text-sm text-muted-foreground">
        Guides, API references, and examples for getting started.
      </span>
    </LinkCard>
  ),
}

export const List: Story = {
  render: () => {
    const cards = [
      { href: '/components/button', title: 'Button', body: 'Clickable button with variants and states.' },
      { href: '/components/pagination', title: 'Pagination', body: 'Navigate across pages of content.' },
      { href: '/components/mobile-nav', title: 'Mobile Nav', body: 'Collapsible navigation for small screens.' },
    ]
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <LinkCard
            key={c.href}
            href={c.href}
            className="block rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
          >
            <span className="block text-sm font-semibold text-foreground">{c.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{c.body}</span>
          </LinkCard>
        ))}
      </div>
    )
  },
}