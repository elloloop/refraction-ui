import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Calendar } from '@refraction-ui/react-calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
}
export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Date | undefined>(undefined)
    return (
      <div className="space-y-4">
        <Calendar {...args} value={selected} onSelect={setSelected} />
        {selected && (
          <p className="text-sm text-muted-foreground mt-2">
            Selected: {selected.toLocaleDateString()}
          </p>
        )}
      </div>
    )
  }
}
