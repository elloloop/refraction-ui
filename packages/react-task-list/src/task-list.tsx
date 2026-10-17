import * as React from 'react'
import {
  reduceTaskSelection,
  getTaskSelectAllState,
  getTaskSelectAllAction,
  getTaskNavMove,
  getNextTaskNavIndex,
  getTaskRowKeyAction,
  getTaskCompletionDelay,
  describeTaskRowState,
  getTaskRowDataAttributes,
  formatTaskGroupSummary,
  formatBulkActionCount,
  TASK_COMPLETION_SETTLE_MS,
  TASK_ROW_DEFAULT_LABELS,
  taskListClass,
  taskListToolbarClass,
  taskListSelectAllLabelClass,
  taskGroupClass,
  taskGroupHeaderClass,
  taskGroupTriggerClass,
  taskGroupChevronClass,
  taskGroupTitleVariants,
  taskGroupSummaryClass,
  taskGroupBodyClass,
  taskGroupEmptyClass,
  taskRowVariants,
  taskRowCheckClass,
  taskRowTitleVariants,
  taskRowUnseenDotClass,
  taskRowDueChipVariants,
  taskRowSlotClass,
  taskSrOnlyClass,
  bulkActionBarClass,
  bulkActionBarCountClass,
  bulkActionBarActionsClass,
  bulkActionBarClearClass,
  type TaskSelectionAction,
  type TaskDueBucket,
  type TaskDueTone,
  type TaskGroupCounts,
  type TaskCountLabels,
  type TaskRowLabels,
  type BulkActionBarLabels,
} from '@refraction-ui/task-list'
import { Checkbox } from '@refraction-ui/react-checkbox'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@refraction-ui/react-collapsible'
import { cn, prefersReducedMotion } from '@refraction-ui/shared'

/** Marks every arrow-key stop (group headers and rows) inside a TaskList. */
const NAV_ATTRIBUTE = 'data-task-nav'
const NAV_SELECTOR = `[${NAV_ATTRIBUTE}]`
const ROW_ID_ATTRIBUTE = 'data-task-id'
const ROW_SELECTOR = `[${ROW_ID_ATTRIBUTE}]`
/** Clicks on these inside a row act on the control, not "open the task". */
const ROW_CONTROL_SELECTOR = 'a,button,input,select,textarea,[role="checkbox"],[role="button"]'

const DEFAULT_SELECT_ALL_LABEL = 'Select all'
const DEFAULT_BULK_BAR_LABEL = 'Bulk actions'
const DEFAULT_CLEAR_LABEL = 'Clear selection'

/** `matchMedia` is missing in some non-browser hosts; treat that as "motion ok". */
function readReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return prefersReducedMotion()
}

function isTextEntry(el: HTMLElement): boolean {
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
}

function joinIds(...ids: Array<string | false | undefined>): string | undefined {
  const present = ids.filter(Boolean)
  return present.length > 0 ? present.join(' ') : undefined
}

// ---------------------------------------------------------------------------
// Context (selection + row registry)
// ---------------------------------------------------------------------------

interface TaskListContextValue {
  selectionMode: boolean
  isSelected: (taskId: string) => boolean
  toggleSelection: (taskId: string, range: boolean) => void
  registerRow: (taskId: string) => () => void
}

const TaskListContext = React.createContext<TaskListContextValue | null>(null)

// ---------------------------------------------------------------------------
// TaskList
// ---------------------------------------------------------------------------

export interface TaskListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** `TaskGroup`s (each holding `TaskRow`s). */
  children?: React.ReactNode
  /** Accessible name for the whole list. */
  semanticLabel?: string
  /** Shows a selection checkbox column and a select-all checkbox. */
  selectionMode?: boolean
  /** Controlled selected task ids. */
  selectedIds?: string[]
  /** Initial selected task ids when uncontrolled. */
  defaultSelectedIds?: string[]
  /** Called with the next selected ids. */
  onSelectedIdsChange?: (selectedIds: string[]) => void
  /** Text of the select-all checkbox. */
  selectAllLabel?: string
}

