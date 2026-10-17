import type { CallControlTone } from './call-controls.js'

/**
 * Below this width (in CSS pixels) of the space the dock sits in, the action
 * and panel controls collapse into a "More controls" disclosure. Adapters use
 * it as a container query, so a side panel that narrows the call column
 * collapses the dock the same way a phone screen does.
 */
export const CALL_CONTROLS_COLLAPSE_WIDTH = 600

/** Every control the dock knows how to render, in dock order. */
export type CallControlsControlId =
  | 'mic'
  | 'camera'
  | 'screenShare'
  | 'hand'
  | 'reactions'
  | 'captions'
  | 'pip'
  | 'record'
  | 'chat'
  | 'people'

/** The groups the dock is split into, in order. */
export type CallControlsGroupId = 'media' | 'actions' | 'panels'

/** State of an on/off control: mic, camera, screen share, raised hand, a panel… */
export interface CallControlsToggleState {
  /**
   * Whether the control is on: the mic is live, the camera is on, the screen
   * is shared, the hand is raised, captions are shown, the call is recorded,
   * the panel is open. Exposed as `aria-pressed`.
   */
  active: boolean
  /**
   * A change is in flight (a device is starting, a recording is being set
   * up). The control stays focusable but reports itself disabled until the
   * change settles.
   */
  pending?: boolean
  /**
   * A count shown as a badge and read with the name — unread messages,
   * people in the call, raised hands. Zero or less shows no badge.
   */
  count?: number
}

/** State of a control that opens something else, such as a reaction picker. */
export interface CallControlsTriggerState {
  /**
   * Whether the popup it opens is open; exposed as `aria-expanded`. Leave it
   * out when the popup's state is not known to the dock.
   */
  expanded?: boolean
  /** The control is temporarily unavailable. */
  pending?: boolean
}

/**
 * Which controls the dock shows and in what state. A control that is left
 * out is not rendered, so the dock never shows a button that does nothing.
 */
export type CallControlsDockState = Partial<
  Record<Exclude<CallControlsControlId, 'reactions'>, CallControlsToggleState>
> & {
  reactions?: CallControlsTriggerState
}

/** Every string the dock renders. Override any of them to localise. */
export interface CallControlsLabels {
  /** Name of the toolbar. */
  toolbar: string
  /** Name of the microphone and camera group. */
  media: string
  /** Name of the group of in-call actions. */
  actions: string
  /** Name of the group of panel toggles. */
  panels: string
  mic: string
  camera: string
  screenShare: string
  hand: string
  reactions: string
  captions: string
  pip: string
  record: string
  chat: string
  people: string
  leave: string
  /** The disclosure that holds the collapsed controls on a narrow dock. */
  more: string
  /** Builds the accessible name of a control that carries a count. */
  withCount: (label: string, count: number) => string
}

export const callControlsDefaultLabels: CallControlsLabels = {
  toolbar: 'Call controls',
  media: 'Audio and video',
  actions: 'Call actions',
  panels: 'Panels',
  mic: 'Microphone',
  camera: 'Camera',
  screenShare: 'Share screen',
  hand: 'Raise hand',
  reactions: 'Reactions',
  captions: 'Captions',
  pip: 'Picture in picture',
  record: 'Record',
  chat: 'Chat',
  people: 'Participants',
  leave: 'Leave call',
  more: 'More controls',
  withCount: (label, count) => `${label} (${count})`,
}

/** One control, resolved for rendering. */
export interface CallControlsDockItem {
  id: CallControlsControlId
  group: CallControlsGroupId
  /** Stable label: the tooltip and the text of the row in "More controls". */
  label: string
  /** Accessible name: the label, plus the count when there is one. */
  name: string
  /** `toggle` controls carry `pressed`; `trigger` controls may carry `expanded`. */
  kind: 'toggle' | 'trigger'
  pressed?: boolean
  expanded?: boolean
  tone: CallControlTone
  /** Reported as `aria-disabled`; the control keeps its place in the focus order. */
  disabled: boolean
  /** Text of the visual count badge (`99+` past 99), when there is a count. */
  badge?: string
  /** Moves into "More controls" when the dock is narrower than the collapse width. */
  collapses: boolean
}

export interface CallControlsDockGroup {
  id: CallControlsGroupId
  label: string
  items: CallControlsDockItem[]
  /** The whole group collapses into "More controls" on a narrow dock. */
  collapses: boolean
}

export interface CallControlsDockLayout {
  /** The groups that have at least one control, in dock order. */
  groups: CallControlsDockGroup[]
  /** The controls that move into "More controls" on a narrow dock, in dock order. */
  collapsed: CallControlsDockItem[]
  /** A collapsed control carries a count, so "More controls" shows a dot. */
  collapsedHasBadge: boolean
}

