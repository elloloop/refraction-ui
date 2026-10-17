import { describe, it, expect } from 'vitest'
import {
  TASK_DUE_BUCKETS,
  toTaskCalendarDay,
  getTaskDayDifference,
  getTaskDueBucket,
  groupTasksByDue,
  describeTaskDue,
  countTaskGroup,
  formatTaskGroupSummary,
  reduceTaskSelection,
  getTaskSelectAllState,
  getTaskSelectAllAction,
  formatBulkActionCount,
  getTaskNavMove,
  getNextTaskNavIndex,
  getTaskRowKeyAction,
  getTaskCompletionDelay,
  describeTaskRowState,
  getTaskRowDataAttributes,
  TASK_COMPLETION_SETTLE_MS,
  TASK_SELECTION_EMPTY,
  taskRowVariants,
  taskRowTitleVariants,
  taskRowDueChipVariants,
  taskGroupTitleVariants,
  type TaskSelectionState,
} from '../src/index.js'

const TODAY = '2026-10-17'

interface Item {
  id: string
  due?: string | null
  done?: boolean
}

const accessors = {
  today: TODAY,
  dueOf: (item: Item) => item.due,
  isDone: (item: Item) => Boolean(item.done),
}

describe('toTaskCalendarDay', () => {
  it('reads a YYYY-MM-DD string as that calendar day (no time-zone shift)', () => {
    expect(toTaskCalendarDay('2026-01-31')).toEqual({ year: 2026, month: 1, day: 31 })
    expect(toTaskCalendarDay(' 2026-01-31 ')).toEqual({ year: 2026, month: 1, day: 31 })
  })

  it('reads a Date by its local calendar fields', () => {
    expect(toTaskCalendarDay(new Date(2026, 9, 17, 23, 59))).toEqual({ year: 2026, month: 10, day: 17 })
  })

  it('returns null for missing or invalid input', () => {
    expect(toTaskCalendarDay(null)).toBeNull()
    expect(toTaskCalendarDay(undefined)).toBeNull()
    expect(toTaskCalendarDay('not a date')).toBeNull()
    expect(toTaskCalendarDay(new Date(Number.NaN))).toBeNull()
  })
})

describe('getTaskDayDifference', () => {
  it('counts whole calendar days, ignoring time of day', () => {
    expect(getTaskDayDifference(new Date(2026, 9, 18, 0, 1), new Date(2026, 9, 17, 23, 59))).toBe(1)
    expect(getTaskDayDifference('2026-10-10', TODAY)).toBe(-7)
  })

  it('is exact across month, year and DST boundaries', () => {
    expect(getTaskDayDifference('2027-01-01', '2026-12-31')).toBe(1)
    expect(getTaskDayDifference('2026-03-30', '2026-03-28')).toBe(2)
    expect(getTaskDayDifference('2026-11-02', '2026-10-31')).toBe(2)
  })

  it('returns null if either side is missing', () => {
    expect(getTaskDayDifference(null, TODAY)).toBeNull()
    expect(getTaskDayDifference(TODAY, null)).toBeNull()
  })
})

describe('getTaskDueBucket', () => {
  it('buckets relative to the injected today', () => {
    expect(getTaskDueBucket('2026-10-16', { today: TODAY })).toBe('overdue')
    expect(getTaskDueBucket('2026-10-17', { today: TODAY })).toBe('today')
    expect(getTaskDueBucket('2026-10-18', { today: TODAY })).toBe('upcoming')
    expect(getTaskDueBucket(null, { today: TODAY })).toBe('noDate')
    expect(getTaskDueBucket('garbage', { today: TODAY })).toBe('noDate')
  })

  it('puts done tasks in done whatever their due date', () => {
    expect(getTaskDueBucket('2020-01-01', { today: TODAY, done: true })).toBe('done')
    expect(getTaskDueBucket(null, { today: TODAY, done: true })).toBe('done')
  })

  it('moves with a different reference day (clock-free)', () => {
    expect(getTaskDueBucket('2026-10-17', { today: '2026-10-18' })).toBe('overdue')
  })
})

