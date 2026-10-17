// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { TaskList, TaskGroup, TaskRow, BulkActionBar } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.useRealTimers()
  Reflect.deleteProperty(window, 'matchMedia')
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

function mockReducedMotion(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({ matches: reduce && query.includes('reduce'), media: query }),
  })
}

function press(key: string, shiftKey = false): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true })
  act(() => {
    document.activeElement?.dispatchEvent(event)
  })
  return event
}

function click(el: Element, init: MouseEventInit = {}) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }))
  })
}

function row(id: string): HTMLLIElement {
  const el = container.querySelector<HTMLLIElement>(`li[data-task-id="${id}"]`)
  if (!el) throw new Error(`row ${id} not rendered`)
  return el
}

function header(name: string): HTMLButtonElement {
  const el = Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-expanded]')).find((b) =>
    b.textContent?.startsWith(name),
  )
  if (!el) throw new Error(`header ${name} not rendered`)
  return el
}

function completionBox(id: string): HTMLButtonElement {
  const el = row(id).querySelector<HTMLButtonElement>('[role="checkbox"][aria-label^="Complete"]')
  if (!el) throw new Error('no completion checkbox')
  return el
}

function selectBox(id: string): HTMLButtonElement {
  const el = row(id).querySelector<HTMLButtonElement>('[role="checkbox"][aria-label^="Select"]')
  if (!el) throw new Error('no selection checkbox')
  return el
}

function selectAll(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('label [role="checkbox"]')
  if (!el) throw new Error('no select-all')
  return el
}

interface Task {
  id: string
  title: string
  done: boolean
}

const INITIAL: Task[] = [
  { id: 'a', title: 'Alpha', done: false },
  { id: 'b', title: 'Bravo', done: false },
  { id: 'c', title: 'Charlie', done: false },
  { id: 'd', title: 'Delta', done: true },
]

/** A host that moves completed tasks into a folded Done group. */
function Harness({
  selectionMode = false,
  onOpen,
  onSelection,
}: {
  selectionMode?: boolean
  onOpen?: (id: string) => void
  onSelection?: (ids: string[]) => void
}) {
  const [tasks, setTasks] = React.useState(INITIAL)
  const [selected, setSelected] = React.useState<string[]>([])
  const setDone = (id: string, done: boolean) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done } : t)))
  const rowFor = (t: Task) => (
    <TaskRow
      key={t.id}
      taskId={t.id}
      title={t.title}
      completed={t.done}
      onCompletedChanged={(done) => setDone(t.id, done)}
      onTap={() => onOpen?.(t.id)}
    />
  )
  return (
    <>
      <TaskList
        semanticLabel="Tasks"
        selectionMode={selectionMode}
        selectedIds={selected}
        onSelectedIdsChange={(ids) => {
          setSelected(ids)
          onSelection?.(ids)
        }}
      >
        <TaskGroup title="Today" bucket="today">
          {tasks.filter((t) => !t.done).map(rowFor)}
        </TaskGroup>
        <TaskGroup title="Done" bucket="done">
          {tasks.filter((t) => t.done).map(rowFor)}
        </TaskGroup>
      </TaskList>
      <BulkActionBar count={selected.length} onClear={() => setSelected([])}>
        <button type="button">Complete</button>
      </BulkActionBar>
    </>
  )
}

describe('keyboard navigation', () => {
  it('arrows move between group headers and rows across groups, clamped at the ends', () => {
    render(<Harness />)
    header('Today').focus()
    press('ArrowDown')
    expect(document.activeElement).toBe(row('a'))
    press('ArrowDown')
    press('ArrowDown')
    expect(document.activeElement).toBe(row('c'))
    press('ArrowDown')
    expect(document.activeElement).toBe(header('Done'))
    const end = press('ArrowDown')
    expect(document.activeElement).toBe(header('Done'))
    expect(end.defaultPrevented).toBe(true)
    press('ArrowUp')
    expect(document.activeElement).toBe(row('c'))
    press('Home')
    expect(document.activeElement).toBe(header('Today'))
    press('End')
    expect(document.activeElement).toBe(header('Done'))
  })

  it('a folded group’s rows are skipped; unfolding the header brings them in', () => {
    render(<Harness />)
    expect(header('Done').getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('li[data-task-id="d"]')).toBeNull()
    click(header('Done'))
    expect(header('Done').getAttribute('aria-expanded')).toBe('true')
    header('Done').focus()
    press('ArrowDown')
    expect(document.activeElement).toBe(row('d'))
  })

  it('Enter opens the focused row; clicking the row opens it, clicking its checkbox does not', () => {
    mockReducedMotion(true)
    const onOpen = vi.fn()
    render(<Harness onOpen={onOpen} />)
    row('b').focus()
    press('Enter')
    expect(onOpen).toHaveBeenLastCalledWith('b')
    click(row('a').querySelector('span[id$="-title"]') as Element)
    expect(onOpen).toHaveBeenLastCalledWith('a')
    expect(onOpen).toHaveBeenCalledTimes(2)
    click(completionBox('c'))
    expect(onOpen).toHaveBeenCalledTimes(2)
  })
})

