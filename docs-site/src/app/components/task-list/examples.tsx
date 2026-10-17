'use client'

import * as React from 'react'
import {
  TaskList,
  TaskGroup,
  TaskRow,
  BulkActionBar,
  TASK_DUE_BUCKET_LABELS,
  groupTasksByDue,
  countTaskGroup,
  describeTaskDue,
} from '@refraction-ui/react-task-list'
import { Button } from '@refraction-ui/react-button'
import { Avatar, AvatarFallback } from '@refraction-ui/react-avatar'

interface TaskListExamplesProps {
  section: 'grouped' | 'selection' | 'states'
}

/**
 * The reference day is injected, never read from the clock, so the examples
 * (and their screenshots) render identically every day.
 */
const TODAY = '2026-10-17'

interface DemoTask {
  id: string
  title: string
  due: string | null
  done: boolean
  owner: string
  unseen?: boolean
}

const DEMO_TASKS: DemoTask[] = [
  { id: 't1', title: 'Send the Q3 report to finance', due: '2026-10-14', done: false, owner: 'SA', unseen: true },
  { id: 't2', title: 'Review the onboarding copy', due: '2026-10-17', done: false, owner: 'JL' },
  { id: 't3', title: 'Book the offsite venue', due: '2026-10-17', done: false, owner: 'MK' },
  { id: 't4', title: 'Draft the hiring plan', due: '2026-10-21', done: false, owner: 'SA' },
  { id: 't5', title: 'Renew the domain', due: '2026-11-02', done: false, owner: 'JL' },
  { id: 't6', title: 'Tidy the shared drive', due: null, done: false, owner: 'MK' },
  { id: 't7', title: 'Ship the pricing page', due: '2026-10-12', done: true, owner: 'SA' },
]

const accessors = {
  today: TODAY,
  dueOf: (task: DemoTask) => task.due,
  isDone: (task: DemoTask) => task.done,
}

function useDemoTasks() {
  const [tasks, setTasks] = React.useState(DEMO_TASKS)
  const setDone = React.useCallback((id: string, done: boolean) => {
    setTasks((all) => all.map((t) => (t.id === id ? { ...t, done, unseen: false } : t)))
  }, [])
  return { tasks, setTasks, setDone }
}

function DemoRow({ task, onDone, onOpen }: { task: DemoTask; onDone: (id: string, done: boolean) => void; onOpen: (task: DemoTask) => void }) {
  const due = describeTaskDue(task.due, { today: TODAY })
  return (
    <TaskRow
      taskId={task.id}
      title={task.title}
      completed={task.done}
      unseen={task.unseen}
      dueLabel={due?.label}
      dueTone={due?.tone}
      owner={
        <Avatar size="sm" aria-label={`Assigned to ${task.owner}`}>
          <AvatarFallback>{task.owner}</AvatarFallback>
        </Avatar>
      }
      onCompletedChanged={(done) => onDone(task.id, done)}
      onTap={() => onOpen(task)}
    />
  )
}

function GroupedTasks({ tasks, onDone, onOpen }: { tasks: DemoTask[]; onDone: (id: string, done: boolean) => void; onOpen: (task: DemoTask) => void }) {
  return (
    <>
      {groupTasksByDue(tasks, accessors)
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <TaskGroup
            key={group.bucket}
            title={TASK_DUE_BUCKET_LABELS[group.bucket]}
            bucket={group.bucket}
            counts={countTaskGroup(group.items, accessors)}
          >
            {group.items.map((task) => (
              <DemoRow key={task.id} task={task} onDone={onDone} onOpen={onOpen} />
            ))}
          </TaskGroup>
        ))}
    </>
  )
}

export function TaskListExamples({ section }: TaskListExamplesProps) {
  if (section === 'grouped') return <GroupedExample />
  if (section === 'selection') return <SelectionExample />
  if (section === 'states') return <StatesExample />
  return null
}

function GroupedExample() {
  const { tasks, setDone } = useDemoTasks()
  const [opened, setOpened] = React.useState<string>('None yet')
  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-4 sm:p-6">
      <TaskList semanticLabel="My tasks">
        <GroupedTasks tasks={tasks} onDone={setDone} onOpen={(task) => setOpened(task.title)} />
      </TaskList>
      <p className="text-sm text-muted-foreground">Opened: {opened}</p>
    </div>
  )
}

function SelectionExample() {
  const { tasks, setTasks, setDone } = useDemoTasks()
  const [selected, setSelected] = React.useState<string[]>([])

  const completeSelected = () => {
    setTasks((all) => all.map((t) => (selected.includes(t.id) ? { ...t, done: true, unseen: false } : t)))
    setSelected([])
  }
  const deleteSelected = () => {
    setTasks((all) => all.filter((t) => !selected.includes(t.id)))
    setSelected([])
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-4 sm:p-6">
      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <Button size="sm" variant="outline" onClick={completeSelected}>
          Complete
        </Button>
        <Button size="sm" variant="destructive" onClick={deleteSelected}>
          Delete
        </Button>
      </BulkActionBar>
      <TaskList semanticLabel="Tasks to triage" selectionMode selectedIds={selected} onSelectedIdsChange={setSelected}>
        <GroupedTasks tasks={tasks} onDone={setDone} onOpen={() => {}} />
      </TaskList>
    </div>
  )
}

function StatesExample() {
  const [done, setDone] = React.useState(false)
  return (
    <div className="rounded-xl border border-border bg-background p-4 sm:p-6">
      <TaskList semanticLabel="Row states">
        <TaskGroup title="Row states" counts={{ open: done ? 2 : 3, done: done ? 1 : 0 }}>
          <TaskRow taskId="s1" title="You can complete this one" completed={done} onCompletedChanged={setDone} dueLabel="Tomorrow" />
          <TaskRow
            taskId="s2"
            title="Assigned to Sam — read-only for you"
            readOnly
            readOnlyReason="Only Sam can complete this task"
            dueLabel="3d overdue"
            dueTone="overdue"
          />
          <TaskRow taskId="s3" title="New since your last visit" unseen onCompletedChanged={() => {}} dueLabel="Today" dueTone="soon" />
        </TaskGroup>
        <TaskGroup title="Later this month" emptyLabel="Nothing scheduled." />
      </TaskList>
    </div>
  )
}