describe('groupTasksByDue', () => {
  it('returns every bucket in order, keeping relative item order', () => {
    const items: Item[] = [
      { id: 'a', due: '2026-10-20' },
      { id: 'b', due: '2026-10-01' },
      { id: 'c', due: null },
      { id: 'd', due: '2026-10-17' },
      { id: 'e', due: '2026-10-01', done: true },
      { id: 'f', due: '2026-10-19' },
    ]
    const groups = groupTasksByDue(items, accessors)
    expect(groups.map((g) => g.bucket)).toEqual([...TASK_DUE_BUCKETS])
    expect(groups.map((g) => g.items.map((i) => i.id))).toEqual([['b'], ['d'], ['a', 'f'], ['c'], ['e']])
  })

  it('keeps empty buckets so headers are stable', () => {
    const groups = groupTasksByDue<Item>([], accessors)
    expect(groups).toHaveLength(TASK_DUE_BUCKETS.length)
    expect(groups.every((g) => g.items.length === 0)).toBe(true)
  })
})

describe('describeTaskDue', () => {
  it.each([
    ['2026-10-17', 'Today', 'soon'],
    ['2026-10-18', 'Tomorrow', 'normal'],
    ['2026-10-16', 'Yesterday', 'overdue'],
    ['2026-10-14', '3d overdue', 'overdue'],
    ['2026-10-21', 'in 4d', 'normal'],
    ['2026-10-23', 'in 6d', 'normal'],
    ['2026-10-24', 'Oct 24', 'normal'],
    ['2027-01-05', 'Jan 5', 'normal'],
  ])('%s → %s (%s)', (due, label, tone) => {
    expect(describeTaskDue(due, { today: TODAY })).toEqual({ label, tone })
  })

  it('returns null without a valid date', () => {
    expect(describeTaskDue(null, { today: TODAY })).toBeNull()
    expect(describeTaskDue('nope', { today: TODAY })).toBeNull()
  })

  it('accepts localised labels', () => {
    expect(
      describeTaskDue('2026-10-12', { today: TODAY, labels: { overdue: (d) => `${d} Tage überfällig` } }),
    ).toEqual({ label: '5 Tage überfällig', tone: 'overdue' })
    expect(describeTaskDue('2026-12-25', { today: TODAY, labels: { date: (d) => `${d.day}/${d.month}` } })?.label).toBe(
      '25/12',
    )
  })
})

describe('countTaskGroup + formatTaskGroupSummary', () => {
  const items: Item[] = [
    { id: 'a', due: '2026-10-01' },
    { id: 'b', due: '2026-10-17' },
    { id: 'c', due: null },
    { id: 'd', due: '2026-10-30' },
    { id: 'e', done: true },
  ]

  it('counts open, overdue (subset of open) and done', () => {
    expect(countTaskGroup(items, accessors)).toEqual({ open: 4, overdue: 1, done: 1 })
  })

  it('formats "4 open · 1 overdue · 1 done"', () => {
    expect(formatTaskGroupSummary({ open: 4, overdue: 1 })).toBe('4 open · 1 overdue')
    expect(formatTaskGroupSummary(countTaskGroup(items, accessors))).toBe('4 open · 1 overdue · 1 done')
  })

  it('drops zero segments but always states open when nothing is done', () => {
    expect(formatTaskGroupSummary({ open: 3 })).toBe('3 open')
    expect(formatTaskGroupSummary({ done: 2 })).toBe('2 done')
    expect(formatTaskGroupSummary({})).toBe('0 open')
  })

  it('accepts overridden labels and separator', () => {
    expect(
      formatTaskGroupSummary(
        { open: 2, overdue: 1 },
        { open: (n) => `${n} offen`, overdue: (n) => `${n} überfällig`, separator: ' / ' },
      ),
    ).toBe('2 offen / 1 überfällig')
  })
})

