import { DiffViewerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const diffViewerProps = [
  {
    name: 'files',
    type: 'DiffFile[]',
    description:
      'Files in the diff. Each `DiffFile` has `path`, `status` (`added` | `modified` | `deleted` | `renamed`), `additions`, and `deletions`.',
  },
  {
    name: 'original',
    type: 'string',
    default: "''",
    description: 'Original file content shown on the left side.',
  },
  {
    name: 'modified',
    type: 'string',
    default: "''",
    description: 'Modified file content shown on the right side.',
  },
  {
    name: 'language',
    type: 'string',
    description: 'Syntax-highlighting language. Auto-detected from the active file path when omitted.',
  },
  {
    name: 'viewMode',
    type: "'side-by-side' | 'inline'",
    default: "'side-by-side'",
    description: 'Side-by-side or unified inline diff layout.',
  },
  {
    name: 'theme',
    type: "'light' | 'dark'",
    default: "'dark'",
    description: 'Color theme for the chrome (sidebar, tabs, status bar).',
  },
  {
    name: 'monacoTheme',
    type: 'string',
    default: "'vs-dark'",
    description: 'Monaco editor theme name (e.g. `vs`, `vs-dark`).',
  },
  {
    name: 'showSidebar',
    type: 'boolean',
    default: 'true',
    description: 'Show the file list sidebar.',
  },
  {
    name: 'showTabs',
    type: 'boolean',
    default: 'true',
    description: 'Show the file tab bar.',
  },
  {
    name: 'showStatusBar',
    type: 'boolean',
    default: 'true',
    description: 'Show the bottom status bar.',
  },
  {
    name: 'onFileSelect',
    type: '(index: number) => void',
    description: 'Called when the active file changes.',
  },
  {
    name: 'onViewModeChange',
    type: '(mode: DiffViewMode) => void',
    description: 'Called when the view mode changes.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { DiffViewer, type DiffFile } from '@refraction-ui/react-diff-viewer'

const files: DiffFile[] = [
  { path: 'src/greet.ts', status: 'modified', additions: 2, deletions: 2 },
]

export function MyComponent() {
  return (
    <div style={{ height: 360 }}>
      <DiffViewer
        files={files}
        original={"export function greet(name) {}"}
        modified={"export function greet(name: string) {}"}
        statusBarTitle="feature/typed-greeting"
      />
    </div>
  )
}`

export default function DiffViewerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Diff Viewer</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          A Monaco-powered side-by-side and inline diff viewer with a file sidebar, tab bar, and status
          bar. Built on the headless{' '}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">@refraction-ui/diff-viewer</code>{' '}
          core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Side by side</h2>
        <p className="text-sm text-muted-foreground">
          The default layout renders the original and modified content next to each other, with a file
          sidebar and per-file add/delete counts.
        </p>
        <DiffViewerExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-diff-viewer" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Inline view</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1 text-xs">viewMode=&quot;inline&quot;</code> for a unified
          diff. The sidebar and tabs can be hidden independently.
        </p>
        <DiffViewerExamples section="inline" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Light theme</h2>
        <p className="text-sm text-muted-foreground">
          Pair <code className="rounded bg-muted px-1 text-xs">theme=&quot;light&quot;</code> with a light Monaco
          theme such as <code className="rounded bg-muted px-1 text-xs">monacoTheme=&quot;vs&quot;</code>.
        </p>
        <DiffViewerExamples section="themes" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={diffViewerProps} />
      </section>
    </div>
  )
}