/**
 * TaskList — a stack of `TaskGroup`s with keyboard navigation: ↑/↓ move between
 * group headers and rows across groups, Home/End jump to the first/last, Space
 * toggles the focused row and Enter opens it. In `selectionMode` rows gain a
 * selection checkbox (Shift-click or Shift+Space selects a range over the
 * visible order) and a select-all checkbox appears above the groups.
 */
export const TaskList = React.forwardRef<HTMLDivElement, TaskListProps>(function TaskList(
  {
    children,
    semanticLabel,
    selectionMode = false,
    selectedIds: selectedIdsProp,
    defaultSelectedIds,
    onSelectedIdsChange,
    selectAllLabel = DEFAULT_SELECT_ALL_LABEL,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const setRootRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const isControlled = selectedIdsProp !== undefined
  const [internalIds, setInternalIds] = React.useState<string[]>(defaultSelectedIds ?? [])
  const selectedIds = isControlled ? selectedIdsProp : internalIds
  const anchorRef = React.useRef<string | null>(null)
  const [mountedIds, setMountedIds] = React.useState<string[]>([])
  const selectAllId = React.useId()

  /** Row ids in on-screen order; rows in folded groups are not mounted. */
  const readVisibleOrder = React.useCallback((): string[] => {
    const root = rootRef.current
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>(ROW_SELECTOR)).map(
      (el) => el.getAttribute(ROW_ID_ATTRIBUTE) ?? '',
    )
  }, [])

  const dispatch = React.useCallback(
    (action: TaskSelectionAction) => {
      const next = reduceTaskSelection({ selectedIds, anchorId: anchorRef.current }, action)
      anchorRef.current = next.anchorId
      const ids = [...next.selectedIds]
      if (!isControlled) setInternalIds(ids)
      onSelectedIdsChange?.(ids)
    },
    [selectedIds, isControlled, onSelectedIdsChange],
  )

  const registerRow = React.useCallback((taskId: string) => {
    setMountedIds((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]))
    return () => setMountedIds((prev) => prev.filter((id) => id !== taskId))
  }, [])

  const ctx = React.useMemo<TaskListContextValue>(
    () => ({
      selectionMode,
      isSelected: (taskId) => selectedIds.includes(taskId),
      toggleSelection: (taskId, range) =>
        dispatch(range ? { type: 'range', id: taskId, order: readVisibleOrder() } : { type: 'toggle', id: taskId }),
      registerRow,
    }),
    [selectionMode, selectedIds, dispatch, readVisibleOrder, registerRow],
  )

  const selectAllState = getTaskSelectAllState(selectedIds, mountedIds)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const move = getTaskNavMove(event.key)
    const root = rootRef.current
    const target = event.target as HTMLElement
    if (!move || !root || isTextEntry(target)) return
    const current = target.closest<HTMLElement>(NAV_SELECTOR)
    if (!current || !root.contains(current)) return

    const stops = Array.from(root.querySelectorAll<HTMLElement>(NAV_SELECTOR))
    const next = stops[getNextTaskNavIndex(stops.indexOf(current), move, stops.length)]
    event.preventDefault()
    next?.focus()
  }

  return (
    <div
      ref={setRootRef}
      role="group"
      aria-label={semanticLabel}
      className={cn(taskListClass, className)}
      data-selection-mode={selectionMode ? '' : undefined}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {selectionMode && (
        <div className={taskListToolbarClass}>
          <label className={taskListSelectAllLabelClass} htmlFor={selectAllId}>
            <Checkbox
              id={selectAllId}
              checked={selectAllState}
              className={taskRowCheckClass}
              onCheckedChange={() => dispatch(getTaskSelectAllAction(selectAllState, readVisibleOrder()))}
            />
            <span>{selectAllLabel}</span>
          </label>
        </div>
      )}
      <TaskListContext.Provider value={ctx}>{children}</TaskListContext.Provider>
    </div>
  )
})

// ---------------------------------------------------------------------------
// TaskGroup
// ---------------------------------------------------------------------------

