/**
 * Headless logic for a grouped to-do list: due-date bucketing, group header
 * counts, multi-row selection (with Shift ranges and select-all) and the
 * keyboard map shared by every adapter.
 *
 * Deterministic by design: "today" is always an argument, never read from the
 * clock, so grouping is testable and stable across a render.
 */

// ---------------------------------------------------------------------------
// Due dates
// ---------------------------------------------------------------------------

/** The bucket a task falls into relative to an injected "today". */
export type TaskDueBucket = 'overdue' | 'today' | 'upcoming' | 'noDate' | 'done'

/** How urgently a due chip should read. */
export type TaskDueTone = 'normal' | 'soon' | 'overdue'

/**
 * A calendar date: a `Date` (its local calendar day is used), a plain
 * `YYYY-MM-DD` string (read as that calendar day, never shifted by time zone),
 * or any other string `Date` can parse. `null`/`undefined` mean "no date".
 */
export type TaskDateInput = Date | string | null | undefined

/** Bucket order, top to bottom, used for group rendering. */
export const TASK_DUE_BUCKETS: readonly TaskDueBucket[] = [
  'overdue',
  'today',
  'upcoming',
  'noDate',
  'done',
]

/** Default (English) group titles for each bucket. */
export const TASK_DUE_BUCKET_LABELS: Readonly<Record<TaskDueBucket, string>> = {
  overdue: 'Overdue',
  today: 'Today',
  upcoming: 'Upcoming',
  noDate: 'No due date',
  done: 'Done',
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const ISO_DAY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Days ahead within which an upcoming date still reads relatively ("in 4d")
 * rather than as a calendar date. Matches the Flutter `RefractionDueDates`.
 */
export const TASK_DUE_RELATIVE_HORIZON_DAYS = 6

const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

/** A calendar day as numbers (month is 1-based). */
export interface TaskCalendarDay {
  year: number
  month: number
  day: number
}

/** Parse a date input into its calendar day, or `null` when absent/invalid. */
export function toTaskCalendarDay(value: TaskDateInput): TaskCalendarDay | null {
  if (value == null) return null
  if (typeof value === 'string') {
    const match = ISO_DAY_PATTERN.exec(value.trim())
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
    }
    return dateToCalendarDay(new Date(value))
  }
  return dateToCalendarDay(value)
}

function dateToCalendarDay(date: Date): TaskCalendarDay | null {
  if (Number.isNaN(date.getTime())) return null
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }
}

/**
 * A calendar day as a whole-day ordinal. Using UTC arithmetic on the calendar
 * fields (not the instant) keeps day differences exact across DST changes.
 */
function toDayOrdinal(day: TaskCalendarDay): number {
  return Math.round(Date.UTC(day.year, day.month - 1, day.day) / MS_PER_DAY)
}

/** Whole calendar days from `today` to `due` (negative = in the past), or `null`. */
export function getTaskDayDifference(due: TaskDateInput, today: TaskDateInput): number | null {
  const dueDay = toTaskCalendarDay(due)
  const todayDay = toTaskCalendarDay(today)
  if (!dueDay || !todayDay) return null
  return toDayOrdinal(dueDay) - toDayOrdinal(todayDay)
}

export interface TaskBucketOptions {
  /** The reference day (inject it; the core never reads the clock). */
  today: TaskDateInput
  /** A done task is always in `done`, whatever its due date. */
  done?: boolean
}

/** The bucket for a task due on `due` (absent = `noDate`). */
export function getTaskDueBucket(due: TaskDateInput, options: TaskBucketOptions): TaskDueBucket {
  if (options.done) return 'done'
  const diff = getTaskDayDifference(due, options.today)
  if (diff === null) return 'noDate'
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  return 'upcoming'
}

export interface TaskAccessors<T> {
  /** The reference day. */
  today: TaskDateInput
  /** Reads an item's due date. */
  dueOf: (item: T) => TaskDateInput
  /** Reads whether an item is done. */
  isDone: (item: T) => boolean
}

/** One bucket of tasks, in render order. */
export interface TaskBucketGroup<T> {
  bucket: TaskDueBucket
  items: T[]
}

/**
 * Sort items into every bucket, in {@link TASK_DUE_BUCKETS} order, keeping each
 * bucket's items in their original relative order. Every bucket is present
 * (possibly empty) so a list can render stable group headers.
 */
