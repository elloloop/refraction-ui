import { SocialAuthButtonExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const socialAuthButtonProps = [
  {
    name: 'provider',
    type: "'google' | 'github' | 'microsoft' | 'apple'",
    description: 'Identity provider this button authenticates against. Determines the brand icon and label.',
  },
  {
    name: 'lastUsed',
    type: 'boolean',
    default: 'false',
    description: 'Renders a floating "Last used" badge marking the provider the user signed in with last.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner and disables interaction.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the button.',
  },
  {
    name: 'onClick',
    type: '(e: MouseEvent) => void',
    description: 'Click handler — start the OAuth flow here. Button props pass through.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the underlying button.',
  },
]

const socialAuthRowProps = [
  {
    name: 'children',
    type: 'ReactNode',
    description: 'SocialAuthButton elements to lay out.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the grid container.',
  },
]

const usageCode = `import {
  SocialAuthButton,
  SocialAuthRow,
} from '@refraction-ui/react-social-auth-button'

export function SignIn() {
  return (
    <SocialAuthRow>
      <SocialAuthButton provider="google" lastUsed onClick={signInWithGoogle} />
      <SocialAuthButton provider="github" onClick={signInWithGitHub} />
      <SocialAuthButton provider="microsoft" onClick={signInWithMicrosoft} />
      <SocialAuthButton provider="apple" onClick={signInWithApple} />
    </SocialAuthRow>
  )
}`

export default function SocialAuthButtonPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Social Auth Button</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Branded social sign-in buttons for Google, GitHub, Microsoft, and Apple,
          with a responsive row layout. Built on the outline{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Button</code>.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          One button per provider, each with its brand icon and a &quot;Continue with …&quot; label.
        </p>
        <SocialAuthButtonExamples section="basic" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-social-auth-button" />
      </section>

      {/* Usage */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">
          Loading swaps the brand icon for a spinner and disables interaction. Disabled greys out the button.
        </p>
        <SocialAuthButtonExamples section="states" />
      </section>

      {/* Last used */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Last used</h2>
        <p className="text-sm text-muted-foreground">
          Highlight the provider the returning user signed in with last using a floating badge.
        </p>
        <SocialAuthButtonExamples section="last-used" />
      </section>

      {/* Row */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Row</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">SocialAuthRow</code> lays buttons out in a
          single column on mobile and two columns from the <code className="text-xs bg-muted px-1 rounded">sm</code> breakpoint up.
        </p>
        <SocialAuthButtonExamples section="row" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          <code className="text-base">SocialAuthButton</code> props
        </h2>
        <PropsTable props={socialAuthButtonProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          <code className="text-base">SocialAuthRow</code> props
        </h2>
        <PropsTable props={socialAuthRowProps} />
      </section>
    </div>
  )
}