export interface TaskGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  /** Group title (e.g. "Overdue"). */
  title: string
  /** `TaskRow`s. */
  children?: React.ReactNode
  /** Count shown in the header when `counts` is absent; defaults to the number of rows. */
  count?: number
  /** Open / overdue / done counts, shown as "4 open · 1 overdue". */
  counts?: Partial<TaskGroupCounts>
  /** Overrides the words and separator of the `counts` summary. */
  countLabels?: Partial<TaskCountLabels>
  /** Due bucket this group shows; `done` folds by default and overdue gets its tone. */
  bucket?: TaskDueBucket
  /** Controlled expansion state. */
  expanded?: boolean
  /** Initial state when uncontrolled. Defaults to `false` for the done bucket, else `true`. */
  initiallyExpanded?: boolean
  /** Called with the requested expansion state. */
  onExpandedChanged?: (expanded: boolean) => void
  /** Content at the end of the header (e.g. an "Add" button). */
  trailing?: React.ReactNode
  /** Shown instead of rows when the group is empty. */
  emptyLabel?: string
}

/**
 * TaskGroup — a foldable section of a TaskList. The header is a button with
 * `aria-expanded` (Enter/Space folds it) built on the shared Collapsible;
 * folded rows are unmounted so they leave the tab order and the visible order.
 */