describe('reduceTaskSelection', () => {
  const order = ['a', 'b', 'c', 'd', 'e']
  const state = (selectedIds: string[], anchorId: string | null = null): TaskSelectionState => ({
    selectedIds,
    anchorId,
  })

  it('toggle adds/removes and sets the anchor', () => {
    const one = reduceTaskSelection(TASK_SELECTION_EMPTY, { type: 'toggle', id: 'b' })
    expect(one).toEqual(state(['b'], 'b'))
    expect(reduceTaskSelection(one, { type: 'toggle', id: 'b' })).toEqual(state([], 'b'))
  })

  it('range selects every row between the anchor and the target, either direction', () => {
    const anchored = state(['b'], 'b')
    expect(reduceTaskSelection(anchored, { type: 'range', id: 'd', order })).toEqual(state(['b', 'c', 'd'], 'b'))
    const fromD = state(['d'], 'd')
    expect(reduceTaskSelection(fromD, { type: 'range', id: 'a', order }).selectedIds.sort()).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
  })

  it('range keeps the anchor so the range can be re-extended', () => {
    const first = reduceTaskSelection(state(['b'], 'b'), { type: 'range', id: 'e', order })
    expect(first.anchorId).toBe('b')
    expect(reduceTaskSelection(first, { type: 'range', id: 'c', order }).anchorId).toBe('b')
  })

  it('range applies the clicked row’s new state (deselects when it was selected)', () => {
    const all = state(['a', 'b', 'c', 'd', 'e'], 'b')
    expect(reduceTaskSelection(all, { type: 'range', id: 'd', order })).toEqual(state(['a', 'e'], 'b'))
  })

  it('range without a usable anchor falls back to toggle', () => {
    expect(reduceTaskSelection(TASK_SELECTION_EMPTY, { type: 'range', id: 'c', order })).toEqual(state(['c'], 'c'))
    expect(reduceTaskSelection(state([], 'gone'), { type: 'range', id: 'c', order })).toEqual(state(['c'], 'c'))
    // Target not visible (e.g. in a folded group): toggle it on its own.
    expect(reduceTaskSelection(state(['a'], 'a'), { type: 'range', id: 'z', order })).toEqual(state(['a', 'z'], 'z'))
  })

  it('selectAll unions without duplicates; clear empties', () => {
    const s = reduceTaskSelection(state(['hidden', 'b'], 'b'), { type: 'selectAll', ids: order })
    expect(s.selectedIds).toEqual(['hidden', 'b', 'a', 'c', 'd', 'e'])
    expect(s.anchorId).toBe('b')
    expect(reduceTaskSelection(s, { type: 'clear' })).toEqual(TASK_SELECTION_EMPTY)
  })

  it('prune drops ids that no longer exist (and a stale anchor)', () => {
    expect(reduceTaskSelection(state(['a', 'x', 'c'], 'x'), { type: 'prune', ids: order })).toEqual(
      state(['a', 'c'], null),
    )
    expect(reduceTaskSelection(state(['a'], 'a'), { type: 'prune', ids: order }).anchorId).toBe('a')
  })
})

