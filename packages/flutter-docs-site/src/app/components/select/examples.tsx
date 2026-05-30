'use client'

import { useState } from 'react'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@refraction-ui/react-select'

interface SelectExamplesProps {
  section: 'basic' | 'states'
}

export function SelectExamples({ section }: SelectExamplesProps) {
  const [value, setValue] = useState<string | undefined>(undefined)
  const [value2, setValue2] = useState<string>('react')

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-2.5 w-64">
            <span className="text-xs text-muted-foreground font-medium">With Placeholder</span>
            <Select value={value} onValueChange={setValue} placeholder="Choose a fruit...">
              <SelectTrigger>
                {value || 'Choose a fruit...'}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
                <SelectItem value="grape">Grape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2.5 w-64">
            <span className="text-xs text-muted-foreground font-medium">Pre-selected</span>
            <Select value={value2} onValueChange={setValue2}>
              <SelectTrigger>
                {value2}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'states') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex flex-col gap-2.5 w-64">
            <span className="text-xs text-muted-foreground font-medium">Disabled</span>
            <Select disabled placeholder="Disabled select">
              <SelectTrigger>
                Disabled select
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  return null
}
