import type { Meta, StoryObj } from '@storybook/react'
import { MarkdownRenderer } from '@refraction-ui/react-markdown-renderer'

const sampleMarkdown = `# Hello World

This is a **markdown** renderer with *italic* and \`inline code\`.

## Features
- Headings
- Lists
- Code blocks
- Bold and italic text

\`\`\`js
const greeting = "Hello!"
console.log(greeting)
\`\`\`
`

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Components/MarkdownRenderer',
  component: MarkdownRenderer,
  args: {
    content: sampleMarkdown,
  },
  argTypes: {
    content: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof MarkdownRenderer>

export const Default: Story = {
  render: (args) => (
    <div className="max-w-lg w-full">
      <MarkdownRenderer {...args} />
    </div>
  ),
}