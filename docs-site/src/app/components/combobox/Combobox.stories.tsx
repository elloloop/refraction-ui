import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  type ComboboxOption,
} from '@refraction-ui/react-combobox'

const meta: Meta<typeof Combobox> = {
  title: 'Inputs/Combobox',
  component: Combobox,
  args: {},
}
export default meta

type Story = StoryObj<typeof Combobox>

const frameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'svelte', label: 'SvelteKit' },
  { value: 'solid', label: 'SolidStart', disabled: true },
]

const ComboboxOptionsWrapper = (args: any) => {
  const [value, setValue] = useState<string | undefined>(args.value)
  return (
    <div className="max-w-xs space-y-3">
      <Combobox {...args} value={value} onValueChange={setValue}>
        <ComboboxTrigger placeholder="Select a framework..." />
        <ComboboxContent />
      </Combobox>
      <p className="text-xs text-muted-foreground">
        Selected: <code className="bg-muted px-1 rounded">{value ?? 'none'}</code>
      </p>
    </div>
  )
}

export const OptionsProp: Story = {
  args: {
    options: frameworks,
  },
  render: (args) => <ComboboxOptionsWrapper {...args} />,
}

export const Composed: Story = {
  args: {
    defaultValue: 'remix',
  },
  render: (args) => (
    <div className="max-w-xs">
      <Combobox {...args}>
        <ComboboxTrigger placeholder="Select a framework..." />
        <ComboboxContent>
          <ComboboxInput placeholder="Search..." />
          <ComboboxList>
            <ComboboxItem value="next" label="Next.js">Next.js</ComboboxItem>
            <ComboboxItem value="remix" label="Remix">Remix</ComboboxItem>
            <ComboboxItem value="astro" label="Astro">Astro</ComboboxItem>
          </ComboboxList>
          <ComboboxEmpty>No match.</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  ),
}
