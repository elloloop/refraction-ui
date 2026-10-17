import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { TaskList, TaskGroup, TaskRow, BulkActionBar } from '../src/index.js'

function html(ui: React.ReactElement): string {
  return renderToString(ui)
}

describe('TaskList (SSR)', () => {
  it('renders a labelled group with no select-all outside selection mode', () => {
    const out = html(
      <TaskList semanticLabel="My tasks">
        <TaskGroup title="Today" bucket="today">
          <TaskRow taskId="a" title="Write spec" />
        </TaskGroup>
      </TaskList>,
    )
    expect(out).toContain('role="group"')
    expect(out).toContain('aria-label="My tasks"')
    expect(out).not.toContain('Select all')
    expect(out).not.toContain('data-selection-mode')
  })

  it('renders a select-all checkbox and selection column in selection mode', () => {
    const out = html(
      <TaskList selectionMode selectedIds={['a']} selectAllLabel="Pick all">
        <TaskGroup title="Today">
          <TaskRow taskId="a" title="Write spec" />
          <TaskRow taskId="b" title="Review PR" />
        </TaskGroup>
      </TaskList>,
    )
    expect(out).toContain('Pick all')
    expect(out).toContain('aria-label="Select Write spec"')
    expect(out).toContain('aria-label="Select Review PR"')
    expect(out).toMatch(/aria-checked="true"[^>]*aria-label="Select Write spec"/)
    expect(out).toMatch(/aria-checked="false"[^>]*aria-label="Select Review PR"/)
    expect(out).toContain('data-selected=""')
    expect(out).toContain('Not completed, Selected')
  })
})

describe('TaskGroup (SSR)', () => {
  it('header is an aria-expanded button controlling a labelled region with a list', () => {
    const out = html(
      <TaskGroup title="Overdue" bucket="overdue" counts={{ open: 4, overdue: 1 }}>
        <TaskRow taskId="a" title="A" />
      </TaskGroup>,
    )
    expect(out).toMatch(/<button[^>]*aria-expanded="true"/)
    const controls = /aria-controls="([^"]+)"/.exec(out)?.[1]
    const trigger = /<button[^>]*id="([^"]+)"/.exec(out)?.[1]
    expect(controls).toBeTruthy()
    expect(out).toContain(`id="${controls}"`)
    expect(out).toContain(`aria-labelledby="${trigger}"`)
    expect(out).toContain('role="region"')
    expect(out).toContain('<ul role="list"')
    expect(out).toContain('4 open · 1 overdue')
    expect(out).toContain('text-destructive')
    expect(out).toContain('data-task-nav')
  })

  it('folds the done bucket by default and unmounts its rows', () => {
    const out = html(
      <TaskGroup title="Done" bucket="done">
        <TaskRow taskId="a" title="Shipped it" completed />
      </TaskGroup>,
    )
    expect(out).toMatch(/aria-expanded="false"/)
    expect(out).toContain('data-state="closed"')
    expect(out).not.toContain('Shipped it')
  })

  it('honours initiallyExpanded and controlled expanded', () => {
    expect(
      html(
        <TaskGroup title="Done" bucket="done" initiallyExpanded>
          <TaskRow taskId="a" title="Shipped it" completed />
        </TaskGroup>,
      ),
    ).toContain('Shipped it')
    expect(
      html(
        <TaskGroup title="Today" expanded={false}>
          <TaskRow taskId="a" title="Hidden" />
        </TaskGroup>,
      ),
    ).not.toContain('Hidden')
  })

  it('defaults the count to the number of rows, or uses count', () => {
    const two = html(
      <TaskGroup title="Today">
        <TaskRow taskId="a" title="A" />
        <TaskRow taskId="b" title="B" />
      </TaskGroup>,
    )
    expect(two).toMatch(/tabular-nums">2</)
    expect(html(<TaskGroup title="Today" count={12} />)).toMatch(/tabular-nums">12</)
  })

  it('shows emptyLabel for an empty group and renders trailing', () => {
    const out = html(<TaskGroup title="Upcoming" emptyLabel="Nothing planned" trailing={<button>Add</button>} />)
    expect(out).toContain('Nothing planned')
    expect(out).toContain('>Add</button>')
    expect(out).not.toContain('<ul')
  })
})

