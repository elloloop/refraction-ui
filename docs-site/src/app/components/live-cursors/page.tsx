import { LiveCursorsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const liveCursorsProps = [
  {
    name: 'cursors',
    type: 'CursorData[]',
    description:
      'Array of collaborator cursor entries. Each entry: `{ id, name, x, y, color? }`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the overlay container.',
  },
]

const cursorProps = [
  {
    name: 'name',
    type: 'string',
    description: 'Collaborator display name shown in the label chip.',
  },
  {
    name: 'x',
    type: 'number',
    description: 'Horizontal position in pixels from the left of the container.',
  },
  {
    name: 'y',
    type: 'number',
    description: 'Vertical position in pixels from the top of the container.',
  },
  {
    name: 'color',
    type: 'string',
    description: 'Hex color applied to the SVG arrow fill and the name label chip background.',
  },
]

const usageCode = `import { LiveCursors } from '@refraction-ui/react'
import type { CursorData } from '@refraction-ui/react'

const cursors: CursorData[] = [
  { id: 'user-1', name: 'Maya',   x: 120, y: 80  },
  { id: 'user-2', name: 'Kwame',  x: 340, y: 210 },
  { id: 'user-3', name: 'Camille', x: 220, y: 150 },
]

export function Whiteboard() {
  return (
    <div className="relative w-full h-full">
      {/* …canvas content… */}
      <LiveCursors cursors={cursors} />
    </div>
  )
}`

export default function LiveCursorsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Live Cursors</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Multiplayer presence cursors with name labels — for collaborative whiteboards,
          shared editors, and real-time surfaces. Each collaborator gets a stable color
          assigned from a fixed palette; cursors are decorative and aria-hidden.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Cursors with labels</h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className="text-xs bg-muted px-1 rounded">cursors</code> array with{' '}
          <code className="text-xs bg-muted px-1 rounded">id</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">name</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">x</code>, and{' '}
          <code className="text-xs bg-muted px-1 rounded">y</code> to render labeled cursors
          at those positions.
        </p>
        <LiveCursorsExamples section="labeled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Color assignment</h2>
        <p className="text-sm text-muted-foreground">
          Colors are assigned deterministically from an 8-entry palette via{' '}
          <code className="text-xs bg-muted px-1 rounded">assignCursorColor(id, index?)</code>.
          Providing an explicit <code className="text-xs bg-muted px-1 rounded">color</code> on
          a cursor entry overrides the palette.
        </p>
        <LiveCursorsExamples section="color-assignment" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">On a canvas</h2>
        <p className="text-sm text-muted-foreground">
          Place <code className="text-xs bg-muted px-1 rounded">{'<LiveCursors />'}</code> as
          a direct child of a <code className="text-xs bg-muted px-1 rounded">position: relative</code>{' '}
          container. It fills via <code className="text-xs bg-muted px-1 rounded">absolute inset-0</code>{' '}
          and is <code className="text-xs bg-muted px-1 rounded">pointer-events-none</code> so it never
          blocks interaction.
        </p>
        <LiveCursorsExamples section="canvas" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">LiveCursors props</h2>
        <PropsTable props={liveCursorsProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Cursor props</h2>
        <PropsTable props={cursorProps} />
      </section>
    </div>
  )
}
