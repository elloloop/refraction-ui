import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { CodeEditor } from '@refraction-ui/react-code-editor'

const meta: Meta<typeof CodeEditor> = {
  title: 'Editors & IDE/CodeEditor',
  component: CodeEditor,
  argTypes: {
    language: { control: 'text' },
  },
  args: {
    language: 'javascript',
  },
}
export default meta

type Story = StoryObj<typeof CodeEditor>

const CodeEditorWrapper = (args: any) => {
  const [code, setCode] = useState('function hello() {\n  console.log("Hello, World!")\n}')
  return <CodeEditor {...args} value={code} onChange={setCode} />
}

export const Basic: Story = {
  render: (args) => (
    <div className="max-w-lg">
      <CodeEditorWrapper {...args} />
    </div>
  ),
}
