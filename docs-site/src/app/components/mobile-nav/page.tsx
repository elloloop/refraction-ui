import { MobileNavExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const mobileNavProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Event handler called when open state changes.' },
  { name: 'defaultOpen', type: 'boolean', description: 'Initial open state for uncontrolled usage.' },
]

const usageCode = `import { MobileNav, MobileNavTrigger, MobileNavContent, MobileNavLink } from '@refraction-ui/react-mobile-nav'

export function MyComponent() {
  return (
    <MobileNav>
      <div className="flex items-center justify-between p-4 border-b">
        <span>Logo</span>
        <MobileNavTrigger />
      </div>
      <MobileNavContent>
        <div className="flex flex-col p-4 gap-2">
          <MobileNavLink href="/">Home</MobileNavLink>
          <MobileNavLink href="/about">About</MobileNavLink>
          <MobileNavLink href="/contact">Contact</MobileNavLink>
        </div>
      </MobileNavContent>
    </MobileNav>
  )
}`

const angularUsageCode = `import { Component } from '@angular/core';
import { 
  RefractionMobileNavComponent, 
  RefractionMobileNavTriggerComponent, 
  RefractionMobileNavContentDirective, 
  RefractionMobileNavLinkDirective 
} from '@refraction-ui/angular-mobile-nav';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    RefractionMobileNavComponent, 
    RefractionMobileNavTriggerComponent, 
    RefractionMobileNavContentDirective, 
    RefractionMobileNavLinkDirective
  ],
  template: \`
    <refraction-mobile-nav>
      <div class="flex items-center justify-between p-4 border-b">
        <span>Logo</span>
        <button refractionMobileNavTrigger></button>
      </div>
      <div refractionMobileNavContent>
        <div class="flex flex-col p-4 gap-2">
          <a refractionMobileNavLink href="/">Home</a>
          <a refractionMobileNavLink href="/about">About</a>
          <a refractionMobileNavLink href="/contact">Contact</a>
        </div>
      </div>
    </refraction-mobile-nav>
  \`
})
export class MyComponent {}`

export default function MobileNavPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mobile Nav</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A mobile navigation drawer with a hamburger trigger.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/mobile-nav</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">A basic mobile navigation menu.</p>
        <MobileNavExamples section="basic" />
      </section>
      
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-mobile-nav" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: angularUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={mobileNavProps} />
      </section>
    </div>
  )
}
