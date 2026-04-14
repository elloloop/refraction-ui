import { EmojiPickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const emojiProps = [
  { name: 'onSelect', type: '(emoji: string) => void', description: 'Callback when an emoji is selected.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { EmojiPicker } from '@refraction-ui/react-emoji-picker'
export function MyComponent() {
  return <EmojiPicker onSelect={(emoji) => console.log(emoji)} />
}`
export default function EmojiPickerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Emoji Picker</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An emoji picker with categories, search, and click-to-select.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/emoji-picker</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Browse categories and click an emoji to select it.</p>
        <EmojiPickerExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-emoji-picker" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={emojiProps} /></section>
    </div>
  )
}
