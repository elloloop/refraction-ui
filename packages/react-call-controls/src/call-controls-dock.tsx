import * as React from 'react'
import {
  callControlButtonVariants,
  callControlLabelClass,
  callControlsBadgeClass,
  callControlsCapsuleButtonVariants,
  callControlsCapsuleSlotClass,
  callControlsCapsuleVariants,
  callControlsCollapseClass,
  callControlsDefaultLabels,
  callControlsDockButtonClass,
  callControlsGroupVariants,
  callControlsLeaveVariants,
  callControlsMoreClass,
  callControlsMoreDotClass,
  callControlsPanelClass,
  callControlsPanelIconVariants,
  callControlsPanelItemClass,
  callControlsPanelMetaClass,
  getCallControlsLayout,
  moveCallControlsFocus,
  type CallControlsDockItem,
  type CallControlsDockState,
  type CallControlsLabels,
} from '@refraction-ui/call-controls'
import { cn } from '@refraction-ui/shared'
import { callControlsIcon, type CallControlsIconName, type CallControlsIcons } from './icons.js'
import { PANEL_ATTRIBUTE } from './toolbar-focus.js'

// ─── Public prop shapes ───────────────────────────────────────────────────────

/** An on/off control of the call dock. */
export interface CallControlsToggle {
  /** Whether it is on (mic live, camera on, sharing, hand raised, panel open…). Exposed as `aria-pressed`. */
  active: boolean
  /** Called when the person presses the control. */
  onToggle: () => void
  /**
   * A change is in flight. The control keeps its focus and reports itself
   * disabled (`aria-disabled`) until you clear it.
   */
  pending?: boolean
  /** Count shown as a badge and read with the name (unread messages, people, raised hands). */
  count?: number
}

/** The mic or camera toggle, with an optional slot joined to it. */
export interface CallControlsMediaToggle extends CallControlsToggle {
  /**
   * Rendered beside the toggle and joined to it into one capsule — the place
   * for a device menu's trigger (a chevron that opens a microphone or camera
   * picker). Style the trigger with `callControlsMenuTriggerClass` so it fills
   * the capsule and takes its colour.
   */
  menu?: React.ReactNode
}

/** The reactions trigger. */
export interface CallControlsReactions {
  /**
   * Opens your reaction picker. `anchor` is the element to position it
   * against: the reactions button, or "More controls" when the reactions
   * were chosen from there.
   */
  onOpen: (anchor: HTMLElement) => void
  /** Whether your picker is open; exposed as `aria-expanded`. */
  expanded?: boolean
  /** The control is temporarily unavailable. */
  pending?: boolean
}

/** The prop-driven dock. Each control renders only when you pass it. */
export interface CallControlsDockProps {
  /** Microphone on/off, with an optional device menu slot. */
  mic?: CallControlsMediaToggle
  /** Camera on/off, with an optional device menu slot. */
  camera?: CallControlsMediaToggle
  /** Screen share on/off. */
  screenShare?: CallControlsToggle
  /** Raise or lower your hand; `count` can carry how many hands are up. */
  hand?: CallControlsToggle
  /** Opens a reaction picker. */
  reactions?: CallControlsReactions
  /** Live captions on/off. */
  captions?: CallControlsToggle
  /** Picture in picture on/off. Leave it out where the browser cannot do it. */
  pip?: CallControlsToggle
  /** Recording on/off. */
  record?: CallControlsToggle
  /** Chat panel open/closed; `count` carries unread messages. */
  chat?: CallControlsToggle
  /** Participants panel open/closed; `count` carries how many people are in the call. */
  people?: CallControlsToggle
  /** Leaves the call. The leave button renders only when this is given. */
  onLeave?: () => void
  /** Replaces any of the dock's strings. */
  labels?: Partial<CallControlsLabels>
  /** Replaces any of the dock's icons. */
  icons?: CallControlsIcons
  /** Classes for the full-width wrapper whose width decides when the dock collapses. */
  containerClassName?: string
}

/** Prop names that switch `CallControls` into the dock. */
export const DOCK_CONTROL_KEYS = [
  'mic',
  'camera',
  'screenShare',
  'hand',
  'reactions',
  'captions',
  'pip',
  'record',
  'chat',
  'people',
  'onLeave',
] as const satisfies ReadonlyArray<keyof CallControlsDockProps>

