import { TerminalExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const terminalProps = [
  {
    name: 'lines',
    type: 'TerminalLine[]',
    description:
      'Lines to render in order. Each line has `{ id?, kind, text }`. The `kind` field (`command` | `stdout` | `stderr` | `info` | `success`) drives styling.',
  },
  {
    name: 'promptSymbol',
    type: 'string',
    default: "'$'",
    description: 'Prompt character(s) prepended to `command` lines, e.g. `$` or `❯`.',
  },
  {
    name: 'maxHeight',
    type: "'sm' | 'md' | 'lg' | 'none'",
    default: "'md'",
    description: 'Maximum height of the scroll region before the panel becomes scrollable.',
  },
  {
    name: 'aria-label',
    type: 'string',
    description: 'Accessible label for the live region (e.g. `"Run output"`).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the container.',
  },
]

const usageCode = `import { Terminal } from '@refraction-ui/react'
import type { TerminalLine } from '@refraction-ui/react'

const lines: TerminalLine[] = [
  { kind: 'command', text: 'python solution.py' },
  { kind: 'stdout',  text: 'Processing...' },
  { kind: 'success', text: 'All tests passed (3/3)' },
]

export function RunOutput() {
  return <Terminal lines={lines} aria-label="Run output" />
}`

export default function TerminalPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terminal</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A read-only output console panel for displaying program run output — commands,
          stdout, stderr, informational summaries, and success / failure lines — in a
          monospaced, scrollable live region.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic run output</h2>
        <p className="text-sm text-muted-foreground">
          A successful run: command, stdout, and a passing summary line. The prompt symbol
          ({' '}
          <code className="text-xs bg-muted px-1 rounded">$</code>) is rendered automatically
          on <code className="text-xs bg-muted px-1 rounded">command</code> lines.
        </p>
        <TerminalExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Error output</h2>
        <p className="text-sm text-muted-foreground">
          Stderr lines use the{' '}
          <code className="text-xs bg-muted px-1 rounded">text-destructive</code> token;
          info lines are muted to de-emphasise the summary.
        </p>
        <TerminalExamples section="error" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Mixed output</h2>
        <p className="text-sm text-muted-foreground">
          Real-world output is often mixed. Pass a custom{' '}
          <code className="text-xs bg-muted px-1 rounded">promptSymbol</code> (e.g.{' '}
          <code className="text-xs bg-muted px-1 rounded">❯</code>) to match your shell theme.
        </p>
        <TerminalExamples section="mixed" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation: use Terminal.astro from @refraction-ui/astro-terminal -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={terminalProps} />
      </section>
    </div>
  )
}
