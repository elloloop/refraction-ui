import type { Meta, StoryObj } from '@storybook/react'
import { CardGrid } from '@refraction-ui/react-card-grid'

const meta: Meta<typeof CardGrid> = {
  title: 'Components/CardGrid',
  component: CardGrid,
  argTypes: {
    columns: { control: { type: 'number', min: 1, max: 6 } },
  },
  args: {
    columns: 3,
  },
}
export default meta

type Story = StoryObj<typeof CardGrid>

const cards = [
  { title: 'Analytics', body: 'Track engagement across every surface in real time.' },
  { title: 'Automation', body: 'Wire up workflows without writing glue code.' },
  { title: 'Integrations', body: 'Connect the tools your team already uses.' },
  { title: 'Security', body: 'SSO, audit logs, and fine-grained permissions.' },
  { title: 'Billing', body: 'Usage-based pricing with transparent invoices.' },
  { title: 'Support', body: 'Talk to a human whenever you get stuck.' },
]

export const Default: Story = {
  render: (args) => (
    <CardGrid {...args} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.title} className="rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
        </div>
      ))}
    </CardGrid>
  ),
}

export const TwoColumns: Story = {
  args: {
    columns: 2,
  },
  render: (args) => (
    <CardGrid {...args} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((c) => (
        <div key={c.title} className="rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
        </div>
      ))}
    </CardGrid>
  ),
}