type ToggleId = Exclude<CallControlsDockItem['id'], 'reactions'>

const ICON_SIZE = { sm: 18, md: 20 } as const
const ROW_ICON_SIZE = 18

function iconName(item: CallControlsDockItem): CallControlsIconName {
  if (item.id === 'mic') return item.pressed ? 'mic' : 'micOff'
  if (item.id === 'camera') return item.pressed ? 'camera' : 'cameraOff'
  return item.id
}

function toDockState(props: CallControlsDockProps): CallControlsDockState {
  const state: CallControlsDockState = {}
  const toggles: ToggleId[] = ['mic', 'camera', 'screenShare', 'hand', 'captions', 'pip', 'record', 'chat', 'people']
  for (const id of toggles) {
    const toggle = props[id]
    if (toggle) {
      state[id] = {
        active: toggle.active,
        ...(toggle.pending !== undefined ? { pending: toggle.pending } : {}),
        ...(toggle.count !== undefined ? { count: toggle.count } : {}),
      }
    }
  }
  if (props.reactions) {
    state.reactions = {
      ...(props.reactions.expanded !== undefined ? { expanded: props.reactions.expanded } : {}),
      ...(props.reactions.pending !== undefined ? { pending: props.reactions.pending } : {}),
    }
  }
  return state
}

/** ARIA for one control, from its resolved state. */
function controlAria(item: CallControlsDockItem): Record<string, string | boolean> {
  return {
    'aria-label': item.name,
    ...(item.pressed !== undefined ? { 'aria-pressed': item.pressed } : {}),
    ...(item.expanded !== undefined ? { 'aria-expanded': item.expanded } : {}),
    ...(item.disabled ? { 'aria-disabled': true } : {}),
  }
}

function Badge({ text }: { text: string | undefined }) {
  if (text === undefined) return null
  return (
    <span aria-hidden="true" className={callControlsBadgeClass} data-call-controls-badge="">
      {text}
    </span>
  )
}

// ─── More controls ────────────────────────────────────────────────────────────

interface MoreControlsProps {
  items: CallControlsDockItem[]
  hasBadge: boolean
  label: string
  size: 'sm' | 'md'
  icons: CallControlsIcons | undefined
  onActivate: (item: CallControlsDockItem, anchor: HTMLElement) => void
}

/**
 * The disclosure that holds the collapsed controls on a narrow dock. Its rows
 * keep each control's pressed state; choosing one runs it, closes the panel
 * and returns focus to "More controls". Escape, a press outside and moving
 * focus away close it too.
 */
function MoreControls({ items, hasBadge, label, size, icons, onActivate }: MoreControlsProps) {
  const [open, setOpen] = React.useState(false)
  const panelId = `rfr-call-controls-more-${React.useId()}`
  const wrapperRef = React.useRef<HTMLSpanElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  const rows = (): HTMLButtonElement[] =>
    Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])

  const close = React.useCallback((restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) buttonRef.current?.focus()
  }, [])

  // Opening moves focus to the first row, so the keyboard lands in the panel.
  React.useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  const onKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!open) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close(true)
      return
    }
    const list = rows()
    const current = list.indexOf(event.target as HTMLButtonElement)
    if (current < 0) return
    const next = moveCallControlsFocus(current, list.length, event.key, { axis: 'vertical' })
    if (next === null) return
    event.preventDefault()
    event.stopPropagation()
    list[next]?.focus()
  }

  const onBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
    const next = event.relatedTarget as Node | null
    if (open && next && !wrapperRef.current?.contains(next)) close(false)
  }

  const iconSize = ICON_SIZE[size]

  return (
    <span
      ref={wrapperRef}
      className={callControlsMoreClass}
      data-call-controls-more=""
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(callControlButtonVariants({ size, tone: open ? 'active' : 'default' }), callControlsDockButtonClass)}
        onClick={() => setOpen((value) => !value)}
      >
        {callControlsIcon('more', iconSize, icons)}
        <span className={callControlLabelClass}>{label}</span>
        {hasBadge ? <span aria-hidden="true" className={callControlsMoreDotClass} /> : null}
      </button>
      <div
        ref={panelRef}
        id={panelId}
        role="group"
        aria-label={label}
        hidden={!open}
        className={callControlsPanelClass}
        {...{ [PANEL_ATTRIBUTE]: '' }}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-control={item.id}
            {...controlAria(item)}
            className={callControlsPanelItemClass}
            onClick={() => {
              if (item.disabled) return
              const anchor = buttonRef.current
              close(true)
              if (anchor) onActivate(item, anchor)
            }}
          >
            <span className={callControlsPanelIconVariants({ tone: item.tone })}>
              {callControlsIcon(iconName(item), ROW_ICON_SIZE, icons)}
            </span>
            <span>{item.label}</span>
            <span aria-hidden="true" className={callControlsPanelMetaClass}>
              {item.badge}
              {item.pressed ? callControlsIcon('check', 16, icons) : null}
            </span>
          </button>
        ))}
      </div>
    </span>
  )
}

