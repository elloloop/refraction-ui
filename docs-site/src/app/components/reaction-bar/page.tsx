import { ReactionBarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const reactionProps = [
  { name: 'reactions', type: 'Reaction[]', description: 'Array of { emoji, count, userReacted, label?, reactors? }. label names the reaction for screen readers (defaults to the emoji); reactors lists who reacted, shown on hover and keyboard focus.' },
  { name: 'onToggle', type: '(emoji: string) => void', description: 'Callback when a reaction is toggled.' },
  { name: 'onAddReaction', type: '(trigger: HTMLButtonElement) => void', description: 'Called when the add button is pressed, with the button itself so a picker can anchor to it and return focus to it. The add button renders only when this is given.' },
  { name: 'showAddButton', type: 'boolean', default: 'true', description: 'Hide the add button even when onAddReaction is given.' },
  { name: 'maxVisible', type: 'number', description: 'Reactions shown before a "+N" button that expands the bar in place.' },
  { name: 'strings', type: 'Partial<ReactionBarStrings>', description: 'Overrides for every user-facing string: group label, add label, overflow text and labels, each pill\'s name and the who-reacted sentence.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { ReactionBar } from '@refraction-ui/react'
export function MyComponent() {
  return (
    <ReactionBar
      reactions={[
        { emoji: '👍', label: 'Agree', count: 2, userReacted: false, reactors: ['Ana', 'Sam'] },
      ]}
      maxVisible={5}
      onToggle={(emoji) => console.log(emoji)}
      onAddReaction={(trigger) => openEmojiPicker(trigger)}
    />
  )
}`
const astroUsageCode = `---
import { ReactionBar } from '@refraction-ui/astro'
---
<ReactionBar
  id="message-reactions"
  reactions={[
    { emoji: '👍', label: 'Agree', count: 2, userReacted: false, reactors: ['Ana', 'Sam'] },
  ]}
  maxVisible={5}
/>
<script>
  const bar = document.getElementById('message-reactions')
  // detail: { emoji, userReacted, count }
  bar?.addEventListener('rfr-reaction-toggle', (event) => console.log(event.detail))
  // detail: { trigger }, the add button, to anchor a picker
  bar?.addEventListener('rfr-reaction-add', (event) => console.log(event.detail.trigger))
</script>`
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
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click reactions to toggle them.</p>
        <ReactionBarExamples section="basic" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Who reacted, overflow and a picker</h2>
        <p className="text-sm text-muted-foreground">
          Hover or Tab to a reaction to see who reacted; Escape dismisses it. Past three reactions a
          &quot;+N&quot; button expands the bar. The add button hands itself to your picker, here an
          EmojiPicker, which returns focus to it on choice or Escape.
        </p>
        <ReactionBarExamples section="work-chat" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={reactionProps} /></section>
    </div>
  )
}