describe('completion', () => {
  it('Space completes immediately under reduced motion and the row moves to Done', () => {
    mockReducedMotion(true)
    render(<Harness />)
    row('a').focus()
    const event = press(' ')
    expect(event.defaultPrevented).toBe(true)
    expect(container.querySelector('li[data-task-id="a"]')).toBeNull()
    click(header('Done'))
    expect(completionBox('a').getAttribute('aria-checked')).toBe('true')
  })

  it('with motion, shows the check at once and reports after the settle delay', () => {
    vi.useFakeTimers()
    mockReducedMotion(false)
    const onCompletedChanged = vi.fn()
    render(
      <ul>
        <TaskRow taskId="x" title="Animate me" onCompletedChanged={onCompletedChanged} completionSettle={300} />
      </ul>,
    )
    click(completionBox('x'))
    expect(completionBox('x').getAttribute('aria-checked')).toBe('true')
    expect(row('x').hasAttribute('data-completing')).toBe(true)
    expect(onCompletedChanged).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onCompletedChanged).toHaveBeenCalledWith(true)
    expect(row('x').hasAttribute('data-completing')).toBe(false)
  })

  it('toggling back during the settle cancels the completion', () => {
    vi.useFakeTimers()
    const onCompletedChanged = vi.fn()
    render(
      <ul>
        <TaskRow taskId="x" title="Oops" onCompletedChanged={onCompletedChanged} />
      </ul>,
    )
    row('x').focus()
    press(' ')
    expect(completionBox('x').getAttribute('aria-checked')).toBe('true')
    press(' ')
    expect(completionBox('x').getAttribute('aria-checked')).toBe('false')
    act(() => {
      vi.runAllTimers()
    })
    expect(onCompletedChanged).not.toHaveBeenCalled()
  })

  it('un-completing reports immediately even with motion', () => {
    vi.useFakeTimers()
    const onCompletedChanged = vi.fn()
    render(
      <ul>
        <TaskRow taskId="x" title="Reopen" completed onCompletedChanged={onCompletedChanged} />
      </ul>,
    )
    click(completionBox('x'))
    expect(onCompletedChanged).toHaveBeenCalledWith(false)
  })

  it('never reports after unmount', () => {
    vi.useFakeTimers()
    const onCompletedChanged = vi.fn()
    render(
      <ul>
        <TaskRow taskId="x" title="Gone" onCompletedChanged={onCompletedChanged} />
      </ul>,
    )
    click(completionBox('x'))
    render(<ul />)
    act(() => {
      vi.runAllTimers()
    })
    expect(onCompletedChanged).not.toHaveBeenCalled()
  })

  it('read-only rows ignore Space and checkbox clicks', () => {
    mockReducedMotion(true)
    const onCompletedChanged = vi.fn()
    render(
      <ul>
        <TaskRow taskId="x" title="Theirs" readOnly onCompletedChanged={onCompletedChanged} />
      </ul>,
    )
    row('x').focus()
    press(' ')
    click(completionBox('x'))
    expect(onCompletedChanged).not.toHaveBeenCalled()
    expect(completionBox('x').getAttribute('aria-checked')).toBe('false')
    expect(completionBox('x').getAttribute('aria-readonly')).toBe('true')
  })
})

describe('selection mode', () => {
  it('clicking selection checkboxes toggles; Shift-click selects the visible range', () => {
    const onSelection = vi.fn()
    render(<Harness selectionMode onSelection={onSelection} />)
    click(selectBox('a'))
    expect(onSelection).toHaveBeenLastCalledWith(['a'])
    click(selectBox('c'), { shiftKey: true })
    expect(onSelection).toHaveBeenLastCalledWith(['a', 'b', 'c'])
    expect(selectBox('b').getAttribute('aria-checked')).toBe('true')
    expect(row('b').hasAttribute('data-selected')).toBe(true)
    click(selectBox('b'))
    expect(onSelection).toHaveBeenLastCalledWith(['a', 'c'])
  })

  it('Space toggles selection (not completion) and Shift+Space extends the range', () => {
    mockReducedMotion(true)
    const onSelection = vi.fn()
    render(<Harness selectionMode onSelection={onSelection} />)
    row('c').focus()
    press(' ')
    expect(onSelection).toHaveBeenLastCalledWith(['c'])
    expect(completionBox('c').getAttribute('aria-checked')).toBe('false')
    press('ArrowUp')
    press('ArrowUp')
    press(' ', true)
    expect(onSelection).toHaveBeenLastCalledWith(['c', 'a', 'b'])
  })

  it('select-all reflects none / some / all of the visible rows and toggles', () => {
    const onSelection = vi.fn()
    render(<Harness selectionMode onSelection={onSelection} />)
    expect(selectAll().getAttribute('aria-checked')).toBe('false')
    click(selectBox('a'))
    expect(selectAll().getAttribute('aria-checked')).toBe('mixed')
    click(selectAll())
    // The folded Done group's row is not visible, so it is not selected.
    expect(onSelection).toHaveBeenLastCalledWith(['a', 'b', 'c'])
    expect(selectAll().getAttribute('aria-checked')).toBe('true')
    click(selectAll())
    expect(onSelection).toHaveBeenLastCalledWith([])
  })

  it('the bulk bar announces the count politely and clears', () => {
    render(<Harness selectionMode />)
    const status = container.querySelector('[role="status"]')
    expect(status?.getAttribute('aria-live')).toBe('polite')
    expect(status?.textContent).toBe('')
    click(selectBox('a'))
    click(selectBox('b'))
    expect(container.querySelector('[role="status"]')?.textContent).toBe('2 selected')
    expect(container.querySelector('[role="region"][aria-label="Bulk actions"]')).not.toBeNull()
    click(container.querySelector('button[aria-label="Clear selection"]') as Element)
    expect(container.querySelector('[role="status"]')?.textContent).toBe('')
    expect(selectBox('a').getAttribute('aria-checked')).toBe('false')
  })
})