export const TaskGroup = React.forwardRef<HTMLDivElement, TaskGroupProps>(function TaskGroup(
  {
    title,
    children,
    count,
    counts,
    countLabels,
    bucket,
    expanded: expandedProp,
    initiallyExpanded,
    onExpandedChanged,
    trailing,
    emptyLabel,
    className,
    ...props
  },
  ref,
) {
  const [internalOpen, setInternalOpen] = React.useState(initiallyExpanded ?? bucket !== 'done')
  const isControlled = expandedProp !== undefined
  const open = isControlled ? expandedProp : internalOpen
  const baseId = React.useId()
  const triggerId = `${baseId}-trigger`
  const contentId = `${baseId}-content`

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onExpandedChanged?.(next)
  }

  const rowCount = React.Children.count(children)
  const summary = counts ? formatTaskGroupSummary(counts, countLabels) : String(count ?? rowCount)

  return (
    <div
      ref={ref}
      className={cn(taskGroupClass, className)}
      data-bucket={bucket}
      data-state={open ? 'open' : 'closed'}
      {...props}
    >
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <div className={taskGroupHeaderClass}>
          <CollapsibleTrigger
            id={triggerId}
            aria-controls={contentId}
            className={taskGroupTriggerClass}
            {...{ [NAV_ATTRIBUTE]: '' }}
          >
            <svg
              className={taskGroupChevronClass}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className={taskGroupTitleVariants({ bucket: bucket ?? 'none' })}>{title}</span>
            <span className={taskSrOnlyClass}>, </span>
            <span className={taskGroupSummaryClass}>{summary}</span>
          </CollapsibleTrigger>
          {trailing}
        </div>
        <CollapsibleContent id={contentId} aria-labelledby={triggerId}>
          {rowCount === 0 ? (
            emptyLabel ? <p className={taskGroupEmptyClass}>{emptyLabel}</p> : null
          ) : (
            <ul role="list" className={taskGroupBodyClass}>
              {children}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
})

// ---------------------------------------------------------------------------
// TaskRow
// ---------------------------------------------------------------------------

export interface TaskRowProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, 'title' | 'children' | 'onSelect' | 'color'> {
  /** Stable id used for selection and Shift ranges. */
  taskId: string
  /** Task title. */
  title: string
  /** Whether the task is complete. */
  completed?: boolean
  /** Called with the requested completion state (after `completionSettle` when completing). */
  onCompletedChanged?: (completed: boolean) => void
  /** Opens the task (row click / Enter). */
  onTap?: () => void
  /** The viewer cannot complete this task: the checkbox is shown read-only. */
  readOnly?: boolean
  /** Why the checkbox is read-only (screen-reader description and tooltip). */
  readOnlyReason?: string
  /** Not yet seen by the viewer: a dot, a bold title and the word "Unseen". */
  unseen?: boolean
  /** Due chip text (see `describeTaskDue`). */
  dueLabel?: string
  /** Urgency tone of the due chip. */
  dueTone?: TaskDueTone
  /** Status slot (e.g. a StatusBadge). */
  status?: React.ReactNode
  /** Assignee slot (e.g. a small Avatar). */
  owner?: React.ReactNode
  /** Milliseconds between the completion animation starting and `onCompletedChanged`. */
  completionSettle?: number
  /** Accessible name for the row; defaults to the title. */
  semanticLabel?: string
  /** Overrides the row's control labels and state words. */
  labels?: Partial<TaskRowLabels>
}

/**
 * TaskRow — one task: completion checkbox (read-only when the viewer can't
 * complete it), title, due chip, status and owner slots, and an unseen dot.
 * The row is one focus stop; Space toggles completion (or selection in
 * selection mode) and Enter opens it. Completing animates, then reports after
 * `completionSettle`; under reduced motion it is static and immediate.
 */
export const TaskRow = React.forwardRef<HTMLLIElement, TaskRowProps>(function TaskRow(
  {
    taskId,
    title,
    completed = false,
    onCompletedChanged,
    onTap,
    readOnly = false,
    readOnlyReason,
    unseen = false,
    dueLabel,
    dueTone = 'normal',
    status,
    owner,
    completionSettle = TASK_COMPLETION_SETTLE_MS,
    semanticLabel,
    labels,
    className,
    onClick,
    onKeyDown,
    ...props
  },
  ref,
) {
  const ctx = React.useContext(TaskListContext)
  const registerRow = ctx?.registerRow
  React.useEffect(() => registerRow?.(taskId), [registerRow, taskId])

  const words = { ...TASK_ROW_DEFAULT_LABELS, ...labels }
  const selectionMode = ctx?.selectionMode ?? false
  const selected = selectionMode && (ctx?.isSelected(taskId) ?? false)
  const completable = !readOnly && onCompletedChanged !== undefined

  const [pending, setPending] = React.useState<boolean | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearTimer = () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
  }
  // Never report a completion after the row has gone.
  React.useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    },
    [],
  )

  const shownCompleted = pending ?? completed

  const requestCompletion = (next: boolean) => {
    if (!completable) return
    if (pending !== null) {
      // Toggled back before the settle elapsed: cancel instead of reporting.
      clearTimer()
      setPending(null)
      if (next === completed) return
    }
    const delay = getTaskCompletionDelay(next, { settleMs: completionSettle, reducedMotion: readReducedMotion() })
    if (delay === 0) {
      onCompletedChanged?.(next)
      return
    }
    setPending(next)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setPending(null)
      onCompletedChanged?.(next)
    }, delay)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(event)
    // Keys on inner controls (an owner link, a focused checkbox) are theirs.
    if (event.defaultPrevented || event.target !== event.currentTarget) return
    const action = getTaskRowKeyAction(event.key, { selectionMode, shiftKey: event.shiftKey })
    if (!action) return
    event.preventDefault()
    if (action === 'open') onTap?.()
    else if (action === 'toggleCompletion') requestCompletion(!shownCompleted)
    else ctx?.toggleSelection(taskId, action === 'selectRange')
  }

  const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
    onClick?.(event)
    const control = (event.target as HTMLElement).closest(ROW_CONTROL_SELECTOR)
    if (event.defaultPrevented || (control && event.currentTarget.contains(control))) return
    onTap?.()
  }

  const baseId = React.useId()
  const titleId = `${baseId}-title`
  const stateId = `${baseId}-state`
  const dueId = `${baseId}-due`
  const reasonId = `${baseId}-reason`
  const reason = readOnlyReason ?? words.readOnly

  return (
    <li
      ref={ref}
      tabIndex={0}
      aria-label={semanticLabel}
      aria-labelledby={semanticLabel ? undefined : titleId}
      aria-describedby={joinIds(stateId, dueLabel !== undefined && dueId, !completable && reasonId)}
      className={cn(taskRowVariants({ selected: selected ? 'true' : 'false' }), className)}
      data-completing={pending !== null ? '' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...{ [NAV_ATTRIBUTE]: '', [ROW_ID_ATTRIBUTE]: taskId }}
      {...getTaskRowDataAttributes({ completed: shownCompleted, unseen, selected, readOnly: !completable })}
      {...props}
    >
      {selectionMode && (
        <Checkbox
          tabIndex={-1}
          checked={selected}
          aria-label={words.select(title)}
          className={taskRowCheckClass}
          onClick={(event) => ctx?.toggleSelection(taskId, event.shiftKey)}
          onCheckedChange={() => ctx?.toggleSelection(taskId, false)}
        />
      )}
      <Checkbox
        tabIndex={-1}
        checked={shownCompleted}
        aria-label={words.complete(title)}
        aria-readonly={completable ? undefined : true}
        aria-describedby={completable ? undefined : reasonId}
        title={completable ? undefined : reason}
        data-readonly={completable ? undefined : ''}
        className={taskRowCheckClass}
        onCheckedChange={completable ? () => requestCompletion(!shownCompleted) : undefined}
      />
      {unseen && <span aria-hidden="true" className={taskRowUnseenDotClass} />}
      <span
        id={titleId}
        className={taskRowTitleVariants({
          completed: shownCompleted ? 'true' : 'false',
          unseen: unseen ? 'true' : 'false',
        })}
      >
        {title}
      </span>
      <span id={stateId} className={taskSrOnlyClass}>
        {describeTaskRowState({ completed: shownCompleted, unseen, selected }, labels)}
      </span>
      {!completable && (
        <span id={reasonId} className={taskSrOnlyClass}>
          {reason}
        </span>
      )}
      {dueLabel !== undefined && (
        <span id={dueId} className={taskRowDueChipVariants({ tone: shownCompleted ? 'normal' : dueTone })}>
          {dueLabel}
        </span>
      )}
      {status != null && <span className={taskRowSlotClass}>{status}</span>}
      {owner != null && <span className={taskRowSlotClass}>{owner}</span>}
    </li>
  )
})

