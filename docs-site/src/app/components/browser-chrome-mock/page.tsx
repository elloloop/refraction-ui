import { BrowserChromeMockExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const browserChromeMockProps = [
  {
    name: 'url',
    type: 'string',
    description:
      'URL displayed in the address bar. The domain (up to the first /) is rendered bold; the path follows in normal weight.',
  },
  {
    name: 'status',
    type: "'live' | 'rec'",
    description:
      'Optional status badge shown in the chrome bar. live renders an emerald tint; rec renders a destructive tint with a pulsing dot.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Content rendered inside the browser content area.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the outer frame.',
  },
]

const usageCode = `import { BrowserChromeMock } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <BrowserChromeMock url="loopwyse.com/r/7k2f" status="live">
      <img src="/screenshot.png" alt="App screenshot" />
    </BrowserChromeMock>
  )
}`

export default function BrowserChromeMockPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browser Chrome Mock</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A decorative browser window frame that wraps arbitrary content with
          traffic-light dots, a monospace URL bar with a bold domain, and an
          optional live / rec status badge — useful for product screenshots,
          demos, and onboarding flows.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Wrap any content with a URL to render a minimal browser frame.
        </p>
        <BrowserChromeMockExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Live status</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">status="live"</code> to
          show an emerald badge indicating an active session.
        </p>
        <BrowserChromeMockExamples section="live" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Rec status</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">status="rec"</code> to
          show a destructive badge with a pulsing dot indicating a recording in progress.
        </p>
        <BrowserChromeMockExamples section="rec" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={browserChromeMockProps} />
      </section>
    </div>
  )
}