describe('select all', () => {
  it('derives none / all / mixed over the visible rows only', () => {
    expect(getTaskSelectAllState([], ['a', 'b'])).toBe(false)
    expect(getTaskSelectAllState(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(getTaskSelectAllState(['a'], ['a', 'b'])).toBe('indeterminate')
    expect(getTaskSelectAllState(['hidden'], ['a', 'b'])).toBe(false)
    expect(getTaskSelectAllState(['a'], [])).toBe(false)
  })

  it('clears when fully selected, otherwise selects all visible', () => {
    expect(getTaskSelectAllAction(true, ['a'])).toEqual({ type: 'clear' })
    expect(getTaskSelectAllAction(false, ['a'])).toEqual({ type: 'selectAll', ids: ['a'] })
    expect(getTaskSelectAllAction('indeterminate', ['a', 'b'])).toEqual({ type: 'selectAll', ids: ['a', 'b'] })
  })
})

describe('formatBulkActionCount', () => {
  it('formats a count and is empty at zero (keeps the live region quiet)', () => {
    expect(formatBulkActionCount(3)).toBe('3 selected')
    expect(formatBulkActionCount(0)).toBe('')
    expect(formatBulkActionCount(-2)).toBe('')
    expect(formatBulkActionCount(2.7)).toBe('2 selected')
    expect(formatBulkActionCount(1, { selected: (n) => `${n} ausgewählt` })).toBe('1 ausgewählt')
  })
})

describe('keyboard', () => {
  it('maps arrows/Home/End to moves and ignores other keys', () => {
    expect(getTaskNavMove('ArrowDown')).toBe('next')
    expect(getTaskNavMove('ArrowUp')).toBe('previous')
    expect(getTaskNavMove('Home')).toBe('first')
    expect(getTaskNavMove('End')).toBe('last')
    expect(getTaskNavMove('ArrowLeft')).toBeNull()
    expect(getTaskNavMove('a')).toBeNull()
  })

  it('clamps at the ends instead of wrapping', () => {
    expect(getNextTaskNavIndex(0, 'next', 3)).toBe(1)
    expect(getNextTaskNavIndex(2, 'next', 3)).toBe(2)
    expect(getNextTaskNavIndex(0, 'previous', 3)).toBe(0)
    expect(getNextTaskNavIndex(2, 'previous', 3)).toBe(1)
    expect(getNextTaskNavIndex(1, 'first', 3)).toBe(0)
    expect(getNextTaskNavIndex(1, 'last', 3)).toBe(2)
  })

  it('handles an unknown current index and an empty list', () => {
    expect(getNextTaskNavIndex(-1, 'next', 3)).toBe(0)
    expect(getNextTaskNavIndex(-1, 'previous', 3)).toBe(0)
    expect(getNextTaskNavIndex(9, 'previous', 3)).toBe(2)
    expect(getNextTaskNavIndex(0, 'next', 0)).toBe(-1)
  })

  it('row keys: Space toggles completion or selection, Shift+Space ranges, Enter opens', () => {
    expect(getTaskRowKeyAction(' ')).toBe('toggleCompletion')
    expect(getTaskRowKeyAction('Spacebar')).toBe('toggleCompletion')
    expect(getTaskRowKeyAction(' ', { shiftKey: true })).toBe('toggleCompletion')
    expect(getTaskRowKeyAction(' ', { selectionMode: true })).toBe('toggleSelection')
    expect(getTaskRowKeyAction(' ', { selectionMode: true, shiftKey: true })).toBe('selectRange')
    expect(getTaskRowKeyAction('Enter')).toBe('open')
    expect(getTaskRowKeyAction('Enter', { selectionMode: true })).toBe('open')
    expect(getTaskRowKeyAction('x')).toBeNull()
  })
})

describe('getTaskCompletionDelay', () => {
  it('waits the settle time when completing', () => {
    expect(getTaskCompletionDelay(true)).toBe(TASK_COMPLETION_SETTLE_MS)
    expect(getTaskCompletionDelay(true, { settleMs: 200 })).toBe(200)
    expect(getTaskCompletionDelay(true, { settleMs: -5 })).toBe(0)
  })

  it('is immediate when un-completing or under reduced motion', () => {
    expect(getTaskCompletionDelay(false)).toBe(0)
    expect(getTaskCompletionDelay(true, { reducedMotion: true })).toBe(0)
  })
})

describe('row state text and data attributes', () => {
  it('describes state in words so nothing is styling-only', () => {
    expect(describeTaskRowState({ completed: false })).toBe('Not completed')
    expect(describeTaskRowState({ completed: true, unseen: true, selected: true })).toBe('Completed, Unseen, Selected')
    expect(describeTaskRowState({ completed: false, unseen: true }, { unseen: 'Neu' })).toBe('Not completed, Neu')
  })

  it('emits styling hooks', () => {
    expect(getTaskRowDataAttributes({ completed: false })).toEqual({ 'data-state': 'open' })
    expect(getTaskRowDataAttributes({ completed: true, unseen: true, selected: true, readOnly: true })).toEqual({
      'data-state': 'completed',
      'data-unseen': '',
      'data-selected': '',
      'data-readonly': '',
    })
  })
})

describe('styles', () => {
  it('uses string variants and stops motion under reduced motion', () => {
    expect(taskRowVariants({ selected: 'true' })).toContain('bg-accent')
    expect(taskRowVariants()).toContain('focus-visible:ring-2')
    expect(taskRowTitleVariants({ completed: 'true', unseen: 'true' })).toContain('line-through')
    expect(taskRowTitleVariants({ completed: 'true', unseen: 'true' })).toContain('font-semibold')
    expect(taskRowTitleVariants()).toContain('motion-reduce:transition-none')
    expect(taskRowDueChipVariants({ tone: 'overdue' })).toContain('text-destructive')
    expect(taskGroupTitleVariants({ bucket: 'overdue' })).toContain('text-destructive')
  })
})
