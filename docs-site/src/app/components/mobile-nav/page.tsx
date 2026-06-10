import { MobileNavExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const mobileNavProps = [
  {
    name: 'open',
    type: 'boolean',
    description: 'Controlled open state. Pair with onOpenChange.',
  },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called when the open state should change (trigger click, Escape key).',
  },
  {
    name: 'defaultOpen',
    type: 'boolean',
    default: 'false',
    description: 'Initial open state for uncontrolled usage.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the root <nav>.',
  },
]

const usageCode = `import {
  MobileNav,
  MobileNavTrigger,
  MobileNavContent,
  MobileNavLink,
} from '@refraction-ui/react'

export function MyNav() {
  return (
    <MobileNav>
      <MobileNavTrigger />
      <MobileNavContent>
        <MobileNavLink href="#home">Home</MobileNavLink>
        <MobileNavLink href="#features">Features</MobileNavLink>
        <MobileNavLink href="#pricing">Pricing</MobileNavLink>
      </MobileNavContent>
    </MobileNav>
  )
}`

export default function MobileNavPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mobile Nav</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A compound navigation with a hamburger trigger and a collapsible panel of links. Supports
          controlled and uncontrolled open state with keyboard handling, backed by the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/mobile-nav</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Compose <code className="text-xs bg-muted px-1 rounded">MobileNavTrigger</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">MobileNavContent</code>, and{' '}
          <code className="text-xs bg-muted px-1 rounded">MobileNavLink</code> inside the root{' '}
          <code className="text-xs bg-muted px-1 rounded">MobileNav</code>.
        </p>
        <MobileNavExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-mobile-nav" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled</h2>
        <p className="text-sm text-muted-foreground">
          Drive the open state yourself with{' '}
          <code className="text-xs bg-muted px-1 rounded">open</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">onOpenChange</code> — e.g. to close the menu when a
          link is clicked.
        </p>
        <MobileNavExamples section="controlled" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <p className="text-sm text-muted-foreground">
          Props for the root <code className="text-xs bg-muted px-1 rounded">MobileNav</code>. The compound
          parts (<code className="text-xs bg-muted px-1 rounded">MobileNavTrigger</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">MobileNavContent</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">MobileNavLink</code>) accept their native element
          attributes.
        </p>
        <PropsTable props={mobileNavProps} />
      </section>
    </div>
  )
}