export function groupTasksByDue<T>(items: Iterable<T>, accessors: TaskAccessors<T>): TaskBucketGroup<T>[] {
  const byBucket = new Map<TaskDueBucket, T[]>(TASK_DUE_BUCKETS.map((b) => [b, []]))
  for (const item of items) {
    const bucket = getTaskDueBucket(accessors.dueOf(item), {
      today: accessors.today,
      done: accessors.isDone(item),
    })
    byBucket.get(bucket)?.push(item)
  }
  return TASK_DUE_BUCKETS.map((bucket) => ({ bucket, items: byBucket.get(bucket) ?? [] }))
}

/** Overridable words for {@link describeTaskDue}. */
export interface TaskDueLabels {
  today: string
  tomorrow: string
  yesterday: string
  overdue: (days: number) => string
  inDays: (days: number) => string
  date: (day: TaskCalendarDay) => string
}

export const TASK_DUE_DEFAULT_LABELS: TaskDueLabels = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  yesterday: 'Yesterday',
  overdue: (days) => `${days}d overdue`,
  inDays: (days) => `in ${days}d`,
  date: ({ month, day }) => `${MONTH_ABBREVIATIONS[month - 1]} ${day}`,
}

export interface TaskDueDescription {
  label: string
  tone: TaskDueTone
}

/**
 * Describe a due date relative to `today` for a due chip: "Today", "Tomorrow",
 * "Yesterday", "3d overdue", "in 4d" or "Sep 30", plus the tone it renders in.
 * Returns `null` for a missing/invalid date. Hosts with their own localisation
 * pass `labels`.
 */
export function describeTaskDue(
  due: TaskDateInput,
  options: { today: TaskDateInput; labels?: Partial<TaskDueLabels> },
): TaskDueDescription | null {
  const labels = { ...TASK_DUE_DEFAULT_LABELS, ...options.labels }
  const days = getTaskDayDifference(due, options.today)
  const dueDay = toTaskCalendarDay(due)
  if (days === null || !dueDay) return null
  if (days === 0) return { label: labels.today, tone: 'soon' }
  if (days === 1) return { label: labels.tomorrow, tone: 'normal' }
  if (days === -1) return { label: labels.yesterday, tone: 'overdue' }
  if (days < 0) return { label: labels.overdue(-days), tone: 'overdue' }
  if (days <= TASK_DUE_RELATIVE_HORIZON_DAYS) return { label: labels.inDays(days), tone: 'normal' }
  return { label: labels.date(dueDay), tone: 'normal' }
}

// ---------------------------------------------------------------------------
// Group header counts
// ---------------------------------------------------------------------------

/** Counts summarised in a group header. */
export interface TaskGroupCounts {
  /** Not-done tasks. */
  open: number
  /** Not-done tasks past their due day (a subset of `open`). */
  overdue: number
  /** Done tasks. */
  done: number
}

/** Count open / overdue / done items for a group header. */
export function countTaskGroup<T>(items: Iterable<T>, accessors: TaskAccessors<T>): TaskGroupCounts {
  const counts: TaskGroupCounts = { open: 0, overdue: 0, done: 0 }
  for (const item of items) {
    const bucket = getTaskDueBucket(accessors.dueOf(item), {
      today: accessors.today,
      done: accessors.isDone(item),
    })
    if (bucket === 'done') {
      counts.done += 1
      continue
    }
    counts.open += 1
    if (bucket === 'overdue') counts.overdue += 1
  }
  return counts
}

/** Overridable words for {@link formatTaskGroupSummary}. */
export interface TaskCountLabels {
  open: (count: number) => string
  overdue: (count: number) => string
  done: (count: number) => string
  separator: string
}

export const TASK_COUNT_DEFAULT_LABELS: TaskCountLabels = {
  open: (count) => `${count} open`,
  overdue: (count) => `${count} overdue`,
  done: (count) => `${count} done`,
  separator: ' · ',
}

/**
 * Header summary such as "4 open · 1 overdue". Zero segments are dropped,
 * except that a group with nothing done always states its open count (so an
 * empty group reads "0 open" rather than nothing).
 */
