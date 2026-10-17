'use client'

import * as React from 'react'
import { Field } from '@refraction-ui/react-field'
import { Input } from '@refraction-ui/react-input'
import { Checkbox } from '@refraction-ui/react-checkbox'
import { Switch } from '@refraction-ui/react-switch'
import { NativeSelect } from '@refraction-ui/react-native-select'
import { Button } from '@refraction-ui/react-button'

interface FieldExamplesProps {
  section: 'stacked' | 'inline' | 'row' | 'nested'
}

export function FieldExamples({ section }: FieldExamplesProps) {
  if (section === 'stacked') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-sm space-y-5">
          <Field label="Email" hint="We only use it to send sign-in links.">
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field label="Display name">
            <Input placeholder="Ada Lovelace" />
          </Field>
        </div>
      </div>
    )
  }

  if (section === 'inline') {
    return <InlineExample />
  }

  if (section === 'row') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Search" labelTone="eyebrow" grow>
            <Input size="sm" placeholder="Name or email" />
          </Field>
          <Field label="Status" labelTone="eyebrow">
            <NativeSelect size="sm" defaultValue="active">
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="suspended">Suspended</option>
            </NativeSelect>
          </Field>
          <Button size="sm" variant="outline">
            Apply
          </Button>
        </div>
      </div>
    )
  }

  if (section === 'nested') {
    return <NestedExample />
  }

  return null
}

function InlineExample() {
  const [archived, setArchived] = React.useState<boolean | 'indeterminate'>(false)
  const [digest, setDigest] = React.useState(true)
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="flex flex-col gap-4">
        <Field label="Show archived projects" layout="inline">
          <Checkbox checked={archived} onCheckedChange={setArchived} />
        </Field>
        <Field
          label="Weekly digest"
          layout="inline"
          hint="A summary of activity, every Monday morning."
        >
          <Switch checked={digest} onCheckedChange={setDigest} />
        </Field>
      </div>
    </div>
  )
}

function NestedExample() {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="max-w-sm">
        <Field label="Password" hint="At least 12 characters.">
          {(control) => (
            <div className="flex gap-2">
              <Input type={visible ? 'text' : 'password'} {...control} />
              <Button
                type="button"
                variant="outline"
                aria-pressed={visible}
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? 'Hide' : 'Show'}
              </Button>
            </div>
          )}
        </Field>
      </div>
    </div>
  )
}