// ─── Dock ─────────────────────────────────────────────────────────────────────

export interface CallControlsDockContentProps extends CallControlsDockProps {
  size: 'sm' | 'md'
  children?: React.ReactNode
}

/**
 * The groups, controls, "More controls" and leave button of the dock, rendered
 * inside the `CallControls` toolbar.
 */
export function CallControlsDockContent(props: CallControlsDockContentProps) {
  const { size, labels, icons, onLeave, children } = props
  const resolved: CallControlsLabels = { ...callControlsDefaultLabels, ...labels }
  const layout = getCallControlsLayout(toDockState(props), resolved)
  const iconSize = ICON_SIZE[size]

  const activate = (item: CallControlsDockItem, anchor: HTMLElement) => {
    if (item.disabled) return
    if (item.id === 'reactions') {
      props.reactions?.onOpen(anchor)
      return
    }
    props[item.id]?.onToggle()
  }

  const renderControl = (item: CallControlsDockItem) => {
    const icon = callControlsIcon(iconName(item), iconSize, icons)
    const menu = item.id === 'mic' || item.id === 'camera' ? props[item.id]?.menu : undefined
    if (menu !== undefined && menu !== null && menu !== false) {
      return (
        <span key={item.id} className={callControlsCapsuleVariants({ size, tone: item.tone })} data-call-controls-capsule="">
          <button
            type="button"
            data-control={item.id}
            title={item.name}
            {...controlAria(item)}
            className={callControlsCapsuleButtonVariants({ size })}
            onClick={(event) => activate(item, event.currentTarget)}
          >
            {icon}
            <span className={callControlLabelClass}>{item.name}</span>
            <Badge text={item.badge} />
          </button>
          <span className={callControlsCapsuleSlotClass}>{menu}</span>
        </span>
      )
    }
    return (
      <button
        key={item.id}
        type="button"
        data-control={item.id}
        title={item.name}
        {...controlAria(item)}
        className={cn(callControlButtonVariants({ size, tone: item.tone }), callControlsDockButtonClass)}
        onClick={(event) => activate(item, event.currentTarget)}
      >
        {icon}
        <span className={callControlLabelClass}>{item.name}</span>
        <Badge text={item.badge} />
      </button>
    )
  }

  return (
    <>
      {layout.groups.map((group) => (
        <div
          key={group.id}
          role="group"
          aria-label={group.label}
          data-call-controls-group={group.id}
          className={cn(callControlsGroupVariants({ size }), group.collapses && callControlsCollapseClass)}
        >
          {group.items.map(renderControl)}
        </div>
      ))}
      {children ? (
        <div data-call-controls-group="custom" className={callControlsGroupVariants({ size })}>
          {children}
        </div>
      ) : null}
      {layout.collapsed.length > 0 ? (
        <MoreControls
          items={layout.collapsed}
          hasBadge={layout.collapsedHasBadge}
          label={resolved.more}
          size={size}
          icons={icons}
          onActivate={activate}
        />
      ) : null}
      {onLeave ? (
        <div data-call-controls-group="leave" className={callControlsGroupVariants({ size })}>
          <button
            type="button"
            data-control="leave"
            aria-label={resolved.leave}
            title={resolved.leave}
            className={callControlsLeaveVariants({ size })}
            onClick={onLeave}
          >
            {callControlsIcon('leave', iconSize, icons)}
            <span className={callControlLabelClass}>{resolved.leave}</span>
          </button>
        </div>
      ) : null}
    </>
  )
}