const GROUPS: ReadonlyArray<{
  id: CallControlsGroupId
  collapses: boolean
  controls: ReadonlyArray<CallControlsControlId>
}> = [
  { id: 'media', collapses: false, controls: ['mic', 'camera'] },
  {
    id: 'actions',
    collapses: true,
    controls: ['screenShare', 'hand', 'reactions', 'captions', 'pip', 'record'],
  },
  { id: 'panels', collapses: true, controls: ['chat', 'people'] },
]

/** Badges cap at this many so they stay round. */
const BADGE_MAX = 99

/**
 * Tone of an on/off control.
 *
 * - Mic and camera are expected to be on, so on is neutral and off is
 *   destructive (adapters pair it with a struck-through icon, so the state
 *   never relies on colour alone).
 * - Recording is a warning while it runs, so on is destructive.
 * - Everything else lights up while it is on.
 */
export function callControlsToggleTone(id: CallControlsControlId, active: boolean): CallControlTone {
  if (id === 'mic' || id === 'camera') return active ? 'default' : 'destructive'
  if (id === 'record') return active ? 'destructive' : 'default'
  return active ? 'active' : 'default'
}

function badgeText(count: number | undefined): string | undefined {
  if (count === undefined || !Number.isFinite(count) || count <= 0) return undefined
  const whole = Math.floor(count)
  return whole > BADGE_MAX ? `${BADGE_MAX}+` : String(whole)
}

function resolveItem(
  id: CallControlsControlId,
  group: CallControlsGroupId,
  collapses: boolean,
  state: CallControlsDockState,
  labels: CallControlsLabels,
): CallControlsDockItem | null {
  const label = labels[id]
  if (id === 'reactions') {
    const trigger = state.reactions
    if (!trigger) return null
    return {
      id,
      group,
      label,
      name: label,
      kind: 'trigger',
      ...(trigger.expanded !== undefined ? { expanded: trigger.expanded } : {}),
      tone: trigger.expanded ? 'active' : 'default',
      disabled: trigger.pending === true,
      collapses,
    }
  }
  const toggle = state[id]
  if (!toggle) return null
  const badge = badgeText(toggle.count)
  return {
    id,
    group,
    label,
    name: badge ? labels.withCount(label, Math.floor(toggle.count ?? 0)) : label,
    kind: 'toggle',
    pressed: toggle.active,
    tone: callControlsToggleTone(id, toggle.active),
    disabled: toggle.pending === true,
    ...(badge ? { badge } : {}),
    collapses,
  }
}

/**
 * Resolve which controls a call dock shows, how they are grouped, their
 * names, states and tones, and which of them collapse on a narrow dock.
 */
export function getCallControlsLayout(
  state: CallControlsDockState,
  labels: Partial<CallControlsLabels> = {},
): CallControlsDockLayout {
  const resolved: CallControlsLabels = { ...callControlsDefaultLabels, ...labels }
  const groups: CallControlsDockGroup[] = []
  for (const group of GROUPS) {
    const items = group.controls
      .map((id) => resolveItem(id, group.id, group.collapses, state, resolved))
      .filter((item): item is CallControlsDockItem => item !== null)
    if (items.length > 0) {
      groups.push({ id: group.id, label: resolved[group.id], items, collapses: group.collapses })
    }
  }
  const collapsed = groups.filter((group) => group.collapses).flatMap((group) => group.items)
  return {
    groups,
    collapsed,
    collapsedHasBadge: collapsed.some((item) => item.badge !== undefined),
  }
}

/** How the arrow keys move between controls. */
export interface CallControlsFocusOptions {
  /** `horizontal` for the toolbar row, `vertical` for a column of rows. Defaults to `horizontal`. */
  axis?: 'horizontal' | 'vertical'
  /** Right-to-left layout: the left and right arrows swap. */
  rtl?: boolean
}

/**
 * Index of the control that a key moves focus to, among `count` focusable
 * controls with `current` focused (`-1` when none is), or `null` when the key
 * does not move focus. Arrow keys along the axis wrap at the ends; Home and
 * End jump to them.
 */
export function moveCallControlsFocus(
  current: number,
  count: number,
  key: string,
  { axis = 'horizontal', rtl = false }: CallControlsFocusOptions = {},
): number | null {
  if (count <= 0) return null
  let previous = 'ArrowUp'
  let next = 'ArrowDown'
  if (axis === 'horizontal') {
    previous = rtl ? 'ArrowRight' : 'ArrowLeft'
    next = rtl ? 'ArrowLeft' : 'ArrowRight'
  }
  switch (key) {
    case next:
      return current < 0 ? 0 : (current + 1) % count
    case previous:
      return current < 0 ? count - 1 : (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}
