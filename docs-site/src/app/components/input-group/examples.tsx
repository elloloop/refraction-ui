'use client'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
} from '@refraction-ui/react-input-group'

// The InputGroup primitives wrap any input. The docs use a plain styled
// <input> so the example stays self-contained; in an app you'd drop in your
// own Input component.
const inputClass =
  'flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground'

interface InputGroupExamplesProps {
  section: 'addons' | 'buttons' | 'vertical'
}

export function InputGroupExamples({ section }: InputGroupExamplesProps) {
  if (section === 'addons') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex max-w-sm flex-col gap-4">
          <InputGroup>
            <InputGroupText>$</InputGroupText>
            <input className={inputClass} placeholder="0.00" inputMode="decimal" />
            <InputGroupText>USD</InputGroupText>
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>@</InputGroupAddon>
            <input className={inputClass} placeholder="username" />
          </InputGroup>

          <InputGroup>
            <InputGroupText>https://</InputGroupText>
            <input className={inputClass} placeholder="example.com" />
          </InputGroup>
        </div>
      </div>
    )
  }

  if (section === 'buttons') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex max-w-sm flex-col gap-4">
          <InputGroup>
            <input className={inputClass} placeholder="Search…" type="search" />
            <InputGroupButton onClick={() => alert('Searching!')}>Search</InputGroupButton>
          </InputGroup>

          <InputGroup>
            <input className={inputClass} placeholder="you@example.com" type="email" />
            <InputGroupButton>Subscribe</InputGroupButton>
          </InputGroup>
        </div>
      </div>
    )
  }

  if (section === 'vertical') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <InputGroup orientation="vertical" className="max-w-sm">
          <input className={inputClass} placeholder="First name" />
          <input className={inputClass} placeholder="Last name" />
          <InputGroupButton orientation="vertical">Save</InputGroupButton>
        </InputGroup>
      </div>
    )
  }

  return null
}
