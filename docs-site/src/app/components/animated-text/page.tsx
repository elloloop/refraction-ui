import { AnimatedTextExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const animatedTextProps = [
  { name: 'words (AnimatedText)', type: 'string[]', description: 'Array of words to cycle through.' },
  { name: 'text (TypewriterText)', type: 'string', description: 'Text to type out character by character.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { AnimatedText, TypewriterText } from '@refraction-ui/react-animated-text'
export function MyComponent() {
  return (
    <div>
      <AnimatedText words={['fast', 'beautiful', 'accessible']} />
      <TypewriterText text="Hello, World!" />
    </div>
  )
}`
export default function AnimatedTextPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Animated Text</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Word carousel and typewriter text animation components.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/animated-text</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Word carousel rotates words; typewriter types character by character.</p>
        <AnimatedTextExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={animatedTextProps} /></section>
    </div>
  )
}
