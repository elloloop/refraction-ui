import * as React from 'react'
import {
  MESSAGE_ROW_DEFAULT_MORE_ACTIONS_LABEL,
  MESSAGE_ROW_DEFAULT_TOMBSTONE_TEXT,
  MESSAGE_ROW_DEFAULT_TOOLBAR_LABEL,
  MESSAGE_ROW_INTERACTIVE_SELECTOR,
  MESSAGE_ROW_TOOLBAR_ITEM_SELECTOR,
  clampMessageRowToolbarIndex,
  createMessageRow,
  doesMessageRowSelectionOverlapToolbar,
  getMessageRowAvatarGutter,
  getMessageRowHighlightSchedule,
  getMessageRowLabelledBy,
  getNextMessageRowToolbarIndex,
  hasMessageRowPointerMoved,
  isMessageRowToolbarVisible,
  partitionMessageRowActions,
  resolveMessageRowLongPressDelay,
  shouldMessageRowHandleTap,
  messageRowVariants,
  messageRowHighlightVariants,
  messageRowGutterClass,
  messageRowAvatarClass,
  messageRowGutterTimeVariants,
  messageRowContentClass,
  messageRowHeaderClass,
  messageRowAuthorClass,
  messageRowTimeClass,
  messageRowLabelsClass,
  messageRowQuoteClass,
  messageRowBodyLineClass,
  messageRowBodyClass,
  messageRowEditedClass,
  messageRowStatusClass,
  messageRowTombstoneClass,
  messageRowFooterClass,
  messageRowToolbarVariants,
  messageRowToolbarLeadingClass,
  messageRowDestructiveActionClass,
  messageRowMenuItemVariants,
  messageRowMenuIconClass,
  type MessageRowActionDescriptor,
  type MessageRowHighlightPhase,
  type MessageRowPoint,
} from '@refraction-ui/message-row'
import { IconButton } from '@refraction-ui/react-icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@refraction-ui/react-dropdown-menu'
import { cn } from '@refraction-ui/shared'

/** One toolbar action (Flutter `RefractionMessageAction`). */
export type MessageRowAction = MessageRowActionDescriptor<React.ReactNode>

