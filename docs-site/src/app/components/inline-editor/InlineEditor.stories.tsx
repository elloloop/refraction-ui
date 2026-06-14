import type { Meta, StoryObj } from '@storybook/react'
import { InlineEditor } from '@refraction-ui/react-inline-editor'
import { useState } from 'react'

const meta: Meta<typeof InlineEditor> = {
  title: 'Components/InlineEditor',
  component: InlineEditor,
  parameters: {
    layout: 'centered',
  },
  args: {
    value: 'Click to edit this text. Double-click or press the edit button to enter editing mode.',
  },
  argTypes: {
    value: { control: 'text' },
    onChange: { action: 'changed' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [content, setContent] = useState(args.value as string)
    return (
      <div className="max-w-md">
        <InlineEditor 
          {...args} 
          value={content} 
          onChange={(val) => {
            setContent(val)
            args.onChange?.(val)
          }} 
        />
      </div>
    )
  },
}
