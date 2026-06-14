import type { Meta, StoryObj } from '@storybook/react'
import {
  CodeBlock as RuiCodeBlock,
  CodeBlockHeader,
  CodeBlockContent,
} from '@refraction-ui/react-code-block'

const meta: Meta<typeof RuiCodeBlock> = {
  title: 'Components/CodeBlock',
  component: RuiCodeBlock,
  args: {},
}
export default meta

type Story = StoryObj<typeof RuiCodeBlock>

const snippet = `function greet(name) {
  return \`Hello, \${name}!\`
}

greet('world')`

export const Basic: Story = {
  render: (args) => (
    <RuiCodeBlock {...args}>
      <CodeBlockContent>{snippet}</CodeBlockContent>
    </RuiCodeBlock>
  ),
}

export const WithHeader: Story = {
  render: (args) => (
    <RuiCodeBlock {...args}>
      <CodeBlockHeader>
        <span className="text-xs font-medium text-muted-foreground">greet.js</span>
        <span className="text-xs text-muted-foreground">JavaScript</span>
      </CodeBlockHeader>
      <CodeBlockContent>{snippet}</CodeBlockContent>
    </RuiCodeBlock>
  ),
}
