import { ReactionBarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const reactionProps = [
  { name: 'reactions', type: 'Reaction[]', description: 'Array of { emoji, count, reacted }.' },
  { name: 'onReact', type: '(emoji: string) => void', description: 'Callback when a reaction is toggled.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { ReactionBar } from '@refraction-ui/react-reaction-bar'
export function MyComponent() {
  return (
    <ReactionBar
      reactions={[{ emoji: '👍', count: 5, reacted: false }]}
      onReact={(emoji) => console.log(emoji)}
    />
  )
}`
export default function ReactionBarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reaction Bar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Emoji reaction pills with counts and toggle state. Click to react or unreact.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/reaction-bar</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click reactions to toggle them.</p>
        <ReactionBarExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={reactionProps} /></section>
    </div>
  )
}