export interface MessageRowProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    // The row renders its own content and owns its role and accessible name.
    'children' | 'role' | 'aria-label' | 'aria-labelledby'
  > {
  /** Sender's display name. Visible on a lead row; screen-reader only on a continuation. */
  authorName: string
  /** Avatar node (e.g. `<Avatar>`), sized to `avatarSize`. Hidden on continuation rows. */
  avatar?: React.ReactNode
  /** Pre-formatted time ("10:42"). On continuation rows it shows on hover / focus. */
  timestamp?: string
  /** Message content. Stays selectable. */
  body?: React.ReactNode
  /** Same sender, close in time: hide avatar and name, show the time on hover / focus. */
  continuation?: boolean
  /** Reply preview shown above the body. */
  quote?: React.ReactNode
  /** Delivery / read status shown after the body. */
  status?: React.ReactNode
  /** Below the body: reactions, thread summary. */
  footer?: React.ReactNode
  /** Edited marker after the body, e.g. "(edited)". */
  editedLabel?: React.ReactNode
  /** Labels next to the name: "Forwarded · Ana", a bot badge. */
  labels?: React.ReactNode
  /** Toolbar actions; those past `maxInlineActions` go into a "More actions" menu. */
  actions?: MessageRowAction[]
  /** How many actions stay inline before the rest overflow. Defaults to 3. */
  maxInlineActions?: number
  /** Leading toolbar slot, e.g. quick reactions. */
  toolbarLeading?: React.ReactNode
  /** Plain click / tap on the row (not on a control, not after selecting text). Enter when the row is focused. */
  onTap?: () => void
  /** Press and hold without moving. Not fired on tombstones. */
  onLongPress?: () => void
  /** Hold time in ms before `onLongPress` fires. Defaults to 500. */
  longPressDelay?: number
  /** Jump target: highlight that fades out (static under reduced motion). */
  highlighted?: boolean
  /** Overrides the row's accessible name (default: author, time and text). */
  semanticLabel?: string
  /** Avatar size / gutter width in CSS px. Defaults to 36. */
  avatarSize?: number
  /** Deleted message: shows `tombstoneText`, no toolbar, actions or long-press. */
  tombstone?: boolean
  /** Tombstone text. Defaults to "This message was deleted". */
  tombstoneText?: string
  /** Accessible name of the toolbar. Defaults to "Message actions". */
  toolbarLabel?: string
  /** Label of the overflow menu button. Defaults to "More actions". */
  moreActionsLabel?: string
  /** Icon for the overflow menu button. Defaults to a horizontal ellipsis. */
  moreActionsIcon?: React.ReactNode
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const ENTER_KEY = 'Enter'
const PRIMARY_BUTTON = 0
const TOUCH_POINTER = 'touch'

/**
 * Local guard: the shared `prefersReducedMotion()` throws where
 * `window.matchMedia` is missing (older jsdom, some embedded webviews).
 */
function prefersReducedMotionSafe(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function isNode(value: EventTarget | null): value is Node {
  return typeof Node !== 'undefined' && value instanceof Node
}

/**
 * React bubbles events from portalled children (the overflow menu) through
 * the row. Row-level gestures only count for events from the row's own DOM.
 */
function isInsideRowDom(row: HTMLElement | null, target: EventTarget | null): boolean {
  return Boolean(row && isNode(target) && row.contains(target))
}

/** A control inside the row (not the row itself) owns this event. */
function isInteractiveTarget(row: HTMLElement, target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const control = target.closest(MESSAGE_ROW_INTERACTIVE_SELECTOR)
  return Boolean(control && control !== row && row.contains(control))
}

function getActiveSelection(): Selection | null {
  if (typeof document === 'undefined') return null
  const selection = document.getSelection()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null
  return selection
}

function selectionIntersects(node: Node | null): boolean {
  const selection = getActiveSelection()
  if (!selection || !node) return false
  for (let i = 0; i < selection.rangeCount; i += 1) {
    if (selection.getRangeAt(i).intersectsNode(node)) return true
  }
  return false
}

/**
 * The toolbar must not cover a selection: true when a non-collapsed selection
 * touches the body, or any of its line boxes lies under the toolbar (the
 * toolbar floats into the gap above the row, which can hold the previous
 * row's last line).
 */
function isSelectionBlockingToolbar(body: HTMLElement | null, toolbar: HTMLElement | null): boolean {
  if (selectionIntersects(body)) return true
  const selection = getActiveSelection()
  if (!selection || !toolbar) return false
  const toolbarRect = toolbar.getBoundingClientRect()
  for (let i = 0; i < selection.rangeCount; i += 1) {
    const range = selection.getRangeAt(i)
    // Not every DOM implements Range#getClientRects (jsdom does not).
    if (typeof range.getClientRects !== 'function') continue
    if (doesMessageRowSelectionOverlapToolbar(toolbarRect, Array.from(range.getClientRects()))) return true
  }
  return false
}

/**
 * Tracks one press on the row: fires `onLongPress` after `delayMs` unless the
 * pointer moves past the tolerance (a selection drag) or lifts first, and
 * reports a drag that started in the body so the toolbar can step aside.
 * Move / up / cancel are followed on the document, so a drag that ends
 * outside the row still ends the press.
 */
function useMessageRowPress(options: {
  rowRef: React.RefObject<HTMLDivElement | null>
  bodyRef: React.RefObject<HTMLDivElement | null>
  onLongPress: (() => void) | undefined
  delayMs: number
}) {
  const { rowRef, bodyRef, onLongPress, delayMs } = options
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const startRef = React.useRef<MessageRowPoint | null>(null)
  const startedInBodyRef = React.useRef(false)
  const longPressFiredRef = React.useRef(false)
  const onLongPressRef = React.useRef(onLongPress)
  onLongPressRef.current = onLongPress
  const [pressing, setPressing] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  React.useEffect(() => clearTimer, [clearTimer])

  React.useEffect(() => {
    if (!pressing) return
    const move = (event: PointerEvent) => {
      const start = startRef.current
      if (!start || !hasMessageRowPointerMoved(start, { x: event.clientX, y: event.clientY })) return
      clearTimer()
      if (startedInBodyRef.current) setDragging(true)
    }
    const end = () => {
      clearTimer()
      startRef.current = null
      startedInBodyRef.current = false
      setPressing(false)
      setDragging(false)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', end)
    document.addEventListener('pointercancel', end)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', end)
      document.removeEventListener('pointercancel', end)
    }
  }, [pressing, clearTimer])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const row = rowRef.current
    longPressFiredRef.current = false
    clearTimer()
    if (!row || event.button !== PRIMARY_BUTTON || !isInsideRowDom(row, event.target)) return
    startRef.current = { x: event.clientX, y: event.clientY }
    startedInBodyRef.current = isInsideRowDom(bodyRef.current, event.target)
    setPressing(true)
    if (!onLongPressRef.current || isInteractiveTarget(row, event.target)) return
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      longPressFiredRef.current = true
      onLongPressRef.current?.()
    }, delayMs)
  }

  return { pressing, dragging, longPressFiredRef, onPointerDown }
}

