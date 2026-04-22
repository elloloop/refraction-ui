import { BottomNavExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const bottomNavProps = [
  { name: 'tabs', type: 'NavTab[]', description: 'Array of { label, href, icon?, activeIcon? } tabs.' },
  { name: 'currentPath', type: 'string', description: 'Current pathname for active tab highlighting.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { BottomNav } from '@refraction-ui/react-bottom-nav'

export function MyComponent() {
  return (
    <BottomNav
      tabs={[
        { label: 'Home', href: '/' },
        { label: 'Search', href: '/search' },
        { label: 'Profile', href: '/profile' },
      ]}
      currentPath="/"
    />
  )
}`

const angularUsageCode = `import { Component } from '@angular/core';
import { BottomNavComponent } from '@refraction-ui/angular-bottom-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BottomNavComponent],
  template: \`
    <re-bottom-nav
      [tabs]="[
        { label: 'Home', href: '/' },
        { label: 'Search', href: '/search' },
        { label: 'Profile', href: '/profile' }
      ]"
      currentPath="/"
    ></re-bottom-nav>
  \`
})
export class AppComponent {}`

export default function BottomNavPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bottom Nav</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A mobile tab bar fixed to the bottom of the viewport. Shows active state and supports icon tabs.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/bottom-nav</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">A bottom navigation bar with tab items and active state.</p>
        <BottomNavExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-bottom-nav" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: angularUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={bottomNavProps} />
      </section>
    </div>
  )
}
