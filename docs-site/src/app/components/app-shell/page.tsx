import { AppShellExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const shellProps = [
  { name: 'sidebarWidth', type: 'string', default: "'16rem'", description: 'Width of the sidebar when expanded.' },
  { name: 'sidebarCollapsedWidth', type: 'string', default: "'4rem'", description: 'Width of the sidebar when collapsed.' },
  { name: 'headerHeight', type: 'string', default: "'3.5rem'", description: 'Height of the header.' },
  { name: 'sidebarPosition', type: "'left' | 'right'", default: "'left'", description: 'Position of the sidebar.' },
  { name: 'sidebarCollapsible', type: 'boolean', default: 'true', description: 'Whether the sidebar can be collapsed.' },
  { name: 'sidebarDefaultCollapsed', type: 'boolean', default: 'false', description: 'Whether the sidebar starts collapsed.' },
]

const reactUsage = `import { AppShell } from '@refraction-ui/react-app-shell'

export function MyLayout({ children }) {
  return (
    <AppShell>
      <AppShell.Sidebar>
        {/* Navigation links here */}
      </AppShell.Sidebar>
      <AppShell.Main>
        <AppShell.Header>
          <h1>My App</h1>
        </AppShell.Header>
        <AppShell.Content>
          {children}
        </AppShell.Content>
      </AppShell.Main>
      <AppShell.Overlay />
    </AppShell>
  )
}`

const angularUsage = `@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent, AppShellSidebarComponent, AppShellMainComponent, AppShellHeaderComponent, AppShellContentComponent, AppShellOverlayComponent],
  template: \`
    <re-app-shell [config]="config">
      <re-app-shell-sidebar>
        <nav class="p-4">
          <a href="/">Home</a>
        </nav>
      </re-app-shell-sidebar>
      
      <re-app-shell-main>
        <re-app-shell-header>
          <h1 class="font-bold">Dashboard</h1>
        </re-app-shell-header>
        
        <re-app-shell-content>
          <router-outlet></router-outlet>
        </re-app-shell-content>
      </re-app-shell-main>
      
      <re-app-shell-overlay></re-app-shell-overlay>
    </re-app-shell>
  \`,
})
export class AppComponent {
  config = {
    sidebarWidth: '18rem',
    sidebarDefaultCollapsed: false
  };
}`

export default function AppShellPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">App Shell</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A full-featured application layout system with responsive sidebar, header, and main content areas.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic Layout</h2>
        <p className="text-sm text-muted-foreground">The standard layout with a sidebar on the left and a sticky header.</p>
        <AppShellExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand basePackage="app-shell" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ 
          react: reactUsage, 
          angular: angularUsage,
          astro: '<!-- Astro implementation available via @refraction-ui/astro-app-shell -->' 
        }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sidebar Variations</h2>
        <div className="grid gap-8">
          <div>
            <h3 className="text-sm font-medium mb-3">Collapsed Sidebar</h3>
            <AppShellExamples section="collapsed" />
          </div>
          <div>
            <h3 className="text-sm font-medium mb-3">Right Sidebar Position</h3>
            <AppShellExamples section="right" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Config Props</h2>
        <PropsTable props={shellProps} />
      </section>
    </div>
  )
}
