'use client'

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

interface ComboboxExamplesProps {
  section: 'options' | 'composed'
}

const frameworks: ComboboxOption[] = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'svelte', label: 'SvelteKit' },
  { value: 'solid', label: 'SolidStart', disabled: true },
]

export function ComboboxExamples({ section }: ComboboxExamplesProps) {
  const [value, setValue] = useState<string>()

  if (section === 'options') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs space-y-3">
          {/* With the `options` prop and no ComboboxContent children, the
              content auto-renders the input, the mapped items, and the
              empty state — passing explicit children would override that. */}
          <Combobox options={frameworks} value={value} onValueChange={setValue}>
            <ComboboxTrigger placeholder="Select a framework..." />
            <ComboboxContent />
          </Combobox>
          <p className="text-xs text-muted-foreground">
            Selected: <code className="bg-muted px-1 rounded">{value ?? 'none'}</code>
          </p>
        </div>
      </div>
    )
  }

  if (section === 'composed') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-xs">
          <Combobox defaultValue="remix">
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
      </div>
    )
  }

  return null
}
