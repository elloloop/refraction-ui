import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { LanguageSelector } from '@refraction-ui/react-language-selector'

const meta: Meta<typeof LanguageSelector> = {
  title: 'Components/LanguageSelector',
  component: LanguageSelector,
  args: {
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'ja', label: 'Japanese' },
    ],
  },
  argTypes: {
    options: { control: 'object' },
    onValueChange: { action: 'value changed' },
  },
}
export default meta

type Story = StoryObj<typeof LanguageSelector>

export const Default: Story = {
  render: (args) => {
    const [lang, setLang] = useState('en')
    return (
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground font-medium">Single Select</span>
        <LanguageSelector
          {...args}
          value={args.value ?? lang}
          onValueChange={(v) => {
            setLang(v as string)
            args.onValueChange?.(v)
          }}
        />
      </div>
    )
  },
}