export function formatTaskGroupSummary(
  counts: Partial<TaskGroupCounts>,
  labels: Partial<TaskCountLabels> = {},
): string {
  const words = { ...TASK_COUNT_DEFAULT_LABELS, ...labels }
  const open = counts.open ?? 0
  const overdue = counts.overdue ?? 0
  const done = counts.done ?? 0
  const segments: string[] = []
  if (open > 0 || done === 0) segments.push(words.open(open))
  if (overdue > 0) segments.push(words.overdue(overdue))
  if (done > 0) segments.push(words.done(done))
  return segments.join(words.separator)
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

/** Multi-row selection: the selected ids plus the Shift-click anchor. */
export interface TaskSelectionState {
  selectedIds: readonly string[]
  /** Row a Shift range extends from (the last plainly toggled row). */
  anchorId: string | null
}

export type TaskSelectionAction =
  /** Toggle one row and make it the range anchor. */
  | { type: 'toggle'; id: string }
  /**
   * Shift-click: apply the clicked row's new state to every row between the
   * anchor and it in `order` (the visible order). Without a usable anchor it
   * behaves like `toggle`. The anchor stays put so ranges can be adjusted.
   */
  | { type: 'range'; id: string; order: readonly string[] }
  /** Add every id in `ids` (the visible rows) to the selection. */
  | { type: 'selectAll'; ids: readonly string[] }
  /** Select nothing. */
  | { type: 'clear' }
  /** Drop selected ids that no longer exist. */
  | { type: 'prune'; ids: readonly string[] }

export const TASK_SELECTION_EMPTY: TaskSelectionState = { selectedIds: [], anchorId: null }

/** Pure selection reducer shared by every adapter. */
export function reduceTaskSelection(
  state: TaskSelectionState,
  action: TaskSelectionAction,
): TaskSelectionState {
  switch (action.type) {
    case 'toggle':
      return { selectedIds: toggleId(state.selectedIds, action.id), anchorId: action.id }
    case 'range':
      return applyRange(state, action.id, action.order)
    case 'selectAll':
      return { ...state, selectedIds: union(state.selectedIds, action.ids) }
    case 'clear':
      return TASK_SELECTION_EMPTY
    case 'prune': {
      const keep = new Set(action.ids)
      const anchorId = state.anchorId !== null && keep.has(state.anchorId) ? state.anchorId : null
      return { selectedIds: state.selectedIds.filter((id) => keep.has(id)), anchorId }
    }
    default:
      return state
  }
}

function toggleId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

function union(ids: readonly string[], add: readonly string[]): string[] {
  const seen = new Set(ids)
  const result = [...ids]
  for (const id of add) {
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }
  return result
}

function applyRange(state: TaskSelectionState, id: string, order: readonly string[]): TaskSelectionState {
  const from = state.anchorId === null ? -1 : order.indexOf(state.anchorId)
  const to = order.indexOf(id)
  if (from === -1 || to === -1) return reduceTaskSelection(state, { type: 'toggle', id })

  const range = order.slice(Math.min(from, to), Math.max(from, to) + 1)
  const select = !state.selectedIds.includes(id)
  const inRange = new Set(range)
  const selectedIds = select
    ? union(state.selectedIds, range)
    : state.selectedIds.filter((x) => !inRange.has(x))
  return { selectedIds, anchorId: state.anchorId }
}

/** Tri-state of a select-all checkbox, compatible with Checkbox `checked`. */
export type TaskSelectAllState = boolean | 'indeterminate'

/** `true` when every visible row is selected, `false` when none, else mixed. */
export function getTaskSelectAllState(
  selectedIds: readonly string[],
  visibleIds: readonly string[],
): TaskSelectAllState {
  if (visibleIds.length === 0) return false
  const selected = new Set(selectedIds)
  const count = visibleIds.filter((id) => selected.has(id)).length
  if (count === 0) return false
  return count === visibleIds.length ? true : 'indeterminate'
}

/** The action a select-all checkbox performs from its current state. */
export function getTaskSelectAllAction(
  state: TaskSelectAllState,
  visibleIds: readonly string[],
): TaskSelectionAction {
  return state === true ? { type: 'clear' } : { type: 'selectAll', ids: visibleIds }
}

/** Overridable words for the bulk action bar count. */
export interface BulkActionBarLabels {
  selected: (count: number) => string
}

export const BULK_ACTION_BAR_DEFAULT_LABELS: BulkActionBarLabels = {
  selected: (count) => `${count} selected`,
}

/** "3 selected" (empty when nothing is selected, so a live region stays quiet). */
export function formatBulkActionCount(count: number, labels: Partial<BulkActionBarLabels> = {}): string {
  const safe = Math.max(0, Math.floor(count))
  if (safe === 0) return ''
  return { ...BULK_ACTION_BAR_DEFAULT_LABELS, ...labels }.selected(safe)
}

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

/** Where an arrow/Home/End key moves focus among rows and group headers. */
export type TaskNavMove = 'next' | 'previous' | 'first' | 'last'

const NAV_KEYS: Readonly<Record<string, TaskNavMove>> = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  Home: 'first',
  End: 'last',
}

