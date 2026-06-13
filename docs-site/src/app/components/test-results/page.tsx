import { TestResultsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const testResultsProps = [
  {
    name: 'results',
    type: 'TestResultData[]',
    description: 'Array of test case results to display.',
    required: true,
  },
  {
    name: 'showSummary',
    type: 'boolean',
    default: 'true',
    description: 'When true, renders a summary bar showing "{passed}/{total} passed".',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the container.',
  },
]

const testResultDataProps = [
  {
    name: 'id',
    type: 'string',
    description: 'Unique identifier for the test case.',
    required: true,
  },
  {
    name: 'name',
    type: 'string',
    description: 'Human-readable test name.',
    required: true,
  },
  {
    name: 'status',
    type: "'pass' | 'fail' | 'skip'",
    description: 'Execution status of the test.',
    required: true,
  },
  {
    name: 'durationMs',
    type: 'number',
    description: 'How long the test took to run, in milliseconds.',
  },
  {
    name: 'expected',
    type: 'string',
    description: 'Expected value — shown in the diff block when the test fails.',
  },
  {
    name: 'actual',
    type: 'string',
    description: 'Actual value received — shown in the diff block when the test fails.',
  },
  {
    name: 'message',
    type: 'string',
    description: 'Error message on failure, skip reason, or other annotation.',
  },
]

const usageCode = `import { TestResults } from '@refraction-ui/react'
import type { TestResultData } from '@refraction-ui/react'

const results: TestResultData[] = [
  { id: '1', name: 'adds two numbers', status: 'pass', durationMs: 3 },
  {
    id: '2',
    name: 'handles overflow',
    status: 'fail',
    expected: '0',
    actual: 'Infinity',
    message: 'Expected 0 but received Infinity',
  },
]

export function MyComponent() {
  return <TestResults results={results} />
}`

export default function TestResultsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Test Results</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Displays a list of test case results with pass/fail/skip status indicators,
          optional expected/actual diffs for failures, and a summary bar — designed
          for mock-interview IDEs and CI dashboards.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">All passing</h2>
        <p className="text-sm text-muted-foreground">
          When all tests pass the summary bar and row accents use the success/emerald
          semantic token.
        </p>
        <TestResultsExamples section="all-passing" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With failures</h2>
        <p className="text-sm text-muted-foreground">
          Failed tests show a destructive-token accent and, when{' '}
          <code className="text-xs bg-muted px-1 rounded">expected</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">actual</code> are supplied,
          render a side-by-side diff block beneath the row.
        </p>
        <TestResultsExamples section="with-failures" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With skipped</h2>
        <p className="text-sm text-muted-foreground">
          Skipped tests use the muted semantic token and display an optional{' '}
          <code className="text-xs bg-muted px-1 rounded">message</code> with the
          skip reason.
        </p>
        <TestResultsExamples section="with-skipped" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation available via @refraction-ui/astro-test-results -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">TestResults props</h2>
        <PropsTable props={testResultsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">TestResultData shape</h2>
        <PropsTable props={testResultDataProps} />
      </section>
    </div>
  )
}
