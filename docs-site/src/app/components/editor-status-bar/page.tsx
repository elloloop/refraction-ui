import { EditorStatusBarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const editorStatusBarProps = [
  {
    name: 'segments',
    type: 'StatusSegment[]',
    description:
      'Explicit segments for full control. When provided, all convenience props are ignored. Each segment: `{ id, label, align?: "left"|"right", tone?: "default"|"muted"|"accent" }`.',
  },
  {
    name: 'line',
    type: 'number',
    description: 'Current line number (1-indexed). Combined with `col` to show "Ln N, Col N".',
  },
  {
    name: 'col',
    type: 'number',
    description: 'Current column number (1-indexed). Combined with `line` to show cursor position.',
  },
  {
    name: 'indentation',
    type: 'string',
    description: 'Indentation descriptor shown on the left, e.g. `"Spaces: 4"` or `"Tab Size: 2"`.',
  },
  {
    name: 'language',
    type: 'string',
    description: 'Language / runtime label shown on the right, e.g. `"Python 3.11.4"`.',
  },
  {
    name: 'encoding',
    type: 'string',
    description: 'File encoding shown on the right, e.g. `"UTF-8"`.',
  },
  {
    name: 'eol',
    type: 'string',
    description: 'End-of-line sequence shown on the right, e.g. `"LF"` or `"CRLF"`.',
  },
  {
    name: 'status',
    type: 'string',
    description: 'Persistence status label shown on the right, e.g. `"Auto-saved"`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the bar.',
  },
]

const usageCode = `import { EditorStatusBar } from '@refraction-ui/react'

export function MyEditor() {
  return (
    <div>
      {/* ... editor content ... */}
      <EditorStatusBar
        line={17}
        col={1}
        indentation="Spaces: 4"
        language="Python 3.11.4"
        encoding="UTF-8"
        eol="LF"
        status="Auto-saved"
      />
    </div>
  )
}`

const customSegmentsCode = `import { EditorStatusBar } from '@refraction-ui/react'

export function MyEditor() {
  return (
    <EditorStatusBar
      segments={[
        { id: 'branch', label: 'main', align: 'left', tone: 'accent' },
        { id: 'errors', label: '0 errors', align: 'left', tone: 'muted' },
        { id: 'lang', label: 'TypeScript', align: 'right', tone: 'accent' },
      ]}
    />
  )
}`

export default function EditorStatusBarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Editor Status Bar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An IDE-style bottom bar displaying cursor position, language, encoding,
          and other editor metadata. Accepts convenience props for the most common
          segments or a fully custom segment list.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">From convenience props</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">line</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">col</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">language</code>, and friends — the bar
          assembles them into left/right groups automatically.
        </p>
        <EditorStatusBarExamples section="convenience" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom segments</h2>
        <p className="text-sm text-muted-foreground">
          Pass an explicit{' '}
          <code className="text-xs bg-muted px-1 rounded">segments</code> array to take full
          control over which items appear and where. Each segment carries an{' '}
          <code className="text-xs bg-muted px-1 rounded">align</code> and an optional{' '}
          <code className="text-xs bg-muted px-1 rounded">tone</code>.
        </p>
        <EditorStatusBarExamples section="custom-segments" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Minimal</h2>
        <p className="text-sm text-muted-foreground">
          Cursor position only — the smallest meaningful status bar.
        </p>
        <EditorStatusBarExamples section="minimal" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock
          frameworks={{
            react: usageCode,
            astro: '<!-- Astro implementation pending -->',
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom segments usage</h2>
        <CodeBlock
          frameworks={{
            react: customSegmentsCode,
            astro: '<!-- Astro implementation pending -->',
          }}
        />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={editorStatusBarProps} />
      </section>
    </div>
  )
}
