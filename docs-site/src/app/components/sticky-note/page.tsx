import { StickyNoteExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const stickyNoteProps = [
  {
    name: 'color',
    type: "'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange'",
    default: "'yellow'",
    description: 'Color palette for the sticky note background and text.',
  },
  {
    name: 'text',
    type: 'string',
    description: 'Text content of the note. When combined with onTextChange, renders an editable textarea.',
  },
  {
    name: 'onTextChange',
    type: '(value: string) => void',
    description: 'Called when the text changes. Providing this prop makes the note editable.',
  },
  {
    name: 'author',
    type: 'string',
    description: 'Optional author name shown in the note footer as a chip.',
  },
  {
    name: 'x',
    type: 'number',
    description: 'Absolute x position in pixels. Used with y for board/canvas placement.',
  },
  {
    name: 'y',
    type: 'number',
    description: 'Absolute y position in pixels. Used with x for board/canvas placement.',
  },
  {
    name: 'draggable',
    type: 'boolean',
    default: 'false',
    description: 'Whether the note can be dragged. Requires onMove to receive position updates.',
  },
  {
    name: 'onMove',
    type: '(position: { x: number; y: number }) => void',
    description: 'Called with the new position after a drag operation completes.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { StickyNote } from '@refraction-ui/react'

export function MyBoard() {
  const [text, setText] = React.useState('Ideas here…')

  return (
    <StickyNote
      color="yellow"
      text={text}
      onTextChange={setText}
      author="Alice"
    />
  )
}`

export default function StickyNotePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sticky Note</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A draggable colored note for whiteboard and canvas surfaces. Supports six
          soft-tint colors, editable text, author attribution, and absolute positioning
          for use in free-form board layouts.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Colors</h2>
        <p className="text-sm text-muted-foreground">
          Six built-in color palettes, each with a soft background tint and a readable
          dark text. Use{' '}
          <code className="text-xs bg-muted px-1 rounded">nextStickyColor</code> from the
          headless core to cycle through them automatically.
        </p>
        <StickyNoteExamples section="colors" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Editable</h2>
        <p className="text-sm text-muted-foreground">
          Provide <code className="text-xs bg-muted px-1 rounded">onTextChange</code> to
          render an editable textarea inside the note. Combine with{' '}
          <code className="text-xs bg-muted px-1 rounded">author</code> to show a footer chip.
        </p>
        <StickyNoteExamples section="editable" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Positioned on a board</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">x</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">y</code> to absolutely position notes
          on a canvas. Add <code className="text-xs bg-muted px-1 rounded">draggable</code> +{' '}
          <code className="text-xs bg-muted px-1 rounded">onMove</code> to enable drag-to-reposition.
        </p>
        <StickyNoteExamples section="board" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={stickyNoteProps} />
      </section>
    </div>
  )
}
