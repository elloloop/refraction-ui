'use client'

import { PasswordInput } from '@refraction-ui/react-password-input'
import { Input } from '@refraction-ui/react-input'

interface PasswordInputExamplesProps {
  section: 'basic' | 'validation' | 'reveal'
}

export function PasswordInputExamples({ section }: PasswordInputExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium text-foreground">Password</label>
          <PasswordInput placeholder="Enter password" />
          <p className="text-xs text-muted-foreground">
            A password field with a built-in show/hide toggle.
          </p>
        </div>
      </div>
    )
  }

  if (section === 'validation') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Valid</label>
            <PasswordInput validationState="valid" defaultValue="correct-horse" />
            <p className="text-xs text-muted-foreground">Green tint and a check icon signal a passing field.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-destructive">Invalid</label>
            <PasswordInput validationState="invalid" minLength={8} defaultValue="short" />
            <p className="text-xs text-destructive/80">Destructive tint signals a validation error.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Plain Input with validationState</label>
            <Input validationState="valid" defaultValue="name@example.com" type="email" />
            <p className="text-xs text-muted-foreground">
              The same <code className="font-mono">validationState</code> affordance is available on the base Input.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (section === 'reveal') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium text-foreground">Custom labels</label>
          <PasswordInput
            placeholder="Enter password"
            revealLabel="Reveal password"
            hideLabel="Conceal password"
          />
          <p className="text-xs text-muted-foreground">
            The toggle button is keyboard accessible and exposes its state via{' '}
            <code className="font-mono">aria-pressed</code>. Labels are customizable.
          </p>
        </div>
      </div>
    )
  }

  return null
}