describe('TaskRow (SSR)', () => {
  it('renders a focusable listitem labelled by its title and described by its state and due chip', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="Write spec" dueLabel="Today" dueTone="soon" onCompletedChanged={() => {}} />
      </ul>,
    )
    expect(out).toMatch(/<li[^>]*tabindex="0"/)
    expect(out).toContain('data-task-id="t1"')
    const titleId = /<span id="([^"]+)"[^>]*>Write spec<\/span>/.exec(out)?.[1]
    expect(titleId).toBeTruthy()
    expect(out).toContain(`aria-labelledby="${titleId}"`)
    expect(out).toMatch(/aria-describedby="[^"]*-state [^"]*-due"/)
    expect(out).toContain('Not completed')
    expect(out).toContain('bg-warning/15')
    expect(out).toContain('role="checkbox"')
    expect(out).toContain('aria-label="Complete Write spec"')
    expect(out).not.toContain('aria-readonly')
  })

  it('a read-only checkbox has aria-readonly and an explanation', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="Their task" readOnly readOnlyReason="Only Sam can complete this" />
      </ul>,
    )
    expect(out).toContain('aria-readonly="true"')
    expect(out).toContain('title="Only Sam can complete this"')
    expect(out).toContain('data-readonly=""')
    const reasonId = /<span id="([^"]+)" class="sr-only">Only Sam can complete this<\/span>/.exec(out)?.[1]
    expect(reasonId).toBeTruthy()
    expect(out).toMatch(new RegExp(`role="checkbox"[^>]*aria-describedby="${reasonId}"|aria-describedby="${reasonId}"[^>]*role="checkbox"`))
  })

  it('without onCompletedChanged the checkbox is read-only with the default reason', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="View only" />
      </ul>,
    )
    expect(out).toContain('aria-readonly="true"')
    expect(out).toContain('You can’t complete this task')
  })

  it('unseen: a decorative dot, a bold title and the word Unseen', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="New one" unseen />
      </ul>,
    )
    expect(out).toMatch(/<span aria-hidden="true" class="size-2[^"]*rounded-full/)
    expect(out).toContain('font-semibold')
    expect(out).toContain('Not completed, Unseen')
    expect(out).toContain('data-unseen=""')
  })

  it('completed: checked box, strike-through title, normal tone even if overdue', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="Done thing" completed dueLabel="3d overdue" dueTone="overdue" />
      </ul>,
    )
    expect(out).toContain('aria-checked="true"')
    expect(out).toContain('line-through')
    expect(out).toContain('data-state="completed"')
    expect(out).not.toContain('text-destructive')
  })

  it('reduced motion: animated pieces carry motion-reduce / motion-safe guards', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="T" completed />
      </ul>,
    )
    expect(out).toContain('motion-safe:animate-scale-in')
    expect(out).toContain('motion-reduce:transition-none')
  })

  it('renders status and owner slots, semanticLabel and custom labels', () => {
    const out = html(
      <ul>
        <TaskRow
          taskId="t1"
          title="Plan"
          status={<span>In review</span>}
          owner={<span>SA</span>}
          semanticLabel="Plan, due Friday"
          labels={{ complete: (t) => `Erledigen: ${t}` }}
        />
      </ul>,
    )
    expect(out).toContain('In review')
    expect(out).toContain('SA')
    expect(out).toContain('aria-label="Plan, due Friday"')
    expect(out).not.toContain('aria-labelledby')
    expect(out).toContain('aria-label="Erledigen: Plan"')
  })

  it('has a visible focus ring and a 44px checkbox hit area', () => {
    const out = html(
      <ul>
        <TaskRow taskId="t1" title="T" />
      </ul>,
    )
    expect(out).toContain('focus-visible:ring-2')
    expect(out).toContain('before:-inset-3.5')
  })
})

describe('BulkActionBar (SSR)', () => {
  it('keeps an empty polite live region mounted at zero', () => {
    const out = html(<BulkActionBar count={0}><button>Delete</button></BulkActionBar>)
    expect(out).toContain('role="status"')
    expect(out).toContain('aria-live="polite"')
    expect(out).not.toContain('Delete')
    expect(out).not.toContain('role="region"')
    expect(out).toContain('data-state="closed"')
  })

  it('shows the count, actions and a labelled 44px clear button', () => {
    const out = html(
      <BulkActionBar count={3} onClear={() => {}} aria-label="Task actions">
        <button>Complete</button>
      </BulkActionBar>,
    )
    expect(out).toContain('role="region"')
    expect(out).toContain('aria-label="Task actions"')
    expect(out).toContain('3 selected')
    expect(out).toContain('>Complete</button>')
    expect(out).toContain('aria-label="Clear selection"')
    expect(out).toContain('size-11')
  })

  it('accepts custom count wording', () => {
    expect(html(<BulkActionBar count={2} labels={{ selected: (n) => `${n} ausgewählt` }} />)).toContain('2 ausgewählt')
  })
})
