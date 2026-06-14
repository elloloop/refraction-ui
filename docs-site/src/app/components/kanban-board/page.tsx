import { KanbanBoardExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const kanbanBoardProps = [
  {
    name: 'columns',
    type: 'KanbanColumnDef[]',
    description:
      'Column definitions in left-to-right render order. Each def has `id`, `title`, optional `accent` color, and optional `note`.',
  },
  {
    name: 'cards',
    type: 'T[]',
    description: 'All cards to distribute across columns.',
  },
  {
    name: 'getCardColumnId',
    type: '(card: T) => string',
    description: 'Selector returning the column id for a card.',
  },
  {
    name: 'getCardKey',
    type: '(card: T) => string',
    description: 'Selector returning a unique React key for a card.',
  },
  {
    name: 'renderCard',
    type: '(card: T, column: KanbanColumnDef) => ReactNode',
    description: 'Render function for a single card inside a column.',
  },
  {
    name: 'cardCap',
    type: 'number',
    default: '5',
    description:
      'Maximum visible cards per column. Cards beyond the cap are hidden behind a "+N more" button.',
  },
  {
    name: 'onCardClick',
    type: '(card: T) => void',
    description: 'Optional click handler — pass to renderCard as needed.',
  },
  {
    name: 'columnHeader',
    type: '(def: KanbanColumnDef, count: number) => ReactNode',
    description:
      'Override the default column header (icon + title + count badge).',
  },
  {
    name: 'onShowMore',
    type: '(columnId: string) => void',
    description: 'Called when the user clicks "+N more" for a column.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the board container.',
  },
]

const usageCode = `import { KanbanBoard, KanbanCard } from '@refraction-ui/react'
import type { KanbanColumnDef } from '@refraction-ui/react'

const stages: KanbanColumnDef[] = [
  { id: 'applied',  title: 'Applied',       accent: '#6366f1' },
  { id: 'screen',   title: 'Phone Screen',  note: 'Schedule via Calendly' },
  { id: 'offer',    title: 'Offer',         accent: '#22c55e' },
]

const candidates = [
  { id: '1', name: 'Alice Chen',   stageId: 'applied' },
  { id: '2', name: 'Bob Okafor',   stageId: 'screen'  },
  { id: '3', name: 'Carol Rivera', stageId: 'offer'   },
]

export function Pipeline() {
  return (
    <KanbanBoard
      columns={stages}
      cards={candidates}
      getCardColumnId={(c) => c.stageId}
      getCardKey={(c) => c.id}
      renderCard={(c) => (
        <KanbanCard clickable>
          <p className="font-medium">{c.name}</p>
        </KanbanCard>
      )}
      cardCap={5}
    />
  )
}`

export default function KanbanBoardPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Kanban Board</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A generic multi-column stage board. Designed for recruiter pipelines,
          project workflows, and any process with discrete stages — with column
          accents, gate notes, and per-column card overflow.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic board</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">columns</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">cards</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">getCardColumnId</code>, and a{' '}
          <code className="text-xs bg-muted px-1 rounded">renderCard</code> function.
          Cards are distributed into the matching column automatically.
        </p>
        <KanbanBoardExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          With column accents and notes
        </h2>
        <p className="text-sm text-muted-foreground">
          Supply an <code className="text-xs bg-muted px-1 rounded">accent</code> color
          on any column def to draw a thin colored bar below the header.
          A <code className="text-xs bg-muted px-1 rounded">note</code> renders a gate
          description beneath the accent bar.
        </p>
        <KanbanBoardExamples section="accents" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Overflow cap</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">cardCap</code> to limit
          visible cards per column. Cards beyond the cap are hidden behind a{' '}
          <em>+N more</em> button; wire up{' '}
          <code className="text-xs bg-muted px-1 rounded">onShowMore</code> to open a
          drawer or expand the column.
        </p>
        <KanbanBoardExamples section="overflow" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- See packages/astro-kanban-board -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={kanbanBoardProps} />
      </section>
    </div>
  )
}