/** Re-evaluates the selection on `selectionchange` while the toolbar could be shown. */
function useSelectionBlocksToolbar(
  armed: boolean,
  bodyRef: React.RefObject<HTMLDivElement | null>,
  toolbarRef: React.RefObject<HTMLDivElement | null>,
): boolean {
  const [blocked, setBlocked] = React.useState(false)
  React.useEffect(() => {
    if (!armed) {
      setBlocked(false)
      return
    }
    const update = () => setBlocked(isSelectionBlockingToolbar(bodyRef.current, toolbarRef.current))
    update()
    document.addEventListener('selectionchange', update)
    return () => document.removeEventListener('selectionchange', update)
  }, [armed, bodyRef, toolbarRef])
  return blocked
}

/** Runs the core highlight schedule: hold, fade, off — or static under reduced motion. */
function useHighlightPhase(highlighted: boolean): MessageRowHighlightPhase {
  const [phase, setPhase] = React.useState<MessageRowHighlightPhase>(highlighted ? 'on' : 'off')
  React.useEffect(() => {
    if (!highlighted) {
      setPhase('off')
      return
    }
    const [first, ...later] = getMessageRowHighlightSchedule(prefersReducedMotionSafe())
    setPhase(first.phase)
    const timers = later.map((step) => setTimeout(() => setPhase(step.phase), step.atMs))
    return () => timers.forEach(clearTimeout)
  }, [highlighted])
  return phase
}

/**
 * Roving tabindex across every focusable item in the toolbar, including the
 * consumer's `toolbarLeading` content: one Tab stop per row, arrows inside.
 */
function useRovingToolbar(toolbarRef: React.RefObject<HTMLDivElement | null>) {
  const activeIndexRef = React.useRef(0)

  const items = React.useCallback(
    () => Array.from(toolbarRef.current?.querySelectorAll<HTMLElement>(MESSAGE_ROW_TOOLBAR_ITEM_SELECTOR) ?? []),
    [toolbarRef],
  )

  const sync = React.useCallback(() => {
    const list = items()
    const active = clampMessageRowToolbarIndex(activeIndexRef.current, list.length)
    activeIndexRef.current = active
    list.forEach((item, index) => {
      item.tabIndex = index === active ? 0 : -1
    })
  }, [items])

  // Every render may add or remove items (actions changed, leading slot re-rendered).
  React.useEffect(sync)

  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const index = items().indexOf(event.target as HTMLElement)
    if (index === -1) return
    activeIndexRef.current = index
    sync()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Keys from the portalled menu bubble here through React; the menu handles its own.
    if (event.defaultPrevented || !isInsideRowDom(toolbarRef.current, event.target)) return
    const list = items()
    const current = list.indexOf(event.target as HTMLElement)
    if (current === -1) return
    const next = getNextMessageRowToolbarIndex(current, event.key, list.length)
    if (next === current) return
    event.preventDefault()
    activeIndexRef.current = next
    sync()
    list[next].focus()
  }

  return { onFocus, onKeyDown }
}

function MoreGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  )
}

interface MessageRowToolbarProps {
  toolbarRef: React.RefObject<HTMLDivElement | null>
  visible: boolean
  label: string
  leading: React.ReactNode
  inline: MessageRowAction[]
  overflow: MessageRowAction[]
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
  moreActionsLabel: string
  moreActionsIcon: React.ReactNode
}

