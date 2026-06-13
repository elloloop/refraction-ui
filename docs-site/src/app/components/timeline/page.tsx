import { TimelineExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const timelineProps = [
  {
    name: 'items',
    type: 'TimelineItemData[]',
    description:
      'Ordered list of events. Each item: `{ id, title, time?, description?, status? }`.',
  },
  {
    name: 'orientation',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Layout direction of the timeline rail.',
  },
  {
    name: 'renderItem',
    type: '(item, index, isLast) => React.ReactNode',
    description: 'Optional render-prop to fully customise individual items.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the list element.',
  },
]

const timelineItemDataProps = [
  {
    name: 'id',
    type: 'string',
    description: 'Unique identifier used as the React key.',
  },
  {
    name: 'title',
    type: 'string',
    description: 'Primary label shown beside the marker.',
  },
  {
    name: 'time',
    type: 'string',
    description: 'Optional timestamp / date string rendered above the title.',
  },
  {
    name: 'description',
    type: 'string',
    description: 'Secondary detail text rendered below the title.',
  },
  {
    name: 'status',
    type: "'done' | 'current' | 'upcoming' | 'default'",
    default: "'default'",
    description: 'Visual status that controls the marker colour.',
  },
]

const usageCode = `import { Timeline } from '@refraction-ui/react'

const items = [
  { id: '1', title: 'Stand-up',       time: '9:00 AM',  status: 'done'     },
  { id: '2', title: 'Design review',  time: '10:30 AM', status: 'current'  },
  { id: '3', title: 'Engineering sync', time: '2:00 PM', status: 'upcoming' },
]

export function AgendaWidget() {
  return <Timeline items={items} orientation="vertical" />
}`

export default function TimelinePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Timeline</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A time-ordered list of events with a marker rail — ideal for meeting
          agendas, activity history, and project progress tracking.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Vertical</h2>
        <p className="text-sm text-muted-foreground">
          The default orientation. Events stack top-to-bottom with a vertical
          connector between markers.
        </p>
        <TimelineExamples section="vertical" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Horizontal</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">
            orientation=&quot;horizontal&quot;
          </code>{' '}
          for a left-to-right layout suited to compact history strips.
        </p>
        <TimelineExamples section="horizontal" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With statuses</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">status</code> on
          each item to colour the marker:{' '}
          <code className="text-xs bg-muted px-1 rounded">done</code> (filled
          primary),{' '}
          <code className="text-xs bg-muted px-1 rounded">current</code> (ring),{' '}
          <code className="text-xs bg-muted px-1 rounded">upcoming</code> (muted),{' '}
          <code className="text-xs bg-muted px-1 rounded">default</code> (border
          only).
        </p>
        <TimelineExamples section="statuses" />
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

      <section className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Timeline props
          </h2>
          <PropsTable props={timelineProps} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            TimelineItemData
          </h2>
          <PropsTable props={timelineItemDataProps} />
        </div>
      </section>
    </div>
  )
}
