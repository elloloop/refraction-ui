import type { Meta, StoryObj } from '@storybook/react'
import { CommandInput } from '@refraction-ui/react-command-input'
import { useState } from 'react'

const meta: Meta<typeof CommandInput> = {
  title: 'Inputs/CommandInput',
  component: CommandInput,
  argTypes: {},
}

export default meta

type Story = StoryObj<typeof CommandInput>

export const Mentions: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <div className="max-w-md space-y-3">
        <CommandInput
          {...args}
          value={args.value ?? value}
          onChange={(val) => {
            setValue(val)
            args.onChange?.(val)
          }}
          triggers={args.triggers || [{ char: '@' }]}
          renderPopover={args.renderPopover || (({ isOpen, trigger, search }) =>
            isOpen ? (
              <div className="mt-1 rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-sm">
                Mentioning with <code className="bg-muted px-1 rounded">{trigger}</code>
                {search ? `: "${search}"` : '…'}
              </div>
            ) : null
          )}
        />
      </div>
    )
  },
}

export const Commands: Story = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <div className="max-w-md space-y-3">
        <CommandInput
          {...args}
          value={args.value ?? value}
          onChange={(val) => {
            setValue(val)
            args.onChange?.(val)
          }}
          triggers={args.triggers || [{ char: '/' }, { char: '#' }]}
          renderPopover={args.renderPopover || (({ isOpen, trigger, search }) =>
            isOpen ? (
              <div className="mt-1 rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-sm">
                {trigger === '/' ? 'Slash command' : 'Channel'} {search && `→ ${search}`}
              </div>
            ) : null
          )}
        />
      </div>
    )
  },
}
