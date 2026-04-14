import { KeyboardShortcutExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const shortcutProps = [
  { name: 'keys (ShortcutBadge)', type: 'string[]', description: 'Array of key labels to display.' },
  { name: 'keys (KeyboardShortcut)', type: 'string[]', description: 'Keys to listen for.' },
  { name: 'onTrigger (KeyboardShortcut)', type: '() => void', description: 'Callback when shortcut is pressed.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { KeyboardShortcut, ShortcutBadge } from '@refraction-ui/react-keyboard-shortcut'
export function MyComponent() {
  return (
    <div>
      <ShortcutBadge keys={['Cmd', 'K']} />
      <KeyboardShortcut keys={['Meta', 'k']} onTrigger={() => console.log('triggered')} />
    </div>
  )
}`
export default function KeyboardShortcutPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Keyboard Shortcut</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Display keyboard shortcut badges and listen for key combinations.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/keyboard-shortcut</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Keyboard shortcut badges with key combinations.</p>
        <KeyboardShortcutExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-keyboard-shortcut" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={shortcutProps} /></section>
    </div>
  )
}
