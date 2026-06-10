import { CommandInputExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const commandInputProps = [
  {
    name: 'value',
    type: 'string',
    default: "''",
    description: 'Current text content of the input.',
  },
  {
    name: 'onChange',
    type: '(value: string) => void',
    description: 'Called with the raw text whenever the content changes.',
  },
  {
    name: 'triggers',
    type: 'Trigger[]',
    default: '[]',
    description:
      'Characters that open the command popover, e.g. `[{ char: "@" }, { char: "/" }]`. Each trigger may also carry an optional `pattern` RegExp.',
  },
  {
    name: 'renderPopover',
    type: '(props: { isOpen, trigger, search, close, position }) => ReactNode',
    description:
      'Render prop for the popover shown after a trigger fires. Receives the active trigger char, current search query, a `close()` callback, and caret position.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the wrapper.',
  },
]

const usageCode = `import { CommandInput } from '@refraction-ui/react-command-input'
import { useState } from 'react'

export function MentionField() {
  const [value, setValue] = useState('')
  return (
    <CommandInput
      value={value}
      onChange={setValue}
      triggers={[{ char: '@' }]}
      renderPopover={({ isOpen, trigger, search }) =>
        isOpen ? <div>Mentioning {trigger} {search}</div> : null
      }
    />
  )
}`

export default function CommandInputPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Input</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A contenteditable text field that detects trigger characters (like{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@</code> or{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">/</code>) and surfaces a
          popover for mentions, slash-commands, and autocomplete. Rendering of the popover is fully
          delegated via a render prop.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Mentions</h2>
        <p className="text-sm text-muted-foreground">
          A single <code className="text-xs bg-muted px-1 rounded">@</code> trigger drives a mention popover.
        </p>
        <CommandInputExamples section="mentions" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Multiple triggers</h2>
        <p className="text-sm text-muted-foreground">
          Register any number of triggers — the active <code className="text-xs bg-muted px-1 rounded">trigger</code> char
          is passed to <code className="text-xs bg-muted px-1 rounded">renderPopover</code> so you can branch on it.
        </p>
        <CommandInputExamples section="commands" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-command-input" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={commandInputProps} />
      </section>
    </div>
  )
}