function MessageRowToolbar({
  toolbarRef,
  visible,
  label,
  leading,
  inline,
  overflow,
  menuOpen,
  onMenuOpenChange,
  moreActionsLabel,
  moreActionsIcon,
}: MessageRowToolbarProps) {
  const roving = useRovingToolbar(toolbarRef)
  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      data-message-row-toolbar=""
      data-state={visible ? 'visible' : 'hidden'}
      className={messageRowToolbarVariants({ visible: visible ? 'true' : 'false' })}
      onFocus={roving.onFocus}
      onKeyDown={roving.onKeyDown}
    >
      {leading != null && <div className={messageRowToolbarLeadingClass}>{leading}</div>}
      {inline.map((action, index) => (
        <IconButton
          key={`${action.label}-${index}`}
          icon={action.icon}
          label={action.label}
          size="sm"
          data-destructive={action.destructive ? '' : undefined}
          className={action.destructive ? messageRowDestructiveActionClass : undefined}
          onClick={action.onSelected}
        />
      ))}
      {overflow.length > 0 && (
        <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <IconButton icon={moreActionsIcon} label={moreActionsLabel} size="sm" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {overflow.map((action, index) => (
              <DropdownMenuItem
                key={`${action.label}-${index}`}
                data-destructive={action.destructive ? '' : undefined}
                className={messageRowMenuItemVariants({ destructive: action.destructive ? 'true' : 'false' })}
                onSelect={action.onSelected}
              >
                <span aria-hidden="true" className={messageRowMenuIconClass}>
                  {action.icon}
                </span>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

/**
 * MessageRow — one chat message, grouped by sender.
 *
 * A `role="article"` named by `aria-labelledby` over its author, time and
 * body (or `semanticLabel`), so the label reads the real text while the body
 * stays selectable and readable in browse mode. The toolbar (quick-reaction
 * slot + actions, extras in a "More actions" menu) appears on hover and when
 * focus is inside the row, is one Tab stop with arrow-key roving, and steps
 * aside while text is being selected. `onTap`, `onLongPress` and the native
 * `onContextMenu` are row-level gestures; controls inside the row keep their
 * own clicks. Logic and styles come from `@refraction-ui/message-row`.
 */
export const MessageRow = React.forwardRef<HTMLDivElement, MessageRowProps>(function MessageRow(
  {
    authorName,
    avatar,
    timestamp,
    body,
    continuation = false,
    quote,
    status,
    footer,
    editedLabel,
    labels,
    actions,
    maxInlineActions,
    toolbarLeading,
    onTap,
    onLongPress,
    longPressDelay,
    highlighted = false,
    semanticLabel,
    avatarSize,
    tombstone = false,
    tombstoneText = MESSAGE_ROW_DEFAULT_TOMBSTONE_TEXT,
    toolbarLabel = MESSAGE_ROW_DEFAULT_TOOLBAR_LABEL,
    moreActionsLabel = MESSAGE_ROW_DEFAULT_MORE_ACTIONS_LABEL,
    moreActionsIcon,
    tabIndex,
    className,
    onClick,
    onKeyDown,
    onContextMenu,
    onPointerDown,
    onFocus,
    onBlur,
    ...props
  },
  forwardedRef,
) {
  const rowRef = React.useRef<HTMLDivElement | null>(null)
  const bodyRef = React.useRef<HTMLDivElement | null>(null)
  const toolbarRef = React.useRef<HTMLDivElement | null>(null)
  const setRowRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rowRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef],
  )

  const baseId = React.useId()
  const ids = {
    author: `${baseId}-author`,
    time: `${baseId}-time`,
    body: `${baseId}-body`,
    edited: `${baseId}-edited`,
  }

  const [hovered, setHovered] = React.useState(false)
  const [focusWithin, setFocusWithin] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  const { inline, overflow } = partitionMessageRowActions(tombstone ? [] : actions, maxInlineActions)
  const hasToolbar = !tombstone && (inline.length > 0 || overflow.length > 0 || toolbarLeading != null)

  const press = useMessageRowPress({
    rowRef,
    bodyRef,
    onLongPress: tombstone ? undefined : onLongPress,
    delayMs: resolveMessageRowLongPressDelay(longPressDelay),
  })
  const armed = hasToolbar && (hovered || focusWithin || menuOpen || press.pressing)
  const selectionBlocks = useSelectionBlocksToolbar(armed, bodyRef, toolbarRef)
  const toolbarVisible = isMessageRowToolbarVisible({
    hasToolbar,
    hovered,
    focusWithin,
    menuOpen,
    selecting: press.dragging || selectionBlocks,
  })
  const highlightPhase = useHighlightPhase(highlighted)
  const active = hovered || focusWithin

  // Native enter/leave: React's synthetic versions treat the portalled menu
  // as inside the row, which would leave the row "hovered" after the menu closes.
  React.useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== TOUCH_POINTER) setHovered(true)
    }
    const leave = () => setHovered(false)
    row.addEventListener('pointerenter', enter)
    row.addEventListener('pointerleave', leave)
    return () => {
      row.removeEventListener('pointerenter', enter)
      row.removeEventListener('pointerleave', leave)
    }
  }, [])

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event)
    if (isInsideRowDom(rowRef.current, event.target)) setFocusWithin(true)
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event)
    if (!isInsideRowDom(rowRef.current, event.relatedTarget)) setFocusWithin(false)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event)
    const row = rowRef.current
    if (!onTap || event.defaultPrevented || !row || !isInsideRowDom(row, event.target)) return
    const tap = shouldMessageRowHandleTap({
      targetIsInteractive: isInteractiveTarget(row, event.target),
      hasSelection: selectionIntersects(row),
      longPressFired: press.longPressFiredRef.current,
    })
    if (tap) onTap()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !onTap || event.target !== rowRef.current || event.key !== ENTER_KEY) return
    event.preventDefault()
    onTap()
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event)
    press.onPointerDown(event)
  }

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    // On touch, the browser follows a long-press with `contextmenu`; the app
    // already answered the long-press, so don't open a second menu on top.
    if (press.longPressFiredRef.current) {
      event.preventDefault()
      return
    }
    onContextMenu?.(event)
  }

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open)
    // The pointer may have left while it was over the portalled menu.
    if (!open) setHovered(rowRef.current?.matches(':hover') ?? false)
  }

  const api = createMessageRow({ continuation, tombstone, highlightPhase, active, toolbarVisible })
  const gutter = getMessageRowAvatarGutter(avatarSize)
  const hasEditedLabel = !tombstone && editedLabel != null
  const labelProps = semanticLabel
    ? { 'aria-label': semanticLabel }
    : {
        'aria-labelledby': getMessageRowLabelledBy({
          ids,
          hasTimestamp: Boolean(timestamp),
          hasEditedLabel,
          tombstone,
        }),
      }
  const timeNode = timestamp ? (
    <span id={ids.time} className={continuation ? undefined : messageRowTimeClass}>
      {timestamp}
    </span>
  ) : null
  const labelsNode = !tombstone && labels != null ? <span className={messageRowLabelsClass}>{labels}</span> : null

  return (
    <div
      {...props}
      ref={setRowRef}
      role="article"
      {...labelProps}
      {...api.dataAttributes}
      tabIndex={tabIndex ?? (onTap ? 0 : undefined)}
      className={cn(messageRowVariants({ active: active ? 'true' : 'false' }), className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {highlightPhase !== 'off' && (
        <span aria-hidden="true" data-message-row-highlight="" className={messageRowHighlightVariants({ phase: highlightPhase })} />
      )}

      <div className={messageRowGutterClass} style={{ width: gutter }}>
        {continuation ? (
          timeNode && (
            <span className={messageRowGutterTimeVariants({ visible: active ? 'true' : 'false' })}>{timeNode}</span>
          )
        ) : (
          avatar != null && (
            <span aria-hidden="true" className={messageRowAvatarClass} style={{ width: gutter, height: gutter }}>
              {avatar}
            </span>
          )
        )}
      </div>

      <div className={messageRowContentClass}>
        {continuation ? (
          <>
            <span id={ids.author} className="sr-only">
              {authorName}
            </span>
            {labelsNode && <div>{labelsNode}</div>}
          </>
        ) : (
          <div className={messageRowHeaderClass}>
            <span id={ids.author} className={messageRowAuthorClass}>
              {authorName}
            </span>
            {labelsNode}
            {timeNode}
          </div>
        )}

        {!tombstone && quote != null && (
          <div data-message-row-quote="" className={messageRowQuoteClass}>
            {quote}
          </div>
        )}

        <div className={messageRowBodyLineClass}>
          <div
            ref={bodyRef}
            id={ids.body}
            data-message-row-body=""
            className={tombstone ? messageRowTombstoneClass : messageRowBodyClass}
          >
            {tombstone ? tombstoneText : body}
          </div>
          {hasEditedLabel && (
            <span id={ids.edited} className={messageRowEditedClass}>
              {editedLabel}
            </span>
          )}
          {!tombstone && status != null && <span className={messageRowStatusClass}>{status}</span>}
        </div>

        {!tombstone && footer != null && <div className={messageRowFooterClass}>{footer}</div>}
      </div>

      {hasToolbar && (
        <MessageRowToolbar
          toolbarRef={toolbarRef}
          visible={toolbarVisible}
          label={toolbarLabel}
          leading={toolbarLeading}
          inline={inline}
          overflow={overflow}
          menuOpen={menuOpen}
          onMenuOpenChange={handleMenuOpenChange}
          moreActionsLabel={moreActionsLabel}
          moreActionsIcon={moreActionsIcon ?? <MoreGlyph />}
        />
      )}
    </div>
  )
})