/** Map a key to a focus move, or `null` when the key is not a nav key. */
export function getTaskNavMove(key: string): TaskNavMove | null {
  return NAV_KEYS[key] ?? null
}

/** Target index for a move among `count` stops. Clamps at the ends (no wrap). */
export function getNextTaskNavIndex(current: number, move: TaskNavMove, count: number): number {
  if (count <= 0) return -1
  switch (move) {
    case 'first':
      return 0
    case 'last':
      return count - 1
    case 'next':
      return Math.min(Math.max(current, -1) + 1, count - 1)
    case 'previous':
      return Math.max(Math.min(current, count) - 1, 0)
    default:
      return current
  }
}

/** What a key does on a focused row. */
export type TaskRowKeyAction = 'toggleCompletion' | 'toggleSelection' | 'selectRange' | 'open'

const SPACE_KEYS = new Set([' ', 'Spacebar'])

/**
 * Row key map: Space toggles completion (or, in selection mode, selection;
 * Shift+Space extends the range), Enter opens the task. Other keys → `null`.
 */
export function getTaskRowKeyAction(
  key: string,
  options: { selectionMode?: boolean; shiftKey?: boolean } = {},
): TaskRowKeyAction | null {
  if (key === 'Enter') return 'open'
  if (!SPACE_KEYS.has(key)) return null
  if (!options.selectionMode) return 'toggleCompletion'
  return options.shiftKey ? 'selectRange' : 'toggleSelection'
}

// ---------------------------------------------------------------------------
// Completion timing and row state text
// ---------------------------------------------------------------------------

/** Default pause between the completion animation starting and the callback. */
export const TASK_COMPLETION_SETTLE_MS = 650

/**
 * How long to wait before reporting a completion change. Completing waits for
 * the animation to land so a host that moves done rows away does so after the
 * user saw it; un-completing, and anything under reduced motion, is immediate.
 */
export function getTaskCompletionDelay(
  nextCompleted: boolean,
  options: { settleMs?: number; reducedMotion?: boolean } = {},
): number {
  if (!nextCompleted || options.reducedMotion) return 0
  return Math.max(0, options.settleMs ?? TASK_COMPLETION_SETTLE_MS)
}

/** Overridable words a row uses for its controls and screen-reader state. */
export interface TaskRowLabels {
  complete: (title: string) => string
  select: (title: string) => string
  completed: string
  notCompleted: string
  unseen: string
  selected: string
  readOnly: string
}

export const TASK_ROW_DEFAULT_LABELS: TaskRowLabels = {
  complete: (title) => `Complete ${title}`,
  select: (title) => `Select ${title}`,
  completed: 'Completed',
  notCompleted: 'Not completed',
  unseen: 'Unseen',
  selected: 'Selected',
  readOnly: 'You can’t complete this task',
}

/**
 * The text alternative for a row's visual state (strike-through, unseen dot
 * and bold title, selection highlight), so none of it is conveyed by styling
 * alone. E.g. "Not completed, Unseen".
 */
export function describeTaskRowState(
  state: { completed: boolean; unseen?: boolean; selected?: boolean },
  labels: Partial<TaskRowLabels> = {},
): string {
  const words = { ...TASK_ROW_DEFAULT_LABELS, ...labels }
  const parts = [state.completed ? words.completed : words.notCompleted]
  if (state.unseen) parts.push(words.unseen)
  if (state.selected) parts.push(words.selected)
  return parts.join(', ')
}

/** Data attributes for a row's styling hooks. */
export function getTaskRowDataAttributes(state: {
  completed: boolean
  unseen?: boolean
  selected?: boolean
  readOnly?: boolean
}): Record<string, string> {
  const attrs: Record<string, string> = { 'data-state': state.completed ? 'completed' : 'open' }
  if (state.unseen) attrs['data-unseen'] = ''
  if (state.selected) attrs['data-selected'] = ''
  if (state.readOnly) attrs['data-readonly'] = ''
  return attrs
}
