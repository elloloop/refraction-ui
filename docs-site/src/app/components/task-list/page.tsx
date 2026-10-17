import { TaskListExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const taskListProps = [
  { name: 'children', type: 'React.ReactNode', description: '`TaskGroup`s holding `TaskRow`s.' },
  { name: 'semanticLabel', type: 'string', description: 'Accessible name for the whole list.' },
  {
    name: 'selectionMode',
    type: 'boolean',
    default: 'false',
    description: 'Adds a selection checkbox column to every row and a select-all checkbox above the groups.',
  },
  { name: 'selectedIds', type: 'string[]', description: 'Controlled selected task ids.' },
  { name: 'defaultSelectedIds', type: 'string[]', description: 'Initial selected task ids when uncontrolled.' },
  {
    name: 'onSelectedIdsChange',
    type: '(selectedIds: string[]) => void',
    description: 'Called with the next selected ids (toggle, Shift range, select all / none).',
  },
  { name: 'selectAllLabel', type: 'string', default: "'Select all'", description: 'Text of the select-all checkbox.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const taskGroupProps = [
  { name: 'title', type: 'string', description: 'Group title, e.g. "Overdue". Required.' },
  { name: 'children', type: 'React.ReactNode', description: 'The group’s `TaskRow`s.' },
  {
    name: 'bucket',
    type: "'overdue' | 'today' | 'upcoming' | 'noDate' | 'done'",
    description: 'The due bucket this group shows. `done` folds by default; `overdue` titles use the destructive tone.',
  },
  {
    name: 'counts',
    type: '{ open?: number; overdue?: number; done?: number }',
    description: 'Header summary, rendered as "4 open · 1 overdue". Use `countTaskGroup` to compute it.',
  },
  {
    name: 'countLabels',
    type: '{ open?, overdue?, done?: (n) => string; separator?: string }',
    description: 'Overrides the words and separator of the `counts` summary.',
  },
  {
    name: 'count',
    type: 'number',
    description: 'Number shown in the header when `counts` is absent. Defaults to the number of rows.',
  },
  { name: 'expanded', type: 'boolean', description: 'Controlled expansion state.' },
  {
    name: 'initiallyExpanded',
    type: 'boolean',
    default: "bucket !== 'done'",
    description: 'Initial expansion state when uncontrolled.',
  },
  { name: 'onExpandedChanged', type: '(expanded: boolean) => void', description: 'Called with the requested expansion state.' },
  { name: 'trailing', type: 'React.ReactNode', description: 'Content at the end of the header, e.g. an "Add" button.' },
  { name: 'emptyLabel', type: 'string', description: 'Shown instead of rows when the group is empty.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const taskRowProps = [
  { name: 'taskId', type: 'string', description: 'Stable id used for selection and Shift ranges. Required.' },
  { name: 'title', type: 'string', description: 'Task title. Required.' },
  { name: 'completed', type: 'boolean', default: 'false', description: 'Whether the task is complete.' },
  {
    name: 'onCompletedChanged',
    type: '(completed: boolean) => void',
    description:
      'Called with the requested completion state: after `completionSettle` when completing, at once when reopening or under reduced motion. Without it the checkbox is read-only.',
  },
  { name: 'onTap', type: '() => void', description: 'Opens the task (row click or Enter).' },
  {
    name: 'readOnly',
    type: 'boolean',
    default: 'false',
    description: 'The viewer cannot complete this task: the checkbox gets `aria-readonly` and an explanation.',
  },
  {
    name: 'readOnlyReason',
    type: 'string',
    default: "'You can’t complete this task'",
    description: 'Why the checkbox is read-only (screen-reader description and tooltip).',
  },
  {
    name: 'unseen',
    type: 'boolean',
    default: 'false',
    description: 'Not yet seen: a dot, a bold title and the word "Unseen" for screen readers.',
  },
  { name: 'dueLabel', type: 'string', description: 'Due chip text, e.g. from `describeTaskDue`.' },
  {
    name: 'dueTone',
    type: "'normal' | 'soon' | 'overdue'",
    default: "'normal'",
    description: 'Urgency tone of the due chip (normal once completed).',
  },
  { name: 'status', type: 'React.ReactNode', description: 'Status slot, e.g. a StatusBadge.' },
  { name: 'owner', type: 'React.ReactNode', description: 'Assignee slot, e.g. a small Avatar.' },
  {
    name: 'completionSettle',
    type: 'number',
    default: '650',
    description: 'Milliseconds between the completion animation starting and `onCompletedChanged`.',
  },
  { name: 'semanticLabel', type: 'string', description: 'Accessible name for the row; defaults to the title.' },
  {
    name: 'labels',
    type: 'Partial<TaskRowLabels>',
    description:
      'Overrides the control labels and state words: `complete(title)`, `select(title)`, `completed`, `notCompleted`, `unseen`, `selected`, `readOnly`.',
  },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const bulkActionBarProps = [
  { name: 'count', type: 'number', description: 'Number of selected items; the bar shows only above zero. Required.' },
  { name: 'children', type: 'React.ReactNode', description: 'Actions for the selection, e.g. Buttons.' },
  { name: 'onClear', type: '() => void', description: 'Clears the selection; renders an icon button when given.' },
  { name: 'clearLabel', type: 'string', default: "'Clear selection'", description: 'Accessible name of the clear button.' },
  {
    name: 'labels',
    type: '{ selected?: (count: number) => string }',
    description: 'Overrides the "N selected" wording.',
  },
  { name: 'aria-label', type: 'string', default: "'Bulk actions'", description: 'Name of the bar’s region.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const usageCode = `import {
  TaskList, TaskGroup, TaskRow, BulkActionBar,
  groupTasksByDue, countTaskGroup, describeTaskDue, TASK_DUE_BUCKET_LABELS,
} from '@refraction-ui/react'

// Inject "today" (e.g. from your app clock) — the helpers never read the clock.
const accessors = { today, dueOf: (t) => t.due, isDone: (t) => t.done }

export function Tasks({ tasks, today, onDone, onOpen }) {
  const [selected, setSelected] = React.useState<string[]>([])

  return (
    <>
      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <Button size="sm">Complete</Button>
      </BulkActionBar>
      <TaskList semanticLabel="My tasks" selectionMode
        selectedIds={selected} onSelectedIdsChange={setSelected}>
        {groupTasksByDue(tasks, accessors).map(({ bucket, items }) => (
          <TaskGroup key={bucket} bucket={bucket}
            title={TASK_DUE_BUCKET_LABELS[bucket]}
            counts={countTaskGroup(items, accessors)}>
            {items.map((t) => {
              const due = describeTaskDue(t.due, { today })
              return (
                <TaskRow key={t.id} taskId={t.id} title={t.title}
                  completed={t.done} unseen={!t.seen}
                  readOnly={!t.canComplete}
                  dueLabel={due?.label} dueTone={due?.tone}
                  onCompletedChanged={(done) => onDone(t.id, done)}
                  onTap={() => onOpen(t.id)} />
              )
            })}
          </TaskGroup>
        ))}
      </TaskList>
    </>
  )
}`

export default function TaskListPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Task List</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A to-do list grouped by due state — Overdue, Today, Upcoming, No due date, Done — with
          folding groups, header counts, read-only and unseen rows, a completion animation, and a
          selection mode with Shift ranges, select all and a BulkActionBar.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Grouped by due date</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>groupTasksByDue</code> buckets tasks against an injected reference
          day, <code className={code}>countTaskGroup</code> feeds the header summary and{' '}
          <code className={code}>describeTaskDue</code> writes the due chip. Done is folded by
          default. Complete a task and it lands in Done once its animation settles.
        </p>
        <TaskListExamples section="grouped" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Selection and bulk actions</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>selectionMode</code> adds a checkbox column. Shift-click (or
          Shift+Space) selects the range from the last toggled row over the visible order; select all
          covers the rows in open groups. <code className={code}>BulkActionBar</code> shows the count
          and your actions.
        </p>
        <TaskListExamples section="selection" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Row states</h2>
        <p className="text-sm text-muted-foreground">
          A read-only checkbox when the viewer cannot complete the task, an unseen row, due tones and
          an empty group.
        </p>
        <TaskListExamples section="states" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Each row is one Tab stop. ↑/↓ move between group headers and rows across groups and
            Home/End jump to the first/last (clamped, no wrap). Space toggles completion — or
            selection in selection mode, with Shift+Space for a range — and Enter opens the task.
          </li>
          <li>
            Group headers are buttons with <code className={code}>aria-expanded</code> and{' '}
            <code className={code}>aria-controls</code>; the rows sit in a region labelled by the
            header. Folded rows are removed, so they leave the tab order and the visible order.
          </li>
          <li>
            A row is named by its title and described by its state in words (&quot;Not completed,
            Unseen, Selected&quot;) and its due chip, so the strike-through, the unseen dot, bold
            title and selection fill are never the only signal. The due chip states its urgency in
            text (&quot;3d overdue&quot;).
          </li>
          <li>
            A read-only checkbox has <code className={code}>aria-readonly</code> and is described by
            the reason (also its tooltip). Checkboxes have a 44 × 44 px hit area.
          </li>
          <li>
            The BulkActionBar count is a polite <code className={code}>role=&quot;status&quot;</code>{' '}
            region that stays mounted, so the first selection is announced too; its clear button is
            labelled and 44 × 44 px.
          </li>
          <li>
            A visible <code className={code}>focus-visible</code> ring on rows and headers. The
            completion pop, strike-through fade and chevron turn stop under{' '}
            <code className={code}>prefers-reduced-motion</code>, and completion is then reported
            immediately instead of after the settle delay.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">TaskList props</h2>
        <PropsTable props={taskListProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">TaskGroup props</h2>
        <PropsTable props={taskGroupProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">TaskRow props</h2>
        <PropsTable props={taskRowProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">BulkActionBar props</h2>
        <PropsTable props={bulkActionBarProps} />
      </section>
    </div>
  )
}