// ---------------------------------------------------------------------------
// BulkActionBar
// ---------------------------------------------------------------------------

export interface BulkActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of selected items; the bar shows only when it is above zero. */
  count: number
  /** Actions for the selection (e.g. Buttons). */
  children?: React.ReactNode
  /** Clears the selection; renders an icon button when given. */
  onClear?: () => void
  /** Accessible name of the clear button. */
  clearLabel?: string
  /** Overrides the "N selected" wording. */
  labels?: Partial<BulkActionBarLabels>
}

/**
 * BulkActionBar — the selection count plus actions for a multi-selection.
 * The count is a polite live region that stays mounted (empty at zero) so
 * every change, including the first selection, is announced.
 */
export const BulkActionBar = React.forwardRef<HTMLDivElement, BulkActionBarProps>(function BulkActionBar(
  {
    count,
    children,
    onClear,
    clearLabel = DEFAULT_CLEAR_LABEL,
    labels,
    className,
    'aria-label': ariaLabel = DEFAULT_BULK_BAR_LABEL,
    ...props
  },
  ref,
) {
  const text = formatBulkActionCount(count, labels)
  const visible = text !== ''

  return (
    <div
      ref={ref}
      role={visible ? 'region' : undefined}
      aria-label={visible ? ariaLabel : undefined}
      className={cn(visible && bulkActionBarClass, className)}
      data-state={visible ? 'open' : 'closed'}
      {...props}
    >
      <span role="status" aria-live="polite" aria-atomic="true" className={visible ? bulkActionBarCountClass : taskSrOnlyClass}>
        {text}
      </span>
      {visible && (
        <>
          <div className={bulkActionBarActionsClass}>{children}</div>
          {onClear && (
            <button type="button" aria-label={clearLabel} className={bulkActionBarClearClass} onClick={onClear}>
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
})
