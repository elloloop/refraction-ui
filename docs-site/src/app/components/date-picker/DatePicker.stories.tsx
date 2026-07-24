import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker } from '@refraction-ui/react-date-picker'
import { useState } from 'react'

const meta: Meta<typeof DatePicker> = {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  argTypes: {},
}

export default meta

type Story = StoryObj<typeof DatePicker>

export const Default: Story = {
  render: (args) => {
    const [date, setDate] = useState<Date | undefined>(undefined)
    return (
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground font-medium">Calendar + Time</span>
        <DatePicker {...args} value={args.value ?? date} onChange={(val) => {
          setDate(val)
          args.onChange?.(val)
        }} />
        {(args.value ?? date) && <p className="text-sm text-muted-foreground mt-2">Selected: {(args.value ?? date)?.toLocaleString()}</p>}
      </div>
    )
  },
}
