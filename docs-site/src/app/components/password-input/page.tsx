import { PasswordInputExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const passwordInputProps = [
  { name: 'validationState', type: "'valid' | 'invalid'", description: 'Validation affordance — tints the border and wires aria-invalid.' },
  { name: 'revealLabel', type: 'string', default: "'Show password'", description: 'Accessible label for the reveal (show password) action.' },
  { name: 'hideLabel', type: 'string', default: "'Hide password'", description: 'Accessible label for the hide action.' },
  { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Size of the input.' },
  { name: 'minLength', type: 'number', description: 'Minimum length, forwarded to the underlying input.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input.' },
  { name: 'placeholder', type: 'string', description: 'Placeholder text.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes applied to the input.' },
]

const usageCode = `import { PasswordInput } from '@refraction-ui/react-password-input'

export function SignInForm() {
  return (
    <form className="space-y-4">
      <PasswordInput placeholder="Password" minLength={8} />
      <PasswordInput
        placeholder="Confirm password"
        validationState="invalid"
      />
    </form>
  )
}`

export default function PasswordInputPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Password Input</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A password field with a built-in reveal/hide toggle, layered on the
          styled <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/react-input</code>.
          Supports the same <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">validationState</code> affordance.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">A password input with a show/hide toggle.</p>
        <PasswordInputExamples section="basic" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-password-input" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* Validation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With validation</h2>
        <p className="text-sm text-muted-foreground">
          The <code className="font-mono">validationState</code> prop tints the border and wires{' '}
          <code className="font-mono">aria-invalid</code>. It is shared with the base Input.
        </p>
        <PasswordInputExamples section="validation" />
      </section>

      {/* Reveal toggle */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Reveal toggle</h2>
        <p className="text-sm text-muted-foreground">The toggle is accessible, with customizable labels.</p>
        <PasswordInputExamples section="reveal" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={passwordInputProps} />
      </section>
    </div>
  )
}
