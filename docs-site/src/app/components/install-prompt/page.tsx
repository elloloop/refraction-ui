import { InstallPromptExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const installProps = [
  { name: 'appName', type: 'string', description: 'Application name to display.' },
  { name: 'description', type: 'string', description: 'Description text.' },
  { name: 'onInstall', type: '() => void', description: 'Callback when install is clicked.' },
  { name: 'onDismiss', type: '() => void', description: 'Callback when dismissed.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { InstallPrompt } from '@refraction-ui/react-install-prompt'
export function MyComponent() {
  return (
    <InstallPrompt
      appName="My PWA"
      description="Install for offline access"
      onInstall={() => {}}
      onDismiss={() => {}}
    />
  )
}`
export default function InstallPromptPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Install Prompt</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A PWA install banner prompting users to install the app. Dismissible with install callback.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/install-prompt</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">PWA install banner with install and dismiss actions.</p>
        <InstallPromptExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={installProps} /></section>
    </div>
  )
}
